// ═══ GfredDream — service worker (usage hors-ligne) ═══════════════════
// Stratégie : cache d'abord (démarrage instantané, même hors-ligne), mise à
// jour en tâche de fond dès que le réseau répond. Testé par Fred : sans le
// réseau-d'abord d'origine, le démarrage hors-ligne prenait 15-20s (le temps
// que fetch() échoue franchement avant de basculer sur le cache) — corrigé.
//
// Si t'es en ligne, tu as quand même toujours la dernière version : le cache
// se met à jour en silence à chaque visite, tu la verras juste au prochain
// chargement plutôt qu'instantanément (c'est le compromis du cache-d'abord).
//
// Si tu AJOUTES une nouvelle page/fichier à la liste ci-dessous, bump
// CACHE_NAME (v1 → v2) pour forcer un cache propre chez tous les appareils
// déjà installés ; sinon les anciens caches ne se videraient jamais.

const CACHE_NAME = 'gfreddream-v2';

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
  //
  // Cache d'abord (réponse immédiate si déjà en cache — c'est ce qui rend
  // le démarrage hors-ligne instantané au lieu d'attendre l'échec réseau),
  // mise à jour en tâche de fond en même temps si le réseau répond. Si rien
  // en cache (première visite jamais faite en ligne), on attend le réseau.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached || caches.match('index.html'));

      return cached || networkFetch;
    })
  );
});
