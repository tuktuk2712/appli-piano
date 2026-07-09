import type { KeyboardView } from '../ui/keyboard';

export interface TouchKeysCallbacks {
  onNoteOn(midi: number): void;
  onNoteOff(midi: number): void;
}

/** Multi-touch + glissando sur le clavier canvas. Retourne une fonction de détachement. */
export function attachTouchKeys(
  canvas: HTMLCanvasElement,
  keyboard: KeyboardView,
  cb: TouchKeysCallbacks,
): () => void {
  const active = new Map<number, number>(); // pointerId -> midi

  const toLocal = (e: PointerEvent): { x: number; y: number } => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: PointerEvent): void => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    const { x, y } = toLocal(e);
    const midi = keyboard.midiAtPoint(x, y);
    if (midi === null) return;
    active.set(e.pointerId, midi);
    cb.onNoteOn(midi);
  };

  const move = (e: PointerEvent): void => {
    const prev = active.get(e.pointerId);
    if (prev === undefined) return;
    const { x, y } = toLocal(e);
    const midi = keyboard.midiAtPoint(x, y);
    if (midi !== null && midi !== prev) {
      cb.onNoteOff(prev);
      active.set(e.pointerId, midi);
      cb.onNoteOn(midi);
    }
  };

  const up = (e: PointerEvent): void => {
    const midi = active.get(e.pointerId);
    if (midi === undefined) return;
    active.delete(e.pointerId);
    cb.onNoteOff(midi);
  };

  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  return () => {
    canvas.removeEventListener('pointerdown', down);
    canvas.removeEventListener('pointermove', move);
    canvas.removeEventListener('pointerup', up);
    canvas.removeEventListener('pointercancel', up);
    for (const midi of active.values()) cb.onNoteOff(midi);
    active.clear();
  };
}
