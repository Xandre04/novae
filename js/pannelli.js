/* NOVAE · Search, bottom sheets and toasts, the three-bars menu, reports and the legal pages.
   The js/*.js files are plain scripts that share one scope, loaded in order by index.html. */
'use strict';

/* ---------------- Search ---------------- */
function openSearch() {
  $('#search').hidden = false;
  $('#q').value = '';
  renderResults('');
  setTimeout(() => $('#q').focus(), 30);
}
function renderResults(q) {
  q = q.trim().toLowerCase();
  const has = s => s.toLowerCase().includes(q) || T(s).toLowerCase().includes(q);
  const works = WORKS.filter(w => !q || has(w.t) || has(w.disc) || has(ARTISTS[w.a].country)).slice(0, 8);
  const artists = AIDS.filter(id => !q || has(ARTISTS[id].name) || has(ARTISTS[id].country)).slice(0, 5);
  const recentHtml = !q && recent.length
    ? `<h3>Recenti</h3><div class="recent">${recent.map(r => `<button class="pill" data-act="recent" data-v="${r.replace(/"/g, '&quot;')}">${r.replace(/</g, '&lt;')}</button>`).join('')}<button class="recent-clear" data-act="recent-clear">Cancella</button></div>`
    : '';
  const hint = '<p class="kbd-hint">Premi <kbd>/</kbd> ovunque per cercare, <kbd>Esc</kbd> per chiudere.</p>';
  $('#results').innerHTML = recentHtml + ((!works.length && !artists.length)
    ? `<div class="empty"><strong>Nessun risultato</strong><p>Prova con un titolo, un nome o un paese.</p></div>`
    : `${artists.length ? `<h3>Artisti</h3>${artists.map(id => `<a class="sr" href="#artista/${id}"><img class="round" src="${avatar(id)}" alt=""><div>${ARTISTS[id].name}<span>${ARTISTS[id].country}</span></div></a>`).join('')}` : ''}
       ${works.length ? `<h3>Opere</h3>${works.map(w => `<a class="sr" href="#opera/${w.id}"><img src="${pic(w.id, 120, 120)}" alt=""><div>${w.t}<span>${ARTISTS[w.a].name}, ${w.disc.toLowerCase()}</span></div></a>`).join('')}` : ''}`) + hint;
}

