import Phaser from 'phaser';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../core/layout';
import { dayById } from '../data/days';
import { sfx } from '../audio';
import { Button } from '../ui/Button';
import { MuteButton } from '../ui/MuteButton';
import { Card } from '../ui/Card';
import { COLORS, cssColor, FONT_STACK } from '../ui/theme';
import { SceneKey } from './keys';
import type { DayIntroData, KitchenData } from './sceneData';

const CX = LOGICAL_WIDTH / 2;
const CY = LOGICAL_HEIGHT / 2;

/**
 * Day Intro (spec 5.8): day name, the one-line twist, a picture, Go. The
 * seed for the kitchen is the clock, so every play is a different day;
 * tests construct Day with fixed seeds instead.
 */
export class DayIntroScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.DayIntro);
  }

  create(data: DayIntroData): void {
    new MuteButton(this, LOGICAL_WIDTH - 56, 56);
    const day = dayById(data.dayId);
    this.cameras.main.setBackgroundColor(COLORS.wall);

    new Card(this, CX, CY - 20, 820, 440);

    this.add.image(CX - 280, CY - 10, 'peppa-idle');

    this.add
      .text(CX + 60, CY - 130, `Day ${day.id}`, {
        fontFamily: FONT_STACK,
        fontSize: '36px',
        color: cssColor(COLORS.peppaRed),
      })
      .setOrigin(0.5);

    this.add
      .text(CX + 60, CY - 70, day.name, {
        fontFamily: FONT_STACK,
        fontSize: '64px',
        fontStyle: 'bold',
        color: cssColor(COLORS.text),
      })
      .setOrigin(0.5);

    this.add
      .text(CX + 60, CY + 10, day.twist, {
        fontFamily: FONT_STACK,
        fontSize: '30px',
        color: cssColor(COLORS.text),
        align: 'center',
        wordWrap: { width: 480 },
      })
      .setOrigin(0.5);

    new Button(
      this,
      CX,
      // The card ends at y 560; the button (84 tall) sits clear below it.
      625,
      'Go',
      () => {
        sfx().play('day-start');
        const kitchen: KitchenData = { dayId: day.id, seed: Date.now() };
        this.scene.start(SceneKey.Kitchen, kitchen);
      },
      { width: 240 },
    );
  }
}
