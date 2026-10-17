import Phaser from 'phaser';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../core/layout';
import { hasSticker } from '../core/save';
import { DAYS } from '../data/days';
import { getProgress } from '../progressStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { COLORS, cssColor, FONT_STACK } from '../ui/theme';
import { SceneKey } from './keys';

const CX = LOGICAL_WIDTH / 2;
const SLOT_W = 190;

/**
 * The sticker book: one slot per day. A day finished with three stars shows
 * its sticker with the day's name; the others show a "?" and a hint. Opened
 * from the day picker.
 */
export class StickerBookScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.StickerBook);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.wall);
    const text = { fontFamily: FONT_STACK, color: cssColor(COLORS.text) };
    const progress = getProgress();
    const days = DAYS.filter((d) => d.id >= 1 && d.id <= 5);
    const earned = days.filter((d) => hasSticker(progress, d.id)).length;

    this.add.text(CX, 80, 'Sticker book', { ...text, fontSize: '56px', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(CX, 134, `${earned} of ${days.length} stickers. Get three stars on a day to earn its sticker!`, { ...text, fontSize: '24px' }).setOrigin(0.5);
    new Card(this, CX, LOGICAL_HEIGHT / 2 + 20, SLOT_W * days.length + 60, 340);

    days.forEach((day, i) => {
      const x = CX - (SLOT_W * (days.length - 1)) / 2 + i * SLOT_W;
      const y = LOGICAL_HEIGHT / 2;
      const got = hasSticker(progress, day.id);
      this.add.image(x, y, got ? `sticker-${day.id}` : 'sticker-locked').setScale(1.35).setAngle(got ? (i % 2 === 0 ? -6 : 6) : 0);
      this.add
        .text(x, y + 100, got ? day.name : `Day ${day.id}`, { ...text, fontSize: '22px', align: 'center', wordWrap: { width: SLOT_W - 16 } })
        .setOrigin(0.5, 0);
    });

    new Button(this, 120, LOGICAL_HEIGHT - 60, 'Back', () => this.scene.start(SceneKey.DaySelect), { width: 180 });
  }
}
