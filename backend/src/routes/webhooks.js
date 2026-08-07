import express from 'express';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { sendAppointmentReminders } from '../services/appointmentService.js';

const router = express.Router();

router.post('/cron/reminders', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET || 'internal-cron-secret';
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }
  
  await sendAppointmentReminders();
  
  res.json({ success: true, message: 'Recordatorios procesados' });
}));

router.post('/cron/expire-points', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET || 'internal-cron-secret';
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }
  
  const { LoyaltyTransaction, User, LoyaltyProgram } = await import('../models/index.js');
  const { Op } = await import('sequelize');
  
  const program = await LoyaltyProgram.findOne({ where: { isActive: true } });
  if (!program) return res.json({ success: true, message: 'No hay programa activo' });
  
  const expirationDate = new Date();
  expirationDate.setMonth(expirationDate.getMonth() - program.pointsExpirationMonths);
  
  const expiredTransactions = await LoyaltyTransaction.findAll({
    where: {
      type: 'earned',
      createdAt: { [Op.lt]: expirationDate }
    },
    include: [{ association: 'client' }]
  });
  
  let totalExpired = 0;
  
  for (const tx of expiredTransactions) {
    if (tx.client.loyaltyPoints > 0) {
      const pointsToExpire = Math.min(tx.points, tx.client.loyaltyPoints);
      tx.client.loyaltyPoints -= pointsToExpire;
      await tx.client.save();
      
      await LoyaltyTransaction.create({
        clientId: tx.clientId,
        type: 'expired',
        points: -pointsToExpire,
        balanceAfter: tx.client.loyaltyPoints,
        description: `Puntos expirados (${program.pointsExpirationMonths} meses)`
      });
      
      totalExpired += pointsToExpire;
    }
  }
  
  res.json({ success: true, message: `${totalExpired} puntos expirados procesados` });
}));

router.post('/mercadopago', asyncHandler(async (req, res) => {
  console.log('Webhook MP recibido:', JSON.stringify(req.body, null, 2));
  res.status(200).json({ received: true });
}));

router.post('/twilio/status', asyncHandler(async (req, res) => {
  console.log('Webhook Twilio:', req.body);
  res.status(200).send('OK');
}));

router.post('/email/bounce', asyncHandler(async (req, res) => {
  console.log('Email bounce:', req.body);
  res.status(200).json({ received: true });
}));

export default router;