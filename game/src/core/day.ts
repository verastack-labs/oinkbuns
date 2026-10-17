import { customerDef } from './customers';
import {
  clampToWalkable,
  counterId,
  counterIndexOf,
  distance,
  ICING_SECONDS,
  INTERACT_RADIUS,
  LAST_SECONDS_WARNING,
  ovenId,
  ovenIndexOf,
  PEPPA_SPEED,
  PEPPA_START,
  STATION_POINTS,
  stationKindOf,
} from './layout';
import { emptySlot, loadSlot, takeFromSlot, tickSlot, type OvenConfig } from './oven';
import { isComplete, needs, penniesForBun, serveBun, tipFor } from './orders';
import { icedItemFor, servableKind, stationAction } from './recipe';
import { mulberry32 } from './rng';
import { createSpawner, type Spawner } from './spawner';
import type {
  CustomerState,
  DayConfig,
  DayEvent,
  DayState,
  Intent,
  Prompt,
  PromptLabel,
  Stars,
  StationId,
} from './types';

/**
 * One day's whole simulation (spec 5.1 to 5.7, 7.2, 7.4). The scene calls
 * tick(dt, intent) once per frame, drains the events, and redraws from
 * state. Nothing here knows about Phaser or which device made the intent.
 */
const STATION_IDS: readonly StationId[] = [
  'bowl',
  'chipJar',
  'oven-0',
  'oven-1',
  'icing',
  'bin',
  'counter-0',
  'counter-1',
  'counter-2',
];

export function computeStars(pennies: number, thresholds: [number, number, number]): Stars {
  if (pennies >= thresholds[2]) {
    return 3;
  }
  if (pennies >= thresholds[1]) {
    return 2;
  }
  if (pennies >= thresholds[0]) {
    return 1;
  }
  return 0;
}

type BinHint = 'unused' | 'active' | 'used';

export class Day {
  readonly config: DayConfig;
  private readonly s: DayState;
  private readonly events: DayEvent[] = [];
  private readonly spawner: Spawner;
  private readonly ovenCfg: OvenConfig;
  private nextUid = 0;
  private lastSecondsSent = false;
  private binHint: BinHint = 'unused';

  private readonly interactRadius: number;

  // `interactRadius` widens how close Peppa must stand to use a station (a grown-up setting).
  constructor(config: DayConfig, seed: number, opts: { interactRadius?: number } = {}) {
    this.config = config;
    this.interactRadius = opts.interactRadius ?? INTERACT_RADIUS;
    this.ovenCfg = { bakeSeconds: config.bakeSeconds, burnWindowSeconds: config.burnWindowSeconds };
    this.spawner = createSpawner(config, mulberry32(seed));
    this.s = {
      peppa: { x: PEPPA_START.x, y: PEPPA_START.y, facing: 'right', moving: false },
      held: null,
      oven: [emptySlot(), emptySlot()],
      icing: { active: false, progress: 0 },
      queue: [],
      pennies: 0,
      served: 0,
      elapsed: 0,
      strikes: 0,
      remaining: config.end.type === 'time' ? config.end.seconds : null,
      over: false,
      stars: 0,
      prompt: null,
      hint: null,
    };
  }

  get state(): Readonly<DayState> {
    return this.s;
  }

  drain(): DayEvent[] {
    const out = this.events.slice();
    this.events.length = 0;
    return out;
  }

  // dt in seconds. No-op once the day is over.
  tick(dt: number, intent: Intent): void {
    const s = this.s;
    if (s.over) {
      return;
    }
    s.elapsed += dt;

    this.tickIcingOrMove(dt, intent);
    this.tickOven(dt);
    this.tickPatience(dt);
    this.tickSpawner(dt);

    s.prompt = this.computePrompt();
    if (intent.action && s.prompt !== null) {
      this.perform(s.prompt);
      s.prompt = this.computePrompt();
    }

    this.tickClockAndEnd();
    this.updateHint();
  }

  private tickIcingOrMove(dt: number, intent: Intent): void {
    const s = this.s;
    if (s.icing.active) {
      s.peppa.moving = false;
      s.icing.progress = Math.min(1, s.icing.progress + dt / ICING_SECONDS);
      if (s.icing.progress >= 1) {
        const baked = s.held === 'chip-baked' ? 'chip-baked' : 'baked';
        s.held = icedItemFor(baked);
        s.icing = { active: false, progress: 0 };
        this.events.push({ type: 'icing-done', item: s.held });
      }
      return;
    }
    let { moveX, moveY } = intent;
    const length = Math.hypot(moveX, moveY);
    if (length < 0.001) {
      s.peppa.moving = false;
      return;
    }
    if (length > 1) {
      moveX /= length;
      moveY /= length;
    }
    const next = clampToWalkable({
      x: s.peppa.x + moveX * PEPPA_SPEED * dt,
      y: s.peppa.y + moveY * PEPPA_SPEED * dt,
    });
    s.peppa.x = next.x;
    s.peppa.y = next.y;
    s.peppa.moving = true;
    if (Math.abs(moveX) > 0.01) {
      s.peppa.facing = moveX < 0 ? 'left' : 'right';
    }
  }

