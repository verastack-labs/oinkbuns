import { customerDef } from './customers';
import { makeOrder } from './orders';
import { pick, rangeFloat, type Rng } from './rng';
import type { CustomerId, DayConfig, Order } from './types';

/**
 * Spawning rule from spec 5.7: a customer appears when the queue is below
 * maxQueue and at least a random gap within spawnGapSeconds has passed
 * since the last spawn. The customer is drawn uniformly from the day's
 * list, the order size from its own sizes clamped to maxOrderSize, and
 * each bun is chip with probability chipChance. All randomness comes from
 * the one seeded generator, so a seed replays a day exactly.
 */
export interface Spawner {
  tick(dt: number, queueLength: number): { id: CustomerId; order: Order } | null;
}

export function createSpawner(config: DayConfig, rng: Rng): Spawner {
  const [lo, hi] = config.spawnGapSeconds;
  let sinceLast = 0;
  let gap = rangeFloat(rng, lo, hi);

  return {
    tick(dt, queueLength) {
      sinceLast += dt;
      if (queueLength >= config.maxQueue || sinceLast < gap) {
        return null;
      }
      const id = pick(rng, config.customers);
      const size = Math.min(pick(rng, customerDef(id).orderSizes), config.maxOrderSize);
      const order = makeOrder(size, config.chipChance, rng);
      sinceLast = 0;
      gap = rangeFloat(rng, lo, hi);
      return { id, order };
    },
  };
}
