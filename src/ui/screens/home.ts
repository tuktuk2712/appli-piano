import { loadLibrary, type LibraryEntry } from '../../data/library';
import { listUserSongs, deleteUserSong, saveUserSong, progressStore } from '../../core/progress';
import { parseMidi } from '../../core/midi-parser';
import { parseMusicXml, unzipMxl } from '../../core/musicxml-parser';
import type { Song } from '../../core/song';
import { navigate } from '../router';

const LEVEL_LABELS: Record<number, string> = {
  1: '🌱 Débutant',
  2: '🌿 Facile',
  3: '🌳 Intermédiaire',
};

export function renderHome(el: HTMLElement): () => void {
  let disposed = false;
  el.innerHTML = `
    <div class="screen">
      <h1>Piano Studio</h1>
      <p class="muted">Choisis un morceau et joue — au toucher, au micro ou en MIDI.</p>
      <input type="search" id="hm-search" placeholder="🔍 Rechercher un morceau…" />
      <div id="hm-list"><p class="muted">Chargement…</p></div>
      <h2>Mes morceaux importés</h2>
      <div id="hm-user"></div>
      <label class="btn ghost" style="display:inline-block">
        📂 Importer un fichier (.mid, .musicxml, .mxl)
        <input type="file" id="hm-import" accept=".mid,.midi,.xml,.musicxml,.mxl" hidden />
      </label>
      <p class="muted" style="font-size:0.8rem">Astuce : des milliers de partitions MusicXML gratuites sur musescore.com</p>
    </div>`;

  const style = document.createElement('style');
  style.textContent = `
    #hm-search { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid #262e3a;
      background: var(--bg-2); color: var(--text); font: inherit; margin: 10px 0 4px; }
  `;
  el.appendChild(style);

  const list = el.querySelector<HTMLElement>('#hm-list')!;
  const userList = el.querySelector<HTMLElement>('#hm-user')!;
  const search = el.querySelector<HTMLInputElement>('#hm-search')!;
  let entries: LibraryEntry[] = [];
  let userSongs: Song[] = [];

  function starsHtml(id: string): string {
    const p = progressStore.getProgress(id);
    const s = p?.stars ?? 0;
    return `<span class="song-stars">${[1, 2, 3]
      .map((i) => `<span class="${i <= s ? '' : 'off'}">★</span>`)
      .join('')}</span>`;
  }

  function card(id: string, title: string, sub: string, deletable = false): string {
    return `<div class="card song-card" data-id="${id}">
      <div class="song-info"><div class="song-title">${title}</div><div class="song-sub">${sub}</div></div>
      ${starsHtml(id)}
      ${deletable ? `<button class="song-del" data-del="${id}" title="Supprimer">🗑</button>` : ''}
    </div>`;
  }

  function renderList(): void {
    const q = search.value.trim().toLowerCase();
    const filtered = entries.filter(
      (e) => !q || e.title.toLowerCase().includes(q) || e.composer.toLowerCase().includes(q),
    );
    let html = '';
    for (const level of [1, 2, 3] as const) {
      const of = filtered.filter((e) => e.level === level);
      if (!of.length) continue;
      html += `<h2>${LEVEL_LABELS[level]}</h2>`;
      html += of.map((e) => card(e.id, e.title, e.composer)).join('');
    }
    list.innerHTML = html || '<p class="muted">Aucun morceau trouvé.</p>';
    bindCards(list);
  }

  function renderUser(): void {
    userList.innerHTML = userSongs.length
      ? userSongs.map((s) => card(s.id, s.title, 'Importé', true)).join('')
      : '<p class="muted">Aucun morceau importé pour le moment.</p>';
    bindCards(userList);
  }

  function bindCards(root: HTMLElement): void {
    root.querySelectorAll<HTMLElement>('.song-card').forEach((c) => {
      c.addEventListener('click', () => navigate('learn', { id: c.dataset.id! }));
    });
    root.querySelectorAll<HTMLButtonElement>('[data-del]').forEach((b) => {
      b.addEventListener('click', async (ev) => {
        ev.stopPropagation();
        await deleteUserSong(b.dataset.del!);
        userSongs = userSongs.filter((s) => s.id !== b.dataset.del);
        renderUser();
      });
    });
  }

  loadLibrary()
    .then((idx) => {
      if (disposed) return;
      entries = idx;
      renderList();
    })
    .catch(() => {
      list.innerHTML = '<p class="muted">Bibliothèque indisponible.</p>';
    });
  listUserSongs()
    .then((songs) => {
      if (disposed) return;
      userSongs = songs;
      renderUser();
    })
    .catch(() => (userList.innerHTML = ''));

  search.addEventListener('input', renderList);

  el.querySelector<HTMLInputElement>('#hm-import')!.addEventListener('change', async function () {
    const file = this.files?.[0];
    this.value = '';
    if (!file) return;
    try {
      const song = await importFile(file);
      await saveUserSong(song);
      userSongs = userSongs.filter((s) => s.id !== song.id).concat(song);
      renderUser();
      navigate('learn', { id: song.id });
    } catch (err) {
      const t = document.createElement('div');
      t.className = 'toast';
      t.textContent = `❌ Import impossible : ${err instanceof Error ? err.message : 'fichier invalide'}`;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 4000);
    }
  });

  return () => {
    disposed = true;
  };
}

async function importFile(file: File): Promise<Song> {
  const name = file.name.replace(/\.[^.]+$/, '');
  const ext = file.name.split('.').pop()?.toLowerCase();
  const id = `import-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
  if (ext === 'mid' || ext === 'midi') {
    return parseMidi(await file.arrayBuffer(), { id, title: name });
  }
  if (ext === 'mxl') {
    return parseMusicXml(unzipMxl(await file.arrayBuffer()), { id, title: name });
  }
  if (ext === 'xml' || ext === 'musicxml') {
    return parseMusicXml(await file.text(), { id, title: name });
  }
  throw new Error('Format non supporté (utilise .mid, .musicxml ou .mxl)');
}
