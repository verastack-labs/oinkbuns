import { describe, expect, it } from 'vitest';
import { Day, computeStars } from './day';
import { ICING_SECONDS, STATION_POINTS, WALKABLE } from './layout';
import type { DayConfig, DayEvent, Intent, Point } from './types';

const DT = 1 / 60;
const IDLE: Intent = { moveX: 0, moveY: 0, action: false };
const PRESS: Intent = { moveX: 0, moveY: 0, action: true };

const BASE: DayConfig = {
  id: 9,
  name: 'Test day',
  twist: 'Deterministic.',
  end: { type: 'customers', count: 1 },
  customers: ['george'],
  maxOrderSize: 1,
  maxQueue: 1,
  spawnGapSeconds: [0, 0],
  chipChance: 0,
  bakeSeconds: 1,
  burnWindowSeconds: null,
  patienceMultiplier: 1,
  tutorial: false,
  stars: [1, 2, 3],
};

function make(overrides: Partial<DayConfig> = {}, seed = 1): Day {
  return new Day({ ...BASE, ...overrides }, seed);
}

// Walks toward a point until Peppa reaches it or the walkable clamp all but
// stops her (sliding along a wall converges instead of halting, so "moved
// under half a pixel" is the stop). She is then inside the interaction
// radius by Task 1 step 7.
function walkTo(day: Day, target: Point): void {
  for (let i = 0; i < 900; i += 1) {
    const before = { x: day.state.peppa.x, y: day.state.peppa.y };
    const dx = target.x - before.x;
    const dy = target.y - before.y;
    const d = Math.hypot(dx, dy);
    if (d <= 1) {
      return;
    }
    day.tick(DT, { moveX: dx / d, moveY: dy / d, action: false });
    const after = day.state.peppa;
    if (Math.hypot(after.x - before.x, after.y - before.y) < 0.5) {
      return;
    }
  }
}

function wait(day: Day, seconds: number): DayEvent[] {
  const events: DayEvent[] = [];
  for (let t = 0; t < seconds - 1e-9; t += DT) {
    day.tick(DT, IDLE);
    events.push(...day.drain());
  }
  return events;
}

function act(day: Day): DayEvent[] {
  day.tick(DT, PRESS);
  return day.drain();
}

function types(events: DayEvent[]): string[] {
  return events.map((e) => e.type);
}

// Bowl, oven, wait for the ding, take, ice, wait for icing. Leaves Peppa at
// the icing table holding a plain hot cross bun.
function bakeOnePlainBun(day: Day): void {
  walkTo(day, STATION_POINTS.bowl);
  act(day);
  walkTo(day, STATION_POINTS['oven-0']);
  act(day);
  wait(day, day.config.bakeSeconds + 0.2);
  act(day);
  walkTo(day, STATION_POINTS.icing);
  act(day);
  wait(day, ICING_SECONDS + 0.1);
}

