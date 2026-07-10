/** Bouton d'installation PWA : capture l'événement beforeinstallprompt de Chrome. */

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferred = e as BeforeInstallPromptEvent;
  listeners.forEach((cb) => cb());
});

window.addEventListener('appinstalled', () => {
  deferred = null;
  listeners.forEach((cb) => cb());
});

export function canInstall(): boolean {
  return deferred !== null;
}

/** Notifie quand la disponibilité d'installation change. Retourne le détachement. */
export function onInstallChange(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const ev = deferred;
  deferred = null;
  await ev.prompt();
  const choice = await ev.userChoice;
  return choice.outcome === 'accepted';
}
