import Phaser from 'phaser';
import { SceneKey } from './keys';

const OUTLINE = 0x3a2a2a; // COLORS.outline (plan 2 moves these to ui/theme.ts)
const GOOD = 0x6cc24a; // COLORS.good
const BUTTON_WIDTH = 280;
const BUTTON_HEIGHT = 96;

/**
 * The "hello kitchen" screen: the word Oinkbuns, the tagline, and a Play
 * button. The button only animates for now; plan 2 makes it start the
 * DayIntro scene. The thick border sits on the logical edges so any scaling
 * mistake shows up as a missing edge.
 */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Title);
  }

  create(): void {
    const { width, height } = this.scale.gameSize;

    this.add.rectangle(width / 2, height / 2, width - 8, height - 8).setStrokeStyle(8, OUTLINE);

    this.add
      .text(width / 2, height * 0.36, 'Oinkbuns', {
        fontFamily: 'sans-serif',
        fontSize: '128px',
        fontStyle: 'bold',
        color: '#e84a5f',
        stroke: '#3a2a2a',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.36 + 100, 'Bake hot cross buns with Peppa', {
        fontFamily: 'sans-serif',
        fontSize: '36px',
        color: '#3a2a2a',
      })
      .setOrigin(0.5);

    const button = this.add
      .rectangle(width / 2, height * 0.72, BUTTON_WIDTH, BUTTON_HEIGHT, GOOD)
      .setStrokeStyle(6, OUTLINE)
      .setInteractive({ useHandCursor: true });

    const label = this.add
      .text(width / 2, height * 0.72, 'Play', {
        fontFamily: 'sans-serif',
        fontSize: '48px',
        fontStyle: 'bold',
        color: '#3a2a2a',
      })
      .setOrigin(0.5);

    // Press feedback only. Plan 2 replaces this handler's body with
    // this.scene.start(SceneKey.DayIntro, { dayId: 1 }).
    button.on('pointerdown', () => {
      this.tweens.add({
        targets: [button, label],
        scaleX: 0.92,
        scaleY: 0.92,
        duration: 80,
        yoyo: true,
      });
    });
  }
}
