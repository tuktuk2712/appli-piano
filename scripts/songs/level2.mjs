// Niveau 2 — facile. Arrangements simplifiés, domaine public.
export default [
  {
    id: 'fur-elise',
    title: 'La Lettre à Élise (thème)',
    composer: 'L. van Beethoven',
    level: 2,
    bpm: 72,
    time: [3, 4],
    right: `r:q r:q E5:e Eb5:e |
            E5:e Eb5:e E5:e B4:e D5:e C5:e | A4:q r:e C4:e E4:e A4:e | B4:q r:e E4:e Ab4:e B4:e |
            C5:q r:e E4:e E5:e Eb5:e | E5:e Eb5:e E5:e B4:e D5:e C5:e | A4:q r:e C4:e E4:e A4:e |
            B4:q r:e E4:e C5:e B4:e | A4:h.`,
    left: `r:h. |
           r:h. | A2:e E3:e A3:e r:e r:q | E2:e E3:e Ab3:e r:e r:q |
           A2:e E3:e A3:e r:e r:q | r:h. | A2:e E3:e A3:e r:e r:q |
           E2:e E3:e Ab3:e r:e r:q | A2:e E3:e A3:e r:e r:q`,
  },
  {
    id: 'canon-de-pachelbel',
    title: 'Canon de Pachelbel',
    composer: 'J. Pachelbel',
    level: 2,
    bpm: 60,
    time: [4, 4],
    right: `E5:h D5:h | C5:h B4:h | A4:h G4:h | A4:h B4:h |
            C5:h B4:h | A4:h G4:h | F4:h E4:h | F4:h G4:h |
            E5:q G5:q D5:q B4:q | C5:q E5:q B4:q G4:q | A4:q C5:q G4:q E4:q | A4:q C5:q B4:q D5:q |
            E5:h D5:h | C5:h B4:h | A4:h B4:h | C5:w`,
    left: `[C3 G3]:h [G2 D3]:h | [A2 E3]:h [E3 B3]:h | [F2 C3]:h [C3 G3]:h | [F2 C3]:h [G2 D3]:h |
           [C3 G3]:h [G2 D3]:h | [A2 E3]:h [E3 B3]:h | [F2 C3]:h [C3 G3]:h | [F2 C3]:h [G2 D3]:h |
           [C3 G3]:h [G2 D3]:h | [A2 E3]:h [E3 B3]:h | [F2 C3]:h [C3 G3]:h | [F2 C3]:h [G2 D3]:h |
           [C3 G3]:h [G2 D3]:h | [A2 E3]:h [E3 B3]:h | [F2 C3]:h [G2 D3]:h | [C3 G3]:w`,
  },
  {
    id: 'menuet-en-sol',
    title: 'Menuet en Sol',
    composer: 'C. Petzold (attr. Bach)',
    level: 2,
    bpm: 104,
    time: [3, 4],
    right: `D5:q G4:e A4:e B4:e C5:e | D5:q G4:q G4:q | E5:q C5:e D5:e E5:e Gb5:e | G5:q G4:q G4:q |
            C5:q D5:e C5:e B4:e A4:e | B4:q C5:e B4:e A4:e G4:e | Gb4:q G4:e A4:e B4:e G4:e | A4:h. |
            D5:q G4:e A4:e B4:e C5:e | D5:q G4:q G4:q | E5:q C5:e D5:e E5:e Gb5:e | G5:q G4:q G4:q |
            C5:q D5:e C5:e B4:e A4:e | B4:q C5:e B4:e A4:e G4:e | A4:q B4:e A4:e G4:e Gb4:e | G4:h.`,
    left: `[G3 B3]:h A3:q | G3:h. | C3:h. | G2:q B2:q D3:q |
           C3:h. | G2:h. | [D3 A3]:h. | [D3 Gb3]:h. |
           [G3 B3]:h A3:q | G3:h. | C3:h. | G2:q B2:q D3:q |
           C3:h. | G2:h. | [D3 A3]:h. | [G2 D3]:h.`,
  },
  {
    id: 'greensleeves',
    title: 'Greensleeves',
    composer: 'Traditionnel anglais',
    level: 2,
    bpm: 100,
    time: [3, 4],
    right: `r:q r:q A4:q |
            C5:h D5:q | E5:q. F5:e E5:q | D5:h B4:q | G4:q. A4:e B4:q |
            C5:h A4:q | A4:q. Ab4:e A4:q | B4:h Ab4:q | E4:h A4:q |
            C5:h D5:q | E5:q. F5:e E5:q | D5:h B4:q | G4:q. A4:e B4:q |
            C5:q. B4:e A4:q | Ab4:q. Gb4:e Ab4:q | A4:h.`,
    left: `r:h. |
           [A2 E3]:h. | [C3 G3]:h. | [G2 D3]:h. | [E3 B3]:h. |
           [A2 E3]:h. | [A2 E3]:h. | [E3 B3]:h. | [E3 B3]:h. |
           [A2 E3]:h. | [C3 G3]:h. | [G2 D3]:h. | [E3 B3]:h. |
           [A2 E3]:h. | [E3 B3]:h. | [A2 E3]:h.`,
  },
  {
    id: 'amazing-grace',
    title: 'Amazing Grace',
    composer: 'Traditionnel',
    level: 2,
    bpm: 84,
    time: [3, 4],
    right: `r:q r:q G4:q |
            C5:h E5:e C5:e | E5:h D5:q | C5:h A4:q | G4:h G4:q |
            C5:h E5:e C5:e | E5:h D5:q | G5:h. | G5:h E5:q |
            G5:q. E5:e C5:q | E5:h D5:q | C5:h A4:q | G4:h G4:q |
            C5:h E5:e C5:e | E5:h D5:q | C5:h.`,
    left: `r:h. |
           [C3 G3]:h. | [C3 G3]:h. | [F2 C3]:h. | [C3 G3]:h. |
           [C3 G3]:h. | [G2 D3]:h. | [C3 G3]:h. | [C3 G3]:h. |
           [C3 G3]:h. | [G2 D3]:h. | [F2 C3]:h. | [C3 G3]:h. |
           [C3 G3]:h. | [G2 D3]:h. | [C3 G3]:h.`,
  },
  {
    id: 'scarborough-fair',
    title: 'Scarborough Fair',
    composer: 'Traditionnel',
    level: 2,
    bpm: 96,
    time: [3, 4],
    right: `A4:h A4:q | E5:h E5:q | B4:q. C5:e B4:q | A4:h. |
            r:q E5:q G5:q | A5:h G5:q | E5:q Gb5:e E5:e D5:q | E5:h. |
            A5:h A5:q | G5:h E5:q | E5:q D5:q B4:q | G4:q B4:q A4:q | A4:h.`,
    left: `[A2 E3]:h. | [C3 G3]:h. | [G2 D3]:h. | [A2 E3]:h. |
           [C3 G3]:h. | [A2 E3]:h. | [D3 A3]:h. | [E3 B3]:h. |
           [D3 A3]:h. | [C3 G3]:h. | [G2 D3]:h. | [E3 B3]:h. | [A2 E3]:h.`,
  },
  {
    id: 'aura-lee',
    title: 'Aura Lee (Love Me Tender)',
    composer: 'G. Poulton',
    level: 2,
    bpm: 90,
    time: [4, 4],
    right: `G4:q C5:q B4:q C5:q | D5:q A4:q D5:h | G4:q C5:q B4:q C5:q | D5:h C5:h |
            G4:q C5:q B4:q C5:q | D5:q A4:q D5:h | G4:q C5:q B4:q C5:q | D5:h C5:h |
            E5:h E5:h | E5:h D5:h | E5:q D5:q C5:q D5:q | E5:h D5:h |
            G4:q C5:q B4:q C5:q | D5:q A4:q D5:h | G4:q C5:q B4:q C5:q | D5:h C5:h`,
    left: `[C3 G3]:w | [G2 D3]:w | [C3 G3]:w | [G2 D3]:h [C3 G3]:h |
           [C3 G3]:w | [G2 D3]:w | [C3 G3]:w | [G2 D3]:h [C3 G3]:h |
           [A2 E3]:w | [A2 E3]:h [G2 D3]:h | [C3 G3]:w | [A2 E3]:h [G2 D3]:h |
           [C3 G3]:w | [G2 D3]:w | [C3 G3]:w | [G2 D3]:h [C3 G3]:h`,
  },
  {
    id: 'when-the-saints',
    title: 'When the Saints Go Marching In',
    composer: 'Traditionnel',
    level: 2,
    bpm: 110,
    time: [4, 4],
    right: `r:q C4:q E4:q F4:q | G4:w | r:q C4:q E4:q F4:q | G4:w |
            r:q C4:q E4:q F4:q | G4:h E4:h | C4:h E4:h | D4:w |
            r:q C4:q E4:q F4:q | G4:h E4:h | C4:q E4:q D4:h | C4:w`,
    left: `r:w | [C3 G3]:w | [C3 E3]:w | [C3 G3]:w |
           [C3 E3]:w | [C3 G3]:h [C3 E3]:h | [C3 G3]:w | [G2 D3]:w |
           [C3 G3]:w | [C3 G3]:h [C3 E3]:h | [G2 D3]:w | [C3 G3]:w`,
  },
  {
    id: 'house-rising-sun',
    title: 'House of the Rising Sun',
    composer: 'Traditionnel',
    level: 2,
    bpm: 116,
    time: [3, 4],
    right: `r:q r:q A4:q |
            C5:h D5:q | E5:h G5:q | A5:h A5:q | A5:q G5:q E5:q |
            C5:h D5:q | E5:h D5:q | B4:h. | A4:h A4:q |
            C5:h D5:q | E5:h G5:q | A5:h A5:q | A5:q G5:q E5:q |
            C5:h D5:q | E5:h D5:q | B4:h. | A4:h.`,
    left: `r:h. |
           [A2 E3]:h. | [C3 G3]:h. | [D3 A3]:h. | [F2 C3]:h. |
           [A2 E3]:h. | [C3 G3]:h. | [E3 Ab3 B3]:h. | [A2 E3 A3]:h. |
           [A2 E3]:h. | [C3 G3]:h. | [D3 A3]:h. | [F2 C3]:h. |
           [A2 E3]:h. | [C3 G3]:h. | [E3 Ab3 B3]:h. | [A2 E3 A3]:h.`,
  },
  {
    id: 'berceuse-brahms',
    title: 'Berceuse',
    composer: 'J. Brahms',
    level: 2,
    bpm: 76,
    time: [3, 4],
    right: `E4:e E4:e G4:h | E4:e E4:e G4:h | E4:e G4:e C5:q. B4:e | A4:h G4:q |
            D4:e E4:e F4:h | D4:e E4:e F4:h | D4:e F4:e B4:q. A4:e | G4:q B4:q C5:q | C5:h. |
            C5:q. G4:e E4:q | G4:h E4:q | E4:e G4:e C5:q. B4:e | A4:q B4:q G4:q | C5:h.`,
    left: `[C3 G3]:h. | [C3 G3]:h. | [G2 D3]:h. | [C3 G3]:h. |
           [G2 D3]:h. | [G2 D3]:h. | [G2 D3]:h. | [G2 D3]:q [C3 G3]:h | [C3 G3]:h. |
           [C3 G3]:h. | [C3 G3]:h. | [G2 D3]:h. | [G2 D3]:h. | [C3 G3]:h.`,
  },
];
