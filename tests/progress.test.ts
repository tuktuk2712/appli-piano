import { describe, it, expect, beforeEach } from 'vitest';
import { ProgressStore, DEFAULT_SETTINGS } from '../src/core/progress';

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
    clear: () => map.clear(),
    key: (i) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  } as Storage;
}

describe('ProgressStore', () => {
  let store: ProgressStore;
  beforeEach(() => {
    store = new ProgressStore(memoryStorage());
  });

  it('null pour un morceau jamais joué', () => {
    expect(store.getProgress('x')).toBeNull();
  });

  it('enregistre et garde le meilleur score', () => {
    store.recordPlay('ode', 72, 1);
    store.recordPlay('ode', 95, 3);
    store.recordPlay('ode', 60, 1);
    const p = store.getProgress('ode')!;
    expect(p.best).toBe(95);
    expect(p.stars).toBe(3);
    expect(p.plays).toBe(3);
  });

  it('réglages : défauts + patch persistant', () => {
    expect(store.getSettings()).toEqual(DEFAULT_SETTINGS);
    store.saveSettings({ noteNames: 'en', latencyMs: 120 });
    expect(store.getSettings().noteNames).toBe('en');
    expect(store.getSettings().latencyMs).toBe(120);
    expect(store.getSettings().micEnabled).toBe(DEFAULT_SETTINGS.micEnabled);
  });

  it('survit à un JSON corrompu', () => {
    const s = memoryStorage();
    s.setItem('piano.progress', '{oops');
    const st = new ProgressStore(s);
    expect(st.getProgress('a')).toBeNull();
    st.recordPlay('a', 50, 0);
    expect(st.getProgress('a')!.plays).toBe(1);
  });

  it('reset efface la progression', () => {
    store.recordPlay('a', 80, 2);
    store.resetProgress();
    expect(store.getProgress('a')).toBeNull();
  });
});
