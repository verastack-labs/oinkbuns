// The system reduce-motion setting (spec 6.4): tweens get shorter, confetti
// is disabled. Kept free of Phaser and DOM globals at module level so it can
// be checked in Node.
export type MatchMediaFn = (query: string) => { matches: boolean };

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
export const REDUCED_SCALE = 0.35;

export function detectReduceMotion(matchMedia: MatchMediaFn | undefined): boolean {
  if (typeof matchMedia !== 'function') return false;
  try {
    return matchMedia(REDUCED_MOTION_QUERY).matches === true;
  } catch {
    return false;
  }
}

export function reduceMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return detectReduceMotion((query) => window.matchMedia(query));
}

// Every tween and timed effect takes its duration through here. Reading the
// media query each call is cheap and means a setting changed mid-game applies
// to the next tween without a reload.
export function dur(ms: number): number {
  return reduceMotion() ? Math.max(1, Math.round(ms * REDUCED_SCALE)) : ms;
}
