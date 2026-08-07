import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';
import { asyncHandler, NotFoundError } from '../middlewares/errorHandler.js';
import { User, Appointment, Payment, LoyaltyTransaction, Review } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', search, role, isActive } = req.query;
  
  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { phone: { [Op.iLike]: `%${search}%` } }
    ];
  }
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  
  const offset = (page - 1) * limit;
  
  const { count, rows } = await User.findAndCountAll({
    where,
    order: [[sortBy, sortOrder.toUpperCase()]],
    limit: parseInt(limit),
    offset,
    attributes: { exclude: ['password', 'refreshToken', 'passwordResetToken', 'passwordResetExpires', 'emailVerificationToken'] }
  });
  
  res.json({
    success: true,
    data: rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  });
}));

router.get('/:id', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password', 'refreshToken', 'passwordResetToken', 'passwordResetExpires', 'emailVerificationToken'] },
    include: [
      { association: 'professionalProfile' },
      { association: 'appointments', limit: 5, order: [['date', 'DESC']] }
    ]
  });
  
  if (!user) {
    throw new NotFoundError('Usuario');
  }
  
  res.json({ success: true, data: user });
}));

router.put('/:id', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new NotFoundError('Usuario');
  
  const allowedFields = ['name', 'phone', 'dateOfBirth', 'gender', 'address', 'city', 'role', 'isActive', 'loyaltyPoints', 'loyaltyTier'];
  
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  }
  
  await user.save();
  
  res.json({ success: true, message: 'Usuario actualizado', data: user.toJSON() });
}));

router.delete('/:id', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new NotFoundError('Usuario');
  
  if (user.id === req.userId) {
    return res.status(400).json({ success: false, message: 'No puedes eliminarte a ti mismo' });
  }
  
  await user.destroy();
  
  res.json({ success: true, message: 'Usuario eliminado' });
}));

router.get('/:id/appointments', authenticate, authorize('admin', 'professional'), validate(schemas.idParam, 'params'), validate(schemas.pagination, 'query'), validate(schemas.dateRange, 'query'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sortBy = 'date', sortOrder = 'desc', startDate, endDate, status } = req.query;
  
  const where = { clientId: req.params.id };
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date[Op.gte] = startDate;
    if (endDate) where.date[Op.lte] = endDate;
  }
  if (status) where.status = status;
  
  const offset = (page - 1) * limit;
  
  const { count, rows } = await Appointment.findAndCountAll({
    where,
    order: [[sortBy, sortOrder.toUpperCase()]],
    limit: parseInt(limit),
    offset,
    include: [
      { association: 'service' },
      { association: 'professional', include: [{ association: 'user', attributes: ['name'] }] },
      { association: 'branch' },
      { association: 'payments' }
    ]
  });
  
  res.json({
    success: true,
    data: rows,
    pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) }
  });
}));

router.get('/:id/payments', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  
  const { count, rows } = await Payment.findAndCountAll({
    where: { clientId: req.params.id },
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset,
    include: [
      { association: 'appointment', include: [{ association: 'service' }, { association: 'professional', include: [{ association: 'user', attributes: ['name'] }] }] }
    ]
  });
  
  res.json({ success: true, data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) } });
}));

router.get('/:id/loyalty', authenticate, authorize('admin', 'client'), validate(schemas.idParam, 'params'), validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  if (req.userRole === 'client' && req.userId !== parseInt(req.params.id)) {
    return res.status(403).json({ success: false, message: 'No autorizado' });
  }
  
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  
  const { count, rows } = await LoyaltyTransaction.findAndCountAll({
    where: { clientId: req.params.id },
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset
  });
  
  const user = await User.findByPk(req.params.id, { attributes: ['loyaltyPoints', 'loyaltyTier'] });
  
  res.json({ success: true, data: { transactions: rows, summary: user }, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) } });
}));

export default router;