import type { BunKind, ItemKind, OvenSlotState } from './types';

/**
 * One oven slot: empty, baking, ready, burnt (spec 5.1 steps 3 and 4). Pure
 * functions over OvenSlotState; nothing here is mutated. `elapsed` counts
 * seconds in the current status, and the frame that crosses a boundary
 * carries its overshoot into the next status so timing is fair at any
 * frame rate.
 */
export interface OvenConfig {
  bakeSeconds: number;
  burnWindowSeconds: number | null;
}

export function emptySlot(): OvenSlotState {
  return { status: 'empty', kind: null, elapsed: 0 };
}

export function loadSlot(slot: OvenSlotState, kind: BunKind): OvenSlotState {
  if (slot.status !== 'empty') {
    throw new Error(`loadSlot: slot is ${slot.status}, not empty`);
  }
  return { status: 'baking', kind, elapsed: 0 };
}

export function tickSlot(
  slot: OvenSlotState,
  dt: number,
  cfg: OvenConfig,
): { slot: OvenSlotState; event: 'ding' | 'burnt' | null } {
  if (slot.status === 'baking') {
    const elapsed = slot.elapsed + dt;
    if (elapsed < cfg.bakeSeconds) {
      return { slot: { ...slot, elapsed }, event: null };
    }
    // The ding happened partway through this frame; the rest of the frame
    // already counts as ready time. A burn is checked from the next tick on.
    return { slot: { status: 'ready', kind: slot.kind, elapsed: elapsed - cfg.bakeSeconds }, event: 'ding' };
  }
  if (slot.status === 'ready') {
    const elapsed = slot.elapsed + dt;
    if (cfg.burnWindowSeconds !== null && elapsed >= cfg.burnWindowSeconds) {
      return {
        slot: { status: 'burnt', kind: slot.kind, elapsed: elapsed - cfg.burnWindowSeconds },
        event: 'burnt',
      };
    }
    return { slot: { ...slot, elapsed }, event: null };
  }
  if (slot.status === 'burnt') {
    return { slot: { ...slot, elapsed: slot.elapsed + dt }, event: null };
  }
  return { slot, event: null };
}

export function takeFromSlot(slot: OvenSlotState): { slot: OvenSlotState; item: ItemKind } {
  if (slot.status === 'ready') {
    return { slot: emptySlot(), item: slot.kind === 'chip' ? 'chip-baked' : 'baked' };
  }
  if (slot.status === 'burnt') {
    return { slot: emptySlot(), item: 'burnt' };
  }
  throw new Error(`takeFromSlot: slot is ${slot.status}, nothing to take`);
}
