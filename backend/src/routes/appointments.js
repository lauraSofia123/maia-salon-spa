import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';
import { asyncHandler, NotFoundError, ConflictError, ValidationError } from '../middlewares/errorHandler.js';
import { Appointment, Service, Professional, Branch, User, Payment, Promotion, PromotionUsage, LoyaltyTransaction, LoyaltyProgram } from '../models/index.js';
import { Op } from 'sequelize';
import { sendAppointmentConfirmation, sendAppointmentCancellation } from '../config/email.js';
import { sendAppointmentConfirmationWhatsApp, sendAppointmentCancellationWhatsApp } from '../config/whatsapp.js';
import { createPaymentPreference } from '../config/mercadopago.js';
import { calculateAvailability } from '../services/availabilityService.js';
import { calculatePrice, calculateDeposit, calculateLoyaltyPoints } from '../services/pricingService.js';
import { processAppointmentCompletion } from '../services/appointmentService.js';
import sequelize from '../config/database.js';

const router = express.Router();

router.get('/', authenticate, validate(schemas.pagination, 'query'), validate(schemas.dateRange, 'query'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sortBy = 'date', sortOrder = 'desc', startDate, endDate, status, professionalId, branchId } = req.query;
  
  let where = {};
  
  if (req.userRole === 'client') {
    where.clientId = req.userId;
  } else if (req.userRole === 'professional') {
    const professional = await Professional.findOne({ where: { userId: req.userId } });
    if (professional) where.professionalId = professional.id;
  }
  
  if (professionalId && req.userRole === 'admin') where.professionalId = professionalId;
  if (branchId) where.branchId = branchId;
  if (status) where.status = status;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date[Op.gte] = startDate;
    if (endDate) where.date[Op.lte] = endDate;
  }
  
  const offset = (page - 1) * limit;
  
  const { count, rows } = await Appointment.findAndCountAll({
    where,
    order: [[sortBy, sortOrder.toUpperCase()]],
    limit: parseInt(limit),
    offset,
    include: [
      { association: 'service' },
      { association: 'professional', include: [{ association: 'user', attributes: ['name', 'avatar'] }] },
      { association: 'branch' },
      { association: 'client', attributes: ['id', 'name', 'email', 'phone'] },
      { association: 'payments' },
      { association: 'promotionUsages', include: [{ association: 'promotion' }] }
    ]
  });
  
  res.json({
    success: true,
    data: rows,
    pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) }
  });
}));

router.get('/upcoming', authenticate, asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  let where = {
    date: { [Op.gte]: today },
    status: { [Op.in]: ['pending', 'confirmed'] }
  };
  
  if (req.userRole === 'client') {
    where.clientId = req.userId;
  } else if (req.userRole === 'professional') {
    const professional = await Professional.findOne({ where: { userId: req.userId } });
    if (professional) where.professionalId = professional.id;
  }
  
  const appointments = await Appointment.findAll({
    where,
    order: [['date', 'ASC'], ['startTime', 'ASC']],
    limit: 10,
    include: [
      { association: 'service' },
      { association: 'professional', include: [{ association: 'user', attributes: ['name', 'avatar'] }] },
      { association: 'branch' }
    ]
  });
  
  res.json({ success: true, data: appointments });
}));

router.get('/:id', authenticate, validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id, {
    include: [
      { association: 'service' },
      { association: 'professional', include: [{ association: 'user', attributes: ['name', 'avatar', 'phone'] }] },
      { association: 'branch' },
      { association: 'client', attributes: ['id', 'name', 'email', 'phone', 'loyaltyPoints', 'loyaltyTier'] },
      { association: 'payments' },
      { association: 'promotionUsages', include: [{ association: 'promotion' }] },
      { association: 'review' }
    ]
  });
  
  if (!appointment) throw new NotFoundError('Cita');
  
  if (req.userRole === 'client' && appointment.clientId !== req.userId) {
    return res.status(403).json({ success: false, message: 'No autorizado' });
  }
  
  if (req.userRole === 'professional') {
    const professional = await Professional.findOne({ where: { userId: req.userId } });
    if (!professional || appointment.professionalId !== professional.id) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
  }
  
  res.json({ success: true, data: appointment });
}));

