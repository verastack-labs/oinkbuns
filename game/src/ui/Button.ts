import Phaser from 'phaser';
import { sfx } from '../audio';
import { CURSOR_HOVER } from './cursors';
import { COLORS, cssColor, FONT_STACK } from './theme';

const HEIGHT = 84; // above the 72 px touch minimum (spec 6.4)
const RADIUS = 24;
// Extra hit area on every side. Kept at 10 so buttons stacked 105 px apart
// (the pause menu) or side by side 20 px apart (the day-end card) never
// have overlapping click areas.
const HIT_PAD = 10;

/**
 * A rounded green button with a dark outline and a big label. Fires onClick
 * on pointer-up over the button, so a press that slides off is cancelled.
 * Containers have no size of their own, so the hit area is set explicitly.
 */
export class Button extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    opts: { width?: number } = {},
  ) {
    super(scene, x, y);
    const width = opts.width ?? 240;

    const face = scene.add.graphics();
    face.fillStyle(COLORS.outline, 1);
    face.fillRoundedRect(-width / 2, -HEIGHT / 2, width, HEIGHT, RADIUS);
    face.fillStyle(COLORS.good, 1);
    face.fillRoundedRect(-width / 2 + 5, -HEIGHT / 2 + 5, width - 10, HEIGHT - 10, RADIUS - 5);

    const text = scene.add
      .text(0, 0, label, {
        fontFamily: FONT_STACK,
        fontSize: '40px',
        fontStyle: 'bold',
        color: cssColor(COLORS.text),
      })
      .setOrigin(0.5);

    this.add([face, text]);
    this.setSize(width, HEIGHT);
    this.setInteractive({
      // Once a Container has a size, Phaser measures pointer positions from its
      // top-left corner (it adds the display origin), so the hit rectangle
      // starts at 0,0 even though the drawing is centred on the container.
      // Padded by HIT_PAD on every side: small fingers and trackpads miss.
      hitArea: new Phaser.Geom.Rectangle(-HIT_PAD, -HIT_PAD, width + HIT_PAD * 2, HEIGHT + HIT_PAD * 2),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      cursor: CURSOR_HOVER,
    });

    this.on(Phaser.Input.Events.POINTER_OVER, () => {
      sfx().play('click', { rate: 1.6, volume: 0.35 });
      scene.tweens.add({ targets: this, scaleX: 1.05, scaleY: 1.05, duration: 90 });
    });
    this.on(Phaser.Input.Events.POINTER_OUT, () => {
      scene.tweens.add({ targets: this, scaleX: 1, scaleY: 1, duration: 90 });
    });
    this.on(Phaser.Input.Events.POINTER_DOWN, () => {
      scene.tweens.add({ targets: this, scaleX: 0.94, scaleY: 0.94, duration: 70, yoyo: true });
    });
    this.on(Phaser.Input.Events.POINTER_UP, () => {
      sfx().play('click');
      onClick();
    });

    scene.add.existing(this);
  }
}
