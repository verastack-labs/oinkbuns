import Phaser from 'phaser';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../core/layout';
import type { Point } from '../core/types';
import { COLORS } from '../ui/theme';

const RADIUS = 90;
const KNOB = 40;
const DEAD_ZONE = 0.15;
const DEPTH = 2000;

/**
 * A floating thumb-stick (spec 5.3): it appears where the thumb lands in the
 * bottom-left quarter, drawn as a d-pad, and gives an analogue direction.
 * When idle a faint d-pad shows where to put the thumb.
 */
export class TouchStick {
  active = false;
  vector: Point = { x: 0, y: 0 };
  private pointerId: number | null = null;
  private origin: Point;
  private readonly base: Phaser.GameObjects.Graphics;
  private readonly knob: Phaser.GameObjects.Arc;

  constructor(private readonly scene: Phaser.Scene) {
    this.origin = { x: 170, y: LOGICAL_HEIGHT - 170 };
    this.base = scene.add.graphics().setDepth(DEPTH).setScrollFactor(0);
    this.knob = scene.add.circle(0, 0, KNOB, COLORS.cream, 0.9).setStrokeStyle(4, COLORS.outline).setDepth(DEPTH + 1);
    this.draw(0.35);

    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onDown, this);
    scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onMove, this);
    scene.input.on(Phaser.Input.Events.POINTER_UP, this.onUp, this);
  }

  destroy(): void {
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.onDown, this);
    this.scene.input.off(Phaser.Input.Events.POINTER_MOVE, this.onMove, this);
    this.scene.input.off(Phaser.Input.Events.POINTER_UP, this.onUp, this);
    this.base.destroy();
    this.knob.destroy();
  }

  private onDown(pointer: Phaser.Input.Pointer): void {
    if (!pointer.wasTouch || this.pointerId !== null) return;
    if (pointer.worldX > LOGICAL_WIDTH / 2 || pointer.worldY < LOGICAL_HEIGHT / 2) return;
    this.pointerId = pointer.id;
    this.active = true;
    this.origin = { x: pointer.worldX, y: pointer.worldY };
    this.draw(0.7);
    this.update(pointer);
  }

  private onMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.pointerId) this.update(pointer);
  }

  private onUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.pointerId) return;
    this.pointerId = null;
    this.active = false;
    this.vector = { x: 0, y: 0 };
    this.origin = { x: 170, y: LOGICAL_HEIGHT - 170 };
    this.draw(0.35);
  }

  private update(pointer: Phaser.Input.Pointer): void {
    const dx = pointer.worldX - this.origin.x;
    const dy = pointer.worldY - this.origin.y;
    const len = Math.hypot(dx, dy);
    const clamped = Math.min(len, RADIUS);
    const nx = len > 0 ? dx / len : 0;
    const ny = len > 0 ? dy / len : 0;
    const strength = clamped / RADIUS;
    this.vector = strength < DEAD_ZONE ? { x: 0, y: 0 } : { x: nx * strength, y: ny * strength };
    this.knob.setPosition(this.origin.x + nx * clamped, this.origin.y + ny * clamped);
  }

  private draw(alpha: number): void {
    const { x, y } = this.origin;
    const g = this.base;
    g.clear();
    g.fillStyle(COLORS.cream, alpha * 0.6);
    g.lineStyle(4, COLORS.outline, alpha);
    g.fillCircle(x, y, RADIUS);
    g.strokeCircle(x, y, RADIUS);
    // The d-pad arrows, so it reads as "move" to a child.
    g.fillStyle(COLORS.outline, alpha);
    const a = RADIUS - 22;
    g.fillTriangle(x, y - a - 14, x - 14, y - a + 6, x + 14, y - a + 6);
    g.fillTriangle(x, y + a + 14, x - 14, y + a - 6, x + 14, y + a - 6);
    g.fillTriangle(x - a - 14, y, x - a + 6, y - 14, x - a + 6, y + 14);
    g.fillTriangle(x + a + 14, y, x + a - 6, y - 14, x + a - 6, y + 14);
    this.knob.setPosition(x, y).setAlpha(Math.min(1, alpha + 0.3));
  }
}
