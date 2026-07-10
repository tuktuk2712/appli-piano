import './styles.css';
import { registerScreen, startRouter, navigate } from './ui/router';
import { renderHome } from './ui/screens/home';
import { renderFreePlay } from './ui/screens/free-play';
import { renderLearnScreen } from './ui/screens/learn';
import { renderLessons } from './ui/screens/lessons';
import { renderSettings } from './ui/screens/settings';
import { renderIdentify } from './ui/screens/identify';

registerScreen('home', renderHome);
registerScreen('free', renderFreePlay);
registerScreen('learn', renderLearnScreen);
registerScreen('lessons', renderLessons);
registerScreen('settings', renderSettings);
registerScreen('identify', renderIdentify);

document.querySelectorAll<HTMLButtonElement>('#nav button').forEach((b) => {
  b.addEventListener('click', () => navigate(b.dataset.screen!));
});

startRouter(document.getElementById('app')!);
