import { Midi } from '@tonejs/midi';
import { sortNotes, type Song, type SongNote, type Hand } from './song';

export interface ParseMeta {
  id?: string;
  title?: string;
  level?: 1 | 2 | 3;
}

export function parseMidi(data: ArrayBuffer, meta: ParseMeta = {}): Song {
  const midi = new Midi(data);
  const tracks = midi.tracks.filter((t) => t.notes.length > 0);
  if (tracks.length === 0) throw new Error('Aucune note dans ce fichier MIDI');

  let leftTrackIdx = -1;
  if (tracks.length >= 2) {
    // Piste au registre moyen le plus grave = main gauche
    const avg = tracks.map((t) => t.notes.reduce((s, n) => s + n.midi, 0) / t.notes.length);
    leftTrackIdx = avg.indexOf(Math.min(...avg));
  }

  const notes: SongNote[] = [];
  tracks.forEach((track, i) => {
    for (const n of track.notes) {
      const hand: Hand =
        leftTrackIdx >= 0 ? (i === leftTrackIdx ? 'left' : 'right') : n.midi < 60 ? 'left' : 'right';
      notes.push({
        midi: n.midi,
        time: n.time,
        duration: Math.max(n.duration, 0.05),
        velocity: n.velocity,
        hand,
      });
    }
  });

  const sorted = sortNotes(notes);
  const last = sorted[sorted.length - 1];
  return {
    id: meta.id ?? `midi-${hashString(sorted.map((n) => `${n.midi}@${n.time.toFixed(3)}`).join())}`,
    title: meta.title ?? midi.name ?? 'Morceau importé',
    level: meta.level ?? 2,
    notes: sorted,
    duration: last.time + last.duration,
    bpm: midi.header.tempos[0]?.bpm ?? 120,
    timeSignature: (midi.header.timeSignatures[0]?.timeSignature as [number, number]) ?? [4, 4],
  };
}

function hashString(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}
