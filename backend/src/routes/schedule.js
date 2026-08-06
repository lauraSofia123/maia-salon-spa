import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';
import { asyncHandler, NotFoundError } from '../middlewares/errorHandler.js';
import { ScheduleBlock, Professional, Branch } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

router.get('/', authenticate, validate(schemas.pagination, 'query'), validate(schemas.dateRange, 'query'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, professionalId, branchId, type, startDate, endDate } = req.query;
  
  let where = {};
  
  if (req.userRole === 'professional') {
    const professional = await Professional.findOne({ where: { userId: req.userId } });
    if (professional) where.professionalId = professional.id;
  } else {
    if (professionalId) where.professionalId = professionalId;
  }
  
  if (branchId) where.branchId = branchId;
  if (type) where.type = type;
  if (startDate || endDate) {
    where.startDate = {};
    if (startDate) where.startDate[Op.gte] = startDate;
    if (endDate) where.startDate[Op.lte] = endDate;
  }
  
  const offset = (page - 1) * limit;
  
  const { count, rows } = await ScheduleBlock.findAndCountAll({
    where,
    order: [['startDate', 'ASC'], ['startTime', 'ASC']],
    limit: parseInt(limit),
    offset,
    include: [
      { association: 'professional', include: [{ association: 'user', attributes: ['name'] }] },
      { association: 'branch', attributes: ['id', 'name'] }
    ]
  });
  
  res.json({ success: true, data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) } });
}));

router.get('/professional/:professionalId', authenticate, asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  let where = { professionalId: req.params.professionalId, isActive: true };
  
  if (startDate || endDate) {
    where[Op.or] = [
      { startDate: { [Op.between]: [startDate, endDate] } },
      { endDate: { [Op.between]: [startDate, endDate] } },
      { startDate: { [Op.lte]: startDate }, endDate: { [Op.gte]: endDate } }
    ];
  }
  
  const blocks = await ScheduleBlock.findAll({
    where,
    order: [['startDate', 'ASC'], ['startTime', 'ASC']]
  });
  
  res.json({ success: true, data: blocks });
}));

router.get('/:id', authenticate, validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const block = await ScheduleBlock.findByPk(req.params.id, {
    include: [
      { association: 'professional', include: [{ association: 'user', attributes: ['name'] }] },
      { association: 'branch', attributes: ['id', 'name'] }
    ]
  });
  
  if (!block) throw new NotFoundError('Bloqueo de horario');
  
  if (req.userRole === 'professional') {
    const professional = await Professional.findOne({ where: { userId: req.userId } });
    if (!professional || block.professionalId !== professional.id) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
  }
  
  res.json({ success: true, data: block });
}));

router.post('/', authenticate, authorize('professional', 'admin'), validate(schemas.createScheduleBlock), asyncHandler(async (req, res) => {
  let professionalId = req.body.professionalId;
  
  if (req.userRole === 'professional') {
    const professional = await Professional.findOne({ where: { userId: req.userId } });
    if (!professional) throw new NotFoundError('Perfil profesional');
    professionalId = professional.id;
  }
  
  const professional = await Professional.findByPk(professionalId);
  if (!professional) throw new NotFoundError('Profesional');
  
  if (req.body.branchId) {
    const branch = await Branch.findByPk(req.body.branchId);
    if (!branch) throw new NotFoundError('Sede');
  }
  
  const blockData = { ...req.body, professionalId };
  
  if (req.body.recurrencePattern) {
    blockData.recurrencePattern = typeof req.body.recurrencePattern === 'string' 
      ? JSON.parse(req.body.recurrencePattern) 
      : req.body.recurrencePattern;
  }
  
  const block = await ScheduleBlock.create(blockData);
  
  res.status(201).json({ success: true, message: 'Bloqueo creado', data: block });
}));

router.put('/:id', authenticate, authorize('professional', 'admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const block = await ScheduleBlock.findByPk(req.params.id);
  if (!block) throw new NotFoundError('Bloqueo de horario');
  
  if (req.userRole === 'professional') {
    const professional = await Professional.findOne({ where: { userId: req.userId } });
    if (!professional || block.professionalId !== professional.id) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
  }
  
  const updateData = { ...req.body };
  
  if (req.body.recurrencePattern) {
    updateData.recurrencePattern = typeof req.body.recurrencePattern === 'string' 
      ? JSON.parse(req.body.recurrencePattern) 
      : req.body.recurrencePattern;
  }
  
  await block.update(updateData);
  
  res.json({ success: true, message: 'Bloqueo actualizado', data: block });
}));

router.delete('/:id', authenticate, authorize('professional', 'admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const block = await ScheduleBlock.findByPk(req.params.id);
  if (!block) throw new NotFoundError('Bloqueo de horario');
  
  if (req.userRole === 'professional') {
    const professional = await Professional.findOne({ where: { userId: req.userId } });
    if (!professional || block.professionalId !== professional.id) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
  }
  
  await block.destroy();
  
  res.json({ success: true, message: 'Bloqueo eliminado' });
}));

export default router;