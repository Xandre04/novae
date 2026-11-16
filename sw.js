// NOVAE service worker: network first, so every deploy shows up right away; the cache is only the offline fallback.
// ponytail: the cache grows with every image seen (picsum); add a size cap or skip third-party images if it gets heavy.
const CACHE = 'novae-v22';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'i18n.js', 'manifest.webmanifest', 'assets/svg/stella.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  e.respondWith(
    (req.mode === 'navigate' ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(req)).then(res => {
      if (res.ok || res.type === 'opaque') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }) // styles.css?v=N still finds styles.css
      .then(hit => hit || (req.mode === 'navigate' ? caches.match('./') : Response.error())))
  );
});
