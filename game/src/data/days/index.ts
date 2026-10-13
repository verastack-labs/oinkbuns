import { parseDayConfig } from '../../core/dayConfig';
import type { DayConfig } from '../../core/types';
import day1 from './day1.json';

// Every file is validated at import time. Zod is cheap for a few small
// objects, and a bad file failing on startup beats a bad day failing
// mid-play. Plan 4 adds day2.json to day5.json to this list.
export const DAYS: DayConfig[] = [day1].map((raw) => parseDayConfig(raw)).sort((a, b) => a.id - b.id);

export function dayById(id: number): DayConfig {
  const day = DAYS.find((d) => d.id === id);
  if (!day) {
    throw new Error(`Unknown day id: ${id}`);
  }
  return day;
}
