/* NOVAE · The invite gate, the main menu (hub) and the spin wheel in the dock.
   The js/*.js files are plain scripts that share one scope, loaded in order by index.html. */
'use strict';

/* ---------------- 1. Gate ---------------- */
// A real QR (dark on light, so phone cameras read it) that opens NOVAE with the invite code filled in
const inviteLink = code => `${location.origin}${location.pathname}?invito=${encodeURIComponent(code)}`;
function drawInviteQR(c, text) {
  if (!window.qrcode) return drawQR(c); // library didn't load (offline): fall back to the drawn one
  const q = qrcode(0, 'H'); // high error correction: the logo in the middle hides a few modules
  q.addData(text); q.make();
  const N = q.getModuleCount(), pad = 3, m = c.width / (N + pad * 2), ctx = c.getContext('2d');
  ctx.fillStyle = '#ecebe6'; ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#141414';
  // square modules: round dots look nicer but stop scanning reliably at larger sizes
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (q.isDark(y, x)) ctx.fillRect((x + pad) * m, (y + pad) * m, m + .5, m + .5);
  const s = Math.round(N * .2), o = (N - s) / 2; // logo plate: about 4% of the code, well inside what level H recovers
  ctx.fillStyle = '#ecebe6'; ctx.fillRect((o + pad) * m, (o + pad) * m, s * m, s * m);
  const star = new Image();
  star.onload = () => { const h = s * m * .9, w = h * star.width / star.height; ctx.drawImage(star, (c.width - w) / 2, (c.height - h) / 2, w, h); };
  star.src = STAR_SRC;
}
function drawQR(c = $('#qr')) {
  const ctx = c.getContext('2d');
  const N = 25, m = c.width / N, r = rng(2026);
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#ecebe6';
  const box = (x, y, w, h) => ctx.fillRect(x * m, y * m, w * m, h * m);
  const inFinder = (x, y) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (inFinder(x, y)) continue;
    if (r() > .54) { ctx.beginPath(); ctx.arc(x * m + m / 2, y * m + m / 2, m * .42, 0, Math.PI * 2); ctx.fill(); }
  }
  [[0, 0], [N - 7, 0], [0, N - 7]].forEach(([x, y]) => {
    box(x, y, 7, 1); box(x, y + 6, 7, 1); box(x, y, 1, 7); box(x + 6, y, 1, 7); box(x + 2, y + 2, 3, 3);
  });
  // logo star in the middle
  ctx.fillStyle = '#141414'; box(10, 10, 5, 5);
  const star = new Image();
  star.onload = () => { const h = m * 4.6, w = h * star.width / star.height; ctx.drawImage(star, (c.width - w) / 2, (c.height - h) / 2, w, h); };
  star.src = STAR_SRC;
}
$('#gateForm').addEventListener('submit', e => {
  e.preventDefault();
  const v = $('#code').value.trim();
  const help = $('#gateHelp');
  if (v.length < 4) {
    help.textContent = 'Il codice ha almeno 4 caratteri. In questa alpha qualsiasi codice valido funziona.';
    help.classList.add('err');
    $('#code').focus();
    return;
  }
  help.classList.remove('err');
  store.set('novae.in', v.toUpperCase());
  const gate = $('.gate');
  gate.classList.add('leaving');
  setTimeout(() => {
    gate.classList.remove('leaving');
    // if the URL is already #hub (a link or reload while logged out) no hashchange fires: route by hand
    if (location.hash === '#hub') route(); else location.hash = '#hub';
  }, reduceMotion ? 0 : 750);
});

// opened from an invite QR or link (?invito=NVE-XXXX): the code is already written in
{
  const invited = new URLSearchParams(location.search).get('invito');
  if (invited) {
    if (!store.get('novae.in')) {
      $('#code').value = invited.toUpperCase().slice(0, 12);
      $('#gateHelp').textContent = 'Il codice del tuo invito è già scritto: tocca Entra.';
    }
    history.replaceState(null, '', location.pathname + location.hash); // don't keep the code in the address
  }
}

