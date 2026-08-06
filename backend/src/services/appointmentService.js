import { Appointment, User, LoyaltyTransaction, LoyaltyProgram, Service } from '../models/index.js';
import { calculateLoyaltyPoints, calculateTier } from './pricingService.js';
import sequelize from '../config/database.js';

export const processAppointmentCompletion = async (appointment) => {
  return sequelize.transaction(async (t) => {
    appointment.status = 'completed';
    appointment.completedAt = new Date();
    await appointment.save({ transaction: t });
    
    const client = await User.findByPk(appointment.clientId, { transaction: t });
    if (!client) return;
    
    const pointsEarned = await calculateLoyaltyPoints(appointment.finalPrice);
    
    if (pointsEarned > 0) {
      client.loyaltyPoints += pointsEarned;
      
      const newTier = calculateTier(client.loyaltyPoints);
      if (newTier !== client.loyaltyTier) {
        client.loyaltyTier = newTier;
      }
      
      await client.save({ transaction: t });
      
      await LoyaltyTransaction.create({
        clientId: client.id,
        appointmentId: appointment.id,
        type: 'earned',
        points: pointsEarned,
        balanceAfter: client.loyaltyPoints,
        description: `Ganados por cita: ${appointment.service?.name || 'Servicio'}`
      }, { transaction: t });
      
      appointment.loyaltyPointsEarned = pointsEarned;
      await appointment.save({ transaction: t });
    }
    
    client.totalSpent = parseFloat(client.totalSpent) + parseFloat(appointment.finalPrice);
    await client.save({ transaction: t });
  });
};

export const processAppointmentCancellation = async (appointment, refundAmount = 0) => {
  return sequelize.transaction(async (t) => {
    if (appointment.loyaltyPointsEarned > 0) {
      const client = await User.findByPk(appointment.clientId, { transaction: t });
      if (client) {
        client.loyaltyPoints = Math.max(0, client.loyaltyPoints - appointment.loyaltyPointsEarned);
        const newTier = calculateTier(client.loyaltyPoints);
        if (newTier !== client.loyaltyTier) {
          client.loyaltyTier = newTier;
        }
        await client.save({ transaction: t });
        
        await LoyaltyTransaction.create({
          clientId: client.id,
          appointmentId: appointment.id,
          type: 'adjusted',
          points: -appointment.loyaltyPointsEarned,
          balanceAfter: client.loyaltyPoints,
          description: `Revertidos por cancelación: ${appointment.service?.name || 'Servicio'}`
        }, { transaction: t });
      }
    }
  });
};

export const sendAppointmentReminders = async () => {
  const now = new Date();
  const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const today = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5);
  
  const appointments = await Appointment.findAll({
    where: {
      date: today,
      startTime: {
        [Op.gte]: currentTime,
        [Op.lte]: inTwoHours.toTimeString().slice(0, 5)
      },
      status: { [Op.in]: ['confirmed'] },
      reminderSent: false
    },
    include: [
      { association: 'service' },
      { association: 'professional', include: [{ association: 'user' }] },
      { association: 'branch' },
      { association: 'client' }
    ]
  });
  
  for (const appt of appointments) {
    try {
      await sendEmailReminder(appt);
      await sendWhatsAppReminder(appt);
      
      appt.reminderSent = true;
      appt.reminderSentAt = new Date();
      await appt.save();
    } catch (error) {
      console.error(`Error enviando recordatorio para cita ${appt.id}:`, error);
    }
  }
};

import { Op } from 'sequelize';
import { sendAppointmentReminder } from '../config/email.js';
import { sendAppointmentReminderWhatsApp } from '../config/whatsapp.js';

export default { processAppointmentCompletion, processAppointmentCancellation, sendAppointmentReminders };