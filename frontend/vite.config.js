import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // In dev, proxy /api to the FastAPI backend so the browser never needs CORS config.
    // Set VITE_API_URL in .env if you prefer to call the backend directly instead.
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_ORIGIN || "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
