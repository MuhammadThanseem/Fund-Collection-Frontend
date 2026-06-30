import api from "@/lib/axios.service";
import { handleApiError } from "@/lib/errorHandler";

export interface Collection {
  _id: string;
  customerId: { _id: string; name: string; phone: string } | string;
  collectorId: { _id: string; name: string } | string;
  branchId: { _id: string; name: string } | string;
  amount: number;
  collectionDate: string;
  month: number;
  year: number;
  notes?: string;
  createdAt: string;
}

export interface CreateCollectionPayload {
  customerId: string;
  amount: number;
  month: number;
  year: number;
  notes?: string;
}

export async function getCollections(filters?: { branchId?: string; month?: number; year?: number }): Promise<Collection[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.branchId) params.set("branchId", filters.branchId);
    if (filters?.month) params.set("month", String(filters.month));
    if (filters?.year) params.set("year", String(filters.year));
    const query = params.toString() ? `?${params}` : "";
    return await api.get(`/collections${query}`);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getCollectionById(id: string): Promise<Collection> {
  try {
    return await api.get(`/collections/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function createCollection(payload: CreateCollectionPayload): Promise<Collection> {
  try {
    return await api.post("/collections", payload);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function updateCollection(id: string, payload: Partial<CreateCollectionPayload>): Promise<Collection> {
  try {
    return await api.put(`/collections/${id}`, payload);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function deleteCollection(id: string): Promise<{ message: string }> {
  try {
    return await api.delete(`/collections/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
}
