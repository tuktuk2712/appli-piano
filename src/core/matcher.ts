import type { SongNote } from './song';

export type NoteJudgement = 'perfect' | 'good' | 'miss' | 'wrong';

export interface MatchEvent {
  note: SongNote | null;
  judgement: NoteJudgement;
  deltaMs: number;
}

export interface MatchStats {
  perfect: number;
  good: number;
  miss: number;
  wrong: number;
}

const PERFECT_MS = 80;

interface Pending {
  note: SongNote;
  expectedAt: number;
}

/** Apparie les notes jouées (mic/MIDI/toucher) aux notes attendues, avec fenêtre de tolérance. */
export class NoteMatcher {
  private toleranceMs: number;
  private pending: Pending[] = [];
  private _stats: MatchStats = { perfect: 0, good: 0, miss: 0, wrong: 0 };

  constructor(opts: { toleranceMs?: number }) {
    this.toleranceMs = opts.toleranceMs ?? 180;
  }

  expect(notes: SongNote[], atRefTime: number): void {
    for (const note of notes) this.pending.push({ note, expectedAt: atRefTime });
  }

  playerNote(midi: number, atRefTime: number): MatchEvent {
    let best = -1;
    let bestDelta = Infinity;
    for (let i = 0; i < this.pending.length; i++) {
      if (this.pending[i].note.midi !== midi) continue;
      const delta = Math.abs(atRefTime - this.pending[i].expectedAt) * 1000;
      if (delta < bestDelta) {
        bestDelta = delta;
        best = i;
      }
    }
    if (best >= 0 && bestDelta <= this.toleranceMs) {
      const { note } = this.pending[best];
      this.pending.splice(best, 1);
      const judgement: NoteJudgement = bestDelta <= PERFECT_MS ? 'perfect' : 'good';
      this._stats[judgement]++;
      return { note, judgement, deltaMs: bestDelta };
    }
    this._stats.wrong++;
    return { note: null, judgement: 'wrong', deltaMs: bestDelta === Infinity ? 0 : bestDelta };
  }

  private static readonly NO_EVENTS: MatchEvent[] = [];

  /** Marque 'miss' les notes attendues dont la fenêtre est expirée. */
  sweep(atRefTime: number): MatchEvent[] {
    // chemin rapide sans allocation : rien d'expiré (cas de ~99 % des frames)
    let any = false;
    for (const p of this.pending) {
      if ((atRefTime - p.expectedAt) * 1000 > this.toleranceMs) {
        any = true;
        break;
      }
    }
    if (!any) return NoteMatcher.NO_EVENTS;
    const out: MatchEvent[] = [];
    this.pending = this.pending.filter((p) => {
      if ((atRefTime - p.expectedAt) * 1000 > this.toleranceMs) {
        this._stats.miss++;
        out.push({ note: p.note, judgement: 'miss', deltaMs: (atRefTime - p.expectedAt) * 1000 });
        return false;
      }
      return true;
    });
    return out;
  }

  /** Midis actuellement attendus (pour cibler la détection micro). */
  expectedMidis(): number[] {
    return [...new Set(this.pending.map((p) => p.note.midi))];
  }

  /** Purge les notes en attente SANS toucher aux stats (seek, rebouclage, changement de main). */
  clearPending(): void {
    this.pending = [];
  }

  reset(): void {
    this.pending = [];
    this._stats = { perfect: 0, good: 0, miss: 0, wrong: 0 };
  }

  get stats(): MatchStats {
    return { ...this._stats };
  }
}

export function computeScore(stats: MatchStats): { percent: number; stars: 0 | 1 | 2 | 3 } {
  const expected = stats.perfect + stats.good + stats.miss;
  if (expected === 0) return { percent: 0, stars: 0 };
  let percent = (100 * (stats.perfect + 0.8 * stats.good)) / expected;
  percent -= stats.wrong * 2; // fausses notes
  percent = Math.round(Math.max(0, Math.min(100, percent)));
  const stars: 0 | 1 | 2 | 3 = percent >= 93 ? 3 : percent >= 80 ? 2 : percent >= 60 ? 1 : 0;
  return { percent, stars };
}
