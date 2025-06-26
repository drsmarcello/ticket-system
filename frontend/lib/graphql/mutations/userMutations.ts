export const CREATE_USER = `
  mutation CreateUser($data: UserCreateInput!) {
    createUser(data: $data) {
      id
      name
      email
      role
      isActive
      createdAt
    }
  }
`;

export const UPDATE_USER = `
  mutation UpdateUser($id: ID!, $data: UserUpdateInput!) {
    updateUser(id: $id, data: $data) {
      id
      name
      email
      role
      isActive
      updatedAt
    }
  }
`;

export const DELETE_USER = `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
      name
      email
    }
  }
`;

export const UPDATE_PROFILE = `
  mutation UpdateProfile($data: UserUpdateInput!) {
    updateProfile(data: $data) {
      id
      name
      email
      role
      updatedAt
    }
  }
`;
