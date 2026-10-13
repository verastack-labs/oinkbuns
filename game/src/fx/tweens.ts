import Phaser from 'phaser';
import { dur } from './reduceMotion';

// Anything with a transform: Image, Sprite, Text, Container. Entities expose
// their root object through a `root` getter (plan 2).
export type FxTarget = Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform;

interface Rest {
  scaleX: number;
  scaleY: number;
  angle: number;
}

// The scale and angle a target returns to. Captured the first time a tween
// touches it, before any tween has changed it, so a kill mid-tween can never
// make the "rest" value drift.
const rest = new WeakMap<FxTarget, Rest>();

function restOf(target: FxTarget): Rest {
  let r = rest.get(target);
  if (r === undefined) {
    r = { scaleX: target.scaleX, scaleY: target.scaleY, angle: target.angle };
    rest.set(target, r);
  }
  return r;
}

function settle(scene: Phaser.Scene, target: FxTarget): Rest {
  const r = restOf(target);
  scene.tweens.killTweensOf(target);
  target.setScale(r.scaleX, r.scaleY);
  target.setAngle(r.angle);
  return r;
}

// Grows from 60 percent to full size with an overshoot: prompt bubbles,
// picked-up items, completed customers.
export function pop(scene: Phaser.Scene, target: FxTarget, ms = 180): void {
  const r = settle(scene, target);
  target.setScale(r.scaleX * 0.6, r.scaleY * 0.6);
  scene.tweens.add({
    targets: target,
    scaleX: r.scaleX,
    scaleY: r.scaleY,
    duration: dur(ms),
    ease: 'Back.easeOut',
    onComplete: () => target.setScale(r.scaleX, r.scaleY),
  });
}

// Wider and shorter, then back: items on pick-up and serve, stations on use.
export function squash(scene: Phaser.Scene, target: FxTarget, ms = 220): void {
  const r = settle(scene, target);
  scene.tweens.add({
    targets: target,
    scaleX: r.scaleX * 1.25,
    scaleY: r.scaleY * 0.75,
    duration: dur(ms) / 2,
    yoyo: true,
    ease: 'Quad.easeOut',
    onComplete: () => target.setScale(r.scaleX, r.scaleY),
  });
}

// From nothing to full size with a bounce: a customer arriving.
export function bounceIn(scene: Phaser.Scene, target: FxTarget, ms = 450): void {
  const r = settle(scene, target);
  target.setScale(r.scaleX * 0.2, r.scaleY * 0.2);
  scene.tweens.add({
    targets: target,
    scaleX: r.scaleX,
    scaleY: r.scaleY,
    duration: dur(ms),
    ease: 'Bounce.easeOut',
    onComplete: () => target.setScale(r.scaleX, r.scaleY),
  });
}

// A short "no": three wobbles of eight degrees either way.
export function shake(scene: Phaser.Scene, target: FxTarget, ms = 300): void {
  const r = settle(scene, target);
  scene.tweens.add({
    targets: target,
    angle: r.angle + 8,
    duration: dur(ms) / 6,
    yoyo: true,
    repeat: 2,
    ease: 'Sine.easeInOut',
    onComplete: () => target.setAngle(r.angle),
  });
}