/* ---------------- 2. Hub ---------------- */
// Offsets from the centre star, in units of hub width (measured from the reference video)
const HUB = [
  { k: 'stile', l: 'Stile', dx: 0, dy: -.33 },
  { k: 'novae', l: 'Novae', dx: .256, dy: -.23 },
  { k: 'scopri', l: 'Scopri', dx: .36, dy: .03 },
  { k: 'messaggi', l: 'Messaggi', dx: .256, dy: .29 },
  { k: 'profilo', l: 'Profilo', dx: 0, dy: .40 },
  { k: 'mercato', l: 'Mercato<br>Novae', dx: -.256, dy: .29 },
  { k: 'impostazioni', l: 'Impostazioni', dx: -.36, dy: .03 },
  { k: 'galleria', l: 'Galleria', dx: -.256, dy: -.23 },
];
function renderHub() {
  const hub = $('#hub');
  hub.innerHTML = `
    <div class="hub-core">${starSvg()}</div>
    <div class="hub-wordmark">${crop('wordmark')}</div>
    ${HUB.map(h => `<div class="hub-item ${prefs.lastHub === h.k ? 'hub-last' : ''}" style="--dx:${h.dx};--dy:${h.dy}"><a class="hub-btn" href="#${h.k}"><span class="hub-circle i-${h.k}">${icon(h.k)}</span><span class="hub-label">${T(h.l)}</span></a></div>`).join('')}`;
  if (reduceMotion) return;
  const box = hub.getBoundingClientRect();
  $$('.hub-item', hub).forEach((el, i) => {
    const h = HUB[i];
    const dx = -h.dx * box.width, dy = -h.dy * box.width;
    el.firstElementChild.animate(
      [{ transform: `translate(${dx}px, ${dy}px) scale(.2)`, opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 900, delay: 120 + i * 55, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
  });
  $('.hub-core', hub).animate([{ transform: 'translate(-50%,-50%) scale(.4) rotate(-45deg)', opacity: 0 }, { transform: 'translate(-50%,-50%)', opacity: 1 }], { duration: 800, easing: 'cubic-bezier(.16,1,.3,1)' });
}

/* ---------------- Dock spin wheel ----------------
   All hub sections on a ring around the dock star, same clockwise order as the hub.
   wheel.rot is in degrees; the item whose angle ends up at 12 o'clock is the selected one. */
const WHEEL = HUB;
const STEP = 360 / WHEEL.length, R = 128;
const wheel = { rot: 0, r: 0, vel: 0, raf: 0, drag: null, sel: -1, live: false, snapT: 0 }; // r: current radius (0 = tucked into the star)
const FADE_FROM = 45, HIDE_AT = 70; // degrees from 12 o'clock: buttons fade out before they could reach the bar
const norm = a => ((a % 360) + 540) % 360 - 180; // -> [-180, 180), 0 = top
const selIndex = () => ((Math.round(-wheel.rot / STEP) % WHEEL.length) + WHEEL.length) % WHEEL.length;
const snapRot = r => Math.round(r / STEP) * STEP;
const rotFor = k => { const base = -k * STEP; return base + Math.round((wheel.rot - base) / 360) * 360; };

function renderArc() {
  $('#arc').innerHTML = `
    <div class="wheel-hit"></div>
    <div class="wheel-label" id="wheelLabel" aria-live="polite"></div>
    ${WHEEL.map((it, i) => `<a class="arc-item" data-k="${it.k}" data-i="${i}" href="#${it.k}" tabindex="-1" aria-label="${it.l.replace('<br>', ' ')}"><span class="arc-circle i-${it.k}">${icon(it.k)}</span></a>`).join('')}`;
}
function layoutWheel() {
  const k = wheel.r / R; // 0 while tucked into the star, 1 when fully out
  $$('.arc-item').forEach((el, i) => {
    const a = norm(i * STEP + wheel.rot);
    const rad = a * Math.PI / 180, abs = Math.abs(a);
    const s = (1 - .3 * Math.min(1, abs / 110)) * (.3 + .7 * k);
    const o = (abs >= HIDE_AT ? 0 : Math.min(1, (HIDE_AT - abs) / (HIDE_AT - FADE_FROM))) * k;
    el.style.transform = `translate(calc(-50% + ${(wheel.r * Math.sin(rad)).toFixed(1)}px), calc(-50% + ${(-wheel.r * Math.cos(rad)).toFixed(1)}px)) scale(${s.toFixed(3)})`;
    el.style.opacity = o.toFixed(2);
    el.style.pointerEvents = o > .3 ? '' : 'none';
    el.classList.toggle('sel', abs < STEP / 2);
  });
  // 4x the wheel: one 45° step = a 180° turn, so the star is upright whenever the wheel settles
  $('#dockStar img').style.transform = `rotate(${(wheel.rot * 4).toFixed(2)}deg) scale(.9)`;
  const sel = selIndex();
  if (sel !== wheel.sel) {
    wheel.sel = sel;
    $('#wheelLabel').textContent = WHEEL[sel].l.replace('<br>', ' ');
    if (wheel.live) { try { navigator.vibrate?.(4); } catch { /* unsupported */ } }
  }
}
// Animate rotation and radius together (opening, closing, snapping)
function animateWheel(toRot, toR, dur, done, easeIn = false) {
  cancelAnimationFrame(wheel.raf);
  const fromRot = wheel.rot, fromR = wheel.r, t0 = performance.now();
  if (reduceMotion || dur <= 0) { wheel.rot = toRot; wheel.r = toR; layoutWheel(); done?.(); return; }
  const step = now => {
    const k = Math.min(1, (now - t0) / dur), e = easeIn ? k * k * k : 1 - Math.pow(1 - k, 3);
    wheel.rot = fromRot + (toRot - fromRot) * e;
    wheel.r = fromR + (toR - fromR) * e;
    layoutWheel();
    if (k < 1) wheel.raf = requestAnimationFrame(step); else done?.();
  };
  wheel.raf = requestAnimationFrame(step);
}
const spinTo = (target, dur, done) => animateWheel(target, wheel.r, dur, done);
function coast() { // momentum after a flick, then snap onto the nearest section
  if (reduceMotion) { spinTo(snapRot(wheel.rot), 0); return; }
  const step = () => {
    wheel.vel *= .95;
    wheel.rot += wheel.vel;
    layoutWheel();
    if (Math.abs(wheel.vel) > .3) wheel.raf = requestAnimationFrame(step);
    else spinTo(snapRot(wheel.rot), 280);
  };
  wheel.raf = requestAnimationFrame(step);
}
function wheelGo(i) {
  const open = () => { setArc(false); location.hash = '#' + WHEEL[i].k; };
  if (i === selIndex() && Math.abs(norm(wheel.rot - snapRot(wheel.rot))) < 1) open();
  else spinTo(rotFor(i), 340, () => setTimeout(open, 90));
}
let lastStarTap = 0;
function setArc(open) {
  const arc = $('#arc');
  const was = arc.classList.contains('open') && !arc.classList.contains('closing');
  const cur = document.body.dataset.screen === 'disciplina' ? 'galleria' : document.body.dataset.screen;
  $$('.arc-item').forEach(a => a.classList.toggle('current', a.dataset.k === cur));
  $('#scrim').classList.toggle('open', open);
  $('#dockStar').setAttribute('aria-expanded', open);
  $('#dockStar').setAttribute('aria-label', open ? 'Chiudi ruota' : 'Apri ruota delle sezioni');
  $$('.arc-item').forEach(a => a.tabIndex = open ? 0 : -1);
  if (open) $('#dock').classList.add('spinning'); // no CSS transition on the star while the wheel drives it
  if (open && !was) {
    // the buttons come out of the star, spinning in to the section you're in
    const k = Math.max(0, WHEEL.findIndex(h => h.k === cur));
    arc.classList.remove('closing');
    arc.classList.add('open');
    wheel.live = false;
    wheel.r = 0;
    wheel.rot = -k * STEP + (reduceMotion ? 0 : 150);
    wheel.sel = -1;
    layoutWheel();
    animateWheel(-k * STEP, R, 700, () => { wheel.live = true; });
  }
  if (!open && was) {
    // the buttons go back into the star, spinning the other way, then the wheel closes
    wheel.drag = null;
    wheel.live = false;
    arc.classList.remove('dragging');
    arc.classList.add('closing');
    animateWheel(wheel.rot + 90, 0, 360, () => {
      arc.classList.remove('open', 'closing');
      // the star ends on a multiple of 90°, i.e. upright: drop the rotation instantly, then give the transition back
      $('#dockStar img').style.transform = '';
      void $('#dockStar img').offsetWidth;
      $('#dock').classList.remove('spinning');
    }, true);
  }
}

// Drag to spin: angle of the pointer around the star centre drives the rotation
(() => {
  const arc = $('#arc');
  const angleAt = (e, c) => Math.atan2(e.clientX - c.x, -(e.clientY - c.y)) * 180 / Math.PI;
  arc.addEventListener('pointerdown', e => {
    if (!arc.classList.contains('open') || arc.classList.contains('closing') || e.button > 0) return;
    cancelAnimationFrame(wheel.raf);
    const r = arc.getBoundingClientRect();
    const c = { x: r.left, y: r.top };
    wheel.drag = { c, a: angleAt(e, c), moved: 0, t: performance.now(), item: e.target.closest('.arc-item') };
    wheel.vel = 0;
    wheel.live = true;
    try { arc.setPointerCapture(e.pointerId); } catch { /* synthetic or already released pointer */ }
    e.preventDefault();
  });
  arc.addEventListener('pointermove', e => {
    const d = wheel.drag;
    if (!d) return;
    const a = angleAt(e, d.c);
    const delta = norm(a - d.a);
    const now = performance.now();
    d.a = a;
    d.moved += Math.abs(delta);
    if (d.moved > 3) arc.classList.add('dragging');
    wheel.rot += delta;
    wheel.vel = delta / Math.max(8, now - d.t) * 16; // degrees per frame
    d.t = now;
    layoutWheel();
  });
  const end = () => {
    const d = wheel.drag;
    if (!d) return;
    wheel.drag = null;
    arc.classList.remove('dragging');
    if (d.moved < 4) { // a tap, not a spin
      if (d.item) wheelGo(+d.item.dataset.i);
      else spinTo(snapRot(wheel.rot), 200);
      return;
    }
    if (performance.now() - d.t > 90) wheel.vel = 0; // held still before releasing: no fling
    coast();
  };
  arc.addEventListener('pointerup', end);
  arc.addEventListener('pointercancel', end);
  arc.addEventListener('wheel', e => {
    if (!arc.classList.contains('open') || arc.classList.contains('closing')) return;
    e.preventDefault();
    cancelAnimationFrame(wheel.raf);
    wheel.live = true;
    wheel.rot -= (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * .25;
    layoutWheel();
    clearTimeout(wheel.snapT);
    wheel.snapT = setTimeout(() => spinTo(snapRot(wheel.rot), 240), 140);
  }, { passive: false });
})();