/* ---------------- Sheet + toast ---------------- */
let sheetT, sheetOpener = null;
// The phone's back button closes the open sheet or preview instead of leaving the page:
// opening one adds a history entry, closing it from the UI takes that entry away again.
let backClose = null, afterBack = null;
function holdBack(close) { if (!backClose) history.pushState({ overlay: 1 }, ''); backClose = close; }
function releaseBack(then) {
  const held = backClose; backClose = null;
  if (held && history.state?.overlay) { afterBack = then; history.back(); } else then?.();
}
addEventListener('popstate', e => {
  if (backClose) { const close = backClose; backClose = null; close(); return; } // back pressed: close the overlay
  if (afterBack) { const then = afterBack; afterBack = null; then(); return; } // our own history.back() finished
  if (e.state?.overlay) history.back(); // an entry left behind by a sheet that closed because the page changed
});
let sheetUp = false, sheetRaf = 0;
function openSheet(html) {
  clearTimeout(sheetT); // a pending close must not hide the sheet we are opening now
  if (!sheetUp) sheetOpener = document.activeElement;
  $('#sheetBody').innerHTML = html;
  $('#sheet').hidden = false; sheetUp = true;
  cancelAnimationFrame(sheetRaf);
  sheetRaf = requestAnimationFrame(() => {
    $('#sheet').classList.add('open'); $('#sheetScrim').classList.add('open');
    // with a mouse/keyboard, focus the first field so you can type right away (on phones, don't pop the keyboard unasked)
    const field = $('#sheetBody input:not([type=file]), #sheetBody textarea');
    if (field && matchMedia('(hover: hover)').matches) field.focus({ preventScroll: true });
  });
  holdBack(closeSheet);
}
// drag the sheet down to close it, like a native bottom sheet (only from the top of its content)
{
  const sheet = $('#sheet');
  let drag = null;
  sheet.addEventListener('touchstart', e => {
    if (drag || e.touches.length > 1) return; // a second finger must not make it jump
    drag = sheet.scrollTop <= 0 && !e.target.closest('textarea, .notifs, .sig-pad') ? { y: e.touches[0].clientY, dy: 0, t: performance.now() } : null;
  }, { passive: true });
  sheet.addEventListener('touchmove', e => {
    if (!drag) return;
    const raw = e.touches[0].clientY - drag.y;
    if (!raw) return;
    e.preventDefault(); // no page bounce while dragging the sheet
    drag.dy = raw > 0 ? raw : -Math.sqrt(-raw) * 2; // dragging up: friction instead of a hard stop
    sheet.style.transition = 'none';
    sheet.style.transform = `translate(-50%, ${drag.dy}px)`;
  }, { passive: false });
  sheet.addEventListener('touchend', () => {
    if (!drag) return;
    const speed = drag.dy / Math.max(1, performance.now() - drag.t); // px per ms
    const close = drag.dy > 90 || (drag.dy > 20 && speed > .5); // far enough, or a real flick (500 px/s)
    sheet.style.transition = sheet.style.transform = '';
    if (close) closeSheet();
    drag = null;
  });
}
// then: what to do once the sheet is closed (e.g. go to a page), after the back-button entry is gone
function closeSheet(then) {
  if (typeof then !== 'function') then = null;
  if (!sheetUp) return then?.();
  sheetUp = false; cancelAnimationFrame(sheetRaf); // closed before it finished opening: don't open it afterwards
  $('#sheet').classList.remove('open'); $('#sheetScrim').classList.remove('open');
  sheetT = setTimeout(() => { $('#sheet').hidden = true; }, 400);
  sheetOpener?.focus?.({ preventScroll: true }); // give focus back to what opened it
  sheetOpener = null;
  releaseBack(then);
}
/* ---------------- Three bars in the dock: Notifiche, Crea, Codice QR, Segnala un problema ---------------- */
const REPO_ISSUES = 'https://github.com/Xandre04/novae/issues/new';
const markBars = () => {
  $('.dock-menu').classList.toggle('unread', !store.get('novae.notif'));
  window.NovaePush?.syncAppBadge();
};
function openBars() {
  const fresh = !store.get('novae.notif');
  openSheet(`<h3>Menu</h3><div class="action-list">
    <button data-act="notifs"><i class="ph-light ph-bell"></i>Notifiche${fresh ? '<span class="bars-new" aria-label="Nuove notifiche"></span>' : ''}</button>
    <button data-act="create"><i class="ph-light ph-plus-circle"></i>Crea</button>
    <button data-act="my-qr"><i class="ph-light ph-qr-code"></i>Codice QR</button>
    <button data-act="problem"><i class="ph-light ph-warning-circle"></i>Segnala un problema</button>
  </div>`);
}
// sample notifications, like the rest of the alpha's data
function openNotifs() {
  const fresh = !store.get('novae.notif');
  const [w1, w2] = FEED.filter(canSee), mine = MINE[0];
  const items = [
    ['giulia', `ha recensito <em>${(mine || w1).t}</em>`, '#post/' + (mine || w1).id, '12 min'],
    ['aiko', 'ha iniziato a seguirti', profileHref('aiko'), '1 h'],
    ...(mine ? [['nicolo', `ha messo mi piace a <em>${mine.t}</em>`, '#post/' + mine.id, '3 h']] : []),
    [w2.a, `ha pubblicato <em>${w2.t}</em>`, '#post/' + w2.id, '5 h'],
    ['teo', 'ha iniziato a seguirti', profileHref('teo'), '1 g'],
  ];
  openSheet(`<h3>Notifiche</h3><div class="notifs">${items.map(([aid, text, href, time], i) => `<a class="notif ${fresh && i < 2 ? 'new' : ''}" href="${href}" data-act="sheet-close">
    <img class="notif-ava" src="${avatar(aid)}" alt=""><p><strong>${ARTISTS[aid].name}</strong> ${text}<small>${time}</small></p></a>`).join('')}</div>`);
  store.set('novae.notif', '1');
  window.NovaePush?.clearPushUnread();
  markBars();
}
function openCreate() {
  const type = typeOf('me');
  openSheet(`<h3>Crea</h3><div class="action-list">${type === 'critico'
    ? '<a href="#scopri" data-act="sheet-close"><i class="nstar" aria-hidden="true"></i>Scrivi una recensione</a>'
    : `<button data-act="publish"><i class="ph-light ph-image"></i>${type === 'utente' ? 'Pubblica per i follower' : 'Nuova opera'}</button>
       ${type === 'artista' ? '<button data-act="new-col"><i class="nstar" aria-hidden="true"></i>Nuova costellazione</button>' : ''}`}</div>`);
}
// Invites (alpha rules, see Regole della community): 3 per person, single use, valid 14 days; an expired code is replaced
const INVITES = 3, INVITE_DAYS = 14;
function myCode() {
  let code = store.get('novae.mycode'), ts = +store.get('novae.mycode.ts') || 0;
  if (!code || Date.now() - ts > INVITE_DAYS * 864e5) {
    code = 'NVE-' + Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
    ts = Date.now();
    store.set('novae.mycode', code); store.set('novae.mycode.ts', String(ts));
  }
  return code;
}
const inviteExpiry = () => new Date((+store.get('novae.mycode.ts') || Date.now()) + INVITE_DAYS * 864e5)
  .toLocaleDateString('it-IT', { day: 'numeric', month: 'long' }); // Italian on purpose: i18n.js translates the month
function openMyQR() {
  openSheet(`<h3>Codice QR</h3><div class="my-qr">
    <canvas id="myQr" width="528" height="528" aria-label="Il tuo codice QR di invito"></canvas>
    <strong>${myCode()}</strong>
    <p>Fallo inquadrare con la fotocamera: si apre NOVAE con il codice già scritto. Vale per una persona, fino al ${inviteExpiry()}.</p>
    <p class="report-note">Hai ${INVITES} inviti. Chi entra con il tuo codice risulta invitato da te.</p>
    <button class="btn-accent" data-act="invite-share">Condividi invito</button>
    <button class="btn-ghost" data-act="card"><i class="ph-light ph-identification-card"></i>Biglietto da visita</button>
  </div>`);
  drawInviteQR($('#myQr'), inviteLink(myCode()));
}

