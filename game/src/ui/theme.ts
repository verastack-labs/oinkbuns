/**
 * The palette (mirrored in oinkbuns-internal/assets-src/palette.md and the
 * landing page's globals.css) and the font. Fredoka's files arrive in plan 3;
 * until then FONT_STACK falls back to a system sans-serif so text stays
 * readable in the placeholder build.
 */
export const FONT = 'Fredoka';
export const FONT_STACK = `${FONT}, 'Segoe UI', sans-serif`;

export const COLORS = {
  peppaPink: 0xf4a6c6,
  peppaRed: 0xe84a5f,
  georgeBlue: 0x4a90e2,
  wall: 0xfff1d6,
  floor: 0xd9a066,
  outline: 0x3a2a2a,
  bun: 0xc8803a,
  cream: 0xfff8e7,
  text: 0x3a2a2a,
  good: 0x6cc24a,
  bad: 0xe84a5f,
  skyBlue: 0x9ad7f5,
  grassGreen: 0x7bc96f,
} as const;

// Phaser Text styles take CSS colour strings, Graphics take numbers.
export function cssColor(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}
