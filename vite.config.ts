import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  build: { target: 'es2020' },
  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,mp3,musicxml,json,svg,png,woff2}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      manifest: {
        name: 'Piano Studio',
        short_name: 'Piano',
        description: "Apprends le piano : morceaux, partitions et feedback en temps réel",
        lang: 'fr',
        display: 'fullscreen',
        orientation: 'any',
        background_color: '#0e1116',
        theme_color: '#0e1116',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // Cible de partage Android : « Partager → Piano Studio » depuis OneDrive/Fichiers
        share_target: {
          action: 'share-target',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            files: [
              {
                name: 'file',
                accept: [
                  'audio/midi',
                  'application/octet-stream',
                  'application/vnd.recordare.musicxml',
                  'application/vnd.recordare.musicxml+xml',
                  '.mid',
                  '.midi',
                  '.xml',
                  '.musicxml',
                  '.mxl',
                ],
              },
            ],
          },
        },
      } as Partial<import('vite-plugin-pwa').ManifestOptions>,
    }),
  ],
});
