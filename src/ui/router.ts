export type ScreenRender = (el: HTMLElement, params: URLSearchParams) => void | (() => void);

const screens = new Map<string, ScreenRender>();
let cleanup: (() => void) | null = null;
let root: HTMLElement | null = null;

export function registerScreen(name: string, render: ScreenRender): void {
  screens.set(name, render);
}

export function parseHash(hash: string): { name: string; params: URLSearchParams } {
  const h = hash.replace(/^#\/?/, '');
  const [name, query = ''] = h.split('?');
  return { name: name || 'home', params: new URLSearchParams(query) };
}

export function navigate(name: string, params?: Record<string, string>): void {
  const q = params ? '?' + new URLSearchParams(params).toString() : '';
  location.hash = `#/${name}${q}`;
}

export function handleRoute(hash: string): void {
  if (!root) return;
  const { name, params } = parseHash(hash);
  const render = screens.get(name) ?? screens.get('home');
  if (!render) return;
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
  root.innerHTML = '';
  root.dataset.screen = name;
  document.querySelectorAll<HTMLButtonElement>('#nav button').forEach((b) => {
    b.classList.toggle('active', b.dataset.screen === name);
  });
  const c = render(root, params);
  if (typeof c === 'function') cleanup = c;
}

export function startRouter(rootEl: HTMLElement): void {
  root = rootEl;
  window.addEventListener('hashchange', () => handleRoute(location.hash));
  handleRoute(location.hash);
}
