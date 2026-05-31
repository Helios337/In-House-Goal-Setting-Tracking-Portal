import axios from "axios";
import { getAccessToken } from "@/lib/session-token";

/** Browser calls same-origin `/api/v1` (Next.js rewrite → backend). Server/SSR uses API_BASE_URL. */
export function resolveApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api/v1";
  }
  const backend =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";
  return `${backend.replace(/\/$/, "")}/api/v1`;
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

let handling401 = false;

api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const pathname = window.location.pathname;
      if (!pathname.startsWith("/login") && !handling401) {
        handling401 = true;
        try {
          const { signOut } = await import("next-auth/react");
          await signOut({ redirect: false });
        } finally {
          window.location.href = "/login?expired=1";
        }
      }
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return "Could not reach the API. Check that the backend is running and NEXT_PUBLIC_API_URL / API_BASE_URL match your setup.";
    }
    if (err.response.status === 401) {
      return "Session expired. Please sign in again.";
    }
    const detail = err.response.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}