/* ---------------- Biglietto da visita: name, profile type, your best work and the invite QR on one image ---------------- */
const loadImg = src => new Promise(res => {
  if (!src) return res(null);
  const im = new Image();
  if (/^https?:/.test(src)) im.crossOrigin = 'anonymous'; // picsum allows it; without it the canvas could not be saved
  im.onload = () => res(im); im.onerror = () => res(null);
  im.src = src;
});
// a copy of a one-colour drawing (the signature, stored in black) in another colour
function inkCanvas(im, color) {
  const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
  const x = c.getContext('2d'); x.drawImage(im, 0, 0);
  x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
  return c;
}
function openCard() {
  openSheet(`<h3>Biglietto da visita</h3><div class="card-wrap">
    <canvas id="cardCv" width="1080" height="1350" role="img" aria-label="Il tuo biglietto da visita"></canvas>
    <p class="x-note">Da stampare o da mettere nelle storie. Il QR fa entrare su NOVAE con il tuo invito.</p>
    <button class="btn-accent" data-act="card-save" disabled><i class="ph-light ph-download-simple"></i>Salva immagine</button>
  </div>`);
  drawCard($('#cardCv')).then(() => { const b = $('[data-act="card-save"]'); if (b) b.disabled = false; });
}
async function drawCard(c) {
  const x = c.getContext('2d'), W = c.width, H = c.height, me = ARTISTS.me;
  const mine = WORKS.filter(w => authorOf(w, 'me'));
  const best = mine.slice().sort((p, q) => likeCount(q) - likeCount(p) || (q.ts || 0) - (p.ts || 0))[0];
  const discs = mine.reduce((m, w) => (m[w.disc] = (m[w.disc] || 0) + 1, m), {});
  const disc = Object.keys(discs).sort((p, q) => discs[q] - discs[p])[0];
  const qr = document.createElement('canvas'); qr.width = qr.height = 600;
  const [cover, ava, mark, star] = await Promise.all([loadImg(best?.img || profile.banner), loadImg(avatar('me')), loadImg('assets/svg/wordmark.svg'), loadImg(STAR_SRC),
    drawInviteQR(qr, inviteLink(myCode())), document.fonts.load('600 40px Outfit')]);
  const font = (size, weight = 400) => `${weight} ${size}px Outfit, system-ui, sans-serif`;
  x.fillStyle = '#141414'; x.fillRect(0, 0, W, H);
  // the work on top, cropped to fill, fading into the card; no work yet: a red glow
  const top = 780;
  if (cover) {
    const k = Math.max(W / cover.width, top / cover.height), cw = cover.width * k, ch = cover.height * k;
    x.drawImage(cover, (W - cw) / 2, (top - ch) / 2, cw, ch);
  } else {
    const glow = x.createRadialGradient(W * .7, 160, 0, W * .7, 160, 760);
    glow.addColorStop(0, 'rgba(179,18,47,.55)'); glow.addColorStop(1, 'rgba(179,18,47,0)');
    x.fillStyle = glow; x.fillRect(0, 0, W, top);
  }
  let g = x.createLinearGradient(0, top - 380, 0, top); g.addColorStop(0, 'rgba(20,20,20,0)'); g.addColorStop(1, '#141414');
  x.fillStyle = g; x.fillRect(0, top - 380, W, 381);
  g = x.createLinearGradient(0, 0, 0, 220); g.addColorStop(0, 'rgba(20,20,20,.7)'); g.addColorStop(1, 'rgba(20,20,20,0)');
  x.fillStyle = g; x.fillRect(0, 0, W, 220);
  if (mark) x.drawImage(mark, 64, 64, 240, 240 * mark.height / mark.width);
  if (best) { x.font = font(26); x.fillStyle = 'rgba(236,235,230,.75)'; x.textAlign = 'right'; x.fillText(best.t, W - 64, top - 40, 560); x.textAlign = 'left'; }
  // avatar in a ring
  const A = 170, ax = 64, ay = top - 90;
  x.save(); x.beginPath(); x.arc(ax + A / 2, ay + A / 2, A / 2, 0, 7); x.fillStyle = '#0F0F0F'; x.fill(); x.clip();
  if (ava) x.drawImage(ava, ax + 14, ay + 14, A - 28, A - 28);
  x.restore();
  x.lineWidth = 5; x.strokeStyle = '#ecebe6'; x.beginPath(); x.arc(ax + A / 2, ay + A / 2, A / 2, 0, 7); x.stroke();
  // name (shrinks to fit), type and category, handle
  let size = 84; x.font = font(size, 600);
  while (size > 44 && x.measureText(me.name).width > W - 128) x.font = font(size -= 4, 600);
  x.fillStyle = '#ecebe6'; x.fillText(me.name, 64, top + 170, W - 128);
  if (star) x.drawImage(star, 64, top + 213, 30, 30 * star.height / star.width);
  x.font = font(38); x.fillStyle = '#d61c40';
  x.fillText([T(TYPES[typeOf('me')].label), disc && T(disc)].filter(Boolean).join(' · '), 108, top + 243, W - 64 - 320 - 24 - 108);
  x.font = font(34); x.fillStyle = '#85837e'; x.fillText('@' + me.handle, 64, top + 300, W - 64 - 320 - 24 - 64); // stays clear of the QR
  const sig = await loadImg(profile.signature); // your signature in white, between the handle and the QR caption
  if (sig) { const k = Math.min(360 / sig.width, 70 / sig.height); x.drawImage(inkCanvas(sig, '#ecebe6'), 64, top + 328, sig.width * k, sig.height * k); }
  // the QR, bottom right, on its light plate so cameras read it
  const Q = 320, qx = W - 64 - Q, qy = H - 64 - Q;
  x.save(); x.beginPath(); x.roundRect(qx, qy, Q, Q, 22); x.clip(); x.drawImage(qr, qx, qy, Q, Q); x.restore();
  x.font = font(32, 600); x.fillStyle = '#ecebe6';
  x.fillText(T('Inquadra il codice'), 64, H - 118); x.fillText(T('per entrare su NOVAE'), 64, H - 74);
  x.font = font(28); x.fillStyle = 'rgba(236,235,230,.75)'; x.textAlign = 'right'; x.fillText(T('il social di chi crea'), W - 64, 106); x.textAlign = 'left';
}
async function saveCard() {
  const blob = await new Promise(r => $('#cardCv').toBlob(r, 'image/png'));
  const file = new File([blob], 'novae-biglietto.png', { type: 'image/png' });
  // on phones the share sheet has "Salva immagine"; elsewhere a normal download
  if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file] }); } catch { /* closed */ } return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ---------------- Mostra: works as an exhibition, one per wall, with a museum label ---------------- */
