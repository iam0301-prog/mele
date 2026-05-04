// Service Worker — 提供基本離線快取（HTML / CSS / 字型）
// 首次造訪會 cache，之後即使無網路也能看靜態頁
const CACHE_NAME = 'mele-v1';
const ASSETS = [
  './',
  './index.html',
  './assets/style.css',
  './assets/config.js',
  './assets/supabase-client.js',
  './assets/mele-api.js',
  './assets/icon-192.svg',
  './assets/icon-512.svg',
  './manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // API 呼叫永遠走網路
  if (url.pathname.startsWith('/api/')) return;
  // 其他用 stale-while-revalidate
  e.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(e.request);
    const network = fetch(e.request).then(r => {
      if (r.ok) cache.put(e.request, r.clone());
      return r;
    }).catch(() => cached);
    return cached || network;
  })());
});