describe('Day', () => {
  it('ends a customers-ended day when served reaches the count and computes stars', () => {
    const day = make();
    expect(day.state.remaining).toBeNull();
    const first = wait(day, DT);
    expect(types(first)).toContain('customer-arrived');
    expect(day.state.queue).toHaveLength(1);
    expect(day.state.queue[0]).toMatchObject({ uid: 1, id: 'george', spot: 0 });

    bakeOnePlainBun(day);
    expect(day.state.held).toBe('hot-cross');

    walkTo(day, STATION_POINTS['counter-0']);
    expect(day.state.prompt).toEqual({ label: 'serve', station: 'counter-0' });
    const events = act(day);
    expect(types(events)).toEqual(['bun-served', 'order-complete', 'day-over']);
    expect(events[0]).toMatchObject({ uid: 1, kind: 'plain', pennies: 1 });
    expect(events[1]).toMatchObject({ uid: 1, id: 'george', tip: 1 });
    expect(events[2]).toEqual({ type: 'day-over', pennies: 2, stars: 2 });
    expect(day.state).toMatchObject({ over: true, pennies: 2, served: 1, stars: 2, held: null, prompt: null });

    const elapsed = day.state.elapsed;
    day.tick(1, PRESS);
    expect(day.state.elapsed).toBe(elapsed);
    expect(day.drain()).toEqual([]);
  });

  it('ends a time-ended day at zero after one last-seconds warning', () => {
    const day = make({ end: { type: 'time', seconds: 20 }, spawnGapSeconds: [100, 100] });
    expect(day.state.remaining).toBe(20);
    const all: DayEvent[] = [];
    for (let s = 0; s < 25; s += 1) {
      day.tick(1, IDLE);
      all.push(...day.drain());
      if (s === 4) {
        expect(day.state.remaining).toBe(15);
        expect(types(all)).toContain('last-seconds');
      }
    }
    expect(types(all).filter((t) => t === 'last-seconds')).toHaveLength(1);
    expect(types(all).filter((t) => t === 'day-over')).toHaveLength(1);
    expect(day.state).toMatchObject({ over: true, remaining: 0, pennies: 0, stars: 0, elapsed: 20 });
  });

  it('shows no prompt out of range, ignores the action there, and prompts in range', () => {
    const day = make({ spawnGapSeconds: [100, 100] });
    day.tick(DT, PRESS);
    expect(day.state.prompt).toBeNull();
    expect(day.state.held).toBeNull();
    expect(types(day.drain())).toEqual([]);

    walkTo(day, STATION_POINTS.bowl);
    expect(day.state.prompt).toEqual({ label: 'take-dough', station: 'bowl' });
    expect(types(act(day))).toEqual(['item-picked']);
    expect(day.state.held).toBe('dough');
    // Holding dough at the bowl: nothing applies, so no prompt (spec 5.4).
    expect(day.state.prompt).toBeNull();
  });

  it('clamps movement to the walkable rectangle and normalises diagonals', () => {
    const day = make({ spawnGapSeconds: [100, 100] });
    for (let i = 0; i < 600; i += 1) {
      day.tick(DT, { moveX: -1, moveY: -1, action: false });
    }
    expect(day.state.peppa).toMatchObject({ x: WALKABLE.x0, y: WALKABLE.y0, facing: 'left', moving: true });
    const start = { ...day.state.peppa };
    day.tick(1, { moveX: 1, moveY: 1, action: false });
    const moved = Math.hypot(day.state.peppa.x - start.x, day.state.peppa.y - start.y);
    expect(moved).toBeCloseTo(260, 5);
    day.tick(DT, IDLE);
    expect(day.state.peppa.moving).toBe(false);
  });

  it('locks movement while icing, then hands over the iced bun', () => {
    const day = make({ spawnGapSeconds: [100, 100] });
    walkTo(day, STATION_POINTS.bowl);
    act(day);
    walkTo(day, STATION_POINTS['oven-0']);
    act(day);
    wait(day, 1.2);
    act(day);
    expect(day.state.held).toBe('baked');
    walkTo(day, STATION_POINTS.icing);
    expect(types(act(day))).toEqual(['icing-started']);
    expect(day.state.icing.active).toBe(true);
    expect(day.state.prompt).toBeNull();

    const pinned = { x: day.state.peppa.x, y: day.state.peppa.y };
    for (let i = 0; i < 30; i += 1) {
      day.tick(DT, { moveX: 1, moveY: 0, action: true });
    }
    expect(day.state.peppa).toMatchObject(pinned);
    expect(day.state.icing.progress).toBeGreaterThan(0.4);
    expect(day.state.held).toBe('baked');

    const rest = wait(day, 0.6);
    expect(types(rest)).toContain('icing-done');
    expect(day.state.icing).toEqual({ active: false, progress: 0 });
    expect(day.state.held).toBe('hot-cross');
    day.tick(DT, { moveX: 1, moveY: 0, action: false });
    expect(day.state.peppa.x).toBeGreaterThan(pinned.x);
  });

  it('lets a customer leave sad at zero patience and closes the queue up (Review Focus 5)', () => {
    // George's 40 s times 0.05 is a 2 s fuse; with a zero gap two spawn one
    // tick apart, so the first leaves one tick before the second.
    const day = make({ maxQueue: 2, patienceMultiplier: 0.05, spawnGapSeconds: [0, 0] });
    day.tick(DT, IDLE);
    day.tick(DT, IDLE);
    day.drain();
    expect(day.state.queue.map((c) => [c.uid, c.spot])).toEqual([
      [1, 0],
      [2, 1],
    ]);
    expect(day.state.queue[0].patienceSeconds).toBeCloseTo(2, 6);

    let left: DayEvent | undefined;
    for (let i = 0; i < 200 && left === undefined; i += 1) {
      day.tick(DT, IDLE);
      left = day.drain().find((e) => e.type === 'customer-left-sad');
    }
    expect(left).toEqual({ type: 'customer-left-sad', uid: 1 });
    // The second customer moved to the front; a third may already have
    // arrived behind it (the gap is zero), and every spot equals its index.
    expect(day.state.queue[0]).toMatchObject({ uid: 2, spot: 0 });
    expect(day.state.queue.every((c, i) => c.spot === i)).toBe(true);
    expect(day.state.pennies).toBe(0);
  });

  it('shakes the head on the wrong kind and keeps the bun (Review Focus 2)', () => {
    const day = make({ chipChance: 1 });
    day.tick(DT, IDLE);
    expect(day.state.queue[0].order.buns.map((b) => b.kind)).toEqual(['chip']);
    bakeOnePlainBun(day);
    expect(day.state.held).toBe('hot-cross');
    walkTo(day, STATION_POINTS['counter-0']);
    expect(day.state.prompt).toEqual({ label: 'serve', station: 'counter-0' });
    const events = act(day);
    expect(events).toEqual([{ type: 'wrong-bun', uid: 1 }]);
    expect(day.state.held).toBe('hot-cross');
    expect(day.state.pennies).toBe(0);
    expect(day.state.queue[0].order.buns[0].served).toBe(false);
    expect(day.state.over).toBe(false);
  });

  it('points the tutorial hint around the loop until the first order completes', () => {
    const day = make({ tutorial: true, end: { type: 'customers', count: 2 } });
    const first = wait(day, DT);
    expect(first).toContainEqual({ type: 'hint-changed', station: 'bowl' });
    expect(day.state.hint).toBe('bowl');

    walkTo(day, STATION_POINTS.bowl);
    act(day);
    expect(day.state.hint).toBe('oven-0');
    walkTo(day, STATION_POINTS['oven-0']);
    act(day);
    expect(day.state.hint).toBe('oven-0'); // wait for the bake
    wait(day, 1.2);
    expect(day.state.hint).toBe('oven-0'); // ready: take it
    act(day);
    expect(day.state.hint).toBe('icing');
    walkTo(day, STATION_POINTS.icing);
    act(day);
    expect(day.state.hint).toBe('icing');
    wait(day, ICING_SECONDS + 0.1);
    expect(day.state.hint).toBe('counter-0');
    walkTo(day, STATION_POINTS['counter-0']);
    const served = act(day);
    expect(types(served)).toContain('order-complete');
    expect(served).toContainEqual({ type: 'hint-changed', station: null });
    expect(day.state.hint).toBeNull();
    expect(day.state.over).toBe(false);
    // A second customer arrives; the tutorial is over, so no new hint.
    wait(day, 1);
    expect(day.state.queue).toHaveLength(1);
    expect(day.state.hint).toBeNull();
  });

  it('hints the bin after the first burn until the burnt bun is binned, once per day', () => {
    const day = make({ burnWindowSeconds: 1, spawnGapSeconds: [100, 100] });
    const burnOne = (): DayEvent[] => {
      walkTo(day, STATION_POINTS.bowl);
      act(day);
      walkTo(day, STATION_POINTS['oven-0']);
      act(day);
      return wait(day, 2.5);
    };
    const events = burnOne();
    expect(types(events)).toContain('oven-ding');
    expect(types(events)).toContain('oven-burnt');
    expect(events).toContainEqual({ type: 'hint-changed', station: 'bin' });
    expect(day.state.oven[0].status).toBe('burnt');
    expect(day.state.prompt).toEqual({ label: 'take-bun', station: 'oven-0' });
    expect(types(act(day))).toEqual(['item-picked']);
    expect(day.state.held).toBe('burnt');
    expect(day.state.hint).toBe('bin');

    walkTo(day, STATION_POINTS.bin);
    expect(day.state.prompt).toEqual({ label: 'bin-it', station: 'bin' });
    const binned = act(day);
    expect(binned).toContainEqual({ type: 'binned', item: 'burnt' });
    expect(binned).toContainEqual({ type: 'hint-changed', station: null });
    expect(day.state.held).toBeNull();

    const again = burnOne();
    expect(types(again)).toContain('oven-burnt');
    expect(types(again)).not.toContain('hint-changed');
    expect(day.state.hint).toBeNull();
  });
});

describe('computeStars', () => {
  it('maps pennies to 0 to 3 stars by the thresholds', () => {
    expect(computeStars(0, [3, 5, 6])).toBe(0);
    expect(computeStars(2, [3, 5, 6])).toBe(0);
    expect(computeStars(3, [3, 5, 6])).toBe(1);
    expect(computeStars(4, [3, 5, 6])).toBe(1);
    expect(computeStars(5, [3, 5, 6])).toBe(2);
    expect(computeStars(6, [3, 5, 6])).toBe(3);
    expect(computeStars(99, [3, 5, 6])).toBe(3);
  });
});
