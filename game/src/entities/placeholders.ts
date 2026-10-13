import Phaser from 'phaser';
import { ART } from '../assets/manifest';
import { COLORS } from '../ui/theme';

/**
 * Flat-colour stand-ins for every texture in the manifest, generated once at
 * boot with Graphics.generateTexture, so the kitchen can be played before
 * any art exists. Each key gets its own colour; items that must be told
 * apart without colour (spec 6.4) also get a mark: a cross on hot cross
 * buns, dots on choc-chip ones. Plan 3 deletes this file.
 */
const BASE: Record<string, number> = {
  peppa: COLORS.peppaPink,
  george: COLORS.georgeBlue,
  suzy: 0xf2f2f2,
  danny: 0xb08457,
  grandpa: 0xe7a9c4,
  'kitchen-bg': COLORS.wall,
  bowl: 0x8fc1e3,
  'chip-jar': 0x6b4a2b,
  oven: 0x7d8fa6,
  'oven-slot-baking': 0xf0a040,
  'oven-slot-ready': 0xffe08a,
  'oven-slot-burnt': 0x444444,
  'icing-table': 0xc9b7e8,
  bin: 0x5f6f5f,
  counter: 0xb07a3c,
  'bun-dough': 0xf3e2c0,
  'bun-chip-dough': 0xd9c39a,
  'bun-baked': COLORS.bun,
  'bun-chip-baked': 0xa6652a,
  'bun-burnt': 0x2b2b2b,
  'bun-hot-cross': 0xe09a4c,
  'bun-chip-hot-cross': 0xb8742e,
  bubble: COLORS.cream,
  arrow: 0xffd23f,
  star: 0xffd23f,
  'star-empty': 0xd8d0c0,
  penny: 0xd4a017,
  logo: COLORS.peppaRed,
  'cloud-sad': 0x9a9a9a,
  sparkle: 0xffffff,
  steam: 0xe8e8e8,
  smoke: 0x606060,
};

// Poses get a shade of the character colour so walk frames visibly flicker
// and happy or sad reads at a glance even as a flat block.
const POSE_SHADE: Record<string, number> = { idle: 1, walk1: 0.9, walk2: 0.8, happy: 1.12, sad: 0.6 };

function shade(color: number, factor: number): number {
  const c = Phaser.Display.Color.IntegerToColor(color);
  const clamp = (v: number): number => Math.max(0, Math.min(255, Math.round(v * factor)));
  return Phaser.Display.Color.GetColor(clamp(c.red), clamp(c.green), clamp(c.blue));
}

function colorFor(key: string): number {
  if (key in BASE) {
    return BASE[key];
  }
  const dash = key.indexOf('-');
  const family = key.slice(0, dash);
  const pose = key.slice(dash + 1);
  return shade(BASE[family] ?? 0xff00ff, POSE_SHADE[pose] ?? 1);
}

export function generatePlaceholders(scene: Phaser.Scene): void {
  for (const asset of ART) {
    if (scene.textures.exists(asset.key)) {
      continue;
    }
    const { key, width: w, height: h } = asset;
    const g = scene.add.graphics();
    const radius = Math.min(14, Math.floor(Math.min(w, h) / 4));

    if (key === 'kitchen-bg') {
      g.fillStyle(COLORS.wall, 1);
      g.fillRect(0, 0, w, 230);
      g.fillStyle(COLORS.floor, 1);
      g.fillRect(0, 230, w, h - 230);
      g.fillStyle(COLORS.skyBlue, 1);
      g.fillRect(560, 40, 160, 120);
      g.fillStyle(COLORS.grassGreen, 1);
      g.fillRect(560, 120, 160, 40);
    } else if (key === 'bubble') {
      // Rounded box with a tail at the bottom centre: the tail tip is the
      // anchor, so PromptBubble and OrderBubble use setOrigin(0.5, 1).
      g.fillStyle(COLORS.outline, 1);
      g.fillRoundedRect(0, 0, w, h - 20, 18);
      g.fillTriangle(w / 2 - 16, h - 24, w / 2 + 16, h - 24, w / 2, h);
      g.fillStyle(COLORS.cream, 1);
      g.fillRoundedRect(3, 3, w - 6, h - 26, 16);
      g.fillTriangle(w / 2 - 11, h - 25, w / 2 + 11, h - 25, w / 2, h - 5);
    } else if (key === 'arrow') {
      // Points right; the tip is at the right edge (plan 4 rotates it).
      g.fillStyle(colorFor(key), 1);
      g.fillRect(8, h / 2 - 10, w / 2, 20);
      g.fillTriangle(w / 2, 6, w / 2, h - 6, w - 4, h / 2);
      g.lineStyle(3, COLORS.outline, 1);
      g.strokeTriangle(w / 2, 6, w / 2, h - 6, w - 4, h / 2);
    } else if (key === 'penny' || key === 'sparkle' || key === 'steam' || key === 'smoke') {
      g.fillStyle(colorFor(key), 1);
      g.fillCircle(w / 2, h / 2, w / 2 - 1);
      if (key === 'penny') {
        g.lineStyle(3, COLORS.outline, 1);
        g.strokeCircle(w / 2, h / 2, w / 2 - 2);
      }
    } else {
      g.fillStyle(colorFor(key), 1);
      g.fillRoundedRect(0, 0, w, h, radius);
      g.lineStyle(3, COLORS.outline, 1);
      g.strokeRoundedRect(1.5, 1.5, w - 3, h - 3, radius);
      if (key.startsWith('bun-')) {
        drawBunMarks(g, key, w, h);
      }
      if (key === 'star' || key === 'star-empty') {
        g.fillStyle(COLORS.outline, 1);
        g.fillTriangle(w / 2, 10, w / 2 - 6, 24, w / 2 + 6, 24);
      }
    }

    g.generateTexture(key, w, h);
    g.destroy();
  }
}

function drawBunMarks(g: Phaser.GameObjects.Graphics, key: string, w: number, h: number): void {
  if (key.includes('chip')) {
    g.fillStyle(0x3a2412, 1);
    g.fillCircle(w * 0.3, h * 0.35, 4);
    g.fillCircle(w * 0.65, h * 0.3, 4);
    g.fillCircle(w * 0.5, h * 0.65, 4);
  }
  if (key.includes('hot-cross')) {
    g.lineStyle(6, COLORS.cream, 1);
    g.lineBetween(w / 2, 8, w / 2, h - 8);
    g.lineBetween(8, h / 2, w - 8, h / 2);
  }
}
