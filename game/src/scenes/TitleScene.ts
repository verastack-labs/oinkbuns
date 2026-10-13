import Phaser from 'phaser';
import { LOGICAL_WIDTH } from '../core/layout';
import { Button } from '../ui/Button';
import { COLORS, cssColor, FONT_STACK } from '../ui/theme';
import { SceneKey } from './keys';

const CX = LOGICAL_WIDTH / 2;

/**
 * Title: logo, the name, the tagline, Play. Play goes straight to day 1's
 * intro in plan 2; plan 4 reroutes it to Day Select, and plan 3 adds the
 * mute button and the rhyme. The Play handler body is one line because
 * plans 3 and 4 find it by that exact text.
 */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Title);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.wall);

    this.add.image(CX, 200, 'logo');

    this.add
      .text(CX, 400, 'Oinkbuns', {
        fontFamily: FONT_STACK,
        fontSize: '112px',
        fontStyle: 'bold',
        color: cssColor(COLORS.peppaRed),
        stroke: cssColor(COLORS.outline),
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(CX, 455, 'Bake hot cross buns with Peppa', {
        fontFamily: FONT_STACK,
        fontSize: '36px',
        color: cssColor(COLORS.text),
      })
      .setOrigin(0.5);

    new Button(
      this,
      CX,
      518,
      'Play',
      () => {
        this.scene.start(SceneKey.DayIntro, { dayId: 1 });
      },
      { width: 280 },
    );
  }
}
