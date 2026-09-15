import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": "/src" } },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
  },
});
