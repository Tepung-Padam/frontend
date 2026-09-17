import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // VS Code's forwarded-port tunnel sends requests with a devtunnels.ms Host
    // header, not "localhost" — Vite blocks unrecognized hosts by default.
    allowedHosts: true,
  },
  resolve: { alias: { "@": "/src" } },
});
