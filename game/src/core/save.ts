import type { Stars } from './types';

/**
 * Progress (spec 7.6): best stars per day and the mute flag, stored as JSON
 * under one key. Everything goes through a KeyValueStore so the browser's
 * localStorage and a test's in-memory map look the same. A missing,
 * unreadable, or malformed value falls back to empty progress and nothing
 * here ever throws: a child's game must start even in a locked-down browser.
 */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface Progress {
  version: 1;
  bestStars: Record<string, Stars>;
  muted: boolean;
}

export const SAVE_KEY = 'oinkbuns.save.v1';

export function emptyProgress(): Progress {
  return { version: 1, bestStars: {}, muted: false };
}

function isStars(value: unknown): value is Stars {
  return value === 0 || value === 1 || value === 2 || value === 3;
}

function isProgress(value: unknown): value is Progress {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const o = value as Record<string, unknown>;
  if (o.version !== 1 || typeof o.muted !== 'boolean') {
    return false;
  }
  const best = o.bestStars;
  if (typeof best !== 'object' || best === null || Array.isArray(best)) {
    return false;
  }
  return Object.entries(best).every(([key, stars]) => /^\d+$/.test(key) && isStars(stars));
}

export function loadProgress(store: KeyValueStore): Progress {
  let raw: string | null;
  try {
    raw = store.getItem(SAVE_KEY);
  } catch {
    return emptyProgress();
  }
  if (raw === null || raw === '') {
    return emptyProgress();
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyProgress();
  }
  if (!isProgress(parsed)) {
    return emptyProgress();
  }
  return { version: 1, bestStars: { ...parsed.bestStars }, muted: parsed.muted };
}

export function saveProgress(store: KeyValueStore, progress: Progress): void {
  try {
    store.setItem(SAVE_KEY, JSON.stringify(progress));
  } catch {
    // Quota exceeded or storage blocked: play on without saving.
  }
}

// Keeps the max. Recording 0 stars is meaningful: it marks the day as
// finished with pennies, which is what unlocks the next one.
export function withStars(progress: Progress, dayId: number, stars: Stars): Progress {
  const key = String(dayId);
  const previous = progress.bestStars[key] ?? 0;
  const best = (stars > previous ? stars : previous) as Stars;
  return { ...progress, bestStars: { ...progress.bestStars, [key]: best } };
}

export function isDayUnlocked(progress: Progress, dayId: number): boolean {
  if (dayId <= 1) {
    return true;
  }
  return String(dayId - 1) in progress.bestStars;
}

export function createMemoryStore(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}
