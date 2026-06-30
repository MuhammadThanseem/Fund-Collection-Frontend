import api from "@/lib/axios.service";
import { handleApiError } from "@/lib/errorHandler";

export interface User {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  role: "SUPER_ADMIN" | "BRANCH_ADMIN" | "COLLECTOR";
  branchId?: { _id: string; name: string } | string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserPayload {
  name: string;
  phone: string;
  password: string;
  role: "SUPER_ADMIN" | "BRANCH_ADMIN" | "COLLECTOR";
  email?: string;
  branchId?: string;
}

export async function getUsers(filters?: { role?: string; branchId?: string; isActive?: boolean }): Promise<User[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.role) params.set("role", filters.role);
    if (filters?.branchId) params.set("branchId", filters.branchId);
    if (filters?.isActive !== undefined) params.set("isActive", String(filters.isActive));
    const query = params.toString() ? `?${params}` : "";
    return await api.get(`/user${query}`);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getUserById(id: string): Promise<User> {
  try {
    return await api.get(`/user/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  try {
    return await api.post("/user", payload);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function updateUser(id: string, payload: Partial<CreateUserPayload> & { isActive?: boolean }): Promise<User> {
  try {
    return await api.put(`/user/${id}`, payload);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  try {
    return await api.delete(`/user/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
}
