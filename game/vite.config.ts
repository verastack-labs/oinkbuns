import { defineConfig } from 'vite';

/**
 * The game is served at https://oinkbuns.verastack.dev/play/, so every URL
 * Vite writes into index.html must start with /play/. scripts/assemble.mjs
 * (repo root) copies game/dist/ to dist/play/, which is where those URLs
 * resolve. Plan 4 adds VitePWA to `plugins`.
 */
export default defineConfig({
  base: '/play/',
  build: {
    target: 'es2022',
  },
});
