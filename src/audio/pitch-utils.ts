/**
 * Détection ciblée : l'app connaît les notes attendues et vérifie la présence
 * (et l'attaque) de leur fondamentale + harmoniques dans le spectre du micro.
 * Spectres en dB tels que fournis par AnalyserNode.getFloatFrequencyData.
 */

export interface DetectConfig {
  onsetDb: number; // montée minimale entre deux trames pour compter une attaque
  marginDb: number; // marge au-dessus du bruit de fond
  harmonics: number; // nombre d'harmoniques considérées (fondamentale incluse)
  octaveGapDb: number; // écart max toléré sous l'octave inférieure (anti faux positif d'octave)
}

export const DEFAULT_DETECT_CFG: DetectConfig = { onsetDb: 8, marginDb: 12, harmonics: 4, octaveGapDb: 4 };

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function binOfFreq(freq: number, fftSize: number, sampleRate: number): number {
  return Math.round(freq / (sampleRate / fftSize));
}

/** dB max sur le bin visé ±1 (tolérance d'accordage/résolution). */
function peakDb(spectrum: Float32Array, bin: number): number {
  let best = -Infinity;
  for (let b = Math.max(0, bin - 1); b <= Math.min(spectrum.length - 1, bin + 1); b++) {
    if (spectrum[b] > best) best = spectrum[b];
  }
  return best;
}

/**
 * Énergie d'une note : moyenne pondérée (1/k) des dB de la fondamentale et de
 * ses harmoniques. Retour en dB (approx.) — comparable entre trames.
 */
export function noteEnergy(
  spectrum: Float32Array,
  midi: number,
  fftSize: number,
  sampleRate: number,
  harmonics = 4,
): number {
  const f0 = midiToFreq(midi);
  let sum = 0;
  let weight = 0;
  for (let k = 1; k <= harmonics; k++) {
    const bin = binOfFreq(f0 * k, fftSize, sampleRate);
    if (bin >= spectrum.length) break;
    const w = 1 / k;
    sum += peakDb(spectrum, bin) * w;
    weight += w;
  }
  return weight > 0 ? sum / weight : -Infinity;
}

/**
 * Notes attendues effectivement détectées sur cette trame :
 * attaque (montée d'énergie vs trame précédente) ET niveau au-dessus du bruit.
 */
export function detectExpected(
  spectrum: Float32Array,
  prev: Float32Array,
  expected: number[],
  noiseFloor: Float32Array,
  fftSize: number,
  sampleRate: number,
  cfg: DetectConfig = DEFAULT_DETECT_CFG,
): number[] {
  const out: number[] = [];
  for (const midi of expected) {
    const now = noteEnergy(spectrum, midi, fftSize, sampleRate, cfg.harmonics);
    const before = noteEnergy(prev, midi, fftSize, sampleRate, cfg.harmonics);
    const floor = noteEnergy(noiseFloor, midi, fftSize, sampleRate, cfg.harmonics);
    if (now - before >= cfg.onsetDb && now >= floor + cfg.marginDb) out.push(midi);
  }
  // Anti faux positif d'octave : les harmoniques de Do3 recouvrent exactement celles de Do4.
  // Si l'octave inférieure est aussi attendue et nettement plus forte, la note haute
  // n'est probablement qu'un reflet — on la rejette.
  return out.filter((midi) => {
    const lower = midi - 12;
    if (!expected.includes(lower)) return true;
    const eHigh = noteEnergy(spectrum, midi, fftSize, sampleRate, cfg.harmonics);
    const eLow = noteEnergy(spectrum, lower, fftSize, sampleRate, cfg.harmonics);
    return eHigh >= eLow - cfg.octaveGapDb;
  });
}
