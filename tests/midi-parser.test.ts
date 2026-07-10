import { describe, it, expect } from 'vitest';
import { Midi } from '@tonejs/midi';
import { parseMidi } from '../src/core/midi-parser';

function buildTwoTrackMidi(): ArrayBuffer {
  const midi = new Midi();
  midi.header.setTempo(100);
  const right = midi.addTrack();
  right.name = 'melodie';
  right.addNote({ midi: 72, time: 0, duration: 0.5, velocity: 0.8 });
  right.addNote({ midi: 76, time: 0.5, duration: 0.5, velocity: 0.8 });
  const left = midi.addTrack();
  left.name = 'basse';
  left.addNote({ midi: 48, time: 0, duration: 1, velocity: 0.7 });
  const arr = midi.toArray();
  return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength) as ArrayBuffer;
}

function buildSingleTrackMidi(): ArrayBuffer {
  const midi = new Midi();
  const t = midi.addTrack();
  t.addNote({ midi: 72, time: 0, duration: 0.5, velocity: 0.8 });
  t.addNote({ midi: 50, time: 0, duration: 0.5, velocity: 0.8 });
  const arr = midi.toArray();
  return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength) as ArrayBuffer;
}

describe('parseMidi', () => {
  it('parse notes, tempo et durée', () => {
    const song = parseMidi(buildTwoTrackMidi(), { id: 'x', title: 'X' });
    expect(song.id).toBe('x');
    expect(song.notes).toHaveLength(3);
    expect(song.bpm).toBeCloseTo(100, 0);
    expect(song.duration).toBeGreaterThanOrEqual(1);
    expect(song.notes[0].time).toBe(0);
  });

  it('assigne la piste la plus grave à la main gauche', () => {
    const song = parseMidi(buildTwoTrackMidi());
    const left = song.notes.filter((n) => n.hand === 'left');
    const right = song.notes.filter((n) => n.hand === 'right');
    expect(left.map((n) => n.midi)).toEqual([48]);
    expect(right.map((n) => n.midi).sort()).toEqual([72, 76]);
  });

  it('split au Do central pour une piste unique', () => {
    const song = parseMidi(buildSingleTrackMidi());
    expect(song.notes.find((n) => n.midi === 50)!.hand).toBe('left');
    expect(song.notes.find((n) => n.midi === 72)!.hand).toBe('right');
  });

  it('rejette un fichier invalide', () => {
    expect(() => parseMidi(new Uint8Array([1, 2, 3]).buffer as ArrayBuffer)).toThrow();
  });

  it('duration = fin de la note qui finit le plus tard (pas la dernière qui commence)', () => {
    const midi = new Midi();
    const t = midi.addTrack();
    t.addNote({ midi: 48, time: 0, duration: 4, velocity: 0.8 }); // tenue longue
    t.addNote({ midi: 72, time: 2, duration: 0.5, velocity: 0.8 });
    const arr = midi.toArray();
    const song = parseMidi(arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength) as ArrayBuffer);
    expect(song.duration).toBeCloseTo(4, 1);
  });

  it('nom de piste vide -> titre par défaut', () => {
    const song = parseMidi(buildSingleTrackMidi());
    expect(song.title).toBe('Morceau importé');
  });
});
