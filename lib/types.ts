export interface User {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  role: string;
  roles?: string[];
  permissions: string[];
  isActive?: boolean;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: string;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  name?: string;
  fullName?: string;
  role?: string;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface CreatePermissionData {
  name: string;
  description?: string;
}

export interface UpdatePermissionData {
  name?: string;
  description?: string;
}
