import { FONT } from './theme';

// Resolves once both Fredoka weights are usable by Phaser text, or after
// timeoutMs so a missing font file can never hold the game on the loader.
export async function loadFonts(timeoutMs = 3000): Promise<boolean> {
  if (typeof document === 'undefined' || !('fonts' in document)) return false;
  const load = Promise.all([
    document.fonts.load(`400 24px ${FONT}`),
    document.fonts.load(`600 24px ${FONT}`),
  ]).then(() => document.fonts.check(`400 24px ${FONT}`));
  const timeout = new Promise<boolean>((resolve) => {
    setTimeout(() => resolve(false), timeoutMs);
  });
  try {
    return await Promise.race([load, timeout]);
  } catch {
    return false;
  }
}
