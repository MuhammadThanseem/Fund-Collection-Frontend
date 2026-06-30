import api from "@/lib/axios.service";
import { handleApiError } from "@/lib/errorHandler";
import { setToken } from "@/lib/auth.storage";

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  token: string;
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

    setToken(response.data.token);

    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    throw handleApiError(error);
  }
}
