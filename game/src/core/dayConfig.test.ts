import { describe, expect, it } from 'vitest';
import { DAYS, dayById } from '../data/days';
import day1 from '../data/days/day1.json';
import day2 from '../data/days/day2.json';
import day3 from '../data/days/day3.json';
import day4 from '../data/days/day4.json';
import day5 from '../data/days/day5.json';
import day6 from '../data/days/day6.json';
import day7 from '../data/days/day7.json';
import { CUSTOMERS } from './customers';
import { parseDayConfig } from './dayConfig';
import type { DayEnd } from './types';

const RAW: unknown[] = [day1, day2, day3, day4, day5, day6, day7];

// Spec section 5.7, both tables, copied by hand so a typo in a JSON file fails here.
const SPEC: Array<{
  id: number;
  name: string;
  end: DayEnd;
  maxQueue: number;
  maxOrderSize: number;
  customers: string[];
  burn: number | null;
  spawnGap: [number, number];
  stars: [number, number, number];
}> = [
  { id: 1, name: 'First Bake', end: { type: 'customers', count: 4 }, maxQueue: 1, maxOrderSize: 1, customers: ['george', 'suzy'], burn: null, spawnGap: [3, 5], stars: [3, 5, 6] },
  { id: 2, name: 'Busy Morning', end: { type: 'time', seconds: 90 }, maxQueue: 2, maxOrderSize: 2, customers: ['george', 'suzy', 'danny'], burn: null, spawnGap: [5, 9], stars: [6, 9, 12] },
  { id: 3, name: "Don't Burn Them!", end: { type: 'time', seconds: 90 }, maxQueue: 2, maxOrderSize: 2, customers: ['george', 'suzy', 'danny'], burn: 4, spawnGap: [5, 9], stars: [6, 9, 12] },
  { id: 4, name: 'Choc Chip Day', end: { type: 'time', seconds: 90 }, maxQueue: 2, maxOrderSize: 2, customers: ['george', 'suzy', 'danny'], burn: 4, spawnGap: [5, 9], stars: [8, 12, 16] },
  { id: 5, name: "Grandpa's Big Order", end: { type: 'time', seconds: 100 }, maxQueue: 3, maxOrderSize: 3, customers: ['george', 'suzy', 'danny', 'grandpa'], burn: 4, spawnGap: [4, 8], stars: [10, 15, 20] },
  { id: 6, name: 'Rush Hour', end: { type: 'time', seconds: 90 }, maxQueue: 3, maxOrderSize: 3, customers: ['george', 'suzy', 'danny', 'grandpa'], burn: 3.5, spawnGap: [2.5, 5], stars: [12, 18, 22] },
  { id: 7, name: 'The Big Bun Party', end: { type: 'time', seconds: 120 }, maxQueue: 3, maxOrderSize: 3, customers: ['george', 'suzy', 'danny', 'grandpa'], burn: 3, spawnGap: [3, 6], stars: [16, 24, 30] },
];

describe('day config files', () => {
  it('validates all five files against the schema', () => {
    for (const raw of RAW) {
      expect(() => parseDayConfig(raw)).not.toThrow();
    }
  });

  it('rejects a file that breaks the schema', () => {
    expect(() => parseDayConfig({ ...(day2 as object), maxQueue: 4 })).toThrow();
    expect(() => parseDayConfig({ ...(day2 as object), stars: [6, 9] })).toThrow();
    expect(() => parseDayConfig({ ...(day2 as object), end: { type: 'time' } })).toThrow();
  });

  it('exposes DAYS with ids 1 to 7 in order', () => {
    expect(DAYS.map((d) => d.id)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('resolves dayById for 1 to 7 and throws on 8', () => {
    for (const id of [1, 2, 3, 4, 5, 6, 7]) {
      expect(dayById(id).id).toBe(id);
    }
    expect(() => dayById(8)).toThrow();
    expect(() => dayById(0)).toThrow();
  });

  it('matches the spec tables in section 5.7', () => {
    for (const row of SPEC) {
      const day = dayById(row.id);
      expect(day.name).toBe(row.name);
      expect(day.end).toEqual(row.end);
      expect(day.maxQueue).toBe(row.maxQueue);
      expect(day.maxOrderSize).toBe(row.maxOrderSize);
      expect(day.customers).toEqual(row.customers);
      expect(day.burnWindowSeconds).toBe(row.burn);
      expect(day.spawnGapSeconds).toEqual(row.spawnGap);
      expect(day.stars).toEqual(row.stars);
      expect(day.bakeSeconds).toBe(4);
    }
  });

  it('keeps every day consistent with the day before it', () => {
    // Review Focus 1: data that is schema-valid but inconsistent with the spec.
    for (const day of DAYS) {
      for (const id of day.customers) {
        expect(CUSTOMERS[id], `day ${day.id} lists unknown customer ${id}`).toBeDefined();
      }
      expect(day.stars[0]).toBeLessThan(day.stars[1]);
      expect(day.stars[1]).toBeLessThan(day.stars[2]);
      expect(day.maxOrderSize).toBeGreaterThanOrEqual(1);
      expect(day.spawnGapSeconds[0]).toBeLessThanOrEqual(day.spawnGapSeconds[1]);
      // Burning switches on at day 3 and stays on.
      expect(day.burnWindowSeconds === null).toBe(day.id < 3);
      // The chip jar appears on day 4 and stays.
      expect(day.chipChance > 0).toBe(day.id >= 4);
      // Only day 1 runs the tutorial arrow.
      expect(day.tutorial).toBe(day.id === 1);
    }
  });
});
