import Joi from 'joi';

export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors
      });
    }
    
    req[property] = value;
    next();
  };
};

export const schemas = {
  // Auth
  register: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'any.required': 'El nombre es obligatorio'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Email inválido',
      'any.required': 'El email es obligatorio'
    }),
    password: Joi.string().min(6).max(50).required().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.max': 'La contraseña no puede exceder 50 caracteres',
      'any.required': 'La contraseña es obligatoria'
    }),
    phone: Joi.string().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/).optional().messages({
      'string.pattern.base': 'Formato de teléfono inválido'
    }),
    dateOfBirth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('female', 'male', 'other', 'prefer_not_to_say').optional()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
  }),
  
  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),
  
  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).max(50).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Las contraseñas no coinciden'
    })
  }),
  
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(50).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  }),
  
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/).optional().allow(''),
    dateOfBirth: Joi.date().max('now').optional().allow(null),
    gender: Joi.string().valid('female', 'male', 'other', 'prefer_not_to_say').optional().allow(null),
    address: Joi.string().max(500).optional().allow(''),
    city: Joi.string().max(100).optional().allow(''),
    preferences: Joi.object({
      notifications: Joi.object({
        email: Joi.boolean().optional(),
        whatsapp: Joi.boolean().optional(),
        sms: Joi.boolean().optional()
      }).optional(),
      reminders: Joi.object({
        hoursBefore: Joi.number().integer().min(1).max(168).optional()
      }).optional()
    }).optional()
  }),
  
  // Services
  createService: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(1000).optional().allow(''),
    category: Joi.string().valid('nails', 'hair', 'eyelashes', 'other').required(),
    subcategory: Joi.string().max(50).optional().allow(''),
    price: Joi.number().positive().precision(2).required(),
    duration: Joi.number().integer().min(5).max(480).required(),
    isPopular: Joi.boolean().optional(),
    displayOrder: Joi.number().integer().min(0).optional(),
    requiresProfessional: Joi.boolean().optional(),
    bufferTime: Joi.number().integer().min(0).max(60).optional()
  }),
  
  updateService: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(1000).optional().allow(''),
    category: Joi.string().valid('nails', 'hair', 'eyelashes', 'other').optional(),
    subcategory: Joi.string().max(50).optional().allow(''),
    price: Joi.number().positive().precision(2).optional(),
    duration: Joi.number().integer().min(5).max(480).optional(),
    isActive: Joi.boolean().optional(),
    isPopular: Joi.boolean().optional(),
    displayOrder: Joi.number().integer().min(0).optional(),
    requiresProfessional: Joi.boolean().optional(),
    bufferTime: Joi.number().integer().min(0).max(60).optional()
  }),
  
  // Branches
  createBranch: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    slug: Joi.string().min(2).max(100).pattern(/^[a-z0-9-]+$/).required(),
    description: Joi.string().max(1000).optional().allow(''),
    address: Joi.string().min(5).max(500).required(),
    city: Joi.string().min(2).max(100).required(),
    state: Joi.string().max(100).optional().allow(''),
    postalCode: Joi.string().max(20).optional().allow(''),
    phone: Joi.string().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/).required(),
    email: Joi.string().email().optional().allow(''),
    latitude: Joi.number().precision(8).optional(),
    longitude: Joi.number().precision(8).optional(),
    openingHours: Joi.object({
      monday: Joi.object({ open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), isClosed: Joi.boolean().required() }).required(),
      tuesday: Joi.object({ open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), isClosed: Joi.boolean().required() }).required(),
      wednesday: Joi.object({ open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), isClosed: Joi.boolean().required() }).required(),
      thursday: Joi.object({ open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), isClosed: Joi.boolean().required() }).required(),
      friday: Joi.object({ open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), isClosed: Joi.boolean().required() }).required(),
      saturday: Joi.object({ open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), isClosed: Joi.boolean().required() }).required(),
      sunday: Joi.object({ open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), isClosed: Joi.boolean().required() }).required()
    }).optional(),
    timezone: Joi.string().max(50).optional()
  }),
  
  // Professionals
  createProfessional: Joi.object({
    userId: Joi.number().integer().positive().required(),
    bio: Joi.string().max(2000).optional().allow(''),
    specialties: Joi.array().items(Joi.string()).optional(),
    experienceYears: Joi.number().integer().min(0).max(50).optional(),
    commissionRate: Joi.number().precision(2).min(0).max(100).optional()
  }),
  
  updateProfessional: Joi.object({
    bio: Joi.string().max(2000).optional().allow(''),
    specialties: Joi.array().items(Joi.string()).optional(),
    experienceYears: Joi.number().integer().min(0).max(50).optional(),
    isActive: Joi.boolean().optional(),
    isFeatured: Joi.boolean().optional(),
    displayOrder: Joi.number().integer().min(0).optional(),
    commissionRate: Joi.number().precision(2).min(0).max(100).optional()
  }),
  
  // Professional Services
  assignService: Joi.object({
    professionalId: Joi.number().integer().positive().required(),
    serviceId: Joi.number().integer().positive().required(),
    customPrice: Joi.number().positive().precision(2).optional(),
    customDuration: Joi.number().integer().min(5).max(480).optional()
  }),
  
  // Professional Branches
  assignBranch: Joi.object({
    professionalId: Joi.number().integer().positive().required(),
    branchId: Joi.number().integer().positive().required(),
    schedule: Joi.object({
      monday: Joi.object({ start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), isWorking: Joi.boolean().required(), breaks: Joi.array().items(Joi.object({ start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required() })).optional() }).required(),
      tuesday: Joi.object({ start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), isWorking: Joi.boolean().required(), breaks: Joi.array().items(Joi.object({ start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required() })).optional() }).required(),
      wednesday: Joi.object({ start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), isWorking: Joi.boolean().required(), breaks: Joi.array().items(Joi.object({ start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required() })).optional() }).required(),
      thursday: Joi.object({ start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), isWorking: Joi.boolean().required(), breaks: Joi.array().items(Joi.object({ start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required() })).optional() }).required(),
      friday: Joi.object({ start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), isWorking: Joi.boolean().required(), breaks: Joi.array().items(Joi.object({ start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required() })).optional() }).required(),
      saturday: Joi.object({ start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), isWorking: Joi.boolean().required(), breaks: Joi.array().items(Joi.object({ start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required() })).optional() }).required(),
      sunday: Joi.object({ start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), isWorking: Joi.boolean().required(), breaks: Joi.array().items(Joi.object({ start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required() })).optional() }).required()
    }).required(),
    isPrimary: Joi.boolean().optional()
  }),
  
  // Appointments
  createAppointment: Joi.object({
    serviceId: Joi.number().integer().positive().required(),
    professionalId: Joi.number().integer().positive().required(),
    branchId: Joi.number().integer().positive().required(),
    date: Joi.date().min('now').required(),
    startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    couponCode: Joi.string().max(50).optional().allow(''),
    notes: Joi.string().max(500).optional().allow('')
  }),
  
  updateAppointment: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled').optional(),
    notes: Joi.string().max(500).optional().allow(''),
    clientNotes: Joi.string().max(500).optional().allow(''),
    cancellationReason: Joi.string().max(500).optional().allow('')
  }),
  
  rescheduleAppointment: Joi.object({
    newDate: Joi.date().min('now').required(),
    newStartTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    newProfessionalId: Joi.number().integer().positive().optional(),
    newBranchId: Joi.number().integer().positive().optional()
  }),
  
  // Availability query
  checkAvailability: Joi.object({
    serviceId: Joi.number().integer().positive().required(),
    professionalId: Joi.number().integer().positive().required(),
    branchId: Joi.number().integer().positive().required(),
    date: Joi.date().min('now').required()
  }),
  
  // Promotions
  createPromotion: Joi.object({
    name: Joi.string().min(2).max(150).required(),
    description: Joi.string().max(1000).optional().allow(''),
    code: Joi.string().max(50).pattern(/^[A-Z0-9_-]+$/).optional(),
    type: Joi.string().valid('percentage', 'fixed_amount', 'buy_x_get_y', 'free_service').required(),
    value: Joi.number().positive().precision(2).required(),
    minPurchaseAmount: Joi.number().min(0).precision(2).optional(),
    maxDiscountAmount: Joi.number().positive().precision(2).optional(),
    applicableTo: Joi.string().valid('all', 'services', 'categories', 'professionals', 'branches').optional(),
    applicableIds: Joi.array().items(Joi.number().integer().positive()).optional(),
    usageLimit: Joi.number().integer().positive().optional(),
    usageLimitPerClient: Joi.number().integer().positive().optional(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    isPublic: Joi.boolean().optional(),
    requiresFirstVisit: Joi.boolean().optional()
  }),
  
  // Payments
  createPayment: Joi.object({
    appointmentId: Joi.number().integer().positive().required(),
    amount: Joi.number().positive().precision(2).required(),
    type: Joi.string().valid('deposit', 'full', 'partial', 'refund').required(),
    method: Joi.string().valid('cash', 'card', 'transfer', 'mercadopago', 'nequi', 'daviplata', 'other').required(),
    reference: Joi.string().max(255).optional().allow('')
  }),
  
  // Gallery
  createGallery: Joi.object({
    title: Joi.string().max(150).optional().allow(''),
    description: Joi.string().max(1000).optional().allow(''),
    category: Joi.string().valid('nails', 'hair', 'eyelashes', 'salon', 'team', 'other').optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    professionalId: Joi.number().integer().positive().optional(),
    serviceId: Joi.number().integer().positive().optional(),
    branchId: Joi.number().integer().positive().optional(),
    isFeatured: Joi.boolean().optional(),
    displayOrder: Joi.number().integer().min(0).optional()
  }),
  
  // Reviews
  createReview: Joi.object({
    appointmentId: Joi.number().integer().positive().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(1000).optional().allow(''),
    images: Joi.array().items(Joi.string().uri()).optional()
  }),
  
  // Schedule Blocks
  createScheduleBlock: Joi.object({
    professionalId: Joi.number().integer().positive().required(),
    branchId: Joi.number().integer().positive().optional(),
    title: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional().allow(''),
    type: Joi.string().valid('vacation', 'break', 'meeting', 'personal', 'maintenance', 'other').optional(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    isRecurring: Joi.boolean().optional(),
    recurrencePattern: Joi.object({
      frequency: Joi.string().valid('daily', 'weekly', 'monthly').optional(),
      days: Joi.array().items(Joi.number().integer().min(0).max(6)).optional()
    }).optional()
  }),
  
  // Query params
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  serviceQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
    category: Joi.string().valid('nails', 'hair', 'eyelashes', 'other').optional(),
    isActive: Joi.boolean().optional(),
    isPopular: Joi.boolean().optional(),
    search: Joi.string().max(100).optional()
  }),

  professionalQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
    isActive: Joi.boolean().optional(),
    isFeatured: Joi.boolean().optional(),
    category: Joi.string().optional(),
    search: Joi.string().max(100).optional()
  }),
  
  dateRange: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().min(Joi.ref('startDate')).optional()
  }),
  
  // ID param
  idParam: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  
  uuidParam: Joi.object({
    uuid: Joi.string().uuid().required()
  })
};

export default { validate, schemas };