import type { SongNote } from './song';

/**
 * Reconnaissance de morceau : on compare la suite d'INTERVALLES joués au début
 * de la mélodie de chaque morceau — insensible à l'octave et à la transposition.
 */

/** Les n premières notes de la mélodie (main droite si disponible, la plus aiguë des accords). */
export function melodyOpening(notes: SongNote[], n = 20): number[] {
  const right = notes.filter((x) => x.hand === 'right');
  const source = right.length >= 4 ? right : notes;
  const out: number[] = [];
  let groupTime = -Infinity;
  let current = -1;
  for (const note of source) {
    if (note.time - groupTime > 0.06) {
      if (current >= 0) out.push(current);
      if (out.length >= n) return out;
      groupTime = note.time;
      current = note.midi;
    } else {
      current = Math.max(current, note.midi);
    }
  }
  if (current >= 0 && out.length < n) out.push(current);
  return out;
}

export function intervals(midis: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < midis.length; i++) out.push(midis[i] - midis[i - 1]);
  return out;
}

/** Distance d'édition (Levenshtein) entre deux suites d'intervalles. */
function editDistance(a: number[], b: number[]): number {
  const m = a.length;
  const n = b.length;
  const dp = new Array<number>((m + 1) * (n + 1));
  for (let i = 0; i <= m; i++) dp[i * (n + 1)] = i;
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i * (n + 1) + j] = Math.min(
        dp[(i - 1) * (n + 1) + j] + 1,
        dp[i * (n + 1) + j - 1] + 1,
        dp[(i - 1) * (n + 1) + j - 1] + cost,
      );
    }
  }
  return dp[m * (n + 1) + n];
}

/** Score 0..1 : à quel point les notes jouées ressemblent au début de `opening`. */
export function matchScore(played: number[], opening: number[]): number {
  const p = intervals(played);
  if (p.length === 0 || opening.length < 2) return 0;
  const o = intervals(opening);
  // comparer à un préfixe de longueur voisine (note manquée ou en trop tolérée)
  let best = 0;
  for (const len of [p.length - 1, p.length, p.length + 1]) {
    if (len < 1 || len > o.length) continue;
    const d = editDistance(p, o.slice(0, len));
    best = Math.max(best, 1 - d / p.length);
  }
  return best;
}

export interface IdentifyCandidate {
  id: string;
  title: string;
  composer?: string;
  opening: number[];
}

export interface IdentifyResult extends IdentifyCandidate {
  score: number;
}

export function rankSongs(played: number[], candidates: IdentifyCandidate[], top = 5): IdentifyResult[] {
  return candidates
    .filter((c) => c.opening.length >= 3)
    .map((c) => ({ ...c, score: matchScore(played, c.opening) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, top);
}
