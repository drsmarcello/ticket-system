import { gql } from 'graphql-tag';

export const typeDefs = gql`
    type Company {
        id: ID!
        name: String!
        email: String!
        phone: String
        address: String
        primaryContact: Contact
        contacts: [Contact!]!
        tickets: [Ticket!]!
    }
        
    type Contact {
        id: ID!
        name: String!
        email: String!
        phone: String
        company: Company!
        tickets: [Ticket!]!
    }

    input CompanyCreateInput {
        name: String!
        email: String!
        phone: String
        address: String
        primaryContactId: ID
    }

    input CompanyUpdateInput {
        name: String
        email: String
        phone: String
        address: String
        primaryContactId: ID
    }

    input ContactCreateInput {
        name: String!
        email: String!
        phone: String
        companyId: ID!
    }

    input ContactUpdateInput {
        name: String
        email: String
        phone: String
        companyId: ID
    }

    type Query {
        companies: [Company!]!
        company(id: ID!): Company
        contacts(companyId: ID!): [Contact!]!
        contact(id: ID!): Contact
        myContactInfo: Contact
    }    

    type Mutation {
        createCompany(data: CompanyCreateInput!): Company!
        updateCompany(id: ID!, data: CompanyUpdateInput!): Company!
        deleteCompany(id: ID!): Company!

        createContact(data: ContactCreateInput!): Contact!
        updateContact(id: ID!, data: ContactUpdateInput!): Contact!
        deleteContact(id: ID!): Contact!
    }
`;