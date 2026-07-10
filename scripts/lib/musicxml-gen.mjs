// Générateur MusicXML à partir d'une notation compacte.
//
// Notation par main : mesures séparées par '|', tokens séparés par espaces.
//   C4:q      noire Do4          durées: w=4, h=2, q=1, e=0.5, s=0.25 temps
//   F#3:h     fa dièse 3 blanche    suffixe '.' = pointée (x1.5)  ex: q.
//   Bb4:e     si bémol 4 croche
//   r:q       silence noire
//   [C3 E3 G3]:h  accord
// Exemple : right: 'C4:q D4:q E4:q F4:q | G4:h G4:h'

const STEP_ALTER = {
  C: ['C', 0], 'C#': ['C', 1], Db: ['D', -1], D: ['D', 0], 'D#': ['D', 1], Eb: ['E', -1],
  E: ['E', 0], F: ['F', 0], 'F#': ['F', 1], Gb: ['G', -1], G: ['G', 0], 'G#': ['G', 1],
  Ab: ['A', -1], A: ['A', 0], 'A#': ['A', 1], Bb: ['B', -1], B: ['B', 0],
};
const DUR_BEATS = { w: 4, h: 2, q: 1, e: 0.5, s: 0.25 };
const DIVISIONS = 4; // par noire -> résolution double-croche

function parseToken(tok) {
  const m = tok.match(/^(\[[^\]]+\]|[A-Gr][b#]?\d?):([whqes])(\.?)$/);
  if (!m) throw new Error(`Token invalide : "${tok}"`);
  let beats = DUR_BEATS[m[2]];
  if (m[3] === '.') beats *= 1.5;
  const div = Math.round(beats * DIVISIONS);
  if (m[1] === 'r') return { rest: true, div };
  const pitches = m[1].startsWith('[') ? m[1].slice(1, -1).split(/\s+/) : [m[1]];
  return {
    rest: false,
    div,
    pitches: pitches.map((p) => {
      const pm = p.match(/^([A-G][b#]?)(\d)$/);
      if (!pm) throw new Error(`Hauteur invalide : "${p}" dans "${tok}"`);
      const [step, alter] = STEP_ALTER[pm[1]];
      return { step, alter, octave: Number(pm[2]) };
    }),
  };
}

function parseHand(str) {
  return str
    .trim()
    .split('|')
    .map((meas) => (meas.match(/\[[^\]]+\]:\S+|\S+/g) ?? []).map(parseToken));
}

function noteXml({ step, alter, octave }, div, { chord = false, staff, type, dot }) {
  return `      <note>${chord ? '<chord/>' : ''}<pitch><step>${step}</step>${
    alter ? `<alter>${alter}</alter>` : ''
  }<octave>${octave}</octave></pitch><duration>${div}</duration><type>${type}</type>${dot ? '<dot/>' : ''}<staff>${staff}</staff></note>`;
}

function typeOfDiv(div) {
  const map = {
    24: ['whole', true], 16: ['whole', false], 12: ['half', true], 8: ['half', false],
    6: ['quarter', true], 4: ['quarter', false], 3: ['eighth', true], 2: ['eighth', false],
    1: ['16th', false],
  };
  return map[div] ?? ['quarter', false];
}

function handXml(measTokens, staff) {
  const out = [];
  for (const tok of measTokens) {
    const [type, dot] = typeOfDiv(tok.div);
    if (tok.rest) {
      out.push(`      <note><rest/><duration>${tok.div}</duration><staff>${staff}</staff></note>`);
    } else {
      tok.pitches.forEach((p, i) => out.push(noteXml(p, tok.div, { chord: i > 0, staff, type, dot })));
    }
  }
  return out.join('\n');
}

const STEP_SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** Empreinte mélodique : les n premières notes de la main droite (la plus aiguë des accords). */
export function songOpeningMidis(song, n = 20) {
  const out = [];
  for (const measure of parseHand(song.right)) {
    for (const t of measure) {
      if (t.rest) continue;
      const midi = Math.max(...t.pitches.map((p) => (p.octave + 1) * 12 + STEP_SEMI[p.step] + p.alter));
      out.push(midi);
      if (out.length >= n) return out;
    }
  }
  return out;
}

/**
 * @param {{id:string,title:string,composer:string,level:1|2|3,bpm:number,time:[number,number],right:string,left:string}} song
 * @returns {string} MusicXML
 */
export function songToMusicXml(song) {
  const right = parseHand(song.right);
  const left = parseHand(song.left);
  const nMeasures = Math.max(right.length, left.length);
  const measDiv = Math.round((song.time[0] * 4) / song.time[1]) * DIVISIONS;

  const measures = [];
  for (let i = 0; i < nMeasures; i++) {
    const r = right[i] ?? [];
    const l = left[i] ?? [];
    const sumDiv = (toks) => toks.reduce((s, t) => s + t.div, 0);
    for (const [handName, toks] of [['right', r], ['left', l]]) {
      if (toks.length && sumDiv(toks) !== measDiv) {
        throw new Error(
          `${song.id} : mesure ${i + 1} main ${handName} = ${sumDiv(toks)} divisions au lieu de ${measDiv}`,
        );
      }
    }
    const attrs =
      i === 0
        ? `      <attributes>
        <divisions>${DIVISIONS}</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>${song.time[0]}</beats><beat-type>${song.time[1]}</beat-type></time>
        <staves>2</staves>
        <clef number="1"><sign>G</sign><line>2</line></clef>
        <clef number="2"><sign>F</sign><line>4</line></clef>
      </attributes>
      <direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${song.bpm}</per-minute></metronome></direction-type><sound tempo="${song.bpm}"/></direction>\n`
        : '';
    const rXml = r.length ? handXml(r, 1) : `      <note><rest/><duration>${measDiv}</duration><staff>1</staff></note>`;
    const lXml = l.length ? handXml(l, 2) : `      <note><rest/><duration>${measDiv}</duration><staff>2</staff></note>`;
    measures.push(`    <measure number="${i + 1}">
${attrs}${rXml}
      <backup><duration>${measDiv}</duration></backup>
${lXml}
    </measure>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>${song.title}</work-title></work>
  <identification><creator type="composer">${song.composer}</creator></identification>
  <part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>
  <part id="P1">
${measures.join('\n')}
  </part>
</score-partwise>
`;
}
