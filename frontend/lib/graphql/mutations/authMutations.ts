// frontend/src/lib/mutations/authMutations.ts (UPDATE nur diese 2 Mutations)

// 🔄 UPDATED: accessToken + refreshToken statt token
export const LOGIN_MUTATION = `
  mutation Login($data: LoginInput!) {
    login(data: $data) {
      accessToken
      refreshToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;

// 🔄 UPDATED: accessToken + refreshToken statt token  
export const REGISTER_MUTATION = `
  mutation Register($data: RegisterInput!) {
    register(data: $data) {
      accessToken
      refreshToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;

// 🆕 NEW: Falls noch nicht vorhanden
export const LOGOUT_MUTATION = `
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;