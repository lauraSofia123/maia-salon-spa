import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';
import { asyncHandler, NotFoundError, ValidationError } from '../middlewares/errorHandler.js';
import { Promotion, PromotionUsage, Service, Professional, Branch } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

const router = express.Router();

router.get('/', validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isActive, isPublic, search } = req.query;
  
  const where = {};
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (isPublic !== undefined) where.isPublic = isPublic === 'true';
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { code: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } }
    ];
  }
  
  const now = new Date();
  where.startDate = { [Op.lte]: now };
  where.endDate = { [Op.gte]: now };
  
  const offset = (page - 1) * limit;
  
  const { count, rows } = await Promotion.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset
  });
  
  res.json({ success: true, data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) } });
}));

router.get('/admin', authenticate, authorize('admin'), validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const offset = (page - 1) * limit;
  
  let where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { code: { [Op.iLike]: `%${search}%` } }
    ];
  }
  
  const { count, rows } = await Promotion.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset
  });
  
  res.json({ success: true, data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) } });
}));

router.get('/validate', asyncHandler(async (req, res) => {
  const { code, serviceId, professionalId, branchId, clientId, amount } = req.query;
  
  if (!code) {
    return res.status(400).json({ success: false, message: 'Código requerido' });
  }
  
  const promotion = await Promotion.findOne({
    where: { code: code.toUpperCase(), isActive: true, isPublic: true }
  });
  
  if (!promotion) {
    return res.json({ success: true, valid: false, message: 'Cupón no encontrado o no público' });
  }
  
  const now = new Date();
  if (promotion.startDate > now || promotion.endDate < now) {
    return res.json({ success: true, valid: false, message: 'El cupón ha expirado' });
  }
  
  if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
    return res.json({ success: true, valid: false, message: 'El cupón ha agotado sus usos' });
  }
  
  if (clientId) {
    const usageCount = await PromotionUsage.count({
      where: { promotionId: promotion.id, clientId }
    });
    if (usageCount >= (promotion.usageLimitPerClient || 1)) {
      return res.json({ success: true, valid: false, message: 'Ya has usado este cupón el máximo de veces' });
    }
    
    if (promotion.requiresFirstVisit) {
      const appointmentCount = await Appointment.count({ where: { clientId, status: 'completed' } });
      if (appointmentCount > 0) {
        return res.json({ success: true, valid: false, message: 'Este cupón es solo para primera visita' });
      }
    }
  }
  
  if (promotion.minPurchaseAmount && amount && amount < promotion.minPurchaseAmount) {
    return res.json({ success: true, valid: false, message: `Mínimo de compra: $${promotion.minPurchaseAmount.toLocaleString()} COP` });
  }
  
  if (promotion.applicableTo !== 'all') {
    let applicable = false;
    switch (promotion.applicableTo) {
      case 'services':
        applicable = promotion.applicableIds?.includes(parseInt(serviceId));
        break;
      case 'categories':
        if (serviceId) {
          const service = await Service.findByPk(serviceId);
          applicable = promotion.applicableIds?.includes(service?.category);
        }
        break;
      case 'professionals':
        applicable = promotion.applicableIds?.includes(parseInt(professionalId));
        break;
      case 'branches':
        applicable = promotion.applicableIds?.includes(parseInt(branchId));
        break;
    }
    if (!applicable) {
      return res.json({ success: true, valid: false, message: 'El cupón no aplica para esta selección' });
    }
  }
  
  let discountAmount = 0;
  switch (promotion.type) {
    case 'percentage':
      discountAmount = amount * (promotion.value / 100);
      if (promotion.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, promotion.maxDiscountAmount);
      }
      break;
    case 'fixed_amount':
      discountAmount = Math.min(promotion.value, amount);
      break;
  }
  
  res.json({
    success: true,
    valid: true,
    data: {
      promotion: {
        id: promotion.id,
        name: promotion.name,
        code: promotion.code,
        type: promotion.type,
        value: promotion.value
      },
      discountAmount: Math.round(discountAmount)
    }
  });
}));

router.get('/:id', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const promotion = await Promotion.findByPk(req.params.id);
  if (!promotion) throw new NotFoundError('Promoción');
  
  res.json({ success: true, data: promotion });
}));

router.post('/', authenticate, authorize('admin'), validate(schemas.createPromotion), asyncHandler(async (req, res) => {
  const promotionData = { ...req.body };
  
  if (req.body.applicableIds) {
    promotionData.applicableIds = typeof req.body.applicableIds === 'string' 
      ? JSON.parse(req.body.applicableIds) 
      : req.body.applicableIds;
  }
  
  if (promotionData.code) {
    const existing = await Promotion.findOne({ where: { code: promotionData.code.toUpperCase() } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'El código ya existe' });
    }
    promotionData.code = promotionData.code.toUpperCase();
  }
  
  const promotion = await Promotion.create(promotionData);
  
  res.status(201).json({ success: true, message: 'Promoción creada', data: promotion });
}));

router.put('/:id', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const promotion = await Promotion.findByPk(req.params.id);
  if (!promotion) throw new NotFoundError('Promoción');
  
  const updateData = { ...req.body };
  
  if (req.body.applicableIds) {
    updateData.applicableIds = typeof req.body.applicableIds === 'string' 
      ? JSON.parse(req.body.applicableIds) 
      : req.body.applicableIds;
  }
  
  if (updateData.code) {
    updateData.code = updateData.code.toUpperCase();
    const existing = await Promotion.findOne({ 
      where: { code: updateData.code, id: { [Op.ne]: promotion.id } } 
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'El código ya existe' });
    }
  }
  
  await promotion.update(updateData);
  
  res.json({ success: true, message: 'Promoción actualizada', data: promotion });
}));

router.delete('/:id', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const promotion = await Promotion.findByPk(req.params.id);
  if (!promotion) throw new NotFoundError('Promoción');
  
  await promotion.destroy();
  
  res.json({ success: true, message: 'Promoción eliminada' });
}));

router.get('/:id/usages', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  
  const { count, rows } = await PromotionUsage.findAndCountAll({
    where: { promotionId: req.params.id },
    order: [['usedAt', 'DESC']],
    limit: parseInt(limit),
    offset,
    include: [
      { association: 'client', attributes: ['id', 'name', 'email'] },
      { association: 'appointment', include: [{ association: 'service' }] }
    ]
  });
  
  res.json({ success: true, data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) } });
}));

import { Appointment } from '../models/index.js';

export default router;