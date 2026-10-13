import Phaser from 'phaser';
import { sfx } from '../audio';
import { Day } from '../core/day';
import { counterId, LOGICAL_WIDTH, STATION_POINTS } from '../core/layout';
import type { CustomerState, DayEvent, ItemKind, StationId } from '../core/types';
import { dayById } from '../data/days';
import { InputController } from '../input/InputController';
import { COLORS, cssColor, FONT_STACK } from '../ui/theme';
import { promptText } from '../ui/promptText';
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

const DEPTH = { floor: 0, props: 10, customers: 20, counter: 30, peppa: 40, ui: 100 } as const;
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

    for (const [id, prop] of Object.entries(PROP) as [StationId, { key: string; x: number; y: number }][]) {
      this.stations.set(id, this.add.image(prop.x, prop.y, prop.key).setDepth(DEPTH.props));
    }
    // Spec 7.5: the chip jar shows only on days that use it.
    this.stations.get('chipJar')?.setVisible(config.chipChance > 0);

    this.add.image(OVEN_X, 390, 'oven').setDepth(DEPTH.props);
    for (const id of ['oven-0', 'oven-1'] as const) {
      const p = STATION_POINTS[id];
      this.ovenSlots.push(this.add.image(OVEN_X, p.y, 'oven-slot-baking').setDepth(DEPTH.props + 1).setVisible(false));
    }
    this.ovenBars = this.add.graphics().setDepth(DEPTH.props + 2);
    this.icingBar = this.add.graphics().setDepth(DEPTH.ui);

    this.add.image(LOGICAL_WIDTH / 2, 200, 'counter').setDepth(DEPTH.counter);

    this.peppa = this.add.image(0, 0, 'peppa-idle').setOrigin(0.5, 1).setDepth(DEPTH.peppa);
    this.held = this.add.image(0, 0, 'bun-dough').setDepth(DEPTH.peppa + 1).setVisible(false);

    this.promptLabel = this.add
      .text(0, -51, '', { fontFamily: FONT_STACK, fontSize: '26px', fontStyle: 'bold', color: cssColor(COLORS.text) })
      .setOrigin(0.5);
    this.promptBg = this.add.image(0, 0, 'bubble').setOrigin(0.5, 1).setScale(1, 0.75);
    this.promptBubble = this.add.container(0, 0, [this.promptBg, this.promptLabel]).setDepth(DEPTH.ui).setVisible(false);

    this.hintArrow = this.add.image(0, 0, 'arrow').setDepth(DEPTH.ui).setVisible(false);
    this.tweens.add({ targets: this.hintArrow, scaleY: 0.85, duration: 400, yoyo: true, repeat: -1 });

    const hud = { fontFamily: FONT_STACK, fontSize: '36px', fontStyle: 'bold', color: cssColor(COLORS.text) };
    this.penniesText = this.add.text(24, 16, '', hud).setDepth(DEPTH.ui);
    this.clockText = this.add.text(LOGICAL_WIDTH - 24, 16, '', hud).setOrigin(1, 0).setDepth(DEPTH.ui);

    const touch = this.sys.game.device.input.touch;
    this.input2 = new InputController(this, { touch });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.input2.destroy());

    this.render();
    sfx().music('kitchen');
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    const s = this.day.state;
    const intent = this.input2.read({ x: s.peppa.x, y: s.peppa.y });
    this.day.tick(dt, intent);
    for (const event of this.day.drain()) {
      this.handleEvent(event);
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
    this.peppa.setTexture(frame).setPosition(s.peppa.x, s.peppa.y).setFlipX(s.peppa.facing === 'left');
    this.peppa.setDepth(DEPTH.peppa + s.peppa.y / 1000);

    if (s.held) {
      // Carried in front at hand height, on the side she faces, so it never
      // covers a customer's order bubble when she is at the counter.
      const side = s.peppa.facing === 'left' ? -1 : 1;
      this.held.setTexture(ITEM_TEXTURE[s.held]).setPosition(s.peppa.x + side * 52, s.peppa.y - 70).setVisible(true);
    } else {
      this.held.setVisible(false);
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
    let y = s.peppa.y - 142;
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
