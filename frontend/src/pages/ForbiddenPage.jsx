import { Box, Typography, Button } from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import { useNavigate } from "react-router-dom";
import { tokens } from "../theme";

export default function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: tokens.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <BlockIcon sx={{ fontSize: 48, color: tokens.danger }} />
      <Typography variant="h6">Access denied</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, textAlign: "center" }}>
        Your role doesn't have permission to view this page. Sign in with a
        different account if you believe this is wrong.
      </Typography>
      <Button variant="outlined" onClick={() => navigate("/logs")}>
        Back to logs
      </Button>
    </Box>
  );
}
