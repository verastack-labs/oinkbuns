import Phaser from 'phaser';
import { SceneKey } from './keys';

const BAR_WIDTH = 400;
const BAR_HEIGHT = 28;
const OUTLINE = 0x3a2a2a; // COLORS.outline (plan 2 moves these to ui/theme.ts)
const PEPPA_RED = 0xe84a5f; // COLORS.peppaRed

/**
 * Shows a loading bar, then starts the Title scene. There is nothing to load
 * yet, so the bar fills over a short tween so the scene can be seen working.
 * Plan 2 replaces the tween with the asset loader and the audio unlock.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Boot);
  }

  create(): void {
    const { width, height } = this.scale.gameSize;
    const left = (width - BAR_WIDTH) / 2;
    const centreY = height / 2;

    this.add
      .text(width / 2, centreY - 48, 'Loading', {
        fontFamily: 'sans-serif',
        fontSize: '32px',
        color: '#3a2a2a',
      })
      .setOrigin(0.5);

    this.add.rectangle(left, centreY, BAR_WIDTH, BAR_HEIGHT, OUTLINE).setOrigin(0, 0.5);
    const fill = this.add
      .rectangle(left + 4, centreY, BAR_WIDTH - 8, BAR_HEIGHT - 8, PEPPA_RED)
      .setOrigin(0, 0.5)
      .setScale(0, 1);

    this.tweens.add({
      targets: fill,
      scaleX: 1,
      duration: 600,
      ease: 'Sine.easeInOut',
      onComplete: () => this.scene.start(SceneKey.Title),
    });
  }
}
