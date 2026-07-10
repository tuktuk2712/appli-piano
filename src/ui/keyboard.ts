import { isBlackKey, noteName } from '../core/song';

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

/** Clavier canvas : blanches puis noires, pressage coloré, hit-test tactile. */
export class KeyboardView {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private from: number;
  private to: number;
  noteNames: 'fr' | 'en' | 'off';
  private keys: KeyLayout[] = [];
  private pressed = new Map<number, string>();
  private highlights = new Map<number, string>(); // notes en cours (illumination), sous les pressed
  private cssW = 0;
  private cssH = 0;

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
    const dpr = window.devicePixelRatio || 1;
    this.cssW = this.canvas.clientWidth;
    this.cssH = this.canvas.clientHeight;
    this.canvas.width = Math.round(this.cssW * dpr);
    this.canvas.height = Math.round(this.cssH * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

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
  }

  keyRect(midi: number): { x: number; w: number } | null {
    const k = this.keys.find((k) => k.midi === midi);
    return k ? { x: k.x, w: k.w } : null;
  }

  midiAtPoint(x: number, y: number): number | null {
    const blackH = this.cssH * 0.62;
    // Les noires sont au-dessus : tester d'abord
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
    if (color) this.pressed.set(midi, color);
    else this.pressed.delete(midi);
  }

  clearPressed(): void {
    this.pressed.clear();
  }

  setHighlight(midi: number, color: string | null): void {
    if (color) this.highlights.set(midi, color);
    else this.highlights.delete(midi);
  }

  clearHighlights(): void {
    this.highlights.clear();
  }

  draw(): void {
    const ctx = this.ctx;
    const h = this.cssH;
    ctx.clearRect(0, 0, this.cssW, h);

    // Blanches : léger dégradé ivoire, fine séparation, ombre portée sous le haut du clavier
    const whiteGrad = ctx.createLinearGradient(0, 0, 0, h);
    whiteGrad.addColorStop(0, '#d9dee6');
    whiteGrad.addColorStop(0.06, '#f7f9fc');
    whiteGrad.addColorStop(0.85, '#eef1f6');
    whiteGrad.addColorStop(1, '#e2e6ed');
    for (const k of this.keys) {
      if (k.black) continue;
      const color = this.pressed.get(k.midi) ?? this.highlights.get(k.midi);
      ctx.fillStyle = color ?? whiteGrad;
      roundRect(ctx, k.x + 0.75, 0, k.w - 1.5, h - 1, [0, 0, 4, 4]);
      ctx.fill();
      if (color) {
        // touche enfoncée : léger assombrissement en bas pour un effet pressé
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        roundRect(ctx, k.x + 0.75, h * 0.82, k.w - 1.5, h * 0.18 - 1, [0, 0, 4, 4]);
        ctx.fill();
      }
      if (this.noteNames !== 'off' && k.midi % 12 === 0) {
        ctx.fillStyle = color ? 'rgba(255,255,255,0.95)' : '#9aa3b5';
        ctx.font = `600 ${Math.min(12, k.w * 0.34)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillText(noteName(k.midi, this.noteNames), k.x + k.w / 2, h - 7);
      }
    }

    // Noires : plus fines, dégradé profond, ombre portée
    const blackH = h * 0.62;
    const blackGrad = ctx.createLinearGradient(0, 0, 0, blackH);
    blackGrad.addColorStop(0, '#31363f');
    blackGrad.addColorStop(0.12, '#171b22');
    blackGrad.addColorStop(0.9, '#05070b');
    blackGrad.addColorStop(1, '#22262e');
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;
    for (const k of this.keys) {
      if (!k.black) continue;
      const color = this.pressed.get(k.midi) ?? this.highlights.get(k.midi);
      ctx.fillStyle = color ?? blackGrad;
      roundRect(ctx, k.x, 0, k.w, blackH, [0, 0, 3.5, 3.5]);
      ctx.fill();
      if (!color) {
        // reflet discret sur le chant de la touche
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        roundRect(ctx, k.x + 1.5, blackH - 7, k.w - 3, 4, 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | number[],
): void {
  ctx.beginPath();
  if ('roundRect' in ctx) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    (ctx as CanvasRenderingContext2D).rect(x, y, w, h);
  }
}
