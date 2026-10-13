import Phaser from 'phaser';
import { sfx } from '../audio';
import { Day } from '../core/day';
import { clampToWalkable, counterId, LOGICAL_WIDTH, STATION_POINTS, WALKABLE } from '../core/layout';
import type { CustomerState, DayEvent, ItemKind, Point, StationId } from '../core/types';
import { dayById } from '../data/days';
import { InputController } from '../input/InputController';
import { COLORS, cssColor, FONT_STACK } from '../ui/theme';
import { promptText } from '../ui/promptText';
import { MuteButton } from '../ui/MuteButton';
import { KitchenFx } from './kitchenFx';
import { SceneKey } from './keys';
import type { DayEndData, KitchenData } from './sceneData';

/** Where each station's prop is drawn (its centre), from STATION_POINTS. */
const PROP: Partial<Record<StationId, { key: string; x: number; y: number }>> = {
  bowl: { key: 'bowl', x: 75, y: 330 },
  chipJar: { key: 'chip-jar', x: 75, y: 450 },
  icing: { key: 'icing-table', x: 520, y: 650 },
  bin: { key: 'bin', x: 820, y: 650 },
};

const ITEM_TEXTURE: Record<ItemKind, string> = {
  dough: 'bun-dough',
  'chip-dough': 'bun-chip-dough',
  baked: 'bun-baked',
  'chip-baked': 'bun-chip-baked',
  burnt: 'bun-burnt',
  'hot-cross': 'bun-hot-cross',
  'chip-hot-cross': 'bun-chip-hot-cross',
};

const DEPTH = { floor: 0, shade: 1, shadow: 2, customers: 20, counter: 30, world: 40, ui: 100 } as const;

/**
 * A little perspective: things further back (higher on screen) are drawn
 * smaller, and everything on the floor is sorted front to back by where it
 * touches the floor, so Peppa can walk behind the icing table.
 */
const NEAR_SCALE = 1.1;
const FAR_SCALE = 0.86;
function depthScale(y: number): number {
  const t = (y - WALKABLE.y0) / (WALKABLE.y1 - WALKABLE.y0);
  return FAR_SCALE + Math.min(1, Math.max(0, t)) * (NEAR_SCALE - FAR_SCALE);
}
const floorDepth = (footY: number): number => DEPTH.world + footY / 1000;
const SHADOW = 0x3a2a2a;
// Wall-side appliances: above the counter, always behind Peppa.
const SIDE_DEPTH = DEPTH.counter + 1;
const WALK_FRAME_SECONDS = 0.14;
// The oven is drawn a little right of its interaction points so Peppa, who
// stops beside it, never covers the door windows. Its two windows sit at
// y 330 and 450, the oven-0 and oven-1 points.
const OVEN_X = 1190;
// Customers stand behind the counter (top edge y 145), which hides their legs.
const CUSTOMER_FEET_Y = 215;
const CUSTOMER_SCALE = 0.85;

interface CustomerView {
  root: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Image;
  buns: Phaser.GameObjects.Image[];
  ticks: Phaser.GameObjects.Text[];
  patience: Phaser.GameObjects.Graphics;
  id: string;
  top: number; // y of the bubble's tail tip, relative to the feet
}

/**
 * The kitchen (spec 5.1 to 5.3, 7.3, 7.4). Each frame: read one Intent, tick
 * the Day, hand every event to handleEvent, then redraw from day.state. The
 * scene owns no rules; it only draws what the Day says is true.
 */
export class KitchenScene extends Phaser.Scene {
  private day!: Day;
  private input2!: InputController;
  private peppa!: Phaser.GameObjects.Image;
  private held!: Phaser.GameObjects.Image;
  private customers = new Map<number, CustomerView>();
  private stations = new Map<StationId, Phaser.GameObjects.Image>();
  private ovenSlots: Phaser.GameObjects.Image[] = [];
  private ovenBars!: Phaser.GameObjects.Graphics;
  private icingBar!: Phaser.GameObjects.Graphics;
  private promptBubble!: Phaser.GameObjects.Container;
  private promptLabel!: Phaser.GameObjects.Text;
  private promptBg!: Phaser.GameObjects.Image;
  private penniesText!: Phaser.GameObjects.Text;
  private clockText!: Phaser.GameObjects.Text;
  private hintArrow!: Phaser.GameObjects.Image;
  private walkClock = 0;
  private peppaShadow!: Phaser.GameObjects.Ellipse;
  private peppaRoot!: Phaser.GameObjects.Container;
  private heldRoot!: Phaser.GameObjects.Container;
  private fx!: KitchenFx;
  private ovenImage: Phaser.GameObjects.Image | null = null;

