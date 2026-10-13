import { describe, expect, it } from 'vitest';
import { DAYS, dayById } from '../data/days';
import day1 from '../data/days/day1.json';
import { CUSTOMERS } from './customers';
import { parseDayConfig } from './dayConfig';

// Plan 2 ships day 1 only. Plan 4 replaces this file with the five-day version.
const RAW: unknown[] = [day1];

describe('day files', () => {
  it('every day file parses against the schema', () => {
    for (const raw of RAW) {
      expect(() => parseDayConfig(raw)).not.toThrow();
    }
  });

  it('day 1 matches spec 5.7 and 7.5', () => {
    const day = parseDayConfig(day1);
    expect(day.id).toBe(1);
    expect(day.name).toBe('First Bake');
    expect(day.end).toEqual({ type: 'customers', count: 4 });
    expect(day.customers).toEqual(['george', 'suzy']);
    expect(day.maxOrderSize).toBe(1);
    expect(day.maxQueue).toBe(1);
    expect(day.spawnGapSeconds).toEqual([3, 5]);
    expect(day.chipChance).toBe(0);
    expect(day.bakeSeconds).toBe(4);
    expect(day.burnWindowSeconds).toBeNull();
    expect(day.tutorial).toBe(true);
    expect(day.stars).toEqual([3, 5, 6]);
  });

  it('every customer id in a day file exists in the customer table', () => {
    for (const day of DAYS) {
      for (const id of day.customers) {
        expect(CUSTOMERS[id]).toBeDefined();
      }
    }
  });

  it('rejects files that break the schema', () => {
    expect(() => parseDayConfig({ ...day1, maxQueue: 4 })).toThrow();
    expect(() => parseDayConfig({ ...day1, burnWindowSeconds: 'never' })).toThrow();
    expect(() => parseDayConfig({ ...day1, end: { type: 'forever' } })).toThrow();
    expect(() => parseDayConfig({ ...day1, customers: ['peppa'] })).toThrow();
    expect(() => parseDayConfig({ ...day1, spawnGapSeconds: [5, 3] })).toThrow();
    expect(() => parseDayConfig({ ...day1, stars: [6, 5, 3] })).toThrow();
    expect(() => parseDayConfig({ ...day1, chipChance: 1.5 })).toThrow();
    expect(() => parseDayConfig(null)).toThrow();
  });

  it('exposes DAYS sorted by id and dayById that throws on unknown ids', () => {
    expect(DAYS.map((d) => d.id)).toEqual([1]);
    expect(dayById(1).name).toBe('First Bake');
    expect(() => dayById(2)).toThrow(/Unknown day id/);
  });
});
