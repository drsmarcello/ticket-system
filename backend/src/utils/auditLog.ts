import { PrismaClient } from '@prisma/client';

export interface AuditLogData {
  userId: string;
  action: string;
  resource: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAuditEvent(
  prisma: PrismaClient,
  data: AuditLogData
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        details: data.details ? JSON.stringify(data.details) : null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        timestamp: new Date()
      }
    });
  } catch (error) {
    // Don't let audit logging break the main operation
    console.error('Failed to log audit event:', error);
  }
}

// 🎯 Predefined audit actions
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  
  // User Management
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  USER_DEACTIVATE: 'USER_DEACTIVATE',
  
  // Tickets
  TICKET_CREATE: 'TICKET_CREATE',
  TICKET_UPDATE: 'TICKET_UPDATE',
  TICKET_DELETE: 'TICKET_DELETE',
  TICKET_STATUS_CHANGE: 'TICKET_STATUS_CHANGE',
  
  // Companies
  COMPANY_CREATE: 'COMPANY_CREATE',
  COMPANY_UPDATE: 'COMPANY_UPDATE',
  COMPANY_DELETE: 'COMPANY_DELETE',
} as const;

export const AUDIT_RESOURCES = {
  USER: 'USER',
  TICKET: 'TICKET',
  COMPANY: 'COMPANY',
  AUTH: 'AUTH',
  COMMENT: 'COMMENT',
  TIME_ENTRY: 'TIME_ENTRY',
} as const;