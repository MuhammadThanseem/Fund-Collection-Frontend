import type { AxiosError } from "axios";

export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

export function handleApiError(error: unknown): ApiError {
  if ((error as AxiosError)?.isAxiosError) {
    const axiosError = error as AxiosError<any>;
    return {
      message:
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Something went wrong",
      status: axiosError.response?.status,
      details: axiosError.response?.data,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "Unexpected error occurred" };
}
