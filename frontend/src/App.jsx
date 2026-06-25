import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import ProtectedRoute from "./components/ProtectedRoute";
import GlobalToast from "./components/GlobalToast";
import LoginPage from "./pages/LoginPage";
import LogsPage from "./pages/LogsPage";
import ForbiddenPage from "./pages/ForbiddenPage";

/**
 * Role names below ("admin", "viewer") are placeholders matching the
 * `require_role` examples used on the backend. Update them to match
 * whatever roles your JWT actually issues.
 */
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalToast />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route
            path="/logs"
            element={
              <ProtectedRoute roles={["admin", "viewer"]}>
                <LogsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/logs" replace />} />
          <Route path="*" element={<Navigate to="/logs" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
