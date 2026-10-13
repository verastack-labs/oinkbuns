import Phaser from 'phaser';
import { sfx } from '../audio';
import { COLORS } from './theme';

// 72 px round touch target (spec 6.4), drawn from graphics so it needs no
// texture. Sits in a corner of every screen (spec 6.2: always visible).
const RADIUS = 36;
const DEPTH = 1000;

export class MuteButton extends Phaser.GameObjects.Container {
  private readonly icon: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    const face = scene.add.graphics();
    face.fillStyle(COLORS.outline, 1);
    face.fillCircle(0, 0, RADIUS);
    face.fillStyle(COLORS.cream, 1);
    face.fillCircle(0, 0, RADIUS - 3);
    this.icon = scene.add.graphics();
    this.add([face, this.icon]);
    this.setDepth(DEPTH);
    this.setInteractive(new Phaser.Geom.Circle(0, 0, RADIUS), Phaser.Geom.Circle.Contains);
    this.on(Phaser.Input.Events.POINTER_DOWN, () => this.toggle());
    this.draw(sfx().muted);
    scene.add.existing(this);
  }

  private toggle(): void {
    const muted = !sfx().muted;
    sfx().setMuted(muted);
    this.draw(muted);
    if (!muted) sfx().play('click');
    this.scene.tweens.add({ targets: this, scaleX: 0.9, scaleY: 0.9, duration: 70, yoyo: true });
  }

  // A speaker: a small box, a cone to its right, two sound arcs when live,
  // a red slash when muted. Colour is never the only signal (spec 6.4): the
  // slash is also a shape.
  private draw(muted: boolean): void {
    const g = this.icon;
    g.clear();
    g.fillStyle(COLORS.outline, 1);
    g.fillRect(-18, -7, 9, 14);
    g.fillTriangle(-9, -7, -9, 7, 2, 16);
    g.fillTriangle(-9, -7, 2, -16, 2, 16);
    if (muted) {
      g.lineStyle(5, COLORS.bad, 1);
      g.lineBetween(-20, -20, 20, 20);
      return;
    }
    g.lineStyle(3, COLORS.outline, 1);
    g.beginPath();
    g.arc(4, 0, 10, -0.9, 0.9);
    g.strokePath();
    g.beginPath();
    g.arc(4, 0, 17, -0.9, 0.9);
    g.strokePath();
  }
}
