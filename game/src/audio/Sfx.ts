import Phaser from 'phaser';
import { updateProgress } from '../progressStore';

export type SfxId =
  | 'footstep'
  | 'take-dough'
  | 'add-chips'
  | 'oven-load'
  | 'oven-ding'
  | 'burn'
  | 'bwomp'
  | 'icing'
  | 'coin'
  | 'arrive'
  | 'nope'
  | 'leave-sad'
  | 'day-start'
  | 'day-end'
  | 'star'
  | 'confetti'
  | 'click'
  | 'voice-george'
  | 'voice-suzy'
  | 'voice-danny'
  | 'voice-grandpa';
export type MusicId = 'rhyme' | 'kitchen';

const MUSIC_VOLUME = 0.55;

/**
 * Named one-shot sounds and one looping music track at a time. In plan 2 no
 * audio file is loaded, so every call finds no key in the cache and is a
 * silent no-op; plan 3 adds the files and this class starts making sound
 * without any caller changing. Mute is global and persisted (spec 6.2).
 */
export class Sfx {
  private track: Phaser.Sound.BaseSound | null = null;
  private trackId: MusicId | null = null;
  private musicRate = 1;

  constructor(
    private readonly sound: Phaser.Sound.BaseSoundManager,
    initialMuted: boolean,
  ) {
    this.sound.mute = initialMuted;
  }

  private loaded(id: SfxId | MusicId): boolean {
    return this.sound.game.cache.audio.exists(id);
  }

  play(id: SfxId, opts: { rate?: number; volume?: number } = {}): void {
    if (!this.loaded(id)) {
      return;
    }
    this.sound.play(id, { rate: opts.rate ?? 1, volume: opts.volume ?? 1 });
  }

  // null stops the music. Asking for the track already playing is a no-op.
  music(id: MusicId | null): void {
    if (id !== null && id === this.trackId && this.track !== null && this.track.isPlaying) {
      return;
    }
    if (this.track !== null) {
      this.track.stop();
      this.track.destroy();
      this.track = null;
    }
    this.trackId = id;
    if (id === null || !this.loaded(id)) {
      return;
    }
    this.track = this.sound.add(id, { loop: true, volume: MUSIC_VOLUME, rate: this.musicRate });
    this.track.play();
  }

  // 1 is normal; plan 4 uses 1.15 for the last fifteen seconds.
  setMusicRate(rate: number): void {
    this.musicRate = rate;
    const t = this.track;
    if (t instanceof Phaser.Sound.WebAudioSound || t instanceof Phaser.Sound.HTML5AudioSound) {
      t.setRate(rate);
    }
  }

  get muted(): boolean {
    return this.sound.mute;
  }

  setMuted(muted: boolean): void {
    this.sound.mute = muted;
    updateProgress((p) => ({ ...p, muted }));
  }
}
