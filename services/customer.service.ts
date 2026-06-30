import api from "@/lib/axios.service";
import { handleApiError } from "@/lib/errorHandler";

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  address?: string;
  boxNumber: string;
  branchId: { _id: string; name: string } | string;
  createdBy?: { _id: string; name: string } | string;
  createdAt: string;
}

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  address?: string;
  boxNumber: string;
  branchId: string;
}

export async function getCustomers(filters?: { branchId?: string }): Promise<Customer[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.branchId) params.set("branchId", filters.branchId);
    const query = params.toString() ? `?${params}` : "";
    return await api.get(`/customers${query}`);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getCustomerById(id: string): Promise<Customer> {
  try {
    return await api.get(`/customers/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
  try {
    return await api.post("/customers", payload);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function updateCustomer(id: string, payload: Partial<CreateCustomerPayload>): Promise<Customer> {
  try {
    return await api.put(`/customers/${id}`, payload);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function deleteCustomer(id: string): Promise<{ message: string }> {
  try {
    return await api.delete(`/customers/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
}
