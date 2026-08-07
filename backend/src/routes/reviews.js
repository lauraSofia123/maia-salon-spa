import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';
import { asyncHandler, NotFoundError, ValidationError } from '../middlewares/errorHandler.js';
import { Review, Appointment, Professional, User, Service } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

const router = express.Router();

router.get('/', validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, professionalId, serviceId, rating, isPublic } = req.query;
  
  const where = {};
  if (professionalId) where.professionalId = professionalId;
  if (serviceId) where.serviceId = serviceId;
  if (rating) where.rating = rating;
  if (isPublic !== undefined) where.isPublic = isPublic === 'true';
  
  const offset = (page - 1) * limit;
  
  const { count, rows } = await Review.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset,
    include: [
      { association: 'client', attributes: ['id', 'name', 'avatar'] },
      { association: 'service', attributes: ['id', 'name'] }
    ]
  });
  
  res.json({ success: true, data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) } });
}));

router.get('/professional/:professionalId/stats', asyncHandler(async (req, res) => {
  const professional = await Professional.findByPk(req.params.professionalId);
  if (!professional) throw new NotFoundError('Profesional');
  
  const reviews = await Review.findAll({
    where: { professionalId: professional.id, isPublic: true },
    attributes: ['rating']
  });
  
  const total = reviews.length;
  const avgRating = total > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / total 
    : 0;
  
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => distribution[r.rating]++);
  
  res.json({
    success: true,
    data: {
      totalReviews: total,
      averageRating: Math.round(avgRating * 10) / 10,
      distribution
    }
  });
}));

router.get('/:id', validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id, {
    include: [
      { association: 'client', attributes: ['id', 'name', 'avatar'] },
      { association: 'professional', include: [{ association: 'user', attributes: ['name', 'avatar'] }] },
      { association: 'service', attributes: ['id', 'name'] },
      { association: 'appointment', include: [{ association: 'branch' }] }
    ]
  });
  
  if (!review) throw new NotFoundError('Reseña');
  
  res.json({ success: true, data: review });
}));

router.post('/', authenticate, authorize('client'), validate(schemas.createReview), asyncHandler(async (req, res) => {
  const { appointmentId, rating, comment, images } = req.body;
  
  const appointment = await Appointment.findOne({
    where: { id: appointmentId, clientId: req.userId, status: 'completed' },
    include: [{ association: 'service' }, { association: 'professional' }]
  });
  
  if (!appointment) {
    throw new ValidationError('Solo puedes reseñar citas completadas que te pertenezcan');
  }
  
  const existingReview = await Review.findOne({ where: { appointmentId } });
  if (existingReview) {
    throw new ValidationError('Ya has reseñado esta cita');
  }
  
  const review = await Review.create({
    clientId: req.userId,
    professionalId: appointment.professionalId,
    appointmentId,
    serviceId: appointment.serviceId,
    rating,
    comment,
    images: images || []
  });
  
  await Professional.increment('totalReviews', { by: 1, where: { id: appointment.professionalId } });
  
  const reviews = await Review.findAll({
    where: { professionalId: appointment.professionalId, isPublic: true },
    attributes: ['rating']
  });
  
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Professional.update(
    { rating: Math.round(avgRating * 100) / 100 },
    { where: { id: appointment.professionalId } }
  );
  
  const fullReview = await Review.findByPk(review.id, {
    include: [
      { association: 'client', attributes: ['id', 'name', 'avatar'] },
      { association: 'service', attributes: ['id', 'name'] }
    ]
  });
  
  res.status(201).json({ success: true, message: 'Reseña creada', data: fullReview });
}));

router.put('/:id', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) throw new NotFoundError('Reseña');
  
  await review.update(req.body);
  
  res.json({ success: true, message: 'Reseña actualizada', data: review });
}));

router.post('/:id/respond', authenticate, authorize('admin', 'professional'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id, {
    include: [{ association: 'professional' }]
  });
  
  if (!review) throw new NotFoundError('Reseña');
  
  if (req.userRole === 'professional') {
    const professional = await Professional.findOne({ where: { userId: req.userId } });
    if (!professional || review.professionalId !== professional.id) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
  }
  
  review.response = req.body.response;
  review.respondedAt = new Date();
  await review.save();
  
  res.json({ success: true, message: 'Respuesta agregada', data: review });
}));

router.delete('/:id', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) throw new NotFoundError('Reseña');
  
  await Professional.decrement('totalReviews', { by: 1, where: { id: review.professionalId } });
  
  await review.destroy();
  
  const reviews = await Review.findAll({
    where: { professionalId: review.professionalId, isPublic: true },
    attributes: ['rating']
  });
  
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;
  
  await Professional.update(
    { rating: Math.round(avgRating * 100) / 100 },
    { where: { id: review.professionalId } }
  );
  
  res.json({ success: true, message: 'Reseña eliminada' });
}));

export default router;