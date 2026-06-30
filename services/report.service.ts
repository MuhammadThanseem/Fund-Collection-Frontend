import api from "@/lib/axios.service";
import { handleApiError } from "@/lib/errorHandler";

export interface DashboardSummary {
  totalCollection: number;
  thisMonthCollection: number;
}

export interface MonthlyData {
  _id: number;
  total: number;
}

export interface BranchWiseData {
  _id: string;
  branchName: string;
  total: number;
}

export interface CollectorWiseData {
  _id: string;
  collectorName: string;
  total: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    return await api.get("/reports/dashboard");
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getTotalCollection(filters?: { branchId?: string; month?: number; year?: number }): Promise<{ total: number }> {
  try {
    const params = new URLSearchParams();
    if (filters?.branchId) params.set("branchId", filters.branchId);
    if (filters?.month) params.set("month", String(filters.month));
    if (filters?.year) params.set("year", String(filters.year));
    const query = params.toString() ? `?${params}` : "";
    return await api.get(`/reports/total${query}`);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getMonthlyCollection(year: number): Promise<MonthlyData[]> {
  try {
    return await api.get(`/reports/monthly?year=${year}`);
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getBranchWiseCollection(): Promise<BranchWiseData[]> {
  try {
    return await api.get("/reports/branch");
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getCollectorWiseCollection(): Promise<CollectorWiseData[]> {
  try {
    return await api.get("/reports/collector");
  } catch (error) {
    throw handleApiError(error);
  }
}
