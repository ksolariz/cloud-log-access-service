import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

/**
 * Route guard: redirects unauthenticated or expired sessions to /login,
 * and unauthorized roles to /403. Wrap any route element with this.
 *
 *   <Route path="/logs" element={
 *     <ProtectedRoute roles={["admin", "viewer"]}><LogsPage /></ProtectedRoute>
 *   } />
 *
 * Omit `roles` to only require authentication, no specific role.
 */
export default function ProtectedRoute({ children, roles }) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const hasRole = useAuthStore((s) => s.hasRole);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
