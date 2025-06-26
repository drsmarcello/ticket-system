export const GET_COMPANIES = `
  query GetCompanies {
    companies {
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
      contacts {
        id
        name
        email
      }
      tickets {
        id
        status
      }
    }
  }
`;

export const GET_COMPANIES_FOR_TICKET = `
  query GetCompaniesForTicket {
    companies {
      id
      name
      contacts {
        id
        name
        email
      }
    }
  }
`;

export const GET_COMPANY = `
  query GetCompany($id: ID!) {
    company(id: $id) {
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
      contacts {
        id
        name
        email
      }
      tickets {
        id
        title
        status
        priority
        createdAt
      }
    }
  }
`;
