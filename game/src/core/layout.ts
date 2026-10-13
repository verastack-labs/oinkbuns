import type { Point, StationId, StationKind } from './types';

/**
 * The kitchen's geometry in logical pixels (spec 5.2). Stations sit on the
 * edges, Peppa walks inside WALKABLE, and a station is in range when her feet
 * are within INTERACT_RADIUS of its point. Every point here was chosen so that
 * the clamped walkable position nearest a station is 50 to 60 px from it,
 * inside the radius, and no two stations are ever in range at once.
 */
export const LOGICAL_WIDTH = 1280;
export const LOGICAL_HEIGHT = 720;
export const PEPPA_SPEED = 260; // logical px per second
export const INTERACT_RADIUS = 70;
export const POINTER_STOP_RADIUS = 24;
export const ICING_SECONDS = 1;
export const LAST_SECONDS_WARNING = 15;
export const PEPPA_START: Point = { x: 640, y: 420 };
// x0 and x1 keep Peppa beside the bowl and oven rather than inside them;
// each station point is still 65 px from the nearest walkable spot.
// y0 stops Peppa at the front of the counter, so her head stays below the
// customers standing behind it and never hides them.
export const WALKABLE = { x0: 165, y0: 290, x1: 1095, y1: 600 };

export const STATION_POINTS: Record<StationId, Point> = {
  bowl: { x: 100, y: 330 },
  chipJar: { x: 100, y: 450 },
  'oven-0': { x: 1160, y: 330 },
  'oven-1': { x: 1160, y: 450 },
  icing: { x: 520, y: 650 },
  bin: { x: 820, y: 650 },
  'counter-0': { x: 400, y: 230 },
  'counter-1': { x: 640, y: 230 },
  'counter-2': { x: 880, y: 230 },
};

export function stationKindOf(id: StationId): StationKind {
  if (id === 'oven-0' || id === 'oven-1') {
    return 'oven';
  }
  if (id === 'counter-0' || id === 'counter-1' || id === 'counter-2') {
    return 'counter';
  }
  return id;
}

export function ovenIndexOf(id: StationId): 0 | 1 | null {
  if (id === 'oven-0') {
    return 0;
  }
  if (id === 'oven-1') {
    return 1;
  }
  return null;
}

export function counterIndexOf(id: StationId): 0 | 1 | 2 | null {
  if (id === 'counter-0') {
    return 0;
  }
  if (id === 'counter-1') {
    return 1;
  }
  if (id === 'counter-2') {
    return 2;
  }
  return null;
}

export function ovenId(index: 0 | 1): StationId {
  return index === 0 ? 'oven-0' : 'oven-1';
}

export function counterId(spot: 0 | 1 | 2): StationId {
  if (spot === 0) {
    return 'counter-0';
  }
  return spot === 1 ? 'counter-1' : 'counter-2';
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function clampToWalkable(p: Point): Point {
  return {
    x: Math.min(Math.max(p.x, WALKABLE.x0), WALKABLE.x1),
    y: Math.min(Math.max(p.y, WALKABLE.y0), WALKABLE.y1),
  };
}
