// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { melodyOpening, intervals, matchScore, rankSongs } from '../src/core/identify';
import { parseMusicXml } from '../src/core/musicxml-parser';
import type { SongNote } from '../src/core/song';

function n(midi: number, time: number, hand: 'left' | 'right' = 'right'): SongNote {
  return { midi, time, duration: 0.4, hand, velocity: 0.8 };
}

describe('melodyOpening', () => {
  it('privilégie la main droite et la note la plus aiguë des accords', () => {
    const notes = [n(36, 0, 'left'), n(60, 0), n(64, 0.01), n(65, 1), n(67, 2)];
    expect(melodyOpening(notes, 10)).toEqual([64, 65, 67]);
  });
});

describe('matchScore', () => {
  const odeALaJoie = [64, 64, 65, 67, 67, 65, 64, 62]; // Mi Mi Fa Sol Sol Fa Mi Ré

  it('reconnaît la mélodie exacte', () => {
    expect(matchScore([64, 64, 65, 67, 67], odeALaJoie)).toBeGreaterThan(0.9);
  });

  it('reconnaît la mélodie transposée (autre tonalité/octave)', () => {
    expect(matchScore([76, 76, 77, 79, 79], odeALaJoie)).toBeGreaterThan(0.9); // +12
    expect(matchScore([67, 67, 68, 70, 70], odeALaJoie)).toBeGreaterThan(0.9); // +3
  });

  it('pénalise une mélodie différente', () => {
    const auClair = [60, 60, 60, 62, 64, 62]; // Do Do Do Ré Mi Ré
    expect(matchScore([60, 60, 60, 62, 64], odeALaJoie)).toBeLessThan(
      matchScore([60, 60, 60, 62, 64], auClair),
    );
  });

  it('tolère une fausse note isolée', () => {
    expect(matchScore([64, 64, 66, 67, 67], odeALaJoie)).toBeGreaterThan(0.4);
  });
});

describe('rankSongs', () => {
  it('classe le bon morceau en premier', () => {
    const candidates = [
      { id: 'ode', title: 'Ode', opening: [64, 64, 65, 67, 67, 65, 64, 62] },
      { id: 'clair', title: 'Au clair', opening: [60, 60, 60, 62, 64, 62, 60] },
      { id: 'frere', title: 'Frère J.', opening: [60, 62, 64, 60, 60, 62, 64, 60] },
    ];
    const ranked = rankSongs([60, 60, 60, 62, 64, 62], candidates);
    expect(ranked[0].id).toBe('clair');
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });
});

describe('empreintes de la bibliothèque réelle', () => {
  it("l'index contient une empreinte par morceau, cohérente avec le MusicXML", () => {
    const dir = join(__dirname, '..', 'public', 'library');
    const index = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8')) as Array<{
      id: string;
      file: string;
      opening?: number[];
    }>;
    for (const e of index) {
      expect(e.opening, e.id).toBeDefined();
      expect(e.opening!.length, e.id).toBeGreaterThanOrEqual(3);
    }
    // l'empreinte de l'index correspond à celle extraite du fichier parsé
    const ode = index.find((e) => e.id === 'ode-a-la-joie')!;
    const song = parseMusicXml(readFileSync(join(dir, ode.file), 'utf8'));
    expect(melodyOpening(song.notes, ode.opening!.length)).toEqual(ode.opening);
  });

  it('intervals', () => {
    expect(intervals([60, 64, 62])).toEqual([4, -2]);
  });
});
