/* EuroBet Live — service worker (cache app shell) */
const CACHE = 'eurobet-v6c3-search-hist';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './calendrier-addon.js',
  './calendrier-v6c3.b64.part0',
  './calendrier-v6c3.b64.part1',
  './calendrier-v6c3.b64.part2',
  './calendrier-v6c3.b64.part3',
  './calendrier-v6c3.b64.part4',
  './calendrier-v6c3.b64.part5',
  './calendrier-v6c3.b64.part6',
  './calendrier-v6c3.b64.part7',
  './calendrier-addon.b64.part0',
  './calendrier-addon.b64.part1',
  './calendrier-addon.b64.part2',
  './calendrier-addon.b64.part3',
  './calendrier-addon.b64.part4',
  './calendrier-addon.b64.part5',
  './calendrier-addon.b64.part6',
  './calendrier-addon.b64.part7',
  './calendrier-addon.b64.part8',
  './calendrier-addon.b64.part9',
  './calendrier-addon.b64.part10',
  './calendrier-addon.b64.part11',
  './calendrier-addon.b64.part12',
  './calendrier-addon.b64.part13',
  './calendrier-addon.b64.part14',
  './calendrier-addon.b64.part15',
  './calendrier-addon.b64.part16',
  './calendrier-addon.b64.part17',
  './calendrier-data.gz.b64.part0',
  './calendrier-data.gz.b64.part1',
  './calendrier-data.gz.b64.part2',
  './calendrier-data.gz.b64.part3',
  './calendrier-data.gz.b64.part4',
  './calendrier-data.gz.b64.part5',
  './calendrier-data.gz.b64.part6',
  './calendrier-data.gz.b64.part7',
  './calendrier-data.gz.b64.part8',
  './calendrier-data.gz.b64.part9',
  './calendrier-data.gz.b64.part10',
  './calendrier-data.gz.b64.part11',
  './calendrier-data.gz.b64.part12',
  './calendrier-data.gz.b64.part13',
  './calendrier-data.gz.b64.part14',
  './calendrier-data.gz.b64.part15',
  './calendrier-data.gz.b64.part16',
  './calendrier-data.gz.b64.part17',
  './calendrier-data.gz.b64.part18',
  './calendrier-data.gz.b64.part19',
  './calendrier-data.gz.b64.part20',
  './calendrier-data.gz.b64.part21',
  './calendrier-data.gz.b64.part22',
  './calendrier-data.gz.b64.part23',
  './calendrier-data.gz.b64.part24',
  './calendrier-data.gz.b64.part25',
  './calendrier-data.gz.b64.part26',
  './calendrier-data.gz.b64.part27',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (c) => {
      for (const url of PRECACHE) {
        try { await c.add(url); } catch (e) {}
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
  if (url.pathname.includes('calendrier-addon') || url.pathname.includes('calendrier-data') || url.pathname.includes('calendrier-v6c3')) {
    event.respondWith(
      fetch(event.request).then((res) => {
        if (res && res.ok && event.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, clone));
        }
        return res;
      }).catch(() => caches.match(event.request))
    );
    return;
  }
  if (url.hostname.includes('espn.com') || url.hostname.includes('the-odds-api.com') || url.pathname.includes('/apis/')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const net = fetch(event.request).then((res) => {
        if (res && res.ok && event.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
