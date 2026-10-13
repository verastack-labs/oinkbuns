import Phaser from 'phaser';
import { gameConfig } from './config';

const game = new Phaser.Game(gameConfig);

// In development only, expose the game so the manual checks in the plans can
// inspect scenes from the DevTools console (`game.scene.keys.Kitchen`).
if (import.meta.env.DEV) {
  (window as unknown as { game: Phaser.Game }).game = game;
}
