import { isBlackKey, noteName } from '../core/song';
import { pathRoundRect, resizeCanvasForDpr } from './dom';

export interface KeyboardOpts {
  from?: number;
  to?: number;
  noteNames?: 'fr' | 'en' | 'off';
}

interface KeyLayout {
  midi: number;
  x: number;
  w: number;
  black: boolean;
}

/**
 * Clavier canvas. Le clavier au repos (dégradés, ombres, étiquettes) est pré-rendu
 * une seule fois dans un canvas offscreen ; draw() ne fait que le blitter puis
 * surpeindre les touches colorées — et ne fait rien du tout si rien n'a changé.
 */
export class KeyboardView {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private from: number;
  private to: number;
  noteNames: 'fr' | 'en' | 'off';
  private keys: KeyLayout[] = [];
  private keyByMidi = new Map<number, KeyLayout>();
  private pressed = new Map<number, string>();
  private highlights = new Map<number, string>();
  private cssW = 0;
  private cssH = 0;
  private base: HTMLCanvasElement | null = null;
  private version = 1;
  private drawnVersion = 0;

  constructor(canvas: HTMLCanvasElement, opts: KeyboardOpts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.from = opts.from ?? 48;
    this.to = opts.to ?? 84;
    this.noteNames = opts.noteNames ?? 'fr';
    this.layout();
  }

  get range(): [number, number] {
    return [this.from, this.to];
  }

  setRange(from: number, to: number): void {
    // bornes sur des touches blanches, minimum 2 octaves
    while (isBlackKey(from)) from--;
    while (isBlackKey(to)) to++;
    if (to - from < 24) to = from + 24;
    this.from = Math.max(21, from);
    this.to = Math.min(108, to);
    this.layout();
  }

  layout(): void {
    const size = resizeCanvasForDpr(this.canvas, this.ctx);
    this.cssW = size.cssW;
    this.cssH = size.cssH;

    const whites: number[] = [];
    for (let m = this.from; m <= this.to; m++) if (!isBlackKey(m)) whites.push(m);
    const whiteW = this.cssW / whites.length;
    this.keys = [];
    whites.forEach((m, i) => this.keys.push({ midi: m, x: i * whiteW, w: whiteW, black: false }));
    for (let m = this.from; m <= this.to; m++) {
      if (!isBlackKey(m)) continue;
      const leftWhiteIdx = whites.findIndex((w) => w > m) - 1;
      if (leftWhiteIdx < 0) continue;
      const bw = whiteW * 0.56;
      this.keys.push({ midi: m, x: (leftWhiteIdx + 1) * whiteW - bw / 2, w: bw, black: true });
    }
    this.keyByMidi = new Map(this.keys.map((k) => [k.midi, k]));
    this.renderBase();
    this.version++;
  }

  keyRect(midi: number): { x: number; w: number } | null {
    const k = this.keyByMidi.get(midi);
    return k ? { x: k.x, w: k.w } : null;
  }

  midiAtPoint(x: number, y: number): number | null {
    const blackH = this.cssH * 0.62;
    if (y <= blackH) {
      for (const k of this.keys) {
        if (k.black && x >= k.x && x <= k.x + k.w) return k.midi;
      }
    }
    for (const k of this.keys) {
      if (!k.black && x >= k.x && x <= k.x + k.w) return k.midi;
    }
    return null;
  }

  setPressed(midi: number, color: string | null): void {
    if (color === null ? this.pressed.delete(midi) : this.pressed.get(midi) !== color) {
      if (color !== null) this.pressed.set(midi, color);
      this.version++;
    }
  }

  clearPressed(): void {
    if (this.pressed.size) {
      this.pressed.clear();
      this.version++;
    }
  }

  setHighlight(midi: number, color: string | null): void {
    if (color === null ? this.highlights.delete(midi) : this.highlights.get(midi) !== color) {
      if (color !== null) this.highlights.set(midi, color);
      this.version++;
    }
  }

  clearHighlights(): void {
    if (this.highlights.size) {
      this.highlights.clear();
      this.version++;
    }
  }

  /** Remplace l'ensemble des illuminations ; no-op (pas de redraw) si identique. */
  setHighlights(entries: ReadonlyArray<readonly [number, string]>): void {
    let changed = entries.length !== this.highlights.size;
    if (!changed) {
      for (const [m, c] of entries) {
        if (this.highlights.get(m) !== c) {
          changed = true;
          break;
        }
      }
    }
    if (!changed) return;
    this.highlights.clear();
    for (const [m, c] of entries) this.highlights.set(m, c);
    this.version++;
  }

