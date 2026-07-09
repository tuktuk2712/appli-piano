import { LESSONS, type Lesson, type QuizItem } from '../../data/lessons';
import { progressStore } from '../../core/progress';
import { noteName } from '../../core/song';
import { KeyboardView } from '../keyboard';
import { attachTouchKeys } from '../../input/touch-keys';
import { sampler } from '../../audio/sampler';
import { midiInput } from '../../input/midi-input';

export function renderLessons(el: HTMLElement, params: URLSearchParams): () => void {
  const lessonId = params.get('id');
  const lesson = LESSONS.find((l) => l.id === lessonId);
  return lesson ? renderLesson(el, lesson) : renderLessonList(el);
}

function renderLessonList(el: HTMLElement): () => void {
  const done = new Set(progressStore.getSettings().lessonsDone);
  el.innerHTML = `
    <div class="screen">
      <h1>Leçons</h1>
      <p class="muted">Les bases, pas à pas — avec ton clavier ou ton piano.</p>
      ${LESSONS.map(
        (l) => `
        <div class="card song-card" data-id="${l.id}">
          <span style="font-size:1.6rem">${l.emoji}</span>
          <div class="song-info">
            <div class="song-title">${l.title}</div>
            <div class="song-sub">${l.intro}</div>
          </div>
          <span>${done.has(l.id) ? '✅' : '›'}</span>
        </div>`,
      ).join('')}
    </div>`;
  el.querySelectorAll<HTMLElement>('.song-card').forEach((c) =>
    c.addEventListener('click', () => {
      location.hash = `#/lessons?id=${c.dataset.id}`;
    }),
  );
  return () => {};
}

function renderLesson(el: HTMLElement, lesson: Lesson): () => void {
  let pageIdx = 0;
  let cleanupPage: (() => void) | null = null;

  el.innerHTML = `
    <div class="screen" style="display:flex;flex-direction:column;height:100%">
      <div style="display:flex;align-items:center;gap:10px">
        <button class="btn ghost" id="ls-back">←</button>
        <h1 style="flex:1;font-size:1.15rem;margin:0">${lesson.emoji} ${lesson.title}</h1>
        <span class="muted" id="ls-step"></span>
      </div>
      <div id="ls-page" style="flex:1;min-height:0;overflow-y:auto"></div>
    </div>`;
  const pageHost = el.querySelector<HTMLElement>('#ls-page')!;
  const stepEl = el.querySelector<HTMLElement>('#ls-step')!;
  el.querySelector('#ls-back')!.addEventListener('click', () => {
    location.hash = '#/lessons';
  });

  function showPage(): void {
    cleanupPage?.();
    cleanupPage = null;
    stepEl.textContent = `${pageIdx + 1}/${lesson.pages.length}`;
    const page = lesson.pages[pageIdx];
    if ('html' in page) {
      pageHost.innerHTML = `<div class="card" style="line-height:1.6">${page.html}</div>
        <button class="btn" id="ls-next" style="margin-top:6px">${
          pageIdx + 1 < lesson.pages.length ? 'Continuer →' : 'Terminer ✓'
        }</button>`;
      pageHost.querySelector('#ls-next')!.addEventListener('click', next);
    } else {
      cleanupPage = runQuiz(pageHost, page.quiz, next);
    }
  }

  function next(): void {
    pageIdx++;
    if (pageIdx >= lesson.pages.length) {
      const s = progressStore.getSettings();
      if (!s.lessonsDone.includes(lesson.id)) {
        progressStore.saveSettings({ lessonsDone: [...s.lessonsDone, lesson.id] });
      }
      location.hash = '#/lessons';
      return;
    }
    showPage();
  }

  showPage();
  return () => cleanupPage?.();
}

function runQuiz(host: HTMLElement, items: QuizItem[], onDone: () => void): () => void {
  let idx = 0;
  let cleanupItem: (() => void) | null = null;

  function show(): void {
    cleanupItem?.();
    cleanupItem = null;
    const item = items[idx];
    if (!item) {
      onDone();
      return;
    }
    if (item.kind === 'mcq') showMcq(item);
    else showFindKey(item);
  }

  function feedbackAndNext(ok: boolean, extra = ''): void {
    const f = document.createElement('div');
    f.className = 'toast';
    f.textContent = ok ? '✅ Bravo !' : `❌ ${extra}`;
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1400);
    if (ok) {
      idx++;
      setTimeout(show, 650);
    }
  }

  function showMcq(item: Extract<QuizItem, { kind: 'mcq' }>): void {
    host.innerHTML = `
      <div class="card" style="text-align:center">
        <p style="font-weight:600">${item.prompt}</p>
        ${item.svg ? `<div style="display:flex;justify-content:center">${item.svg}</div>` : ''}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
          ${item.choices.map((c, i) => `<button class="btn ghost" data-i="${i}">${c}</button>`).join('')}
        </div>
      </div>
      <p class="muted" style="text-align:center">Question ${idx + 1}/${items.length}</p>`;
    host.querySelectorAll<HTMLButtonElement>('[data-i]').forEach((b) =>
      b.addEventListener('click', () => {
        const ok = Number(b.dataset.i) === item.answer;
        if (!ok) b.style.outline = '2px solid var(--bad)';
        feedbackAndNext(ok, 'Essaie encore !');
      }),
    );
  }

  function showFindKey(item: Extract<QuizItem, { kind: 'find-key' }>): void {
    host.innerHTML = `
      <div class="card" style="text-align:center"><p style="font-weight:600">${item.prompt}</p></div>
      <canvas id="qz-kbd" style="width:100%;height:150px;touch-action:none"></canvas>
      <p class="muted" style="text-align:center">Question ${idx + 1}/${items.length} — clavier tactile ou piano MIDI</p>`;
    const canvas = host.querySelector<HTMLCanvasElement>('#qz-kbd')!;
    const kbd = new KeyboardView(canvas, { from: 48, to: 84, noteNames: 'off' });
    requestAnimationFrame(() => {
      kbd.layout();
      kbd.draw();
    });

    const answer = (midi: number): void => {
      void sampler.ensureRunning();
      if (!sampler.isLoaded) void sampler.load();
      sampler.noteOn(midi, 0.8);
      setTimeout(() => sampler.noteOff(midi), 350);
      const ok = midi === item.midi || midi % 12 === item.midi % 12; // même note, autre octave = accepté sauf si octave précisée
      const exact = midi === item.midi;
      const wantOctave = /\d/.test(item.prompt);
      const good = wantOctave ? exact : ok;
      kbd.setPressed(midi, good ? '#3ddc84' : '#ff5f6b');
      kbd.draw();
      setTimeout(() => {
        kbd.setPressed(midi, null);
        kbd.draw();
      }, 400);
      feedbackAndNext(good, `C'était ${noteName(midi)} — cherche ${item.prompt.replace('Touche ', '')}`);
    };

    const detach = attachTouchKeys(canvas, kbd, {
      onNoteOn: answer,
      onNoteOff: () => {},
    });
    const offMidi = midiInput.onNote((m, on) => {
      if (on) answer(m);
    });
    void midiInput.init();
    cleanupItem = () => {
      detach();
      offMidi();
    };
  }

  show();
  return () => cleanupItem?.();
}
