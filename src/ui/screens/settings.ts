import { progressStore } from '../../core/progress';
import { midiInput } from '../../input/midi-input';
import { getAudioContext, ensureAudioRunning } from '../../audio/context';

export function renderSettings(el: HTMLElement): () => void {
  const s = progressStore.getSettings();
  el.innerHTML = `
    <div class="screen">
      <h1>Réglages</h1>

      <h2>Affichage</h2>
      <div class="card">
        <label style="display:flex;align-items:center;justify-content:space-between">
          Noms des notes
          <select id="st-names" style="background:var(--bg-3);color:var(--text);border:none;border-radius:8px;padding:8px">
            <option value="fr" ${s.noteNames === 'fr' ? 'selected' : ''}>Do Ré Mi (FR)</option>
            <option value="en" ${s.noteNames === 'en' ? 'selected' : ''}>C D E (EN)</option>
            <option value="off" ${s.noteNames === 'off' ? 'selected' : ''}>Masqués</option>
          </select>
        </label>
      </div>

      <h2>Micro & latence</h2>
      <div class="card">
        <p class="muted" style="margin-top:0">Si tes notes sont comptées en retard alors que tu joues juste,
        mesure la latence de ton téléphone (4 bips → tape le rythme).</p>
        <div style="display:flex;align-items:center;gap:12px">
          <button class="btn ghost" id="st-latency">⏱ Mesurer la latence</button>
          <span id="st-latency-val">${s.latencyMs} ms</span>
        </div>
        <p class="muted" style="font-size:0.8rem">La calibration du bruit ambiant se fait à chaque activation du micro 🎤 dans un morceau.</p>
      </div>

      <h2>Connexion MIDI</h2>
      <div class="card">
        <p id="st-midi" class="muted" style="margin:0">Recherche de périphériques…</p>
        <p class="muted" style="font-size:0.8rem;margin-bottom:0">Branche ton Yamaha P-145 avec un câble USB-B → USB-C (prise « TO HOST »)
        pour une précision parfaite. L'app le détecte automatiquement.</p>
      </div>

      <h2>Données</h2>
      <div class="card">
        <button class="btn ghost" id="st-reset" style="color:var(--bad)">🗑 Réinitialiser la progression</button>
      </div>

      <p class="muted" style="font-size:0.78rem">Piano Studio — app personnelle. Sons : FluidR3 (domaine public).
      Morceaux : arrangements maison d'œuvres du domaine public.</p>
    </div>`;

  el.querySelector<HTMLSelectElement>('#st-names')!.addEventListener('change', function () {
    progressStore.saveSettings({ noteNames: this.value as 'fr' | 'en' | 'off' });
  });

  // Mesure de latence : 4 bips à 1 s d'intervalle, l'utilisateur tape en rythme.
  const latBtn = el.querySelector<HTMLButtonElement>('#st-latency')!;
  const latVal = el.querySelector<HTMLElement>('#st-latency-val')!;
  let taps: number[] = [];
  let beeps: number[] = [];
  let measuring = false;

  latBtn.addEventListener('click', async () => {
    if (measuring) return;
    measuring = true;
    taps = [];
    beeps = [];
    latBtn.textContent = '🔊 Écoute… tape à chaque bip';
    await ensureAudioRunning();
    const ctx = getAudioContext();
    for (let i = 0; i < 4; i++) {
      const t = ctx.currentTime + 0.8 + i;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.value = 880;
      g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(g).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
      beeps.push(performance.now() + (t - ctx.currentTime) * 1000);
    }
    setTimeout(() => {
      measuring = false;
      latBtn.textContent = '⏱ Mesurer la latence';
      if (taps.length >= 2) {
        const deltas: number[] = [];
        for (const tap of taps) {
          const nearest = beeps.reduce((a, b) => (Math.abs(b - tap) < Math.abs(a - tap) ? b : a));
          deltas.push(tap - nearest);
        }
        const avg = Math.round(Math.max(0, deltas.reduce((a, b) => a + b, 0) / deltas.length));
        progressStore.saveSettings({ latencyMs: avg });
        latVal.textContent = `${avg} ms`;
      } else {
        latVal.textContent = `${progressStore.getSettings().latencyMs} ms (annulé)`;
      }
    }, 5300);
  });
  const onTap = (): void => {
    if (measuring) taps.push(performance.now());
  };
  window.addEventListener('pointerdown', onTap);

  // État MIDI
  const midiEl = el.querySelector<HTMLElement>('#st-midi')!;
  const showMidi = (names: string[]): void => {
    midiEl.textContent = names.length
      ? `🎹 Connecté : ${names.join(', ')}`
      : 'requestMIDIAccess' in navigator
        ? 'Aucun périphérique MIDI détecté.'
        : 'Web MIDI non supporté par ce navigateur.';
  };
  const offDevices = midiInput.onDevicesChanged(showMidi);
  void midiInput.init().then(() => showMidi(midiInput.deviceNames));

  el.querySelector('#st-reset')!.addEventListener('click', () => {
    if (confirm('Effacer toute la progression (scores, étoiles, leçons) ?')) {
      progressStore.resetProgress();
      progressStore.saveSettings({ lessonsDone: [] });
      const t = document.createElement('div');
      t.className = 'toast';
      t.textContent = 'Progression réinitialisée';
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2000);
    }
  });

  return () => {
    window.removeEventListener('pointerdown', onTap);
    offDevices();
  };
}
