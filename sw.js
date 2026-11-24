// NOVAE service worker: network first, so every deploy shows up right away; the cache is only the offline fallback.
// Our own files are always revalidated with the server (cache: 'no-cache' -> a quick 304 when nothing changed),
// so there are no ?v= version numbers to bump: a push is enough.
// Pictures from other sites (the sample works) go in their own cache, trimmed to the last IMG_MAX seen.
const CACHE = 'novae', IMG_CACHE = 'novae-img', IMG_MAX = 150;
const trim = c => c.keys().then(k => Promise.all(k.slice(0, Math.max(0, k.length - IMG_MAX)).map(r => c.delete(r)))); // oldest first
const PUSH_ICON = './assets/app/icon-192.png';
// the small icon in Android's status bar, next to the clock: white on transparent, Android only keeps the shape
const PUSH_BADGE = './assets/app/badge-96.png';
const SHELL = ['./', 'index.html', 'styles.css', 'i18n.js', 'manifest.webmanifest', 'assets/svg/stella.svg', PUSH_ICON, PUSH_BADGE,
  ...['base', 'push', 'menu', 'feed', 'galleria', 'novae', 'profilo', 'pannelli', 'app'].map(f => `./js/${f}.js`)];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // drop the old numbered caches (novae-v1 ... novae-v31)
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== IMG_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  const own = new URL(req.url).origin === location.origin;
  e.respondWith(
    (own ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(req)).then(res => {
      if (res.ok || res.type === 'opaque') {
        const copy = res.clone(), pic = !own && req.destination === 'image';
        caches.open(pic ? IMG_CACHE : CACHE).then(c => c.put(req, copy).then(() => pic && trim(c)));
      }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true })
      .then(hit => hit || (req.mode === 'navigate' ? caches.match('./') : Response.error())))
  );
});

self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; }
  catch { data = { body: e.data ? e.data.text() : '' }; }
  const title = data.title || 'NOVAE';
  const url = typeof data.url === 'string' && data.url ? data.url : '#scopri';
  const opts = {
    body: data.body || '',
    icon: PUSH_ICON,
    badge: PUSH_BADGE,
    tag: data.tag || (data.eventId ? `novae-${data.eventId}` : 'novae'),
    renotify: !!data.renotify,
    data: { url, eventId: data.eventId || '' },
  };
  e.waitUntil((async () => {
    if (typeof data.badgeCount === 'number' && self.navigator?.setAppBadge) {
      try { await self.navigator.setAppBadge(data.badgeCount); } catch { /* unsupported */ }
    }
    await self.registration.showNotification(title, opts);
  })());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const raw = e.notification.data?.url || '#scopri';
  const targetHash = raw.startsWith('#') ? raw : (raw.includes('#') ? raw.slice(raw.indexOf('#')) : '#' + raw.replace(/^\/+/, ''));
  const targetUrl = new URL('./' + targetHash, self.registration.scope).href;
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const sameScope = list.find(c => c.url.startsWith(self.registration.scope));
    if (sameScope) {
      if ('focus' in sameScope) await sameScope.focus();
      sameScope.postMessage({ type: 'NOVAE_NAVIGATE', hash: targetHash });
      return;
    }
    if (self.clients.openWindow) await self.clients.openWindow(targetUrl);
  })());
});

self.addEventListener('pushsubscriptionchange', e => {
  e.waitUntil((async () => {
    const opts = e.oldSubscription?.options;
    let next = e.newSubscription || null;
    if (!next && opts?.applicationServerKey) {
      try { next = await self.registration.pushManager.subscribe(opts); } catch { next = null; }
    }
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    list.forEach(c => c.postMessage({
      type: 'NOVAE_SUBSCRIPTION_CHANGED',
      oldEndpoint: e.oldSubscription?.endpoint || '',
      subscription: next ? next.toJSON() : null,
    }));
  })());
});
