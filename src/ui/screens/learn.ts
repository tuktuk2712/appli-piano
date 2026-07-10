import { getSongById } from '../../data/library';
import { midiRange, notesInWindow, type Song, type SongNote } from '../../core/song';
import { PlaybackScheduler } from '../../core/scheduler';
import { NoteMatcher, type NoteJudgement } from '../../core/matcher';
import { progressStore } from '../../core/progress';
import { sampler } from '../../audio/sampler';
import { micListener } from '../../audio/mic-listener';
import { midiInput } from '../../input/midi-input';
import { KeyboardView } from '../keyboard';
import { attachTouchKeys } from '../../input/touch-keys';
import { FallingNotesView } from '../falling-notes';
import type { SheetView } from '../sheet-view';
import { showResults } from '../results';
import { navigate } from '../router';
import { getAudioContext } from '../../audio/context';

type Hands = 'left' | 'right' | 'both';
const TEMPO_STEPS = [0.5, 0.75, 1, 1.25, 1.5];
const HAND_LABELS: Record<Hands, string> = { both: '🙌 2 mains', right: '👉 Droite', left: '👈 Gauche' };

export function renderLearnScreen(el: HTMLElement, params: URLSearchParams): () => void {
  const id = params.get('id') ?? '';
  let mode: 'fall' | 'sheet' = params.get('mode') === 'sheet' ? 'sheet' : 'fall';
  el.innerHTML = `<div class="screen"><p class="muted">Chargement du morceau…</p></div>`;

  let disposed = false;
  let cleanupSession: (() => void) | null = null;

  getSongById(id)
    .then((song) => {
      if (disposed) return;
      if (!song) {
        el.innerHTML = `<div class="screen"><h1>Introuvable</h1>
          <p class="muted">Ce morceau n'existe pas ou a été supprimé.</p>
          <button class="btn" onclick="location.hash='#/home'">← Bibliothèque</button></div>`;
        return;
      }
      cleanupSession = setupSession(el, song);
    })
    .catch((err) => {
      if (disposed) return;
      el.innerHTML = `<div class="screen"><h1>Erreur</h1><p class="muted">${String(err.message ?? err)}</p>
        <button class="btn" onclick="location.hash='#/home'">← Bibliothèque</button></div>`;
    });

  return () => {
    disposed = true;
    cleanupSession?.();
  };

  function setupSession(host: HTMLElement, song: Song): () => void {
    const settings = progressStore.getSettings();
    host.innerHTML = `
      <div class="learn-wrap">
        <div class="learn-controls">
          <button class="btn ghost" id="ln-back">←</button>
          <button class="btn" id="ln-play">▶</button>
          <button class="btn ghost" id="ln-listen" title="Écouter le morceau en entier">🎧 Écouter</button>
          <button class="btn ghost" id="ln-tempo">⏱ 100%</button>
          <button class="btn ghost active" id="ln-wait">✋ Attente</button>
          <button class="btn ghost" id="ln-hands">🙌 2 mains</button>
          <button class="btn ghost" id="ln-loop">🔁 A-B</button>
          <button class="btn ghost" id="ln-metro">🕰</button>
          <button class="btn ghost" id="ln-mic">🎤</button>
          <button class="btn ghost" id="ln-mode" ${song.musicXml ? '' : 'hidden'}>${mode === 'fall' ? '𝄞' : '▦'}</button>
          <span class="learn-title">${escapeHtml(song.title)}</span>
        </div>
        <input type="range" id="ln-seek" min="0" max="${song.duration}" step="0.1" value="0" />
        <div class="learn-stage">
          <canvas id="ln-fall" ${mode === 'sheet' ? 'hidden' : ''}></canvas>
          <div id="ln-sheet" class="sheet-host" ${mode === 'fall' ? 'hidden' : ''}></div>
          <div id="ln-banner" class="learn-banner" hidden></div>
        </div>
        <canvas id="ln-kbd"></canvas>
      </div>`;

    const style = document.createElement('style');
    style.textContent = `
      .learn-wrap { position: absolute; inset: 0; display: flex; flex-direction: column; }
      .learn-controls { display: flex; align-items: center; gap: 5px; padding: 5px 6px 3px; overflow-x: auto;
        scrollbar-width: none; }
      .learn-controls::-webkit-scrollbar { display: none; }
      .learn-controls .btn { padding: 6px 9px; font-size: 0.78rem; white-space: nowrap; flex-shrink: 0;
        border-radius: 9px; }
      .learn-controls .btn.active { outline: 2px solid var(--accent); }
      .learn-title { flex: 1; min-width: 60px; text-align: right; font-weight: 700; font-size: 0.8rem;
        color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 4px; }
      #ln-play { min-width: 46px; }
      #ln-seek { width: calc(100% - 16px); margin: 0 8px; height: 14px; }
      .learn-stage { flex: 1; position: relative; min-height: 0; }
      #ln-fall { position: absolute; inset: 0; width: 100%; height: 100%; }
      .sheet-host { position: absolute; inset: 0; overflow-y: auto; background: #fbfbf6;
        border-radius: 10px; margin: 0 6px; }
      .learn-banner { position: absolute; top: 8px; left: 50%; transform: translateX(-50%);
        background: var(--bg-3); border: 1px solid #333d4d; padding: 8px 16px; border-radius: 999px;
        z-index: 5; font-size: 0.85rem; white-space: nowrap; }
      #ln-kbd { height: clamp(110px, 22vh, 190px); width: 100%; touch-action: none; flex-shrink: 0; }
      @media (max-height: 520px) {
        #ln-kbd { height: clamp(80px, 26vh, 120px); }
        .learn-title { display: none; }
        .learn-controls .btn { padding: 5px 8px; font-size: 0.74rem; }
      }
    `;
    host.appendChild(style);

    const $ = <T extends HTMLElement>(sel: string): T => host.querySelector<T>(sel)!;
    const stage = $('.learn-stage');
    const banner = $<HTMLElement>('#ln-banner');
    const seekBar = $<HTMLInputElement>('#ln-seek');

    // ----- état de session -----
    let speedIdx = 2;
    let waitMode = true;
    let hands: Hands = 'both';
    let listen = false;
    let metronome = settings.metronome;
    let micOn = false;
    let loopA: number | null = null;
    let loop: [number, number] | null = null;
    let finished = false;
    let raf = 0;
    let lastBeat = -1;
    const judgements = new Map<SongNote, NoteJudgement>();
    const autoOffTimers = new Set<number>();

    const kbd = new KeyboardView($('#ln-kbd'), { noteNames: settings.noteNames });
    const [lo, hi] = midiRange(song);
    {
      // au moins 3 octaves visibles, centrées sur le morceau
      let from = lo - 3;
      let to = hi + 3;
      while (to - from < 36) {
        if (from > 21) from--;
        if (to - from < 36 && to < 108) to++;
      }
      kbd.setRange(from, to);
    }
    const fallView = new FallingNotesView($('#ln-fall'), song, kbd);
    let sheetView: SheetView | null = null;

    const matcher = new NoteMatcher({});
    const scheduler = new PlaybackScheduler({
      song,
      speed: TEMPO_STEPS[speedIdx],
      waitMode,
      hands,
      loop,
      onNotesDue: (notes) => {
        for (const n of notes) {
          const practiced = !listen && (hands === 'both' || n.hand === hands);
          if (practiced) {
            matcher.expect([n], n.time);
          } else {
            autoPlay(n);
          }
        }
      },
      onEnd: () => {
        if (finished) return;
        finished = true;
        setPlaying(false);
        if (!listen) {
          showResults(stage, song.id, matcher.stats, {
            onReplay: () => restart(),
            onExit: () => navigate('home'),
          });
        } else {
          scheduler.seek(0);
        }
      },
    });

    function autoPlay(n: SongNote): void {
      sampler.noteOn(n.midi, n.velocity * 0.75);
      const t = window.setTimeout(
        () => {
          sampler.noteOff(n.midi);
          autoOffTimers.delete(t);
        },
        (n.duration / TEMPO_STEPS[speedIdx]) * 1000,
      );
      autoOffTimers.add(t);
    }

    // ----- entrées joueur -----
    function onPlayerNote(midi: number, source: 'touch' | 'midi' | 'mic'): void {
      if (source === 'touch') {
        void sampler.ensureRunning();
        sampler.noteOn(midi, 0.85);
      }
      if (listen) return;
      const latency = source === 'mic' ? progressStore.getSettings().latencyMs / 1000 : 0;
      const ev = matcher.playerNote(midi, scheduler.time - latency);
      if (ev.note) {
        judgements.set(ev.note, ev.judgement);
        flashKey(midi, '#3ddc84');
      } else {
        flashKey(midi, '#ff5f6b');
      }
      scheduler.satisfy(midi);
    }

    function flashKey(midi: number, color: string): void {
      kbd.setPressed(midi, color);
      window.setTimeout(() => {
        kbd.setPressed(midi, null);
        kbd.draw();
      }, 180);
    }

    const detachTouch = attachTouchKeys($('#ln-kbd'), kbd, {
      onNoteOn: (m) => onPlayerNote(m, 'touch'),
      onNoteOff: (m) => sampler.noteOff(m),
    });
    const offMidi = midiInput.onNote((m, on) => {
      if (on) onPlayerNote(m, 'midi');
    });
    void midiInput.init();
    const offMidiDevices = midiInput.onDevicesChanged((names) => {
      if (names.length) toast(`🎹 MIDI connecté : ${names[0]}`);
    });
    const offMic = micListener.onNote((m) => onPlayerNote(m, 'mic'));

    if (!sampler.isLoaded) void sampler.load();

    // ----- boucle de rendu -----
    const frame = (now: number): void => {
      scheduler.tick(now);
      const t = scheduler.time;

      for (const ev of matcher.sweep(t)) judgements.set(ev.note!, 'miss');

      if (micOn) {
        const pend = matcher.expectedMidis();
        micListener.setExpected(pend);
      }

      if (metronome && scheduler.isPlaying && !scheduler.waiting) {
        const beatS = 60 / song.bpm;
        const beat = Math.floor(t / beatS);
        if (beat !== lastBeat) {
          lastBeat = beat;
          tickMetronome(beat % song.timeSignature[0] === 0);
        }
      }

      // Illumination des touches : notes en train de sonner (bleu droite, vert gauche)
      kbd.clearHighlights();
      for (const n of notesInWindow(song, Math.max(0, t - 12), t + 0.001)) {
        if (n.time <= t && t < n.time + n.duration) {
          kbd.setHighlight(n.midi, n.hand === 'left' ? '#3ddc84' : '#4da3ff');
        }
      }

      if (mode === 'fall') fallView.render(t, judgements, scheduler.waiting);
      else sheetView?.setCursorTime(t);
      kbd.draw();
      seekBar.value = String(t);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // ----- contrôles -----
    const playBtn = $<HTMLButtonElement>('#ln-play');
    function setPlaying(on: boolean): void {
      if (on) {
        void sampler.ensureRunning();
        if (finished) restart();
        else scheduler.start();
      } else {
        scheduler.pause();
      }
      playBtn.textContent = on ? '⏸' : '▶';
    }
    playBtn.addEventListener('click', () => setPlaying(!scheduler.isPlaying));

    function restart(): void {
      finished = false;
      matcher.reset();
      judgements.clear();
      scheduler.seek(0);
      scheduler.start();
      playBtn.textContent = '⏸';
    }

    $('#ln-back').addEventListener('click', () => navigate('home'));

    $('#ln-listen').addEventListener('click', function (this: HTMLElement) {
      listen = !listen;
      this.classList.toggle('active', listen);
      // en écoute, le mode attente est suspendu sinon la lecture se fige sur la première note
      scheduler.setOptions({ waitMode: listen ? false : waitMode });
      restartFrom(scheduler.time);
      if (listen && !scheduler.isPlaying) setPlaying(true);
    });

    $('#ln-tempo').addEventListener('click', function (this: HTMLElement) {
      speedIdx = (speedIdx + 1) % TEMPO_STEPS.length;
      scheduler.setOptions({ speed: TEMPO_STEPS[speedIdx] });
      this.textContent = `⏱ ${Math.round(TEMPO_STEPS[speedIdx] * 100)}%`;
    });

    $('#ln-wait').addEventListener('click', function (this: HTMLElement) {
      waitMode = !waitMode;
      this.classList.toggle('active', waitMode);
      scheduler.setOptions({ waitMode: listen ? false : waitMode });
    });

    $('#ln-hands').addEventListener('click', function (this: HTMLElement) {
      hands = hands === 'both' ? 'right' : hands === 'right' ? 'left' : 'both';
      this.textContent = HAND_LABELS[hands];
      scheduler.setOptions({ hands });
      restartFrom(scheduler.time);
    });

    $('#ln-loop').addEventListener('click', function (this: HTMLElement) {
      if (loop) {
        loop = null;
        loopA = null;
        this.textContent = '🔁 A-B';
        this.classList.remove('active');
        toast('Boucle désactivée');
      } else if (loopA === null) {
        loopA = scheduler.time;
        this.textContent = '🔁 B ?';
        toast('Point A posé — appuie à nouveau pour poser B');
      } else {
        const b = scheduler.time;
        loop = loopA < b ? [loopA, b] : [b, loopA];
        this.textContent = '🔁 ON';
        this.classList.add('active');
        toast('Boucle A-B activée');
      }
      scheduler.setOptions({ loop });
    });

    $('#ln-metro').addEventListener('click', function (this: HTMLElement) {
      metronome = !metronome;
      this.classList.toggle('active', metronome);
      progressStore.saveSettings({ metronome });
    });

    const micBtn = $<HTMLButtonElement>('#ln-mic');
    micBtn.addEventListener('click', () => {
      if (micOn) {
        micListener.stop();
        micOn = false;
        micBtn.classList.remove('active');
        toast('Micro désactivé');
        return;
      }
      banner.hidden = false;
      banner.textContent = '🎤 Calibration… silence 1,5 s (ne joue pas)';
      micListener
        .start()
        .then(() => micListener.calibrate())
        .then(() => {
          micOn = true;
          micBtn.classList.add('active');
          banner.hidden = true;
          toast('🎤 Micro prêt — joue sur ton piano !');
        })
        .catch(() => {
          banner.hidden = true;
          toast('❌ Micro refusé — vérifie les autorisations');
        });
    });

    async function openSheet(): Promise<void> {
      if (sheetView || !song.musicXml) return;
      const { SheetView } = await import('../sheet-view'); // OSMD chargé à la demande (~1 Mo)
      sheetView = new SheetView();
      await sheetView.load($('#ln-sheet'), song);
    }
    $('#ln-mode').addEventListener('click', function (this: HTMLElement) {
      mode = mode === 'fall' ? 'sheet' : 'fall';
      this.textContent = mode === 'fall' ? '𝄞' : '▦';
      $('#ln-fall').hidden = mode === 'sheet';
      $('#ln-sheet').hidden = mode === 'fall';
      if (mode === 'fall') fallView.layout();
      else void openSheet();
    });
    if (mode === 'sheet') void openSheet();

    function restartFrom(t: number): void {
      matcher.reset();
      scheduler.seek(t);
    }

    seekBar.addEventListener('input', () => {
      matcher.reset();
      judgements.clear();
      finished = false;
      scheduler.seek(Number(seekBar.value));
    });

    function tickMetronome(accent: boolean): void {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.value = accent ? 1200 : 800;
      g.gain.setValueAtTime(0.25, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(g).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    }

    function toast(msg: string): void {
      const t = document.createElement('div');
      t.className = 'toast';
      t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2600);
    }

    const onResize = (): void => {
      kbd.layout();
      fallView.layout();
    };
    window.addEventListener('resize', onResize);
    requestAnimationFrame(onResize);

    return () => {
      cancelAnimationFrame(raf);
      detachTouch();
      offMidi();
      offMidiDevices();
      offMic();
      micListener.stop();
      sampler.allOff();
      autoOffTimers.forEach((t) => clearTimeout(t));
      window.removeEventListener('resize', onResize);
    };
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