  /** Pré-rendu du clavier au repos (coûteux : dégradés + ombres), une fois par layout. */
  private renderBase(): void {
    const dpr = window.devicePixelRatio || 1;
    this.base = document.createElement('canvas');
    this.base.width = Math.max(1, Math.round(this.cssW * dpr));
    this.base.height = Math.max(1, Math.round(this.cssH * dpr));
    const b = this.base.getContext('2d')!;
    b.setTransform(dpr, 0, 0, dpr, 0, 0);

    for (const k of this.keys) if (!k.black) this.paintWhiteKey(b, k, null);

    b.save();
    b.shadowColor = 'rgba(0,0,0,0.45)';
    b.shadowBlur = 5;
    b.shadowOffsetY = 2;
    for (const k of this.keys) if (k.black) this.paintBlackKey(b, k, null);
    b.restore();
  }

  private paintWhiteKey(ctx: CanvasRenderingContext2D, k: KeyLayout, color: string | null): void {
    const h = this.cssH;
    if (color) {
      ctx.fillStyle = color;
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#d9dee6');
      g.addColorStop(0.06, '#f7f9fc');
      g.addColorStop(0.85, '#eef1f6');
      g.addColorStop(1, '#e2e6ed');
      ctx.fillStyle = g;
    }
    pathRoundRect(ctx, k.x + 0.75, 0, k.w - 1.5, h - 1, [0, 0, 4, 4]);
    ctx.fill();
    if (color) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      pathRoundRect(ctx, k.x + 0.75, h * 0.82, k.w - 1.5, h * 0.18 - 1, [0, 0, 4, 4]);
      ctx.fill();
    }
    if (this.noteNames !== 'off' && k.midi % 12 === 0) {
      ctx.fillStyle = color ? 'rgba(255,255,255,0.95)' : '#9aa3b5';
      ctx.font = `600 ${Math.min(12, k.w * 0.34)}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(noteName(k.midi, this.noteNames), k.x + k.w / 2, h - 7);
    }
  }

  private paintBlackKey(ctx: CanvasRenderingContext2D, k: KeyLayout, color: string | null): void {
    const blackH = this.cssH * 0.62;
    if (color) {
      ctx.fillStyle = color;
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, blackH);
      g.addColorStop(0, '#31363f');
      g.addColorStop(0.12, '#171b22');
      g.addColorStop(0.9, '#05070b');
      g.addColorStop(1, '#22262e');
      ctx.fillStyle = g;
    }
    pathRoundRect(ctx, k.x, 0, k.w, blackH, [0, 0, 3.5, 3.5]);
    ctx.fill();
    if (!color) {
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      pathRoundRect(ctx, k.x + 1.5, blackH - 7, k.w - 3, 4, 2);
      ctx.fill();
    }
  }

  /** Blit du fond pré-rendu + touches colorées. No-op si rien n'a changé. */
  draw(): void {
    if (this.version === this.drawnVersion || !this.base) return;
    this.drawnVersion = this.version;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.cssW, this.cssH);
    ctx.drawImage(this.base, 0, 0, this.cssW, this.cssH);

    if (this.pressed.size === 0 && this.highlights.size === 0) return;

    const colorOf = (midi: number): string | undefined =>
      this.pressed.get(midi) ?? this.highlights.get(midi);

    // Blanches colorées d'abord…
    const repaintBlacks = new Set<KeyLayout>();
    for (const k of this.keys) {
      if (k.black) continue;
      const c = colorOf(k.midi);
      if (!c) continue;
      this.paintWhiteKey(ctx, k, c);
      // …puis re-dessiner les noires voisines qui les chevauchent
      for (const nb of [this.keyByMidi.get(k.midi - 1), this.keyByMidi.get(k.midi + 1)]) {
        if (nb?.black) repaintBlacks.add(nb);
      }
    }
    for (const k of this.keys) {
      if (!k.black) continue;
      const c = colorOf(k.midi);
      if (c) this.paintBlackKey(ctx, k, c);
      else if (repaintBlacks.has(k)) this.paintBlackKey(ctx, k, null);
    }
  }
}
