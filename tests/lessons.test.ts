import { describe, it, expect } from 'vitest';
import { LESSONS, staffSvg } from '../src/data/lessons';

describe('leçons', () => {
  it('structure valide : ids uniques, pages non vides', () => {
    const ids = new Set<string>();
    for (const l of LESSONS) {
      expect(ids.has(l.id)).toBe(false);
      ids.add(l.id);
      expect(l.pages.length).toBeGreaterThan(0);
    }
  });

  it('les MCQ ont une réponse dans les choix', () => {
    for (const l of LESSONS) {
      for (const page of l.pages) {
        if (!('quiz' in page)) continue;
        for (const q of page.quiz) {
          if (q.kind === 'mcq') {
            expect(q.answer).toBeGreaterThanOrEqual(0);
            expect(q.answer).toBeLessThan(q.choices.length);
          } else {
            expect(q.midi).toBeGreaterThanOrEqual(21);
            expect(q.midi).toBeLessThanOrEqual(108);
          }
        }
      }
    }
  });

  it('staffSvg positionne Mi4 sur la première ligne (clé de sol)', () => {
    const svg = staffSvg('treble', 64);
    expect(svg).toContain(`cy="90"`); // ligne du bas
  });

  it('staffSvg ajoute une ligne supplémentaire pour Do4', () => {
    const svg = staffSvg('treble', 60);
    expect(svg).toContain('cy="104"'); // 2 demi-interlignes sous la ligne du bas
  });
});
