import type { BunKind, ItemKind, OvenSlotState, PromptLabel, StationKind } from './types';

/**
 * The table from spec 5.4, as a function: what does the action do at a
 * station given what Peppa holds? Customers are not stations in this sense;
 * day.ts handles serving with servableKind plus the order's needs. A null
 * result means "nothing applies" and the prompt bubble stays hidden.
 */
export type StationEffect =
  | { kind: 'take-dough' }
  | { kind: 'add-chips' }
  | { kind: 'oven-load'; bun: BunKind }
  | { kind: 'oven-take'; item: ItemKind }
  | { kind: 'icing-start' }
  | { kind: 'bin'; item: ItemKind };

export interface RecipeResult {
  label: PromptLabel;
  // What Peppa holds right after the action. For 'icing-start' it is the bun
  // she walked up with; day.ts swaps it for the iced bun when icing finishes.
  held: ItemKind | null;
  effect: StationEffect;
}

export function stationAction(
  held: ItemKind | null,
  station: Exclude<StationKind, 'counter'>,
  slot?: OvenSlotState,
): RecipeResult | null {
  if (station === 'bowl') {
    return held === null ? { label: 'take-dough', held: 'dough', effect: { kind: 'take-dough' } } : null;
  }
  if (station === 'chipJar') {
    return held === 'dough' ? { label: 'add-chips', held: 'chip-dough', effect: { kind: 'add-chips' } } : null;
  }
  if (station === 'oven') {
    return ovenAction(held, slot);
  }
  if (station === 'icing') {
    if (held === 'baked' || held === 'chip-baked') {
      return { label: 'ice-bun', held, effect: { kind: 'icing-start' } };
    }
    return null;
  }
  // bin: anything goes in, hands come out empty
  return held === null ? null : { label: 'bin-it', held: null, effect: { kind: 'bin', item: held } };
}

function ovenAction(held: ItemKind | null, slot?: OvenSlotState): RecipeResult | null {
  if (!slot) {
    return null;
  }
  if (slot.status === 'empty' && (held === 'dough' || held === 'chip-dough')) {
    return {
      label: 'load-oven',
      held: null,
      effect: { kind: 'oven-load', bun: held === 'dough' ? 'plain' : 'chip' },
    };
  }
  if (held !== null) {
    return null;
  }
  if (slot.status === 'ready') {
    const item: ItemKind = slot.kind === 'chip' ? 'chip-baked' : 'baked';
    return { label: 'take-bun', held: item, effect: { kind: 'oven-take', item } };
  }
  if (slot.status === 'burnt') {
    return { label: 'take-bun', held: 'burnt', effect: { kind: 'oven-take', item: 'burnt' } };
  }
  return null;
}

// 'plain' for hot-cross, 'chip' for chip-hot-cross, null for anything else.
export function servableKind(held: ItemKind | null): BunKind | null {
  if (held === 'hot-cross') {
    return 'plain';
  }
  if (held === 'chip-hot-cross') {
    return 'chip';
  }
  return null;
}

export function icedItemFor(baked: 'baked' | 'chip-baked'): 'hot-cross' | 'chip-hot-cross' {
  return baked === 'baked' ? 'hot-cross' : 'chip-hot-cross';
}
