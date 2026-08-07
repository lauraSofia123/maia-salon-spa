import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';
import { asyncHandler, NotFoundError } from '../middlewares/errorHandler.js';
import { LoyaltyProgram, LoyaltyTransaction, User } from '../models/index.js';
import { calculateTier, getTierBenefits } from '../services/pricingService.js';
import sequelize from '../config/database.js';

const router = express.Router();

router.get('/program', asyncHandler(async (req, res) => {
  const program = await LoyaltyProgram.findOne({ where: { isActive: true } });
  
  if (!program) {
    return res.json({ success: true, data: null });
  }
  
  res.json({ success: true, data: program });
}));

router.get('/my-points', authenticate, authorize('client'), asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.userId, {
    attributes: ['loyaltyPoints', 'loyaltyTier', 'totalSpent']
  });
  
  const program = await LoyaltyProgram.findOne({ where: { isActive: true } });
  const benefits = getTierBenefits(user.loyaltyTier);
  
  let nextTier = null;
  let pointsToNextTier = 0;
  
  if (program) {
    const tiers = program.tiers;
    const currentTierIndex = tiers.findIndex(t => t.name === user.loyaltyTier);
    if (currentTierIndex >= 0 && currentTierIndex < tiers.length - 1) {
      nextTier = tiers[currentTierIndex + 1];
      pointsToNextTier = nextTier.minPoints - user.loyaltyPoints;
    }
  }
  
  res.json({
    success: true,
    data: {
      points: user.loyaltyPoints,
      tier: user.loyaltyTier,
      totalSpent: user.totalSpent,
      benefits,
      nextTier: nextTier ? { name: nextTier.name, minPoints: nextTier.minPoints, benefits: nextTier.benefits } : null,
      pointsToNextTier
    }
  });
}));

router.get('/transactions', authenticate, authorize('client'), validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, type } = req.query;
  const offset = (page - 1) * limit;
  
  let where = { clientId: req.userId };
  if (type) where.type = type;
  
  const { count, rows } = await LoyaltyTransaction.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset
  });
  
  res.json({ success: true, data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) } });
}));

router.post('/redeem', authenticate, authorize('client'), asyncHandler(async (req, res) => {
  const { pointsToRedeem, appointmentId } = req.body;
  
  if (!pointsToRedeem || pointsToRedeem <= 0) {
    return res.status(400).json({ success: false, message: 'Puntos a canjear inválidos' });
  }
  
  const user = await User.findByPk(req.userId);
  if (user.loyaltyPoints < pointsToRedeem) {
    return res.status(400).json({ success: false, message: 'Puntos insuficientes' });
  }
  
  const program = await LoyaltyProgram.findOne({ where: { isActive: true } });
  if (!program) {
    return res.status(400).json({ success: false, message: 'Programa de lealtad no disponible' });
  }
  
  const tierBenefits = getTierBenefits(user.loyaltyTier);
  const maxRedeem = tierBenefits.freeServicesPerMonth > 0 ? 5000 : 3000;
  
  if (pointsToRedeem > maxRedeem) {
    return res.status(400).json({ success: false, message: `Máximo ${maxRedeem} puntos por canje` });
  }
  
  const discountValue = pointsToRedeem / 10;
  
  await sequelize.transaction(async (t) => {
    user.loyaltyPoints -= pointsToRedeem;
    const newTier = calculateTier(user.loyaltyPoints);
    if (newTier !== user.loyaltyTier) {
      user.loyaltyTier = newTier;
    }
    await user.save({ transaction: t });
    
    await LoyaltyTransaction.create({
      clientId: user.id,
      appointmentId: appointmentId || null,
      type: 'redeemed',
      points: -pointsToRedeem,
      balanceAfter: user.loyaltyPoints,
      description: `Canjeados por descuento de $${discountValue.toLocaleString()} COP`
    }, { transaction: t });
  });
  
  res.json({ 
    success: true, 
    message: `${pointsToRedeem} puntos canjeados por $${discountValue.toLocaleString()} COP`,
    data: { pointsRedeemed: pointsToRedeem, discountValue, newBalance: user.loyaltyPoints }
  });
}));

router.post('/admin/adjust', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { clientId, points, type, description, appointmentId } = req.body;
  
  if (!clientId || !points || !type) {
    return res.status(400).json({ success: false, message: 'clientId, points y type son requeridos' });
  }
  
  const user = await User.findByPk(clientId);
  if (!user) throw new NotFoundError('Usuario');
  
  const newBalance = user.loyaltyPoints + points;
  if (newBalance < 0) {
    return res.status(400).json({ success: false, message: 'El ajuste resultaría en puntos negativos' });
  }
  
  await sequelize.transaction(async (t) => {
    user.loyaltyPoints = newBalance;
    const newTier = calculateTier(newBalance);
    if (newTier !== user.loyaltyTier) {
      user.loyaltyTier = newTier;
    }
    await user.save({ transaction: t });
    
    await LoyaltyTransaction.create({
      clientId: user.id,
      appointmentId: appointmentId || null,
      type,
      points,
      balanceAfter: newBalance,
      description: description || `Ajuste manual: ${points > 0 ? '+' : ''}${points} puntos`
    }, { transaction: t });
  });
  
  res.json({ success: true, message: 'Puntos ajustados', data: { newBalance, newTier: user.loyaltyTier } });
}));

router.get('/admin/transactions', authenticate, authorize('admin'), validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, clientId, type } = req.query;
  const offset = (page - 1) * limit;
  
  let where = {};
  if (clientId) where.clientId = clientId;
  if (type) where.type = type;
  
  const { count, rows } = await LoyaltyTransaction.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset,
    include: [{ association: 'client', attributes: ['id', 'name', 'email'] }]
  });
  
  res.json({ success: true, data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) } });
}));

router.put('/admin/program', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  let program = await LoyaltyProgram.findOne({ where: { isActive: true } });
  
  if (!program) {
    program = await LoyaltyProgram.create({ ...req.body, isActive: true });
  } else {
    await program.update(req.body);
  }
  
  res.json({ success: true, message: 'Programa actualizado', data: program });
}));

export default router;