import Phaser from 'phaser';
import { COLORS } from '../ui/theme';
import { dur, reduceMotion } from './reduceMotion';

// Above every station and character (plan 2 keeps entities under 500) and
// below the HUD and buttons at 1000.
export const FX_DEPTH = 500;

type Emitter = Phaser.GameObjects.Particles.ParticleEmitter;
type EmitterConfig = Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;

// One burst, then the emitter removes itself once the last particle has died.
function burst(scene: Phaser.Scene, x: number, y: number, texture: string, config: EmitterConfig, count: number, lifespanMs: number): void {
  const emitter = scene.add.particles(x, y, texture, { ...config, emitting: false }).setDepth(FX_DEPTH);
  emitter.explode(count);
  scene.time.delayedCall(lifespanMs + 100, () => emitter.destroy());
}

// White puffs rising from a slot at the ding.
export function steam(scene: Phaser.Scene, x: number, y: number): void {
  const life = dur(900);
  burst(
    scene, x, y, 'steam',
    {
      speedY: { min: -90, max: -50 },
      speedX: { min: -25, max: 25 },
      scale: { start: 0.6, end: 1.4 },
      alpha: { start: 0.8, end: 0 },
      lifespan: life,
    },
    reduceMotion() ? 5 : 10,
    life,
  );
}

// Yellow, white and pink stars flung outward: a served customer.
export function sparkle(scene: Phaser.Scene, x: number, y: number): void {
  const life = dur(700);
  burst(
    scene, x, y, 'sparkle',
    {
      speed: { min: 80, max: 180 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      rotate: { min: 0, max: 360 },
      lifespan: life,
      tint: [0xffd23f, 0xffffff, COLORS.peppaPink],
    },
    reduceMotion() ? 6 : 14,
    life,
  );
}

// A steady grey plume for a burning slot. The caller keeps the emitter and
// ends it with stopSmoke.
export function smoke(scene: Phaser.Scene, x: number, y: number): Emitter {
  return scene.add
    .particles(x, y, 'smoke', {
      speedY: { min: -60, max: -30 },
      speedX: { min: -15, max: 15 },
      scale: { start: 0.5, end: 1.3 },
      alpha: { start: 0.7, end: 0 },
      lifespan: dur(1400),
      frequency: 140,
      quantity: 1,
    })
    .setDepth(FX_DEPTH);
}

export function stopSmoke(scene: Phaser.Scene, emitter: Emitter): void {
  emitter.stop();
  scene.time.delayedCall(1500, () => emitter.destroy());
}

// Three stars (spec 6.3). Disabled under reduce-motion (spec 6.4). Drawn
// above the Day End card, which plan 4 places under depth 1000.
export function confetti(scene: Phaser.Scene, x: number, y: number): void {
  if (reduceMotion()) return;
  const emitter = scene.add
    .particles(x, y, 'sparkle', {
      speed: { min: 250, max: 520 },
      angle: { min: 230, max: 310 },
      gravityY: 900,
      scale: { start: 0.9, end: 0.4 },
      rotate: { min: 0, max: 360 },
      lifespan: 2200,
      tint: [COLORS.peppaPink, COLORS.peppaRed, COLORS.georgeBlue, COLORS.good, 0xffd23f, 0xffffff],
      emitting: false,
    })
    .setDepth(1100);
  emitter.explode(90);
  scene.time.delayedCall(2400, () => emitter.destroy());
}
