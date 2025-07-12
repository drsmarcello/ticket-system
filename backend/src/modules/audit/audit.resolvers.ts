import { Context } from '../../app';
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';

export const resolvers = {
  Query: {
    auditLogs: async (
      _: any,
      args: {
        filters?: {
          action?: string;
          resource?: string;
          timeRange?: string;
          userEmail?: string;
          ipAddress?: string;
        };
        limit?: number;
        offset?: number;
      },
      { prisma, user }: Context
    ) => {
      // 🛡️ Nur Admins können Audit Logs einsehen
      if (!user) {
        throw new AuthenticationError('Authentication required');
      }

      if (user.role !== 'ADMIN') {
        throw new ForbiddenError('Admin access required');
      }

      const { filters = {}, limit = 50, offset = 0 } = args;

      // 🔍 Build where clause
      const where: any = {};

      if (filters.action) {
        where.action = filters.action;
      }

      if (filters.resource) {
        where.resource = filters.resource;
      }

      if (filters.ipAddress) {
        where.ipAddress = {
          contains: filters.ipAddress,
        };
      }

      if (filters.userEmail) {
        where.user = {
          email: {
            contains: filters.userEmail,
            mode: 'insensitive',
          },
        };
      }

      // 📅 Time Range Filter
      if (filters.timeRange) {
        const now = new Date();
        let startDate: Date;

        switch (filters.timeRange) {
          case '1h':
            startDate = new Date(now.getTime() - 1 * 60 * 60 * 1000);
            break;
          case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0); // All time
        }

        where.timestamp = {
          gte: startDate,
        };
      }

      // 📊 Fetch audit logs
      const auditLogs = await prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: Math.min(limit, 500), // Max 500 entries
        skip: offset,
      });

      return auditLogs;
    },
  },

  AuditLog: {
    // 👤 User resolver für anonyme Logs
    user: async (parent: any) => {
      if (parent.userId === 'anonymous') {
        return null;
      }
      
      // User ist bereits über include geladen
      return parent.user;
    },
  },
};