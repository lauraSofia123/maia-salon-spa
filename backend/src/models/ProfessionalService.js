import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProfessionalService = sequelize.define('ProfessionalService', {
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
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'services',
      key: 'id'
    }
  },
  customPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Precio personalizado del profesional para este servicio (null = usar precio base)'
  },
  customDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duración personalizada en minutos (null = usar duración base)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'professional_services',
  indexes: [
    {
      unique: true,
      fields: ['professionalId', 'serviceId']
    }
  ]
});

export default ProfessionalService;