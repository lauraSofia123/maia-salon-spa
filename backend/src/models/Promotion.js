import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Promotion = sequelize.define('Promotion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    validate: {
      isUppercase: true
    }
  },
  type: {
    type: DataTypes.ENUM('percentage', 'fixed_amount', 'buy_x_get_y', 'free_service'),
    allowNull: false
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Porcentaje (0-100) o monto fijo'
  },
  minPurchaseAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  maxDiscountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  applicableTo: {
    type: DataTypes.ENUM('all', 'services', 'categories', 'professionals', 'branches'),
    defaultValue: 'all'
  },
  applicableIds: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'IDs de servicios, categorías, profesionales o sedes aplicables'
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Límite total de usos (null = ilimitado)'
  },
  usageLimitPerClient: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si es true, cualquiera puede usarlo con el código'
  },
  requiresFirstVisit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'promotions'
});

export default Promotion;