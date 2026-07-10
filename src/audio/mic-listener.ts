import { getAudioContext, ensureAudioRunning } from './context';
import { detectExpected, DEFAULT_DETECT_CFG } from './pitch-utils';

const FFT_SIZE = 8192;
const POLL_MS = 33; // ~30 Hz
const REFRACTORY_MS = 250; // anti-doublon par note

/**
 * Écoute le micro et signale les notes ATTENDUES détectées (fondamentale +
 * harmoniques + attaque). Pas de transcription générale : fiable car ciblé.
 */
export class MicListener {
  private stream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private timer: number | null = null;
  private spectrum = new Float32Array(FFT_SIZE / 2);
  private prevSpectrum = new Float32Array(FFT_SIZE / 2);
  private noiseFloor = new Float32Array(FFT_SIZE / 2).fill(-100);
  private expected: number[] = [];
  private lastFired = new Map<number, number>();
  private cbs = new Set<(midi: number) => void>();
  private session = 0; // incrémenté par stop() : annule tout start() encore en vol
  private starting = false;

  get running(): boolean {
    return this.timer !== null;
  }

  async start(): Promise<void> {
    if (this.running || this.starting) return;
    this.starting = true;
    const mySession = ++this.session;
    try {
      await ensureAudioRunning();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      if (mySession !== this.session) {
        // stop() est passé pendant la demande de permission : libérer tout de suite
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      this.stream = stream;
      const ctx = getAudioContext();
      const src = ctx.createMediaStreamSource(stream);
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = FFT_SIZE;
      this.analyser.smoothingTimeConstant = 0;
      src.connect(this.analyser);
      this.expected = []; // session fraîche : rien d'attendu tant que l'écran n'a rien fourni
      this.lastFired.clear();
      this.timer = window.setInterval(() => this.poll(), POLL_MS);
    } finally {
      this.starting = false;
    }
  }

  stop(): void {
    this.session++;
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.analyser = null;
    this.expected = [];
    this.lastFired.clear();
  }

  setExpected(midis: number[]): void {
    this.expected = midis;
  }

  onNote(cb: (midi: number) => void): () => void {
    this.cbs.add(cb);
    return () => this.cbs.delete(cb);
  }

  /** 1,5 s de mesure du bruit ambiant (à faire dans le silence). */
  async calibrate(): Promise<void> {
    if (!this.analyser) throw new Error('Micro non démarré');
    const frames: Float32Array[] = [];
    const tmp = new Float32Array(FFT_SIZE / 2);
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 100));
      this.analyser.getFloatFrequencyData(tmp);
      frames.push(Float32Array.from(tmp));
    }
    for (let b = 0; b < this.noiseFloor.length; b++) {
      let max = -140;
      for (const f of frames) if (f[b] > max) max = f[b];
      this.noiseFloor[b] = max;
    }
  }

  private poll(): void {
    if (!this.analyser) return;
    [this.prevSpectrum, this.spectrum] = [this.spectrum, this.prevSpectrum];
    this.analyser.getFloatFrequencyData(this.spectrum);
    if (this.expected.length === 0) return;
    const sr = getAudioContext().sampleRate;
    const hits = detectExpected(
      this.spectrum,
      this.prevSpectrum,
      this.expected,
      this.noiseFloor,
      FFT_SIZE,
      sr,
      DEFAULT_DETECT_CFG,
    );
    const now = performance.now();
    for (const midi of hits) {
      const last = this.lastFired.get(midi) ?? -Infinity;
      if (now - last < REFRACTORY_MS) continue;
      this.lastFired.set(midi, now);
      this.cbs.forEach((cb) => cb(midi));
    }
  }
}

export const micListener = /* instance partagée */ new MicListener();
