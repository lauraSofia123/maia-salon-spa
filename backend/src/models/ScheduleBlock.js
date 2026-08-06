import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ScheduleBlock = sequelize.define('ScheduleBlock', {
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
    allowNull: true,
    references: {
      model: 'branches',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('vacation', 'break', 'meeting', 'personal', 'maintenance', 'other'),
    defaultValue: 'other'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Null = todo el día'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurrencePattern: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Para bloqueos recurrentes: { frequency: "weekly", days: [1,3,5] }'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'schedule_blocks',
  indexes: [
    {
      fields: ['professionalId', 'startDate', 'endDate']
    }
  ]
});

export default ScheduleBlock;