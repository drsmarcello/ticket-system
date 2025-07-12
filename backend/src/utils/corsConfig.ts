// backend/src/utils/corsConfig.ts
import { CorsOptions } from 'cors';

const corsOrigins = process.env.CORS_ORIGINS?.split(',').map(origin => origin.trim()) || [
  'https://utilbox.de',
  'https://api.utilbox.de'
];

// Add development origins if not in production
if (process.env.NODE_ENV !== 'production') {
  corsOrigins.push('http://localhost:3000', 'http://localhost:5173');
}

export const corsConfig: CorsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = corsOrigins.includes(origin);
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS blocked origin: ${origin}. Allowed: ${corsOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-apollo-operation-name',
    'apollo-require-preflight'
  ],
  maxAge: 86400 // 24 hours for preflight cache
};

export { corsOrigins };