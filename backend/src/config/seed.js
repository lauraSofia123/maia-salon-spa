import { syncDB } from './sync-db.js';
import { User, Service, Branch, Professional, ProfessionalService, ProfessionalBranch, Appointment, Payment, Promotion, LoyaltyProgram, ScheduleBlock, Review, Gallery } from '../models/index.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seed = async () => {
  try {
    console.log('🌱 Iniciando seed de datos...');
    
    await syncDB(true);
    
    // ============================================
    // USUARIOS
    // ============================================
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    // Admin
    const admin = await User.create({
      name: 'Administrador',
      email: 'admin@salon.com',
      password: hashedPassword,
      phone: '+573001234567',
      role: 'admin',
      isActive: true,
      emailVerified: true
    });
    
    // Clientes
    const clients = await User.bulkCreate([
      {
        name: 'María González',
        email: 'maria@email.com',
        password: hashedPassword,
        phone: '+573101234567',
        role: 'client',
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 15000,
        loyaltyTier: 'gold',
        totalSpent: 850000,
        dateOfBirth: '1990-05-15',
        gender: 'female'
      },
      {
        name: 'Ana Rodríguez',
        email: 'ana@email.com',
        password: hashedPassword,
        phone: '+573112345678',
        role: 'client',
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 3000,
        loyaltyTier: 'silver',
        totalSpent: 200000,
        dateOfBirth: '1992-08-22',
        gender: 'female'
      },
      {
        name: 'Laura Martínez',
        email: 'laura@email.com',
        password: hashedPassword,
        phone: '+573123456789',
        role: 'client',
        isActive: true,
        emailVerified: true,
        loyaltyPoints: 500,
        loyaltyTier: 'bronze',
        totalSpent: 50000,
        dateOfBirth: '1995-12-10',
        gender: 'female'
      }
    ]);
    
    // Profesionales (usuarios)
    const profUsers = await User.bulkCreate([
      {
        name: 'Carolina Pérez',
        email: 'caro@salon.com',
        password: hashedPassword,
        phone: '+573134567890',
        role: 'professional',
        isActive: true,
        emailVerified: true
      },
      {
        name: 'Diana López',
        email: 'diana@salon.com',
        password: hashedPassword,
        phone: '+573145678901',
        role: 'professional',
        isActive: true,
        emailVerified: true
      },
      {
        name: 'Sofía Herrera',
        email: 'sofia@salon.com',
        password: hashedPassword,
        phone: '+573156789012',
        role: 'professional',
        isActive: true,
        emailVerified: true
      }
    ]);
    
    // ============================================
    // SEDES
    // ============================================
    const branches = await Branch.bulkCreate([
      {
        name: 'Sede Centro',
        slug: 'sede-centro',
        description: 'Nuestra sede principal en el corazón de la ciudad',
        address: 'Calle 72 # 10-25, Centro Comercial Andino, Local 205',
        city: 'Bogotá',
        state: 'Cundinamarca',
        postalCode: '110111',
        phone: '+5712345678',
        email: 'centro@salon.com',
        latitude: 4.6603,
        longitude: -74.0526,
        openingHours: {
          monday: { open: '09:00', close: '20:00', isClosed: false },
          tuesday: { open: '09:00', close: '20:00', isClosed: false },
          wednesday: { open: '09:00', close: '20:00', isClosed: false },
          thursday: { open: '09:00', close: '20:00', isClosed: false },
          friday: { open: '09:00', close: '21:00', isClosed: false },
          saturday: { open: '09:00', close: '19:00', isClosed: false },
          sunday: { open: '10:00', close: '17:00', isClosed: true }
        },
        isActive: true,
        isMain: true
      },
      {
        name: 'Sede Norte',
        slug: 'sede-norte',
        description: 'Sede moderna en la zona norte',
        address: 'Carrera 15 # 123-45, Centro Comercial Hacienda Santa Barbara, Local 112',
        city: 'Bogotá',
        state: 'Cundinamarca',
        postalCode: '110121',
        phone: '+5713456789',
        email: 'norte@salon.com',
        latitude: 4.7110,
        longitude: -74.0452,
        openingHours: {
          monday: { open: '10:00', close: '19:00', isClosed: false },
          tuesday: { open: '10:00', close: '19:00', isClosed: false },
          wednesday: { open: '10:00', close: '19:00', isClosed: false },
          thursday: { open: '10:00', close: '19:00', isClosed: false },
          friday: { open: '10:00', close: '20:00', isClosed: false },
          saturday: { open: '09:00', close: '18:00', isClosed: false },
          sunday: { open: '10:00', close: '16:00', isClosed: true }
        },
        isActive: true,
        isMain: false
      },
      {
        name: 'Sede Chapinero',
        slug: 'sede-chapinero',
        description: 'Sede boutique en zona rosa',
        address: 'Calle 55 # 13-28, Zona G',
        city: 'Bogotá',
        state: 'Cundinamarca',
        postalCode: '110221',
        phone: '+5714567890',
        email: 'chapinero@salon.com',
        latitude: 4.6486,
        longitude: -74.0636,
        openingHours: {
          monday: { open: '10:00', close: '19:00', isClosed: true },
          tuesday: { open: '10:00', close: '19:00', isClosed: false },
          wednesday: { open: '10:00', close: '19:00', isClosed: false },
          thursday: { open: '10:00', close: '19:00', isClosed: false },
          friday: { open: '10:00', close: '20:00', isClosed: false },
          saturday: { open: '09:00', close: '18:00', isClosed: false },
          sunday: { open: '10:00', close: '16:00', isClosed: false }
        },
        isActive: true,
        isMain: false
      }
    ]);
    
    // ============================================
    // SERVICIOS
    // ============================================
    const services = await Service.bulkCreate([
      // UÑAS - Acrílicas
      { name: 'Uñas Acrílicas Completas', description: 'Extensión completa con acrílico, incluye diseño básico', category: 'nails', subcategory: 'acrylic', price: 80000, duration: 120, isPopular: true, displayOrder: 1 },
      { name: 'Relleno Acrílico', description: 'Mantenimiento de uñas acrílicas (cada 3-4 semanas)', category: 'nails', subcategory: 'acrylic', price: 50000, duration: 90, displayOrder: 2 },
      { name: 'Retiro de Acrílico', description: 'Retiro profesional sin dañar la uña natural', category: 'nails', subcategory: 'acrylic', price: 25000, duration: 45, displayOrder: 3 },
      { name: 'Acrílico con Encapsulado', description: 'Acrílico con glitter, flores secas o diseños encapsulados', category: 'nails', subcategory: 'acrylic', price: 100000, duration: 150, displayOrder: 4 },
      
      // UÑAS - Semipermanentes
      { name: 'Manicure Semipermanente', description: 'Esmalte semipermanente en manos, incluye preparación', category: 'nails', subcategory: 'semipermanent', price: 45000, duration: 60, isPopular: true, displayOrder: 5 },
      { name: 'Pedicure Semipermanente', description: 'Esmalte semipermanente en pies, incluye spa de pies', category: 'nails', subcategory: 'semipermanent', price: 55000, duration: 75, isPopular: true, displayOrder: 6 },
      { name: 'Manicure + Pedicure Semipermanente', description: 'Combo completo manos y pies', category: 'nails', subcategory: 'semipermanent', price: 90000, duration: 120, displayOrder: 7 },
      { name: 'Retiro Semipermanente', description: 'Retiro cuidadoso de esmalte semipermanente', category: 'nails', subcategory: 'semipermanent', price: 15000, duration: 30, displayOrder: 8 },
      
      // UÑAS - Manicure/Pedicure
      { name: 'Manicure Clásico', description: 'Limpieza, corte, limado, cutículas e hidratación', category: 'nails', subcategory: 'manicure', price: 25000, duration: 45, displayOrder: 9 },
      { name: 'Pedicure Spa', description: 'Pedicure completo con exfoliación, mascarilla y masaje', category: 'nails', subcategory: 'pedicure', price: 45000, duration: 60, displayOrder: 10 },
      { name: 'Manicure Rusa', description: 'Técnica rusa con torno para cutículas perfectas', category: 'nails', subcategory: 'manicure', price: 55000, duration: 75, isPopular: true, displayOrder: 11 },
      
      // UÑAS - Decoración/Nail Art
      { name: 'Diseño Básico (1-2 uñas)', description: 'Diseño simple en 1-2 uñas acento', category: 'nails', subcategory: 'nail_art', price: 10000, duration: 15, displayOrder: 12 },
      { name: 'Diseño Completo (10 uñas)', description: 'Diseño artístico en las 10 uñas', category: 'nails', subcategory: 'nail_art', price: 35000, duration: 45, displayOrder: 13 },
      { name: 'Efecto Espejo / Chrome', description: 'Efecto metálico espejo en todas las uñas', category: 'nails', subcategory: 'nail_art', price: 20000, duration: 20, displayOrder: 14 },
      { name: 'Encapsulado 3D', description: 'Flores, mariposas u otros elementos 3D encapsulados', category: 'nails', subcategory: 'nail_art', price: 30000, duration: 30, displayOrder: 15 },
      
      // CABELLO - Cortes
      { name: 'Corte de Cabello Mujer', description: 'Corte personalizado + lavado + peinado', category: 'hair', subcategory: 'cuts', price: 55000, duration: 60, displayOrder: 16 },
      { name: 'Corte de Cabello Hombre', description: 'Corte clásico o moderno + lavado', category: 'hair', subcategory: 'cuts', price: 35000, duration: 45, displayOrder: 17 },
      { name: 'Corte Infantil', description: 'Corte para niños menores de 12 años', category: 'hair', subcategory: 'cuts', price: 30000, duration: 30, displayOrder: 18 },
      { name: 'Recorte de Puntas', description: 'Solo recorte de puntas para mantener largo', category: 'hair', subcategory: 'cuts', price: 25000, duration: 30, displayOrder: 19 },
      
      // CABELLO - Peinados
      { name: 'Peinado para Evento', description: 'Peinado elaborado (recogido, trenzas, ondas)', category: 'hair', subcategory: 'styling', price: 80000, duration: 90, isPopular: true, displayOrder: 20 },
      { name: 'Peinado Novia (Prueba + Día)', description: 'Incluye prueba previa y peinado día del evento', category: 'hair', subcategory: 'styling', price: 250000, duration: 180, displayOrder: 21 },
      { name: 'Ondas / Rizado', description: 'Ondas suaves o rizado definido con tenaza', category: 'hair', subcategory: 'styling', price: 45000, duration: 45, displayOrder: 22 },
      { name: 'Planchado', description: 'Planchado profesional con protección térmica', category: 'hair', subcategory: 'styling', price: 40000, duration: 45, displayOrder: 23 },
      
      // CABELLO - Tratamientos
      { name: 'Tratamiento Keratina', description: 'Alisado brasileño con keratina, dura 3-4 meses', category: 'hair', subcategory: 'treatments', price: 180000, duration: 180, displayOrder: 24 },
      { name: 'Tratamiento Hidratación Profunda', description: 'Mascarilla nutritiva + vapor + masaje capilar', category: 'hair', subcategory: 'treatments', price: 45000, duration: 45, displayOrder: 25 },
      { name: 'Tratamiento Reconstrucción', description: 'Reparación intensiva para cabello dañado', category: 'hair', subcategory: 'treatments', price: 65000, duration: 60, displayOrder: 26 },
      { name: 'Baño de Color / Brillo', description: 'Tonalizante para dar brillo y realzar color', category: 'hair', subcategory: 'treatments', price: 55000, duration: 45, displayOrder: 27 },
      
      // PESTAÑAS
      { name: 'Extensiones Clásicas (1x1)', description: 'Una extensión por pestaña natural, look natural', category: 'eyelashes', subcategory: 'classic', price: 90000, duration: 120, isPopular: true, displayOrder: 28 },
      { name: 'Extensiones Volumen Ruso (2D-6D)', description: 'Abanicos de 2-6 extensiones por pestaña, look dramático', category: 'eyelashes', subcategory: 'volume', price: 130000, duration: 150, displayOrder: 29 },
      { name: 'Extensiones Híbridas', description: 'Combinación clásico + volumen, look medio', category: 'eyelashes', subcategory: 'volume', price: 110000, duration: 135, displayOrder: 30 },
      { name: 'Retoque 2 Semanas', description: 'Relleno a las 2 semanas (máx 50% caídas)', category: 'eyelashes', subcategory: 'retouch', price: 60000, duration: 60, displayOrder: 31 },
      { name: 'Retoque 3 Semanas', description: 'Relleno a las 3 semanas (máx 70% caídas)', category: 'eyelashes', subcategory: 'retouch', price: 75000, duration: 75, displayOrder: 32 },
      { name: 'Retiro de Extensiones', description: 'Retiro profesional con removedor especial', category: 'eyelashes', subcategory: 'removal', price: 25000, duration: 30, displayOrder: 33 },
      { name: 'Lifting de Pestañas', description: 'Rizado permanente de pestañas naturales + tinte', category: 'eyelashes', subcategory: 'other', price: 55000, duration: 60, displayOrder: 34 },
      { name: 'Tinte de Pestañas', description: 'Tinte negro o marrón para pestañas naturales', category: 'eyelashes', subcategory: 'other', price: 20000, duration: 20, displayOrder: 35 }
    ]);
    
    // ============================================
    // PROFESIONALES
    // ============================================
    const professionals = await Professional.bulkCreate([
      {
        userId: profUsers[0].id,
        bio: 'Especialista en uñas acrílicas y nail art con 8 años de experiencia. Certificada en técnicas avanzadas de encapsulado y diseño 3D.',
        specialties: ['acrylic', 'nail_art', 'encapsulated'],
        experienceYears: 8,
        rating: 4.9,
        totalReviews: 127,
        isActive: true,
        isFeatured: true,
        displayOrder: 1,
        commissionRate: 40
      },
      {
        userId: profUsers[1].id,
        bio: 'Experta en cabello: cortes, colorimetría, keratina y peinados para eventos. 6 años transformando looks.',
        specialties: ['cuts', 'color', 'keratin', 'styling'],
        experienceYears: 6,
        rating: 4.8,
        totalReviews: 95,
        isActive: true,
        isFeatured: true,
        displayOrder: 2,
        commissionRate: 45
      },
      {
        userId: profUsers[2].id,
        bio: 'Especialista en pestañas: extensiones clásico, volumen ruso, híbrido y lifting. Certificada internacionalmente.',
        specialties: ['classic', 'volume', 'hybrid', 'lifting'],
        experienceYears: 5,
        rating: 4.9,
        totalReviews: 83,
        isActive: true,
        isFeatured: true,
        displayOrder: 3,
        commissionRate: 50
      }
    ]);
    
    // ============================================
    // PROFESSIONAL SERVICES (qué servicios hace cada profe)
    // ============================================
    // Carolina (uñas) - IDs 1-15 aprox
    const nailServices = services.filter(s => s.category === 'nails').map(s => s.id);
    const carolinaServices = nailServices.map(serviceId => ({
      professionalId: professionals[0].id,
      serviceId,
      isActive: true
    }));
    await ProfessionalService.bulkCreate(carolinaServices);
    
    // Diana (cabello) - IDs 16-27 aprox
    const hairServices = services.filter(s => s.category === 'hair').map(s => s.id);
    const dianaServices = hairServices.map(serviceId => ({
      professionalId: professionals[1].id,
      serviceId,
      isActive: true
    }));
    await ProfessionalService.bulkCreate(dianaServices);
    
    // Sofía (pestañas) - IDs 28-35 aprox
    const lashServices = services.filter(s => s.category === 'eyelashes').map(s => s.id);
    const sofiaServices = lashServices.map(serviceId => ({
      professionalId: professionals[2].id,
      serviceId,
      isActive: true
    }));
    await ProfessionalService.bulkCreate(sofiaServices);
    
    // ============================================
    // PROFESSIONAL BRANCHES (dónde trabaja cada profe)
    // ============================================
    await ProfessionalBranch.bulkCreate([
      // Carolina: Sede Centro (L-V) y Sede Norte (S)
      {
        professionalId: professionals[0].id,
        branchId: branches[0].id,
        schedule: {
          monday: { start: '09:00', end: '18:00', isWorking: true, breaks: [{ start: '13:00', end: '14:00' }] },
          tuesday: { start: '09:00', end: '18:00', isWorking: true, breaks: [{ start: '13:00', end: '14:00' }] },
          wednesday: { start: '09:00', end: '18:00', isWorking: true, breaks: [{ start: '13:00', end: '14:00' }] },
          thursday: { start: '09:00', end: '18:00', isWorking: true, breaks: [{ start: '13:00', end: '14:00' }] },
          friday: { start: '09:00', end: '19:00', isWorking: true, breaks: [{ start: '13:00', end: '14:00' }] },
          saturday: { start: '09:00', end: '14:00', isWorking: false, breaks: [] },
          sunday: { start: '10:00', end: '16:00', isWorking: false, breaks: [] }
        },
        isActive: true,
        isPrimary: true
      },
      {
        professionalId: professionals[0].id,
        branchId: branches[1].id,
        schedule: {
          monday: { start: '09:00', end: '18:00', isWorking: false, breaks: [] },
          tuesday: { start: '09:00', end: '18:00', isWorking: false, breaks: [] },
          wednesday: { start: '09:00', end: '18:00', isWorking: false, breaks: [] },
          thursday: { start: '09:00', end: '18:00', isWorking: false, breaks: [] },
          friday: { start: '09:00', end: '18:00', isWorking: false, breaks: [] },
          saturday: { start: '09:00', end: '18:00', isWorking: true, breaks: [{ start: '13:00', end: '14:00' }] },
          sunday: { start: '10:00', end: '16:00', isWorking: false, breaks: [] }
        },
        isActive: true,
        isPrimary: false
      },
      // Diana: Sede Centro (todo el tiempo)
      {
        professionalId: professionals[1].id,
        branchId: branches[0].id,
        schedule: {
          monday: { start: '09:00', end: '19:00', isWorking: true, breaks: [{ start: '13:00', end: '14:00' }] },
          tuesday: { start: '09:00', end: '19:00', isWorking: true, breaks: [{ start: '13:00', end: '14:00' }] },
          wednesday: { start: '09:00', end: '19:00', isWorking: true, breaks: [{ start: '13:00', end: '14:00' }] },
          thursday: { start: '09:00', end: '19:00', isWorking: true, breaks: [{ start: '13:00', end: '14:00' }] },
          friday: { start: '09:00', end: '20:00', isWorking: true, breaks: [{ start: '13:00', end: '14:00' }] },
          saturday: { start: '09:00', end: '18:00', isWorking: true, breaks: [{ start: '13:00', end: '14:00' }] },
          sunday: { start: '10:00', end: '16:00', isWorking: false, breaks: [] }
        },
        isActive: true,
        isPrimary: true
      },
      // Sofía: Sede Chapinero (todo el tiempo)
      {
        professionalId: professionals[2].id,
        branchId: branches[2].id,
        schedule: {
          monday: { start: '10:00', end: '19:00', isWorking: false, breaks: [] },
          tuesday: { start: '10:00', end: '19:00', isWorking: true, breaks: [{ start: '13:00', end: '14:00' }] },
          wednesday: { start: '10:00', end: '19:00', isWorking: true, breaks: [{ start: '13:00', end: '14:00' }] },
          thursday: { start: '10:00', end: '19:00', isWorking: true, breaks: [{ start: '13:00', end: '14:00' }] },
          friday: { start: '10:00', end: '20:00', isWorking: true, breaks: [{ start: '13:00', end: '14:00' }] },
          saturday: { start: '09:00', end: '18:00', isWorking: true, breaks: [{ start: '13:00', end: '14:00' }] },
          sunday: { start: '10:00', end: '16:00', isWorking: true, breaks: [{ start: '13:00', end: '14:00' }] }
        },
        isActive: true,
        isPrimary: true
      }
    ]);
    
    // ============================================
    // PROMOCIONES
    // ============================================
    await Promotion.bulkCreate([
      {
        name: 'Bienvenida Primera Cita',
        description: '20% de descuento en tu primera visita',
        code: 'BIENVENIDA20',
        type: 'percentage',
        value: 20,
        minPurchaseAmount: 30000,
        maxDiscountAmount: 50000,
        applicableTo: 'all',
        usageLimitPerClient: 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
        isPublic: true,
        requiresFirstVisit: true
      },
      {
        name: 'Martes de Uñas',
        description: '15% descuento en todos los servicios de uñas los martes',
        code: 'MARTESUÑAS15',
        type: 'percentage',
        value: 15,
        applicableTo: 'categories',
        applicableIds: ['nails'],
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
        isPublic: true
      },
      {
        name: 'Combo Novia Completo',
        description: 'Peinado + Maquillaje + Manicure + Pedicure + Pestañas por $450.000',
        code: 'NOVIA2024',
        type: 'fixed_amount',
        value: 450000,
        applicableTo: 'services',
        applicableIds: services.filter(s => ['hair', 'nails', 'eyelashes'].includes(s.category)).map(s => s.id),
        usageLimit: 50,
        usageLimitPerClient: 1,
        startDate: new Date(),
        endDate: new Date('2024-12-31'),
        isActive: true,
        isPublic: true
      },
      {
        name: 'Referido - Trae una Amiga',
        description: 'Ambas reciben $20.000 de crédito para su próxima cita',
        code: 'AMIGA20',
        type: 'fixed_amount',
        value: 20000,
        usageLimitPerClient: 5,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
        isPublic: true
      }
    ]);
    
    // ============================================
    // PROGRAMA DE LEALTAD
    // ============================================
    await LoyaltyProgram.create({
      name: 'Belleza Premium',
      description: 'Acumula puntos en cada visita y canjéalos por descuentos y servicios gratis',
      pointsPerCurrency: 1,
      currencyBase: 1000,
      tiers: [
        { name: 'bronze', minPoints: 0, benefits: ['Acumulas puntos en cada compra'], discountPercent: 0 },
        { name: 'silver', minPoints: 5000, benefits: ['5% descuento en todos los servicios', 'Prioridad en reservas', 'Regalo de cumpleaños'], discountPercent: 5 },
        { name: 'gold', minPoints: 15000, benefits: ['10% descuento en todos los servicios', '1 servicio gratis al mes', 'Prioridad máxima', 'Regalo de cumpleaños premium'], discountPercent: 10 },
        { name: 'platinum', minPoints: 30000, benefits: ['15% descuento en todos los servicios', '2 servicios gratis al mes', 'Acceso VIP', 'Regalo de cumpleaños premium', 'Asesoría de imagen gratuita'], discountPercent: 15 }
      ],
      pointsExpirationMonths: 12,
      isActive: true
    });
    
    // ============================================
    // CITAS DE EJEMPLO
    // ============================================
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = dayAfter.toISOString().split('T')[0];
    
    await Appointment.bulkCreate([
      {
        clientId: clients[0].id,
        professionalId: professionals[0].id,
        serviceId: services[4].id, // Manicure Semipermanente
        branchId: branches[0].id,
        date: tomorrowStr,
        startTime: '10:00:00',
        endTime: '11:00:00',
        duration: 60,
        status: 'confirmed',
        basePrice: 45000,
        discountAmount: 0,
        depositAmount: 15000,
        finalPrice: 45000,
        paymentStatus: 'partial',
        paymentMethod: 'mercadopago',
        notes: 'Cliente prefiere tonos nude',
        reminderSent: true
      },
      {
        clientId: clients[1].id,
        professionalId: professionals[1].id,
        serviceId: services[15].id, // Corte Mujer
        branchId: branches[0].id,
        date: tomorrowStr,
        startTime: '14:00:00',
        endTime: '15:00:00',
        duration: 60,
        status: 'confirmed',
        basePrice: 55000,
        discountAmount: 0,
        depositAmount: 0,
        finalPrice: 55000,
        paymentStatus: 'pending',
        notes: 'Corte en capas, mantener largo'
      },
      {
        clientId: clients[2].id,
        professionalId: professionals[2].id,
        serviceId: services[27].id, // Extensiones Clásicas
        branchId: branches[2].id,
        date: dayAfterStr,
        startTime: '09:00:00',
        endTime: '11:00:00',
        duration: 120,
        status: 'pending',
        basePrice: 90000,
        discountAmount: 0,
        depositAmount: 30000,
        finalPrice: 90000,
        paymentStatus: 'partial',
        paymentMethod: 'nequi'
      }
    ]);
    
    // ============================================
    // PAGOS DE EJEMPLO
    // ============================================
    const appointments = await Appointment.findAll();
    
    await Payment.bulkCreate([
      {
        appointmentId: appointments[0].id,
        clientId: clients[0].id,
        amount: 15000,
        type: 'deposit',
        method: 'mercadopago',
        status: 'completed',
        transactionId: 'MP_TEST_001',
        mercadopagoPaymentId: '123456789',
        paidAt: new Date()
      },
      {
        appointmentId: appointments[2].id,
        clientId: clients[2].id,
        amount: 30000,
        type: 'deposit',
        method: 'nequi',
        status: 'completed',
        transactionId: 'NEQUI_TEST_001',
        reference: 'NEQUI123456',
        paidAt: new Date()
      }
    ]);
    
    // ============================================
    // BLOQUEOS DE HORARIO
    // ============================================
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    
    const nextWeekEnd = new Date();
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 13);
    const nextWeekEndStr = nextWeekEnd.toISOString().split('T')[0];
    
    await ScheduleBlock.bulkCreate([
      {
        professionalId: professionals[0].id,
        branchId: branches[0].id,
        title: 'Vacaciones',
        description: 'Carolina de vacaciones',
        type: 'vacation',
        startDate: nextWeekStr,
        endDate: nextWeekEndStr,
        isActive: true
      },
      {
        professionalId: professionals[1].id,
        branchId: branches[0].id,
        title: 'Capacitación',
        description: 'Curso de colorimetría avanzada',
        type: 'meeting',
        startDate: tomorrowStr,
        endDate: tomorrowStr,
        startTime: '09:00:00',
        endTime: '13:00:00',
        isActive: true
      }
    ]);
    
    // ============================================
    // GALERÍA
    // ============================================
    await Gallery.bulkCreate([
      {
        title: 'Uñas Acrílicas Encapsuladas',
        description: 'Diseño con flores secas encapsuladas',
        image: 'https://images.unsplash.com/photo-1604654317421-3c1a4b3e8f6b?w=800',
        category: 'nails',
        tags: ['acrylic', 'encapsulated', 'flowers'],
        professionalId: professionals[0].id,
        serviceId: services[3].id,
        isFeatured: true,
        displayOrder: 1
      },
      {
        title: 'Manicure Semipermanente Nude',
        description: 'Tono nude elegante para oficina',
        image: 'https://images.unsplash.com/photo-1612817288484-6f9c9b0b8f6b?w=800',
        category: 'nails',
        tags: ['semipermanent', 'nude', 'elegant'],
        professionalId: professionals[0].id,
        serviceId: services[4].id,
        displayOrder: 2
      },
      {
        title: 'Corte en Capas con Ondas',
        description: 'Corte moderno con ondas suaves',
        image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
        category: 'hair',
        tags: ['cut', 'layers', 'waves'],
        professionalId: professionals[1].id,
        serviceId: services[15].id,
        isFeatured: true,
        displayOrder: 3
      },
      {
        title: 'Extensiones Volumen Ruso',
        description: 'Look dramático con volumen 4D',
        image: 'https://images.unsplash.com/photo-1594737625785-6f2b8b5e8f6b?w=800',
        category: 'eyelashes',
        tags: ['volume', 'russian', 'dramatic'],
        professionalId: professionals[2].id,
        serviceId: services[28].id,
        displayOrder: 4
      },
      {
        title: 'Peinado Novia Recogido',
        description: 'Recogido elegante con trenzas y accesorios',
        image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800',
        category: 'hair',
        tags: ['bridal', 'updo', 'elegant'],
        professionalId: professionals[1].id,
        serviceId: services[20].id,
        isFeatured: true,
        displayOrder: 5
      },
      {
        title: 'Nail Art Geométrico',
        description: 'Diseño geométrico en tonos dorados y negro',
        image: 'https://images.unsplash.com/photo-1604654317421-3c1a4b3e8f6b?w=800',
        category: 'nails',
        tags: ['nail_art', 'geometric', 'gold'],
        professionalId: professionals[0].id,
        serviceId: services[12].id,
        displayOrder: 6
      }
    ]);
    
    console.log('✅ Seed completado exitosamente');
    console.log('');
    console.log('📋 Credenciales de prueba:');
    console.log('   Admin: admin@salon.com / 123456');
    console.log('   Cliente: maria@email.com / 123456');
    console.log('   Profesional: caro@salon.com / 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

seed();