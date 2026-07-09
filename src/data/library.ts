import { parseMusicXml } from '../core/musicxml-parser';
import { listUserSongs } from '../core/progress';
import type { Song } from '../core/song';

export interface LibraryEntry {
  id: string;
  title: string;
  composer: string;
  level: 1 | 2 | 3;
  file: string;
}

let indexCache: LibraryEntry[] | null = null;
const songCache = new Map<string, Song>();

export async function loadLibrary(): Promise<LibraryEntry[]> {
  if (indexCache) return indexCache;
  const res = await fetch(`${import.meta.env.BASE_URL}library/index.json`);
  if (!res.ok) throw new Error('Bibliothèque introuvable');
  indexCache = (await res.json()) as LibraryEntry[];
  return indexCache;
}

export async function getSongById(id: string): Promise<Song | null> {
  if (songCache.has(id)) return songCache.get(id)!;
  const index = await loadLibrary().catch(() => [] as LibraryEntry[]);
  const entry = index.find((e) => e.id === id);
  if (entry) {
    const res = await fetch(`${import.meta.env.BASE_URL}library/${entry.file}`);
    if (!res.ok) throw new Error(`Morceau ${id} introuvable`);
    const song = parseMusicXml(await res.text(), { id: entry.id, title: entry.title, level: entry.level });
    songCache.set(id, song);
    return song;
  }
  const user = await listUserSongs().catch(() => [] as Song[]);
  return user.find((s) => s.id === id) ?? null;
}