router.post('/', authenticate, authorize('client'), validate(schemas.createAppointment), asyncHandler(async (req, res) => {
  const { serviceId, professionalId, branchId, date, startTime, couponCode, notes } = req.body;
  
  const service = await Service.findByPk(serviceId);
  if (!service || !service.isActive) throw new NotFoundError('Servicio');
  
  const professional = await Professional.findByPk(professionalId, { include: [{ association: 'branches', where: { branchId } }] });
  if (!professional || !professional.isActive) throw new NotFoundError('Profesional');
  
  const branch = await Branch.findByPk(branchId);
  if (!branch || !branch.isActive) throw new NotFoundError('Sede');
  
  const profService = await professional.getServices({ where: { id: serviceId } });
  if (profService.length === 0) throw new ValidationError('El profesional no ofrece este servicio');
  
  const profBranch = professional.branches.find(b => b.id === branchId);
  if (!profBranch) throw new ValidationError('El profesional no trabaja en esta sede');
  
  const availability = await calculateAvailability(professionalId, branchId, serviceId, date);
  const requestedTime = startTime;
  
  const slotAvailable = availability.slots.some(s => s.time === requestedTime && s.available);
  if (!slotAvailable) {
    throw new ConflictError('El horario seleccionado ya no está disponible');
  }
  
  const endTime = addMinutes(startTime, service.duration + (profService[0].ProfessionalService.customDuration || 0) + service.bufferTime);
  
  let finalPrice = calculatePrice(service, professional, profService[0].ProfessionalService);
  let discountAmount = 0;
  let promotion = null;
  
  if (couponCode) {
    promotion = await Promotion.findOne({ 
      where: { code: couponCode.toUpperCase(), isActive: true },
      include: [{ model: PromotionUsage, as: 'usages', where: { clientId: req.userId }, required: false }]
    });
    
    if (promotion) {
      const usageCount = promotion.usages?.length || 0;
      if (usageCount >= (promotion.usageLimitPerClient || 1)) {
        throw new ValidationError('Ya has usado este cupón el máximo de veces permitidas');
      }
      
      if (promotion.startDate > new Date() || promotion.endDate < new Date()) {
        throw new ValidationError('El cupón ha expirado');
      }
      
      if (promotion.minPurchaseAmount && finalPrice < promotion.minPurchaseAmount) {
        throw new ValidationError(`El cupón requiere un mínimo de $${promotion.minPurchaseAmount.toLocaleString()} COP`);
      }
      
      if (promotion.applicableTo !== 'all') {
        const applicable = checkPromotionApplicable(promotion, service, professional, branch);
        if (!applicable) throw new ValidationError('El cupón no aplica para este servicio/profesional/sede');
      }
      
      discountAmount = calculateDiscount(promotion, finalPrice);
      finalPrice -= discountAmount;
    }
  }
  
  const depositAmount = calculateDeposit(finalPrice, service);
  
  const appointment = await sequelize.transaction(async (t) => {
    const appt = await Appointment.create({
      clientId: req.userId,
      professionalId,
      serviceId,
      branchId,
      date,
      startTime,
      endTime,
      duration: service.duration + (profService[0].ProfessionalService.customDuration || 0) + service.bufferTime,
      status: 'pending',
      basePrice: service.price,
      discountAmount,
      depositAmount,
      finalPrice,
      paymentStatus: depositAmount > 0 ? 'partial' : 'pending',
      notes,
      clientNotes: req.body.clientNotes
    }, { transaction: t });
    
    if (promotion) {
      await PromotionUsage.create({
        promotionId: promotion.id,
        clientId: req.userId,
        appointmentId: appt.id,
        discountAmount
      }, { transaction: t });
      
      promotion.usedCount += 1;
      await promotion.save({ transaction: t });
    }
    
    return appt;
  });
  
  const fullAppointment = await Appointment.findByPk(appointment.id, {
    include: [
      { association: 'service' },
      { association: 'professional', include: [{ association: 'user', attributes: ['name', 'avatar'] }] },
      { association: 'branch' }
    ]
  });
  
  const client = await User.findByPk(req.userId);
  
  let paymentUrl = null;
  if (depositAmount > 0) {
    const preference = await createPaymentPreference(fullAppointment, client, service, professional, branch);
    paymentUrl = preference.init_point;
  }
  
  await sendAppointmentConfirmation(fullAppointment, client, professional.user, service, branch).catch(console.error);
  if (client.phone) {
    await sendAppointmentConfirmationWhatsApp(client.phone, fullAppointment, client, professional.user, service, branch).catch(console.error);
  }
  
  res.status(201).json({
    success: true,
    message: 'Cita creada. Completa el pago para confirmar.',
    data: {
      appointment: fullAppointment,
      paymentUrl,
      requiresPayment: depositAmount > 0
    }
  });
}));

