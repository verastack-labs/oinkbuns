import Phaser from 'phaser';
import { sfx } from '../audio';
import { CURSOR_HOVER } from './cursors';
import { COLORS } from './theme';

const RADIUS = 30;

/**
 * A round pause button that matches the mute button: two bars on a cream
 * face. The hit circle is larger than the drawing so it is easy to hit.
 */
export class PauseButton extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, onPress: () => void) {
    super(scene, x, y);
    const g = scene.add.graphics();
    g.fillStyle(COLORS.outline, 1);
    g.fillCircle(0, 0, RADIUS);
    g.fillStyle(COLORS.cream, 1);
    g.fillCircle(0, 0, RADIUS - 3);
    g.fillStyle(COLORS.outline, 1);
    g.fillRoundedRect(-11, -12, 8, 24, 3);
    g.fillRoundedRect(3, -12, 8, 24, 3);
    this.add(g);
    this.setInteractive({
      hitArea: new Phaser.Geom.Circle(0, 0, RADIUS + 14),
      hitAreaCallback: Phaser.Geom.Circle.Contains,
      cursor: CURSOR_HOVER,
    });
    this.on(Phaser.Input.Events.POINTER_OVER, () => sfx().play('click', { rate: 1.6, volume: 0.35 }));
    this.on(Phaser.Input.Events.POINTER_DOWN, () => {
      sfx().play('click');
      onPress();
    });
    scene.add.existing(this);
  }
}
