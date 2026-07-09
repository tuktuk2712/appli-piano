import { KeyboardView } from '../keyboard';
import { attachTouchKeys } from '../../input/touch-keys';
import { sampler } from '../../audio/sampler';
import { progressStore } from '../../core/progress';
import { navigate } from '../router';
import { midiInput } from '../../input/midi-input';

export function renderFreePlay(el: HTMLElement): () => void {
  const settings = progressStore.getSettings();
  el.innerHTML = `
    <div class="free-wrap">
      <div class="free-bar">
        <button class="btn ghost" id="fp-back">← Retour</button>
        <div class="free-bar-mid">
          <button class="btn ghost" id="fp-oct-down">Octave −</button>
          <button class="btn ghost" id="fp-oct-up">Octave +</button>
        </div>
        <span id="fp-status" class="muted"></span>
      </div>
      <canvas id="fp-kbd"></canvas>
    </div>`;

  const style = document.createElement('style');
  style.textContent = `
    .free-wrap { position: absolute; inset: 0; display: flex; flex-direction: column; }
    .free-bar { display: flex; align-items: center; gap: 10px; padding: 10px 12px; }
    .free-bar .btn { padding: 8px 14px; font-size: 0.85rem; }
    .free-bar-mid { display: flex; gap: 8px; flex: 1; justify-content: center; }
    #fp-kbd { flex: 1; width: 100%; touch-action: none; }
  `;
  el.appendChild(style);

  const canvas = el.querySelector<HTMLCanvasElement>('#fp-kbd')!;
  const status = el.querySelector<HTMLElement>('#fp-status')!;
  const kbd = new KeyboardView(canvas, { from: 48, to: 84, noteNames: settings.noteNames });

  const draw = (): void => kbd.draw();

  const noteOn = (midi: number, velocity = 0.85): void => {
    void sampler.ensureRunning();
    sampler.noteOn(midi, velocity);
    kbd.setPressed(midi, midi < 60 ? 'var(--left-key, #3ddc84)' : '#4da3ff');
    draw();
  };
  const noteOff = (midi: number): void => {
    sampler.noteOff(midi);
    kbd.setPressed(midi, null);
    draw();
  };

  const detachTouch = attachTouchKeys(canvas, kbd, { onNoteOn: noteOn, onNoteOff: noteOff });

  if (!sampler.isLoaded) {
    status.textContent = 'Chargement du son…';
    sampler
      .load()
      .then(() => (status.textContent = ''))
      .catch(() => (status.textContent = 'Erreur de chargement du son'));
  }

  const offMidi = midiInput.onNote((midi, on, velocity) => (on ? noteOn(midi, velocity) : noteOff(midi)));
  void midiInput.init();

  const shift = (by: number): void => {
    const [f, t] = kbd.range;
    if (f + by < 21 || t + by > 108) return;
    kbd.setRange(f + by, t + by);
    draw();
  };
  el.querySelector('#fp-oct-down')!.addEventListener('click', () => shift(-12));
  el.querySelector('#fp-oct-up')!.addEventListener('click', () => shift(12));
  el.querySelector('#fp-back')!.addEventListener('click', () => navigate('home'));

  const onResize = (): void => {
    kbd.layout();
    draw();
  };
  window.addEventListener('resize', onResize);
  requestAnimationFrame(onResize);

  return () => {
    detachTouch();
    offMidi();
    sampler.allOff();
    window.removeEventListener('resize', onResize);
  };
}
