import api from "@/lib/axios.service";
import { handleApiError } from "@/lib/errorHandler";

export interface Collector {
  _id: string;
  name: string;
  phone: string;
  branchId: { _id: string; name: string } | string;
  assignedArea?: string;
  targetAmount: number;
  collectedAmount: number;
  totalCustomers: number;
  joinedDate: string;
  isActive: boolean;
  performance: "GOOD" | "AVERAGE" | "LOW";
  createdAt: string;
}

export interface CreateCollectorPayload {
  name: string;
  phone: string;
  password: string;
  branchId: string;
  assignedArea?: string;
  targetAmount?: number;
}

export async function getCollectors(filters?: { branchId?: string; isActive?: boolean }): Promise<Collector[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.branchId) params.set("branchId", filters.branchId);
    if (filters?.isActive !== undefined) params.set("isActive", String(filters.isActive));
    const query = params.toString() ? `?${params}` : "";
    return await api.get(`/collector${query}`);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getCollectorById(id: string): Promise<Collector> {
  try {
    return await api.get(`/collector/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function createCollector(payload: CreateCollectorPayload): Promise<Collector> {
  try {
    return await api.post("/collector", payload);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function updateCollector(id: string, payload: Partial<CreateCollectorPayload> & { isActive?: boolean; performance?: string }): Promise<Collector> {
  try {
    return await api.put(`/collector/${id}`, payload);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function deleteCollector(id: string): Promise<{ message: string }> {
  try {
    return await api.delete(`/collector/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
}
