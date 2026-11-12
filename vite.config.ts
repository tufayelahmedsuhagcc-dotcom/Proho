import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: { host: "0.0.0.0", allowedHosts: true },
  build: { outDir: "web", target: "es2022", chunkSizeWarningLimit: 650 },
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
