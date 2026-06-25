import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Centralized session state.
 *
 * Holds the access token, decoded role/claims, and expiry. Persisted to
 * localStorage so a page refresh doesn't kick the user back to /login.
 * `isExpired()` is checked by the API client (to pre-empt 401s) and by
 * ProtectedRoute (to redirect proactively).
 */
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      token: null,
      role: null,
      username: null,
      expiresAt: null, // epoch seconds

      login: (token) => {
        const claims = decodeJwt(token) || {};
        set({
          token,
          role: claims.role ?? claims.roles?.[0] ?? null,
          username: claims.sub ?? claims.username ?? null,
          expiresAt: claims.exp ?? null,
        });
      },

      logout: () => {
        set({ token: null, role: null, username: null, expiresAt: null });
      },

      isAuthenticated: () => {
        const { token } = get();
        return Boolean(token) && !get().isExpired();
      },

      isExpired: () => {
        const { expiresAt } = get();
        if (!expiresAt) return false;
        return Date.now() / 1000 >= expiresAt;
      },

      hasRole: (...allowed) => {
        const { role } = get();
        return role ? allowed.includes(role) : false;
      },
    }),
    {
      name: "cla-session", // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        role: state.role,
        username: state.username,
        expiresAt: state.expiresAt,
      }),
    }
  )
);
