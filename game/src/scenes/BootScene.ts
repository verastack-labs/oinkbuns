import Phaser from 'phaser';
import { ART, AUDIO } from '../assets/manifest';
import { initSfx } from '../audio';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../core/layout';
import { generatePlaceholders } from '../entities/placeholders';
import { loadFonts } from '../ui/fonts';
import { COLORS } from '../ui/theme';
import { SceneKey } from './keys';

/**
 * Loads every texture and sound behind a loading bar, then starts the Title.
 * Each SVG is rasterised once at its manifest size, which is pixel-exact for
 * the 1280 by 720 canvas. Any file that fails to load is replaced by its
 * flat-colour placeholder, so one bad file can never stop the game.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Boot);
  }

  preload(): void {
    this.cameras.main.setBackgroundColor(COLORS.wall);
    const barW = 480;
    const barH = 28;
    const x = LOGICAL_WIDTH / 2 - barW / 2;
    const y = LOGICAL_HEIGHT / 2 - barH / 2;

    const frame = this.add.graphics();
    frame.fillStyle(COLORS.outline, 1);
    frame.fillRoundedRect(x - 4, y - 4, barW + 8, barH + 8, 16);
    frame.fillStyle(COLORS.cream, 1);
    frame.fillRoundedRect(x, y, barW, barH, 12);

    const bar = this.add.graphics();
    this.load.on(Phaser.Loader.Events.PROGRESS, (value: number) => {
      bar.clear();
      bar.fillStyle(COLORS.peppaPink, 1);
      bar.fillRoundedRect(x, y, Math.max(barH, Math.round(barW * value)), barH, 12);
    });
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      console.warn(`[boot] could not load "${file.key}" from ${file.src}`);
    });

    for (const asset of ART) {
      this.load.svg(asset.key, asset.url, { width: asset.width, height: asset.height });
    }
    for (const asset of AUDIO) {
      this.load.audio(asset.key, asset.urls);
    }
  }

  create(): void {
    // Only fills keys that did not load.
    generatePlaceholders(this);
    initSfx(this.game);
    // Text is rendered to a texture when created, so wait for Fredoka first.
    void loadFonts().then((ready) => {
      if (!ready) console.warn('[boot] Fredoka did not load in time; using the fallback font');
      this.scene.start(SceneKey.Title);
    });
  }
}