// From a profile (its works) or from Sfoglia (the feed, starting on the tapped work). Swipe or use the arrow keys;
// the wall takes the colour of the work on it; a tap on the empty wall, Esc or the back button closes it.
function openShow({ works, name, start = 0 }) {
  if (!works.length) return;
  const many = new Set(works.map(w => w.a)).size > 1; // the feed: say who made each work on its label
  const box = document.createElement('div');
  box.className = 'mostra'; // not 'show': the toast uses that class box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', `${T('Mostra')}: ${name}`); box.tabIndex = -1;
  box.innerHTML = `<header class="show-head"><p><strong>${name}</strong><span><b>${works.length}</b> ${label(works.length, 'opere')}</span></p><button class="icon-btn" data-close aria-label="Chiudi"><i class="ph-light ph-x"></i></button></header>
    <div class="show-wall">${works.map((w, i) => `<figure class="show-room" data-i="${i}">
      <div class="show-frame"><div class="show-pic"><img src="${w.img}" alt="${w.t}" ${i > 1 ? 'loading="lazy"' : ''} decoding="async" draggable="false"></div></div>
      <figcaption><strong>${w.t}</strong>${many ? `<em>${[w.a, w.co].filter(Boolean).map(a => ARTISTS[a].name).join(' e ')}</em>` : ''}<span>${T(w.disc)}, ${w.year}</span>${authorOf(w, 'me') && profile.signature ? `<img class="sig" src="${profile.signature}" alt="Firma">` : ''}<small>${i + 1} / ${works.length}</small></figcaption>
    </figure>`).join('')}</div>
    <p class="show-hint" aria-hidden="true"><i class="ph-light ph-magnifying-glass-plus"></i>${works.length > 1 ? 'Scorri per la prossima, doppio tocco per avvicinarti' : 'Doppio tocco per avvicinarti'}</p>`;
  const wall = $('.show-wall', box);
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    tintOf(works[en.target.dataset.i].img).then(c => c && box.style.setProperty('--tint', `rgb(${c})`));
    if (zoom.pic && !en.target.contains(zoom.pic)) zoom.reset(); // moved on: the previous work goes back to normal
  }), { root: wall, threshold: .6 });
  $$('.show-room', box).forEach(r => io.observe(r));
  // Zoom: double tap (or double click) to get close to the work, pinch with two fingers, drag to look around
  const zoom = {
    pic: null, z: 1, tx: 0, ty: 0,
    apply(anim) {
      const im = this.pic.firstElementChild, mx = (this.z - 1) * this.pic.clientWidth / 2, my = (this.z - 1) * this.pic.clientHeight / 2;
      this.tx = Math.max(-mx, Math.min(mx, this.tx)); this.ty = Math.max(-my, Math.min(my, this.ty)); // never past the edges
      im.style.transition = anim && !reduceMotion ? 'transform .3s var(--ease-out)' : 'none';
      im.style.transform = this.z > 1 ? `translate(${this.tx}px, ${this.ty}px) scale(${this.z})` : '';
      box.classList.toggle('zoomed', this.z > 1);
    },
    at(z, cx, cy, anim) { // zoom to z keeping the point under the finger where it is
      const r = this.pic.getBoundingClientRect(), px = cx - r.left - r.width / 2, py = cy - r.top - r.height / 2;
      z = Math.max(1, Math.min(4, z));
      this.tx = px - (px - this.tx) * z / this.z; this.ty = py - (py - this.ty) * z / this.z; this.z = z;
      this.apply(anim);
    },
    reset() { if (this.pic && this.z > 1) { this.z = 1; this.tx = this.ty = 0; this.apply(true); } },
  };
  const ptrs = new Map();
  let pinch = null, pan = null, tap = { t: 0, x: 0, y: 0 };
  wall.addEventListener('pointerdown', e => {
    const pic = e.target.closest('.show-pic');
    if (!pic) return;
    if (zoom.pic !== pic) { zoom.reset(); zoom.pic = pic; }
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: zoom.z }; pan = null; }
    else if (zoom.z > 1) pan = { x: e.clientX, y: e.clientY, tx: zoom.tx, ty: zoom.ty };
    if (zoom.z > 1 || ptrs.size === 2) try { pic.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
  });
  wall.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId);
    if (!p) return;
    p.x = e.clientX; p.y = e.clientY;
    if (pinch && ptrs.size === 2) { const [a, b] = [...ptrs.values()]; zoom.at(pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d, (a.x + b.x) / 2, (a.y + b.y) / 2); }
    else if (pan) { zoom.tx = pan.tx + e.clientX - pan.x; zoom.ty = pan.ty + e.clientY - pan.y; zoom.apply(); }
  });
  const lift = e => {
    const p = ptrs.get(e.pointerId);
    if (!p) return;
    ptrs.delete(e.pointerId);
    if (ptrs.size < 2) pinch = null;
    if (!ptrs.size) pan = null;
    if (e.type !== 'pointerup' || Math.hypot(p.x - p.x0, p.y - p.y0) > 12) return; // a drag, not a tap
    const now = performance.now();
    if (now - tap.t < 320 && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 40) { zoom.at(zoom.z > 1 ? 1 : 2.5, e.clientX, e.clientY, true); tap.t = 0; }
    else tap = { t: now, x: e.clientX, y: e.clientY };
  };
  wall.addEventListener('pointerup', lift); wall.addEventListener('pointercancel', lift);
  const close = () => { io.disconnect(); box.classList.add('out'); setTimeout(() => box.remove(), 200); removeEventListener('keydown', key); releaseBack(); };
  const key = e => {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') wall.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * wall.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  $('[data-close]', box).addEventListener('click', close); addEventListener('keydown', key);
  box.addEventListener('click', e => { if (e.target.matches('.show-room, .show-wall')) close(); });
  document.body.append(box); wall.scrollLeft = start * wall.clientWidth; box.focus(); holdBack(close);
}
function openProblem() {
  openSheet(`<h3>Segnala un problema</h3>
    <form class="pub" id="problemForm" novalidate>
      <div class="field"><label for="problemText">Cosa è successo?</label><textarea id="problemText" maxlength="1000" rows="4" placeholder="Cosa stavi facendo e cosa non ha funzionato"></textarea></div>
      <p class="x-note">Si apre GitHub con il testo già scritto: serve un account e la segnalazione è pubblica.</p>
      <p class="pub-err" id="problemErr" role="alert"></p>
      <button class="btn-accent" type="submit">Continua su GitHub</button>
    </form>`);
}
function submitProblem() {
  const text = $('#problemText').value.trim();
  if (!text) { $('#problemErr').textContent = 'Scrivi cosa è successo.'; $('#problemText').focus(); return; }
  const body = `${text}\n\n---\nSchermata: ${location.hash || '#hub'}`;
  window.open(`${REPO_ISSUES}?title=${encodeURIComponent(text.slice(0, 60))}&body=${encodeURIComponent(body)}`, '_blank', 'noopener');
  closeSheet();
}

