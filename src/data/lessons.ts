export type QuizItem =
  | { kind: 'find-key'; prompt: string; midi: number }
  | { kind: 'mcq'; prompt: string; svg?: string; choices: string[]; answer: number };

export type LessonPage = { html: string } | { quiz: QuizItem[] };

export interface Lesson {
  id: string;
  title: string;
  emoji: string;
  intro: string;
  pages: LessonPage[];
}

/** Portée SVG avec une note (clé de sol ou fa). Blanches uniquement. */
export function staffSvg(clef: 'treble' | 'bass', midi: number): string {
  const letterIdx = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][midi % 12];
  const diatonic = Math.floor(midi / 12 - 1) * 7 + letterIdx;
  const bottomLineDiatonic = clef === 'treble' ? 30 /* Mi4 */ : 18 /* Sol2 */;
  const half = 7; // px par demi-interligne
  const bottomY = 90;
  const y = bottomY - (diatonic - bottomLineDiatonic) * half;
  let lines = '';
  for (let i = 0; i < 5; i++) {
    const ly = bottomY - i * half * 2;
    lines += `<line x1="20" y1="${ly}" x2="180" y2="${ly}" stroke="currentColor" stroke-width="1.5"/>`;
  }
  let ledger = '';
  for (let d = bottomLineDiatonic - 2; d >= diatonic; d -= 2) {
    const ly = bottomY - (d - bottomLineDiatonic) * half;
    ledger += `<line x1="86" y1="${ly}" x2="122" y2="${ly}" stroke="currentColor" stroke-width="1.5"/>`;
  }
  for (let d = bottomLineDiatonic + 10; d <= diatonic; d += 2) {
    const ly = bottomY - (d - bottomLineDiatonic) * half;
    ledger += `<line x1="86" y1="${ly}" x2="122" y2="${ly}" stroke="currentColor" stroke-width="1.5"/>`;
  }
  const clefGlyph =
    clef === 'treble'
      ? `<text x="24" y="${bottomY - half * 2}" font-size="52" fill="currentColor">𝄞</text>`
      : `<text x="24" y="${bottomY - half * 3.2}" font-size="40" fill="currentColor">𝄢</text>`;
  return `<svg viewBox="0 0 200 130" width="200" height="130" style="color:var(--text)">
    ${lines}${ledger}${clefGlyph}
    <ellipse cx="104" cy="${y}" rx="8" ry="6" fill="currentColor" transform="rotate(-15 104 ${y})"/>
  </svg>`;
}

const p = (html: string): LessonPage => ({ html });

