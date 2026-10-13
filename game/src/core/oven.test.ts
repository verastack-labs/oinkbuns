import { describe, expect, it } from 'vitest';
import { emptySlot, loadSlot, takeFromSlot, tickSlot, type OvenConfig } from './oven';
import type { OvenSlotState } from './types';

const NO_BURN: OvenConfig = { bakeSeconds: 4, burnWindowSeconds: null };
const BURNS: OvenConfig = { bakeSeconds: 4, burnWindowSeconds: 4 };

// Ticks a slot in equal steps and returns the final slot plus every event seen.
function run(slot: OvenSlotState, steps: number, dt: number, cfg: OvenConfig) {
  const events: Array<'ding' | 'burnt'> = [];
  let current = slot;
  for (let i = 0; i < steps; i += 1) {
    const r = tickSlot(current, dt, cfg);
    current = r.slot;
    if (r.event !== null) {
      events.push(r.event);
    }
  }
  return { slot: current, events };
}

describe('oven slot', () => {
  it('starts empty and loading starts a bake of that kind', () => {
    const slot = loadSlot(emptySlot(), 'chip');
    expect(emptySlot()).toEqual({ status: 'empty', kind: null, elapsed: 0 });
    expect(slot).toEqual({ status: 'baking', kind: 'chip', elapsed: 0 });
  });

  it('refuses to load a slot that is not empty', () => {
    const baking = loadSlot(emptySlot(), 'plain');
    expect(() => loadSlot(baking, 'plain')).toThrow(/not empty/);
  });

  it('dings exactly once when bakeSeconds is reached and stays ready', () => {
    const baking = loadSlot(emptySlot(), 'plain');
    const before = run(baking, 39, 0.1, NO_BURN); // 3.9 s
    expect(before.slot.status).toBe('baking');
    expect(before.events).toEqual([]);
    const after = run(before.slot, 2, 0.1, NO_BURN); // 4.1 s
    expect(after.slot.status).toBe('ready');
    expect(after.events).toEqual(['ding']);
    const later = run(after.slot, 600, 0.1, NO_BURN); // a further 60 s
    expect(later.slot.status).toBe('ready');
    expect(later.events).toEqual([]);
  });

  it('carries the overshoot of the dinging frame into the ready time (Review Focus 3)', () => {
    const baking = loadSlot(emptySlot(), 'plain');
    const a = tickSlot(baking, 3.95, BURNS);
    expect(a.event).toBeNull();
    const b = tickSlot(a.slot, 0.1, BURNS);
    expect(b.event).toBe('ding');
    expect(b.slot.status).toBe('ready');
    expect(b.slot.elapsed).toBeCloseTo(0.05, 6);
  });

  it('burns once the burn window after the ding, and not when the window is null', () => {
    const ready = tickSlot(loadSlot(emptySlot(), 'chip'), 4, BURNS).slot;
    expect(ready.status).toBe('ready');
    const nearly = run(ready, 39, 0.1, BURNS); // 3.9 s after the ding
    expect(nearly.slot.status).toBe('ready');
    const burnt = run(nearly.slot, 2, 0.1, BURNS); // 4.1 s after the ding
    expect(burnt.slot.status).toBe('burnt');
    expect(burnt.slot.kind).toBe('chip');
    expect(burnt.events).toEqual(['burnt']);
    const still = run(burnt.slot, 100, 0.1, BURNS);
    expect(still.events).toEqual([]);

    const safe = run(tickSlot(loadSlot(emptySlot(), 'plain'), 4, NO_BURN).slot, 1000, 0.1, NO_BURN);
    expect(safe.slot.status).toBe('ready');
  });

  it('gives the right item when taken and empties the slot', () => {
    const readyPlain = tickSlot(loadSlot(emptySlot(), 'plain'), 4, NO_BURN).slot;
    const readyChip = tickSlot(loadSlot(emptySlot(), 'chip'), 4, NO_BURN).slot;
    const burnt = tickSlot(tickSlot(loadSlot(emptySlot(), 'plain'), 4, BURNS).slot, 4, BURNS).slot;
    expect(takeFromSlot(readyPlain)).toEqual({ slot: emptySlot(), item: 'baked' });
    expect(takeFromSlot(readyChip)).toEqual({ slot: emptySlot(), item: 'chip-baked' });
    expect(takeFromSlot(burnt)).toEqual({ slot: emptySlot(), item: 'burnt' });
    expect(() => takeFromSlot(emptySlot())).toThrow(/nothing to take/);
    expect(() => takeFromSlot(loadSlot(emptySlot(), 'plain'))).toThrow(/nothing to take/);
  });
});
