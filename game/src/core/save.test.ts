import { describe, expect, it } from 'vitest';
import {
  createMemoryStore,
  emptyProgress,
  isDayUnlocked,
  loadProgress,
  SAVE_KEY,
  saveProgress,
  withStars,
  hasSticker,
  type KeyValueStore,
} from './save';

function storeWith(value: string): KeyValueStore {
  const store = createMemoryStore();
  store.setItem(SAVE_KEY, value);
  return store;
}

describe('save', () => {
  it('uses the contract key and an empty progress shape', () => {
    expect(SAVE_KEY).toBe('oinkbuns.save.v1');
    expect(emptyProgress()).toEqual({ version: 1, bestStars: {}, muted: false, slowCustomers: false, bigTargets: false, bestRush: 0 });
  });

  it('falls back to empty progress when nothing is stored', () => {
    expect(loadProgress(createMemoryStore())).toEqual(emptyProgress());
  });

  it('falls back to empty progress on invalid JSON', () => {
    expect(loadProgress(storeWith('{not json'))).toEqual(emptyProgress());
    expect(loadProgress(storeWith(''))).toEqual(emptyProgress());
  });

  it('falls back to empty progress when the JSON has the wrong shape (Review Focus 4)', () => {
    const bad = [
      '{"version":2,"bestStars":{},"muted":false}',
      '{"version":1,"bestStars":{"1":5},"muted":false}',
      '{"version":1,"bestStars":[3],"muted":false}',
      '{"version":1,"bestStars":{},"muted":"no"}',
      '{"version":1,"bestStars":{"one":1},"muted":false}',
      '{"version":1,"muted":false}',
      'null',
      '42',
      '"a string"',
    ];
    for (const value of bad) {
      expect(loadProgress(storeWith(value)), value).toEqual(emptyProgress());
    }
  });

  it('never throws when the store itself throws', () => {
    const broken: KeyValueStore = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    expect(loadProgress(broken)).toEqual(emptyProgress());
    expect(() => saveProgress(broken, emptyProgress())).not.toThrow();
  });

  it('round-trips valid progress', () => {
    const store = createMemoryStore();
    const progress = { version: 1 as const, bestStars: { '1': 3 as const, '2': 1 as const }, muted: true, slowCustomers: true, bigTargets: false, bestRush: 12 };
    saveProgress(store, progress);
    expect(JSON.parse(store.getItem(SAVE_KEY) ?? '')).toEqual(progress);
    expect(loadProgress(store)).toEqual(progress);
  });

  it('loads an older save that has no settings as settings off', () => {
    const store = createMemoryStore();
    store.setItem(SAVE_KEY, JSON.stringify({ version: 1, bestStars: { '1': 2 }, muted: false }));
    expect(loadProgress(store)).toEqual({ version: 1, bestStars: { '1': 2 }, muted: false, slowCustomers: false, bigTargets: false, bestRush: 0 });
  });

  it('hasSticker is true only for days finished with three stars', () => {
    const p = withStars(withStars(emptyProgress(), 1, 3), 2, 2);
    expect(hasSticker(p, 1)).toBe(true);
    expect(hasSticker(p, 2)).toBe(false);
    expect(hasSticker(p, 3)).toBe(false);
  });

  it('withStars keeps the best result and never lowers it', () => {
    const a = withStars(emptyProgress(), 1, 2);
    expect(a.bestStars).toEqual({ '1': 2 });
    const b = withStars(a, 1, 1);
    expect(b.bestStars).toEqual({ '1': 2 });
    const c = withStars(b, 2, 0);
    expect(c.bestStars).toEqual({ '1': 2, '2': 0 });
    expect(emptyProgress().bestStars).toEqual({});
  });

  it('unlocks day 1 always and each later day once the previous one is recorded', () => {
    const none = emptyProgress();
    expect(isDayUnlocked(none, 1)).toBe(true);
    expect(isDayUnlocked(none, 2)).toBe(false);
    const dayOneDone = withStars(none, 1, 0);
    expect(isDayUnlocked(dayOneDone, 2)).toBe(true);
    expect(isDayUnlocked(dayOneDone, 3)).toBe(false);
  });
});
