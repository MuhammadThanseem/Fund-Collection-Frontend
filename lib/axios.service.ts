import axios from "axios";
import { clearToken, getToken } from "./auth.storage";

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // 🔥 set in .env
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =====================
   REQUEST INTERCEPTOR
===================== */
http.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =====================
   RESPONSE INTERCEPTOR
===================== */
http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status;

    // Auto logout on unauthorized
    if (status === 401) {
      clearToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(
      error?.response?.data || { message: "Something went wrong" }
    );
  }
);

export default http;