  private tickOven(dt: number): void {
    const s = this.s;
    for (const index of [0, 1] as const) {
      const r = tickSlot(s.oven[index], dt, this.ovenCfg);
      s.oven[index] = r.slot;
      if (r.event === 'ding') {
        this.events.push({ type: 'oven-ding', slot: index });
      } else if (r.event === 'burnt') {
        this.events.push({ type: 'oven-burnt', slot: index });
        if (this.binHint === 'unused') {
          this.binHint = 'active';
        }
      }
    }
  }

  private tickPatience(dt: number): void {
    const s = this.s;
    const staying: CustomerState[] = [];
    for (const c of s.queue) {
      c.patience = Math.max(0, c.patience - dt / c.patienceSeconds);
      if (c.patience <= 0) {
        this.s.strikes += 1;
        this.events.push({ type: 'customer-left-sad', uid: c.uid });
      } else {
        staying.push(c);
      }
    }
    if (staying.length !== s.queue.length) {
      s.queue = staying;
      this.reindexQueue();
    }
  }

  private tickSpawner(dt: number): void {
    const s = this.s;
    // The endless Bun Rush speeds up: customers arrive up to twice as often after three minutes.
    const rush = this.config.end.type === 'strikes';
    const spawn = this.spawner.tick(rush ? dt * (1 + Math.min(1, s.elapsed / 180)) : dt, s.queue.length);
    if (spawn === null) {
      return;
    }
    this.nextUid += 1;
    const spot = s.queue.length as 0 | 1 | 2;
    const def = customerDef(spawn.id);
    s.queue.push({
      uid: this.nextUid,
      id: spawn.id,
      order: spawn.order,
      patience: 1,
      // ...and they grow less patient, down to 60 percent after four minutes.
      patienceSeconds: def.patienceSeconds * this.config.patienceMultiplier * (rush ? Math.max(0.6, 1 - s.elapsed / 600) : 1),
      spot,
    });
    this.events.push({ type: 'customer-arrived', uid: this.nextUid, id: spawn.id, spot });
  }

  private reindexQueue(): void {
    this.s.queue.forEach((c, i) => {
      c.spot = i as 0 | 1 | 2;
    });
  }

  // The nearest in-range station or counter spot decides the prompt. The
  // station points are spaced so at most one is ever in range (Task 1).
  private computePrompt(): Prompt | null {
    const s = this.s;
    if (s.icing.active) {
      return null;
    }
    const feet = { x: s.peppa.x, y: s.peppa.y };
    let nearest: StationId | null = null;
    let best = this.interactRadius;
    for (const id of STATION_IDS) {
      if (id === 'chipJar' && this.config.chipChance === 0) {
        continue;
      }
      const d = distance(feet, STATION_POINTS[id]);
      if (d <= best) {
        best = d;
        nearest = id;
      }
    }
    if (nearest === null) {
      return null;
    }
    const label = this.labelFor(nearest);
    return label === null ? null : { label, station: nearest };
  }

  private labelFor(id: StationId): PromptLabel | null {
    const s = this.s;
    const kind = stationKindOf(id);
    if (kind === 'counter') {
      const spot = counterIndexOf(id);
      if (spot === null || s.queue[spot] === undefined) {
        return null;
      }
      return servableKind(s.held) === null ? null : 'serve';
    }
    if (kind === 'oven') {
      const index = ovenIndexOf(id);
      if (index === null) {
        return null;
      }
      return stationAction(s.held, 'oven', s.oven[index])?.label ?? null;
    }
    return stationAction(s.held, kind)?.label ?? null;
  }

