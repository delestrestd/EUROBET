/* EuroBet SW v6c7 — cache shell; calendrier app parts load from jsDelivr */
const CACHE='eurobet-v6c7-jsdelivr-utf8-nav5';
const PRECACHE=[
  './',
  './index.html',
  './manifest.webmanifest',
  './calendrier-addon.js',
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
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(async c=>{for(const u of PRECACHE){try{await c.add(u)}catch(err){}}}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(url.hostname.includes('jsdelivr.net')||url.hostname.includes('githubusercontent.com')){
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
    return;
  }
  if(url.pathname.includes('calendrier-')){
    e.respondWith(fetch(e.request).then(res=>{if(res&&res.ok&&e.request.method==='GET'){const cl=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cl));}return res;}).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>{const net=fetch(e.request).then(res=>{if(res&&res.ok&&e.request.method==='GET'){const cl=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cl));}return res;}).catch(()=>cached);return cached||net;}));
});
