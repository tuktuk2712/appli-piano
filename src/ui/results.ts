import type { MatchStats } from '../core/matcher';
import { computeScore } from '../core/matcher';
import { progressStore } from '../core/progress';

export interface ResultsActions {
  onReplay(): void;
  onExit(): void;
}

/** Écran de fin : score, étoiles, détail, actions. Enregistre la progression. */
export function showResults(host: HTMLElement, songId: string, stats: MatchStats, actions: ResultsActions): void {
  const { percent, stars } = computeScore(stats);
  progressStore.recordPlay(songId, percent, stars);

  const overlay = document.createElement('div');
  overlay.className = 'results-overlay';
  overlay.innerHTML = `
    <div class="results-card">
      <div class="results-stars">${[1, 2, 3].map((i) => `<span class="${i <= stars ? 'on' : ''}">★</span>`).join('')}</div>
      <div class="results-percent">${percent}%</div>
      <div class="results-detail">
        <span>✨ Parfait : <b>${stats.perfect}</b></span>
        <span>👍 Bien : <b>${stats.good}</b></span>
        <span>💤 Manquées : <b>${stats.miss}</b></span>
        <span>❌ Fausses : <b>${stats.wrong}</b></span>
      </div>
      <div class="results-actions">
        <button class="btn ghost" data-act="exit">Bibliothèque</button>
        <button class="btn" data-act="replay">Rejouer</button>
      </div>
    </div>`;

  const style = document.createElement('style');
  style.textContent = `
    .results-overlay { position: absolute; inset: 0; background: rgba(10,12,16,0.82); display: flex;
      align-items: center; justify-content: center; z-index: 30; animation: toast-in 0.3s ease; }
    .results-card { background: var(--bg-2); border: 1px solid #2a3342; border-radius: 20px;
      padding: 28px 32px; text-align: center; min-width: 270px; }
    .results-stars { font-size: 2.6rem; letter-spacing: 8px; color: #3a4356; }
    .results-stars .on { color: var(--gold); text-shadow: 0 0 18px rgba(255,207,92,0.55); }
    .results-percent { font-size: 2.4rem; font-weight: 800; margin: 6px 0 14px; }
    .results-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 18px; text-align: left;
      color: var(--text-dim); font-size: 0.9rem; margin-bottom: 20px; }
    .results-actions { display: flex; gap: 10px; justify-content: center; }
  `;
  overlay.appendChild(style);
  overlay.querySelector('[data-act="replay"]')!.addEventListener('click', () => {
    overlay.remove();
    actions.onReplay();
  });
  overlay.querySelector('[data-act="exit"]')!.addEventListener('click', () => {
    overlay.remove();
    actions.onExit();
  });
  host.appendChild(overlay);
}
