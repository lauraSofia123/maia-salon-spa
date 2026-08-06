import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';
import { asyncHandler, NotFoundError } from '../middlewares/errorHandler.js';
import { Gallery, Professional, Service, Branch } from '../models/index.js';
import { Op } from 'sequelize';
import { uploadSingle, uploadArray, handleUploadError } from '../middlewares/upload.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, professionalId, serviceId, branchId, isFeatured, search } = req.query;
  
  const where = { isActive: true };
  if (category) where.category = category;
  if (professionalId) where.professionalId = professionalId;
  if (serviceId) where.serviceId = serviceId;
  if (branchId) where.branchId = branchId;
  if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
      { tags: { [Op.contains]: [search] } }
    ];
  }
  
  const offset = (page - 1) * limit;
  
  const { count, rows } = await Gallery.findAndCountAll({
    where,
    order: [['isFeatured', 'DESC'], ['displayOrder', 'ASC'], ['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset,
    include: [
      { association: 'professional', include: [{ association: 'user', attributes: ['name'] }] },
      { association: 'service', attributes: ['id', 'name'] },
      { association: 'branch', attributes: ['id', 'name'] }
    ]
  });
  
  res.json({ success: true, data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) } });
}));

router.get('/admin', authenticate, authorize('admin'), validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const offset = (page - 1) * limit;
  
  let where = {};
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } }
    ];
  }
  
  const { count, rows } = await Gallery.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset,
    include: [
      { association: 'professional', include: [{ association: 'user', attributes: ['name'] }] },
      { association: 'service', attributes: ['id', 'name'] },
      { association: 'branch', attributes: ['id', 'name'] }
    ]
  });
  
  res.json({ success: true, data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) } });
}));

router.get('/:id', validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const item = await Gallery.findByPk(req.params.id, {
    include: [
      { association: 'professional', include: [{ association: 'user', attributes: ['name'] }] },
      { association: 'service', attributes: ['id', 'name'] },
      { association: 'branch', attributes: ['id', 'name'] }
    ]
  });
  
  if (!item) throw new NotFoundError('Imagen de galería');
  
  res.json({ success: true, data: item });
}));

router.post('/', authenticate, authorize('admin'), validate(schemas.createGallery), uploadSingle('image'), handleUploadError, asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Imagen requerida' });
  }
  
  const uploadResult = await uploadImage(req.file.buffer, 'salon/gallery');
  
  const galleryData = {
    ...req.body,
    image: uploadResult.url,
    imagePublicId: uploadResult.publicId
  };
  
  if (req.body.tags) {
    galleryData.tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
  }
  
  const item = await Gallery.create(galleryData);
  
  res.status(201).json({ success: true, message: 'Imagen subida a galería', data: item });
}));

router.put('/:id', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), uploadSingle('image'), handleUploadError, asyncHandler(async (req, res) => {
  const item = await Gallery.findByPk(req.params.id);
  if (!item) throw new NotFoundError('Imagen de galería');
  
  const updateData = { ...req.body };
  
  if (req.file) {
    if (item.imagePublicId) await deleteImage(item.imagePublicId);
    const uploadResult = await uploadImage(req.file.buffer, 'salon/gallery');
    updateData.image = uploadResult.url;
    updateData.imagePublicId = uploadResult.publicId;
  }
  
  if (req.body.tags) {
    updateData.tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
  }
  
  await item.update(updateData);
  
  res.json({ success: true, message: 'Imagen actualizada', data: item });
}));

router.delete('/:id', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const item = await Gallery.findByPk(req.params.id);
  if (!item) throw new NotFoundError('Imagen de galería');
  
  if (item.imagePublicId) await deleteImage(item.imagePublicId);
  
  await item.destroy();
  
  res.json({ success: true, message: 'Imagen eliminada' });
}));

router.get('/categories/list', asyncHandler(async (req, res) => {
  const categories = await Gallery.findAll({
    attributes: ['category'],
    group: ['category'],
    where: { isActive: true }
  });
  
  res.json({ success: true, data: categories.map(c => c.category) });
}));

export default router;