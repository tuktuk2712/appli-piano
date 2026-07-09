// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseMusicXml } from '../src/core/musicxml-parser';

const DIR = join(__dirname, '..', 'public', 'library');

interface Entry {
  id: string;
  title: string;
  composer: string;
  level: number;
  file: string;
}

describe('bibliothèque intégrée', () => {
  const index = JSON.parse(readFileSync(join(DIR, 'index.json'), 'utf8')) as Entry[];

  it("l'index référence des fichiers existants, ids uniques", () => {
    const files = readdirSync(DIR);
    const ids = new Set<string>();
    for (const e of index) {
      expect(files).toContain(e.file);
      expect(ids.has(e.id)).toBe(false);
      ids.add(e.id);
      expect([1, 2, 3]).toContain(e.level);
    }
  });

  it('chaque morceau parse et contient au moins 8 notes sur 2 mains', () => {
    for (const e of index) {
      const xml = readFileSync(join(DIR, e.file), 'utf8');
      const song = parseMusicXml(xml, { id: e.id, title: e.title, level: e.level as 1 | 2 | 3 });
      expect(song.notes.length, e.id).toBeGreaterThanOrEqual(8);
      expect(song.duration, e.id).toBeGreaterThan(5);
      expect(song.bpm, e.id).toBeGreaterThan(0);
      const hands = new Set(song.notes.map((n) => n.hand));
      expect(hands.size, `${e.id} : les deux mains`).toBe(2);
      for (const n of song.notes) {
        expect(n.midi, e.id).toBeGreaterThanOrEqual(21);
        expect(n.midi, e.id).toBeLessThanOrEqual(108);
      }
    }
  });

  it('la bibliothèque couvre les 3 niveaux', () => {
    expect(index.some((e) => e.level === 1)).toBe(true);
    expect(index.some((e) => e.level === 2)).toBe(true);
    expect(index.some((e) => e.level === 3)).toBe(true);
  });
});
