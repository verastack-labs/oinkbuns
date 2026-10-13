/**
 * A tiny seeded random generator so a day can be replayed exactly in tests
 * (spec 5.7). mulberry32 is a well-known 32-bit generator: good enough spread
 * for picking customers and gaps, and deterministic for a given seed.
 */
export type Rng = () => number; // 0 inclusive to 1 exclusive

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rangeFloat(rng: Rng, lo: number, hi: number): number {
  return lo + rng() * (hi - lo);
}

// Inclusive at both ends: rangeInt(rng, 1, 3) gives 1, 2, or 3.
export function rangeInt(rng: Rng, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error('pick: the list is empty');
  }
  return items[Math.floor(rng() * items.length)];
}

export function chance(rng: Rng, probability: number): boolean {
  return rng() < probability;
}
