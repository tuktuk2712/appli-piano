export type Hand = 'left' | 'right';

export interface SongNote {
  midi: number; // 21..108
  time: number; // secondes au tempo de référence
  duration: number; // secondes
  hand: Hand;
  velocity: number; // 0..1
  measure?: number; // index de mesure (1-based) si connu
}

export interface Song {
  id: string;
  title: string;
  level: 1 | 2 | 3;
  notes: SongNote[]; // triées par time
  duration: number; // secondes
  bpm: number;
  timeSignature: [number, number];
  musicXml?: string;
}

export function sortNotes(notes: SongNote[]): SongNote[] {
  return [...notes].sort((a, b) => a.time - b.time || a.midi - b.midi);
}

/** Premier index i tel que notes[i].time >= t (recherche binaire, tableau trié). */
export function lowerBound(notes: SongNote[], t: number): number {
  let lo = 0;
  let hi = notes.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (notes[mid].time < t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Notes dont time ∈ [t0, t1), par recherche binaire sur le tableau trié. */
export function notesInWindow(song: Song, t0: number, t1: number): SongNote[] {
  const notes = song.notes;
  const out: SongNote[] = [];
  for (let i = lowerBound(notes, t0); i < notes.length && notes[i].time < t1; i++) out.push(notes[i]);
  return out;
}

/** Durée d'une mesure en secondes — toujours finie et positive, même sur données invalides. */
export function measureSeconds(song: Song): number {
  const beats = song.timeSignature?.[0];
  const bpm = song.bpm;
  if (!Number.isFinite(beats) || beats <= 0 || !Number.isFinite(bpm) || bpm <= 0) {
    return 4 * (60 / 100);
  }
  return (beats * 60) / bpm;
}

const NAMES_FR = ['Do', 'Do♯', 'Ré', 'Ré♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];
const NAMES_EN = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

export function noteName(midi: number, lang: 'fr' | 'en' = 'fr'): string {
  const names = lang === 'fr' ? NAMES_FR : NAMES_EN;
  const octave = Math.floor(midi / 12) - 1;
  return `${names[midi % 12]}${octave}`;
}

export function midiRange(song: Song): [number, number] {
  let min = 108;
  let max = 21;
  for (const n of song.notes) {
    if (n.midi < min) min = n.midi;
    if (n.midi > max) max = n.midi;
  }
  return [min, max];
}

export function isBlackKey(midi: number): boolean {
  return [1, 3, 6, 8, 10].includes(midi % 12);
}
