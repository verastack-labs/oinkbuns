import type { Stars } from '../core/types';

// The data objects passed between scenes with scene.start and scene.launch.
export interface DayIntroData {
  dayId: number;
}
export interface KitchenData {
  dayId: number;
  seed: number;
}
export interface DayEndData {
  dayId: number;
  pennies: number;
  stars: Stars;
}
