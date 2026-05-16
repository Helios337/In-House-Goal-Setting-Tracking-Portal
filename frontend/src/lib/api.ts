import axios from "axios";
import { getSession } from "next-auth/react";

// Create a customized Axios instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling (e.g., Token Refresh logic)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If a 401 Unauthorized is returned, you can trigger NextAuth signOut
    // or attempt a silent token refresh here depending on your Entra ID config.
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        console.error("Session expired or unauthorized.");
        // window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);
