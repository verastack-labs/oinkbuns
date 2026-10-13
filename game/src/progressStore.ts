import {
  createMemoryStore,
  loadProgress,
  saveProgress,
  type KeyValueStore,
  type Progress,
} from './core/save';

/**
 * The one place the game touches localStorage. Reads are cached after the
 * first load; every update writes through. If localStorage is unavailable
 * (private mode in some browsers, or a sandboxed frame throws on access),
 * progress lives in memory for the session and the game still runs.
 */
function pickStore(): KeyValueStore {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
  } catch {
    // Access itself threw: fall through to memory.
  }
  return createMemoryStore();
}

const store = pickStore();
let cached: Progress | null = null;

export function getProgress(): Progress {
  if (cached === null) {
    cached = loadProgress(store);
  }
  return cached;
}

export function updateProgress(fn: (p: Progress) => Progress): Progress {
  const next = fn(getProgress());
  cached = next;
  saveProgress(store, next);
  return next;
}
