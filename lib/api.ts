import {
  User,
  Role,
  Permission,
  AuthResponse,
  LoginCredentials,
  CreateUserData,
  UpdateUserData,
  CreateRoleData,
  UpdateRoleData,
  CreatePermissionData,
  UpdatePermissionData,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
};

export const googleLogin = async (idToken: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/users/google-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  return handleResponse(response);
};

export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/users`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const fetchUser = async (id: string): Promise<User> => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const createUser = async (data: CreateUserData): Promise<User> => {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateUser = async (id: string, data: UpdateUserData): Promise<User> => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const fetchRoles = async (): Promise<Role[]> => {
  const response = await fetch(`${API_URL}/roles`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const fetchRole = async (id: string): Promise<Role> => {
  const response = await fetch(`${API_URL}/roles/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const createRole = async (data: CreateRoleData): Promise<Role> => {
  const response = await fetch(`${API_URL}/roles`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateRole = async (id: string, data: UpdateRoleData): Promise<Role> => {
  const response = await fetch(`${API_URL}/roles/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteRole = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/roles/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const fetchPermissions = async (): Promise<string[]> => {
  const response = await fetch(`${API_URL}/permissions`, {
    headers: getAuthHeaders(),
  });
  const permissions: Permission[] = await handleResponse(response);
  return permissions.map(p => p.name);
};

export const fetchPermission = async (id: string): Promise<Permission> => {
  const response = await fetch(`${API_URL}/permissions/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const createPermission = async (data: CreatePermissionData): Promise<Permission> => {
  const response = await fetch(`${API_URL}/permissions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updatePermission = async (id: string, data: UpdatePermissionData): Promise<Permission> => {
  const response = await fetch(`${API_URL}/permissions/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deletePermission = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/permissions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};
