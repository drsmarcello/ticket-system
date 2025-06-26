export const GET_TIME_ENTRIES = `
  query GetTimeEntries($filters: TimeEntryFilters, $limit: Int, $offset: Int) {
    timeEntries(filters: $filters, limit: $limit, offset: $offset) {
      id
      description
      startTime
      endTime
      duration
      billable
      createdAt
      ticket {
        id
        title
        company {
          name
        }
      }
      user {
        id
        name
      }
    }
  }
`;

export const GET_TIME_ENTRY = `
  query GetTimeEntry($id: ID!) {
    timeEntry(id: $id) {
      id
      description
      startTime
      endTime
      duration
      billable
      createdAt
      updatedAt
      ticket {
        id
        title
        company {
          id
          name
        }
      }
      user {
        id
        name
        email
      }
    }
  }
`;

export const MY_TIME_ENTRIES = `
  query MyTimeEntries($from: String, $to: String) {
    myTimeEntries(from: $from, to: $to) {
      id
      description
      startTime
      endTime
      duration
      billable
      createdAt
      ticket {
        id
        title
        company {
          name
        }
      }
    }
  }
`;
