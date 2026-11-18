// NOVAE service worker: network first, so every deploy shows up right away; the cache is only the offline fallback.
// Our own files are always revalidated with the server (cache: 'no-cache' -> a quick 304 when nothing changed),
// so there are no ?v= version numbers to bump: a push is enough.
// ponytail: the cache grows with every image seen (picsum); add a size cap or skip third-party images if it gets heavy.
const CACHE = 'novae';
const SHELL = ['./', 'index.html', 'styles.css', 'i18n.js', 'manifest.webmanifest', 'assets/svg/stella.svg',
  ...['base', 'menu', 'feed', 'galleria', 'novae', 'profilo', 'pannelli', 'app'].map(f => `js/${f}.js`)];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // drop the old numbered caches (novae-v1 ... novae-v31)
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  const own = new URL(req.url).origin === location.origin;
  e.respondWith(
    (own ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(req)).then(res => {
      if (res.ok || res.type === 'opaque') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true })
      .then(hit => hit || (req.mode === 'navigate' ? caches.match('./') : Response.error())))
  );
});
