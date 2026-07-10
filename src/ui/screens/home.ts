import { loadLibrary, type LibraryEntry } from '../../data/library';
import { listUserSongs, deleteUserSong, saveUserSong, progressStore } from '../../core/progress';
import { parseMidi } from '../../core/midi-parser';
import { parseMusicXml, unzipMxl } from '../../core/musicxml-parser';
import type { Song } from '../../core/song';
import { navigate } from '../router';
import { escapeHtml, toast } from '../dom';
import { canInstall, onInstallChange, promptInstall } from '../install';

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
      <div id="hm-install" class="card" style="display:none;align-items:center;gap:12px">
        <span style="font-size:1.5rem">📲</span>
        <div class="song-info">
          <div class="song-title">Installe l'application</div>
          <div class="song-sub">Plein écran, hors-ligne, sur ton écran d'accueil</div>
        </div>
        <button class="btn" id="hm-install-btn">Installer</button>
      </div>
      <input type="search" id="hm-search" placeholder="🔍 Rechercher un morceau…" />
      <div id="hm-list"><p class="muted">Chargement…</p></div>
      <h2>Mes morceaux importés</h2>
      <div id="hm-user"></div>
      <label class="btn ghost" style="display:inline-block">
        📂 Importer un fichier (.mid, .musicxml, .mxl, .pdf)
        <input type="file" id="hm-import" accept=".mid,.midi,.xml,.musicxml,.mxl,.pdf" hidden />
      </label>
      <p class="muted" style="font-size:0.8rem">Astuce : pour les musiques de films et morceaux modernes
      (Interstellar, River Flows in You…), cherche « titre + MIDI » ou va sur musescore.com,
      puis importe le fichier ici — il reste sur ton appareil.</p>
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
    // title vient du nom de fichier pour les imports : échappement obligatoire
    return `<div class="card song-card" data-id="${escapeHtml(id)}">
      <div class="song-info"><div class="song-title">${escapeHtml(title)}</div><div class="song-sub">${escapeHtml(sub)}</div></div>
      ${starsHtml(id)}
      ${deletable ? `<button class="song-del" data-del="${escapeHtml(id)}" title="Supprimer">🗑</button>` : ''}
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

  // Bandeau d'installation PWA (visible seulement si Chrome propose l'installation)
  const installCard = el.querySelector<HTMLElement>('#hm-install')!;
  const syncInstall = (): void => {
    installCard.style.display = canInstall() ? 'flex' : 'none';
  };
  syncInstall();
  const offInstall = onInstallChange(syncInstall);
  el.querySelector('#hm-install-btn')!.addEventListener('click', async () => {
    const ok = await promptInstall();
    if (ok) toast("📲 Installée ! Retrouve Piano Studio sur ton écran d'accueil");
    syncInstall();
  });

  el.querySelector<HTMLInputElement>('#hm-import')!.addEventListener('change', async function () {
    const file = this.files?.[0];
    this.value = '';
    if (!file) return;
    if (file.name.toLowerCase().endsWith('.pdf')) {
      showPdfHelp(el);
      return;
    }
    try {
      const song = await importFile(file);
      await saveUserSong(song);
      userSongs = userSongs.filter((s) => s.id !== song.id).concat(song);
      renderUser();
      navigate('learn', { id: song.id });
    } catch (err) {
      toast(`❌ Import impossible : ${err instanceof Error ? err.message : 'fichier invalide'}`, 4000);
    }
  });

  return () => {
    disposed = true;
    offInstall();
  };
}

/** Un PDF est une image de partition : il faut une reconnaissance optique (OMR), trop lourde pour le téléphone. */
function showPdfHelp(host: HTMLElement): void {
  const overlay = document.createElement('div');
  overlay.className = 'pdf-help-overlay';
  overlay.innerHTML = `
    <div class="pdf-help-card">
      <h2 style="margin:0 0 10px">📄 Partition PDF détectée</h2>
      <p class="muted" style="margin-top:0">Un PDF est une <b>image</b> : il doit être converti en vraies notes
      (MusicXML) par reconnaissance optique. C'est trop lourd pour un téléphone, mais tu as deux solutions :</p>
      <div class="card" style="margin-bottom:8px">
        <b>1. Le plus simple : MuseScore</b>
        <p class="muted" style="margin:6px 0 8px">Ton morceau existe sûrement déjà en MusicXML —
        cherche son titre puis télécharge en « MusicXML » et importe-le ici.</p>
        <a class="btn ghost" style="text-decoration:none;display:inline-block;color:var(--text)" href="https://musescore.com/sheetmusic" target="_blank" rel="noopener">🔍 Chercher sur musescore.com</a>
      </div>
      <div class="card" style="margin-bottom:12px">
        <b>2. Convertir le PDF sur ton PC (gratuit)</b>
        <p class="muted" style="margin:6px 0 0">Sur ton ordinateur, dans le dossier du projet :</p>
        <code style="display:block;background:var(--bg);padding:8px 10px;border-radius:8px;margin:8px 0;font-size:0.78rem;overflow-x:auto">.\\scripts\\convert-pdf.ps1 ma-partition.pdf</code>
        <p class="muted" style="margin:0">Le script installe <b>Audiveris</b> (le meilleur convertisseur open source)
        et produit un fichier <b>.mxl</b> à importer ici.</p>
      </div>
      <button class="btn" id="pdf-help-close" style="width:100%">Compris</button>
    </div>`;
  const style = document.createElement('style');
  style.textContent = `
    .pdf-help-overlay { position: fixed; inset: 0; background: rgba(10,12,16,0.85); z-index: 40;
      display: flex; align-items: center; justify-content: center; padding: 16px; animation: toast-in 0.25s ease; }
    .pdf-help-card { background: var(--bg-2); border: 1px solid #2a3342; border-radius: 18px;
      padding: 20px; max-width: 480px; max-height: 90vh; overflow-y: auto; }
  `;
  overlay.appendChild(style);
  overlay.querySelector('#pdf-help-close')!.addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  host.appendChild(overlay);
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
