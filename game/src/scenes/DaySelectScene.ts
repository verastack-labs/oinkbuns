import Phaser from 'phaser';
import { sfx } from '../audio';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../core/layout';
import { isDayUnlocked } from '../core/save';
import type { DayConfig, Stars as StarCount } from '../core/types';
import { DAYS } from '../data/days';
import { getProgress } from '../progressStore';
import { Button } from '../ui/Button';
import { CURSOR_HOVER } from '../ui/cursors';
import { Card } from '../ui/Card';
import { Stars } from '../ui/Stars';
import { COLORS, FONT } from '../ui/theme';
import { SceneKey } from './keys';
import type { DayIntroData } from './sceneData';

// Cards shrink to fit however many days there are, up to 200 px wide.
const CARD_GAP = 16;
const CARD_W = Math.min(200, Math.floor((LOGICAL_WIDTH - 120 - (DAYS.length - 1) * CARD_GAP) / DAYS.length));
const CARD_H = 300;
const CARD_Y = LOGICAL_HEIGHT / 2 + 20;
const LOCKED_ALPHA = 0.55;

const css = (c: number): string => `#${c.toString(16).padStart(6, '0')}`;

interface Fadeable {
  setAlpha(alpha: number): unknown;
}

export class DaySelectScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.DaySelect);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.wall);
    this.add
      .text(LOGICAL_WIDTH / 2, 80, 'Pick a day', {
        fontFamily: FONT,
        fontSize: '56px',
        color: css(COLORS.text),
      })
      .setOrigin(0.5);

    const progress = getProgress();
    const rowWidth = DAYS.length * CARD_W + (DAYS.length - 1) * CARD_GAP;
    const firstX = (LOGICAL_WIDTH - rowWidth) / 2 + CARD_W / 2;

    DAYS.forEach((day, index) => {
      const x = firstX + index * (CARD_W + CARD_GAP);
      const unlocked = isDayUnlocked(progress, day.id);
      const raw = progress.bestStars[String(day.id)] ?? 0;
      const best = (raw >= 0 && raw <= 3 ? raw : 0) as StarCount;
      this.addCard(x, CARD_Y, day, unlocked, best);
    });

    new Button(
      this,
      120,
      LOGICAL_HEIGHT - 60,
      'Back',
      () => {
        this.scene.start(SceneKey.Title);
      },
      { width: 180 },
    );
    new Button(this, LOGICAL_WIDTH - 160, LOGICAL_HEIGHT - 60, 'Stickers', () => this.scene.start(SceneKey.StickerBook), {
      width: 240,
    });
  }

  private addCard(x: number, y: number, day: DayConfig, unlocked: boolean, best: StarCount): void {
    const parts: Fadeable[] = [];
    parts.push(new Card(this, x, y, CARD_W, CARD_H));
    parts.push(
      this.add
        .text(x, y - 105, `Day ${day.id}`, {
          fontFamily: FONT,
          fontSize: '40px',
          color: css(COLORS.text),
        })
        .setOrigin(0.5),
    );
    parts.push(
      this.add
        .text(x, y - 45, day.name, {
          fontFamily: FONT,
          fontSize: CARD_W < 170 ? '20px' : '22px',
          color: css(COLORS.text),
          align: 'center',
          wordWrap: { width: CARD_W - 32 },
        })
        .setOrigin(0.5),
    );

    if (unlocked) {
      // 224 px of stars at full size; 70 percent fits inside the 200 px card.
      parts.push(new Stars(this, x, y + 40, best, Math.min(0.7, (CARD_W - 24) / 224)));
      // A zone keeps the hit area independent of how Card draws itself.
      // 200 by 300 logical pixels is well above the 72 px touch minimum.
      const hit = this.add.zone(x, y, CARD_W, CARD_H).setInteractive({ cursor: CURSOR_HOVER });
      hit.on('pointerover', () => sfx().play('click', { rate: 1.6, volume: 0.35 }));
      hit.on('pointerdown', () => {
        sfx().play('click');
        const data: DayIntroData = { dayId: day.id };
        this.scene.start(SceneKey.DayIntro, data);
      });
      return;
    }

    parts.push(this.drawPadlock(x, y + 50));
    for (const part of parts) {
      part.setAlpha(LOCKED_ALPHA);
    }
  }

  // Padlock from Phaser graphics so no texture is needed: an arc for the
  // shackle, a rounded body, and a keyhole in the wall colour.
  private drawPadlock(x: number, y: number): Phaser.GameObjects.Graphics {
    const g = this.add.graphics();
    g.lineStyle(8, COLORS.outline, 1);
    g.beginPath();
    g.arc(x, y - 22, 22, Math.PI, 0, false);
    g.strokePath();
    g.fillStyle(COLORS.outline, 1);
    g.fillRoundedRect(x - 34, y - 22, 68, 54, 12);
    g.fillStyle(COLORS.wall, 1);
    g.fillCircle(x, y + 2, 7);
    g.fillRect(x - 3, y + 2, 6, 14);
    return g;
  }
}
