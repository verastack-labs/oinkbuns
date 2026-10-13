import Phaser from 'phaser';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../core/layout';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { COLORS, FONT } from '../ui/theme';
import { SceneKey } from './keys';
import type { KitchenData, PauseData } from './sceneData';

const CX = LOGICAL_WIDTH / 2;
const CY = LOGICAL_HEIGHT / 2;
const BUTTON_W = 300;
// Escape opens this overlay from the kitchen; the same key press must not
// close it again on the very next frame.
const ESC_GRACE_MS = 250;

const css = (c: number): string => `#${c.toString(16).padStart(6, '0')}`;

export class PauseOverlay extends Phaser.Scene {
  private openedAt = 0;
  private readonly onGameFocus = (): void => this.sound.pauseAll();

  constructor() {
    super(SceneKey.Pause);
  }

  create(data: PauseData): void {
    this.openedAt = performance.now();
    // The kitchen scene is paused by KitchenScene before this launches; its
    // update loop, tweens, and timers already stand still. Music still plays
    // because sound is game-wide, so pause every sound here.
    this.sound.pauseAll();
    // The sound manager's pauseOnBlur handling (on by default) suspends audio
    // on the game BLUR event and resumes everything on the game FOCUS event.
    // This overlay is usually opened by that very blur, so when the player
    // clicks back into the page the music would start again under the
    // overlay. Re-pause on FOCUS while open. The manager registered its own
    // FOCUS listener in its constructor, so it runs first and this runs after.
    this.game.events.on(Phaser.Core.Events.FOCUS, this.onGameFocus);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.FOCUS, this.onGameFocus);
    });

    this.add.rectangle(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT, 0x000000, 0.45).setOrigin(0);
    new Card(this, CX, CY, 460, 470);
    this.add
      .text(CX, CY - 170, 'Paused', { fontFamily: FONT, fontSize: '56px', color: css(COLORS.text) })
      .setOrigin(0.5);

    new Button(this, CX, CY - 75, 'Resume', () => this.resumeKitchen(), { width: BUTTON_W });
    new Button(this, CX, CY + 30, 'Restart day', () => this.restartDay(data.dayId), { width: BUTTON_W });
    new Button(this, CX, CY + 135, 'Days', () => this.toDays(), { width: BUTTON_W });

    this.input.keyboard?.on('keydown-ESC', () => {
      if (performance.now() - this.openedAt < ESC_GRACE_MS) {
        return;
      }
      this.resumeKitchen();
    });
  }

  private resumeKitchen(): void {
    this.sound.resumeAll();
    this.scene.resume(SceneKey.Kitchen);
    this.scene.stop();
  }

  private restartDay(dayId: number): void {
    this.sound.resumeAll();
    const kitchen: KitchenData = { dayId, seed: Date.now() };
    this.scene.stop(SceneKey.Kitchen);
    this.scene.start(SceneKey.Kitchen, kitchen);
  }

  private toDays(): void {
    this.sound.resumeAll();
    this.scene.stop(SceneKey.Kitchen);
    this.scene.start(SceneKey.DaySelect);
  }
}
