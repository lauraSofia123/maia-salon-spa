import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';
import { asyncHandler, NotFoundError } from '../middlewares/errorHandler.js';
import { Branch, ProfessionalBranch, Professional } from '../models/index.js';
import { Op } from 'sequelize';
import { uploadSingle, uploadArray, handleUploadError } from '../middlewares/upload.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const branches = await Branch.findAll({
    where: { isActive: true },
    order: [['isMain', 'DESC'], ['name', 'ASC']]
  });
  
  res.json({ success: true, data: branches });
}));

router.get('/admin', authenticate, authorize('admin'), validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  
  const { count, rows } = await Branch.findAndCountAll({
    order: [['isMain', 'DESC'], ['name', 'ASC']],
    limit: parseInt(limit),
    offset
  });
  
  res.json({ success: true, data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) } });
}));

router.get('/:id', validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const branch = await Branch.findByPk(req.params.id, {
    include: [
      { association: 'professionals', through: { attributes: ['schedule', 'isPrimary'] }, include: [{ association: 'user', attributes: ['name', 'avatar'] }] }
    ]
  });
  
  if (!branch) throw new NotFoundError('Sede');
  
  res.json({ success: true, data: branch });
}));

router.post('/', authenticate, authorize('admin'), validate(schemas.createBranch), uploadArray('images', 10), handleUploadError, asyncHandler(async (req, res) => {
  const branchData = { ...req.body };
  
  if (req.files && req.files.length > 0) {
    const mainImage = req.files[0];
    const uploadResult = await uploadImage(mainImage.buffer, 'salon/branches');
    branchData.image = uploadResult.url;
    branchData.imagePublicId = uploadResult.publicId;
    
    if (req.files.length > 1) {
      const galleryUploads = await Promise.all(
        req.files.slice(1).map(f => uploadImage(f.buffer, 'salon/branches/gallery'))
      );
      branchData.gallery = galleryUploads.map(u => u.url);
    }
  }
  
  if (req.body.openingHours) {
    branchData.openingHours = typeof req.body.openingHours === 'string' 
      ? JSON.parse(req.body.openingHours) 
      : req.body.openingHours;
  }
  
  const existingSlug = await Branch.findOne({ where: { slug: branchData.slug } });
  if (existingSlug) {
    return res.status(400).json({ success: false, message: 'El slug ya existe' });
  }
  
  const branch = await Branch.create(branchData);
  
  res.status(201).json({ success: true, message: 'Sede creada', data: branch });
}));

router.put('/:id', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), uploadArray('images', 10), handleUploadError, asyncHandler(async (req, res) => {
  const branch = await Branch.findByPk(req.params.id);
  if (!branch) throw new NotFoundError('Sede');
  
  const updateData = { ...req.body };
  
  if (req.body.openingHours) {
    updateData.openingHours = typeof req.body.openingHours === 'string' 
      ? JSON.parse(req.body.openingHours) 
      : req.body.openingHours;
  }
  
  if (req.files && req.files.length > 0) {
    const mainImage = req.files[0];
    if (branch.imagePublicId) await deleteImage(branch.imagePublicId);
    const uploadResult = await uploadImage(mainImage.buffer, 'salon/branches');
    updateData.image = uploadResult.url;
    updateData.imagePublicId = uploadResult.publicId;
    
    if (req.files.length > 1) {
      const galleryUploads = await Promise.all(
        req.files.slice(1).map(f => uploadImage(f.buffer, 'salon/branches/gallery'))
      );
      updateData.gallery = [...(branch.gallery || []), ...galleryUploads.map(u => u.url)];
    }
  }
  
  await branch.update(updateData);
  
  res.json({ success: true, message: 'Sede actualizada', data: branch });
}));

router.delete('/:id', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const branch = await Branch.findByPk(req.params.id);
  if (!branch) throw new NotFoundError('Sede');
  
  if (branch.isMain) {
    return res.status(400).json({ success: false, message: 'No se puede eliminar la sede principal' });
  }
  
  if (branch.imagePublicId) await deleteImage(branch.imagePublicId);
  if (branch.gallery) {
    for (const img of branch.gallery) {
      try {
        const publicId = img.split('/').pop().split('.')[0];
        await deleteImage(`salon/branches/gallery/${publicId}`);
      } catch (e) {}
    }
  }
  
  await branch.destroy();
  
  res.json({ success: true, message: 'Sede eliminada' });
}));

router.post('/:id/professionals', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), validate(schemas.assignBranch), asyncHandler(async (req, res) => {
  const branch = await Branch.findByPk(req.params.id);
  if (!branch) throw new NotFoundError('Sede');
  
  const { professionalId, schedule, isPrimary } = req.body;
  
  const professional = await Professional.findByPk(professionalId);
  if (!professional) throw new NotFoundError('Profesional');
  
  const [profBranch, created] = await ProfessionalBranch.findOrCreate({
    where: { professionalId, branchId: branch.id },
    defaults: { professionalId, branchId: branch.id, schedule, isPrimary }
  });
  
  if (!created) {
    await profBranch.update({ schedule, isPrimary });
  }
  
  if (isPrimary) {
    await ProfessionalBranch.update(
      { isPrimary: false },
      { where: { professionalId, branchId: { [Op.ne]: branch.id } } }
    );
  }
  
  res.json({ success: true, message: created ? 'Profesional asignado a sede' : 'Horario actualizado', data: profBranch });
}));

router.delete('/:id/professionals/:professionalId', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const profBranch = await ProfessionalBranch.findOne({
    where: { branchId: req.params.id, professionalId: req.params.professionalId }
  });
  
  if (!profBranch) throw new NotFoundError('Relación profesional-sede');
  
  await profBranch.destroy();
  
  res.json({ success: true, message: 'Profesional desasignado de la sede' });
}));

export default router;