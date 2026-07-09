import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import type { Song } from '../core/song';

interface CursorStep {
  time: number; // secondes de référence
}

/** Partition OSMD + curseur synchronisé sur le temps de lecture. */
export class SheetView {
  private osmd: OpenSheetMusicDisplay | null = null;
  private steps: CursorStep[] = [];
  private stepIdx = 0;
  private container: HTMLElement | null = null;
  private lastScroll = 0;

  async load(container: HTMLElement, song: Song): Promise<void> {
    if (!song.musicXml) throw new Error('Pas de partition pour ce morceau');
    this.container = container;
    container.innerHTML = '<div class="muted" style="padding:16px">Rendu de la partition…</div>';
    const host = document.createElement('div');

    this.osmd = new OpenSheetMusicDisplay(host, {
      autoResize: false,
      backend: 'svg',
      drawTitle: false,
      drawSubtitle: false,
      drawComposer: false,
      drawPartNames: false,
      drawingParameters: 'compact',
    });
    await this.osmd.load(song.musicXml);
    this.osmd.Zoom = container.clientWidth < 560 ? 0.62 : 0.85;
    this.osmd.render();
    container.innerHTML = '';
    container.appendChild(host);

    // Table temps -> pas de curseur (le curseur OSMD avance en horodatage musical)
    const cursor = this.osmd.cursor;
    cursor.show();
    cursor.reset();
    this.steps = [];
    const secPerWhole = (60 / song.bpm) * 4;
    let guard = 0;
    while (!cursor.Iterator.EndReached && guard++ < 20000) {
      this.steps.push({ time: cursor.Iterator.currentTimeStamp.RealValue * secPerWhole });
      cursor.next();
    }
    cursor.reset();
    this.stepIdx = 0;
  }

  setCursorTime(refTime: number): void {
    if (!this.osmd || this.steps.length === 0) return;
    let target = this.stepIdx;
    while (target + 1 < this.steps.length && this.steps[target + 1].time <= refTime + 1e-6) target++;
    if (refTime < this.steps[this.stepIdx]?.time - 1e-6) {
      // retour en arrière : reset puis avance
      this.osmd.cursor.reset();
      this.stepIdx = 0;
      target = 0;
      while (target + 1 < this.steps.length && this.steps[target + 1].time <= refTime + 1e-6) target++;
    }
    while (this.stepIdx < target) {
      this.osmd.cursor.next();
      this.stepIdx++;
    }
    this.autoScroll();
  }

  private autoScroll(): void {
    const now = performance.now();
    if (now - this.lastScroll < 300) return;
    this.lastScroll = now;
    const el = this.osmd?.cursor.cursorElement;
    if (el && this.container) {
      const r = el.getBoundingClientRect();
      const c = this.container.getBoundingClientRect();
      if (r.top < c.top + 40 || r.bottom > c.bottom - 60) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }
}
