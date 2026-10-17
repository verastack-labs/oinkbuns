/**
 * Every scene key in one place, so scenes start each other by constant and
 * never by a string that could drift. Keys for scenes that later plans add
 * are listed now so the set is fixed from the start.
 */
export const SceneKey = {
  Boot: 'Boot',
  Title: 'Title',
  DaySelect: 'DaySelect',
  DayIntro: 'DayIntro',
  Kitchen: 'Kitchen',
  DayEnd: 'DayEnd',
  Pause: 'Pause',
  StickerBook: 'StickerBook',
  Settings: 'Settings',
} as const;

export type SceneKeyName = (typeof SceneKey)[keyof typeof SceneKey];
