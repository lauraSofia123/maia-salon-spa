import express from 'express';
import { authenticate, authorize, generateTokens, verifyRefreshToken } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';
import { asyncHandler, ConflictError, NotFoundError, AuthenticationError } from '../middlewares/errorHandler.js';
import { User } from '../models/index.js';
import { sendEmail } from '../config/email.js';
import { sendWhatsApp } from '../config/whatsapp.js';
import crypto from 'crypto';

const router = express.Router();

const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = `
    <h1>Verifica tu email</h1>
    <p>Hola ${user.name},</p>
    <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
    <a href="${verifyUrl}">${verifyUrl}</a>
    <p>El enlace expira en 24 horas.</p>
  `;
  await sendEmail({ to: user.email, subject: 'Verifica tu cuenta - Salón de Belleza', html });
};

router.post('/register', validate(schemas.register), asyncHandler(async (req, res) => {
  const { name, email, password, phone, dateOfBirth, gender } = req.body;
  
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ConflictError('El email ya está registrado');
  }
  
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  const user = await User.create({
    name,
    email,
    password,
    phone,
    dateOfBirth,
    gender,
    emailVerificationToken: verificationToken,
    role: 'client'
  });
  
  await sendVerificationEmail(user, verificationToken);
  
  const { accessToken, refreshToken } = generateTokens(user);
  
  user.refreshToken = refreshToken;
  await user.save();
  
  res.status(201).json({
    success: true,
    message: 'Usuario registrado. Verifica tu email.',
    data: {
      user: user.toJSON(),
      accessToken,
      refreshToken
    }
  });
}));

router.post('/login', validate(schemas.login), asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AuthenticationError('Credenciales inválidas');
  }
  
  if (!user.isActive) {
    throw new AuthenticationError('Cuenta desactivada. Contacta soporte.');
  }
  
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AuthenticationError('Credenciales inválidas');
  }
  
  const { accessToken, refreshToken } = generateTokens(user);
  
  user.lastLogin = new Date();
  user.refreshToken = refreshToken;
  await user.save();
  
  res.json({
    success: true,
    message: 'Inicio de sesión exitoso',
    data: {
      user: user.toJSON(),
      accessToken,
      refreshToken
    }
  });
}));

router.post('/refresh', validate(schemas.refreshToken), asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AuthenticationError('Token de actualización inválido');
  }
  
  const user = await User.findOne({ 
    where: { id: decoded.id, refreshToken } 
  });
  
  if (!user || !user.isActive) {
    throw new AuthenticationError('Token de actualización inválido');
  }
  
  const tokens = generateTokens(user);
  
  user.refreshToken = tokens.refreshToken;
  await user.save();
  
  res.json({
    success: true,
    data: tokens
  });
}));

router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  req.user.refreshToken = null;
  await req.user.save();
  
  res.json({
    success: true,
    message: 'Sesión cerrada correctamente'
  });
}));

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user.toJSON()
  });
}));

router.put('/me', authenticate, validate(schemas.updateProfile), asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'dateOfBirth', 'gender', 'address', 'city', 'preferences'];
  
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      req.user[field] = req.body[field];
    }
  }
  
  await req.user.save();
  
  res.json({
    success: true,
    message: 'Perfil actualizado',
    data: req.user.toJSON()
  });
}));

router.post('/forgot-password', validate(schemas.forgotPassword), asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findOne({ where: { email } });
  
  if (!user) {
    return res.json({
      success: true,
      message: 'Si el email existe, recibirás instrucciones'
    });
  }
  
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000);
  
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = resetExpires;
  await user.save();
  
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const html = `
    <h1>Restablecer contraseña</h1>
    <p>Hola ${user.name},</p>
    <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>El enlace expira en 1 hora.</p>
  `;
  
  await sendEmail({ to: user.email, subject: 'Restablecer contraseña - Salón de Belleza', html });
  
  if (user.phone) {
    await sendWhatsApp(user.phone, `🔐 Restablece tu contraseña: ${resetUrl} (expira en 1h)`).catch(() => {});
  }
  
  res.json({
    success: true,
    message: 'Si el email existe, recibirás instrucciones'
  });
}));

router.post('/reset-password', validate(schemas.resetPassword), asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  
  const user = await User.findOne({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { [Op.gt]: new Date() }
    }
  });
  
  if (!user) {
    throw new AuthenticationError('Token inválido o expirado');
  }
  
  user.password = password;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();
  
  res.json({
    success: true,
    message: 'Contraseña restablecida correctamente'
  });
}));

router.post('/change-password', authenticate, validate(schemas.changePassword), asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const isMatch = await req.user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AuthenticationError('Contraseña actual incorrecta');
  }
  
  req.user.password = newPassword;
  await req.user.save();
  
  res.json({
    success: true,
    message: 'Contraseña cambiada correctamente'
  });
}));

router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  const user = await User.findOne({ where: { emailVerificationToken: token } });
  
  if (!user) {
    throw new NotFoundError('Token de verificación');
  }
  
  user.emailVerified = true;
  user.emailVerificationToken = null;
  await user.save();
  
  res.json({
    success: true,
    message: 'Email verificado correctamente'
  });
}));

router.post('/resend-verification', authenticate, asyncHandler(async (req, res) => {
  if (req.user.emailVerified) {
    return res.json({
      success: true,
      message: 'El email ya está verificado'
    });
  }
  
  const verificationToken = crypto.randomBytes(32).toString('hex');
  req.user.emailVerificationToken = verificationToken;
  await req.user.save();
  
  await sendVerificationEmail(req.user, verificationToken);
  
  res.json({
    success: true,
    message: 'Email de verificación reenviado'
  });
}));

import { Op } from 'sequelize';

export default router;