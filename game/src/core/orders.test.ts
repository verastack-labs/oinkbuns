import { describe, expect, it } from 'vitest';
import { isComplete, makeOrder, needs, penniesForBun, serveBun, tipFor } from './orders';
import { mulberry32 } from './rng';
import type { Order } from './types';

const mixed: Order = {
  buns: [
    { kind: 'plain', served: false },
    { kind: 'chip', served: false },
    { kind: 'plain', served: false },
  ],
};

describe('orders', () => {
  it('makes an order of the asked size with kinds driven by chipChance', () => {
    expect(makeOrder(3, 0, mulberry32(1)).buns.map((b) => b.kind)).toEqual(['plain', 'plain', 'plain']);
    expect(makeOrder(2, 1, mulberry32(1)).buns.map((b) => b.kind)).toEqual(['chip', 'chip']);
    expect(makeOrder(2, 0.5, mulberry32(7)).buns.every((b) => b.served === false)).toBe(true);
    // Same seed, same order: the spawner relies on this for replayable days.
    expect(makeOrder(3, 0.5, mulberry32(42))).toEqual(makeOrder(3, 0.5, mulberry32(42)));
  });

  it('needs a kind only while an unserved bun of that kind remains', () => {
    expect(needs(mixed, 'plain')).toBe(true);
    expect(needs(mixed, 'chip')).toBe(true);
    const oneChipServed = serveBun(mixed, 'chip');
    expect(needs(oneChipServed, 'chip')).toBe(false);
    expect(needs(oneChipServed, 'plain')).toBe(true);
  });

  it('serves the first unserved bun of the kind and leaves the rest alone', () => {
    const once = serveBun(mixed, 'plain');
    expect(once.buns.map((b) => b.served)).toEqual([true, false, false]);
    const twice = serveBun(once, 'plain');
    expect(twice.buns.map((b) => b.served)).toEqual([true, false, true]);
    // The original is untouched (serveBun returns a new order).
    expect(mixed.buns.map((b) => b.served)).toEqual([false, false, false]);
    // Nothing to serve: the order comes back equal, not broken.
    expect(serveBun(twice, 'plain')).toEqual(twice);
  });

  it('is complete only when every bun is served', () => {
    expect(isComplete(mixed)).toBe(false);
    const done = serveBun(serveBun(serveBun(mixed, 'plain'), 'chip'), 'plain');
    expect(isComplete(done)).toBe(true);
    expect(isComplete({ buns: [] })).toBe(true);
  });

  it('pays one a penny, two a penny', () => {
    expect(penniesForBun('plain')).toBe(1);
    expect(penniesForBun('chip')).toBe(2);
  });

  it('tips one penny only when patience is still above half', () => {
    expect(tipFor(1)).toBe(1);
    expect(tipFor(0.51)).toBe(1);
    expect(tipFor(0.5)).toBe(0);
    expect(tipFor(0)).toBe(0);
  });
});
