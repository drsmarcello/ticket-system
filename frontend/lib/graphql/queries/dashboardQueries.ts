export const DASHBOARD_QUERY = `
  query Dashboard {
    tickets(limit: 10) {
      id
      title
      description
      status
      priority
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
    }
  }
`;

export const MY_ASSIGNED_TICKETS_QUERY = `
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
    }
  }
`;

export const DASHBOARD_STATS_QUERY = `
  query DashboardStats {
    tickets {
      id
      status
      priority
    }
  }
`;
