// Niveau 3 — intermédiaire. Arrangements simplifiés, domaine public.
export default [
  {
    id: 'gymnopedie-1',
    title: 'Gymnopédie n°1 (extrait)',
    composer: 'E. Satie',
    level: 3,
    bpm: 66,
    time: [3, 4],
    right: `r:h. | r:h. |
            Gb5:q A5:q G5:q | Gb5:q Db5:q B4:q | Db5:q D5:q A4:q | Gb4:h. | Gb4:h. |
            Gb5:q A5:q G5:q | Gb5:q Db5:q B4:q | Db5:q D5:q A4:q | Db5:h. | D5:h. | A4:h.`,
    left: `G2:q [B3 D4 Gb4]:h | D2:q [A3 C4 Gb4]:h |
           G2:q [B3 D4 Gb4]:h | D2:q [A3 C4 Gb4]:h | G2:q [B3 D4 Gb4]:h | D2:q [A3 C4 Gb4]:h | G2:q [B3 D4 Gb4]:h |
           D2:q [A3 C4 Gb4]:h | G2:q [B3 D4 Gb4]:h | D2:q [A3 C4 Gb4]:h | D2:q [A3 D4 Gb4]:h | D2:q [A3 D4 Gb4]:h | [D2 A2]:h. `,
  },
  {
    id: 'prelude-do-majeur',
    title: 'Prélude en Do (extrait)',
    composer: 'J.S. Bach',
    level: 3,
    bpm: 66,
    time: [4, 4],
    right: `G4:e C5:e E5:e C5:e G4:e C5:e E5:e C5:e |
            A4:e D5:e F5:e D5:e A4:e D5:e F5:e D5:e |
            G4:e D5:e F5:e D5:e G4:e D5:e F5:e D5:e |
            G4:e C5:e E5:e C5:e G4:e C5:e E5:e C5:e |
            A4:e C5:e E5:e C5:e A4:e C5:e E5:e C5:e |
            F#4:e A4:e D5:e A4:e F#4:e A4:e D5:e A4:e |
            G4:e B4:e D5:e B4:e G4:e B4:e D5:e B4:e |
            G4:e C5:e E5:e C5:e G4:e C5:e E5:e C5:e |
            [E4 G4 C5]:w`,
    left: `[C3 E3]:w | [C3 D3]:w | [B2 D3]:w | [C3 E3]:w |
           [C3 E3]:w | [C3 D3]:w | [B2 D3]:w | [C3 E3]:w |
           [C2 G2 C3]:w`,
  },
  {
    id: 'clair-de-lune-debut',
    title: 'Clair de lune (extrait)',
    composer: 'C. Debussy',
    level: 3,
    bpm: 60,
    time: [3, 4],
    right: `r:q [E4 G4]:h | [D4 F4]:q. [C4 E4]:e [C4 E4]:q | [B3 D4]:h [C4 E4]:q | [C4 E4]:h. |
            r:q [C4 E4]:h | [B3 D4]:q. [A3 C4]:e [A3 C4]:q | [G3 B3]:h [A3 C4]:q | [A3 C4]:h. |
            [D4 F4]:h [B3 D4]:q | [C4 E4]:h.`,
    left: `[C3 G3]:h. | [C3 G3]:h. | [G2 D3]:h. | [C3 G3]:h. |
           [A2 E3]:h. | [F2 C3]:h. | [E2 B2]:h. | [A2 E3]:h. |
           [G2 D3]:h. | [C2 G2 C3]:h.`,
  },
  {
    id: 'prelude-chopin-4',
    title: 'Prélude op.28 n°4 (simplifié)',
    composer: 'F. Chopin',
    level: 3,
    bpm: 56,
    time: [4, 4],
    right: `B4:h B4:h | B4:h. C5:q | Bb4:h Bb4:h | A4:h. A4:q |
            A4:h G4:h | G4:h F#4:h | F#4:h. F#4:q | E4:w`,
    left: `[G3 B3 E4]:q [G3 B3 E4]:q [G3 B3 E4]:q [G3 B3 E4]:q |
           [G3 B3 E4]:q [G3 B3 E4]:q [G3 B3 E4]:q [G3 B3 E4]:q |
           [F#3 A#3 E4]:q [F#3 A#3 E4]:q [F#3 A#3 E4]:q [F#3 A#3 E4]:q |
           [F#3 B3 D#4]:q [F#3 B3 D#4]:q [F#3 B3 D#4]:q [F#3 B3 D#4]:q |
           [E3 A3 C4]:q [E3 A3 C4]:q [E3 A3 C4]:q [E3 A3 C4]:q |
           [E3 G3 C4]:q [E3 G3 C4]:q [D#3 F#3 B3]:q [D#3 F#3 B3]:q |
           [D#3 F#3 B3]:q [D#3 F#3 B3]:q [D#3 F#3 B3]:q [D#3 F#3 B3]:q |
           [E2 B2 G3]:w`,
  },
  {
    id: 'nocturne-chopin-9-2',
    title: 'Nocturne op.9 n°2 (thème)',
    composer: 'F. Chopin',
    level: 3,
    bpm: 66,
    time: [4, 4],
    right: `r:h. E4:q |
            G4:q. A4:e G4:q F4:q | E4:q G4:q D5:h | C5:q. B4:e C5:q A4:q | G4:h. E4:q |
            G4:q. A4:e G4:q F4:q | E4:q G4:q D5:q E5:q | D5:q C5:q A4:q B4:q | C5:w`,
    left: `r:w |
           C3:q [E3 G3]:q [E3 G3]:q [E3 G3]:q |
           C3:q [E3 G3]:q G2:q [F3 B3]:q |
           C3:q [E3 G3]:q F2:q [A3 C4]:q |
           C3:q [E3 G3]:q [E3 G3]:q [E3 G3]:q |
           C3:q [E3 G3]:q [E3 G3]:q [E3 G3]:q |
           C3:q [E3 G3]:q A2:q [E3 A3]:q |
           G2:q [D3 F3]:q [D3 F3]:q [D3 G3]:q |
           C3:q [E3 G3]:q [E3 G3]:q [E3 G3]:q`,
  },
  {
    id: 'pathetique-2e-mvt',
    title: 'Sonate Pathétique, 2e mvt (thème)',
    composer: 'L. van Beethoven',
    level: 3,
    bpm: 60,
    time: [4, 4],
    right: `E4:q. D4:e E4:q F4:q | G4:h. G4:q | C5:q B4:q A4:q G4:q | F4:h E4:q F4:q |
            G4:h. E4:q | F4:q E4:q D4:q F4:q | E4:h D4:h | C4:w`,
    left: `C3:e E3:e G3:e E3:e C3:e E3:e G3:e E3:e |
           C3:e E3:e G3:e E3:e C3:e E3:e G3:e E3:e |
           C3:e E3:e G3:e E3:e A2:e C3:e E3:e C3:e |
           F2:e A2:e C3:e A2:e F2:e A2:e C3:e A2:e |
           C3:e E3:e G3:e E3:e C3:e E3:e G3:e E3:e |
           D3:e F3:e A3:e F3:e D3:e F3:e A3:e F3:e |
           C3:e E3:e G3:e E3:e G2:e D3:e F3:e D3:e |
           C3:e E3:e G3:e E3:e [C3 G3]:h`,
  },
  {
    id: 'danse-hongroise-5',
    title: 'Danse hongroise n°5 (thème)',
    composer: 'J. Brahms',
    level: 3,
    bpm: 108,
    time: [4, 4],
    right: `D5:q. D5:e D5:q C5:e Bb4:e | A4:q. A4:e A4:h | A4:q. Bb4:e C5:q Bb4:e A4:e | G4:q. G4:e G4:h |
            G4:q Gb4:q G4:q A4:q | Bb4:q A4:q G4:q Bb4:q | A4:q. G4:e Gb4:q A4:q | G4:w`,
    left: `[G2 D3]:q [Bb3 D4]:q [G2 D3]:q [Bb3 D4]:q |
           [D3 A3]:q [Gb3 A3]:q [D3 A3]:q [Gb3 A3]:q |
           [D3 A3]:q [Gb3 C4]:q [D3 A3]:q [Gb3 C4]:q |
           [G2 D3]:q [Bb3 D4]:q [G2 D3]:q [Bb3 D4]:q |
           [G2 D3]:q [Bb3 D4]:q [G2 D3]:q [Bb3 D4]:q |
           [G2 D3]:q [Bb3 D4]:q [G2 D3]:q [Bb3 D4]:q |
           [D3 A3]:q [Gb3 C4]:q [D3 A3]:q [Gb3 C4]:q |
           [G2 D3]:q [Bb3 D4]:q [G2 D3 G3]:h`,
  },
  {
    id: 'ode-joie-variations',
    title: 'Ode à la joie (avec accords)',
    composer: 'L. van Beethoven',
    level: 3,
    bpm: 96,
    time: [4, 4],
    right: `[C4 E4]:q [C4 E4]:q [D4 F4]:q [E4 G4]:q | [E4 G4]:q [D4 F4]:q [C4 E4]:q [B3 D4]:q |
            [A3 C4]:q [A3 C4]:q [B3 D4]:q [C4 E4]:q | [C4 E4]:q. [B3 D4]:e [B3 D4]:h |
            [C4 E4]:q [C4 E4]:q [D4 F4]:q [E4 G4]:q | [E4 G4]:q [D4 F4]:q [C4 E4]:q [B3 D4]:q |
            [A3 C4]:q [A3 C4]:q [B3 D4]:q [C4 E4]:q | [B3 D4]:q. [A3 C4]:e [A3 C4]:h |
            [B3 D4]:q [B3 D4]:q [C4 E4]:q [A3 C4]:q | [B3 D4]:q [C4 E4]:e [D4 F4]:e [C4 E4]:q [A3 C4]:q |
            [B3 D4]:q [C4 E4]:e [D4 F4]:e [C4 E4]:q [B3 D4]:q | [A3 C4]:q [B3 D4]:q [G3 B3]:h |
            [C4 E4]:q [C4 E4]:q [D4 F4]:q [E4 G4]:q | [E4 G4]:q [D4 F4]:q [C4 E4]:q [B3 D4]:q |
            [A3 C4]:q [A3 C4]:q [B3 D4]:q [C4 E4]:q | [B3 D4]:q. [A3 C4]:e [A3 C4]:h`,
    left: `C3:q E3:q G3:q E3:q | C3:q B2:q A2:q G2:q |
           A2:q F2:q G2:q C3:q | C3:q G2:q [G2 D3]:h |
           C3:q E3:q G3:q E3:q | C3:q B2:q A2:q G2:q |
           A2:q F2:q G2:q C3:q | G2:q B2:q C3:h |
           G2:q B2:q C3:q A2:q | G2:q D3:q C3:q E3:q |
           G2:q B2:q C3:q G2:q | A2:q B2:q [G2 D3]:h |
           C3:q E3:q G3:q E3:q | C3:q B2:q A2:q G2:q |
           A2:q F2:q G2:q C3:q | G2:q B2:q [C2 G2 C3]:h`,
  },
  {
    id: 'sonate-clair-de-lune',
    title: 'Sonate au clair de lune, 1er mvt (extrait)',
    composer: 'L. van Beethoven',
    level: 3,
    bpm: 54,
    time: [4, 4],
    right: `A3:e C4:e E4:e C4:e A3:e C4:e E4:e C4:e |
            A3:e C4:e E4:e C4:e A3:e C4:e E4:e C4:e |
            A3:e C4:e E4:e C4:e A3:e C4:e E4:e C4:e |
            A3:e C4:e F4:e C4:e A3:e C4:e F4:e C4:e |
            G#3:e B3:e E4:e B3:e G#3:e B3:e E4:e B3:e |
            G#3:e B3:e E4:e B3:e G#3:e B3:e E4:e B3:e |
            E5:q. E5:e E5:h | E5:q. E5:e E5:h | E5:q. E5:e F5:h |
            E5:q. E5:e E5:h | C5:h B4:h | A4:w`,
    left: `[A2 A3]:w | [A2 A3]:w | [G2 G3]:w | [F2 F3]:w | [E2 E3]:w | [E2 E3]:w |
           A2:e E3:e A3:e C4:e E4:e C4:e A3:e E3:e |
           A2:e E3:e A3:e C4:e E4:e C4:e A3:e E3:e |
           F2:e C3:e F3:e A3:e C4:e A3:e F3:e C3:e |
           E2:e B2:e E3:e G#3:e B3:e G#3:e E3:e B2:e |
           E2:e B2:e E3:e G#3:e B3:e G#3:e E3:e B2:e |
           [A2 E3 A3]:w`,
  },
  {
    id: 'marche-turque',
    title: 'Marche turque (thème)',
    composer: 'W.A. Mozart',
    level: 3,
    bpm: 116,
    time: [4, 4],
    right: `B4:e A4:e G#4:e A4:e C5:q r:q | D5:e C5:e B4:e C5:e E5:q r:q |
            F5:e E5:e D#5:e E5:e B5:e A5:e G#5:e A5:e | B5:e A5:e G#5:e A5:e C6:q r:q |
            B4:e A4:e G#4:e A4:e C5:q r:q | D5:e C5:e B4:e C5:e E5:q r:q |
            F5:e E5:e D#5:e E5:e B5:e A5:e G#5:e A5:e | C6:e B5:e A5:e G#5:e A5:q r:q |
            B4:e A4:e G#4:e A4:e C5:q r:q | D5:e C5:e B4:e C5:e E5:q r:q |
            F5:e E5:e D#5:e E5:e B5:e A5:e G#5:e A5:e | C6:e B5:e A5:e G#5:e [A4 C5 E5]:h`,
    left: `A2:q [E3 A3 C4]:q A2:q [E3 A3 C4]:q | A2:q [E3 A3 C4]:q E2:q [E3 A3 C4]:q |
           E2:q [E3 G#3 B3]:q A2:q [E3 A3 C4]:q | A2:q [E3 A3 C4]:q A2:q r:q |
           A2:q [E3 A3 C4]:q A2:q [E3 A3 C4]:q | A2:q [E3 A3 C4]:q E2:q [E3 A3 C4]:q |
           E2:q [E3 G#3 B3]:q A2:q [E3 A3 C4]:q | E2:q [E3 G#3 B3]:q A2:q r:q |
           A2:q [E3 A3 C4]:q A2:q [E3 A3 C4]:q | A2:q [E3 A3 C4]:q E2:q [E3 A3 C4]:q |
           E2:q [E3 G#3 B3]:q A2:q [E3 A3 C4]:q | E2:q [E3 G#3 B3]:q [A2 E3 A3]:h`,
  },
  {
    id: 'valse-la-mineur',
    title: 'Valse en la mineur (B.150)',
    composer: 'F. Chopin',
    level: 3,
    bpm: 100,
    time: [3, 4],
    right: `E5:h C5:q | B4:q. C5:e B4:e A4:e | G#4:h B4:q | A4:h. |
            E5:h C5:q | B4:q. C5:e B4:e A4:e | G#4:q B4:q D5:q | B4:h. |
            A5:h E5:q | C5:q. D5:e C5:e B4:e | D5:h F5:q | D5:q. E5:e D5:e C5:e |
            B4:h E5:q | G#4:q. A4:e B4:e G#4:e | A4:q B4:e C5:e B4:e A4:e | A4:h.`,
    left: `A2:q [E3 A3 C4]:q [E3 A3 C4]:q | A2:q [E3 A3 C4]:q [E3 A3 C4]:q |
           E2:q [E3 G#3 D4]:q [E3 G#3 D4]:q | A2:q [E3 A3 C4]:q [E3 A3 C4]:q |
           A2:q [E3 A3 C4]:q [E3 A3 C4]:q | A2:q [E3 A3 C4]:q [E3 A3 C4]:q |
           E2:q [E3 G#3 D4]:q [E3 G#3 D4]:q | E2:q [E3 G#3 B3]:q [E3 G#3 B3]:q |
           A2:q [E3 A3 C4]:q [E3 A3 C4]:q | A2:q [E3 A3 C4]:q [E3 A3 C4]:q |
           D3:q [F3 A3 D4]:q [F3 A3 D4]:q | D3:q [F3 A3 D4]:q [F3 A3 D4]:q |
           E2:q [E3 G#3 D4]:q [E3 G#3 D4]:q | E2:q [E3 G#3 B3]:q [E3 G#3 B3]:q |
           E2:q [E3 G#3 D4]:q [E3 G#3 D4]:q | [A2 E3 A3]:h.`,
  },
];
