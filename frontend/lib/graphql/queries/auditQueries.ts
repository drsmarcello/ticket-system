export const GET_AUDIT_LOGS = `
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