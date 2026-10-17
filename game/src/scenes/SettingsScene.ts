import Phaser from 'phaser';
import { sfx } from '../audio';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../core/layout';
import { getProgress, updateProgress } from '../progressStore';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { COLORS, cssColor, FONT_STACK } from '../ui/theme';
import { SceneKey } from './keys';

const CX = LOGICAL_WIDTH / 2;

interface Row {
  title: string;
  hint: string;
  on: boolean;
  flip: () => void;
}

/**
 * A page for grown-ups, reached from the title: sound on or off, customers
 * who wait longer, and bigger click areas. Each switch saves at once and
 * the page redraws, so the labels always say what is true.
 */
export class SettingsScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Settings);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.wall);
    const text = { fontFamily: FONT_STACK, color: cssColor(COLORS.text) };
    const p = getProgress();
    const rows: Row[] = [
      { title: 'Sound', hint: 'Music and sound effects', on: !p.muted, flip: () => sfx().setMuted(!sfx().muted) },
      {
        title: 'Slower customers',
        hint: 'Customers wait 50 percent longer',
        on: p.slowCustomers,
        flip: () => updateProgress((q) => ({ ...q, slowCustomers: !q.slowCustomers })),
      },
      {
        title: 'Bigger click areas',
        hint: 'Peppa can use things from further away',
        on: p.bigTargets,
        flip: () => updateProgress((q) => ({ ...q, bigTargets: !q.bigTargets })),
      },
    ];

    this.add.text(CX, 80, 'For grown-ups', { ...text, fontSize: '56px', fontStyle: 'bold' }).setOrigin(0.5);
    this.add
      .text(CX, 134, 'Nothing here is sent anywhere. Settings stay on this device.', { ...text, fontSize: '24px' })
      .setOrigin(0.5);
    new Card(this, CX, LOGICAL_HEIGHT / 2 + 30, 900, 380);

    rows.forEach((row, i) => {
      const y = LOGICAL_HEIGHT / 2 - 90 + i * 110;
      this.add.text(CX - 400, y - 18, row.title, { ...text, fontSize: '34px', fontStyle: 'bold' }).setOrigin(0, 0.5);
      this.add.text(CX - 400, y + 20, row.hint, { ...text, fontSize: '22px' }).setOrigin(0, 0.5);
      new Button(
        this,
        CX + 300,
        y,
        row.on ? 'On' : 'Off',
        () => {
          row.flip();
          this.scene.restart();
        },
        { width: 160 },
      );
    });

    new Button(this, 120, LOGICAL_HEIGHT - 60, 'Back', () => this.scene.start(SceneKey.Title), { width: 180 });
  }
}
