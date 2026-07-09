type NoteCallback = (midi: number, on: boolean, velocity: number) => void;
type DevicesCallback = (names: string[]) => void;

/** Web MIDI : auto-détection, hot-plug, plusieurs abonnés. */
export class MidiInput {
  private access: MIDIAccess | null = null;
  private noteCbs = new Set<NoteCallback>();
  private deviceCbs = new Set<DevicesCallback>();
  private initPromise: Promise<void> | null = null;

  static supported(): boolean {
    return typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
  }

  init(): Promise<void> {
    if (!MidiInput.supported()) return Promise.resolve();
    if (this.initPromise) return this.initPromise;
    this.initPromise = navigator
      .requestMIDIAccess({ sysex: false })
      .then((access) => {
        this.access = access;
        access.addEventListener('statechange', () => this.bindInputs());
        this.bindInputs();
      })
      .catch(() => {
        this.initPromise = null;
      });
    return this.initPromise;
  }

  get deviceNames(): string[] {
    if (!this.access) return [];
    return [...this.access.inputs.values()].map((i) => i.name ?? 'Périphérique MIDI');
  }

  private bindInputs(): void {
    if (!this.access) return;
    for (const input of this.access.inputs.values()) {
      input.onmidimessage = (e: MIDIMessageEvent) => {
        const data = e.data;
        if (!data || data.length < 3) return;
        const cmd = data[0] & 0xf0;
        const midi = data[1];
        const vel = data[2];
        if (cmd === 0x90 && vel > 0) this.noteCbs.forEach((cb) => cb(midi, true, vel / 127));
        else if (cmd === 0x80 || (cmd === 0x90 && vel === 0))
          this.noteCbs.forEach((cb) => cb(midi, false, 0));
      };
    }
    const names = this.deviceNames;
    this.deviceCbs.forEach((cb) => cb(names));
  }

  onNote(cb: NoteCallback): () => void {
    this.noteCbs.add(cb);
    return () => this.noteCbs.delete(cb);
  }

  onDevicesChanged(cb: DevicesCallback): () => void {
    this.deviceCbs.add(cb);
    return () => this.deviceCbs.delete(cb);
  }
}

export const midiInput = /* instance partagée */ new MidiInput();
