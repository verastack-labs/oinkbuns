import Phaser from 'phaser';
import { sfx } from '../audio';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../core/layout';
import { withStars } from '../core/save';
import { updateProgress } from '../progressStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Stars } from '../ui/Stars';
import { COLORS, cssColor, FONT_STACK } from '../ui/theme';
import { SceneKey } from './keys';
import type { DayEndData, KitchenData } from './sceneData';

const CX = LOGICAL_WIDTH / 2;
const CY = LOGICAL_HEIGHT / 2;

/**
 * Shown over the paused kitchen when a day ends (spec 5.8): pennies, stars,
 * Play again, and back to the Title. Stars are saved only when the day
 * earned pennies, which is what unlocks the next day (spec 5.6).
 */
export class DayEndOverlay extends Phaser.Scene {
  constructor() {
    super(SceneKey.DayEnd);
  }

  create(data: DayEndData): void {
    if (data.pennies > 0) {
      updateProgress((p) => withStars(p, data.dayId, data.stars));
    }

    this.add.rectangle(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT, 0x000000, 0.45).setOrigin(0);
    new Card(this, CX, CY, 620, 440);
    const text = { fontFamily: FONT_STACK, color: cssColor(COLORS.text) };
    this.add.text(CX, CY - 160, 'Day done!', { ...text, fontSize: '56px', fontStyle: 'bold' }).setOrigin(0.5);
    this.add
      .text(CX, CY - 90, `${data.pennies} ${data.pennies === 1 ? 'penny' : 'pennies'}`, { ...text, fontSize: '36px' })
      .setOrigin(0.5);
    new Stars(this, CX, CY - 10, data.stars);
    sfx().play('day-end');

    new Button(this, CX - 150, CY + 140, 'Play again', () => {
      const kitchen: KitchenData = { dayId: data.dayId, seed: Date.now() };
      this.leaveTo(SceneKey.Kitchen, kitchen);
    }, { width: 260 });
    new Button(this, CX + 150, CY + 140, 'Home', () => this.leaveTo(SceneKey.Title), { width: 260 });
  }

  private leaveTo(key: string, data?: object): void {
    this.scene.stop(SceneKey.Kitchen);
    this.scene.start(key, data);
  }
}
