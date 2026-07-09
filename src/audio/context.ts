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
