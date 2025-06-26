export const GET_TICKETS = `
  query GetTickets($filters: TicketFilters, $limit: Int, $offset: Int) {
    tickets(filters: $filters, limit: $limit, offset: $offset) {
      id
      title
      description
      status
      priority
      estimatedMinutes
      createdAt
      updatedAt
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

export const GET_TICKET = `
  query GetTicket($id: ID!) {
    ticket(id: $id) {
      id
      title
      description
      status
      priority
      estimatedMinutes
      createdAt
      updatedAt
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
        email
        phone
        address
      }
      contact {
        id
        name
        email
        phone
      }
      timeEntries {
        id
        description
        startTime
        endTime
        duration
        billable
        createdAt
        updatedAt
        user {
          id
          name
        }
      }
      comments {
        id
        content
        isInternal
        createdAt
        updatedAt
        user {
          id
          name
          email
        }
      }
      histories {
        id
        type
        oldValue
        newValue
        message
        createdAt
        user {
          id
          name
        }
      }
    }
  }
`;

export const MY_TICKETS = `
  query MyTickets {
    myTickets {
      id
      title
      status
      priority
      createdAt
      company {
        id
        name
      }
      contact {
        id
        name
      }
    }
  }
`;

export const MY_ASSIGNED_TICKETS = `
  query MyAssignedTickets {
    myAssignedTickets {
      id
      title
      status
      priority
      createdAt
      company {
        id
        name
      }
      contact {
        id
        name
      }
    }
  }
`;
