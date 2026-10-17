import Phaser from 'phaser';
import { sfx } from '../audio';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../core/layout';
import { hasSticker, isDayUnlocked, withStars } from '../core/save';
import { DAYS, RUSH_ID } from '../data/days';
import { confetti } from '../fx/particles';
import { reduceMotion } from '../fx/reduceMotion';
import { getProgress, updateProgress } from '../progressStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Stars } from '../ui/Stars';
import { COLORS, cssColor, FONT_STACK } from '../ui/theme';
import { SceneKey } from './keys';
import type { DayEndData, DayIntroData, KitchenData } from './sceneData';

const CX = LOGICAL_WIDTH / 2;
const CY = LOGICAL_HEIGHT / 2;
const BUTTON_W = 220;
const BUTTON_GAP = 20;

interface Choice {
  label: string;
  go: () => void;
}

/**
 * Shown over the paused kitchen when a day ends (spec 5.8): pennies, stars
 * with a chime each, confetti at three stars, and the way on: Next day (when
 * there is one and it is unlocked), Play again, and Days. Stars are saved
 * only when the day earned pennies, which is what unlocks the next day.
 */
export class DayEndOverlay extends Phaser.Scene {
  constructor() {
    super(SceneKey.DayEnd);
  }

  create(data: DayEndData): void {
    const rush = data.dayId === RUSH_ID;
    const previousBest = getProgress().bestRush;
    const newBest = rush && data.pennies > previousBest;
    if (newBest) {
      updateProgress((p) => ({ ...p, bestRush: data.pennies }));
    }
    const hadSticker = hasSticker(getProgress(), data.dayId);
    if (!rush && data.pennies > 0) {
      updateProgress((p) => withStars(p, data.dayId, data.stars));
    }
    const progress = getProgress();
    const nextDay = rush ? null : (DAYS.find((d) => d.id === data.dayId + 1) ?? null);

    this.add.rectangle(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT, 0x000000, 0.45).setOrigin(0);
    new Card(this, CX, CY, 760, 440);
    const text = { fontFamily: FONT_STACK, color: cssColor(COLORS.text) };
    this.add.text(CX, CY - 160, rush ? 'Rush over!' : 'Day done!', { ...text, fontSize: '56px', fontStyle: 'bold' }).setOrigin(0.5);
    this.add
      .text(CX, CY - 90, `${data.pennies} ${data.pennies === 1 ? 'penny' : 'pennies'}`, { ...text, fontSize: '36px' })
      .setOrigin(0.5);
    if (rush) {
      this.add
        .text(CX, CY - 10, newBest ? 'New best!' : `Best: ${getProgress().bestRush}`, { ...text, fontSize: '44px', fontStyle: 'bold', color: cssColor(COLORS.peppaRed) })
        .setOrigin(0.5);
    } else {
      new Stars(this, CX, CY - 10, data.stars);
    }

    sfx().play('day-end');
    for (let i = 0; i < (rush ? 0 : data.stars); i += 1) {
      this.time.delayedCall(500 + i * 300, () => sfx().play('star'));
    }
    if ((rush ? newBest : data.stars === 3) && !reduceMotion()) {
      this.time.delayedCall(1400, () => {
        sfx().play('confetti');
        confetti(this, CX, CY - 200);
      });
    }

    // Three stars earns the day's sticker; it pops in once, the first time.
    if (data.stars === 3 && this.textures.exists(`sticker-${data.dayId}`)) {
      const sticker = this.add.image(CX + 250, CY - 120, `sticker-${data.dayId}`).setAngle(-12);
      this.add
        .text(CX + 250, CY - 56, hadSticker ? 'Sticker!' : 'New sticker!', { ...text, fontSize: '22px', fontStyle: 'bold' })
        .setOrigin(0.5);
      if (!hadSticker && !reduceMotion()) {
        sticker.setScale(0);
        this.tweens.add({ targets: sticker, scale: 1.2, duration: 380, delay: 1000, ease: 'Back.easeOut' });
        this.time.delayedCall(1000, () => sfx().play('star', { rate: 1.4 }));
      }
    }

    const choices: Choice[] = [];
    if (nextDay && isDayUnlocked(progress, nextDay.id)) {
      const intro: DayIntroData = { dayId: nextDay.id };
      choices.push({ label: 'Next day', go: () => this.leaveTo(SceneKey.DayIntro, intro) });
    }
    choices.push({
      label: 'Play again',
      go: () => {
        const kitchen: KitchenData = { dayId: data.dayId, seed: Date.now() };
        this.leaveTo(SceneKey.Kitchen, kitchen);
      },
    });
    choices.push({ label: 'Days', go: () => this.leaveTo(SceneKey.DaySelect) });

    const rowWidth = choices.length * BUTTON_W + (choices.length - 1) * BUTTON_GAP;
    choices.forEach((choice, i) => {
      const x = CX - rowWidth / 2 + BUTTON_W / 2 + i * (BUTTON_W + BUTTON_GAP);
      new Button(this, x, CY + 140, choice.label, choice.go, { width: BUTTON_W });
    });
  }

  // The kitchen is paused underneath; stop it first, then start the target.
  private leaveTo(key: string, data?: object): void {
    this.scene.stop(SceneKey.Kitchen);
    this.scene.start(key, data);
  }
}
