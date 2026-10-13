import { parseDayConfig } from '../../core/dayConfig';
import type { DayConfig } from '../../core/types';
import day1 from './day1.json';
import day2 from './day2.json';
import day3 from './day3.json';
import day4 from './day4.json';
import day5 from './day5.json';

// Every file is validated at import time. Zod is cheap for five small objects,
// and a bad file failing on startup beats a bad day failing mid-play.
export const DAYS: DayConfig[] = [day1, day2, day3, day4, day5]
  .map((raw) => parseDayConfig(raw))
  .sort((a, b) => a.id - b.id);

export function dayById(id: number): DayConfig {
  const day = DAYS.find((d) => d.id === id);
  if (!day) {
    throw new Error(`Unknown day id: ${id}`);
  }
  return day;
}
