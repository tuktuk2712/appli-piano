// Télécharge une fois les samples du Salamander Grand Piano (Yamaha C5, CC-BY,
// version allégée hébergée par Tone.js) : un sample tous les 3 demi-tons de A0 à C8.
// Les fichiers sont commités dans public/samples/<midi>.mp3 — aucun CDN à l'exécution.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'samples');
mkdirSync(OUT, { recursive: true });

// Grille Salamander : A, C, D#, F# de chaque octave (tous les 3 demi-tons)
const SALAMANDER_NAMES = { 9: 'A', 0: 'C', 3: 'Ds', 6: 'Fs' };
const BASE = 'https://tonejs.github.io/audio/salamander';

const midis = [];
for (let m = 21; m <= 108; m += 3) midis.push(m);

let done = 0;
for (const midi of midis) {
  const name = `${SALAMANDER_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
  const dest = join(OUT, `${midi}.mp3`);
  const url = `${BASE}/${name}.mp3`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`ECHEC ${name} (${res.status})`);
    process.exitCode = 1;
    continue;
  }
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  done++;
  console.log(`${name}.mp3 -> ${midi}.mp3`);
}
console.log(`${done}/${midis.length} samples Salamander OK`);
