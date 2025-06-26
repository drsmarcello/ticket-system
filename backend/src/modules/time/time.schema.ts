import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type TimeEntry {
    id: ID!
    ticket: Ticket!
    user: User!
    description: String!
    startTime: String!
    endTime: String!
    duration: Int!
    billable: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input TimeEntryCreateInput {
    ticketId: ID!
    description: String!
    startTime: String!
    endTime: String!
    billable: Boolean
  }

  input TimeEntryUpdateInput {
    description: String
    startTime: String
    endTime: String
    billable: Boolean
  }

  input TimeEntryFilters {
    userId: ID
    ticketId: ID
    from: String
    to: String
    billable: Boolean
  }

  extend type Query {
    timeEntries(filters: TimeEntryFilters, limit: Int, offset: Int): [TimeEntry!]!
    timeEntry(id: ID!): TimeEntry
    myTimeEntries(from: String, to: String): [TimeEntry!]!
  }

  extend type Mutation {
    createTimeEntry(data: TimeEntryCreateInput!): TimeEntry!
    updateTimeEntry(id: ID!, data: TimeEntryUpdateInput!): TimeEntry!
    deleteTimeEntry(id: ID!): TimeEntry!
  }
`;