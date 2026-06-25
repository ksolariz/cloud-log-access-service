import { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Chip, Box, Button, Stack } from "@mui/material";
import LockClockIcon from "@mui/icons-material/LockClock";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/authApi";
import { tokens } from "../theme";

/**
 * Signature element: a live countdown to JWT expiry, sitting where a normal
 * dashboard would put a generic "Account" menu. For a tool whose whole job
 * is mediating access to sensitive data, making session lifetime visible
 * (rather than hidden until a surprise 401) is the one deliberate UI choice
 * worth spending attention on.
 */
function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!expiresAt) {
      setRemaining(null);
      return;
    }
    const tick = () => {
      const secs = Math.max(0, Math.floor(expiresAt - Date.now() / 1000));
      setRemaining(secs);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

function formatRemaining(secs) {
  if (secs === null) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Navbar() {
  const navigate = useNavigate();
  const { username, role, expiresAt, logout } = useAuthStore();
  const remaining = useCountdown(expiresAt);
  const isExpiringSoon = remaining !== null && remaining <= 60;

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the backend call fails, clear the local session so the
      // user isn't stuck looking "logged in" with a dead token.
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: tokens.surface,
        borderBottom: `1px solid ${tokens.border}`,
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontFamily: "'IBM Plex Mono', monospace" }}
        >
          cloud-log-access
        </Typography>

        {username && (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              size="small"
              label={role || "no-role"}
              sx={{
                bgcolor: "rgba(167,139,250,0.12)",
                color: tokens.role,
                border: `1px solid ${tokens.role}55`,
              }}
            />
            <Chip
              size="small"
              icon={<LockClockIcon sx={{ fontSize: 16 }} />}
              label={formatRemaining(remaining)}
              title="Time until session token expires"
              sx={{
                bgcolor: isExpiringSoon
                  ? "rgba(245,165,36,0.14)"
                  : "rgba(34,211,238,0.10)",
                color: isExpiringSoon ? tokens.warning : tokens.accent,
                border: `1px solid ${isExpiringSoon ? tokens.warning : tokens.accent}55`,
                transition: "all 0.3s ease",
              }}
            />
            <Box sx={{ color: "text.secondary", fontSize: 13 }}>
              {username}
            </Box>
            <Button
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ color: "text.secondary" }}
            >
              Sign out
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
}
