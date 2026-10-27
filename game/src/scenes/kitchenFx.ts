import Phaser from 'phaser';
import { sfx } from '../audio';
import { customerDef } from '../core/customers';
import { STATION_POINTS, ovenIndexOf, stationKindOf } from '../core/layout';
import type { CustomerId, DayEvent, Point, Prompt, StationId } from '../core/types';
import { FX_DEPTH, smoke, sparkle, steam, stopSmoke } from '../fx/particles';
import { pennyArc } from '../fx/pennyArc';
import { dur, reduceMotion } from '../fx/reduceMotion';
import { bounceIn, pop, shake, squash, type FxTarget } from '../fx/tweens';

// How KitchenFx reaches plan 2's objects without owning them. Every accessor
// may return null: a customer whose sprite is gone, a held item while hands
// are empty, a prompt bubble that is hidden.
export interface KitchenFxDeps {
  peppaTarget(): FxTarget | null;
  peppaMoving(): boolean;
  customerTarget(uid: number): FxTarget | null;
  stationTarget(id: StationId): FxTarget | null;
  heldTarget(): FxTarget | null;
  promptTarget(): FxTarget | null;
  prompt(): Prompt | null;
  pennyTarget(): FxTarget | null;
}

type Slot = 0 | 1;
type Emitter = Phaser.GameObjects.Particles.ParticleEmitter;

const FOOTSTEP_MS = 260;
const ARRIVAL_WAIT_MS = 1000;
const GLOW_TINT = 0xffe08a;
const HUD_FALLBACK: Point = { x: 640, y: 40 };

