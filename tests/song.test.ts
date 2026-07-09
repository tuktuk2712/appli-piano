import { describe, it, expect } from 'vitest';
import { sortNotes, notesInWindow, noteName, midiRange, type Song, type SongNote } from '../src/core/song';

function n(midi: number, time: number, duration = 0.5, hand: 'left' | 'right' = 'right'): SongNote {
  return { midi, time, duration, hand, velocity: 0.8 };
}

const song: Song = {
  id: 't', title: 'Test', level: 1, bpm: 120, timeSignature: [4, 4],
  notes: sortNotes([n(60, 0), n(64, 1), n(67, 2), n(48, 2, 1, 'left'), n(72, 3.5)]),
  duration: 4,
};

describe('sortNotes', () => {
  it('trie par temps puis par hauteur', () => {
    const sorted = sortNotes([n(70, 2), n(60, 1), n(50, 2)]);
    expect(sorted.map((x) => [x.time, x.midi])).toEqual([[1, 60], [2, 50], [2, 70]]);
  });
});

describe('notesInWindow', () => {
  it('retourne les notes dans [t0, t1)', () => {
    const got = notesInWindow(song, 1, 3);
    expect(got.map((x) => x.midi)).toEqual([64, 48, 67]);
  });
  it('borne basse incluse, haute exclue', () => {
    expect(notesInWindow(song, 0, 1).map((x) => x.midi)).toEqual([60]);
    expect(notesInWindow(song, 3.5, 10).map((x) => x.midi)).toEqual([72]);
  });
  it('fenêtre vide', () => {
    expect(notesInWindow(song, 10, 20)).toEqual([]);
  });
});

describe('noteName', () => {
  it('noms français par défaut', () => {
    expect(noteName(60)).toBe('Do4');
    expect(noteName(61)).toBe('Do♯4');
    expect(noteName(69)).toBe('La4');
    expect(noteName(21)).toBe('La0');
  });
  it('noms anglais', () => {
    expect(noteName(60, 'en')).toBe('C4');
    expect(noteName(66, 'en')).toBe('F♯4');
  });
});

describe('midiRange', () => {
  it('retourne min et max', () => {
    expect(midiRange(song)).toEqual([48, 72]);
  });
});
