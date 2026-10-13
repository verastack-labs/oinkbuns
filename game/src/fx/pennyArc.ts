import Phaser from 'phaser';
import type { Point } from '../core/types';
import { dur } from './reduceMotion';

// Above the HUD so the coins land on top of the penny total.
const DEPTH = 1100;
const MAX_COINS = 6;

// Pennies fly from the customer to the counter total along a quadratic arc
// (spec 6.3). Each coin is its own image on a tweened progress value, so the
// arc is exact and the coin is destroyed where it lands.
export function pennyArc(scene: Phaser.Scene, from: Point, to: Point, count: number, onLand?: () => void): void {
  const n = Math.max(1, Math.min(count, MAX_COINS));
  const cx = (from.x + to.x) / 2;
  for (let i = 0; i < n; i += 1) {
    const coin = scene.add.image(from.x, from.y, 'penny').setDepth(DEPTH).setScale(0.8);
    const cy = Math.min(from.y, to.y) - 140 - i * 20;
    const progress = { t: 0 };
    scene.tweens.add({
      targets: progress,
      t: 1,
      duration: dur(650),
      delay: dur(90) * i,
      ease: 'Sine.easeIn',
      onUpdate: () => {
        const t = progress.t;
        const u = 1 - t;
        coin.x = u * u * from.x + 2 * u * t * cx + t * t * to.x;
        coin.y = u * u * from.y + 2 * u * t * cy + t * t * to.y;
      },
      onComplete: () => {
        coin.destroy();
        onLand?.();
      },
    });
  }
}