  constructor() {
    super(SceneKey.Kitchen);
  }

  create(data: KitchenData): void {
    const config = dayById(data.dayId);
    this.day = new Day(config, data.seed);
    this.customers = new Map();
    this.stations = new Map();
    this.ovenSlots = [];
    this.walkClock = 0;

    this.add.image(0, 0, 'kitchen-bg').setOrigin(0).setDepth(DEPTH.floor);
    this.drawShading();

    for (const [id, prop] of Object.entries(PROP) as [StationId, { key: string; x: number; y: number }][]) {
      const img = this.add.image(prop.x, prop.y, prop.key);
      // The bowl and chip jar stand against the left wall, so Peppa is always
      // in front of them; the table and bin out on the floor are sorted with her.
      img.setDepth(id === 'bowl' || id === 'chipJar' ? SIDE_DEPTH : floorDepth(prop.y + img.height / 2));
      this.stations.set(id, img);
    }
    // Spec 7.5: the chip jar shows only on days that use it.
    this.stations.get('chipJar')?.setVisible(config.chipChance > 0);

    this.ovenImage = this.add.image(OVEN_X, 390, 'oven').setDepth(SIDE_DEPTH);
    for (const id of ['oven-0', 'oven-1'] as const) {
      const p = STATION_POINTS[id];
      this.ovenSlots.push(this.add.image(OVEN_X, p.y, 'oven-slot-baking').setDepth(SIDE_DEPTH + 0.1).setVisible(false));
    }
    this.ovenBars = this.add.graphics().setDepth(SIDE_DEPTH + 0.2);
    this.icingBar = this.add.graphics().setDepth(DEPTH.ui);

    this.add.image(LOGICAL_WIDTH / 2, 200, 'counter').setDepth(DEPTH.counter);

    this.peppaShadow = this.add.ellipse(0, 0, 80, 18, SHADOW, 0.22).setDepth(DEPTH.shadow);
    // Peppa and her carried item each live in a container: the container takes
    // the per-frame position and distance scale, while the image inside keeps
    // scale 1 so the squash and pop animations always return to the right size.
    this.peppa = this.make.image({ key: 'peppa-idle', add: false }).setOrigin(0.5, 1);
    this.peppaRoot = this.add.container(0, 0, [this.peppa]);
    this.held = this.make.image({ key: 'bun-dough', add: false });
    this.heldRoot = this.add.container(0, 0, [this.held]).setVisible(false);

    this.promptLabel = this.add
      .text(0, -51, '', { fontFamily: FONT_STACK, fontSize: '26px', fontStyle: 'bold', color: cssColor(COLORS.text) })
      .setOrigin(0.5);
    this.promptBg = this.add.image(0, 0, 'bubble').setOrigin(0.5, 1).setScale(1, 0.75);
    this.promptBubble = this.add.container(0, 0, [this.promptBg, this.promptLabel]).setDepth(DEPTH.ui).setVisible(false);

    this.hintArrow = this.add.image(0, 0, 'arrow').setDepth(DEPTH.ui).setVisible(false);
    this.tweens.add({ targets: this.hintArrow, scaleY: 0.85, duration: 400, yoyo: true, repeat: -1 });

    const hud = { fontFamily: FONT_STACK, fontSize: '36px', fontStyle: 'bold', color: cssColor(COLORS.text) };
    this.penniesText = this.add.text(24, 16, '', hud).setDepth(DEPTH.ui);
    // The mute button takes the top-right corner, so the clock sits left of it.
    new MuteButton(this, LOGICAL_WIDTH - 56, 56).setDepth(DEPTH.ui);
    this.clockText = this.add.text(LOGICAL_WIDTH - 108, 16, '', hud).setOrigin(1, 0).setDepth(DEPTH.ui);

    const touch = this.sys.game.device.input.touch;
    this.input2 = new InputController(this, { touch });
    this.input2.setClickResolver((p) => this.resolveClick(p));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.input2.destroy());

