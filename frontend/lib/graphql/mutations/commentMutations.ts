export const CREATE_COMMENT = `
  mutation CreateComment($data: CommentCreateInput!) {
    createComment(data: $data) {
      id
      content
      isInternal
      createdAt
      user {
        id
        name
        email
      }
      ticket {
        id
      }
    }
  }
`;

export const UPDATE_COMMENT = `
  mutation UpdateComment($id: ID!, $data: CommentUpdateInput!) {
    updateComment(id: $id, data: $data) {
      id
      content
      isInternal
      updatedAt
      user {
        id
        name
        email
      }
    }
  }
`;

export const DELETE_COMMENT = `
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id) {
      id
    }
  }
`;
