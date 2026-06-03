import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Dev server runs on port 3000 to match the backend CORS_ORIGIN.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
});