router.put('/:id', authenticate, authorize('admin', 'professional'), validate(schemas.idParam, 'params'), validate(schemas.updateAppointment), asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id, {
    include: [{ association: 'professional', include: [{ association: 'user' }] }]
  });
  
  if (!appointment) throw new NotFoundError('Cita');
  
  if (req.userRole === 'professional' && appointment.professional.userId !== req.userId) {
    return res.status(403).json({ success: false, message: 'No autorizado' });
  }
  
  const oldStatus = appointment.status;
  await appointment.update(req.body);
  
  if (req.body.status === 'completed' && oldStatus !== 'completed') {
    await processAppointmentCompletion(appointment);
  }
  
  res.json({ success: true, message: 'Cita actualizada', data: appointment });
}));

router.post('/:id/reschedule', authenticate, validate(schemas.idParam, 'params'), validate(schemas.rescheduleAppointment), asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id, {
    include: [
      { association: 'service' },
      { association: 'professional', include: [{ association: 'user' }] },
      { association: 'branch' },
      { association: 'client' }
    ]
  });
  
  if (!appointment) throw new NotFoundError('Cita');
  
  if (req.userRole === 'client' && appointment.clientId !== req.userId) {
    return res.status(403).json({ success: false, message: 'No autorizado' });
  }
  
  if (['completed', 'cancelled', 'no_show'].includes(appointment.status)) {
    throw new ValidationError('No se puede reprogramar una cita en este estado');
  }
  
  const { newDate, newStartTime, newProfessionalId, newBranchId } = req.body;
  
  const professionalId = newProfessionalId || appointment.professionalId;
  const branchId = newBranchId || appointment.branchId;
  
  const availability = await calculateAvailability(professionalId, branchId, appointment.serviceId, newDate);
  const slotAvailable = availability.slots.some(s => s.time === newStartTime && s.available);
  
  if (!slotAvailable) {
    throw new ConflictError('El nuevo horario no está disponible');
  }
  
  const newEndTime = addMinutes(newStartTime, appointment.duration);
  
  const newAppointment = await sequelize.transaction(async (t) => {
    appointment.status = 'rescheduled';
    appointment.rescheduledFromId = appointment.id;
    await appointment.save({ transaction: t });
    
    const newAppt = await Appointment.create({
      clientId: appointment.clientId,
      professionalId,
      serviceId: appointment.serviceId,
      branchId,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      duration: appointment.duration,
      status: 'confirmed',
      basePrice: appointment.basePrice,
      discountAmount: appointment.discountAmount,
      depositAmount: appointment.depositAmount,
      finalPrice: appointment.finalPrice,
      paymentStatus: appointment.paymentStatus,
      paymentMethod: appointment.paymentMethod,
      notes: appointment.notes,
      clientNotes: appointment.clientNotes,
      rescheduledFromId: appointment.id
    }, { transaction: t });
    
    return newAppt;
  });
  
  const fullNewAppt = await Appointment.findByPk(newAppointment.id, {
    include: [
      { association: 'service' },
      { association: 'professional', include: [{ association: 'user', attributes: ['name', 'avatar'] }] },
      { association: 'branch' }
    ]
  });
  
  await sendAppointmentConfirmation(fullNewAppt, appointment.client, appointment.professional.user, appointment.service, appointment.branch).catch(console.error);
  if (appointment.client.phone) {
    await sendAppointmentConfirmationWhatsApp(appointment.client.phone, fullNewAppt, appointment.client, appointment.professional.user, appointment.service, appointment.branch).catch(console.error);
  }
  
  res.json({ success: true, message: 'Cita reprogramada', data: fullNewAppt });
}));

