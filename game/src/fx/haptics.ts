// A short vibration where the device supports it (spec 6.3). iOS Safari has
// no navigator.vibrate and some browsers throw when called without a recent
// gesture, so this never throws and is a no-op when unsupported.
export function buzz(ms = 30): void {
  if (typeof navigator === 'undefined') return;
  const nav = navigator as Navigator & { vibrate?: (pattern: number | number[]) => boolean };
  if (typeof nav.vibrate !== 'function') return;
  try {
    nav.vibrate(ms);
  } catch {
    // Unsupported or blocked: the serve still happened, nothing to do.
  }
}
