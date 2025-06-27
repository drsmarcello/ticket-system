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

  input PasswordUpdateInput {
  currentPassword: String!
  newPassword: String!
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
    updatePassword(data: PasswordUpdateInput!): User!

  }
`;