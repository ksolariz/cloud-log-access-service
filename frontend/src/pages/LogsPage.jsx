import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Container,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Typography,
  Tooltip,
  Skeleton,
  Alert,
  Snackbar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import LinkIcon from "@mui/icons-material/Link";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Navbar from "../components/Navbar";
import { logsApi, saveBlobAsFile } from "../api/logsApi";
import { tokens } from "../theme";

function formatBytes(bytes) {
  if (bytes === undefined || bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [toast, setToast] = useState(null);
  const [presignFile, setPresignFile] = useState(null); // filename or null
  const [presignResult, setPresignResult] = useState(null);
  const [presignLoading, setPresignLoading] = useState(false);
  const [presignMinutes, setPresignMinutes] = useState(5);

  const PRESIGN_MINUTE_OPTIONS = [1, 5, 15, 30, 60];

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await logsApi.list();
      setLogs(data);
    } catch (err) {
      setError(
        err.response?.status === 403
          ? "You don't have permission to view this bucket."
          : "Couldn't load logs. Check that the backend and LocalStack are running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleDownload = async (filename) => {
    setDownloadingFile(filename);
    try {
      const blob = await logsApi.download(filename);
      saveBlobAsFile(blob, filename);
      setToast({ severity: "success", message: `Downloaded ${filename}` });
    } catch {
      setToast({ severity: "error", message: `Failed to download ${filename}` });
    } finally {
      setDownloadingFile(null);
    }
  };

  const openPresignDialog = (filename) => {
    setPresignFile(filename);
    setPresignResult(null);
    setPresignMinutes(5);
  };

  const handleGeneratePresign = async () => {
    setPresignLoading(true);
    try {
      const result = await logsApi.requestPresignedUrl(presignFile, presignMinutes * 60);
      setPresignResult(result);
    } catch {
      setToast({ severity: "error", message: "Couldn't generate a temporary link" });
    } finally {
      setPresignLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (presignResult?.url) {
      navigator.clipboard.writeText(presignResult.url);
      setToast({ severity: "success", message: "Link copied to clipboard" });
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: tokens.bg }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Typography variant="h5" sx={{ mb: 0.5 }}>
          Log files
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Files in the configured bucket. Download directly, or request a
          temporary link to share access without sharing your session.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ bgcolor: tokens.surface, overflow: "hidden" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>File</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Last modified</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading &&
                [1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton variant="text" height={32} sx={{ bgcolor: tokens.border }} />
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && logs.length === 0 && !error && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                      No log files found in this bucket yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                logs.map((log) => (
                  <TableRow key={log.filename} hover>
                    <TableCell sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <DescriptionOutlinedIcon fontSize="small" sx={{ color: tokens.accent }} />
                        {log.filename}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 13 }}>
                      {formatBytes(log.size)}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 13 }}>
                      {log.last_modified
                        ? new Date(log.last_modified).toLocaleString()
                        : "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Download now">
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(log.filename)}
                          disabled={downloadingFile === log.filename}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Request temporary link">
                        <IconButton size="small" onClick={() => openPresignDialog(log.filename)}>
                          <LinkIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Paper>
      </Container>

      {/* Bonus: temporary pre-signed link UI */}
      <Dialog open={Boolean(presignFile)} onClose={() => setPresignFile(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16 }}>
          Temporary access link
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Generates a pre-signed URL for{" "}
            <Box component="span" sx={{ fontFamily: "'IBM Plex Mono', monospace", color: tokens.accent }}>
              {presignFile}
            </Box>{" "}
            that works without a login — anyone with the link can download
            the file until it expires.
          </Typography>

          <TextField
            select
            fullWidth
            size="small"
            label="Link valid for"
            value={presignMinutes}
            onChange={(e) => setPresignMinutes(Number(e.target.value))}
            disabled={presignLoading}
            sx={{ mb: 2 }}
          >
            {PRESIGN_MINUTE_OPTIONS.map((m) => (
              <MenuItem key={m} value={m}>
                {m} {m === 1 ? "minute" : "minutes"}
              </MenuItem>
            ))}
          </TextField>

          {presignResult ? (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField fullWidth size="small" value={presignResult.url} InputProps={{ readOnly: true }} />
              <Tooltip title="Copy link">
                <IconButton onClick={handleCopyLink}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ) : null}

          {presignResult && (
            <Chip
              size="small"
              sx={{ mt: 1.5, bgcolor: "rgba(245,165,36,0.14)", color: tokens.warning }}
              label={`Expires in ${presignMinutes * 60}s`}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPresignFile(null)}>Close</Button>
          <Button variant="contained" onClick={handleGeneratePresign} disabled={presignLoading}>
            {presignResult ? "Regenerate" : "Generate link"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast ? <Alert severity={toast.severity}>{toast.message}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
}
