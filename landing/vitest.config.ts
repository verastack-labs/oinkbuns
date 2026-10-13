import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    // Plan 5 adds src/lib/devlog.test.ts. Until then `pnpm test` must still
    // succeed so the CI gate is green for this scaffold.
    passWithNoTests: true,
  },
});
