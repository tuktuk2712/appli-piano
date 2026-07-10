/// <reference lib="webworker" />
/**
 * Service worker : précache PWA (hors-ligne) + cible de partage Android.
 * « Partager → Piano Studio » depuis OneDrive/Fichiers dépose le fichier ici ;
 * il est stocké dans le Cache API puis récupéré par l'écran d'accueil.
 */
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<string | { url: string; revision: string | null }>;
};

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

const SHARE_CACHE = 'shared-files';
export const SHARE_KEY = '/__shared-file';

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && url.pathname.endsWith('/share-target')) {
    event.respondWith(
      (async () => {
        try {
          const form = await event.request.formData();
          const file = form.get('file');
          if (file instanceof File) {
            const cache = await caches.open(SHARE_CACHE);
            await cache.put(
              SHARE_KEY,
              new Response(file, {
                headers: { 'X-File-Name': encodeURIComponent(file.name || 'partage.mxl') },
              }),
            );
          }
        } catch {
          // formulaire illisible : on ouvre l'app quand même
        }
        return Response.redirect(self.registration.scope + '#/home?shared=1', 303);
      })(),
    );
  }
});
