import api from "@/lib/axios.service";
import { handleApiError } from "@/lib/errorHandler";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface LoginApiResponse {
  data: LoginResponse;
  status: number;
}

export async function login(payload: LoginPayload): Promise<LoginApiResponse> {
  try {
    const response = await api.post<LoginResponse>("/auth/login", payload);

    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", response.data.accessToken);
    }

    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    throw handleApiError(error);
  }
}
