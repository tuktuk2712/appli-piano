import type { Song, SongNote } from './song';

export interface SchedulerOpts {
  song: Song;
  speed: number; // 0.25..1.5
  waitMode: boolean;
  loop?: [number, number] | null;
  hands: 'left' | 'right' | 'both';
  onNotesDue(notes: SongNote[]): void;
  onEnd(): void;
}

interface Gate {
  time: number;
  midis: number[];
}

const GROUP_WINDOW = 0.05; // notes à ±50 ms = même accord

/**
 * Tête de lecture pilotée de l'extérieur par tick(nowMs) — aucune horloge interne,
 * ce qui rend la logique 100 % testable et synchronisable avec requestAnimationFrame.
 */
export class PlaybackScheduler {
  private opts: SchedulerOpts;
  private refTime = 0;
  private playing = false;
  private ended = false;
  private lastNow: number | null = null;
  private nextIdx = 0;
  private gates: Gate[] = [];
  private gateIdx = 0;
  private pending = new Set<number>();
  private isWaiting = false;

  constructor(opts: SchedulerOpts) {
    this.opts = opts;
    this.rebuildGates();
  }

  private rebuildGates(): void {
    this.gates = [];
    if (!this.opts.waitMode) return;
    const filtered = this.opts.song.notes.filter(
      (n) => this.opts.hands === 'both' || n.hand === this.opts.hands,
    );
    for (const n of filtered) {
      const last = this.gates[this.gates.length - 1];
      if (last && n.time - last.time <= GROUP_WINDOW) last.midis.push(n.midi);
      else this.gates.push({ time: n.time, midis: [n.midi] });
    }
  }

  setOptions(patch: Partial<Pick<SchedulerOpts, 'speed' | 'waitMode' | 'loop' | 'hands'>>): void {
    Object.assign(this.opts, patch);
    if ('waitMode' in patch || 'hands' in patch) {
      this.rebuildGates();
      this.gateIdx = this.gates.findIndex((g) => g.time >= this.refTime - GROUP_WINDOW);
      if (this.gateIdx < 0) this.gateIdx = this.gates.length;
      this.isWaiting = false;
      this.pending.clear();
    }
  }

  start(from?: number): void {
    if (from !== undefined) this.seek(from);
    this.playing = true;
    this.ended = false;
    this.lastNow = null;
  }

  pause(): void {
    this.playing = false;
  }

  stop(): void {
    this.playing = false;
    this.seek(0);
  }

  seek(t: number): void {
    this.refTime = t;
    this.nextIdx = this.opts.song.notes.findIndex((n) => n.time >= t);
    if (this.nextIdx < 0) this.nextIdx = this.opts.song.notes.length;
    this.gateIdx = this.gates.findIndex((g) => g.time >= t);
    if (this.gateIdx < 0) this.gateIdx = this.gates.length;
    this.isWaiting = false;
    this.pending.clear();
    this.ended = false;
  }

  get time(): number {
    return this.refTime;
  }

  get waiting(): boolean {
    return this.isWaiting;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  satisfy(midi: number): void {
    if (!this.isWaiting) return;
    this.pending.delete(midi);
    if (this.pending.size === 0) {
      this.isWaiting = false;
      this.gateIdx++;
    }
  }

  tick(nowMs: number): void {
    if (this.lastNow === null) {
      this.lastNow = nowMs;
      if (this.playing) this.emitDue();
      return;
    }
    const dt = (nowMs - this.lastNow) / 1000;
    this.lastNow = nowMs;
    if (!this.playing || this.ended || this.isWaiting) return;

    let target = this.refTime + dt * this.opts.speed;

    // Mode attente : ne pas dépasser la prochaine porte
    if (this.opts.waitMode && this.gateIdx < this.gates.length) {
      const gate = this.gates[this.gateIdx];
      if (target >= gate.time) {
        target = gate.time;
        this.isWaiting = true;
        this.pending = new Set(gate.midis);
      }
    }

    // Boucle A-B
    const loop = this.opts.loop;
    if (loop && target >= loop[1]) {
      const len = loop[1] - loop[0];
      const wrapped = loop[0] + (len > 0 ? (target - loop[1]) % len : 0);
      this.seek(wrapped);
      this.emitDue();
      return;
    }

    this.refTime = target;
    this.emitDue();

    if (this.refTime >= this.opts.song.duration && !this.isWaiting) {
      this.ended = true;
      this.playing = false;
      this.opts.onEnd();
    }
  }

  private emitDue(): void {
    const notes = this.opts.song.notes;
    const due: SongNote[] = [];
    while (this.nextIdx < notes.length && notes[this.nextIdx].time <= this.refTime + 1e-9) {
      due.push(notes[this.nextIdx]);
      this.nextIdx++;
    }
    if (due.length) this.opts.onNotesDue(due);
  }
}
