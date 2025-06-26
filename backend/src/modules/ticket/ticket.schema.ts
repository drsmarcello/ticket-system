import { gql } from 'graphql-tag';

export const typeDefs = gql`

  input TicketFilters {
    status: TicketStatus  # Kann auch "NOT_CLOSED" als String sein
    priority: TicketPriority
    assignedToId: ID
    companyId: ID
    createdById: ID
  }
    
  enum TicketStatus {
    NEW
    IN_PROGRESS
    WAITING_FOR_CUSTOMER
    COMPLETED
    CLOSED
  }

  enum TicketPriority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  enum ActivityType {
    CREATED
    COMMENT
    STATUS_CHANGE
    PRIORITY_CHANGE
    ASSIGNMENT_CHANGE
    TIME_LOGGED
  }

  type History {
    id: ID!
    ticket: Ticket!
    user: User
    type: ActivityType!
    oldValue: String
    newValue: String
    message: String!
    createdAt: String!
  }

  type Ticket {
    id: ID!
    title: String!
    description: String!
    company: Company!
    contact: Contact!
    assignedTo: User
    createdBy: User
    status: TicketStatus!
    priority: TicketPriority!
    estimatedMinutes: Int
    createdAt: String!
    updatedAt: String!
    
    # Relations
    timeEntries: [TimeEntry!]!
    comments: [Comment!]!
    histories: [History!]!
  }

  input TicketCreateInput {
    title: String!
    description: String!
    companyId: ID!
    contactId: ID!
    assignedToId: ID
    priority: TicketPriority
    estimatedMinutes: Int
  }

  input TicketUpdateInput {
    title: String
    description: String
    status: TicketStatus
    priority: TicketPriority
    assignedToId: ID
    companyId: ID
    contactId: ID
    estimatedMinutes: Int
  }

  input TicketFilters {
    status: TicketStatus
    priority: TicketPriority
    assignedToId: ID
    companyId: ID
    createdById: ID
  }

  type Query {
    tickets(filters: TicketFilters, limit: Int, offset: Int): [Ticket!]!
    ticket(id: ID!): Ticket
    myTickets: [Ticket!]!
    myAssignedTickets: [Ticket!]!
  }

  type Mutation {
    createTicket(data: TicketCreateInput!): Ticket!
    updateTicket(id: ID!, data: TicketUpdateInput!): Ticket!
    assignTicket(id: ID!, assignedToId: ID!): Ticket!
    deleteTicket(id: ID!): Ticket!
  }
`;