/* ---------------- Segnala: a report with a reason ---------------- */
const REPORT_REASONS = [
  ['spam', 'Spam o truffa'],
  ['odio', 'Insulti, odio o molestie'],
  ['violenza', 'Violenza o minacce'],
  ['sesso', 'Contenuto sessuale esplicito'],
  ['copia', 'Non è sua: opera copiata da qualcun altro'],
  ['ia', 'Generata con IA senza dirlo'],
  ['privacy', 'Mostra dati personali di qualcuno'],
  ['altro', 'Altro'],
];
function openReport(w) {
  openSheet(`<h3>Segnala “${w.t}”</h3>
    <form class="pub" id="reportForm" data-id="${w.id}" novalidate>
      <div class="report-reasons" role="radiogroup" aria-label="Motivo">${REPORT_REASONS.map(([v, l]) =>
        `<label><input type="radio" name="reason" value="${v}"><span>${l}</span></label>`).join('')}</div>
      <div class="field"><label for="reportText">Dettagli (facoltativo)</label><textarea id="reportText" maxlength="500" rows="2" placeholder="Cosa c’è che non va?"></textarea></div>
      <label class="report-hide"><input type="checkbox" id="reportHide" checked><span>Non mostrarmi più questa opera</span></label>
      <p class="report-note">Chi pubblica non saprà che sei stato tu. Le <a href="#doc/regole">Regole della community</a> spiegano cosa succede dopo. Nell’alpha la segnalazione resta sul tuo telefono: arriverà ai moderatori quando ci sarà il server.</p>
      <p class="pub-err" id="reportErr" role="alert"></p>
      <button class="btn-accent" type="submit">Invia segnalazione</button>
    </form>`);
}
function submitReport(f) {
  const reason = f.querySelector('input[name=reason]:checked')?.value;
  if (!reason) { $('#reportErr').textContent = 'Scegli un motivo.'; return; }
  // ponytail: no server yet, so reports stay on this phone; with the backend they go to the moderators' queue
  const reports = readJSON('novae.reports', []);
  const reportText = $('#reportText').value.trim().slice(0, 500);
  reports.push({ id: f.dataset.id, reason, text: reportText, ts: Date.now() });
  store.set('novae.reports', JSON.stringify(reports));
  const rw = byId[f.dataset.id];
  window.NovaePush?.notifyEvent('E11', { workId: f.dataset.id, workTitle: rw?.t || '', reason, text: reportText }, { recipients: ['moderators'], actorId: 'me' });
  if ($('#reportHide').checked) { hidden.add(f.dataset.id); store.set('novae.hidden', JSON.stringify([...hidden])); }
  closeSheet();
  toast('Segnalazione salvata. Grazie');
  if (cur.name === 'scopri') refresh();
}

