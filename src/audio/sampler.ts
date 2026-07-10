import { getAudioContext, ensureAudioRunning } from './context';

const SAMPLE_MIDIS: number[] = [];
for (let m = 21; m <= 108; m += 3) SAMPLE_MIDIS.push(m);

const RELEASE_S = 0.32;
const MAX_VOICES = 32;

interface Voice {
  midi: number;
  src: AudioBufferSourceNode;
  gain: GainNode;
  startedAt: number;
  released: boolean;
}

/**
 * Piano échantillonné : Salamander Grand (Yamaha C5), un sample tous les 3 demi-tons,
 * pitch-shift pour les notes intermédiaires. Chaîne : voix → filtre de vélocité →
 * master → (réverbération en parallèle) → compresseur → sortie.
 */
export class PianoSampler {
  private buffers = new Map<number, AudioBuffer>();
  private voices: Voice[] = [];
  private master: GainNode | null = null;
  private loaded = false;
  private loading: Promise<void> | null = null;

  get isLoaded(): boolean {
    return this.loaded;
  }

  load(onProgress?: (ratio: number) => void): Promise<void> {
    if (this.loading) return this.loading;
    this.loading = this.doLoad(onProgress).catch((err) => {
      this.loading = null; // échec réseau : le prochain load() retentera au lieu de rester muet
      throw err;
    });
    return this.loading;
  }

  private doLoad(onProgress?: (ratio: number) => void): Promise<void> {
    return (async () => {
      const ctx = getAudioContext();
      this.buildGraph(ctx);
      let done = 0;
      await Promise.all(
        SAMPLE_MIDIS.map(async (midi) => {
          const res = await fetch(`${import.meta.env.BASE_URL}samples/${midi}.mp3`);
          if (!res.ok) throw new Error(`Sample ${midi} introuvable`);
          const buf = await ctx.decodeAudioData(await res.arrayBuffer());
          this.buffers.set(midi, buf);
          onProgress?.(++done / SAMPLE_MIDIS.length);
        }),
      );
      this.loaded = true;
    })();
  }

  /** master → compresseur → sortie, avec départ réverbération en parallèle. */
  private buildGraph(ctx: AudioContext): void {
    if (this.master) return;
    this.master = ctx.createGain();
    this.master.gain.value = 0.85;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; // évite l'écrêtage quand beaucoup de voix sonnent
    comp.knee.value = 24;
    comp.ratio.value = 3;
    comp.attack.value = 0.004;
    comp.release.value = 0.18;

    const reverb = ctx.createConvolver();
    reverb.buffer = makeImpulseResponse(ctx, 1.9, 3.2);
    const wet = ctx.createGain();
    wet.gain.value = 0.16; // réverbération discrète, "salon avec un vrai piano"

    this.master.connect(comp);
    this.master.connect(reverb);
    reverb.connect(wet);
    wet.connect(comp);
    comp.connect(ctx.destination);
  }

  async ensureRunning(): Promise<void> {
    await ensureAudioRunning();
  }

  noteOn(midi: number, velocity = 0.8): void {
    if (!this.loaded || !this.master) return;
    const ctx = getAudioContext();
    const sampleMidi = nearestSample(midi);
    const buffer = this.buffers.get(sampleMidi);
    if (!buffer) return;

    if (this.voices.length >= MAX_VOICES) {
      const oldest = this.voices.shift()!;
      this.releaseVoice(oldest, 0.05);
    }

    const v = Math.min(1, Math.max(0, velocity));
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = Math.pow(2, (midi - sampleMidi) / 12);

    // Jouer doucement assombrit le timbre, comme sur un vrai piano
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600 + Math.pow(v, 1.4) * 11000;
    filter.Q.value = 0.4;

    const gain = ctx.createGain();
    gain.gain.value = 0.12 + 0.88 * Math.pow(v, 1.2);

    src.connect(filter).connect(gain).connect(this.master);
    src.start();
    const voice: Voice = { midi, src, gain, startedAt: ctx.currentTime, released: false };
    src.onended = () => {
      this.voices = this.voices.filter((x) => x !== voice);
    };
    this.voices.push(voice);
  }

  noteOff(midi: number): void {
    for (const v of this.voices) {
      if (v.midi === midi && !v.released) this.releaseVoice(v, RELEASE_S);
    }
  }

  allOff(): void {
    for (const v of this.voices) this.releaseVoice(v, 0.08);
  }

  private releaseVoice(v: Voice, release: number): void {
    if (v.released) return;
    v.released = true;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    v.gain.gain.setValueAtTime(v.gain.gain.value, now);
    v.gain.gain.exponentialRampToValueAtTime(0.001, now + release);
    v.src.stop(now + release + 0.02);
  }
}

function nearestSample(midi: number): number {
  let best = SAMPLE_MIDIS[0];
  for (const s of SAMPLE_MIDIS) {
    if (Math.abs(s - midi) < Math.abs(best - midi)) best = s;
  }
  return best;
}

/** Réponse impulsionnelle synthétique (bruit à décroissance exponentielle) : réverbération sans asset. */
function makeImpulseResponse(ctx: AudioContext, durationS: number, decay: number): AudioBuffer {
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * durationS);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

export const sampler = /* instance partagée de l'app */ new PianoSampler();
