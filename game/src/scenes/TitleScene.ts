import Phaser from 'phaser';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../core/layout';
import { sfx } from '../audio';
import { Button } from '../ui/Button';
import { MuteButton } from '../ui/MuteButton';
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
    // The rhyme plays on the title and carries on into the day intro. Browsers
    // hold audio until the first tap; Phaser plays it as soon as they allow.
    sfx().music('rhyme');
    new MuteButton(this, LOGICAL_WIDTH - 56, 56);

    // Vertical rhythm: logo 62-288, title 290-400, tagline 418-452, Play 498-582.
    this.add.image(CX, 175, 'logo').setScale(0.75);

    this.add
      .text(CX, 345, 'Oinkbuns', {
        fontFamily: FONT_STACK,
        fontSize: '96px',
        fontStyle: 'bold',
        color: cssColor(COLORS.peppaRed),
        stroke: cssColor(COLORS.outline),
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(CX, 435, 'Bake hot cross buns with Peppa', {
        fontFamily: FONT_STACK,
        fontSize: '36px',
        color: cssColor(COLORS.text),
      })
      .setOrigin(0.5);

    new Button(
      this,
      CX,
      540,
      'Play',
      () => {
        this.scene.start(SceneKey.DaySelect);
      },
      { width: 280 },
    );
    new Button(this, 150, LOGICAL_HEIGHT - 60, 'Grown-ups', () => this.scene.start(SceneKey.Settings), { width: 240 });
  }
}
