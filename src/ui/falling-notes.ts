import { isBlackKey, lowerBound, measureSeconds, type Song, type SongNote } from '../core/song';
import type { NoteJudgement } from '../core/matcher';
import type { KeyboardView } from './keyboard';
import { HAND_COLORS, BAD_COLOR } from './colors';
import { pathRoundRect, resizeCanvasForDpr } from './dom';

const LOOKAHEAD_S = 4; // fenêtre visible au-dessus de la ligne d'impact
const TRAIL_S = 0.6; // les notes continuent sous la ligne après impact

const COLORS = {
  right: { white: HAND_COLORS.right.main, black: HAND_COLORS.right.dark },
  left: { white: HAND_COLORS.left.main, black: HAND_COLORS.left.dark },
};

/** Rendu Synthesia : rectangles alignés sur les touches, chute vers la ligne d'impact. */
export class FallingNotesView {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private song: Song;
  private keyboard: KeyboardView;
  private cssW = 0;
  private cssH = 0;
  private startIdx = 0; // curseur persistant : première note potentiellement visible
  private lastTime = -Infinity;
  private readonly maxDuration: number;

  constructor(canvas: HTMLCanvasElement, song: Song, keyboard: KeyboardView) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.song = song;
    this.keyboard = keyboard;
    this.maxDuration = song.notes.reduce((m, n) => Math.max(m, n.duration), 0);
    this.layout();
  }

  layout(): void {
    const size = resizeCanvasForDpr(this.canvas, this.ctx);
    this.cssW = size.cssW;
    this.cssH = size.cssH;
  }

  render(refTime: number, judgements: Map<SongNote, NoteJudgement>, waiting: boolean): void {
    const ctx = this.ctx;
    const H = this.cssH;
    ctx.clearRect(0, 0, this.cssW, H);

    const impactY = H - 2;
    const pxPerS = H / LOOKAHEAD_S;

    this.drawMeasureLines(refTime, impactY, pxPerS);

    const t0 = refTime - TRAIL_S - 2; // marge pour les notes encore visibles sous la ligne
    const t1 = refTime + LOOKAHEAD_S;
    const notes = this.song.notes;

    // Curseur persistant : O(notes visibles) par frame au lieu de O(notes écoulées)
    if (refTime < this.lastTime) this.startIdx = lowerBound(notes, t0 - this.maxDuration);
    this.lastTime = refTime;
    while (this.startIdx < notes.length && notes[this.startIdx].time < t0 - this.maxDuration) this.startIdx++;

    for (let i = this.startIdx; i < notes.length; i++) {
      const n = notes[i];
      if (n.time > t1) break;
      if (n.time + n.duration < t0) continue;
      const rect = this.keyboard.keyRect(n.midi);
      if (!rect) continue;

      const yBottom = impactY - (n.time - refTime) * pxPerS;
      const h = Math.max(10, n.duration * pxPerS - 3);
      const yTop = yBottom - h;
      if (yTop > H + 40 || yBottom < -10) continue;

      const isBlack = isBlackKey(n.midi);
      const pal = COLORS[n.hand];
      const judgement = judgements.get(n);
      const past = n.time < refTime - 0.05;

      ctx.globalAlpha = past ? 0.35 : 1;
      let fill: string = isBlack ? pal.black : pal.white;
      if (judgement === 'miss') fill = BAD_COLOR;
      ctx.fillStyle = fill;
      const x = rect.x + 1.5;
      const w = rect.w - 3;
      pathRoundRect(ctx, x, yTop, w, h, 5);
      ctx.fill();
      if (judgement === 'perfect' || judgement === 'good') {
        // note réussie : liseré blanc
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      // liseré durée
      ctx.globalAlpha = past ? 0.15 : 0.4;
      ctx.fillStyle = '#ffffff';
      pathRoundRect(ctx, x + 1.5, yTop + 1.5, w - 3, Math.min(5, h * 0.2), 3);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // ligne d'impact
    ctx.fillStyle = waiting ? '#ffcf5c' : 'rgba(255,255,255,0.35)';
    ctx.fillRect(0, impactY - 1.5, this.cssW, 3);
    if (waiting) {
      ctx.fillStyle = 'rgba(255,207,92,0.12)';
      ctx.fillRect(0, impactY - 26, this.cssW, 26);
    }
  }

  private drawMeasureLines(refTime: number, impactY: number, pxPerS: number): void {
    const ctx = this.ctx;
    const measureS = measureSeconds(this.song); // toujours fini et > 0
    const first = Math.max(0, Math.floor(refTime / measureS));
    for (let i = first; ; i++) {
      const t = i * measureS;
      if (t > refTime + LOOKAHEAD_S) break;
      const y = impactY - (t - refTime) * pxPerS;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.cssW, y);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(String(i + 1), 6, y - 5);
    }
  }
}
