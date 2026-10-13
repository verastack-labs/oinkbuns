import Phaser from 'phaser';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './core/layout';
import { BootScene } from './scenes/BootScene';
import { DayEndOverlay } from './scenes/DayEndOverlay';
import { DayIntroScene } from './scenes/DayIntroScene';
import { KitchenScene } from './scenes/KitchenScene';
import { TitleScene } from './scenes/TitleScene';
import { COLORS } from './ui/theme';

/**
 * Logical size 1280 by 720 (spec 5.2). Scale.FIT keeps that aspect ratio
 * inside whatever the window gives and CENTER_BOTH centres the canvas, so
 * the page background (the wall colour, see index.html) forms the letterbox
 * bars (spec 7.7).
 */
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: LOGICAL_WIDTH,
  height: LOGICAL_HEIGHT,
  backgroundColor: COLORS.wall,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, TitleScene, DayIntroScene, KitchenScene, DayEndOverlay],
};
