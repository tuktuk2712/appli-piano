// Télécharge une fois les samples de piano (FluidR3 acoustic_grand_piano, licence MIT-like)
// depuis gleitz/midi-js-soundfonts, un sample tous les 3 demi-tons de A0 (21) à C8 (108).
// Les fichiers sont commités dans public/samples/<midi>.mp3 — aucun CDN à l'exécution.
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'samples');
mkdirSync(OUT, { recursive: true });

const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const BASE = 'https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/acoustic_grand_piano-mp3';

const midis = [];
for (let m = 21; m <= 108; m += 3) midis.push(m);
if (!midis.includes(108)) midis.push(108);

let done = 0;
for (const midi of midis) {
  const name = `${FLAT_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
  const dest = join(OUT, `${midi}.mp3`);
  if (existsSync(dest)) {
    done++;
    continue;
  }
  const url = `${BASE}/${name}.mp3`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`ECHEC ${name} (${res.status})`);
    process.exitCode = 1;
    continue;
  }
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  done++;
  console.log(`${name} -> ${midi}.mp3`);
}
console.log(`${done}/${midis.length} samples OK`);
