import sequelize from './database.js';
import { User, Service, Branch, Professional, ProfessionalService, ProfessionalBranch, Appointment, Payment, Promotion, PromotionUsage, LoyaltyProgram, LoyaltyTransaction, ScheduleBlock, Review, Gallery } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const syncDB = async (force = false) => {
  try {
    console.log('🔄 Sincronizando base de datos...');
    
    await sequelize.sync({ 
      alter: !force,
      force: force 
    });
    
    console.log('✅ Base de datos sincronizada correctamente');
    
    if (force) {
      console.log('⚠️  Tablas recreadas (force: true)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error sincronizando base de datos:', error);
    throw error;
  }
};

const closeDB = async () => {
  await sequelize.close();
  console.log('🔌 Conexión cerrada');
};

export { syncDB, closeDB };

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const force = process.argv.includes('--force');
  syncDB(force)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}