/* NOVAE · Web Push (iOS 16.4+ PWA & desktop), event preferences and plug-and-play VAPID backend hooks.
   Loaded after js/base.js; shares the global scope with the rest of js/*.js. */
'use strict';

// Central push configuration: empty = static local mode (GitHub Pages); set both to enable VAPID Web Push.
const NOVAE_PUSH_CONFIG = Object.assign({
  apiBaseUrl: '',
  vapidPublicKey: '',
}, window.NOVAE_PUSH_CONFIG || {});
window.NOVAE_PUSH_CONFIG = NOVAE_PUSH_CONFIG;

(() => {
  const PUSH_ICON = './assets/app/icon-192.png';
  const PREFS_KEY = 'novae.pushPrefs';
  const UNREAD_KEY = 'novae.pushUnread';
  const TOGGLES_KEY = 'novae.toggles';

  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const hasApis = () => 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;

  const sampleWork = () => (typeof MINE !== 'undefined' && MINE[0]) || (typeof FEED !== 'undefined' && FEED[0]) || { id: 'w1', t: 'Crepa n. 3' };
  const sampleFeedWork = () => (typeof FEED !== 'undefined' && (typeof canSee === 'function' ? FEED.find(canSee) : FEED[0])) || sampleWork();

  // Strictly the 10 approved MVP push events (E4 and E12 excluded)
  const EVENTS = [
    {
      id: 'E1',
      label: 'Messaggi diretti',
      sub: 'Quando ricevi un nuovo messaggio privato',
      defaultOn: true,
      build: p => ({
        title: p.senderName || 'Nuovo messaggio',
        body: p.text || 'Ti ha scritto un nuovo messaggio',
        url: p.threadId ? '#messaggi/' + p.threadId : '#messaggi',
      }),
      sample: () => ({ threadId: 'aiko', senderName: 'Aiko Tanabe', text: 'Dimmi se il finale regge' }),
    },
    {
      id: 'E2',
      label: 'Recensioni dei critici',
      sub: 'Quando un critico recensisce una tua opera con le stelle',
      defaultOn: true,
      build: p => ({
        title: p.stars ? `Nuova recensione · ${p.stars}★` : 'Nuova recensione',
        body: `${p.actorName || 'Un critico'} ha recensito "${p.workTitle || 'la tua opera'}"`,
        url: p.workId ? `#post/${p.workId}/critico` : '#scopri',
      }),
      sample: () => {
        const w = sampleFeedWork();
        const cr = typeof mockReplies === 'function' ? mockReplies(w).find(r => r.rating > 0) : null;
        const aid = cr?.a || 'giulia';
        return { workId: w.id, workTitle: w.t, actorId: aid, actorName: ARTISTS[aid]?.name || 'Giulia Ferri', stars: cr?.rating || 5 };
      },
    },
    {
      id: 'E3',
      label: 'Commenti e note ("Qui")',
      sub: 'Quando qualcuno commenta o indica un punto sulla tua opera',
      defaultOn: true,
      build: p => ({
        title: p.workTitle ? `Commento su "${p.workTitle}"` : 'Nuovo commento',
        body: p.hasPoint
          ? `${p.actorName || 'Qualcuno'} ha indicato un punto: "${p.text || ''}"`
          : `${p.actorName || 'Qualcuno'}: "${p.text || ''}"`,
        url: p.workId ? `#post/${p.workId}/${p.actorId ? 'c:' + encodeURIComponent(p.actorId) : 'commento'}` : '#scopri',
      }),
      sample: () => {
        const w = sampleFeedWork();
        const list = typeof mockReplies === 'function' ? mockReplies(w) : [];
        const rp = list.find(r => r.pt && typeOf(r.a) !== 'critico') || list.find(r => r.pt) || list[0];
        if (rp) return { workId: w.id, workTitle: w.t, actorId: rp.a, actorName: ARTISTS[rp.a]?.name || 'Kittipong Srisuk', text: rp.text, hasPoint: !!rp.pt, pt: rp.pt };
        return { workId: w.id, workTitle: w.t, actorId: 'kitti', actorName: 'Kittipong Srisuk', text: 'Il taglio di luce al minuto due. Come hai fatto?', hasPoint: true };
      },
    },
    {
      id: 'E5',
      label: 'Inviti a collaborazione',
      sub: 'Quando un artista ti aggiunge in "Insieme a"',
      defaultOn: true,
      build: p => ({
        title: 'Richiesta di collaborazione',
        body: `${p.actorName || 'Un artista'} ti ha aggiunto a "${p.workTitle || "un'opera"}"`,
        url: p.workId ? '#post/' + p.workId : '#profilo',
      }),
      sample: () => {
        const w = (typeof WORKS !== 'undefined' && WORKS.find(x => x.co)) || sampleWork();
        return { workId: w.id, workTitle: w.t, actorId: w.a, actorName: ARTISTS[w.a]?.name || 'Ploy Chaiyasit' };
      },
    },
    {
      id: 'E6',
      label: 'Nuovi follower',
      sub: 'Quando qualcuno inizia a seguirti',
      defaultOn: true,
      build: p => ({
        title: 'Nuovo follower',
        body: `${p.actorName || 'Qualcuno'} ha iniziato a seguirti`,
        url: p.actorId && p.actorId !== 'me' ? '#artista/' + p.actorId : '#profilo',
      }),
      sample: () => ({ actorId: 'aiko', actorName: 'Aiko Tanabe' }),
    },
    {
      id: 'E7',
      label: 'Inviti accettati',
      sub: 'Quando qualcuno entra su NOVAE col tuo codice',
      defaultOn: true,
      build: p => ({
        title: 'Invito accettato',
        body: `${p.actorName || 'Qualcuno'} è entrato su NOVAE col tuo codice${p.code ? ' ' + p.code : ''}`,
        url: '#profilo',
      }),
      sample: () => ({ actorName: 'Teo Marini', code: typeof myCode === 'function' ? myCode() : 'NVE-7K2Q' }),
    },
    {
      id: 'E8',
      label: 'Mi piace sulle tue opere',
      sub: 'Quando qualcuno mette mi piace a una tua opera',
      defaultOn: true,
      build: p => ({
        title: 'Nuovo mi piace',
        body: `${p.actorName || 'Qualcuno'} ha messo mi piace a "${p.workTitle || 'la tua opera'}"`,
        url: p.workId ? '#post/' + p.workId : '#profilo',
      }),
      sample: () => { const w = sampleWork(); return { workId: w.id, workTitle: w.t, actorName: 'Nicolò Brancato' }; },
    },
    {
      id: 'E9',
      label: 'Ripubblicazioni (Repost)',
      sub: 'Quando qualcuno ripubblica una tua opera',
      defaultOn: true,
      build: p => ({
        title: 'Opera ripubblicata',
        body: `${p.actorName || 'Qualcuno'} ha ripubblicato "${p.workTitle || 'la tua opera'}"`,
        url: p.actorId ? (p.actorId === 'me' ? '#profilo/repost' : `#artista/${p.actorId}/repost`) : (p.workId ? '#post/' + p.workId : '#profilo'),
      }),
      sample: () => {
        const aid = 'livia';
        const w = (typeof repostsOf === 'function' && repostsOf(aid)[0]) || sampleWork();
        return { workId: w.id, workTitle: w.t, actorId: aid, actorName: ARTISTS[aid]?.name || 'Livia Marchetti' };
      },
    },
    {
      id: 'E10',
      label: 'Costellazioni',
      sub: 'Quando una tua opera entra in una costellazione',
      defaultOn: true,
      build: p => ({
        title: 'Inclusa in una costellazione',
        body: `${p.actorName || 'Un artista'} ha aggiunto "${p.workTitle || 'la tua opera'}" a "${p.colName || 'una costellazione'}"`,
        url: p.actorId
          ? (p.actorId === 'me' ? `#profilo${p.colId ? '/' + p.colId : ''}` : `#artista/${p.actorId}${p.colId ? '/' + p.colId : ''}`)
          : (p.workId ? '#post/' + p.workId : '#profilo'),
      }),
      sample: () => {
        const col = typeof COLLECTIONS !== 'undefined' ? (COLLECTIONS.find(c => c.id === 'c-aiko2') || COLLECTIONS[0]) : null;
        const w = (col && typeof byId !== 'undefined' && byId[col.works[0]]) || sampleWork();
        const aid = col?.a || 'aiko';
        return { workId: w.id, workTitle: w.t, colId: col?.id || 'c-aiko2', colName: col?.name || 'Inverni', actorId: aid, actorName: ARTISTS[aid]?.name || 'Aiko Tanabe' };
      },
    },
    {
      id: 'E11',
      label: 'Segnalazioni (Moderazione)',
      sub: "Quando viene inviata una segnalazione su un'opera",
      defaultOn: true,
      build: p => ({
        title: p.reason ? `Segnalazione (${p.reason})` : 'Nuova segnalazione',
        body: `Opera "${p.workTitle || 'segnalata'}" inviata alla moderazione`,
        url: p.workId ? '#post/' + p.workId : '#scopri',
      }),
      sample: () => { const w = sampleWork(); return { workId: w.id, workTitle: w.t, reason: 'copia' }; },
    },
  ];
  const EVENT_MAP = Object.fromEntries(EVENTS.map(ev => [ev.id, ev]));

  /* ---------------- Toggles & per-event preferences ---------------- */
  function readToggles() {
    return Object.assign({ priv: false, notif: false, auto: true, rate: true }, readJSON(TOGGLES_KEY, {}));
  }
  function setMasterFlag(on) {
    const t = readToggles();
    t.notif = !!on;
    store.set(TOGGLES_KEY, JSON.stringify(t));
  }
  function getPrefs() {
    const savedPrefs = readJSON(PREFS_KEY, {});
    const out = {};
    for (const ev of EVENTS) out[ev.id] = typeof savedPrefs[ev.id] === 'boolean' ? savedPrefs[ev.id] : ev.defaultOn;
    return out;
  }
  function savePrefsMap(map) {
    store.set(PREFS_KEY, JSON.stringify(map));
  }
  function isEventEnabled(id) {
    return !!(EVENT_MAP[id] && getPrefs()[id]);
  }
  function setEventPref(id, on) {
    if (!EVENT_MAP[id]) return false;
    const prefsMap = getPrefs();
    prefsMap[id] = !!on;
    savePrefsMap(prefsMap);
    syncBackendPrefs(prefsMap);
    return true;
  }

  /* ---------------- Platform & permission status ---------------- */
  function getStatus() {
    if (isIOS() && !isStandalone()) return 'ios-install';
    if (!hasApis()) return 'unsupported';
    if (Notification.permission === 'denied') return 'denied';
    if (Notification.permission === 'granted' && readToggles().notif) return 'active';
    return 'off';
  }
  const isMasterEnabled = () => getStatus() === 'active';

  /* ---------------- VAPID / Backend plug-and-play ---------------- */
  const hasBackend = () => Boolean(NOVAE_PUSH_CONFIG.apiBaseUrl && NOVAE_PUSH_CONFIG.apiBaseUrl.trim());
  const apiUrl = path => `${NOVAE_PUSH_CONFIG.apiBaseUrl.replace(/\/+$/, '')}${path}`;

  function urlBase64ToUint8Array(base64String) {
    const pad = '='.repeat((4 - base64String.length % 4) % 4);
    const b64 = (base64String + pad).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(b64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return arr;
  }

  let lastSwError = '';
  async function ensureSW() {
    lastSwError = '';
    if (!('serviceWorker' in navigator)) return null;
    try {
      let reg = (await navigator.serviceWorker.getRegistration('./')) || (await navigator.serviceWorker.getRegistration());
      if (!reg) reg = await navigator.serviceWorker.register('./sw.js');
      if (reg?.active) return reg;
      const ready = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise(res => setTimeout(() => res(null), 4000)),
      ]);
      return ready || reg || null;
    } catch (err) {
      lastSwError = err?.message || String(err);
      console.warn('[NOVAE Push] Service worker non registrato:', lastSwError);
      return null;
    }
  }

  async function ensureSubscription() {
    if (!hasBackend() || !NOVAE_PUSH_CONFIG.vapidPublicKey) return null;
    try {
      const reg = await ensureSW();
      if (!reg?.pushManager) return null;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(NOVAE_PUSH_CONFIG.vapidPublicKey.trim()),
        });
      }
      await sendSubscriptionToBackend(sub.toJSON(), getPrefs());
      return sub;
    } catch {
      return null;
    }
  }

  async function sendSubscriptionToBackend(subscription, prefsMap) {
    if (!hasBackend() || !subscription) return;
    try {
      await fetch(apiUrl('/push/subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          prefs: prefsMap || getPrefs(),
          userId: typeof profile !== 'undefined' ? profile.handle : 'me',
          lang: typeof LANG !== 'undefined' ? LANG : 'it',
        }),
      });
    } catch { /* backend offline or unreachable */ }
  }

  async function syncBackendPrefs(prefsMap) {
    if (!hasBackend() || !isMasterEnabled()) return;
    try {
      const reg = await ensureSW();
      const sub = await reg?.pushManager?.getSubscription();
      if (!sub) return;
      await sendSubscriptionToBackend(sub.toJSON(), prefsMap);
    } catch { /* silent */ }
  }

  async function dispatchToBackend(eventId, payload, recipients, actorId, built) {
    if (!hasBackend() || !recipients.length) return;
    try {
      await fetch(apiUrl('/push/event'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          actorId: actorId || 'me',
          recipients,
          payload,
          notification: { title: built.title, body: built.body, url: built.url },
        }),
      });
    } catch { /* silent */ }
  }

  /* ---------------- Enable / Disable (Safari iOS 16.4+ user gesture safe) ---------------- */
  function enablePush() {
    if (isIOS() && !isStandalone()) {
      setMasterFlag(false);
      return Promise.resolve({ ok: false, reason: 'ios-install' });
    }
    if (!hasApis()) {
      setMasterFlag(false);
      return Promise.resolve({ ok: false, reason: 'unsupported' });
    }
    if (Notification.permission === 'denied') {
      setMasterFlag(false);
      return Promise.resolve({ ok: false, reason: 'denied' });
    }
    // MUST invoke Notification.requestPermission() synchronously inside the user gesture before any await
    let req;
    try {
      req = Notification.permission === 'granted'
        ? Promise.resolve('granted')
        : Promise.resolve(Notification.requestPermission());
    } catch {
      setMasterFlag(false);
      return Promise.resolve({ ok: false, reason: 'unsupported' });
    }
    return req.then(async perm => {
      if (perm !== 'granted') {
        setMasterFlag(false);
        return { ok: false, reason: perm === 'denied' ? 'denied' : 'dismissed' };
      }
      setMasterFlag(true);
      await ensureSW();
      await ensureSubscription();
      syncAppBadge();
      return { ok: true, reason: 'granted' };
    }).catch(() => {
      setMasterFlag(false);
      return { ok: false, reason: 'error' };
    });
  }

  async function disablePush() {
    setMasterFlag(false);
    try {
      const reg = await ensureSW();
      const sub = await reg?.pushManager?.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe().catch(() => {});
        if (hasBackend()) {
          await fetch(apiUrl('/push/subscribe'), {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint }),
          }).catch(() => {});
        }
      }
    } catch { /* silent */ }
    clearPushUnread();
    syncAppBadge(0);
    return { ok: true };
  }

  function handleMasterToggle(input) {
    if (!input) return;
    if (input.checked) {
      // Called synchronously from the checkbox change user gesture
      enablePush().then(res => {
        if (res.ok) {
          if (typeof toast === 'function') toast(T('Notifiche attivate'));
        } else {
          input.checked = false;
          if (res.reason === 'ios-install') {
            if (typeof openSheet === 'function') {
              openSheet(`<h3>${T('Notifiche su iPhone')}</h3><p>${T('Su iOS le notifiche funzionano solo dall\'app nella schermata Home. In Safari tocca')} <strong>${T('Condividi')}</strong> <i class="ph-light ph-export"></i>${T(', poi')} <strong>${T('Aggiungi alla schermata Home')}</strong>.</p>`);
            } else if (typeof toast === 'function') {
              toast(T('Aggiungi NOVAE alla schermata Home per attivare le notifiche'));
            }
          } else if (res.reason === 'denied') {
            if (typeof toast === 'function') toast(T('Notifiche bloccate: riattivale nelle impostazioni del dispositivo'));
          } else if (res.reason === 'unsupported') {
            if (typeof toast === 'function') toast(T('Notifiche non supportate da questo browser'));
          }
        }
        if (typeof cur !== 'undefined' && cur.name === 'impostazioni' && typeof refresh === 'function') refresh();
      });
    } else {
      disablePush().then(() => {
        if (typeof toast === 'function') toast(T('Notifiche disattivate'));
        if (typeof cur !== 'undefined' && cur.name === 'impostazioni' && typeof refresh === 'function') refresh();
      });
    }
  }

  /* ---------------- App Badge API ---------------- */
  function unreadTotal() {
    const msgs = typeof THREADS !== 'undefined' ? THREADS.reduce((s, t) => s + (t.unread || 0), 0) : 0;
    const notifs = !store.get('novae.notif') ? 2 : 0;
    const pushed = +store.get(UNREAD_KEY) || 0;
    return msgs + notifs + pushed;
  }
  function bumpPushUnread(delta = 1) {
    const next = Math.max(0, (+store.get(UNREAD_KEY) || 0) + delta);
    if (next) store.set(UNREAD_KEY, String(next)); else store.del(UNREAD_KEY);
  }
  function clearPushUnread() {
    store.del(UNREAD_KEY);
  }
  function syncAppBadge(override) {
    try {
      if (!('setAppBadge' in navigator)) return;
      const count = typeof override === 'number' ? override : (isMasterEnabled() ? unreadTotal() : 0);
      if (count > 0) navigator.setAppBadge(count).catch(() => {});
      else navigator.clearAppBadge?.().catch(() => {});
    } catch { /* unsupported */ }
  }

  /* ---------------- Seen in the app: off the phone ---------------- */
  // The notifications already on the phone go away once you've seen them in the app: all of them when you open
  // Notifiche, the ones about a page (same post, chat or profile) when you open that page.
  const pageOf = url => url.split('/').slice(0, 2).join('/');
  async function closeShown(match) {
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      const list = (await reg?.getNotifications?.()) || [];
      const done = list.filter(n => !match || match(n.data?.url || ''));
      done.forEach(n => n.close());
      return done.length;
    } catch { return 0; } // no service worker or no getNotifications: nothing to close
  }
  async function seenAll() {
    await closeShown();
    clearPushUnread();
    syncAppBadge();
  }
  async function seenPage(hash = location.hash) {
    const n = await closeShown(url => pageOf(url) === pageOf(hash));
    if (n) { bumpPushUnread(-n); syncAppBadge(); }
  }
  addEventListener('hashchange', () => seenPage());
  seenPage(); // opened straight on a page, e.g. from a notification

  /* ---------------- Local SW notification & unified event dispatcher ---------------- */
  async function showLocal(ev, payload) {
    const built = ev.build(payload || {});
    const title = T(built.title);
    const body = T(built.body);
    const url = built.url || '#scopri';
    const opts = {
      body,
      icon: PUSH_ICON,
      badge: PUSH_ICON,
      tag: `novae-${ev.id}-${Date.now()}`,
      data: { url, eventId: ev.id },
    };
    try {
      const reg = await ensureSW();
      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(title, opts);
        bumpPushUnread(1);
        syncAppBadge();
        return { ok: true, via: 'sw' };
      }
    } catch (err) {
      lastSwError = err?.message || String(err);
      console.warn('[NOVAE Push] showNotification fallita:', lastSwError);
    }
    // Desktop fallback when local dev server blocks SW registration (e.g. Windows python http.server serving text/plain)
    if (!isIOS() && typeof Notification === 'function' && Notification.permission === 'granted') {
      try {
        const n = new Notification(title, { body, icon: PUSH_ICON, tag: opts.tag });
        n.onclick = () => {
          try { window.focus(); } catch { /* ignore */ }
          clearPushUnread();
          syncAppBadge();
          const target = url.startsWith('#') ? url : '#' + url;
          if (location.hash === target) { if (typeof route === 'function') route(); }
          else location.hash = target;
          n.close();
        };
        bumpPushUnread(1);
        syncAppBadge();
        return { ok: true, via: 'window', swError: lastSwError };
      } catch { /* fallback blocked */ }
    }
    return { ok: false, reason: /mime/i.test(lastSwError) ? 'sw-mime' : 'sw-unavailable', swError: lastSwError };
  }

  async function notifyEvent(eventId, payload = {}, opts = {}) {
    try {
      const ev = EVENT_MAP[eventId];
      if (!ev) return { ok: false, reason: 'unknown-event' };
      if (!isMasterEnabled()) return { ok: false, reason: 'master-off' };
      if (!isEventEnabled(eventId)) return { ok: false, reason: 'event-off' };

      const forceLocalTest = !!opts.forceLocalTest;
      const actorId = opts.actorId || 'me';
      const recipients = Array.isArray(opts.recipients)
        ? opts.recipients.filter(Boolean)
        : (opts.recipientId ? [opts.recipientId] : []);

      // Never self-notify locally unless explicitly requested via manual test mode
      const shouldShowLocal = forceLocalTest || (recipients.includes('me') && actorId !== 'me');
      if (shouldShowLocal) {
        return await showLocal(ev, payload);
      }

      if (hasBackend() && recipients.length) {
        await dispatchToBackend(eventId, payload, recipients, actorId, ev.build(payload));
        return { ok: true, via: 'backend' };
      }
      return { ok: false, reason: 'not-local-recipient' };
    } catch {
      return { ok: false, reason: 'error' };
    }
  }

  /* TEST-PUSH-UI-START */
  async function sendTest(eventId) {
    const id = EVENT_MAP[eventId] ? eventId : 'E1';
    const ev = EVENT_MAP[id];
    if (!isMasterEnabled()) {
      if (typeof toast === 'function') toast(T('Attiva prima Notifiche Novae'));
      return { ok: false, reason: 'master-off' };
    }
    if (!isEventEnabled(id)) {
      if (typeof toast === 'function') toast(T('Attiva il sotto-toggle per questo evento'));
      return { ok: false, reason: 'event-off' };
    }
    const res = await notifyEvent(id, ev.sample(), { forceLocalTest: true });
    if (typeof toast === 'function') {
      if (res.ok && res.via === 'sw') toast(T('Notifica di test inviata'));
      else if (res.ok && res.via === 'window') toast(T('Notifica inviata (fallback: avvia il server con MIME text/javascript per il SW)'));
      else if (res.reason === 'sw-mime') toast(T('Server locale serve sw.js come text/plain: usa text/javascript'));
      else toast(T('Service worker non ancora pronto: riprova'));
    }
    return res;
  }
  /* TEST-PUSH-UI-END */

  /* ---------------- Service Worker messages (deep-link click & subscription renewal) ---------------- */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', e => {
      const msg = e.data;
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === 'NOVAE_NAVIGATE' && typeof msg.hash === 'string') {
        clearPushUnread();
        syncAppBadge();
        const target = msg.hash.startsWith('#') ? msg.hash : '#' + msg.hash;
        if (location.hash === target) { if (typeof route === 'function') route(); }
        else location.hash = target;
      } else if (msg.type === 'NOVAE_SUBSCRIPTION_CHANGED' && msg.subscription) {
        sendSubscriptionToBackend(msg.subscription, getPrefs());
      }
    });
  }

  window.NovaePush = {
    config: NOVAE_PUSH_CONFIG,
    events: EVENTS,
    isIOS,
    isStandalone,
    hasApis,
    hasBackend,
    getStatus,
    isMasterEnabled,
    getPrefs,
    isEventEnabled,
    setEventPref,
    enablePush,
    disablePush,
    handleMasterToggle,
    notifyEvent,
    /* TEST-PUSH-UI-START */
    sendTest,
    /* TEST-PUSH-UI-END */
    syncAppBadge,
    clearPushUnread,
    seenAll,
  };
})();
