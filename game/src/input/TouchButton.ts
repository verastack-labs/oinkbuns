import Phaser from 'phaser';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../core/layout';
import type { PromptLabel } from '../core/types';
import { COLORS, cssColor, FONT_STACK } from '../ui/theme';
import { promptText } from '../ui/promptText';

const RADIUS = 84;
const DEPTH = 2000;

/**
 * The one big action button for touch (spec 5.3), bottom-right. Its label
 * mirrors the prompt bubble so a child can see what pressing it will do; it
 * dims when there is nothing to do.
 */
export class TouchButton {
  private pressed = false;
  private readonly circle: Phaser.GameObjects.Arc;
  private readonly text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const x = LOGICAL_WIDTH - 150;
    const y = LOGICAL_HEIGHT - 150;
    this.circle = scene.add
      .circle(x, y, RADIUS, COLORS.good, 0.9)
      .setStrokeStyle(6, COLORS.outline)
      .setDepth(DEPTH)
      .setInteractive({ useHandCursor: false });
    this.text = scene.add
      .text(x, y, '', {
        fontFamily: FONT_STACK,
        fontSize: '30px',
        fontStyle: 'bold',
        color: cssColor(COLORS.text),
        align: 'center',
        wordWrap: { width: RADIUS * 1.6 },
      })
      .setOrigin(0.5)
      .setDepth(DEPTH + 1);
    this.circle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      this.pressed = true;
      this.circle.setScale(0.92);
    });
    this.circle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => this.circle.setScale(1));
    this.circle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => this.circle.setScale(1));
    this.setLabel(null);
  }

  consumePress(): boolean {
    const was = this.pressed;
    this.pressed = false;
    return was;
  }

  setLabel(label: PromptLabel | null): void {
    this.text.setText(label ? promptText(label) : 'Go!');
    this.circle.setAlpha(label ? 0.95 : 0.45);
    this.text.setAlpha(label ? 1 : 0.5);
  }

  destroy(): void {
    this.circle.destroy();
    this.text.destroy();
  }
}
