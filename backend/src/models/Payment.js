import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'appointments',
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  type: {
    type: DataTypes.ENUM('deposit', 'full', 'partial', 'refund'),
    allowNull: false
  },
  method: {
    type: DataTypes.ENUM('cash', 'card', 'transfer', 'mercadopago', 'nequi', 'daviplata', 'other'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled'),
    defaultValue: 'pending'
  },
  transactionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  },
  mercadopagoPaymentId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  mercadopagoPreferenceId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reference: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refundReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'payments',
  indexes: [
    {
      fields: ['appointmentId']
    },
    {
      fields: ['clientId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['mercadopagoPaymentId']
    }
  ]
});

export default Payment;