/**
 * Every type shared between the core rules and the Phaser layer. This file is
 * the contract from docs/superpowers/plans/2026-10-12-oinkbuns-plan-index.md
 * and changes only when that index changes. Nothing here imports Phaser.
 */

export type BunKind = 'plain' | 'chip';
export type ItemKind =
  | 'dough'
  | 'chip-dough'
  | 'baked'
  | 'chip-baked'
  | 'burnt'
  | 'hot-cross'
  | 'chip-hot-cross';
export type StationKind = 'bowl' | 'chipJar' | 'oven' | 'icing' | 'bin' | 'counter';
export type StationId =
  | 'bowl'
  | 'chipJar'
  | 'oven-0'
  | 'oven-1'
  | 'icing'
  | 'bin'
  | 'counter-0'
  | 'counter-1'
  | 'counter-2';
export type CustomerId = 'george' | 'suzy' | 'danny' | 'grandpa';
export type PromptLabel =
  | 'take-dough'
  | 'add-chips'
  | 'load-oven'
  | 'take-bun'
  | 'ice-bun'
  | 'serve'
  | 'bin-it';
export type Stars = 0 | 1 | 2 | 3;

export interface Point {
  x: number;
  y: number;
}

export interface OrderBun {
  kind: BunKind;
  served: boolean;
}
export interface Order {
  buns: OrderBun[];
}

export interface CustomerDef {
  id: CustomerId;
  name: string;
  orderSizes: number[];
  patienceSeconds: number;
  voicePitch: number; // playback rate for the talk blip, 1 = normal
  line: string; // said when the order completes
}

export interface CustomerState {
  uid: number; // unique per spawn within a day
  id: CustomerId;
  order: Order;
  patience: number; // 1 full, 0 empty
  patienceSeconds: number; // after patienceMultiplier
  spot: 0 | 1 | 2; // counter spot, equals queue index
}

export type OvenStatus = 'empty' | 'baking' | 'ready' | 'burnt';
export interface OvenSlotState {
  status: OvenStatus;
  kind: BunKind | null;
  elapsed: number; // seconds in the current status
}

export type DayEnd = { type: 'customers'; count: number } | { type: 'time'; seconds: number };

export interface DayConfig {
  id: number;
  name: string;
  twist: string;
  end: DayEnd;
  customers: CustomerId[];
  maxOrderSize: number;
  maxQueue: 1 | 2 | 3;
  spawnGapSeconds: [number, number];
  chipChance: number; // 0 to 1
  bakeSeconds: number;
  burnWindowSeconds: number | null;
  patienceMultiplier: number;
  tutorial: boolean;
  stars: [number, number, number];
}

export interface Intent {
  moveX: number; // -1 to 1
  moveY: number; // -1 to 1
  action: boolean; // true on the frame the action was pressed
}

export interface Prompt {
  label: PromptLabel;
  station: StationId;
}

export interface PeppaState {
  x: number;
  y: number;
  facing: 'left' | 'right';
  moving: boolean;
}

export interface IcingState {
  active: boolean;
  progress: number; // 0 to 1
}

export interface DayState {
  peppa: PeppaState;
  held: ItemKind | null;
  oven: [OvenSlotState, OvenSlotState];
  icing: IcingState;
  queue: CustomerState[]; // index equals spot
  pennies: number;
  served: number; // customers whose orders completed
  elapsed: number; // seconds since start
  remaining: number | null; // seconds left for time-ended days, else null
  over: boolean;
  stars: Stars; // valid once over is true
  prompt: Prompt | null; // what the action would do right now
  hint: StationId | null; // tutorial or bin hint target
}

export type DayEvent =
  | { type: 'customer-arrived'; uid: number; id: CustomerId; spot: 0 | 1 | 2 }
  | { type: 'bun-served'; uid: number; kind: BunKind; pennies: number }
  | { type: 'order-complete'; uid: number; id: CustomerId; tip: number }
  | { type: 'customer-left-sad'; uid: number }
  | { type: 'wrong-bun'; uid: number }
  | { type: 'item-picked'; item: ItemKind; station: StationId }
  | { type: 'oven-loaded'; slot: 0 | 1; kind: BunKind }
  | { type: 'oven-ding'; slot: 0 | 1 }
  | { type: 'oven-burnt'; slot: 0 | 1 }
  | { type: 'icing-started' }
  | { type: 'icing-done'; item: ItemKind }
  | { type: 'binned'; item: ItemKind }
  | { type: 'hint-changed'; station: StationId | null }
  | { type: 'last-seconds' }
  | { type: 'day-over'; pennies: number; stars: Stars };
