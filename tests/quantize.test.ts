import { describe, it, expect } from 'vitest';
import { smoothSong } from '../src/core/quantize';
import { sortNotes, type Song, type SongNote } from '../src/core/song';

function n(midi: number, time: number, duration = 0.4): SongNote {
  return { midi, time, duration, hand: 'right', velocity: 0.8 };
}

function makeSong(notes: SongNote[]): Song {
  return {
    id: 's', title: 'S', level: 2, bpm: 120, timeSignature: [4, 4], // beat = 0.5 s
    notes: sortNotes(notes),
    duration: Math.max(...notes.map((x) => x.time + x.duration)),
  };
}

describe('smoothSong', () => {
  it('aligne les attaques légèrement décalées sur la grille', () => {
    const s = smoothSong(makeSong([n(60, 0.013), n(62, 0.507), n(64, 0.994)]));
    expect(s.notes.map((x) => x.time)).toEqual([0, 0.5, 1]);
  });

  it('préserve un fichier déjà propre (idempotent), y compris les triolets', () => {
    const clean = makeSong([n(60, 0), n(62, 0.5), n(64, 1), n(65, 1 + 1 / 6, 1 / 6), n(67, 1 + 2 / 6, 1 / 6)]);
    const s = smoothSong(clean);
    s.notes.forEach((x, i) => expect(x.time).toBeCloseTo(clean.notes[i].time, 6));
    expect(smoothSong(s).notes).toEqual(s.notes); // idempotent au bit près
  });

  it('fusionne les notes dupliquées (artefact OMR)', () => {
    const s = smoothSong(makeSong([n(60, 1, 0.25), n(60, 1.01, 1), n(64, 1)]));
    const c4 = s.notes.filter((x) => x.midi === 60);
    expect(c4).toHaveLength(1);
    expect(c4[0].duration).toBeGreaterThanOrEqual(1);
  });

  it('supprime le chevauchement entre deux notes de même hauteur', () => {
    const s = smoothSong(makeSong([n(60, 0, 1.2), n(60, 1, 0.5)]));
    const [a, b] = s.notes;
    expect(a.time + a.duration).toBeLessThanOrEqual(b.time);
  });

  it('recalcule la durée totale', () => {
    const s = smoothSong(makeSong([n(60, 0, 4), n(72, 2, 0.5)]));
    expect(s.duration).toBeCloseTo(4, 1);
  });
});
