import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PromotionUsage = sequelize.define('PromotionUsage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  promotionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'promotions',
      key: 'id'
    }
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    }
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  usedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'promotion_usages',
  indexes: [
    {
      fields: ['promotion_id', 'client_id']
    }
  ]
});

export default PromotionUsage;