router.post('/:id/cancel', authenticate, validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id, {
    include: [
      { association: 'service' },
      { association: 'professional', include: [{ association: 'user' }] },
      { association: 'branch' },
      { association: 'client' },
      { association: 'payments', where: { status: 'completed' }, required: false }
    ]
  });
  
  if (!appointment) throw new NotFoundError('Cita');
  
  if (req.userRole === 'client' && appointment.clientId !== req.userId) {
    return res.status(403).json({ success: false, message: 'No autorizado' });
  }
  
  if (req.userRole === 'professional') {
    const professional = await Professional.findOne({ where: { userId: req.userId } });
    if (!professional || appointment.professionalId !== professional.id) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
  }
  
  if (['completed', 'cancelled', 'no_show'].includes(appointment.status)) {
    throw new ValidationError('No se puede cancelar una cita en este estado');
  }
  
  const hoursUntilAppointment = (new Date(`${appointment.date}T${appointment.startTime}`) - new Date()) / (1000 * 60 * 60);
  const cancellationPolicyHours = 2;
  
  let refundAmount = 0;
  if (hoursUntilAppointment >= cancellationPolicyHours) {
    refundAmount = appointment.depositAmount;
  }
  
  await sequelize.transaction(async (t) => {
    appointment.status = 'cancelled';
    appointment.cancellationReason = req.body.reason || 'Cancelado por usuario';
    appointment.cancelledBy = req.userRole;
    appointment.cancelledAt = new Date();
    await appointment.save({ transaction: t });
    
    if (refundAmount > 0) {
      await Payment.create({
        appointmentId: appointment.id,
        clientId: appointment.clientId,
        amount: refundAmount,
        type: 'refund',
        method: appointment.paymentMethod || 'cash',
        status: 'completed',
        description: `Reembolso por cancelación con ${hoursUntilAppointment.toFixed(1)}h de antelación`,
        paidAt: new Date()
      }, { transaction: t });
      
      appointment.paymentStatus = 'refunded';
      await appointment.save({ transaction: t });
    }
  });
  
  await sendAppointmentCancellation(appointment, appointment.client, appointment.professional.user, appointment.service, appointment.branch, req.body.reason).catch(console.error);
  if (appointment.client.phone) {
    await sendAppointmentCancellationWhatsApp(appointment.client.phone, appointment, appointment.client, appointment.professional.user, appointment.service, appointment.branch, req.body.reason).catch(console.error);
  }
  
  res.json({ 
    success: true, 
    message: 'Cita cancelada',
    data: { refundAmount }
  });
}));

router.post('/:id/confirm', authenticate, authorize('admin', 'professional'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id);
  if (!appointment) throw new NotFoundError('Cita');
  
  if (appointment.status !== 'pending') {
    throw new ValidationError('Solo se pueden confirmar citas pendientes');
  }
  
  appointment.status = 'confirmed';
  await appointment.save();
  
  res.json({ success: true, message: 'Cita confirmada', data: appointment });
}));

router.post('/:id/complete', authenticate, authorize('admin', 'professional'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id, {
    include: [
      { association: 'service' },
      { association: 'professional', include: [{ association: 'user' }] },
      { association: 'branch' },
      { association: 'client' }
    ]
  });
  
  if (!appointment) throw new NotFoundError('Cita');
  
  if (appointment.status !== 'confirmed' && appointment.status !== 'in_progress') {
    throw new ValidationError('Solo se pueden completar citas confirmadas o en progreso');
  }
  
  await processAppointmentCompletion(appointment);
  
  res.json({ success: true, message: 'Cita completada', data: appointment });
}));

router.post('/:id/no-show', authenticate, authorize('admin', 'professional'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id);
  if (!appointment) throw new NotFoundError('Cita');
  
  if (appointment.status !== 'confirmed') {
    throw new ValidationError('Solo se pueden marcar como no-show citas confirmadas');
  }
  
  appointment.status = 'no_show';
  await appointment.save();
  
  if (appointment.depositAmount > 0) {
    await Payment.create({
      appointmentId: appointment.id,
      clientId: appointment.clientId,
      amount: appointment.depositAmount,
      type: 'full',
      method: appointment.paymentMethod || 'cash',
      status: 'completed',
      description: 'No-show - abono no reembolsable',
      paidAt: new Date()
    });
  }
  
  res.json({ success: true, message: 'Cita marcada como no-show' });
}));

export default router;

function addMinutes(time, minutes) {
  const [hours, mins] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes);
  return date.toTimeString().slice(0, 5);
}

function checkPromotionApplicable(promotion, service, professional, branch) {
  switch (promotion.applicableTo) {
    case 'services':
      return promotion.applicableIds?.includes(service.id);
    case 'categories':
      return promotion.applicableIds?.includes(service.category);
    case 'professionals':
      return promotion.applicableIds?.includes(professional.id);
    case 'branches':
      return promotion.applicableIds?.includes(branch.id);
    default:
      return true;
  }
}

function calculateDiscount(promotion, price) {
  switch (promotion.type) {
    case 'percentage':
      let discount = price * (promotion.value / 100);
      if (promotion.maxDiscountAmount) {
        discount = Math.min(discount, promotion.maxDiscountAmount);
      }
      return discount;
    case 'fixed_amount':
      return Math.min(promotion.value, price);
    default:
      return 0;
  }
}