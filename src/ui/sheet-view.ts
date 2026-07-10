import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { measureSeconds, type Song } from '../core/song';

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
  private measureTimes: number[] = []; // index 0 = mesure 1
  private measureClickCb: ((time: number) => void) | null = null;

  async load(container: HTMLElement, song: Song): Promise<void> {
    if (!song.musicXml) throw new Error('Pas de partition pour ce morceau');
    this.container = container;
    container.innerHTML = '';
    const host = document.createElement('div');
    host.style.width = '100%';
    container.appendChild(host); // OSMD a besoin d'un conteneur attaché pour mesurer la largeur

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

    // Temps de début de chaque mesure : d'après les notes, sinon au prorata (tempo constant)
    const measureSec = measureSeconds(song);
    const lastMeasure = Math.max(1, ...song.notes.map((n) => n.measure ?? 0), Math.ceil(song.duration / measureSec));
    this.measureTimes = Array.from({ length: lastMeasure }, (_, i) => i * measureSec);
    for (const n of song.notes) {
      if (n.measure && n.time < this.measureTimes[n.measure - 1]) this.measureTimes[n.measure - 1] = n.time;
    }

    host.addEventListener('click', (e) => this.handleClick(e));
  }

  onMeasureClick(cb: (time: number) => void): void {
    this.measureClickCb = cb;
  }

  /** Tap sur une mesure -> temps de cette mesure (repérage via les boîtes OSMD, en unités * 10 * zoom). */
  private handleClick(e: MouseEvent): void {
    if (!this.osmd || !this.measureClickCb) return;
    const svg = this.container?.querySelector('svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const unit = 10 * this.osmd.Zoom;
    const x = (e.clientX - rect.left) / unit;
    const y = (e.clientY - rect.top) / unit;
    try {
      // MeasureList est indexé [mesure][portée]
      const rows = (this.osmd as unknown as { GraphicSheet: { MeasureList: unknown[][] } }).GraphicSheet.MeasureList;
      let best: { idx: number; dy: number } | null = null;
      rows.forEach((row, idx) => {
        row.forEach((gm) => {
          const g = gm as {
            PositionAndShape?: { AbsolutePosition: { x: number; y: number }; Size: { width: number; height: number } };
          } | null;
          const box = g?.PositionAndShape;
          if (!box) return;
          const inX = x >= box.AbsolutePosition.x && x <= box.AbsolutePosition.x + box.Size.width;
          if (!inX) return;
          const dy = Math.abs(y - (box.AbsolutePosition.y + box.Size.height / 2));
          if (!best || dy < best.dy) best = { idx, dy };
        });
      });
      const hit = best as { idx: number; dy: number } | null;
      if (hit && hit.dy < 12 && this.measureTimes[hit.idx] !== undefined) {
        this.measureClickCb(this.measureTimes[hit.idx]);
      }
    } catch {
      // structure interne OSMD indisponible : le clic-mesure est simplement inactif
    }
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
