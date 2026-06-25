import { apiClient } from "./client";

/**
 * Maps to the backend's log endpoints.
 *
 *   GET /logs               -> list of log objects in the bucket
 *   GET /logs/{filename}     -> binary download of one file
 *   POST /logs/{filename}/presign  -> (bonus) temporary pre-signed URL
 *
 * Adjust paths/response shape to match your actual FastAPI routes if they
 * differ — this is the only file that should need to change.
 */
export const logsApi = {
  async list() {
    const { data } = await apiClient.get("/logs");
    // Expected shape: [{ filename, size, last_modified }, ...]
    return data;
  },

  async download(filename) {
    const { data } = await apiClient.get(
      `/logs/${encodeURIComponent(filename)}`,
      { responseType: "blob" }
    );
    return data;
  },

  async requestPresignedUrl(filename, expiresInSeconds = 5) {
    const { data } = await apiClient.post(
      `/logs/${encodeURIComponent(filename)}/presign`,
      { expires_in: expiresInSeconds }
    );
    // Expected shape: { url, expires_in }
    return data;
  },
};

/** Triggers a browser "Save As" for a blob without leaving the page. */
export function saveBlobAsFile(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
