# Oinkbuns

Bake hot cross buns with Peppa. A small browser game for children aged 7 to 8
in which Peppa Pig bakes and serves hot cross buns to customers in Mummy Pig's
kitchen, plus the landing page and devlog that go with it. Published at
[oinkbuns.verastack.dev](https://oinkbuns.verastack.dev/), with the game at
[/play/](https://oinkbuns.verastack.dev/play/).

Specs, plans, playtest notes and asset sources live in
[`verastack-labs/oinkbuns-internal`](https://github.com/verastack-labs/oinkbuns-internal)
(private).

## Requirements

- Node 22 or newer and pnpm 12 (`packageManager` in `package.json` pins the
  exact version; `corepack enable` picks it up)
- pnpm only. Do not use npm or yarn.

## Getting started

```bash
pnpm install
pnpm --filter @oinkbuns/landing dev   # http://localhost:3000/
pnpm --filter @oinkbuns/game dev      # http://localhost:5173/play/
```

The two dev servers are independent. In development the landing page's Play
button leads nowhere; the game only sits at `/play/` once both are built and
assembled.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm typecheck` | `tsc --noEmit` in every package |
| `pnpm lint` | ESLint in every package |
| `pnpm test` | Vitest in every package |
| `pnpm check` | The three above, which is what CI runs first |
| `pnpm build` | Next static export into `landing/.next-build/`, Vite build into `game/dist/` |
| `pnpm assemble` | Merges both outputs into `dist/` with `CNAME` and `.nojekyll` |

`pnpm check && pnpm build && pnpm assemble` is the full local run of what the
deploy does. Open `dist/` with any static file server to see the assembled
site.

## Layout

```
.github/workflows/   check.yml on pull requests, pages.yml on push to main
landing/             Next.js 16 App Router, static export (the site at /)
game/                Phaser 3 + Vite + TypeScript (the game at /play/)
  src/core/          pure TypeScript game rules, no Phaser imports
  src/scenes/        Phaser scenes
scripts/assemble.mjs builds dist/ from the two package outputs
licenses/            third-party font and audio licences
```

Agent rules are in [`AGENTS.md`](AGENTS.md). What the product is and who it is
for is in [`PRODUCT.md`](PRODUCT.md). How it looks is in
[`DESIGN.md`](DESIGN.md).

## Deployment

Pushing to `main` runs `.github/workflows/pages.yml`: typecheck, lint, test,
build, assemble, then upload `dist/` and deploy it to GitHub Pages at the
custom domain. `check.yml` runs the same gate on pull requests. No analytics,
cookies, or third-party scripts are used anywhere.

## Licence

The code in this repository is licensed under the Apache License 2.0; see
[`LICENSE`](LICENSE). [`NOTICE`](NOTICE) explains what the licence does not
cover. Third-party fonts and audio keep their own licences, recorded under
`licenses/`.

## Disclaimer

Oinkbuns is an unofficial fan project. Peppa Pig and all related characters are trademarks of Hasbro and Entertainment One. This game is not affiliated with, endorsed by, or connected to them.
