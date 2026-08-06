import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LoyaltyProgram = sequelize.define('LoyaltyProgram', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pointsPerCurrency: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 1,
    comment: 'Puntos por cada unidad de moneda (ej: 1 punto por $1000 COP)'
  },
  currencyBase: {
    type: DataTypes.INTEGER,
    defaultValue: 1000
  },
  tiers: {
    type: DataTypes.JSON,
    defaultValue: [
      { name: 'bronze', minPoints: 0, benefits: [], discountPercent: 0 },
      { name: 'silver', minPoints: 5000, benefits: ['Descuento 5%', 'Prioridad en reservas'], discountPercent: 5 },
      { name: 'gold', minPoints: 15000, benefits: ['Descuento 10%', 'Servicio gratis al mes', 'Prioridad máxima'], discountPercent: 10 },
      { name: 'platinum', minPoints: 30000, benefits: ['Descuento 15%', '2 servicios gratis al mes', 'Acceso VIP', 'Regalo cumpleaños'], discountPercent: 15 }
    ]
  },
  pointsExpirationMonths: {
    type: DataTypes.INTEGER,
    defaultValue: 12
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'loyalty_programs'
});

export default LoyaltyProgram;