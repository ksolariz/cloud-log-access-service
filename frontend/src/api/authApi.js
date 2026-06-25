import { apiClient } from "./client";

/**
 * Maps to the backend's JWT auth endpoints.
 *
 * NOTE: adjust the paths/payload shape here if your FastAPI routes differ
 * (e.g. if login expects OAuth2PasswordRequestForm — form-encoded — instead
 * of JSON, switch the body below to a URLSearchParams instance).
 */
export const authApi = {
  async login(username, password) {
    const { data } = await apiClient.post("/auth/login", {
      username,
      password,
    });
    // Expected shape: { access_token: "...", token_type: "bearer" }
    return data;
  },

  async logout() {
    // Tells the backend to revoke the Redis session entry for this token.
    await apiClient.post("/auth/logout");
  },
};
