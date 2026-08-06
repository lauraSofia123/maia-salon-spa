import sequelize from '../config/database.js';

// Importar modelos
import User from './User.js';
import Service from './Service.js';
import Branch from './Branch.js';
import Professional from './Professional.js';
import ProfessionalService from './ProfessionalService.js';
import ProfessionalBranch from './ProfessionalBranch.js';
import Appointment from './Appointment.js';
import Payment from './Payment.js';
import Promotion from './Promotion.js';
import PromotionUsage from './PromotionUsage.js';
import LoyaltyProgram from './LoyaltyProgram.js';
import LoyaltyTransaction from './LoyaltyTransaction.js';
import ScheduleBlock from './ScheduleBlock.js';
import Review from './Review.js';
import Gallery from './Gallery.js';

// ============================================
// ASOCIACIONES
// ============================================

// User - Professional (1:1)
User.hasOne(Professional, { foreignKey: 'userId', as: 'professionalProfile' });
Professional.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - Appointments (1:N)
User.hasMany(Appointment, { foreignKey: 'clientId', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

// Professional - Appointments (1:N)
Professional.hasMany(Appointment, { foreignKey: 'professionalId', as: 'appointments' });
Appointment.belongsTo(Professional, { foreignKey: 'professionalId', as: 'professional' });

// Service - Appointments (1:N)
Service.hasMany(Appointment, { foreignKey: 'serviceId', as: 'appointments' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

// Branch - Appointments (1:N)
Branch.hasMany(Appointment, { foreignKey: 'branchId', as: 'appointments' });
Appointment.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

// Professional - Services (N:M) through ProfessionalService
Professional.belongsToMany(Service, { 
  through: ProfessionalService, 
  foreignKey: 'professionalId', 
  otherKey: 'serviceId',
  as: 'services'
});
Service.belongsToMany(Professional, { 
  through: ProfessionalService, 
  foreignKey: 'serviceId', 
  otherKey: 'professionalId',
  as: 'professionals'
});

// Professional - Branches (N:M) through ProfessionalBranch
Professional.belongsToMany(Branch, { 
  through: ProfessionalBranch, 
  foreignKey: 'professionalId', 
  otherKey: 'branchId',
  as: 'branches'
});
Branch.belongsToMany(Professional, { 
  through: ProfessionalBranch, 
  foreignKey: 'branchId', 
  otherKey: 'professionalId',
  as: 'professionals'
});

// Appointment - Payment (1:N)
Appointment.hasMany(Payment, { foreignKey: 'appointmentId', as: 'payments' });
Payment.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// User - Payment (1:N)
User.hasMany(Payment, { foreignKey: 'clientId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

// Promotion - PromotionUsage (1:N)
Promotion.hasMany(PromotionUsage, { foreignKey: 'promotionId', as: 'usages' });
PromotionUsage.belongsTo(Promotion, { foreignKey: 'promotionId', as: 'promotion' });

// User - PromotionUsage (1:N)
User.hasMany(PromotionUsage, { foreignKey: 'clientId', as: 'promotionUsages' });
PromotionUsage.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

// Appointment - PromotionUsage (1:N)
Appointment.hasMany(PromotionUsage, { foreignKey: 'appointmentId', as: 'promotionUsages' });
PromotionUsage.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// User - LoyaltyTransaction (1:N)
User.hasMany(LoyaltyTransaction, { foreignKey: 'clientId', as: 'loyaltyTransactions' });
LoyaltyTransaction.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

// Appointment - LoyaltyTransaction (1:N)
Appointment.hasMany(LoyaltyTransaction, { foreignKey: 'appointmentId', as: 'loyaltyTransactions' });
LoyaltyTransaction.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// Professional - ScheduleBlock (1:N)
Professional.hasMany(ScheduleBlock, { foreignKey: 'professionalId', as: 'scheduleBlocks' });
ScheduleBlock.belongsTo(Professional, { foreignKey: 'professionalId', as: 'professional' });

// Branch - ScheduleBlock (1:N)
Branch.hasMany(ScheduleBlock, { foreignKey: 'branchId', as: 'scheduleBlocks' });
ScheduleBlock.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

// Appointment - Review (1:1)
Appointment.hasOne(Review, { foreignKey: 'appointmentId', as: 'review' });
Review.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// User - Review (1:N)
User.hasMany(Review, { foreignKey: 'clientId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

// Professional - Review (1:N)
Professional.hasMany(Review, { foreignKey: 'professionalId', as: 'reviews' });
Review.belongsTo(Professional, { foreignKey: 'professionalId', as: 'professional' });

// Service - Review (1:N)
Service.hasMany(Review, { foreignKey: 'serviceId', as: 'reviews' });
Review.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

// Professional - Gallery (1:N)
Professional.hasMany(Gallery, { foreignKey: 'professionalId', as: 'galleryImages' });
Gallery.belongsTo(Professional, { foreignKey: 'professionalId', as: 'professional' });

// Service - Gallery (1:N)
Service.hasMany(Gallery, { foreignKey: 'serviceId', as: 'galleryImages' });
Gallery.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

// Branch - Gallery (1:N)
Branch.hasMany(Gallery, { foreignKey: 'branchId', as: 'galleryImages' });
Gallery.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });

// Appointment self-referencing for rescheduling
Appointment.hasOne(Appointment, { foreignKey: 'rescheduledFromId', as: 'rescheduledFrom' });
Appointment.belongsTo(Appointment, { foreignKey: 'rescheduledFromId', as: 'rescheduledTo' });

export {
  sequelize,
  User,
  Service,
  Branch,
  Professional,
  ProfessionalService,
  ProfessionalBranch,
  Appointment,
  Payment,
  Promotion,
  PromotionUsage,
  LoyaltyProgram,
  LoyaltyTransaction,
  ScheduleBlock,
  Review,
  Gallery
};

export default {
  sequelize,
  User,
  Service,
  Branch,
  Professional,
  ProfessionalService,
  ProfessionalBranch,
  Appointment,
  Payment,
  Promotion,
  PromotionUsage,
  LoyaltyProgram,
  LoyaltyTransaction,
  ScheduleBlock,
  Review,
  Gallery
};