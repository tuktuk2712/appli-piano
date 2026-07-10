import { sortNotes, type Song, type SongNote } from './song';

/**
 * « Lisseur » pour les morceaux importés (MIDI enregistrés, PDF convertis par OMR) :
 * - fusionne les notes identiques quasi simultanées (artefact fréquent de l'OMR)
 * - supprime les chevauchements d'une même hauteur (sinon l'arrêt de l'une coupe l'autre)
 * - aligne les attaques sur la grille rythmique fine (double-croche et triolet)
 * Idempotent : un fichier déjà propre ressort inchangé.
 */
export function smoothSong(song: Song): Song {
  const beat = 60 / (song.bpm > 0 ? song.bpm : 100);
  const grids = [beat / 8, beat / 6]; // triple-croche + triolet de double : préserve les rythmes légitimes

  const snap = (t: number): number => {
    let best = t;
    let bestDelta = Infinity;
    for (const g of grids) {
      const s = Math.round(t / g) * g;
      const d = Math.abs(s - t);
      if (d < bestDelta) {
        bestDelta = d;
        best = s;
      }
    }
    return Math.max(0, best);
  };

  // 1) attaques sur la grille
  let notes: SongNote[] = song.notes.map((n) => {
    const time = snap(n.time);
    const end = Math.max(time + beat / 8, snap(n.time + n.duration));
    return { ...n, time, duration: end - time };
  });
  notes = sortNotes(notes);

  // 2) fusion des doublons (même hauteur, même attaque) : on garde la plus longue
  const dedup: SongNote[] = [];
  for (const n of notes) {
    const prev = dedup[dedup.length - 1];
    if (prev && prev.midi === n.midi && Math.abs(prev.time - n.time) < 0.03) {
      prev.duration = Math.max(prev.duration, n.duration);
      continue;
    }
    dedup.push({ ...n });
  }

  // 3) plus de chevauchement d'une même hauteur : la note s'arrête juste avant sa répétition
  const lastByMidi = new Map<number, SongNote>();
  for (const n of dedup) {
    const prev = lastByMidi.get(n.midi);
    if (prev && prev.time + prev.duration > n.time - 0.015) {
      prev.duration = Math.max(0.05, n.time - 0.015 - prev.time);
    }
    lastByMidi.set(n.midi, n);
  }

  return {
    ...song,
    notes: dedup,
    duration: dedup.reduce((max, n) => Math.max(max, n.time + n.duration), 0),
  };
}
