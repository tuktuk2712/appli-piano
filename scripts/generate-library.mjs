// Génère public/library/*.musicxml + index.json à partir des définitions compactes.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { songToMusicXml, songOpeningMidis } from './lib/musicxml-gen.mjs';
import level1 from './songs/level1.mjs';
import level2 from './songs/level2.mjs';
import level3 from './songs/level3.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'library');
mkdirSync(OUT, { recursive: true });

const all = [...level1, ...level2, ...level3];
const index = [];
const ids = new Set();

for (const song of all) {
  if (ids.has(song.id)) throw new Error(`id dupliqué : ${song.id}`);
  ids.add(song.id);
  const xml = songToMusicXml(song);
  const file = `${song.id}.musicxml`;
  writeFileSync(join(OUT, file), xml, 'utf8');
  index.push({
    id: song.id,
    title: song.title,
    composer: song.composer,
    level: song.level,
    file,
    opening: songOpeningMidis(song), // empreinte mélodique pour le mode reconnaissance
  });
}

writeFileSync(join(OUT, 'index.json'), JSON.stringify(index, null, 2), 'utf8');
console.log(`${all.length} morceaux générés dans public/library/`);
