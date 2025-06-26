export const GET_ME = `
  query GetMe {
    me {
      id
      name
      email
      role
      isActive
    }
  }
`;

export const GET_USERS = `
  query GetUsers {
    users {
      id
      name
      email
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      role
      isActive
      createdAt
      updatedAt
      assignedTickets {
        id
        title
        status
        priority
      }
      createdTickets {
        id
        title
        status
        priority
      }
    }
  }
`;

export const GET_EMPLOYEES = `
  query GetEmployees {
    users(filter: { role: EMPLOYEE }) {
      id
      name
      email
      isActive
    }
  }
`;

export const GET_ADMINS = `
  query GetAdmins {
    users(filter: { role: ADMIN }) {
      id
      name
      email
      isActive
    }
  }
`;
