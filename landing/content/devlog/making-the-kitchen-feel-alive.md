---
title: Making the kitchen feel alive
date: "2026-10-13"
summary: Original art drawn from code, a little perspective, and a sound for every single thing you do.
cover: /art/grandpa-happy.svg
---

The first playable kitchen was a set of coloured rectangles. The rules all
worked: dough went in the oven, the oven dinged, George paid a penny. But a
pink rectangle walking to a blue rectangle does not make anyone want to play
again. This post is about everything that turned the rectangles into a
kitchen.

## Art drawn by a script

Every picture in the game is an original SVG drawn in the show's flat style:
side-on heads with both eyes on one side, thin dark outlines, flat colours.
Rather than draw 53 files by hand, one script draws them all from a short
description of each character. That means every pose of Peppa shares the
same head, and a change to her snout lands in all four poses at once.

When the first set went in, the characters looked a little stiff, so the
script grew three small changes: bigger heads, glossy eyes with a white
catch-light, and rosier cheeks. Cuteness turned out to be about proportions
far more than detail.

## A little depth

Flat is the house style, but a completely flat kitchen felt like a menu. A
few cheap tricks give it room to breathe:

- Peppa is drawn a little smaller at the back of the kitchen and a little
  bigger at the front, so walking toward you feels like walking toward you.
- Everything on the floor sits on a soft shadow, and the floor darkens
  toward the wall.
- Things are drawn front to back by where they touch the floor, so Peppa
  can walk behind the icing table instead of floating over it.
- She bounces slightly as she walks.

## Checking for overlaps

Playing through every screen turned up a list of things sitting on top of
other things: the title running into its tagline, Peppa hiding the customer
she was serving, the oven covering her while she loaded it, the stars
spilling off the day cards, and two pause-menu buttons whose click areas
overlapped. Each one is the kind of thing a seven year old will find in the
first minute, so each one was fixed and checked again.

## A sound for everything

The effects come from free, public-domain sound packs by Kenney: the oven
door, the ding, coins, clicks, a pop when a customer arrives. A few sounds no
pack had were made in code: a sizzle and a sad "bwomp" for a burnt bun, a
squeeze for the icing, a short voice blip for each customer, and the "Hot
Cross Buns" rhyme played on a toy piano. Every clip's source and licence is
written down in the repository.

Then the small stuff: buttons tick when you hover them, the oven glows and
steams when a bun is ready, customers sparkle when served, pennies fly to the
counter, and pressing the button with nothing to do gets a gentle "nope"
instead of silence.

[Hear it for yourself](/play/), with the sound on.
