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
  {
    id: 'the-entertainer',
    title: 'The Entertainer (thème)',
    composer: 'S. Joplin',
    level: 2,
    bpm: 80,
    time: [4, 4],
    right: `r:h r:q D4:e D#4:e |
            E4:e C5:e E4:e C5:e E4:e C5:q. | C5:e D5:e D#5:e E5:e C5:e D5:e E5:q |
            B4:e D5:e C5:h D4:e D#4:e |
            E4:e C5:e E4:e C5:e E4:e C5:q. | C5:e D5:e D#5:e E5:e C5:e D5:e E5:q |
            B4:e D5:e C5:h D4:e D#4:e |
            E4:e C5:e E4:e C5:e E4:e C5:q. | C5:e D5:e D#5:e E5:e C5:e D5:e E5:q |
            B4:e D5:e [E4 G4 C5]:h.`,
    left: `r:w |
           C3:q [E3 G3]:q G2:q [E3 G3]:q | C3:q [E3 G3]:q G2:q [E3 G3]:q |
           G2:q [D3 F3 B3]:q C3:q [E3 G3]:q |
           C3:q [E3 G3]:q G2:q [E3 G3]:q | C3:q [E3 G3]:q G2:q [E3 G3]:q |
           G2:q [D3 F3 B3]:q C3:q [E3 G3]:q |
           C3:q [E3 G3]:q G2:q [E3 G3]:q | C3:q [E3 G3]:q G2:q [E3 G3]:q |
           G2:q [D3 F3 B3]:q [C3 G3]:h`,
  },
  {
    id: 'lac-des-cygnes',
    title: 'Le Lac des cygnes (thème)',
    composer: 'P.I. Tchaïkovski',
    level: 2,
    bpm: 76,
    time: [4, 4],
    right: `E5:h A4:e B4:e C5:e D5:e | E5:h A4:e B4:e C5:e D5:e |
            E5:q C5:e A4:e E5:q C5:e A4:e | F5:q D5:e A4:e F5:q D5:e A4:e |
            E5:h A4:e B4:e C5:e D5:e | E5:h A4:e B4:e C5:e D5:e |
            E5:q D5:q C5:q B4:q | A4:w`,
    left: `A2:q E3:q A3:q E3:q | F2:q C3:q F3:q C3:q |
           A2:q E3:q A3:q E3:q | D3:q F3:q A3:q F3:q |
           A2:q E3:q A3:q E3:q | F2:q C3:q F3:q C3:q |
           E2:q B2:q E3:q G#3:q | [A2 E3 A3]:w`,
  },
  {
    id: 'gnossienne-1',
    title: 'Gnossienne n°1 (extrait)',
    composer: 'E. Satie',
    level: 2,
    bpm: 60,
    time: [4, 4],
    right: `r:w | r:w |
            A4:h Bb4:e A4:e G#4:e A4:e | F4:q E4:q D4:h |
            E4:e F4:e E4:e D4:e C#4:e D4:e E4:q | D4:h. r:q |
            A4:h Bb4:e A4:e G#4:e A4:e | F4:q E4:q D4:h |
            E4:e F4:e E4:e D4:e C#4:e D4:e E4:q | D4:w`,
    left: `D3:q [F3 A3]:h. | A2:q [E3 A3]:h. |
           D3:q [F3 A3]:h. | A2:q [E3 A3]:h. |
           A2:q [E3 A3 C#4]:h. | D3:q [F3 A3]:h. |
           D3:q [F3 A3]:h. | A2:q [E3 A3]:h. |
           A2:q [E3 A3 C#4]:h. | [D2 A2 D3]:w`,
  },
  {
    id: 'matin-grieg',
    title: 'Matin (Peer Gynt)',
    composer: 'E. Grieg',
    level: 2,
    bpm: 72,
    time: [4, 4],
    right: `G4:e E4:e D4:e C4:e D4:e E4:q. | G4:e E4:e D4:e C4:e D4:e E4:q. |
            A4:e F4:e E4:e D4:e E4:e F4:q. | G4:e E4:e D4:e C4:e D4:e E4:q. |
            B4:e G4:e F#4:e E4:e F#4:e G4:q. | A4:e F4:e E4:e D4:e E4:e F4:q. |
            G4:e E4:e D4:e C4:e D4:e E4:q. | E4:q D4:q C4:h`,
    left: `[C3 G3]:w | [C3 E3 G3]:w | [D3 F3 A3]:w | [C3 E3 G3]:w |
           [E3 G3 B3]:w | [D3 F3 A3]:w | [C3 E3 G3]:w | [G2 D3]:h [C3 G3]:h`,
  },
  {
    id: 'le-cygne',
    title: 'Le Cygne (extrait)',
    composer: 'C. Saint-Saëns',
    level: 2,
    bpm: 60,
    time: [4, 4],
    right: `E5:w | D5:q C5:q B4:h | C5:h A4:h | G4:w |
            E5:h F5:h | G5:h. E5:q | F5:q E5:q D5:h | E5:h D5:h | C5:w`,
    left: `C3:e G3:e C4:e E4:e C4:e G3:e E3:e G3:e |
           G2:e D3:e G3:e B3:e D4:e B3:e G3:e D3:e |
           A2:e E3:e A3:e C4:e E4:e C4:e A3:e E3:e |
           C3:e G3:e C4:e E4:e C4:e G3:e C4:e E4:e |
           C3:e G3:e C4:e E4:e F2:e C3:e F3:e A3:e |
           C3:e G3:e C4:e E4:e C4:e G3:e C4:e E4:e |
           D3:e A3:e D4:e F4:e G2:e D3:e G3:e B3:e |
           C3:e G3:e C4:e E4:e G2:e D3:e G3:e B3:e |
           C3:e G3:e C4:e E4:e [C3 G3 C4]:h`,
  },
  {
    id: 'ave-maria-schubert',
    title: 'Ave Maria (thème)',
    composer: 'F. Schubert',
    level: 2,
    bpm: 60,
    time: [4, 4],
    right: `G4:h. G4:q | A4:q G4:e F#4:e G4:h | C5:q. B4:e A4:q C5:q | B4:q A4:q G4:h |
            G4:h. G4:q | A4:q G4:e F#4:e G4:h | A4:q G4:q F4:q E4:q | D4:h C4:h`,
    left: `C3:e E3:e G3:e C4:e G3:e E3:e G3:e C4:e |
           G2:e D3:e G3:e B3:e D4:e B3:e G3:e D3:e |
           F2:e C3:e F3:e A3:e C4:e A3:e F3:e C3:e |
           G2:e D3:e G3:e B3:e D4:e B3:e G3:e D3:e |
           C3:e E3:e G3:e C4:e G3:e E3:e G3:e C4:e |
           G2:e D3:e G3:e B3:e D4:e B3:e G3:e D3:e |
           F2:e C3:e F3:e A3:e G2:e D3:e G3:e B3:e |
           G2:e D3:e G3:e B3:e [C3 G3 C4]:h`,
  },
  {
    id: 'roi-de-la-montagne',
    title: "Dans l'antre du roi de la montagne",
    composer: 'E. Grieg',
    level: 2,
    bpm: 108,
    time: [4, 4],
    right: `A3:e B3:e C4:e D4:e E4:e C4:e E4:q | D#4:e B3:e D#4:q D4:e Bb3:e D4:q |
            A3:e B3:e C4:e D4:e E4:e C4:e E4:q | G4:e E4:e G4:h r:q |
            A4:e B4:e C5:e D5:e E5:e C5:e E5:q | D#5:e B4:e D#5:q D5:e Bb4:e D5:q |
            A4:e B4:e C5:e D5:e E5:e C5:e E5:q | G5:e E5:e G5:h r:q |
            A3:e B3:e C4:e D4:e E4:e C4:e E4:q | D#4:e B3:e D#4:q D4:e Bb3:e D4:q |
            A4:e B4:e C5:e D5:e E5:e C5:e E5:q | A4:q E4:q A4:h`,
    left: `[A2 E3]:q [A2 E3]:q [A2 E3]:q [A2 E3]:q | [A2 E3]:q [A2 E3]:q [A2 E3]:q [A2 E3]:q |
           [A2 E3]:q [A2 E3]:q [A2 E3]:q [A2 E3]:q | [A2 E3]:q [A2 E3]:q [A2 E3]:q r:q |
           [A2 E3]:q [A2 E3]:q [A2 E3]:q [A2 E3]:q | [A2 E3]:q [A2 E3]:q [A2 E3]:q [A2 E3]:q |
           [A2 E3]:q [A2 E3]:q [A2 E3]:q [A2 E3]:q | [A2 E3]:q [A2 E3]:q [A2 E3]:q r:q |
           [A2 E3]:q [A2 E3]:q [A2 E3]:q [A2 E3]:q | [A2 E3]:q [A2 E3]:q [A2 E3]:q [A2 E3]:q |
           [A2 E3]:q [A2 E3]:q [A2 E3]:q [A2 E3]:q | [A2 E3]:q [A2 E3]:q [A2 E3]:h`,
  },
  {
    id: 'je-te-veux',
    title: 'Je te veux (thème)',
    composer: 'E. Satie',
    level: 2,
    bpm: 66,
    time: [3, 4],
    right: `G4:q C5:q E5:q | G5:h E5:q | F5:q E5:q D5:q | E5:h C5:q |
            D5:q C5:q B4:q | C5:h A4:q | B4:q A4:q G4:q | D5:h. |
            G4:q C5:q E5:q | G5:h E5:q | A5:q G5:q F5:q | E5:h C5:q |
            F5:q E5:q D5:q | D5:q C5:q B4:q | D5:h B4:q | C5:h.`,
    left: `C3:q [E3 G3]:q [E3 G3]:q | C3:q [E3 G3]:q [E3 G3]:q | G2:q [D3 F3 B3]:q [D3 F3 B3]:q | C3:q [E3 G3]:q [E3 G3]:q |
           G2:q [D3 F3 B3]:q [D3 F3 B3]:q | F2:q [F3 A3]:q [F3 A3]:q | G2:q [D3 F3 B3]:q [D3 F3 B3]:q | G2:q [D3 F3 B3]:q [D3 F3 B3]:q |
           C3:q [E3 G3]:q [E3 G3]:q | C3:q [E3 G3]:q [E3 G3]:q | F2:q [F3 A3 C4]:q [F3 A3 C4]:q | C3:q [E3 G3]:q [E3 G3]:q |
           D3:q [F3 A3]:q [F3 A3]:q | G2:q [D3 F3 B3]:q [D3 F3 B3]:q | G2:q [D3 F3 B3]:q [D3 F3 B3]:q | C3:q [E3 G3]:h`,
  },
];
