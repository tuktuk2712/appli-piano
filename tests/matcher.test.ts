import { describe, it, expect } from 'vitest';
import { NoteMatcher, computeScore } from '../src/core/matcher';
import type { SongNote } from '../src/core/song';

function n(midi: number, time: number): SongNote {
  return { midi, time, duration: 0.5, hand: 'right', velocity: 0.8 };
}

describe('NoteMatcher', () => {
  it('perfect / good selon le timing', () => {
    const m = new NoteMatcher({});
    m.expect([n(60, 1.0)], 1.0);
    const ev = m.playerNote(60, 1.05)!;
    expect(ev.judgement).toBe('perfect'); // 50 ms ≤ 80
    m.expect([n(64, 2.0)], 2.0);
    const ev2 = m.playerNote(64, 2.15)!;
    expect(ev2.judgement).toBe('good'); // 150 ms ≤ 180
  });

  it('mauvaise note = wrong', () => {
    const m = new NoteMatcher({});
    m.expect([n(60, 1.0)], 1.0);
    const ev = m.playerNote(62, 1.02)!;
    expect(ev.judgement).toBe('wrong');
    expect(m.stats.wrong).toBe(1);
  });

  it('accord : chaque note appariée une seule fois', () => {
    const m = new NoteMatcher({});
    m.expect([n(60, 1.0), n(64, 1.0)], 1.0);
    expect(m.playerNote(60, 1.01)!.judgement).toBe('perfect');
    expect(m.playerNote(60, 1.02)!.judgement).toBe('wrong'); // déjà consommée
    expect(m.playerNote(64, 1.03)!.judgement).toBe('perfect');
  });

  it('sweep marque miss les notes expirées', () => {
    const m = new NoteMatcher({ toleranceMs: 180 });
    m.expect([n(60, 1.0)], 1.0);
    expect(m.sweep(1.1)).toEqual([]);
    const missed = m.sweep(1.5);
    expect(missed).toHaveLength(1);
    expect(missed[0].judgement).toBe('miss');
    expect(m.stats.miss).toBe(1);
    // une note jouée après expiration ne matche plus
    expect(m.playerNote(60, 1.6)!.judgement).toBe('wrong');
  });

  it('expectedMidis reflète les notes en attente, dédupliquées', () => {
    const m = new NoteMatcher({});
    m.expect([n(60, 1.0), n(60, 1.0), n(64, 1.0)], 1.0);
    expect(m.expectedMidis().sort()).toEqual([60, 64]);
    m.playerNote(64, 1.0);
    expect(m.expectedMidis()).toEqual([60]);
  });

  it('clearPending purge les attentes mais garde les stats', () => {
    const m = new NoteMatcher({});
    m.expect([n(60, 1.0)], 1.0);
    m.playerNote(60, 1.0);
    m.expect([n(64, 2.0)], 2.0);
    m.clearPending();
    expect(m.expectedMidis()).toEqual([]);
    expect(m.stats.perfect).toBe(1);
    expect(m.sweep(10)).toEqual([]); // rien à expirer
  });

  it('note jouée sans rien d attendu = wrong', () => {
    const m = new NoteMatcher({});
    expect(m.playerNote(60, 0.5)!.judgement).toBe('wrong');
  });
});

describe('computeScore', () => {
  it('pourcentage et étoiles', () => {
    expect(computeScore({ perfect: 10, good: 0, miss: 0, wrong: 0 })).toEqual({ percent: 100, stars: 3 });
    expect(computeScore({ perfect: 0, good: 10, miss: 0, wrong: 0 }).percent).toBe(80);
    expect(computeScore({ perfect: 0, good: 10, miss: 0, wrong: 0 }).stars).toBe(2);
    expect(computeScore({ perfect: 3, good: 0, miss: 7, wrong: 0 }).stars).toBe(0);
    expect(computeScore({ perfect: 0, good: 0, miss: 0, wrong: 0 }).percent).toBe(0);
  });

  it('les fausses notes pénalisent', () => {
    const clean = computeScore({ perfect: 10, good: 0, miss: 0, wrong: 0 });
    const noisy = computeScore({ perfect: 10, good: 0, miss: 0, wrong: 5 });
    expect(noisy.percent).toBeLessThan(clean.percent);
  });
});
