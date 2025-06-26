export const CREATE_COMPANY = `
  mutation CreateCompany($data: CompanyCreateInput!) {
    createCompany(data: $data) {
      id
      name
      email
      phone
      address
      primaryContact {
        id
        name
        email
      }
    }
  }
`;

export const UPDATE_COMPANY = `
  mutation UpdateCompany($id: ID!, $data: CompanyUpdateInput!) {
    updateCompany(id: $id, data: $data) {
      id
      name
      email
      phone
      address
      primaryContact {
        id
        name
        email
      }
    }
  }
`;

export const DELETE_COMPANY = `
  mutation DeleteCompany($id: ID!) {
    deleteCompany(id: $id) {
      id
    }
  }
`;

export const CREATE_CONTACT = `
  mutation CreateContact($data: ContactCreateInput!) {
    createContact(data: $data) {
      id
      name
      email
      phone
      company {
        id
        name
      }
    }
  }
`;

export const UPDATE_CONTACT = `
  mutation UpdateContact($id: ID!, $data: ContactUpdateInput!) {
    updateContact(id: $id, data: $data) {
      id
      name
      email
      phone
      company {
        id
        name
      }
    }
  }
`;

export const DELETE_CONTACT = `
  mutation DeleteContact($id: ID!) {
    deleteContact(id: $id) {
      id
    }
  }
`;
