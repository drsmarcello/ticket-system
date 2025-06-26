// modules/user/user.schema.ts
import { gql } from 'graphql-tag';

export const typeDefs = gql`
  enum Role {
    ADMIN
    EMPLOYEE
    CUSTOMER
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    isActive: Boolean!
    lastLogin: String
    createdAt: String!
    updatedAt: String!
    # Passwort wird NIEMALS im Schema exposed
    
    # Relations
    assignedTickets: [Ticket!]!
    createdTickets: [Ticket!]!
    timeEntries: [TimeEntry!]!
    comments: [Comment!]!
  }

  input UserCreateInput {
    name: String!
    email: String!
    password: String!
    role: Role!
  }

  input UserUpdateInput {
    name: String
    email: String
    password: String
    role: Role
    isActive: Boolean
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    me: User
  }

  type Mutation {
    createUser(data: UserCreateInput!): User!
    updateUser(id: ID!, data: UserUpdateInput!): User!
    deleteUser(id: ID!): User!
    updateProfile(data: UserUpdateInput!): User!
  }
`;