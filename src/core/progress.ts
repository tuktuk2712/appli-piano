import type { Song } from './song';

export interface SongProgress {
  best: number;
  stars: number;
  plays: number;
}

export interface Settings {
  micEnabled: boolean;
  latencyMs: number;
  noteNames: 'fr' | 'en' | 'off';
  metronome: boolean;
  micCalibrated: boolean;
  lessonsDone: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  micEnabled: true,
  latencyMs: 0,
  noteNames: 'fr',
  metronome: false,
  micCalibrated: false,
  lessonsDone: [],
};

const PROGRESS_KEY = 'piano.progress';
const SETTINGS_KEY = 'piano.settings';

export class ProgressStore {
  private storage: Storage;

  constructor(storage?: Storage) {
    this.storage = storage ?? globalThis.localStorage;
  }

  private read<T>(key: string, fallback: T): T {
    try {
      const raw = this.storage.getItem(key);
      return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
    } catch {
      return fallback;
    }
  }

  getProgress(songId: string): SongProgress | null {
    const all = this.read<Record<string, SongProgress>>(PROGRESS_KEY, {});
    return all[songId] ?? null;
  }

  recordPlay(songId: string, percent: number, stars: number): void {
    const all = this.read<Record<string, SongProgress>>(PROGRESS_KEY, {});
    const prev = all[songId];
    all[songId] = {
      best: Math.max(prev?.best ?? 0, percent),
      stars: Math.max(prev?.stars ?? 0, stars),
      plays: (prev?.plays ?? 0) + 1,
    };
    this.storage.setItem(PROGRESS_KEY, JSON.stringify(all));
  }

  resetProgress(): void {
    this.storage.removeItem(PROGRESS_KEY);
  }

  getSettings(): Settings {
    return this.read<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  }

  saveSettings(patch: Partial<Settings>): void {
    this.storage.setItem(SETTINGS_KEY, JSON.stringify({ ...this.getSettings(), ...patch }));
  }
}

export const progressStore = /* instance globale de l'app */ new ProgressStore(
  typeof localStorage !== 'undefined' ? localStorage : undefined,
);

// ---------------------------------------------------------------------------
// Morceaux importés par l'utilisateur — IndexedDB (localStorage est trop petit)
// ---------------------------------------------------------------------------

const DB_NAME = 'piano-studio';
const STORE = 'user-songs';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

export function saveUserSong(song: Song): Promise<IDBValidKey> {
  return tx('readwrite', (s) => s.put(song));
}

export function listUserSongs(): Promise<Song[]> {
  return tx<Song[]>('readonly', (s) => s.getAll() as IDBRequest<Song[]>);
}

export function deleteUserSong(id: string): Promise<undefined> {
  return tx('readwrite', (s) => s.delete(id) as IDBRequest<undefined>);
}
