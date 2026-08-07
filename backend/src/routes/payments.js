import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';
import { asyncHandler, NotFoundError, ValidationError } from '../middlewares/errorHandler.js';
import { Payment, Appointment, User } from '../models/index.js';
import { Op } from 'sequelize';
import { getPayment } from '../config/mercadopago.js';
import sequelize from '../config/database.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), validate(schemas.pagination, 'query'), validate(schemas.dateRange, 'query'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', startDate, endDate, status, method, clientId } = req.query;
  
  const where = {};
  if (clientId) where.clientId = clientId;
  if (status) where.status = status;
  if (method) where.method = method;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = startDate;
    if (endDate) where.createdAt[Op.lte] = endDate;
  }
  
  const offset = (page - 1) * limit;
  
  const { count, rows } = await Payment.findAndCountAll({
    where,
    order: [[sortBy, sortOrder.toUpperCase()]],
    limit: parseInt(limit),
    offset,
    include: [
      { association: 'appointment', include: [{ association: 'service' }, { association: 'client', attributes: ['name', 'email'] }] },
      { association: 'client', attributes: ['id', 'name', 'email'] }
    ]
  });
  
  res.json({ success: true, data: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) } });
}));

router.get('/:id', authenticate, validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const payment = await Payment.findByPk(req.params.id, {
    include: [
      { association: 'appointment', include: [{ association: 'service' }, { association: 'professional', include: [{ association: 'user', attributes: ['name'] }] }, { association: 'branch' }] },
      { association: 'client', attributes: ['id', 'name', 'email', 'phone'] }
    ]
  });
  
  if (!payment) throw new NotFoundError('Pago');
  
  if (req.userRole === 'client' && payment.clientId !== req.userId) {
    return res.status(403).json({ success: false, message: 'No autorizado' });
  }
  
  res.json({ success: true, data: payment });
}));

router.post('/', authenticate, authorize('admin', 'professional'), validate(schemas.createPayment), asyncHandler(async (req, res) => {
  const { appointmentId, amount, type, method, reference } = req.body;
  
  const appointment = await Appointment.findByPk(appointmentId, { include: [{ association: 'client' }] });
  if (!appointment) throw new NotFoundError('Cita');
  
  if (req.userRole === 'professional') {
    const professional = await Professional.findOne({ where: { userId: req.userId } });
    if (!professional || appointment.professionalId !== professional.id) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
  }
  
  const existingPayments = await Payment.sum('amount', { where: { appointmentId, status: 'completed' } }) || 0;
  const totalWithNew = existingPayments + amount;
  
  if (totalWithNew > appointment.finalPrice) {
    throw new ValidationError(`El monto excede el total de la cita ($${appointment.finalPrice.toLocaleString()} COP)`);
  }
  
  const payment = await sequelize.transaction(async (t) => {
    const pay = await Payment.create({
      appointmentId,
      clientId: appointment.clientId,
      amount,
      type,
      method,
      status: 'completed',
      reference,
      paidAt: new Date()
    }, { transaction: t });
    
    let newPaymentStatus = 'partial';
    if (totalWithNew >= appointment.finalPrice) {
      newPaymentStatus = 'paid';
    }
    
    appointment.paymentStatus = newPaymentStatus;
    await appointment.save({ transaction: t });
    
    return pay;
  });
  
  res.status(201).json({ success: true, message: 'Pago registrado', data: payment });
}));

router.post('/mercadopago/webhook', asyncHandler(async (req, res) => {
  const { type, data } = req.body;
  
  if (type === 'payment') {
    try {
      const paymentInfo = await getPayment(data.id);
      
      const externalRef = paymentInfo.external_reference;
      if (!externalRef) {
        return res.status(200).json({ received: true });
      }
      
      const appointmentId = parseInt(externalRef);
      const appointment = await Appointment.findByPk(appointmentId);
      
      if (!appointment) {
        return res.status(200).json({ received: true });
      }
      
      const existingPayment = await Payment.findOne({
        where: { mercadopagoPaymentId: data.id, status: 'completed' }
      });
      
      if (existingPayment) {
        return res.status(200).json({ received: true });
      }
      
      if (paymentInfo.status === 'approved') {
        await sequelize.transaction(async (t) => {
          await Payment.create({
            appointmentId,
            clientId: appointment.clientId,
            amount: paymentInfo.transaction_amount,
            type: appointment.paymentStatus === 'partial' ? 'full' : 'deposit',
            method: 'mercadopago',
            status: 'completed',
            mercadopagoPaymentId: paymentInfo.id,
            mercadopagoPreferenceId: paymentInfo.preference_id,
            paidAt: new Date(paymentInfo.date_approved)
          }, { transaction: t });
          
          appointment.paymentStatus = 'paid';
          if (appointment.status === 'pending') {
            appointment.status = 'confirmed';
          }
          await appointment.save({ transaction: t });
        });
      } else if (['rejected', 'cancelled'].includes(paymentInfo.status)) {
        await Payment.create({
          appointmentId,
          clientId: appointment.clientId,
          amount: paymentInfo.transaction_amount,
          type: 'deposit',
          method: 'mercadopago',
          status: 'failed',
          mercadopagoPaymentId: paymentInfo.id,
          description: `Pago ${paymentInfo.status}: ${paymentInfo.status_detail}`
        });
      }
    } catch (error) {
      console.error('Error procesando webhook MP:', error);
    }
  }
  
  res.status(200).json({ received: true });
}));

router.post('/:id/refund', authenticate, authorize('admin'), validate(schemas.idParam, 'params'), asyncHandler(async (req, res) => {
  const payment = await Payment.findByPk(req.params.id, { include: [{ association: 'appointment' }] });
  if (!payment) throw new NotFoundError('Pago');
  
  if (payment.status !== 'completed') {
    throw new ValidationError('Solo se pueden reembolsar pagos completados');
  }
  
  if (payment.type === 'refund') {
    throw new ValidationError('Este pago ya es un reembolso');
  }
  
  const refundAmount = req.body.amount || payment.amount;
  if (refundAmount > payment.amount) {
    throw new ValidationError('El monto de reembolso no puede exceder el pago original');
  }
  
  await sequelize.transaction(async (t) => {
    payment.status = 'refunded';
    payment.refundedAt = new Date();
    payment.refundReason = req.body.reason || 'Reembolso solicitado por administrador';
    await payment.save({ transaction: t });
    
    await Payment.create({
      appointmentId: payment.appointmentId,
      clientId: payment.clientId,
      amount: refundAmount,
      type: 'refund',
      method: payment.method,
      status: 'completed',
      description: `Reembolso: ${payment.refundReason}`,
      paidAt: new Date()
    }, { transaction: t });
    
    const appointment = await Appointment.findByPk(payment.appointmentId, { transaction: t });
    if (appointment) {
      const totalPaid = await Payment.sum('amount', { 
        where: { appointmentId: appointment.id, status: 'completed' },
        transaction: t
      }) || 0;
      
      if (totalPaid === 0) {
        appointment.paymentStatus = 'pending';
      } else if (totalPaid < appointment.finalPrice) {
        appointment.paymentStatus = 'partial';
      } else {
        appointment.paymentStatus = 'paid';
      }
      await appointment.save({ transaction: t });
    }
  });
  
  res.json({ success: true, message: 'Reembolso procesado' });
}));

export default router;