import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { mergeResolvers } from '@graphql-tools/merge';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// 🎯 Importiere ausgelagerte Konfigurationen
import { corsConfig, corsOrigins } from './utils/corsConfig';
import { loginLimiter, graphqlLimiter } from './utils/rateLimiter';

import { typeDefs as companyTypeDefs } from './modules/company/company.schema';
import { resolvers as companyResolvers } from './modules/company/company.resolvers';

import { typeDefs as ticketTypeDefs } from './modules/ticket/ticket.schema';
import { resolvers as ticketResolvers } from './modules/ticket/ticket.resolvers';

import { typeDefs as userTypeDefs } from './modules/user/user.schema';
import { resolvers as userResolvers } from './modules/user/user.resolvers';

import { typeDefs as timeEntryTypeDefs } from './modules/time/time.schema';
import { resolvers as timeEntryResolvers } from './modules/time/time.resolvers';

import { typeDefs as commentTypeDefs } from './modules/comment/comment.schema';
import { resolvers as commentResolvers } from './modules/comment/comment.resolvers';

import { typeDefs as authTypeDefs } from './modules/auth/auth.schema';
import { resolvers as authResolvers } from './modules/auth/auth.resolvers';

const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  } | null;
}

const authenticateUser = async (token: string) => {
  try {
    if (!token) return null;
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, name: true, isActive: true }
    });
    
    if (!user || !user.isActive) return null;
    
    return user;
  } catch (error) {
    return null;
  }
};

async function startServer() {
  const app = express();
  
  // 🛡️ Security Headers
  app.use(helmet());
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  }));

  app.disable('x-powered-by');
  app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
  app.use(helmet.permittedCrossDomainPolicies());
  app.use(helmet.noSniff());
  app.use(helmet.frameguard({ action: 'deny' }));
  app.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  }));

  const httpServer = http.createServer(app);

  // 🌐 CORS - jetzt ausgelagert!
  app.use(cors(corsConfig));

  // 🚦 Rate Limiting - jetzt verbessert!
  app.use('/graphql', (req, res, next) => {
    const query = req.body?.query || '';
    // Spezielle Rate Limits für Auth Operations
    if (query.includes('login') || query.includes('register')) {
      return loginLimiter(req, res, next);
    }
    // Standard GraphQL Rate Limit
    return graphqlLimiter(req, res, next);
  });

  // 🏥 Health Check
  app.get('/health', (_req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime())
    });
  });

  // 📊 GraphQL Schema
  const typeDefs = mergeTypeDefs([
    companyTypeDefs,
    ticketTypeDefs,
    userTypeDefs,
    timeEntryTypeDefs,
    commentTypeDefs,
    authTypeDefs,
  ]);

  const resolvers = mergeResolvers([
    companyResolvers,
    ticketResolvers,
    userResolvers,
    timeEntryResolvers,
    commentResolvers,
    authResolvers,
  ]);

  // 🚀 Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }): Promise<Context> => {
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      const user = await authenticateUser(token);
      
      return {
        prisma,
        user,
      };
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV !== 'production',
    formatError: (error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('GraphQL Error:', error);
      }
      return {
        message: error.message,
        ...(process.env.NODE_ENV !== 'production' && {
          locations: error.locations,
          path: error.path,
        }),
      };
    },
  });

  await server.start();
  server.applyMiddleware({ 
    app: app as any, 
    path: '/graphql'
  });

  const PORT = process.env.PORT || 4000;

  await new Promise<void>(resolve => {
    httpServer.listen({ port: PORT }, resolve);
  });

  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  console.log(`🔧 CORS configured for: ${corsOrigins.join(', ')}`);
  console.log(`❤️  Health check available at http://localhost:${PORT}/health`);
}

startServer().catch(error => {
  console.error('Error starting server:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});