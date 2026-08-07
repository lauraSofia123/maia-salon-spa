import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';
import { asyncHandler, NotFoundError } from '../middlewares/errorHandler.js';
import { Professional, User, Service, Branch, ProfessionalService, ProfessionalBranch } from '../models/index.js';
import { Op } from 'sequelize';
import { uploadSingle, handleUploadError } from '../middlewares/upload.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { category, branchId, isFeatured } = req.query;
  
  let whereProf = { isActive: true };
  if (isFeatured !== undefined) whereProf.isFeatured = isFeatured === 'true';
  
  let include = [
    { association: 'user', attributes: ['id', 'name', 'avatar', 'phone'] },
    { association: 'services', where: category ? { category } : {}, required: false, through: { attributes: ['customPrice', 'customDuration'] } },
    { association: 'branches', through: { attributes: ['schedule', 'isPrimary'] }, required: branchId ? true : false }
  ];
  
  if (branchId) {
    include[2].where = { id: branchId };
  }
  
  const professionals = await Professional.findAll({
    where: whereProf,
    include,
    order: [['displayOrder', 'ASC'], ['rating', 'DESC']]
  });
  
  res.json({ success: true, data: professionals });
}));

router.get('/admin', authenticate, authorize('admin'), validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const offset = (page - 1) * limit;
  
  let where = {};
  if (search) {
    where[Op.or] = [
      { '$user.name$': { [Op.iLike]: `%${search}%` } },
      { '$user.email$': { [Op.iLike]: `%${search}%` } }
    ];
  }
  
  const { count, rows } = await Professional.findAndCountAll({
    where,
    include: [{ association: 'user', attributes: ['name', 'email', 'phone', 'avatar'] }],
    order: [['displayOrder', 'ASC']],
    limit: parseInt(limit),
    offset
  });
  
  res.json({ success: true, data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) } });
}));

router.get('/:id', validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const professional = await Professional.findByPk(req.params.id, {
    include: [
      { association: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar'] },
      { association: 'services', through: { attributes: ['customPrice', 'customDuration'] } },
      { association: 'branches', through: { attributes: ['schedule', 'isPrimary'] } }
    ]
  });
  
  if (!professional) throw new NotFoundError('Profesional');
  
  res.json({ success: true, data: professional });
}));

router.post('/', authenticate, authorize('admin'), validate(schemas.createProfessional), uploadSingle('avatar'), handleUploadError, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.body.userId);
  if (!user) throw new NotFoundError('Usuario');
  if (user.role !== 'professional') throw new Error('El usuario debe tener rol professional');
  
  const existingProf = await Professional.findOne({ where: { userId: user.id } });
  if (existingProf) throw new Error('Este usuario ya tiene perfil profesional');
  
  const profData = { ...req.body };
  
  if (req.file) {
    const uploadResult = await uploadImage(req.file.buffer, 'salon/professionals');
    user.avatar = uploadResult.url;
    user.avatarPublicId = uploadResult.publicId;
    await user.save();
  }
  
  if (req.body.specialties) {
    profData.specialties = typeof req.body.specialties === 'string' ? JSON.parse(req.body.specialties) : req.body.specialties;
  }
  
  const professional = await Professional.create(profData);
  
  res.status(201).json({ success: true, message: 'Profesional creado', data: professional });
}));

router.put('/:id', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), validate(schemas.updateProfessional), uploadSingle('avatar'), handleUploadError, asyncHandler(async (req, res) => {
  const professional = await Professional.findByPk(req.params.id, { include: [{ association: 'user' }] });
  if (!professional) throw new NotFoundError('Profesional');
  
  const updateData = { ...req.body };
  
  if (req.body.specialties) {
    updateData.specialties = typeof req.body.specialties === 'string' ? JSON.parse(req.body.specialties) : req.body.specialties;
  }
  
  if (req.file) {
    if (professional.user.avatarPublicId) await deleteImage(professional.user.avatarPublicId);
    const uploadResult = await uploadImage(req.file.buffer, 'salon/professionals');
    professional.user.avatar = uploadResult.url;
    professional.user.avatarPublicId = uploadResult.publicId;
    await professional.user.save();
  }
  
  await professional.update(updateData);
  
  res.json({ success: true, message: 'Profesional actualizado', data: professional });
}));

router.delete('/:id', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const professional = await Professional.findByPk(req.params.id, { include: [{ association: 'user' }] });
  if (!professional) throw new NotFoundError('Profesional');
  
  if (professional.user.avatarPublicId) await deleteImage(professional.user.avatarPublicId);
  
  await professional.destroy();
  
  res.json({ success: true, message: 'Profesional eliminado' });
}));

router.post('/:id/services', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), validate(schemas.assignService), asyncHandler(async (req, res) => {
  const professional = await Professional.findByPk(req.params.id);
  if (!professional) throw new NotFoundError('Profesional');
  
  const { serviceId, customPrice, customDuration } = req.body;
  
  const service = await Service.findByPk(serviceId);
  if (!service) throw new NotFoundError('Servicio');
  
  const [profService, created] = await ProfessionalService.findOrCreate({
    where: { professionalId: professional.id, serviceId },
    defaults: { professionalId: professional.id, serviceId, customPrice, customDuration }
  });
  
  if (!created) {
    await profService.update({ customPrice, customDuration });
  }
  
  res.json({ success: true, message: created ? 'Servicio asignado' : 'Servicio actualizado', data: profService });
}));

router.delete('/:id/services/:serviceId', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const profService = await ProfessionalService.findOne({
    where: { professionalId: req.params.id, serviceId: req.params.serviceId }
  });
  
  if (!profService) throw new NotFoundError('Relación profesional-servicio');
  
  await profService.destroy();
  
  res.json({ success: true, message: 'Servicio desasignado' });
}));

router.post('/:id/branches', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), validate(schemas.assignBranch), asyncHandler(async (req, res) => {
  const professional = await Professional.findByPk(req.params.id);
  if (!professional) throw new NotFoundError('Profesional');
  
  const { branchId, schedule, isPrimary } = req.body;
  
  const branch = await Branch.findByPk(branchId);
  if (!branch) throw new NotFoundError('Sede');
  
  const [profBranch, created] = await ProfessionalBranch.findOrCreate({
    where: { professionalId: professional.id, branchId },
    defaults: { professionalId: professional.id, branchId, schedule, isPrimary }
  });
  
  if (!created) {
    await profBranch.update({ schedule, isPrimary });
  }
  
  if (isPrimary) {
    await ProfessionalBranch.update(
      { isPrimary: false },
      { where: { professionalId: professional.id, branchId: { [Op.ne]: branchId } } }
    );
  }
  
  res.json({ success: true, message: created ? 'Sede asignada' : 'Horario actualizado', data: profBranch });
}));

router.delete('/:id/branches/:branchId', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const profBranch = await ProfessionalBranch.findOne({
    where: { professionalId: req.params.id, branchId: req.params.branchId }
  });
  
  if (!profBranch) throw new NotFoundError('Relación profesional-sede');
  
  await profBranch.destroy();
  
  res.json({ success: true, message: 'Sede desasignada' });
}));

export default router;