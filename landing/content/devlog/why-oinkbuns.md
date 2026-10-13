---
title: Why Oinkbuns
date: "2026-10-12"
summary: A tiny kitchen game for seven and eight year olds, and a portfolio piece that shows its working.
cover: /art/peppa-happy.svg
---

Oinkbuns is a browser game in which Peppa Pig bakes hot cross buns and hands
them to George, Suzy Sheep, Danny Dog and Grandpa Pig before they get bored.
Take dough from the bowl, put it in the oven, pipe the cross, serve. Five
short days each add one twist. That is the whole game, and that is on purpose.

## Who it is for

Children aged 7 and 8, first of all, playing on a laptop with a trackpad or
a tablet held sideways, in sessions that last about as long as a cup of tea. So the game had to be quick to start, impossible to get lost in, and
kind when things go wrong. Nothing in it needs reading. Day names and the
customers' lines are there for the grown-ups; the icons, sounds and bounces
carry the meaning for the players.

It is also for anyone who wants to see how a small game is built with care.
The rules live in plain TypeScript with no engine code in them, the days and
customers are data files checked by a schema, and this devlog records the
decisions as they are made.

## What it refuses to be

No accounts, no leaderboards, no multiplayer, no server. No analytics, no
cookies, no third-party scripts. There is no game over: a customer who leaves
sad costs nothing, a burnt bun is a small joke on the way to the bin, and
every day can be finished. The stars are the challenge for anyone who wants
one.

## Honest about the pig

Peppa Pig belongs to Hasbro and Entertainment One. Oinkbuns is an unlicensed
fan project, published because the making of it is worth showing. Every character is original vector art drawn in the show's style;
no official pictures or sounds are used, and the effects and music come from
copyright-free packs or were synthesised. The "Hot Cross Buns" nursery rhyme
is in the public domain. The [source](https://github.com/verastack-labs/oinkbuns)
is Apache-2.0 for the code only, which says the same thing in licence terms.

## How it is built

A pnpm workspace with two packages: this site, a Next.js static export, and
the game, Phaser 3 with Vite and TypeScript. Both deploy together to GitHub
Pages. The budgets are strict for something this small: the game bundle
stays under about 500 KB gzipped including the engine, the art and audio
under about 3 MB, and the first load under three seconds on 4G.

The next post is about the one decision that shaped everything else: one
button, and a trackpad.

[Play it](/play/) and see how many stars you can get.
