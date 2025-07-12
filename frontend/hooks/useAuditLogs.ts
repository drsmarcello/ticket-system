// frontend/src/hooks/useAuditLogs.ts
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/graphql";

// 🎯 Types definieren
interface AuditLog {
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

interface AuditLogsResponse {
  auditLogs: AuditLog[];
}

interface AuditLogsFilters {
  action?: string;
  resource?: string;
  timeRange?: string;
  userEmail?: string;
  ipAddress?: string;
  limit?: number;
  offset?: number;
}

// 📝 GraphQL Query direkt im Hook
const GET_AUDIT_LOGS = `
  query GetAuditLogs($filters: AuditLogFiltersInput, $limit: Int, $offset: Int) {
    auditLogs(filters: $filters, limit: $limit, offset: $offset) {
      id
      userId
      action
      resource
      details
      ipAddress
      userAgent
      timestamp
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export function useAuditLogs(filters: AuditLogsFilters = {}) {
  return useQuery<AuditLogsResponse>({
    queryKey: ["auditLogs", filters],
    queryFn: () =>
      client.request(GET_AUDIT_LOGS, {
        filters: {
          action: filters.action || undefined,
          resource: filters.resource || undefined,
          timeRange: filters.timeRange || undefined,
          userEmail: filters.userEmail || undefined,
          ipAddress: filters.ipAddress || undefined,
        },
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      }),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });
}