/* EuroBet Live — service worker (cache app shell) */
const CACHE = 'eurobet-v2-calendriers';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './calendrier-addon.js',
  './calendrier-data.gz.b64.part0',
  './calendrier-data.gz.b64.part1',
  './calendrier-data.gz.b64.part2',
  './calendrier-data.gz.b64.part3',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (c) => {
      for (const url of PRECACHE) {
        try { await c.add(url); } catch (e) { /* ignore missing optional assets */ }
      }
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (
    url.hostname.includes('espn.com') ||
    url.hostname.includes('the-odds-api.com') ||
    url.pathname.includes('/apis/')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const net = fetch(event.request)
        .then((res) => {
          if (res && res.ok && event.request.method === 'GET') {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(event.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || net;
    })
  );
});
