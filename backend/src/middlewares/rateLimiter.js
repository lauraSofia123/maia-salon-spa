import dotenv from 'dotenv';

dotenv.config();

const rateLimitStore = new Map();

const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

cleanupInterval.unref();

export const rateLimit = (options = {}) => {
  const {
    windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    keyGenerator = (req) => req.ip,
    skip = () => false,
    message = 'Demasiadas solicitudes, por favor intente más tarde',
    code = 'RATE_LIMIT_EXCEEDED'
  } = options;
  
  return (req, res, next) => {
    if (skip(req)) {
      return next();
    }
    
    const key = keyGenerator(req);
    const now = Date.now();
    
    let record = rateLimitStore.get(key);
    
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs
      };
      rateLimitStore.set(key, record);
    }
    
    record.count++;
    
    const remaining = Math.max(0, maxRequests - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);
    
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': remaining,
      'X-RateLimit-Reset': resetSeconds
    });
    
    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message,
        code,
        retryAfter: resetSeconds
      });
    }
    
    next();
  };
};

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  keyGenerator: (req) => `auth:${req.ip}`,
  message: 'Demasiados intentos de inicio de sesión, intente en 15 minutos'
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  keyGenerator: (req) => `api:${req.ip}`
});

export const bookingRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  maxRequests: 30,
  keyGenerator: (req) => `booking:${req.userId || req.ip}`,
  message: 'Demasiadas reservas en poco tiempo, intente más tarde'
});

export default { rateLimit, authRateLimit, apiRateLimit, bookingRateLimit };