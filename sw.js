// ═══ GfredDream — service worker (usage hors-ligne) ═══════════════════
// Stratégie : réseau d'abord (toujours la version la plus fraîche si tu es
// en ligne), cache en secours si hors-ligne (carrière sans 4G). Le cache se
// met à jour tout seul à chaque visite en ligne — pas besoin d'y toucher
// après un simple upload GitHub.
//
// Si tu AJOUTES une nouvelle page/fichier à la liste ci-dessous, bump
// CACHE_NAME (v1 → v2) pour forcer un cache propre chez tous les appareils
// déjà installés ; sinon les anciens caches ne se videraient jamais.

const CACHE_NAME = 'gfreddream-v1';

const PRECACHE_URLS = [
  './',
  'index.html',
  'checklist.css',
  'checklist.js',
  'montage.html',
  'preparation.html',
  'prejump.html',
  'rechappe.html',
  'procedure-revodream.html',
  'procedure-gfreddream.html',
  'manifest.json',
  'fred_diving.ico',
  'fred_diving.png',
  'icon-180.png',
  'icon-192.png',
  'icon-512.png',
  'push-1.jpg',
  'push-3.jpg',
  'push-4.jpg',
  'push-6.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Web Bluetooth ne passe jamais par fetch (c'est une API à part), donc
  // aucun risque que ce service worker interfère avec la connexion BLE.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match('index.html'))
      )
  );
});
