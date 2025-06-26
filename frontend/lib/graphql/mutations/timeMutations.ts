export const CREATE_TIME_ENTRY = `
  mutation CreateTimeEntry($data: TimeEntryCreateInput!) {
    createTimeEntry(data: $data) {
      id
      duration
      description
      billable
      startTime
      endTime
      ticket {
        id
        title
      }
      user {
        id
        name
      }
    }
  }
`;

export const UPDATE_TIME_ENTRY = `
  mutation UpdateTimeEntry($id: ID!, $data: TimeEntryUpdateInput!) {
    updateTimeEntry(id: $id, data: $data) {
      id
      duration
      description
      billable
      startTime
      endTime
      updatedAt
    }
  }
`;

export const DELETE_TIME_ENTRY = `
  mutation DeleteTimeEntry($id: ID!) {
    deleteTimeEntry(id: $id) {
      id
    }
  }
`;
