const CACHE_NAME = 'ticket-cache-v5';
const urlsToCache = [
  './',
  './index.html'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    clients.claim().then(() => {
      // Limpia cachés antiguos obsoletos para evitar conflictos
      return caches.keys().then(keys => {
        return Promise.all(
          keys.map(key => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      });
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en caché lo devuelve, si no, lo busca en la red de forma segura
        return response || fetch(event.request).catch(() => {
          // Fallback por si acaso no hay conexión y se pide una página nueva
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
