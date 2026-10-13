#!/usr/bin/env node
/**
 * Builds the Pages artifact, dist/ at the repo root, from the two package
 * outputs:
 *
 *   landing/.next-build/   Next static export            ->  dist/
 *   game/dist/             Vite build with base /play/   ->  dist/play/
 *
 * then writes dist/CNAME and an empty dist/.nojekyll, and exits non-zero if
 * either entry page is missing afterwards. Run through `pnpm assemble`
 * after `pnpm build`. CI uploads dist/ with actions/upload-pages-artifact.
 *
 * .nojekyll matters: without it Pages runs the output through Jekyll, which
 * drops every path beginning with an underscore, and Next puts its whole
 * bundle under _next/. CNAME is how Pages knows which custom domain this
 * deployment serves.
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOMAIN = 'oinkbuns.verastack.dev';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const landingOut = join(root, 'landing', '.next-build');
const gameOut = join(root, 'game', 'dist');
const dist = join(root, 'dist');

function fail(message) {
  console.error(`assemble: ${message}`);
  process.exit(1);
}

// Clear messages before any copying, so a run in the wrong order says what
// to do instead of throwing from cpSync.
if (!existsSync(join(landingOut, 'index.html'))) {
  fail(`missing ${join(landingOut, 'index.html')}; run "pnpm build" first`);
}
if (!existsSync(join(gameOut, 'index.html'))) {
  fail(`missing ${join(gameOut, 'index.html')}; run "pnpm build" first`);
}

// 1. Remove dist/ if present, so nothing from an earlier build survives.
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

// 2. Landing at the root.
cpSync(landingOut, dist, { recursive: true });

// 3. Game under /play/.
cpSync(gameOut, join(dist, 'play'), { recursive: true });

// 4. Custom domain and the Jekyll opt-out.
writeFileSync(join(dist, 'CNAME'), `${DOMAIN}\n`);
writeFileSync(join(dist, '.nojekyll'), '');

// 5. Both entry pages must exist in the result.
for (const page of [join(dist, 'index.html'), join(dist, 'play', 'index.html')]) {
  if (!existsSync(page)) {
    fail(`expected ${page} after assembly`);
  }
}

console.log(`assemble: wrote ${dist}`);