/* ---------------- Regole della community, Termini, Privacy (#doc/...) ---------------- */
// Drafts for the alpha: the [bracketed] parts are still to be decided, and a lawyer should read them before launch.
const DRAFT = '<p class="legal-draft">Bozza per l’alpha. Le parti tra [parentesi] sono da completare, e il testo va fatto rileggere a un legale prima del lancio.</p>';
const DOCS = {
  regole: { title: 'Regole della community', html: `
    <p>NOVAE è un posto per mostrare quello che crei e guardare quello che creano gli altri. Poche regole, perché resti un bel posto.</p>
    <h2>Cosa puoi pubblicare</h2>
    <ul>
      <li><strong>Solo opere tue</strong>, o di cui hai i diritti. Se è un lavoro a più mani, cita chi ha collaborato.</li>
      <li><strong>Se un’opera è fatta con l’IA, dillo</strong> nella descrizione.</li>
      <li><strong>Il nudo artistico è consentito</strong>; il contenuto sessuale esplicito no.</li>
      <li>Niente violenza gratuita, niente contenuti che incitano all’odio o al danno, verso sé o verso altri.</li>
    </ul>
    <h2>Come ci si tratta</h2>
    <ul>
      <li>Niente insulti, molestie, minacce o discriminazioni, nemmeno “per scherzo”.</li>
      <li><strong>I critici criticano l’opera, non la persona.</strong> Le stelle si danno al lavoro, non a chi l’ha fatto.</li>
      <li>Niente spam, niente truffe nel Mercato, niente account falsi.</li>
      <li>Non pubblicare dati personali di altri: indirizzi, numeri, foto private.</li>
    </ul>
    <h2>Inviti</h2>
    <p>Si entra solo su invito. Ogni persona ha <strong>3 inviti</strong>; ogni codice vale per una sola persona e per <strong>14 giorni</strong>. Inviti qualcuno? Ti fidi di lui: chi invita persone che violano le regole può perdere i suoi inviti.</p>
    <h2>Segnalazioni</h2>
    <p>Dai tre puntini di ogni opera puoi segnalarla scegliendo un motivo. Chi viene segnalato non sa chi è stato.</p>
    <p>Il team di moderazione guarda ogni segnalazione <strong>entro 48 ore</strong> e decide, a seconda della gravità:</p>
    <ol>
      <li><strong>Nessuna azione</strong>, se il contenuto rispetta le regole.</li>
      <li><strong>Avviso</strong> e richiesta di modifica (per esempio: dichiarare l’uso di IA).</li>
      <li><strong>Rimozione</strong> del contenuto.</li>
      <li><strong>Sospensione</strong> dell’account, da 7 giorni fino alla chiusura nei casi gravi o ripetuti.</li>
    </ol>
    <p>Minacce, contenuti illegali e materiale che coinvolge minori vengono rimossi subito e, quando serve, segnalati alle autorità.</p>
    <p>Pensi che una decisione sia sbagliata? Scrivi a [email del progetto]: una persona diversa da chi ha deciso la riguarderà.</p>` },
  termini: { title: 'Termini d’uso', html: DRAFT + `
    <p>Ultimo aggiornamento: [data]. Usando NOVAE accetti questi termini e le <a href="#doc/regole">Regole della community</a>.</p>
    <h2>1. Cos’è NOVAE</h2>
    <p>NOVAE è un social su invito per artisti, gestito da [nome del titolare o della società]. È in <strong>fase alpha</strong>: le funzioni possono cambiare o sparire, alcuni contenuti sono di esempio e il servizio può interrompersi.</p>
    <h2>2. Chi può usarlo</h2>
    <p>Devi avere almeno <strong>14 anni</strong> ed essere entrato con un invito valido. Un account a persona; sei responsabile di quello che succede con il tuo account e dei codici invito che dai.</p>
    <h2>3. Le tue opere restano tue</h2>
    <p>Pubblicando un’opera <strong>ne mantieni tutti i diritti</strong>. Concedi a NOVAE solo il permesso, gratuito e non esclusivo, di conservarla, mostrarla agli utenti e adattarne il formato (per esempio ridimensionare un’immagine) per far funzionare il servizio. Il permesso finisce quando la elimini, salvo le copie di sicurezza, che cancelliamo entro [30] giorni.</p>
    <p>Pubblichi solo opere di cui hai i diritti, e dichiari se sono fatte con l’IA. Non usiamo le tue opere per addestrare intelligenze artificiali né le cediamo a terzi.</p>
    <h2>4. Comportamento</h2>
    <p>Valgono le <a href="#doc/regole">Regole della community</a>. Possiamo rimuovere contenuti e sospendere o chiudere account che le violano.</p>
    <h2>5. Recensioni</h2>
    <p>Le recensioni dei critici sono opinioni personali dei loro autori, non di NOVAE.</p>
    <h2>6. Mercato e crediti</h2>
    <p>Nell’alpha i crediti non hanno valore reale e nel Mercato non si compra né si vende nulla. Le regole per gli acquisti veri arriveranno prima che siano attivi.</p>
    <h2>7. Responsabilità</h2>
    <p>Nei limiti consentiti dalla legge, NOVAE è fornito “così com’è” e non risponde di perdite di dati o interruzioni durante l’alpha. Restano salvi i tuoi diritti di consumatore.</p>
    <h2>8. Modifiche e legge</h2>
    <p>Se cambiamo questi termini te lo diciamo nell’app. Si applica la legge italiana; per i consumatori resta competente il giudice del luogo in cui vivono.</p>
    <p>Contatti: [email del progetto].</p>` },
  privacy: { title: 'Informativa privacy', html: DRAFT + `
    <p>Ultimo aggiornamento: [data]. Titolare del trattamento: [nome e cognome o società], [indirizzo], [email del progetto].</p>
    <h2>Oggi, nell’alpha</h2>
    <p><strong>NOVAE non ha ancora un server suo.</strong> Il profilo, le opere che pubblichi, i mi piace, i messaggi, le segnalazioni e il codice invito restano <strong>solo nel browser del tuo telefono o computer</strong> (archiviazione locale). Non li vediamo e non li riceviamo. Per cancellarli: Impostazioni → Esci, poi cancella i dati del sito dal browser.</p>
    <p>Quando apri l’app, alcuni servizi esterni ricevono il tuo indirizzo IP, come per qualsiasi sito:</p>
    <ul>
      <li><strong>GitHub Pages</strong>, che ospita l’app;</li>
      <li><strong>jsDelivr</strong>, che fornisce librerie, icone e la mappa del globo;</li>
      <li><strong>Google Fonts</strong>, che fornisce il carattere Outfit;</li>
      <li><strong>Picsum</strong>, che fornisce le immagini di esempio.</li>
    </ul>
    <p>“Segnala un problema” apre GitHub: lì il testo è pubblico e vale l’informativa di GitHub.</p>
    <p>Non usiamo cookie di profilazione o pubblicità.</p>
    <h2>Quando arriverà il server</h2>
    <p>Prima di attivarlo aggiorneremo questa pagina e te lo diremo nell’app. In breve, tratteremo:</p>
    <ul>
      <li><strong>dati dell’account</strong> (email, nome, nome utente, tipo di profilo, banner, bio) per farti usare il servizio;</li>
      <li><strong>i contenuti</strong> che pubblichi e i messaggi, per mostrarli a chi deve vederli;</li>
      <li><strong>chi ti ha invitato e chi inviti</strong>, per far funzionare gli inviti e la moderazione;</li>
      <li><strong>il paese</strong>, mai la città, per il globo di Novae, che potrai disattivare;</li>
      <li><strong>dati tecnici e segnalazioni</strong>, per sicurezza e moderazione.</li>
    </ul>
    <p>Base giuridica: il contratto (i Termini) per far funzionare NOVAE, il legittimo interesse per sicurezza e moderazione, il consenso per le notifiche. Conserviamo i dati finché hai l’account e li cancelliamo entro [30] giorni dalla chiusura. I fornitori saranno [server e fornitori, preferibilmente nell’UE].</p>
    <h2>I tuoi diritti</h2>
    <p>Puoi chiedere di vedere, correggere, scaricare o cancellare i tuoi dati, e opporti al loro uso, scrivendo a [email del progetto]. Puoi anche fare reclamo al Garante per la protezione dei dati personali (garanteprivacy.it).</p>
    <h2>Età</h2>
    <p>NOVAE è per chi ha almeno <strong>14 anni</strong>, l’età minima in Italia per usare da soli i servizi online.</p>` },
};
// English versions of the three pages (same drafts, same [placeholders])
const DRAFT_EN = '<p class="legal-draft">Alpha draft. The parts in [brackets] still need filling in, and a lawyer should review the text before launch.</p>';
const DOCS_EN = {
  regole: { title: 'Community rules', html: `
    <p>NOVAE is a place to show what you make and look at what others make. A few rules, so it stays a good place.</p>
    <h2>What you can post</h2>
    <ul>
      <li><strong>Only your own work</strong>, or work you hold the rights to. If several people made it, credit them.</li>
      <li><strong>If a work was made with AI, say so</strong> in the description.</li>
      <li><strong>Artistic nudity is allowed</strong>; explicit sexual content is not.</li>
      <li>No gratuitous violence, no content that encourages hate or harm, towards yourself or others.</li>
    </ul>
    <h2>How we treat each other</h2>
    <ul>
      <li>No insults, harassment, threats or discrimination, not even “as a joke”.</li>
      <li><strong>Critics critique the work, not the person.</strong> Stars go to the work, not to whoever made it.</li>
      <li>No spam, no scams in the Market, no fake accounts.</li>
      <li>Don’t post other people’s personal data: addresses, numbers, private photos.</li>
    </ul>
    <h2>Invites</h2>
    <p>You can only join with an invite. Everyone has <strong>3 invites</strong>; each code works for one person only and for <strong>14 days</strong>. Inviting someone means vouching for them: people who invite rule-breakers can lose their invites.</p>
    <h2>Reports</h2>
    <p>From the three dots on any work you can report it by choosing a reason. The person reported never finds out who reported them.</p>
    <p>The moderation team looks at every report <strong>within 48 hours</strong> and decides, depending on how serious it is:</p>
    <ol>
      <li><strong>No action</strong>, if the content follows the rules.</li>
      <li><strong>A warning</strong> and a request to change something (for example: say that AI was used).</li>
      <li><strong>Removal</strong> of the content.</li>
      <li><strong>Suspension</strong> of the account, from 7 days up to closing it for serious or repeated cases.</li>
    </ol>
    <p>Threats, illegal content and material involving minors are removed immediately and, when needed, reported to the authorities.</p>
    <p>Think a decision is wrong? Write to [project email]: someone other than the person who decided will look at it again.</p>` },
  termini: { title: 'Terms of use', html: DRAFT_EN + `
    <p>Last updated: [date]. By using NOVAE you accept these terms and the <a href="#doc/regole">Community rules</a>.</p>
    <h2>1. What NOVAE is</h2>
    <p>NOVAE is an invite-only social network for artists, run by [name of the owner or company]. It is in <strong>alpha</strong>: features can change or disappear, some content is sample content and the service may be interrupted.</p>
    <h2>2. Who can use it</h2>
    <p>You must be at least <strong>14 years old</strong> and have joined with a valid invite. One account per person; you are responsible for what happens with your account and for the invite codes you give out.</p>
    <h2>3. Your works stay yours</h2>
    <p>When you publish a work <strong>you keep all the rights to it</strong>. You only give NOVAE a free, non-exclusive permission to store it, show it to users and adapt its format (for example resizing an image) to run the service. The permission ends when you delete it, except for backup copies, which we delete within [30] days.</p>
    <p>Only publish works you hold the rights to, and say if they were made with AI. We don’t use your works to train artificial intelligence and we don’t hand them over to third parties.</p>
    <h2>4. Behaviour</h2>
    <p>The <a href="#doc/regole">Community rules</a> apply. We can remove content and suspend or close accounts that break them.</p>
    <h2>5. Reviews</h2>
    <p>Critics’ reviews are the personal opinions of their authors, not of NOVAE.</p>
    <h2>6. Market and credits</h2>
    <p>In the alpha, credits have no real value and nothing is bought or sold in the Market. The rules for real purchases will come before they are switched on.</p>
    <h2>7. Liability</h2>
    <p>As far as the law allows, NOVAE is provided “as is” and is not liable for lost data or interruptions during the alpha. Your consumer rights are not affected.</p>
    <h2>8. Changes and law</h2>
    <p>If we change these terms we’ll tell you in the app. Italian law applies; consumers can always go to the court where they live.</p>
    <p>Contact: [project email].</p>` },
  privacy: { title: 'Privacy policy', html: DRAFT_EN + `
    <p>Last updated: [date]. Data controller: [name or company], [address], [project email].</p>
    <h2>Today, in the alpha</h2>
    <p><strong>NOVAE doesn’t have its own server yet.</strong> Your profile, the works you publish, likes, messages, reports and your invite code stay <strong>only in the browser on your phone or computer</strong> (local storage). We don’t see them and we don’t receive them. To delete them: Settings → Log out, then clear the site’s data in your browser.</p>
    <p>When you open the app, a few outside services receive your IP address, as with any website:</p>
    <ul>
      <li><strong>GitHub Pages</strong>, which hosts the app;</li>
      <li><strong>jsDelivr</strong>, which serves libraries, icons and the globe map;</li>
      <li><strong>Google Fonts</strong>, which serves the Outfit typeface;</li>
      <li><strong>Picsum</strong>, which serves the sample images.</li>
    </ul>
    <p>“Report a problem” opens GitHub: there the text is public and GitHub’s privacy policy applies.</p>
    <p>We don’t use profiling or advertising cookies.</p>
    <h2>When the server arrives</h2>
    <p>Before switching it on we’ll update this page and tell you in the app. In short, we will process:</p>
    <ul>
      <li><strong>account data</strong> (email, name, username, profile type, banner, bio) so you can use the service;</li>
      <li><strong>the content</strong> you publish and your messages, to show them to the people meant to see them;</li>
      <li><strong>who invited you and who you invite</strong>, to run invites and moderation;</li>
      <li><strong>your country</strong>, never your city, for the Novae globe, which you’ll be able to turn off;</li>
      <li><strong>technical data and reports</strong>, for security and moderation.</li>
    </ul>
    <p>Legal basis: the contract (the Terms) to run NOVAE, legitimate interest for security and moderation, consent for notifications. We keep data while you have an account and delete it within [30] days of closing it. Providers will be [server and providers, preferably in the EU].</p>
    <h2>Your rights</h2>
    <p>You can ask to see, correct, download or delete your data, and object to its use, by writing to [project email]. You can also complain to the Italian data protection authority (garanteprivacy.it).</p>
    <h2>Age</h2>
    <p>NOVAE is for people aged at least <strong>14</strong>, the minimum age in Italy for using online services on your own.</p>` },
};
function renderDoc(which) {
  const docs = LANG === 'en' ? DOCS_EN : DOCS;
  const d = docs[which] || docs.regole;
  document.title = `${d.title} | NOVAE`;
  $('#legal').innerHTML = `<button class="cine-back icon-btn" data-act="back" data-fallback="${store.get('novae.in') ? '#impostazioni' : '#invito'}" aria-label="Indietro"><i class="ph-light ph-caret-left"></i></button>
    <h1>${d.title}</h1>${d.html}
    <p class="legal-links">${Object.entries(docs).filter(([k]) => k !== which).map(([k, v]) => `<a href="#doc/${k}">${v.title}</a>`).join(' · ')}</p>`;
}

let toastT;
// toast(msg) or toast(msg, { label, fn }) for an undo-style action button
function toast(msg, action) {
  const t = $('#toast');
  t.textContent = msg;
  if (action) {
    const b = document.createElement('button');
    b.className = 'toast-act'; b.textContent = action.label;
    b.onclick = () => { action.fn(); t.classList.remove('show'); };
    t.append(b);
  }
  t.classList.toggle('has-act', !!action);
  t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), action ? 4500 : 2200);
}
const COMMENTS = [['giulia', 'Regia sicura, fotografia notevole. Il finale resta addosso.'], ['kitti', 'Il taglio di luce al minuto due. Come hai fatto?'], ['mara', 'Questo mi ha fatto venire voglia di registrare il mare.'], ['ananya', 'Cinque stelle, senza pensarci.']];
