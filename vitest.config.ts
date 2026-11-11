import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // Con el pool "forks" un worker abortó (código 134) de forma intermitente en Windows.
    pool: "threads",
    include: ["src/**/*.test.ts"],
  },
})
