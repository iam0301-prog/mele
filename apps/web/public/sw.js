const CACHE_NAME = 'mele-app-v3';
const PRECACHE_URLS = [
  '/',
  '/mobile',
  '/daily',
  '/manifest.json',
  '/icons/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  const url = new URL(request.url);
  const isHTML = request.headers.get('accept')?.includes('text/html');
  const isAPI = url.pathname.startsWith('/api/');
  const isNextAsset = url.pathname.startsWith('/_next/');

  if (isNextAsset) {
    event.respondWith(fetch(request));
    return;
  }

  if (isHTML || isAPI) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && isHTML) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/mobile') || caches.match('/'))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) =>
      cached || fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }),
    ),
  );
});
