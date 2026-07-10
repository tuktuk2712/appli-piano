import { describe, it, expect } from 'vitest';
import { midiToFreq, binOfFreq, noteEnergy, detectExpected, DEFAULT_DETECT_CFG } from '../src/audio/pitch-utils';

const FFT = 8192;
const SR = 48000;
const BINS = FFT / 2;

function silentSpectrum(db = -100): Float32Array {
  return new Float32Array(BINS).fill(db);
}

/** Injecte une note : fondamentale + harmoniques 2..4 décroissantes. */
function addNote(spec: Float32Array, midi: number, db = -30): void {
  const f0 = midiToFreq(midi);
  for (let k = 1; k <= 4; k++) {
    const bin = binOfFreq(f0 * k, FFT, SR);
    if (bin < BINS) spec[bin] = Math.max(spec[bin], db - (k - 1) * 6);
  }
}

describe('midiToFreq / binOfFreq', () => {
  it('fréquences standard', () => {
    expect(midiToFreq(69)).toBeCloseTo(440);
    expect(midiToFreq(60)).toBeCloseTo(261.63, 1);
  });
  it('bin correspondant', () => {
    expect(binOfFreq(440, FFT, SR)).toBe(Math.round(440 / (SR / FFT)));
  });
});

describe('noteEnergy', () => {
  it('énergie plus forte quand la note est présente', () => {
    const empty = silentSpectrum();
    const withNote = silentSpectrum();
    addNote(withNote, 60);
    expect(noteEnergy(withNote, 60, FFT, SR)).toBeGreaterThan(noteEnergy(empty, 60, FFT, SR) + 30);
  });
});

describe('detectExpected', () => {
  const noise = silentSpectrum(-90);

  it('détecte une note attendue à l attaque', () => {
    const prev = silentSpectrum();
    const now = silentSpectrum();
    addNote(now, 64);
    expect(detectExpected(now, prev, [64], noise, FFT, SR, DEFAULT_DETECT_CFG)).toEqual([64]);
  });

  it('pas de re-détection sans nouvelle attaque', () => {
    const prev = silentSpectrum();
    addNote(prev, 64);
    const now = silentSpectrum();
    addNote(now, 64);
    expect(detectExpected(now, prev, [64], noise, FFT, SR, DEFAULT_DETECT_CFG)).toEqual([]);
  });

  it('rejette sous le bruit de fond', () => {
    const loudNoise = silentSpectrum(-25);
    const prev = silentSpectrum();
    const now = silentSpectrum();
    addNote(now, 64, -30);
    expect(detectExpected(now, prev, [64], loudNoise, FFT, SR, DEFAULT_DETECT_CFG)).toEqual([]);
  });

  it("octave : les harmoniques d'une basse jouée ne valident pas l'octave attendue au-dessus", () => {
    const prev = silentSpectrum();
    const now = silentSpectrum();
    addNote(now, 48); // seul Do3 est joué : ses harmoniques 2/4 tombent sur les bins de Do4
    const got = detectExpected(now, prev, [48, 60], noise, FFT, SR, DEFAULT_DETECT_CFG);
    expect(got).toEqual([48]);
  });

  it('octave : les deux notes réellement jouées sont toutes deux validées', () => {
    const prev = silentSpectrum();
    const now = silentSpectrum();
    addNote(now, 48);
    addNote(now, 60);
    const got = detectExpected(now, prev, [48, 60], noise, FFT, SR, DEFAULT_DETECT_CFG);
    expect(got.sort()).toEqual([48, 60]);
  });

  it('accord : détecte les deux notes, ignore les non-attendues', () => {
    const prev = silentSpectrum();
    const now = silentSpectrum();
    addNote(now, 60);
    addNote(now, 64);
    addNote(now, 79); // non attendue
    const got = detectExpected(now, prev, [60, 64], noise, FFT, SR, DEFAULT_DETECT_CFG);
    expect(got.sort()).toEqual([60, 64]);
  });
});
