import { isBlackKey, type Song, type SongNote } from '../core/song';
import type { NoteJudgement } from '../core/matcher';
import type { KeyboardView } from './keyboard';

const LOOKAHEAD_S = 4; // fenêtre visible au-dessus de la ligne d'impact
const TRAIL_S = 0.6; // les notes continuent sous la ligne après impact

import { HAND_COLORS, BAD_COLOR } from './colors';

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

  constructor(canvas: HTMLCanvasElement, song: Song, keyboard: KeyboardView) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.song = song;
    this.keyboard = keyboard;
    this.layout();
  }

  layout(): void {
    const dpr = window.devicePixelRatio || 1;
    this.cssW = this.canvas.clientWidth;
    this.cssH = this.canvas.clientHeight;
    this.canvas.width = Math.round(this.cssW * dpr);
    this.canvas.height = Math.round(this.cssH * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  render(refTime: number, judgements: Map<SongNote, NoteJudgement>, waiting: boolean): void {
    const ctx = this.ctx;
    const H = this.cssH;
    ctx.clearRect(0, 0, this.cssW, H);

    const impactY = H - 2;
    const pxPerS = H / LOOKAHEAD_S;

    this.drawMeasureLines(refTime, impactY, pxPerS);

    const t0 = refTime - TRAIL_S - 2; // marge pour les notes longues encore visibles
    const t1 = refTime + LOOKAHEAD_S;
    for (const n of this.song.notes) {
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
      ctx.beginPath();
      ctx.roundRect(x, yTop, w, h, 5);
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
      ctx.beginPath();
      ctx.roundRect(x + 1.5, yTop + 1.5, w - 3, Math.min(5, h * 0.2), 3);
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
    const beatsPerMeasure = this.song.timeSignature[0];
    const measureS = (beatsPerMeasure * 60) / this.song.bpm;
    if (measureS <= 0) return;
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
