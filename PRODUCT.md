# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

A pnpm workspace with two packages. `landing/` is Next.js 16 (App Router)
built as a static export; `game/` is Phaser 3 with Vite and TypeScript. Both
deploy together to GitHub Pages through `.github/workflows/pages.yml` under
the custom domain `oinkbuns.verastack.dev`. Tailwind 4 on the landing page.
No server, no database, no analytics.

## Users

**Players.** Children aged 7 to 8, on a laptop with a trackpad and keyboard
or on a phone or tablet held sideways. They do not need to read to play:
icons carry meaning, words are short and decorative, and nothing punishes
them. Two children are the first playtesters.

**Visitors.** Adults who find the landing page: parents, and people looking
at the portfolio. They want to know what it is in one glance, press Play, and
maybe read how it was made.

## Product Purpose

A gentle single-screen order rush: take dough, bake it, pipe the cross, hand
it over before the customer gets bored. Five short "days" each add one twist.
It exists to be fun for a 7 year old in repeated short sessions, and to be a
clean, readable portfolio piece with a devlog that tells the story of the
build.

## Positioning

A free, installable browser game with no accounts, no leaderboards, no
multiplayer, no analytics, and no cookies. It sits alongside the many Peppa
apps that exist by being tiny, honest about being fan-made, and playable
offline once loaded.

## Operating Context

- Static files only, served by GitHub Pages under the `verastack-labs` org.
- Played on laptops with a trackpad and on phones and tablets in landscape;
  portrait shows a "turn your phone sideways" card.
- Must keep working offline after the first load.
- Budgets: game bundle under about 500 KB gzipped including Phaser, assets
  under about 3 MB, first load under three seconds on 4G.

## Capabilities and Constraints

The game: one kitchen, six station kinds, four customers, five days, three
stars per day, a save of best stars and the mute state in `localStorage`.

Constraints:

- No reading required to play. Day names and lines are decorative.
- Controls reduce to "move" plus one context-sensitive action on every
  device.
- No game over. A customer leaving sad costs nothing.
- Nothing from the show is copied: characters are original vector art drawn
  in the show's style, and all audio is from copyright-free sources or
  synthesised.
- Difficulty stops at five days and four customers for the first release.
  No level editor.

## Brand Commitments

**Name:** Oinkbuns. Tagline: "Bake hot cross buns with Peppa".

**Studio:** VeraStack Labs. Repo pattern is `oinkbuns` public and
`oinkbuns-internal` private.

**Look:** the show's flat colours and thin dark outlines, the Fredoka
typeface, a warm cream wall colour. The palette is defined once in
`oinkbuns-internal/assets-src/palette.md` and mirrored in the game and the
landing page.

**Honesty:** the README, the `NOTICE` file and the landing footer carry the
same fan-project disclaimer, verbatim. The code is Apache-2.0; the licence
does not cover the characters.

**Writing:** short, friendly, no em-dashes anywhere.

## Evidence on Hand

Nothing yet. No playtests, no players, no clips. The devlog will record the
first playtest once it happens. Until then the landing page shows the game
itself and makes no claims about who likes it.

## Product Principles

1. **One button.** If a feature needs a second action, it does not ship.
2. **Nothing to read that matters.** Every signal is an icon, a sound, or
   a motion as well as (or instead of) a word.
3. **No harsh failure.** Burnt buns are a joke, sad customers are a nudge,
   every day is completable. Stars are the challenge.
4. **Data over code.** Days, customers and recipes are data files validated
   by a schema; the rules live in pure TypeScript with no Phaser in them.
5. **Honest about what it is.** An unlicensed fan project, said plainly
   everywhere the game is described.

## Accessibility & Inclusion

Colour is never the only signal (burnt buns are black and smoking, choc-chip
buns show chips, the patience bar also changes length). Touch targets are at
least 72 logical pixels. The system reduce-motion setting shortens tweens and
disables confetti. The game is played without reading. Phones buzz on serve
only where the vibration API exists and never as the only feedback.
