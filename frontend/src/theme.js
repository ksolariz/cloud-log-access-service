import { createTheme } from "@mui/material/styles";

/**
 * Design tokens for the Cloud Log Access console.
 *
 * This is an internal security tool, so the direction leans "ops dashboard
 * at 2am" rather than marketing-site polish: near-black navy surfaces, a
 * single cyan accent reserved for primary actions and focus states, amber
 * reserved exclusively for things that are about to expire (tokens,
 * pre-signed links), and a monospace face for anything that is literally
 * data (filenames, timestamps, tokens) so it reads as machine-truth rather
 * than UI copy.
 */
export const tokens = {
  bg: "#0B1220",
  surface: "#111827",
  surfaceRaised: "#161F2E",
  border: "#1F2A3B",
  textPrimary: "#E5E9F0",
  textSecondary: "#8B98AC",
  accent: "#22D3EE", // primary actions, links, focus
  accentMuted: "#0E7490",
  role: "#A78BFA", // role chips (RBAC)
  warning: "#F5A524", // expiring tokens / links
  danger: "#F2545B", // revoked / failed
  success: "#34D399",
};

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: tokens.bg,
      paper: tokens.surface,
    },
    primary: {
      main: tokens.accent,
      contrastText: "#04222A",
    },
    secondary: {
      main: tokens.role,
    },
    warning: {
      main: tokens.warning,
    },
    error: {
      main: tokens.danger,
    },
    success: {
      main: tokens.success,
    },
    text: {
      primary: tokens.textPrimary,
      secondary: tokens.textSecondary,
    },
    divider: tokens.border,
  },
  typography: {
    fontFamily: "'Inter', system-ui, sans-serif",
    h1: { fontFamily: "'Inter', sans-serif", fontWeight: 700 },
    h2: { fontFamily: "'Inter', sans-serif", fontWeight: 700 },
    h6: { fontWeight: 600, letterSpacing: 0.2 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            "radial-gradient(circle at 20% -10%, rgba(34,211,238,0.06), transparent 40%)",
        },
        "::selection": { background: "rgba(34,211,238,0.35)" },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${tokens.border}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: tokens.border },
      },
    },
  },
});

export default theme;
