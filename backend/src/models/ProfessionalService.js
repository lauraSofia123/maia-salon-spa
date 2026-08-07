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
    field: 'professional_id',
    references: {
      model: 'professionals',
      key: 'id'
    }
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'service_id',
    references: {
      model: 'services',
      key: 'id'
    }
  },
  customPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'custom_price',
    comment: 'Precio personalizado del profesional para este servicio (null = usar precio base)'
  },
  customDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'custom_duration',
    comment: 'Duración personalizada en minutos (null = usar duración base)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'professional_services',
  indexes: [
    {
      unique: true,
      fields: ['professional_id', 'service_id']
    }
  ]
});

export default ProfessionalService;