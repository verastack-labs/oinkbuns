import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Plan 2 adds the core tests. Until then `pnpm test` must still succeed
    // so the CI gate is green for this scaffold.
    passWithNoTests: true,
  },
});
