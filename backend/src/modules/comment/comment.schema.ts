import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Comment {
    id: ID!
    ticket: Ticket!
    user: User!
    content: String!
    isInternal: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input CommentCreateInput {
    ticketId: ID!
    content: String!
    isInternal: Boolean
  }

  input CommentUpdateInput {
    content: String
    isInternal: Boolean
  }

  extend type Query {
    comments(ticketId: ID!): [Comment!]!
    comment(id: ID!): Comment
  }

  extend type Mutation {
    createComment(data: CommentCreateInput!): Comment!
    updateComment(id: ID!, data: CommentUpdateInput!): Comment!
    deleteComment(id: ID!): Comment!
  }
`;
