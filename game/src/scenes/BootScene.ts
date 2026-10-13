import Phaser from 'phaser';
import { initSfx } from '../audio';
import { generatePlaceholders } from '../entities/placeholders';
import { SceneKey } from './keys';

/**
 * Plan 2 boot: nothing to download, so there is no loading bar yet. Every
 * texture key in the manifest is generated as a placeholder, the Sfx
 * singleton is created (with no audio files, so it stays silent), and the
 * Title starts. Plan 3 replaces this with the real loader and audio unlock.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Boot);
  }

  create(): void {
    generatePlaceholders(this);
    initSfx(this.game);
    this.scene.start(SceneKey.Title);
  }
}
