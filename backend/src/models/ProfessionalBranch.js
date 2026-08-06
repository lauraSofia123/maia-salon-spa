import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProfessionalBranch = sequelize.define('ProfessionalBranch', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  professionalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'professionals',
      key: 'id'
    }
  },
  branchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'branches',
      key: 'id'
    }
  },
  schedule: {
    type: DataTypes.JSON,
    defaultValue: {
      monday: { start: '09:00', end: '19:00', isWorking: true, breaks: [] },
      tuesday: { start: '09:00', end: '19:00', isWorking: true, breaks: [] },
      wednesday: { start: '09:00', end: '19:00', isWorking: true, breaks: [] },
      thursday: { start: '09:00', end: '19:00', isWorking: true, breaks: [] },
      friday: { start: '09:00', end: '19:00', isWorking: true, breaks: [] },
      saturday: { start: '09:00', end: '18:00', isWorking: true, breaks: [] },
      sunday: { start: '10:00', end: '16:00', isWorking: false, breaks: [] }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'professional_branches',
  indexes: [
    {
      unique: true,
      fields: ['professionalId', 'branchId']
    }
  ]
});

export default ProfessionalBranch;