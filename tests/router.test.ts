// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { registerScreen, startRouter, handleRoute, parseHash } from '../src/ui/router';

describe('parseHash', () => {
  it('extrait le nom et les paramètres', () => {
    const { name, params } = parseHash('#/learn?id=ode&mode=fall');
    expect(name).toBe('learn');
    expect(params.get('id')).toBe('ode');
    expect(params.get('mode')).toBe('fall');
  });

  it('retombe sur home si hash vide', () => {
    expect(parseHash('').name).toBe('home');
    expect(parseHash('#/').name).toBe('home');
  });
});

describe('router', () => {
  it('rend l’écran et appelle le cleanup au changement', () => {
    document.body.innerHTML = '<main id="app"></main>';
    const el = document.getElementById('app')!;
    const cleanup = vi.fn();
    registerScreen('home', (root) => {
      root.textContent = 'accueil';
      return cleanup;
    });
    registerScreen('other', (root) => {
      root.textContent = 'autre';
    });
    startRouter(el);
    expect(el.textContent).toBe('accueil');
    handleRoute('#/other');
    expect(cleanup).toHaveBeenCalledOnce();
    expect(el.textContent).toBe('autre');
  });
});
