import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('nails', 'hair', 'eyelashes', 'other'),
    allowNull: false
  },
  subcategory: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duración en minutos',
    validate: {
      min: 5,
      max: 480
    }
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  imagePublicId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isPopular: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  requiresProfessional: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  bufferTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Tiempo extra entre citas (minutos)'
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'services'
});

export default Service;