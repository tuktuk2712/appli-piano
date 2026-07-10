import { loadLibrary } from '../../data/library';
import { listUserSongs } from '../../core/progress';
import { melodyOpening, rankSongs, type IdentifyCandidate } from '../../core/identify';
import { KeyboardView } from '../keyboard';
import { attachTouchKeys } from '../../input/touch-keys';
import { sampler } from '../../audio/sampler';
import { midiInput } from '../../input/midi-input';
import { micListener } from '../../audio/mic-listener';
import { navigate } from '../router';
import { escapeHtml, toast } from '../dom';

const MIN_NOTES = 4;
const MAX_NOTES = 16;

/** « Quel est ce morceau ? » : joue quelques notes, l'app propose les plus proches. */
export function renderIdentify(el: HTMLElement): () => void {
  el.innerHTML = `
    <div class="idy-wrap">
      <div class="idy-top">
        <button class="btn ghost" id="idy-back">←</button>
        <div class="idy-title">🔎 Joue le début d'un morceau…</div>
        <button class="btn ghost" id="idy-mic">🎤</button>
        <button class="btn ghost" id="idy-reset">↺</button>
      </div>
      <div id="idy-played" class="idy-played muted">Joue au moins ${MIN_NOTES} notes (clavier, piano MIDI ou micro)</div>
      <div id="idy-results" class="idy-results"></div>
      <canvas id="idy-kbd"></canvas>
    </div>`;

  const style = document.createElement('style');
  style.textContent = `
    .idy-wrap { position: absolute; inset: 0; display: flex; flex-direction: column; }
    .idy-top { display: flex; align-items: center; gap: 8px; padding: 8px 10px 4px; }
    .idy-top .btn { padding: 7px 12px; font-size: 0.85rem; }
    .idy-top .btn.active { outline: 2px solid var(--accent); }
    .idy-title { flex: 1; font-weight: 700; font-size: 0.95rem; }
    .idy-played { padding: 2px 14px 6px; font-size: 0.85rem; min-height: 1.4em; }
    .idy-results { flex: 1; overflow-y: auto; padding: 0 10px; }
    .idy-score { font-weight: 800; min-width: 52px; text-align: right; }
    #idy-kbd { height: clamp(110px, 24vh, 190px); width: 100%; touch-action: none; flex-shrink: 0; }
  `;
  el.appendChild(style);

  const playedEl = el.querySelector<HTMLElement>('#idy-played')!;
  const resultsEl = el.querySelector<HTMLElement>('#idy-results')!;
  const played: number[] = [];
  let candidates: IdentifyCandidate[] = [];
  let disposed = false;

  // Candidats : bibliothèque (empreintes précalculées) + morceaux importés (calcul local)
  Promise.all([loadLibrary().catch(() => []), listUserSongs().catch(() => [])]).then(([lib, user]) => {
    if (disposed) return;
    candidates = [
      ...lib.filter((e) => e.opening && e.opening.length >= 3).map((e) => ({
        id: e.id,
        title: e.title,
        composer: e.composer,
        opening: e.opening!,
      })),
      ...user.map((s) => ({ id: s.id, title: s.title, composer: 'Importé', opening: melodyOpening(s.notes) })),
    ];
  });

  const kbd = new KeyboardView(el.querySelector('#idy-kbd')!, { from: 48, to: 84, noteNames: 'fr' });
  requestAnimationFrame(() => {
    kbd.layout();
    kbd.draw();
  });

  function refresh(): void {
    playedEl.textContent = played.length
      ? `${played.length} note${played.length > 1 ? 's' : ''} jouée${played.length > 1 ? 's' : ''}`
      : `Joue au moins ${MIN_NOTES} notes (clavier, piano MIDI ou micro)`;
    if (played.length < MIN_NOTES) {
      resultsEl.innerHTML = '';
      return;
    }
    const ranked = rankSongs(played, candidates, 5).filter((r) => r.score > 0.2);
    resultsEl.innerHTML = ranked.length
      ? ranked
          .map(
            (r) => `
        <div class="card song-card" data-id="${escapeHtml(r.id)}">
          <div class="song-info">
            <div class="song-title">${escapeHtml(r.title)}</div>
            <div class="song-sub">${escapeHtml(r.composer ?? '')}</div>
          </div>
          <span class="idy-score" style="color:${r.score > 0.75 ? 'var(--good)' : r.score > 0.45 ? 'var(--gold)' : 'var(--text-dim)'}">${Math.round(r.score * 100)} %</span>
        </div>`,
          )
          .join('')
      : '<p class="muted">Aucun morceau proche pour l\'instant — continue…</p>';
    resultsEl.querySelectorAll<HTMLElement>('.song-card').forEach((c) =>
      c.addEventListener('click', () => navigate('learn', { id: c.dataset.id! })),
    );
  }

  function onNote(midi: number, sound: boolean): void {
    if (sound) {
      void sampler.ensureRunning();
      sampler.noteOn(midi, 0.85);
    }
    played.push(midi);
    if (played.length > MAX_NOTES) played.shift(); // fenêtre glissante
    kbd.setPressed(midi, '#3ddc84');
    kbd.draw();
    setTimeout(() => {
      kbd.setPressed(midi, null);
      kbd.draw();
    }, 200);
    refresh();
  }

  const detachTouch = attachTouchKeys(el.querySelector('#idy-kbd')!, kbd, {
    onNoteOn: (m) => onNote(m, true),
    onNoteOff: (m) => sampler.noteOff(m),
  });
  const offMidi = midiInput.onNote((m, on) => {
    if (on) onNote(m, false);
  });
  void midiInput.init();
  const offMic = micListener.onNote((m) => onNote(m, false));
  if (!sampler.isLoaded) void sampler.load().catch(() => {});

  // Micro : détection large (toutes les notes du registre courant), plus fiable en mélodie simple
  let micOn = false;
  const micBtn = el.querySelector<HTMLButtonElement>('#idy-mic')!;
  micBtn.addEventListener('click', () => {
    if (micOn) {
      micListener.stop();
      micOn = false;
      micBtn.classList.remove('active');
      return;
    }
    toast('🎤 Calibration… 1,5 s de silence');
    micListener
      .start()
      .then(() => (disposed ? undefined : micListener.calibrate()))
      .then(() => {
        if (disposed) {
          micListener.stop();
          return;
        }
        micListener.setExpected(Array.from({ length: 61 }, (_, i) => 36 + i)); // Do2..Do7
        micOn = true;
        micBtn.classList.add('active');
        toast('🎤 Prêt — joue la mélodie note à note');
      })
      .catch(() => !disposed && toast('❌ Micro refusé'));
  });

  el.querySelector('#idy-back')!.addEventListener('click', () => navigate('home'));
  el.querySelector('#idy-reset')!.addEventListener('click', () => {
    played.length = 0;
    refresh();
  });

  const onResize = (): void => {
    kbd.layout();
    kbd.draw();
  };
  window.addEventListener('resize', onResize);

  return () => {
    disposed = true;
    detachTouch();
    offMidi();
    offMic();
    micListener.stop();
    sampler.allOff();
    window.removeEventListener('resize', onResize);
  };
}
