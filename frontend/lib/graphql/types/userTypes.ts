export interface FullUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE" | "CUSTOMER";
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  assignedTickets?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
  }>;
  createdTickets?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
  }>;
}

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "EMPLOYEE" | "CUSTOMER";
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  password?: string;
  role?: "ADMIN" | "EMPLOYEE" | "CUSTOMER";
  isActive?: boolean;
}

export interface UsersResponse {
  users: FullUser[];
}

export interface UserResponse {
  user: FullUser;
}

export interface MeFullResponse {
  me: FullUser;
}

export interface CreateUserResponse {
  createUser: FullUser;
}

export interface UpdateUserResponse {
  updateUser: FullUser;
}

export interface DeleteUserResponse {
  deleteUser: FullUser;
}

export interface UpdateProfileResponse {
  updateProfile: FullUser;
}

export interface PasswordUpdateInput {
  currentPassword: string;
  newPassword: string;
}

export interface EmailUpdateInput {
  email: string;
  password: string;
}