export const LESSONS: Lesson[] = [
  {
    id: 'clavier',
    title: 'Le clavier',
    emoji: '🎹',
    intro: 'Repère-toi sur le clavier grâce aux groupes de touches noires.',
    pages: [
      p(`<h3>Les groupes de touches noires</h3>
         <p>Le clavier alterne des groupes de <b>2</b> et <b>3</b> touches noires.
         La touche blanche juste à <b>gauche d'un groupe de 2 noires</b> est toujours un <b>Do</b>.</p>
         <p>Sur ton Yamaha P-145, le Do du milieu (Do4) est face au logo, au centre.</p>`),
      p(`<h3>Do · Ré · Mi · Fa · Sol · La · Si</h3>
         <p>Les blanches se nomment dans cet ordre, puis ça recommence.
         <b>Fa</b> est à gauche d'un groupe de <b>3 noires</b>.</p>`),
      {
        quiz: [
          { kind: 'find-key', prompt: 'Touche le Do du milieu (Do4)', midi: 60 },
          { kind: 'find-key', prompt: 'Touche un Sol4', midi: 67 },
          { kind: 'find-key', prompt: 'Touche un Fa4', midi: 65 },
          { kind: 'find-key', prompt: 'Touche un Mi4', midi: 64 },
          { kind: 'find-key', prompt: 'Touche un Do5 (une octave au-dessus)', midi: 72 },
        ],
      },
    ],
  },
  {
    id: 'noms-notes',
    title: 'Les noms des notes',
    emoji: '🔤',
    intro: 'Associe chaque touche à son nom, y compris les dièses et bémols.',
    pages: [
      p(`<h3>Dièses et bémols</h3>
         <p>Les touches noires portent deux noms : <b>Do♯</b> (do dièse, un demi-ton au-dessus de Do)
         est aussi <b>Ré♭</b> (ré bémol, un demi-ton sous Ré).</p>
         <p>En notation internationale : Do=C, Ré=D, Mi=E, Fa=F, Sol=G, La=A, Si=B.</p>`),
      {
        quiz: [
          { kind: 'find-key', prompt: 'Touche un Ré4', midi: 62 },
          { kind: 'find-key', prompt: 'Touche un La4', midi: 69 },
          { kind: 'find-key', prompt: 'Touche un Fa♯4 (touche noire)', midi: 66 },
          { kind: 'find-key', prompt: 'Touche un Si♭3 (touche noire)', midi: 58 },
          { kind: 'mcq', prompt: 'En notation internationale, Sol s’écrit…', choices: ['G', 'S', 'C', 'A'], answer: 0 },
        ],
      },
    ],
  },
  {
    id: 'cle-de-sol',
    title: 'La clé de sol',
    emoji: '𝄞',
    intro: 'Lis les notes de la main droite sur la portée.',
    pages: [
      p(`<h3>La portée en clé de sol</h3>
         <p>5 lignes. De bas en haut, les notes <b>sur les lignes</b> : Mi, Sol, Si, Ré, Fa.
         Dans les <b>interlignes</b> : Fa, La, Do, Mi.</p>
         <p>Le Do du milieu (Do4) se place juste <b>sous la portée</b>, sur une petite ligne supplémentaire.</p>`),
      {
        quiz: [
          { kind: 'mcq', prompt: 'Quelle est cette note ?', svg: staffSvg('treble', 60), choices: ['Do4', 'Mi4', 'Sol4', 'Si4'], answer: 0 },
          { kind: 'mcq', prompt: 'Quelle est cette note ?', svg: staffSvg('treble', 67), choices: ['Mi4', 'Sol4', 'La4', 'Do5'], answer: 1 },
          { kind: 'mcq', prompt: 'Quelle est cette note ?', svg: staffSvg('treble', 71), choices: ['La4', 'Do5', 'Si4', 'Ré5'], answer: 2 },
          { kind: 'mcq', prompt: 'Quelle est cette note ?', svg: staffSvg('treble', 76), choices: ['Mi5', 'Fa5', 'Ré5', 'Do5'], answer: 0 },
          { kind: 'find-key', prompt: 'Joue cette note sur le clavier :', midi: 64 },
        ],
      },
    ],
  },
  {
    id: 'cle-de-fa',
    title: 'La clé de fa',
    emoji: '𝄢',
    intro: 'Lis les notes de la main gauche.',
    pages: [
      p(`<h3>La portée en clé de fa</h3>
         <p>Utilisée pour les notes graves (main gauche). De bas en haut, les lignes :
         <b>Sol, Si, Ré, Fa, La</b>. Le Do du milieu se place juste <b>au-dessus</b> de la portée.</p>`),
      {
        quiz: [
          { kind: 'mcq', prompt: 'Quelle est cette note ?', svg: staffSvg('bass', 48), choices: ['Do3', 'Mi3', 'Sol2', 'Fa3'], answer: 0 },
          { kind: 'mcq', prompt: 'Quelle est cette note ?', svg: staffSvg('bass', 43), choices: ['Si2', 'Sol2', 'Ré3', 'Fa2'], answer: 1 },
          { kind: 'mcq', prompt: 'Quelle est cette note ?', svg: staffSvg('bass', 53), choices: ['La3', 'Do3', 'Mi3', 'Fa3'], answer: 3 },
          { kind: 'find-key', prompt: 'Joue cette note grave :', midi: 48 },
        ],
      },
    ],
  },
  {
    id: 'rythme',
    title: 'Le rythme',
    emoji: '🥁',
    intro: 'Rondes, blanches, noires et croches.',
    pages: [
      p(`<h3>Les durées</h3>
         <p>♩ <b>Noire</b> = 1 temps · 𝅗𝅥 <b>Blanche</b> = 2 temps · 𝅝 <b>Ronde</b> = 4 temps ·
         ♪ <b>Croche</b> = ½ temps.</p>
         <p>Un point après la note ajoute la moitié de sa durée : une blanche pointée = 3 temps.</p>`),
      {
        quiz: [
          { kind: 'mcq', prompt: 'Combien de temps dure une blanche ?', choices: ['1', '2', '3', '4'], answer: 1 },
          { kind: 'mcq', prompt: 'Combien de temps dure une ronde ?', choices: ['1', '2', '3', '4'], answer: 3 },
          { kind: 'mcq', prompt: 'Une noire pointée dure…', choices: ['1 temps', '1,5 temps', '2 temps', '3 temps'], answer: 1 },
          { kind: 'mcq', prompt: 'En 4/4, combien de noires par mesure ?', choices: ['2', '3', '4', '6'], answer: 2 },
        ],
      },
    ],
  },
  {
    id: 'premiers-morceaux',
    title: 'Tes premiers morceaux',
    emoji: '🚀',
    intro: 'Mets tout en pratique.',
    pages: [
      p(`<h3>À toi de jouer !</h3>
         <p>Tu connais le clavier, les notes et le rythme. Direction la bibliothèque :</p>
         <p>1. Commence par <b>Au clair de la lune</b> en mode <b>attente</b> (l'app attend ta note).<br>
         2. Active le <b>micro</b> 🎤 pour que l'app écoute ton vrai piano.<br>
         3. Travaille <b>mains séparées</b>, puis les deux ensemble.<br>
         4. Vise les 3 étoiles avant de passer au morceau suivant !</p>
         <p><a href="#/home" class="btn" style="display:inline-block;text-decoration:none;margin-top:8px">🎵 Ouvrir la bibliothèque</a></p>`),
    ],
  },
];