  private perform(prompt: Prompt): void {
    const s = this.s;
    const kind = stationKindOf(prompt.station);

    if (kind === 'counter') {
      const spot = counterIndexOf(prompt.station);
      const bunKind = servableKind(s.held);
      if (spot === null || bunKind === null) {
        return;
      }
      const customer = s.queue[spot];
      if (customer === undefined) {
        return;
      }
      if (!needs(customer.order, bunKind)) {
        this.events.push({ type: 'wrong-bun', uid: customer.uid });
        return;
      }
      customer.order = serveBun(customer.order, bunKind);
      const pennies = penniesForBun(bunKind);
      s.pennies += pennies;
      s.held = null;
      this.events.push({ type: 'bun-served', uid: customer.uid, kind: bunKind, pennies });
      if (isComplete(customer.order)) {
        const tip = tipFor(customer.patience);
        s.pennies += tip;
        s.served += 1;
        this.events.push({ type: 'order-complete', uid: customer.uid, id: customer.id, tip });
        s.queue = s.queue.filter((c) => c.uid !== customer.uid);
        this.reindexQueue();
      }
      return;
    }

    if (kind === 'oven') {
      const index = ovenIndexOf(prompt.station);
      if (index === null) {
        return;
      }
      const result = stationAction(s.held, 'oven', s.oven[index]);
      if (result === null) {
        return;
      }
      if (result.effect.kind === 'oven-load') {
        s.oven[index] = loadSlot(s.oven[index], result.effect.bun);
        s.held = null;
        this.events.push({ type: 'oven-loaded', slot: index, kind: result.effect.bun });
      } else if (result.effect.kind === 'oven-take') {
        const taken = takeFromSlot(s.oven[index]);
        s.oven[index] = taken.slot;
        s.held = taken.item;
        this.events.push({ type: 'item-picked', item: taken.item, station: prompt.station });
      }
      return;
    }

    const result = stationAction(s.held, kind);
    if (result === null) {
      return;
    }
    switch (result.effect.kind) {
      case 'take-dough':
        s.held = 'dough';
        this.events.push({ type: 'item-picked', item: 'dough', station: 'bowl' });
        break;
      case 'add-chips':
        s.held = 'chip-dough';
        this.events.push({ type: 'item-picked', item: 'chip-dough', station: 'chipJar' });
        break;
      case 'icing-start':
        s.icing = { active: true, progress: 0 };
        s.peppa.moving = false;
        this.events.push({ type: 'icing-started' });
        break;
      case 'bin': {
        const item = result.effect.item;
        s.held = null;
        this.events.push({ type: 'binned', item });
        if (item === 'burnt' && this.binHint === 'active') {
          this.binHint = 'used';
        }
        break;
      }
      default:
        break;
    }
  }

  private tickClockAndEnd(): void {
    const s = this.s;
    const end = this.config.end;
    if (end.type === 'time') {
      s.remaining = Math.max(0, end.seconds - s.elapsed);
      if (!this.lastSecondsSent && s.remaining <= LAST_SECONDS_WARNING) {
        this.lastSecondsSent = true;
        this.events.push({ type: 'last-seconds' });
      }
      if (s.remaining <= 0) {
        s.elapsed = end.seconds;
        this.finish();
      }
      return;
    }
    if (end.type === 'strikes') {
      if (s.strikes >= end.strikes) {
        this.finish();
      }
      return;
    }
    if (s.served >= end.count) {
      this.finish();
    }
  }

  private finish(): void {
    const s = this.s;
    s.over = true;
    s.stars = computeStars(s.pennies, this.config.stars);
    s.prompt = null;
    s.peppa.moving = false;
    this.events.push({ type: 'day-over', pennies: s.pennies, stars: s.stars });
  }

  private updateHint(): void {
    const s = this.s;
    const next = s.over ? null : this.computeHint();
    if (next !== s.hint) {
      s.hint = next;
      this.events.push({ type: 'hint-changed', station: next });
    }
  }

  // Bin hint first (it only exists on burning days, after the first burn),
  // then the tutorial loop while no order has completed yet.
  private computeHint(): StationId | null {
    const s = this.s;
    if (this.binHint === 'active') {
      return 'bin';
    }
    if (!this.config.tutorial || s.served > 0) {
      return null;
    }
    if (s.icing.active) {
      return 'icing';
    }
    switch (s.held) {
      case null: {
        const ready = s.oven.findIndex((slot) => slot.status === 'ready' || slot.status === 'burnt');
        if (ready !== -1) {
          return ovenId(ready as 0 | 1);
        }
        const baking = s.oven.findIndex((slot) => slot.status === 'baking');
        return baking === -1 ? 'bowl' : ovenId(baking as 0 | 1);
      }
      case 'dough':
      case 'chip-dough': {
        const empty = s.oven.findIndex((slot) => slot.status === 'empty');
        return empty === -1 ? 'oven-0' : ovenId(empty as 0 | 1);
      }
      case 'baked':
      case 'chip-baked':
        return 'icing';
      case 'hot-cross':
      case 'chip-hot-cross':
        return counterId(0);
      case 'burnt':
        return 'bin';
      default:
        return null;
    }
  }
}
