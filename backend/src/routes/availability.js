import express from 'express';
import { validate, schemas } from '../middlewares/validation.js';
import { asyncHandler, NotFoundError } from '../middlewares/errorHandler.js';
import { calculateAvailability, getAvailableProfessionals, getBranchAvailability } from '../services/availabilityService.js';
import { Professional, Service, Branch } from '../models/index.js';

const router = express.Router();

router.get('/slots', validate(schemas.checkAvailability, 'query'), asyncHandler(async (req, res) => {
  const { serviceId, professionalId, branchId, date } = req.query;
  
  const service = await Service.findByPk(serviceId);
  if (!service) throw new NotFoundError('Servicio');
  
  const professional = await Professional.findByPk(professionalId);
  if (!professional) throw new NotFoundError('Profesional');
  
  const branch = await Branch.findByPk(branchId);
  if (!branch) throw new NotFoundError('Sede');
  
  const availability = await calculateAvailability(professionalId, branchId, serviceId, date);
  
  res.json({ success: true, data: availability });
}));

router.get('/professionals', validate(schemas.checkAvailability, 'query'), asyncHandler(async (req, res) => {
  const { serviceId, branchId, date } = req.query;
  
  const service = await Service.findByPk(serviceId);
  if (!service) throw new NotFoundError('Servicio');
  
  const branch = await Branch.findByPk(branchId);
  if (!branch) throw new NotFoundError('Sede');
  
  const professionals = await getAvailableProfessionals(branchId, serviceId, date);
  
  res.json({ success: true, data: professionals });
}));

router.get('/branch/:branchId', asyncHandler(async (req, res) => {
  const { date } = req.query;
  const { branchId } = req.params;
  
  if (!date) {
    return res.status(400).json({ success: false, message: 'Fecha requerida' });
  }
  
  const branch = await Branch.findByPk(branchId);
  if (!branch) throw new NotFoundError('Sede');
  
  const availability = await getBranchAvailability(branchId, date);
  
  res.json({ success: true, data: availability });
}));

router.get('/calendar', asyncHandler(async (req, res) => {
  const { professionalId, branchId, serviceId, startDate, endDate } = req.query;
  
  if (!professionalId || !branchId || !serviceId || !startDate || !endDate) {
    return res.status(400).json({ success: false, message: 'Parámetros requeridos: professionalId, branchId, serviceId, startDate, endDate' });
  }
  
  const professional = await Professional.findByPk(professionalId);
  if (!professional) throw new NotFoundError('Profesional');
  
  const branch = await Branch.findByPk(branchId);
  if (!branch) throw new NotFoundError('Sede');
  
  const service = await Service.findByPk(serviceId);
  if (!service) throw new NotFoundError('Servicio');
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const calendar = [];
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const availability = await calculateAvailability(professionalId, branchId, serviceId, dateStr);
    const availableCount = availability.slots.filter(s => s.available).length;
    
    calendar.push({
      date: dateStr,
      available: availableCount > 0,
      availableSlots: availableCount,
      slots: availability.slots
    });
  }
  
  res.json({ success: true, data: calendar });
}));

export default router;