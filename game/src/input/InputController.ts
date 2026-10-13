import Phaser from 'phaser';
import { POINTER_STOP_RADIUS } from '../core/layout';
import type { Intent, Point, PromptLabel } from '../core/types';
import { sfx } from '../audio';
import { CURSOR_DEFAULT, CURSOR_HOVER } from '../ui/cursors';
import { TouchButton } from './TouchButton';
import { TouchStick } from './TouchStick';

export interface InputOptions {
  touch: boolean;
}

/**
 * Maps a click or hover point to where Peppa's feet should go. hit is true when
 * the point is on (or near) something she can use, which snaps the target to
 * that station's standing spot and shows the hover cursor.
 */
export type ClickResolver = (p: Point) => { target: Point; hit: boolean };

type MoveKeys = Record<'up' | 'down' | 'left' | 'right' | 'w' | 'a' | 's' | 'd', Phaser.Input.Keyboard.Key>;

/**
 * Turns every device into one Intent per frame (spec 5.3):
 * - keyboard: arrows or WASD move, Space or Enter acts;
 * - mouse or trackpad: Peppa walks toward the pointer while it is inside the
 *   game and stops within POINTER_STOP_RADIUS; a click acts; any held key
 *   wins over the pointer;
 * - touch: a stick in the bottom-left quarter and one round action button.
 * The action is edge-triggered: true only on the frame it was pressed.
 */
export class InputController {
  private readonly keys: MoveKeys | null;
  private readonly actionKeys: Phaser.Input.Keyboard.Key[] = [];
  private pointerTarget: Point | null = null;
  // A mouse click means "go there and do it": the action waits until Peppa
  // arrives or can get no closer, then fires once.
  private pendingAction = false;
  private pendingFrames = 0;
  private lastPeppa: Point | null = null;
  private resolver: ClickResolver | null = null;
  private hovering = false;
  private readonly stick: TouchStick | null = null;
  private readonly button: TouchButton | null = null;

  constructor(private readonly scene: Phaser.Scene, options: InputOptions) {
    const kb = scene.input.keyboard;
    if (kb) {
      this.keys = kb.addKeys({
        up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT', w: 'W', a: 'A', s: 'S', d: 'D',
      }) as MoveKeys;
      this.actionKeys = [kb.addKey('SPACE'), kb.addKey('ENTER')];
    } else {
      this.keys = null;
    }

    scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
    scene.input.on(Phaser.Input.Events.GAME_OUT, this.onGameOut, this);

    if (options.touch) {
      scene.input.addPointer(2);
      this.stick = new TouchStick(scene);
      this.button = new TouchButton(scene);
    }
  }

  read(peppa: Point): Intent {
    let moveX = 0;
    let moveY = 0;
    const k = this.keys;
    if (k) {
      if (k.left.isDown || k.a.isDown) moveX -= 1;
      if (k.right.isDown || k.d.isDown) moveX += 1;
      if (k.up.isDown || k.w.isDown) moveY -= 1;
      if (k.down.isDown || k.s.isDown) moveY += 1;
    }

    const keyHeld = moveX !== 0 || moveY !== 0;
    if (keyHeld) {
      // Keys win; forget the pointer and any click until it moves again.
      this.pointerTarget = null;
      this.pendingAction = false;
    } else if (this.stick?.active) {
      moveX = this.stick.vector.x;
      moveY = this.stick.vector.y;
    } else if (this.pointerTarget) {
      const dx = this.pointerTarget.x - peppa.x;
      const dy = this.pointerTarget.y - peppa.y;
      const len = Math.hypot(dx, dy);
      // Hover-follow stops a little short so Peppa does not jitter under the
      // cursor; a clicked target is walked to exactly.
      const stopAt = this.pendingAction ? 3 : POINTER_STOP_RADIUS;
      if (len > stopAt) {
        moveX = dx / len;
        moveY = dy / len;
      }
    }

    let action = false;
    if (this.pendingAction) {
      this.pendingFrames += 1;
      const stillToGo = moveX !== 0 || moveY !== 0;
      const stuck = this.lastPeppa !== null && Math.hypot(peppa.x - this.lastPeppa.x, peppa.y - this.lastPeppa.y) < 0.5;
      // Arrived, or pressed against the edge of the floor and not moving.
      if (!stillToGo || (stuck && this.pendingFrames > 2)) {
        action = true;
        this.pendingAction = false;
      } else if (this.pendingFrames > 300) {
        this.pendingAction = false; // about five seconds: give up quietly
      }
    }
    this.lastPeppa = { x: peppa.x, y: peppa.y };
    for (const key of this.actionKeys) {
      if (Phaser.Input.Keyboard.JustDown(key)) action = true;
    }
    if (this.button?.consumePress()) action = true;

    return { moveX, moveY, action };
  }

  setClickResolver(resolver: ClickResolver): void {
    this.resolver = resolver;
  }

  setPromptLabel(label: PromptLabel | null): void {
    this.button?.setLabel(label);
  }

  destroy(): void {
    this.scene.input.off(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
    this.scene.input.off(Phaser.Input.Events.GAME_OUT, this.onGameOut, this);
    this.stick?.destroy();
    this.button?.destroy();
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.wasTouch) return;
    const hit = this.resolver?.({ x: pointer.worldX, y: pointer.worldY }).hit ?? false;
    if (hit !== this.hovering) {
      this.hovering = hit;
      this.scene.input.setDefaultCursor(hit ? CURSOR_HOVER : CURSOR_DEFAULT);
    }
    // A pending click keeps its target; moving the mouse away must not
    // redirect Peppa before she gets there.
    if (this.pendingAction) return;
    // Feet are at the sprite's bottom, so aim them a little below the cursor
    // tip: the cursor then sits on Peppa's body, which feels right.
    this.pointerTarget = { x: pointer.worldX, y: pointer.worldY + 40 };
  }

  private onPointerDown(pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]): void {
    // Touch uses the on-screen button; a mouse click on a UI button is that
    // button's, not the kitchen's.
    if (pointer.wasTouch || over.length > 0) return;
    if (!pointer.leftButtonDown()) return;
    const p = { x: pointer.worldX, y: pointer.worldY };
    const resolved = this.resolver?.(p);
    this.pointerTarget = resolved?.hit ? resolved.target : { x: p.x, y: p.y + 40 };
    sfx().play('click', resolved?.hit ? { rate: 1.25, volume: 0.6 } : { rate: 0.8, volume: 0.35 });
    this.pendingAction = true;
    this.pendingFrames = 0;
  }

  private onGameOut(): void {
    this.pointerTarget = null;
  }
}