// One sound and one tween per DayEvent (spec 7.4), plus the two things no
// event covers: footsteps while Peppa walks and the prompt bubble's pop.
export class KitchenFx {
  private readonly footsteps: Phaser.Time.TimerEvent;
  private readonly glows = new Map<Slot, Phaser.GameObjects.Image>();
  private readonly smokes = new Map<Slot, Emitter>();
  private readonly pendingArrivals = new Map<number, number>(); // uid -> deadline (scene time)
  private readonly known = new Set<number>(); // uids with a sprite we track
  private readonly lastPos = new Map<number, Point>(); // uid -> last seen position
  private lastPromptKey: string | null = null;
  private readonly onPostUpdate = (): void => this.postUpdate();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly deps: KitchenFxDeps,
  ) {
    this.footsteps = scene.time.addEvent({ delay: FOOTSTEP_MS, loop: true, callback: () => this.footstep() });
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.onPostUpdate);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
  }

  handle(event: DayEvent): void {
    switch (event.type) {
      case 'customer-arrived': {
        sfx().play('arrive');
        this.voice(event.id, 150);
        this.known.add(event.uid);
        const c = this.deps.customerTarget(event.uid);
        if (c !== null) bounceIn(this.scene, c);
        else this.pendingArrivals.set(event.uid, this.scene.time.now + ARRIVAL_WAIT_MS);
        break;
      }
      case 'bun-served': {
        sfx().play('coin');
        const c = this.deps.customerTarget(event.uid);
        if (c !== null) squash(this.scene, c);
        const at = this.where(event.uid) ?? STATION_POINTS['counter-1'];
        sparkle(this.scene, at.x, at.y - 70);
        this.flyPennies({ x: at.x, y: at.y - 60 }, event.pennies);
        break;
      }
      case 'order-complete': {
        this.voice(event.id, 0);
        const c = this.deps.customerTarget(event.uid);
        if (c !== null) pop(this.scene, c, 260);
        if (event.tip > 0) {
          const at = this.where(event.uid) ?? STATION_POINTS['counter-1'];
          const from: Point = { x: at.x, y: at.y - 60 };
          this.scene.time.delayedCall(dur(220), () => {
            sfx().play('coin', { rate: 1.2 });
            this.flyPennies(from, event.tip);
          });
        }
        this.forget(event.uid);
        break;
      }
      case 'customer-left-sad': {
        sfx().play('leave-sad');
        const at = this.where(event.uid);
        if (at !== null) this.sadCloud({ x: at.x, y: at.y - 110 });
        this.forget(event.uid);
        break;
      }
      case 'wrong-bun': {
        sfx().play('nope');
        const c = this.deps.customerTarget(event.uid);
        if (c !== null) shake(this.scene, c);
        break;
      }
      case 'item-picked': {
        const kind = stationKindOf(event.station);
        if (kind === 'bowl') sfx().play('take-dough');
        else if (kind === 'chipJar') sfx().play('add-chips');
        else if (kind === 'oven') sfx().play('take-dough', { rate: 1.2 });
        const held = this.deps.heldTarget();
        if (held !== null) pop(this.scene, held);
        const station = this.deps.stationTarget(event.station);
        if (station !== null) squash(this.scene, station, 180);
        const slot = ovenIndexOf(event.station);
        if (slot !== null) this.clearSlot(slot);
        break;
      }
      case 'oven-loaded': {
        sfx().play('oven-load');
        this.clearSlot(event.slot);
        const oven = this.deps.stationTarget(`oven-${event.slot}`);
        if (oven !== null) squash(this.scene, oven, 180);
        break;
      }
      case 'oven-ding': {
        sfx().play('oven-ding');
        const p = STATION_POINTS[`oven-${event.slot}`];
        steam(this.scene, p.x, p.y - 10);
        this.startGlow(event.slot);
        break;
      }
      case 'oven-burnt': {
        sfx().play('burn');
        this.scene.time.delayedCall(250, () => sfx().play('bwomp'));
        this.stopGlow(event.slot);
        this.startSmoke(event.slot);
        break;
      }
      case 'icing-started': {
        sfx().play('icing');
        const peppa = this.deps.peppaTarget();
        if (peppa !== null) squash(this.scene, peppa);
        break;
      }
      case 'icing-done': {
        const held = this.deps.heldTarget();
        if (held !== null) pop(this.scene, held);
        break;
      }
      case 'binned': {
        sfx().play('oven-load', { rate: 0.7, volume: 0.8 });
        const bin = this.deps.stationTarget('bin');
        if (bin !== null) squash(this.scene, bin, 180);
        break;
      }
      case 'hint-changed':
        break; // plan 4's HintArrow
      case 'last-seconds':
        break; // plan 4 raises the music rate
      case 'day-over': {
        this.footsteps.paused = true;
        this.clearSlot(0);
        this.clearSlot(1);
        break;
      }
      default: {
        // Compile-time proof that every DayEvent has a case above.
        const unhandled: never = event;
        return unhandled;
      }
    }
  }

  destroy(): void {
    this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.onPostUpdate);
    this.footsteps.remove(false);
    this.clearSlot(0);
    this.clearSlot(1);
    this.pendingArrivals.clear();
    this.known.clear();
    this.lastPos.clear();
  }

  // Where a customer is, or was. The sprite may already be gone when the
  // event is drained (plan 2's handleEvent runs first), so the position
  // seen on the previous frame stands in (Review Focus 5).
  private where(uid: number): Point | null {
    const c = this.deps.customerTarget(uid);
    if (c !== null) return { x: c.x, y: c.y };
    return this.lastPos.get(uid) ?? null;
  }

  private forget(uid: number): void {
    this.known.delete(uid);
    this.lastPos.delete(uid);
    this.pendingArrivals.delete(uid);
  }

  private voice(id: CustomerId, delayMs: number): void {
    const play = (): void => sfx().play(`voice-${customerDef(id).voice}`, { rate: customerDef(id).voicePitch });
    if (delayMs > 0) this.scene.time.delayedCall(delayMs, play);
    else play();
  }

  private footstep(): void {
    if (!this.deps.peppaMoving()) return;
    sfx().play('footstep', { volume: 0.35, rate: 0.9 + Math.random() * 0.2 });
  }

  private flyPennies(from: Point, count: number): void {
    const hud = this.deps.pennyTarget();
    const to: Point = hud !== null ? { x: hud.x, y: hud.y } : HUD_FALLBACK;
    pennyArc(this.scene, from, to, count, () => {
      if (hud !== null) pop(this.scene, hud, 140);
    });
  }

  private sadCloud(at: Point): void {
    const cloud = this.scene.add.image(at.x, at.y + 20, 'cloud-sad').setDepth(FX_DEPTH).setAlpha(0);
    this.scene.tweens.add({
      targets: cloud,
      alpha: 1,
      y: at.y,
      duration: dur(350),
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: cloud,
          alpha: 0,
          y: at.y - 40,
          delay: dur(500),
          duration: dur(600),
          ease: 'Quad.easeIn',
          onComplete: () => cloud.destroy(),
        });
      },
    });
  }

  // A warm wash over the door window while a bun is ready. The pulse is a
  // loop, so under reduce-motion it is a steady glow rather than a flicker.
  private startGlow(slot: Slot): void {
    this.stopGlow(slot);
    const p = STATION_POINTS[`oven-${slot}`];
    const glow = this.scene.add
      .image(p.x, p.y, 'steam')
      .setTint(GLOW_TINT)
      .setScale(4.5, 3)
      .setAlpha(0.35)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(FX_DEPTH);
    if (!reduceMotion()) {
      this.scene.tweens.add({ targets: glow, alpha: 0.6, duration: dur(600), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    this.glows.set(slot, glow);
  }

  private stopGlow(slot: Slot): void {
    const glow = this.glows.get(slot);
    if (glow === undefined) return;
    this.scene.tweens.killTweensOf(glow);
    glow.destroy();
    this.glows.delete(slot);
  }

  private startSmoke(slot: Slot): void {
    this.stopSmokeAt(slot);
    const p = STATION_POINTS[`oven-${slot}`];
    this.smokes.set(slot, smoke(this.scene, p.x, p.y - 20));
  }

  private stopSmokeAt(slot: Slot): void {
    const emitter = this.smokes.get(slot);
    if (emitter === undefined) return;
    stopSmoke(this.scene, emitter);
    this.smokes.delete(slot);
  }

  private clearSlot(slot: Slot): void {
    this.stopGlow(slot);
    this.stopSmokeAt(slot);
  }

  private postUpdate(): void {
    // The prompt bubble pops when it appears or moves to another target.
    const prompt = this.deps.prompt();
    const key = prompt === null ? null : `${prompt.station}:${prompt.label}`;
    if (key !== null && key !== this.lastPromptKey) {
      const bubble = this.deps.promptTarget();
      if (bubble !== null) pop(this.scene, bubble, 160);
    }
    this.lastPromptKey = key;

    // Arrivals whose sprite did not exist when the event was drained.
    for (const [uid, deadline] of this.pendingArrivals) {
      const c = this.deps.customerTarget(uid);
      if (c !== null) {
        bounceIn(this.scene, c);
        this.pendingArrivals.delete(uid);
      } else if (this.scene.time.now > deadline) {
        this.pendingArrivals.delete(uid);
      }
    }

    // Remember where each customer stands for the frame its sprite is gone.
    for (const uid of this.known) {
      const c = this.deps.customerTarget(uid);
      if (c !== null) this.lastPos.set(uid, { x: c.x, y: c.y });
    }
  }
}
