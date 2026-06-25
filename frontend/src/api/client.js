import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";

/**
 * Single API client used by every page. Centralizing it here means:
 *  - the token is attached automatically (no page repeats this logic)
 *  - a 401 anywhere in the app triggers one consistent "session ended" flow
 *  - swapping the backend base URL is a one-line env change
 *
 * Adjust VITE_API_URL in .env to point at your FastAPI backend directly,
 * or leave it unset to use the Vite dev proxy configured in vite.config.js.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token rejected or revoked server-side (e.g. logged out elsewhere,
      // or the Redis session entry was invalidated) — clear local session
      // so ProtectedRoute sends the user back to /login.
      useToastStore.getState().show("Your session has expired. Please sign in again.", "warning");
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
