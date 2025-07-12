// backend/src/modules/auth/auth.resolvers.ts - CLEAN VERSION
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { Context } from '../../app';
import { validateEmail, validatePassword } from '../../utils/validation';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/auditLog';

// 🔐 Token Generation
const generateAccessToken = (userId: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(
    { userId }, // ⚡ OHNE type field für Kompatibilität
    secret,
    { expiresIn: '8h' }
  );
};

const generateRefreshToken = (userId: string) => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  return jwt.sign(
    { userId, type: 'refresh' },
    refreshSecret,
    { expiresIn: '7d' }
  );
};

// 🛡️ Refresh Token Verification
const verifyRefreshToken = (token: string) => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  try {
    const decoded = jwt.verify(token, refreshSecret) as any;
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new AuthenticationError('Invalid refresh token');
  }
};

// 🌐 Request Info für Audit Logging
const getRequestInfo = (context: any) => {
  const req = context.req;
  return {
    ipAddress: req?.ip || req?.connection?.remoteAddress || 'unknown',
    userAgent: req?.headers?.['user-agent'] || 'unknown'
  };
};

export const resolvers = {
  Query: {
    _authQuery: () => true,
  },
  
  Mutation: {
    login: async (_: any, args: { data: any }, context: Context) => {
      const { email, password } = args.data;
      const { prisma } = context;
      const requestInfo = getRequestInfo(context);
      
      if (!validateEmail(email)) {
        throw new UserInputError('Invalid email format');
      }
      
      try {
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        
        if (!user) {
          await logAuditEvent(prisma, {
            userId: 'anonymous',
            action: AUDIT_ACTIONS.LOGIN_FAILED,
            resource: AUDIT_RESOURCES.AUTH,
            details: { email, reason: 'User not found' },
            ...requestInfo
          });
          throw new AuthenticationError('Invalid credentials');
        }
        
        if (!user.isActive) {
          await logAuditEvent(prisma, {
            userId: user.id,
            action: AUDIT_ACTIONS.LOGIN_FAILED,
            resource: AUDIT_RESOURCES.AUTH,
            details: { email, reason: 'Account deactivated' },
            ...requestInfo
          });
          throw new AuthenticationError('Account is deactivated');
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          await logAuditEvent(prisma, {
            userId: user.id,
            action: AUDIT_ACTIONS.LOGIN_FAILED,
            resource: AUDIT_RESOURCES.AUTH,
            details: { email, reason: 'Invalid password' },
            ...requestInfo
          });
          throw new AuthenticationError('Invalid credentials');
        }
        
        // 🔑 Generate tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        
        // 💾 Update user
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            lastLogin: new Date(),
            refreshToken 
          },
        });
        
        // 📝 Audit: Successful login
        await logAuditEvent(prisma, {
          userId: user.id,
          action: AUDIT_ACTIONS.LOGIN_SUCCESS,
          resource: AUDIT_RESOURCES.AUTH,
          details: { email },
          ...requestInfo
        });
        
        return {
          accessToken,
          refreshToken,
          user: {
            ...user,
            password: undefined,
            refreshToken: undefined,
          },
        };
      } catch (error) {
        if (error instanceof AuthenticationError || error instanceof UserInputError) {
          throw error;
        }
        throw new Error('Login failed');
      }
    },
    
    register: async (_: any, args: { data: any }, context: Context) => {
      const { name, email, password } = args.data;
      const { prisma } = context;
      const requestInfo = getRequestInfo(context);
      
      if (!validateEmail(email)) {
        throw new UserInputError('Invalid email format');
      }
      
      if (!validatePassword(password)) {
        throw new UserInputError('Password must be at least 8 characters long');
      }
      
      if (!name || name.trim().length < 2) {
        throw new UserInputError('Name must be at least 2 characters long');
      }
      
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        
        if (existingUser) {
          throw new UserInputError('User with this email already exists');
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const user = await prisma.user.create({
          data: {
            name: name.trim(),
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'CUSTOMER',
          },
        });
        
        // 🔑 Generate tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        
        // 💾 Store refresh token
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken },
        });
        
        // 📝 Audit: Registration
        await logAuditEvent(prisma, {
          userId: user.id,
          action: AUDIT_ACTIONS.REGISTER,
          resource: AUDIT_RESOURCES.USER,
          details: { email, name: name.trim() },
          ...requestInfo
        });
        
        return {
          accessToken,
          refreshToken,
          user: {
            ...user,
            password: undefined,
            refreshToken: undefined,
          },
        };
      } catch (error) {
        if (error instanceof UserInputError) {
          throw error;
        }
        throw new Error('Registration failed');
      }
    },
    
    refreshToken: async (_: any, args: { refreshToken: string }, context: Context) => {
      const { refreshToken } = args;
      const { prisma } = context;
      const requestInfo = getRequestInfo(context);
      
      if (!refreshToken) {
        throw new AuthenticationError('Refresh token required');
      }
      
      try {
        const decoded = verifyRefreshToken(refreshToken);
        
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        });
        
        if (!user || !user.isActive) {
          throw new AuthenticationError('User not found or deactivated');
        }
        
        if (user.refreshToken !== refreshToken) {
          await logAuditEvent(prisma, {
            userId: user.id,
            action: AUDIT_ACTIONS.LOGIN_FAILED,
            resource: AUDIT_RESOURCES.AUTH,
            details: { reason: 'Invalid refresh token' },
            ...requestInfo
          });
          throw new AuthenticationError('Invalid refresh token');
        }
        
        // Generate new tokens
        const newAccessToken = generateAccessToken(user.id);
        const newRefreshToken = generateRefreshToken(user.id);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: newRefreshToken },
        });
        
        await logAuditEvent(prisma, {
          userId: user.id,
          action: AUDIT_ACTIONS.TOKEN_REFRESH,
          resource: AUDIT_RESOURCES.AUTH,
          details: {},
          ...requestInfo
        });
        
        return {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user: {
            ...user,
            password: undefined,
            refreshToken: undefined,
          },
        };
      } catch (error) {
        if (error instanceof AuthenticationError) {
          throw error;
        }
        throw new AuthenticationError('Token refresh failed');
      }
    },
    
    logout: async (_: any, __: any, context: Context) => {
      const { prisma, user } = context;
      const requestInfo = getRequestInfo(context);
      
      if (!user) {
        throw new AuthenticationError('Authentication required');
      }
      
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: null },
      });
      
      await logAuditEvent(prisma, {
        userId: user.id,
        action: AUDIT_ACTIONS.LOGOUT,
        resource: AUDIT_RESOURCES.AUTH,
        details: {},
        ...requestInfo
      });
      
      return { success: true, message: 'Logged out successfully' };
    },
  },
};