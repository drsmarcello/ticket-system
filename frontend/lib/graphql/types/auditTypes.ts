export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface AuditLogsResponse {
  auditLogs: AuditLog[];
}