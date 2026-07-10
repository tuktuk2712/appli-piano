import { describe, it, expect, vi } from 'vitest';
import { PlaybackScheduler } from '../src/core/scheduler';
import { sortNotes, type Song, type SongNote } from '../src/core/song';

function n(midi: number, time: number, hand: 'left' | 'right' = 'right'): SongNote {
  return { midi, time, duration: 0.4, hand, velocity: 0.8 };
}

function makeSong(notes: SongNote[]): Song {
  return {
    id: 's', title: 'S', level: 1, bpm: 120, timeSignature: [4, 4],
    notes: sortNotes(notes), duration: Math.max(...notes.map((x) => x.time)) + 1,
  };
}

/** Avance l'horloge par pas de 100 ms (le scheduler plafonne dt à 250 ms). */
function tickTo(s: PlaybackScheduler, fromMs: number, toMs: number): void {
  for (let t = fromMs + 100; t <= toMs; t += 100) s.tick(t);
  if ((toMs - fromMs) % 100 !== 0) s.tick(toMs);
}

describe('PlaybackScheduler', () => {
  it('avance au rythme de speed et émet les notes dues', () => {
    const due = vi.fn();
    const s = new PlaybackScheduler({
      song: makeSong([n(60, 0.5), n(64, 1.0)]),
      speed: 0.5, waitMode: false, hands: 'both',
      onNotesDue: due, onEnd: () => {},
    });
    s.start();
    s.tick(0);
    tickTo(s, 0, 1000); // 1 s réelle à 50 % => 0.5 s de référence
    expect(due).toHaveBeenCalledTimes(1);
    expect(due.mock.calls[0][0][0].midi).toBe(60);
    expect(s.time).toBeCloseTo(0.5, 2);
    tickTo(s, 1000, 2000);
    expect(due).toHaveBeenCalledTimes(2);
  });

  it('waitMode : bloque sur un accord jusqu à satisfaction complète', () => {
    const s = new PlaybackScheduler({
      song: makeSong([n(60, 0.2), n(64, 0.2), n(67, 1.0)]),
      speed: 1, waitMode: true, hands: 'both',
      onNotesDue: () => {}, onEnd: () => {},
    });
    s.start();
    s.tick(0);
    tickTo(s, 0, 500);
    expect(s.waiting).toBe(true);
    expect(s.time).toBeCloseTo(0.2, 2);
    tickTo(s, 500, 1500);
    expect(s.time).toBeCloseTo(0.2, 2); // toujours bloqué
    s.satisfy(60);
    s.tick(1600);
    expect(s.waiting).toBe(true); // accord incomplet
    s.satisfy(64);
    s.tick(1700);
    expect(s.waiting).toBe(false);
    tickTo(s, 1700, 2700);
    expect(s.time).toBeGreaterThan(0.9); // a repris l'avancée
  });

  it('waitMode : filtre par main', () => {
    const s = new PlaybackScheduler({
      song: makeSong([n(60, 0.2, 'left'), n(72, 0.2, 'right')]),
      speed: 1, waitMode: true, hands: 'right',
      onNotesDue: () => {}, onEnd: () => {},
    });
    s.start();
    s.tick(0);
    s.tick(500);
    expect(s.waiting).toBe(true);
    s.satisfy(72); // seule la main droite est exigée
    s.tick(600);
    expect(s.waiting).toBe(false);
  });

  it('boucle A-B', () => {
    const s = new PlaybackScheduler({
      song: makeSong([n(60, 0), n(64, 1), n(67, 2), n(72, 3)]),
      speed: 1, waitMode: false, hands: 'both', loop: [1, 2],
      onNotesDue: () => {}, onEnd: () => {},
    });
    s.start(1);
    s.tick(0);
    tickTo(s, 0, 1500); // dépasse t=2 -> retour à 1
    expect(s.time).toBeGreaterThanOrEqual(1);
    expect(s.time).toBeLessThan(2);
  });

  it('émet onEnd à la fin', () => {
    const end = vi.fn();
    const s = new PlaybackScheduler({
      song: makeSong([n(60, 0.1)]),
      speed: 1, waitMode: false, hands: 'both',
      onNotesDue: () => {}, onEnd: end,
    });
    s.start();
    s.tick(0);
    tickTo(s, 0, 5000);
    expect(end).toHaveBeenCalledOnce();
    tickTo(s, 5000, 6000);
    expect(end).toHaveBeenCalledOnce(); // une seule fois
  });

  it('plafonne dt : un onglet suspendu ne fait pas sauter la lecture', () => {
    const s = new PlaybackScheduler({
      song: makeSong([n(60, 0), n(64, 20)]),
      speed: 1, waitMode: false, hands: 'both',
      onNotesDue: () => {}, onEnd: () => {},
    });
    s.start();
    s.tick(0);
    s.tick(30000); // 30 s d'absence -> avance de 0,25 s max
    expect(s.time).toBeLessThanOrEqual(0.25);
  });

  it('boucle A-B : onSeek notifié à chaque rebouclage', () => {
    const seeks: number[] = [];
    const s = new PlaybackScheduler({
      song: makeSong([n(60, 0), n(64, 1), n(67, 2), n(72, 3)]),
      speed: 1, waitMode: false, hands: 'both', loop: [1, 1.2],
      onNotesDue: () => {}, onEnd: () => {},
      onSeek: (t) => seeks.push(t),
    });
    s.start(1);
    s.tick(0);
    s.tick(250);
    expect(seeks.length).toBeGreaterThanOrEqual(1);
    expect(seeks[0]).toBeGreaterThanOrEqual(1);
    expect(seeks[0]).toBeLessThan(1.2);
  });

  it('une porte satisfaite ne se réarme pas quand on change les options', () => {
    const s = new PlaybackScheduler({
      song: makeSong([n(60, 0.2), n(72, 1.0)]),
      speed: 1, waitMode: true, hands: 'both',
      onNotesDue: () => {}, onEnd: () => {},
    });
    s.start();
    s.tick(0);
    s.tick(500);
    expect(s.waiting).toBe(true);
    s.satisfy(60);
    expect(s.waiting).toBe(false);
    s.setOptions({ hands: 'right' }); // reconstruit les portes
    s.tick(600);
    expect(s.waiting).toBe(false); // la porte de 0.2 ne rebloque pas
    expect(s.time).toBeGreaterThan(0.2);
  });

  it('seek et pause', () => {
    const s = new PlaybackScheduler({
      song: makeSong([n(60, 0), n(64, 5)]),
      speed: 1, waitMode: false, hands: 'both',
      onNotesDue: () => {}, onEnd: () => {},
    });
    s.start();
    s.tick(0);
    tickTo(s, 0, 1000);
    s.pause();
    tickTo(s, 1000, 3000);
    expect(s.time).toBeCloseTo(1, 1);
    s.seek(4);
    expect(s.time).toBe(4);
  });
});
