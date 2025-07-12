import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # 🔄 Updated AuthPayload mit beiden Tokens + Rückwärts-Kompatibilität
  type AuthPayload {
   accessToken: String!
   refreshToken: String!
   user: User!
  }
  
  # 🚪 Logout Response
  type LogoutResponse {
    success: Boolean!
    message: String!
  }
  
  input LoginInput {
    email: String!
    password: String!
  }
  
  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }
  
  extend type Query {
    # Placeholder für Auth-Queries falls benötigt
    _authQuery: Boolean
  }
  
  extend type Mutation {
    login(data: LoginInput!): AuthPayload!
    register(data: RegisterInput!): AuthPayload!
    # 🔄 Updated refreshToken mit Parameter
    refreshToken(refreshToken: String!): AuthPayload!
    # 🚪 NEW: Logout
    logout: LogoutResponse!
  }
`;