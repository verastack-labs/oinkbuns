import Phaser from 'phaser';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../core/layout';
import { hasSticker, RUSH_STICKER_PENNIES, rushStickersEarned } from '../core/save';
import { DAYS } from '../data/days';
import { getProgress } from '../progressStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { COLORS, cssColor, FONT_STACK } from '../ui/theme';
import { SceneKey } from './keys';

const CX = LOGICAL_WIDTH / 2;

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
    const days = DAYS.filter((d) => this.textures.exists(`sticker-${d.id}`));
    const SLOT_W = Math.min(190, Math.floor((LOGICAL_WIDTH - 140) / days.length));
    const rushEarned = rushStickersEarned(progress);
    const earned = days.filter((d) => hasSticker(progress, d.id)).length + rushEarned;
    const total = days.length + RUSH_STICKER_PENNIES.length;

    this.add.text(CX, 80, 'Sticker book', { ...text, fontSize: '56px', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(CX, 134, `${earned} of ${total} stickers. Three stars on a day, or a big Bun Rush score, earns one!`, { ...text, fontSize: '24px' }).setOrigin(0.5);
    new Card(this, CX, 395, SLOT_W * days.length + 60, 400);

    days.forEach((day, i) => {
      const x = CX - (SLOT_W * (days.length - 1)) / 2 + i * SLOT_W;
      const y = 268;
      const got = hasSticker(progress, day.id);
      this.add.image(x, y, got ? `sticker-${day.id}` : 'sticker-locked').setScale(1.1).setAngle(got ? (i % 2 === 0 ? -6 : 6) : 0);
      this.add
        .text(x, y + 62, got ? day.name : `Day ${day.id}`, { ...text, fontSize: '20px', align: 'center', wordWrap: { width: SLOT_W - 16 } })
        .setOrigin(0.5, 0);
    });

    // Bun Rush row: bronze, silver and gold for best scores.
    RUSH_STICKER_PENNIES.forEach((pennies, i) => {
      const x = CX + (i - 1) * 200;
      const got = i < rushEarned;
      this.add.image(x, 470, got ? `sticker-rush-${i + 1}` : 'sticker-locked').setAngle(got ? (i % 2 === 0 ? 6 : -6) : 0);
      this.add.text(x, 528, `Bun Rush ${pennies}`, { ...text, fontSize: '20px' }).setOrigin(0.5, 0);
    });

    new Button(this, 120, LOGICAL_HEIGHT - 60, 'Back', () => this.scene.start(SceneKey.DaySelect), { width: 180 });
  }
}
