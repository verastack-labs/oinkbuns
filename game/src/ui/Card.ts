import Phaser from 'phaser';
import { COLORS } from './theme';

const RADIUS = 28;

// A rounded cream panel with a dark outline, centred on (x, y). Scenes add
// their own text and buttons on top; the card itself never captures input.
export class Card extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y);
    const face = scene.add.graphics();
    face.fillStyle(COLORS.outline, 1);
    face.fillRoundedRect(-width / 2, -height / 2, width, height, RADIUS);
    face.fillStyle(COLORS.cream, 1);
    face.fillRoundedRect(-width / 2 + 6, -height / 2 + 6, width - 12, height - 12, RADIUS - 6);
    this.add(face);
    this.setSize(width, height);
    scene.add.existing(this);
  }
}
