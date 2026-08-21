import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';
import { asyncHandler, NotFoundError } from '../middlewares/errorHandler.js';
import { Service, ProfessionalService, Professional } from '../models/index.js';
import { Op } from 'sequelize';
import { uploadSingle, handleUploadError } from '../middlewares/upload.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', validate(schemas.serviceQuery, 'query'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, sortBy = 'displayOrder', sortOrder = 'asc', category, isActive, isPopular, search } = req.query;
  
  const where = {};
  if (category) where.category = category;
  if (isActive !== undefined) where.isActive = isActive === true || isActive === 'true';
  if (isPopular !== undefined) where.isPopular = isPopular === true || isPopular === 'true';
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } }
    ];
  }
  
  const offset = (page - 1) * limit;
  
  const { count, rows } = await Service.findAndCountAll({
    where,
    order: [[sortBy, sortOrder.toUpperCase()]],
    limit: parseInt(limit),
    offset
  });
  
  res.json({
    success: true,
    data: rows,
    pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) }
  });
}));

router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await Service.findAll({
    attributes: ['category'],
    group: ['category'],
    where: { isActive: true }
  });
  
  const result = {};
  for (const cat of categories) {
    const services = await Service.findAll({
      where: { category: cat.category, isActive: true },
      order: [['displayOrder', 'ASC']],
      attributes: ['id', 'name', 'price', 'duration', 'isPopular', 'image']
    });
    result[cat.category] = services;
  }
  
  res.json({ success: true, data: result });
}));

router.get('/:id', validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const service = await Service.findByPk(req.params.id, {
    include: [
      { association: 'professionals', through: { attributes: ['customPrice', 'customDuration'] }, include: [{ association: 'user', attributes: ['name', 'avatar'] }] }
    ]
  });
  
  if (!service) throw new NotFoundError('Servicio');
  
  res.json({ success: true, data: service });
}));

router.post('/', authenticate, authorize('admin'), validate(schemas.createService), uploadSingle('image'), handleUploadError, asyncHandler(async (req, res) => {
  const serviceData = { ...req.body };
  
  if (req.file) {
    const uploadResult = await uploadImage(req.file.buffer, 'salon/services');
    serviceData.image = uploadResult.url;
    serviceData.imagePublicId = uploadResult.publicId;
  }
  
  const service = await Service.create(serviceData);
  
  res.status(201).json({ success: true, message: 'Servicio creado', data: service });
}));

router.put('/:id', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), validate(schemas.updateService), uploadSingle('image'), handleUploadError, asyncHandler(async (req, res) => {
  const service = await Service.findByPk(req.params.id);
  if (!service) throw new NotFoundError('Servicio');
  
  const updateData = { ...req.body };
  
  if (req.file) {
    if (service.imagePublicId) await deleteImage(service.imagePublicId);
    const uploadResult = await uploadImage(req.file.buffer, 'salon/services');
    updateData.image = uploadResult.url;
    updateData.imagePublicId = uploadResult.publicId;
  }
  
  await service.update(updateData);
  
  res.json({ success: true, message: 'Servicio actualizado', data: service });
}));

router.delete('/:id', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const service = await Service.findByPk(req.params.id);
  if (!service) throw new NotFoundError('Servicio');
  
  if (service.imagePublicId) await deleteImage(service.imagePublicId);
  
  await service.destroy();
  
  res.json({ success: true, message: 'Servicio eliminado' });
}));

router.post('/:id/professionals', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), validate(schemas.assignService), asyncHandler(async (req, res) => {
  const service = await Service.findByPk(req.params.id);
  if (!service) throw new NotFoundError('Servicio');
  
  const { professionalId, customPrice, customDuration } = req.body;
  
  const professional = await Professional.findByPk(professionalId);
  if (!professional) throw new NotFoundError('Profesional');
  
  const [profService, created] = await ProfessionalService.findOrCreate({
    where: { professionalId, serviceId: service.id },
    defaults: { professionalId, serviceId: service.id, customPrice, customDuration }
  });
  
  if (!created) {
    await profService.update({ customPrice, customDuration });
  }
  
  res.json({ success: true, message: created ? 'Servicio asignado' : 'Servicio actualizado', data: profService });
}));

router.delete('/:id/professionals/:professionalId', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const profService = await ProfessionalService.findOne({
    where: { serviceId: req.params.id, professionalId: req.params.professionalId }
  });
  
  if (!profService) throw new NotFoundError('Relación servicio-profesional');
  
  await profService.destroy();
  
  res.json({ success: true, message: 'Servicio desasignado del profesional' });
}));

export default router;