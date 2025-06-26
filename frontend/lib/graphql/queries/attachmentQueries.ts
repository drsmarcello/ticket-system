export const GET_ATTACHMENTS = `
  query GetAttachments($ticketId: ID, $commentId: ID) {
    attachments(ticketId: $ticketId, commentId: $commentId) {
      id
      filename
      mimeType
      size
      path
      url
      createdAt
      updatedAt
      uploadedBy {
        id
        name
        email
      }
      ticket {
        id
        title
      }
      comment {
        id
        content
      }
    }
  }
`;

export const GET_ATTACHMENT = `
  query GetAttachment($id: ID!) {
    attachment(id: $id) {
      id
      filename
      mimeType
      size
      path
      url
      createdAt
      updatedAt
      uploadedBy {
        id
        name
        email
      }
      ticket {
        id
        title
      }
      comment {
        id
        content
      }
    }
  }
`;
