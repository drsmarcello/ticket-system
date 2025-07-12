export interface User {
  id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
    isActive?: boolean;
}
  
export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginResponse {
  login: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface RegisterResponse {
  register: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface MeResponse {
  me: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}