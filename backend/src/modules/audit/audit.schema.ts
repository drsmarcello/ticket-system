import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar DateTime

  type AuditLog {
    id: ID!
    userId: String!
    action: String!
    resource: String!
    details: String
    ipAddress: String
    userAgent: String
    timestamp: DateTime!
    user: User
  }

  input AuditLogFiltersInput {
    action: String
    resource: String
    timeRange: String
    userEmail: String
    ipAddress: String
  }

  extend type Query {
    auditLogs(
      filters: AuditLogFiltersInput
      limit: Int = 50
      offset: Int = 0
    ): [AuditLog!]!
  }
`;