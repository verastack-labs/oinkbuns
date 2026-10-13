import type Phaser from 'phaser';
import { getProgress } from '../progressStore';
import { Sfx } from './Sfx';

export { Sfx } from './Sfx';
export type { MusicId, SfxId } from './Sfx';

let instance: Sfx | null = null;

// Called once from BootScene.create, after every audio file has loaded, so
// the saved mute state applies before any scene makes a sound.
export function initSfx(game: Phaser.Game): Sfx {
  if (instance === null) {
    instance = new Sfx(game.sound, getProgress().muted);
  }
  return instance;
}

export function sfx(): Sfx {
  if (instance === null) {
    throw new Error('sfx() called before initSfx()');
  }
  return instance;
}