    this.fx = new KitchenFx(this, {
      peppaTarget: () => this.peppa,
      peppaMoving: () => this.day.state.peppa.moving,
      customerTarget: (uid) => this.customers.get(uid)?.root ?? null,
      stationTarget: (id) => {
        if (id === 'oven-0') return this.ovenSlots[0] ?? null;
        if (id === 'oven-1') return this.ovenSlots[1] ?? null;
        return this.stations.get(id) ?? null;
      },
      heldTarget: () => (this.day.state.held ? this.held : null),
      promptTarget: () => (this.promptBubble.visible ? this.promptBubble : null),
      prompt: () => this.day.state.prompt,
      pennyTarget: () => this.penniesText,
    });

    this.render();
    sfx().music('kitchen');
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    const s = this.day.state;
    const intent = this.input2.read({ x: s.peppa.x, y: s.peppa.y });
    // Pressing act with nothing to do gets a gentle no rather than silence.
    if (intent.action && !s.prompt && !s.icing.active) sfx().play('nope', { volume: 0.45 });
    this.day.tick(dt, intent);
    for (const event of this.day.drain()) {
      this.handleEvent(event);
      this.fx.handle(event);
    }
    this.walkClock += dt;
    this.render();
  }

  private handleEvent(event: DayEvent): void {
    switch (event.type) {
      case 'day-over': {
        const data: DayEndData = { dayId: this.day.config.id, pennies: event.pennies, stars: event.stars };
        this.scene.launch(SceneKey.DayEnd, data);
        this.scene.pause();
        break;
      }
      default:
        break;
    }
  }

  private render(): void {
    const s = this.day.state;

    // Peppa: two-frame walk, flipped to face where she is going.
    const frame = s.peppa.moving ? (Math.floor(this.walkClock / WALK_FRAME_SECONDS) % 2 === 0 ? 'peppa-walk1' : 'peppa-walk2') : 'peppa-idle';
    const sc = depthScale(s.peppa.y);
    // A tiny bounce while walking makes the two-frame walk feel springy.
    const bob = s.peppa.moving ? Math.abs(Math.sin(this.walkClock * 14)) * 3 : 0;
    this.peppa.setTexture(frame).setPosition(0, -bob).setFlipX(s.peppa.facing === 'left');
    this.peppaRoot.setPosition(s.peppa.x, s.peppa.y).setScale(sc).setDepth(floorDepth(s.peppa.y));
    this.peppaShadow.setPosition(s.peppa.x, s.peppa.y - 2).setScale(sc * (1 - bob / 20));

    if (s.held) {
      // Carried in front at hand height, on the side she faces, so it never
      // covers a customer's order bubble when she is at the counter.
      const side = s.peppa.facing === 'left' ? -1 : 1;
      this.held.setTexture(ITEM_TEXTURE[s.held]);
      this.heldRoot
        .setPosition(s.peppa.x + side * 52 * sc, s.peppa.y - (70 + bob) * sc)
        .setScale(sc)
        .setDepth(floorDepth(s.peppa.y) + 0.0001)
        .setVisible(true);
    } else {
      this.heldRoot.setVisible(false);
    }

    this.renderOven();
    this.renderIcing();
    this.renderCustomers(s.queue);
    this.renderPrompt();
    this.renderHint();

    this.penniesText.setText(`Pennies: ${s.pennies}`);
    const end = this.day.config.end;
    if (s.remaining !== null) {
      const secs = Math.ceil(s.remaining);
      this.clockText.setText(`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`);
      this.clockText.setColor(cssColor(secs <= 15 ? COLORS.bad : COLORS.text));
    } else if (end.type === 'customers') {
      this.clockText.setText(`Served ${s.served} / ${end.count}`);
    }
  }

  private renderOven(): void {
    const s = this.day.state;
    const cfg = this.day.config;
    this.ovenBars.clear();
    s.oven.forEach((slot, i) => {
      const img = this.ovenSlots[i];
      const p = STATION_POINTS[i === 0 ? 'oven-0' : 'oven-1'];
      if (slot.status === 'empty') {
        img.setVisible(false);
        return;
      }
      img.setVisible(true).setTexture(`oven-slot-${slot.status}`);
      if (slot.status === 'baking') {
        this.bar(this.ovenBars, OVEN_X - 50, p.y + 46, 100, slot.elapsed / cfg.bakeSeconds, COLORS.bun);
      } else if (slot.status === 'ready' && cfg.burnWindowSeconds !== null) {
        // Counts down to burning, so the warning is visible, not just heard.
        this.bar(this.ovenBars, OVEN_X - 50, p.y + 46, 100, 1 - slot.elapsed / cfg.burnWindowSeconds, COLORS.bad);
      }
    });
  }

  private renderIcing(): void {
    const icing = this.day.state.icing;
    this.icingBar.clear();
    if (icing.active) {
      const p = STATION_POINTS.icing;
      this.bar(this.icingBar, p.x - 60, p.y - 110, 120, icing.progress, COLORS.good);
    }
  }

  private renderCustomers(queue: CustomerState[]): void {
    const present = new Set(queue.map((c) => c.uid));
    for (const [uid, view] of this.customers) {
      if (!present.has(uid)) {
        view.root.destroy();
        this.customers.delete(uid);
      }
    }
    for (const c of queue) {
      let view = this.customers.get(c.uid);
      if (!view) {
        view = this.makeCustomer(c);
        this.customers.set(c.uid, view);
      }
      const p = STATION_POINTS[counterId(c.spot)];
      // Customers stand behind the counter (it hides their legs), with the
      // order bubble just above their heads.
      view.root.setPosition(p.x, CUSTOMER_FEET_Y);
      c.order.buns.forEach((bun, i) => {
        view.buns[i]?.setAlpha(bun.served ? 0.35 : 1);
        view.ticks[i]?.setVisible(bun.served);
      });
      const g = view.patience;
      g.clear();
      this.bar(g, -48, view.top - 26, 96, c.patience, c.patience > 0.5 ? COLORS.good : c.patience > 0.25 ? COLORS.bun : COLORS.bad);
    }
  }

  private makeCustomer(c: CustomerState): CustomerView {
    // Customers stand further back than Peppa, so they are drawn a little
    // smaller; the order bubble sits just above each one's head, whatever
    // their height (Grandpa is the tallest).
    const body = this.add.image(0, 0, `${c.id}-idle`).setOrigin(0.5, 1).setFlipX(true).setScale(CUSTOMER_SCALE);
    const top = -body.displayHeight - 2;
    const bubble = this.add.image(0, top, 'bubble').setOrigin(0.5, 1).setScale(1.05, 0.62);
    const n = c.order.buns.length;
    const buns: Phaser.GameObjects.Image[] = [];
    const ticks: Phaser.GameObjects.Text[] = [];
    c.order.buns.forEach((bun, i) => {
      const x = (i - (n - 1) / 2) * 40;
      buns.push(this.add.image(x, top - 42, bun.kind === 'chip' ? 'bun-chip-hot-cross' : 'bun-hot-cross').setScale(0.45));
      ticks.push(
        this.add
          .text(x, top - 42, '✓', { fontFamily: FONT_STACK, fontSize: '34px', fontStyle: 'bold', color: cssColor(COLORS.good) })
          .setOrigin(0.5)
          .setVisible(false),
      );
    });
    const patience = this.add.graphics();
    const root = this.add.container(0, 0, [body, bubble, ...buns, ...ticks, patience]).setDepth(DEPTH.customers);
    return { root, body, buns, ticks, patience, id: c.id, top };
  }

  private renderPrompt(): void {
    const prompt = this.day.state.prompt;
    this.input2.setPromptLabel(prompt?.label ?? null);
    if (!prompt) {
      this.promptBubble.setVisible(false);
      return;
    }
    // The prompt floats over Peppa's head, where a child is already looking.
    // Near the top of the floor that would collide with the customers' order
    // bubbles, so there it moves beside her at shoulder height, on the side
    // facing the middle of the kitchen.
    const s = this.day.state;
    this.promptLabel.setText(promptText(prompt.label));
    this.promptBg.setScale(Math.max(1, (this.promptLabel.width + 44) / 150), 0.75);
    const half = (this.promptBg.displayWidth) / 2;
    let x = s.peppa.x;
    let y = s.peppa.y - 142 * depthScale(s.peppa.y);
    if (y - 82 < 110) {
      x = s.peppa.x + (s.peppa.x > LOGICAL_WIDTH / 2 ? -1 : 1) * (60 + half);
      y = s.peppa.y - 10;
    }
    x = Math.min(Math.max(x, half + 8), LOGICAL_WIDTH - half - 8);
    this.promptBubble.setPosition(x, y).setVisible(true);
  }

  private renderHint(): void {
    const { hint, prompt } = this.day.state;
    // Once she is at the hinted station the prompt says what to do, so the
    // arrow steps aside rather than covering it.
    if (!hint || prompt?.station === hint) {
      this.hintArrow.setVisible(false);
      return;
    }
    const p = STATION_POINTS[hint];
    const below = hint.startsWith('counter');
    this.hintArrow.setVisible(true).setPosition(p.x, below ? p.y + 75 : p.y - 110).setAngle(below ? -90 : 90);
  }

  /**
   * Static depth cues drawn once over the backdrop: the floor darkens toward
   * the wall, the counter casts a shadow onto the floor, and every prop sits
   * on a soft contact shadow.
   */
  private drawShading(): void {
    const g = this.add.graphics().setDepth(DEPTH.shade);
    const floorTop = 264;
    for (let i = 0; i < 12; i += 1) {
      g.fillStyle(SHADOW, 0.13 * (1 - i / 12));
      g.fillRect(0, floorTop + i * 14, LOGICAL_WIDTH, 14);
    }
    // Under the counter's front edge.
    g.fillStyle(SHADOW, 0.18);
    g.fillRect(0, 255, LOGICAL_WIDTH, 10);

    const shadows = this.add.graphics().setDepth(DEPTH.shadow);
    shadows.fillStyle(SHADOW, 0.2);
    const ellipse = (x: number, y: number, w: number, h: number) => shadows.fillEllipse(x, y, w, h);
    ellipse(75, 372, 120, 20); // bowl
    if (this.day.config.chipChance > 0) ellipse(75, 503, 80, 16); // chip jar
    ellipse(OVEN_X, 538, 190, 22); // oven
    ellipse(520, 703, 210, 16); // icing table
    ellipse(820, 704, 74, 14); // bin
  }

  /**
   * Generous click targets: anywhere on or near a station or a waiting
   * customer counts as clicking it, and sends Peppa to the spot she uses it
   * from. Anything else is a plain walk to the clicked floor.
   */
  private resolveClick(p: Point): { target: Point; hit: boolean } {
    const PAD = 30;
    const near = (b: Phaser.Geom.Rectangle): boolean =>
      p.x >= b.left - PAD && p.x <= b.right + PAD && p.y >= b.top - PAD && p.y <= b.bottom + PAD;
    const spot = (id: StationId): { target: Point; hit: boolean } => ({ target: clampToWalkable(STATION_POINTS[id]), hit: true });

    for (const c of this.day.state.queue) {
      const view = this.customers.get(c.uid);
      if (view && near(view.root.getBounds())) return spot(counterId(c.spot));
    }
    for (const [id, img] of this.stations) {
      if (img.visible && near(img.getBounds())) return spot(id);
    }
    if (this.ovenImage && near(this.ovenImage.getBounds())) return spot(p.y < 390 ? 'oven-0' : 'oven-1');
    return { target: { x: p.x, y: p.y + 40 }, hit: false };
  }

  private bar(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, fraction: number, color: number): void {
    const f = Math.max(0, Math.min(1, fraction));
    g.fillStyle(COLORS.outline, 1);
    g.fillRoundedRect(x - 3, y - 3, w + 6, 18, 8);
    g.fillStyle(COLORS.cream, 1);
    g.fillRoundedRect(x, y, w, 12, 6);
    if (f > 0) {
      g.fillStyle(color, 1);
      g.fillRoundedRect(x, y, Math.max(12, w * f), 12, 6);
    }
  }
}
