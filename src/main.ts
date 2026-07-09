import './styles.css';
import { registerScreen, startRouter, navigate } from './ui/router';
import { renderFreePlay } from './ui/screens/free-play';

function stub(title: string) {
  return (el: HTMLElement) => {
    el.innerHTML = `<div class="screen"><h1>${title}</h1><p class="muted">Bientôt disponible…</p></div>`;
  };
}

registerScreen('home', stub('Morceaux'));
registerScreen('free', renderFreePlay);
registerScreen('lessons', stub('Leçons'));
registerScreen('settings', stub('Réglages'));

document.querySelectorAll<HTMLButtonElement>('#nav button').forEach((b) => {
  b.addEventListener('click', () => navigate(b.dataset.screen!));
});

startRouter(document.getElementById('app')!);
