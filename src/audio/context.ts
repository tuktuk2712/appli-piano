let ctx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!ctx) ctx = new AudioContext({ latencyHint: 'interactive' });
  return ctx;
}

/** À appeler depuis un geste utilisateur (Chrome exige une interaction). */
export async function ensureAudioRunning(): Promise<void> {
  const c = getAudioContext();
  if (c.state !== 'running') await c.resume();
}

/** Bip utilitaire (métronome, test de latence). atCtxTime absolu, sinon immédiat. */
export function beep(freq: number, atCtxTime?: number, gain = 0.25, durS = 0.07): void {
  const ctx = getAudioContext();
  const when = atCtxTime ?? ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + durS - 0.01);
  osc.connect(g).connect(ctx.destination);
  osc.start(when);
  osc.stop(when + durS);
}
