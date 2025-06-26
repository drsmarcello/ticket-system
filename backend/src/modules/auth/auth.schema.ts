import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type AuthPayload {
    token: String!
    user: User!
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
    refreshToken: AuthPayload!
  }
`;