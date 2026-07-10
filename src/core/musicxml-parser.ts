import { unzipSync, strFromU8 } from 'fflate';
import { sortNotes, type Song, type SongNote, type Hand } from './song';
import type { ParseMeta } from './midi-parser';

const STEP_SEMITONES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** Extrait le MusicXML d'une archive .mxl (zip). */
export function unzipMxl(data: ArrayBuffer): string {
  const files = unzipSync(new Uint8Array(data));
  const container = files['META-INF/container.xml'];
  if (container) {
    const doc = new DOMParser().parseFromString(strFromU8(container), 'application/xml');
    const path = doc.querySelector('rootfile')?.getAttribute('full-path');
    if (path && files[path]) return strFromU8(files[path]);
  }
  const name = Object.keys(files).find((f) => !f.startsWith('META-INF') && /\.(xml|musicxml)$/i.test(f));
  if (!name) throw new Error('Archive MXL invalide : aucun fichier MusicXML trouvé');
  return strFromU8(files[name]);
}

interface RawNote {
  midi: number;
  startDiv: number; // en divisions cumulées converties en noires (beats)
  beats: number; // durée en noires
  hand: Hand;
  velocity: number;
  measure: number;
  tieStart: boolean;
  tieStop: boolean;
}

export function parseMusicXml(xml: string, meta: ParseMeta = {}): Song {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('Fichier MusicXML illisible');

  const parts = [...doc.querySelectorAll('score-partwise > part')];
  if (parts.length === 0) throw new Error('Aucune partie trouvée dans le MusicXML');

  let bpm = 0;
  let timeSignature: [number, number] = [4, 4];
  const raw: RawNote[] = [];

  // Moyenne de hauteur par partie pour l'attribution des mains multi-parties
  const partAvg = parts.map((part) => {
    const pitches = [...part.querySelectorAll('note > pitch')].map(pitchToMidi);
    return pitches.length ? pitches.reduce((a, b) => a + b, 0) / pitches.length : 60;
  });
  const leftPartIdx =
    parts.length >= 2 && partAvg.some((a, i) => i > 0 && a !== partAvg[0])
      ? partAvg.indexOf(Math.min(...partAvg))
      : -1;

  parts.forEach((part, partIdx) => {
    let divisions = 1;
    let cursorBeats = 0; // position en noires depuis le début
    let lastStart = 0; // pour <chord/>
    let measureIdx = 0;
    let hasStaves = false;

    for (const measure of part.querySelectorAll(':scope > measure')) {
      measureIdx++;
      const measureStart = cursorBeats;
      let maxBeats = measureStart;

      for (const el of measure.children) {
        switch (el.tagName) {
          case 'attributes': {
            const div = el.querySelector('divisions');
            if (div) divisions = Number(div.textContent) || divisions;
            const beats = Number(el.querySelector('time > beats')?.textContent);
            const beatType = Number(el.querySelector('time > beat-type')?.textContent);
            // les mesures composées ('3+2') donnent NaN : on garde la signature précédente
            if (Number.isFinite(beats) && beats > 0 && Number.isFinite(beatType) && beatType > 0) {
              timeSignature = [beats, beatType];
            }
            if (Number(el.querySelector('staves')?.textContent) >= 2) hasStaves = true;
            break;
          }
          case 'direction':
          case 'sound': {
            const sound = el.tagName === 'sound' ? el : el.querySelector('sound');
            const tempo = sound?.getAttribute('tempo');
            if (tempo && !bpm) bpm = Number(tempo);
            break;
          }
          case 'backup':
            cursorBeats -= Number(el.querySelector('duration')?.textContent ?? 0) / divisions;
            break;
          case 'forward':
            cursorBeats += Number(el.querySelector('duration')?.textContent ?? 0) / divisions;
            break;
          case 'note': {
            const isChord = !!el.querySelector(':scope > chord');
            const isGrace = !!el.querySelector(':scope > grace');
            const durBeats = isGrace ? 0 : Number(el.querySelector(':scope > duration')?.textContent ?? 0) / divisions;
            const start = isChord ? lastStart : cursorBeats;
            if (!isChord && !isGrace) {
              lastStart = cursorBeats;
              cursorBeats += durBeats;
            }
            maxBeats = Math.max(maxBeats, cursorBeats);
            const pitch = el.querySelector(':scope > pitch');
            if (!pitch) break; // silence
            const staff = Number(el.querySelector(':scope > staff')?.textContent ?? 1);
            const hand: Hand =
              leftPartIdx >= 0
                ? partIdx === leftPartIdx
                  ? 'left'
                  : 'right'
                : hasStaves
                  ? staff >= 2
                    ? 'left'
                    : 'right'
                  : pitchToMidi(pitch) < 60
                    ? 'left'
                    : 'right';
            const ties = [...el.querySelectorAll(':scope > tie')].map((t) => t.getAttribute('type'));
            raw.push({
              midi: pitchToMidi(pitch),
              startDiv: start,
              beats: isGrace ? 0.25 : durBeats,
              hand,
              velocity: 0.8,
              measure: measureIdx,
              tieStart: ties.includes('start'),
              tieStop: ties.includes('stop'),
            });
            break;
          }
        }
      }
      cursorBeats = Math.max(cursorBeats, maxBeats);
    }
  });

  if (raw.length === 0) throw new Error('Aucune note trouvée dans le MusicXML');
  if (!bpm) bpm = 100;

  // Fusion des liaisons : une note tie-stop CONTIGUË prolonge la note tie-start correspondante.
  // Clé par hauteur seule (les liaisons cross-staff changent de main) ; un tie-start orphelin
  // n'absorbe pas un tie-stop lointain grâce au test de contiguïté.
  const merged: RawNote[] = [];
  const openTies = new Map<number, RawNote>();
  for (const n of raw.sort((a, b) => a.startDiv - b.startDiv || a.midi - b.midi)) {
    const open = openTies.get(n.midi);
    const contiguous = open && Math.abs(open.startDiv + open.beats - n.startDiv) < 1e-6;
    if (n.tieStop && open && contiguous) {
      open.beats += n.beats;
      if (!n.tieStart) openTies.delete(n.midi);
      continue;
    }
    merged.push(n);
    if (n.tieStart) openTies.set(n.midi, n);
    else if (open && !contiguous) openTies.delete(n.midi); // start orphelin périmé
  }

  const secPerBeat = 60 / bpm;
  const notes: SongNote[] = merged.map((n) => ({
    midi: n.midi,
    time: n.startDiv * secPerBeat,
    duration: Math.max(n.beats * secPerBeat, 0.08),
    hand: n.hand,
    velocity: n.velocity,
    measure: n.measure,
  }));

  const sorted = sortNotes(notes);
  const title =
    meta.title ??
    doc.querySelector('work-title')?.textContent?.trim() ??
    doc.querySelector('movement-title')?.textContent?.trim() ??
    'Morceau importé';

  return {
    id: meta.id ?? `xml-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    title,
    level: meta.level ?? 2,
    notes: sorted,
    duration: sorted.reduce((max, n) => Math.max(max, n.time + n.duration), 0),
    bpm,
    timeSignature,
    musicXml: xml,
  };
}

function pitchToMidi(pitch: Element): number {
  const step = pitch.querySelector('step')?.textContent ?? 'C';
  const alter = Number(pitch.querySelector('alter')?.textContent ?? 0);
  const octave = Number(pitch.querySelector('octave')?.textContent ?? 4);
  return (octave + 1) * 12 + (STEP_SEMITONES[step] ?? 0) + alter;
}
