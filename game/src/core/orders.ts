import { chance, type Rng } from './rng';
import type { BunKind, Order, OrderBun } from './types';

/**
 * Orders, matching, pennies, and the tip (spec 5.6). An order is a list of
 * bun kinds; each served bun fills the next unfilled slot of its kind.
 * Pennies: plain pays 1, choc-chip pays 2 ("one a penny, two a penny").
 * Completing with patience still above half earns a 1 penny tip.
 */
export function makeOrder(size: number, chipChance: number, rng: Rng): Order {
  const buns: OrderBun[] = [];
  for (let i = 0; i < size; i += 1) {
    buns.push({ kind: chance(rng, chipChance) ? 'chip' : 'plain', served: false });
  }
  return { buns };
}

export function needs(order: Order, kind: BunKind): boolean {
  return order.buns.some((bun) => !bun.served && bun.kind === kind);
}

// Marks the first unserved bun of that kind. Returns a new order; when no
// bun matches the order comes back unchanged (callers check needs() first).
export function serveBun(order: Order, kind: BunKind): Order {
  const index = order.buns.findIndex((bun) => !bun.served && bun.kind === kind);
  if (index === -1) {
    return { buns: order.buns.map((bun) => ({ ...bun })) };
  }
  return {
    buns: order.buns.map((bun, i) => (i === index ? { ...bun, served: true } : { ...bun })),
  };
}

export function isComplete(order: Order): boolean {
  return order.buns.every((bun) => bun.served);
}

export function penniesForBun(kind: BunKind): 1 | 2 {
  return kind === 'chip' ? 2 : 1;
}

export function tipFor(patience: number): 0 | 1 {
  return patience > 0.5 ? 1 : 0;
}
