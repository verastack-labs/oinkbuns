import Phaser from 'phaser';
import type { Stars as StarCount } from '../core/types';

const GAP = 80;

// A centred row of three stars: `stars` of them lit (`star`), the rest
// `star-empty`. Centre star at (x, y); the others 80 px either side.
export class Stars extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, stars: StarCount) {
    super(scene, x, y);
    for (let i = 0; i < 3; i += 1) {
      this.add(scene.add.image((i - 1) * GAP, 0, i < stars ? 'star' : 'star-empty'));
    }
    this.setSize(GAP * 2 + 64, 64);
    scene.add.existing(this);
  }
}
