import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';

/**
 * Logical size 1280 by 720 (spec 5.2). Scale.FIT keeps that aspect ratio
 * inside whatever the window gives and CENTER_BOTH centres the canvas, so the
 * page background (the wall colour, see index.html) forms the letterbox bars.
 */
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#fff1d6',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, TitleScene],
};
