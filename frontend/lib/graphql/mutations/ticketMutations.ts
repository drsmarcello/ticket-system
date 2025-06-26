export const CREATE_TICKET = `
  mutation CreateTicket($data: TicketCreateInput!) {
    createTicket(data: $data) {
      id
      title
      description
      status
      priority
      estimatedMinutes
      createdAt
      assignedTo {
        id
        name
        email
      }
      createdBy {
        id
        name
        email
      }
      company {
        id
        name
      }
      contact {
        id
        name
        email
      }
    }
  }
`;

export const UPDATE_TICKET = `
  mutation UpdateTicket($id: ID!, $data: TicketUpdateInput!) {
    updateTicket(id: $id, data: $data) {
      id
      title
      description
      status
      priority
      estimatedMinutes
      updatedAt
      assignedTo {
        id
        name
        email
      }
      company {
        id
        name
      }
      contact {
        id
        name
        email
      }
    }
  }
`;

export const ASSIGN_TICKET = `
  mutation AssignTicket($id: ID!, $assignedToId: ID!) {
    assignTicket(id: $id, assignedToId: $assignedToId) {
      id
      assignedTo {
        id
        name
        email
      }
    }
  }
`;

export const DELETE_TICKET = `
  mutation DeleteTicket($id: ID!) {
    deleteTicket(id: $id) {
      id
      title
    }
  }
`;
