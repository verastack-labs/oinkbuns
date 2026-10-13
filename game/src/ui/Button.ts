import Phaser from 'phaser';
import { COLORS, cssColor, FONT_STACK } from './theme';

const HEIGHT = 84; // above the 72 px touch minimum (spec 6.4)
const RADIUS = 24;

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
      hitArea: new Phaser.Geom.Rectangle(-width / 2, -HEIGHT / 2, width, HEIGHT),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });

    this.on(Phaser.Input.Events.POINTER_DOWN, () => {
      scene.tweens.add({ targets: this, scaleX: 0.94, scaleY: 0.94, duration: 70, yoyo: true });
    });
    this.on(Phaser.Input.Events.POINTER_UP, () => onClick());

    scene.add.existing(this);
  }
}
