import { parseDayConfig } from '../../core/dayConfig';
import type { DayConfig } from '../../core/types';
import day1 from './day1.json';
import day2 from './day2.json';
import day3 from './day3.json';
import day4 from './day4.json';
import day5 from './day5.json';
import day6 from './day6.json';
import day7 from './day7.json';
import rush from './rush.json';

// Every file is validated at import time. Zod is cheap for seven small objects,
// and a bad file failing on startup beats a bad day failing mid-play.
export const DAYS: DayConfig[] = [day1, day2, day3, day4, day5, day6, day7]
  .map((raw) => parseDayConfig(raw))
  .sort((a, b) => a.id - b.id);

// The endless Bun Rush has its own id and is not one of the numbered days.
export const RUSH_ID = 100;
export const RUSH: DayConfig = parseDayConfig(rush);

export function dayById(id: number): DayConfig {
  const day = id === RUSH_ID ? RUSH : DAYS.find((d) => d.id === id);
  if (!day) {
    throw new Error(`Unknown day id: ${id}`);
  }
  return day;
}
