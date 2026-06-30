import api from "@/lib/axios.service";
import { handleApiError } from "@/lib/errorHandler";

export interface Branch {
  _id: string;
  name: string;
  location: string;
  createdBy?: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export async function getBranches(): Promise<Branch[]> {
  try {
    return await api.get("/branches");
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getBranchById(id: string): Promise<Branch> {
  try {
    return await api.get(`/branches/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function createBranch(payload: { name: string; location: string }): Promise<Branch> {
  try {
    return await api.post("/branches", payload);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function updateBranch(id: string, payload: { name?: string; location?: string }): Promise<Branch> {
  try {
    return await api.put(`/branches/${id}`, payload);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function deleteBranch(id: string): Promise<{ message: string }> {
  try {
    return await api.delete(`/branches/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
}
