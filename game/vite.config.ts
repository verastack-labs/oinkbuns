import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * The game is served at https://oinkbuns.verastack.dev/play/, so every URL
 * Vite writes into index.html must start with /play/. scripts/assemble.mjs
 * (repo root) copies game/dist/ to dist/play/, which is where those URLs
 * resolve.
 *
 * VitePWA adds the web manifest (so the game can be installed to a home
 * screen) and a service worker (a background script that keeps a copy of
 * every game file, so it plays with no internet). The worker's scope is
 * /play/ only; the landing page and devlog stay online-only. A new deploy
 * updates the cached copy the next time the game is opened.
 */
export default defineConfig({
  base: '/play/',
  build: {
    target: 'es2022',
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Oinkbuns',
        short_name: 'Oinkbuns',
        description: 'Bake hot cross buns with Peppa. A tiny, free kitchen game.',
        start_url: '/play/',
        scope: '/play/',
        display: 'fullscreen',
        display_override: ['fullscreen', 'standalone'],
        orientation: 'landscape',
        background_color: '#fff1d6',
        theme_color: '#fff1d6',
        categories: ['games', 'kids'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,ogg,mp3}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: '/play/index.html',
      },
    }),
  ],
});
