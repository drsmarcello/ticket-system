// backend/src/utils/rateLimiter.ts
import rateLimit from 'express-rate-limit';

// Helper function to create rate limiters
const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      console.log(`⚠️  Rate limit exceeded for IP: ${ip}, Path: ${req.path}`);
      res.status(429).json({ error: message });
    },
    skip: (req) => {
      // Skip rate limiting for internal Docker calls
      const ip = req.ip || req.connection.remoteAddress || '';
      return ip === '127.0.0.1' || 
             ip.startsWith('172.') || 
             ip.startsWith('192.168.') ||
             ip === '::1';
    }
  });
};

// 🔐 Login/Auth specific rate limiter (stricter)
export const loginLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // 10 attempts per 15 min (weniger aggressiv als vorher)
  'Too many authentication attempts, please try again later'
);

// 📊 General GraphQL rate limiter
export const graphqlLimiter = createRateLimiter(
  1 * 60 * 1000, // 1 minute
  200, // 200 GraphQL requests per minute
  'GraphQL rate limit exceeded'
);

// 🌐 General API rate limiter
export const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  1000, // 1000 requests per 15 min
  'Too many requests, please try again later'
);