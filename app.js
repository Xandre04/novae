/* NOVAE super alpha: no backend, mock data, hash routing. */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => n.toLocaleString('it-IT');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* storage blocked */ } },
  };
  const rng = seed => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  const pic = (seed, w, h, gray) => `https://picsum.photos/seed/novae-${seed}/${w}/${h}${gray ? '?grayscale' : ''}`;
  const img = (src, alt = '', cls = '') => `<img class="fade ${cls}" src="${src}" alt="${alt}" loading="lazy" decoding="async">`;

  /* ---------------- Icons cropped from the hand-drawn sources in assets/icone/ ---------------- */
  // [file, centerX, centerY, cropSize] all as fractions of the square source image, [aspect]
  const CROPS = {
    galleria:     ['assets/icone/seguiti.jpg', .505, .486, .125],
    impostazioni: ['assets/icone/impostazioni.jpg', .480, .494, .085],
    scopri:       ['assets/icone/scopri.jpg', .4755, .4525, .10],
    messaggi:     ['assets/icone/messaggi.jpg', .502, .4975, .13],
    profilo:      ['assets/icone/profilo.jpg', .516, .486, .10],
    mercato:      ['assets/icone/mercato.jpg', .489, .495, .10],
    gem:          ['assets/icone/stile.jpg', .491, .478, .055],
    wordmark:     ['assets/icone/logo.jpg', .4956, .5938, .169, .26],
  };
  const crop = (name, extra = '') => {
    const [f, fx, fy, sz, ar = 1] = CROPS[name];
    return `<span class="crop ${extra}" role="img" aria-label="${name}" style="--img:url('${f}');--fx:${fx};--fy:${fy};--sz:${sz};--ar:${ar}"></span>`;
  };
  const starSvg = (cls = '') => `<svg class="star-svg ${cls}" aria-hidden="true"><use href="#star4"/></svg>`;
  const icon = key => {
    if (key === 'novae') return starSvg();
    if (key === 'stile') return crop('gem');
    if (key === 'seguiti') return crop('galleria');
    return crop(key);
  };
  const coin = () => crop('mercato', 'coin');

  /* ---------------- Mock data ---------------- */
  const ARTISTS = {
    livia:  { name: 'Livia Marchetti',  handle: 'livia.mar',   country: 'Italia',     bio: 'Cortometraggi girati con pellicola scaduta.' },
    nicolo: { name: 'Nicolò Brancato',  handle: 'brancato',    country: 'Italia',     bio: 'Pittura a olio, grandi formati, porti del sud.' },
    kitti:  { name: 'Kittipong Srisuk', handle: 'kittip',      country: 'Thailandia', bio: 'Fotografia notturna tra Bangkok e Chiang Mai.' },
    ploy:   { name: 'Ploy Chaiyasit',   handle: 'ploy.c',      country: 'Thailandia', bio: 'Illustrazione e animazione a mano.' },
    aiko:   { name: 'Aiko Tanabe',      handle: 'aiko.t',      country: 'Giappone',   bio: 'Documentari brevi sui mestieri che scompaiono.' },
    ruben:  { name: 'Rubén Aldana',     handle: 'rubenaldana', country: 'Messico',    bio: 'Muralista. Colori pieni, muri lunghi.' },
    ines:   { name: 'Ines Obi',         handle: 'inesobi',     country: 'Nigeria',    bio: 'Scultura in metallo di recupero.' },
    mara:   { name: 'Mara Delvecchio',  handle: 'maradv',      country: 'Francia',    bio: 'Musica elettronica e field recording.' },
    thiago: { name: 'Thiago Moreira',   handle: 'thiagomor',   country: 'Brasile',    bio: 'Thriller a basso budget, luci al neon.' },
    ananya: { name: 'Ananya Rao',       handle: 'ananya.rao',  country: 'India',      bio: 'Poesia visiva e tipografia.' },
  };
  const AIDS = Object.keys(ARTISTS);
  const avatar = id => id === 'me' ? ME_AVATAR : pic('av-' + id, 160, 160, true);
  const ME_AVATAR = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#1a1a1b"/><circle cx="32" cy="25" r="11" fill="#eeede9"/><path d="M11 60c2-12 11-19 21-19s19 7 21 19z" fill="#eeede9"/></svg>');

  const DISCIPLINES = ['Cinematografia', 'Pittura', 'Fotografia', 'Musica', 'Illustrazione', 'Scultura', 'Poesia'];

  const DESCS = [
    'Girato in tre notti con una sola lente. Il suono è registrato sul posto, senza doppiaggio.',
    'Nasce da un quaderno di appunti lasciato a metà. Ogni scena corrisponde a una pagina.',
    'Un lavoro sulla distanza tra chi parte e chi resta, costruito con materiali trovati.',
    'Prima opera pubblicata su NOVAE. Montaggio lento, pochi dialoghi, molto mare.',
    'Realizzato insieme a una comunità di pescatori. Nessun attore professionista.',
    'Studio sul colore rosso e su quanto a lungo si può guardare un punto fisso.',
  ];

  const WORKS = [];
  const byId = {};
  let wid = 0;
  function addWork(o) {
    const r = rng(++wid * 7919);
    const w = {
      id: 'w' + wid,
      likes: Math.floor(900 + r() * 320000),
      rating: Math.round((2.6 + r() * 2.4) * 10) / 10,
      year: 2024 + Math.floor(r() * 3),
      desc: DESCS[Math.floor(r() * DESCS.length)],
      ago: 4 + Math.floor(r() * r() * 5000), // minutes since it was published
      ...o,
    };
    w.views = Math.floor(w.likes * (2.2 + r() * 4));
    w.comments = Math.floor(w.likes / (28 + r() * 30));
    w.price = Math.floor(40 + r() * 900);
    w.img = pic(w.id, o.w || 1200, o.h || 900);
    w.thumb = pic(w.id, 480, Math.round(480 * (o.h || 900) / (o.w || 1200)));
    WORKS.push(w);
    byId[w.id] = w;
    return w;
  }

  const FILM = {
    Novae:    ['Marea di vetro', 'Il custode delle gru', 'Luce di scarto', 'Ventisei inverni', 'Polvere rossa', 'Cartografia di un addio', 'Nessun porto'],
    Thriller: ['La stanza 14', 'Sotto il ponte di ferro', 'Chi ha spento il faro', 'Frequenza morta', "L'ultima corsa", 'Doppio fondo', 'Il testimone muto'],
    Storico:  ['La sarta di Trastevere', 'Anno del sale', 'Le mura di Ayutthaya', 'Ottobre a Lisbona', 'Il cartografo del re', 'Fornace', 'Lettere dal fronte'],
  };
  const filmArtists = ['livia', 'aiko', 'thiago', 'kitti', 'ruben', 'ploy', 'nicolo'];
  Object.entries(FILM).forEach(([genre, titles], gi) =>
    titles.forEach((t, i) => addWork({ t, a: filmArtists[(i + gi * 2) % filmArtists.length], type: 'video', disc: 'Cinematografia', genre, kind: i % 3 === 0 ? 'Serie' : 'Film' })));

  const FEED_SRC = [
    { t: 'Il rumore dei ciottoli', a: 'aiko', type: 'video', disc: 'Cinematografia' },
    { t: 'Crepa n. 3', a: 'nicolo', type: 'image', disc: 'Pittura', w: 900, h: 1200 },
    { t: 'Notturno a Yaowarat', a: 'kitti', type: 'image', disc: 'Fotografia' },
    { t: 'Sale e ferro', a: 'mara', type: 'audio', disc: 'Musica' },
    { t: 'Muro di via Allende', a: 'ruben', type: 'image', disc: 'Pittura', w: 1200, h: 800 },
    { t: 'Testa di bullone', a: 'ines', type: 'image', disc: 'Scultura', w: 900, h: 1150 },
    { t: 'Lettera senza vocali', a: 'ananya', type: 'image', disc: 'Poesia', w: 1000, h: 1000 },
    { t: 'La volpe e il monsone', a: 'ploy', type: 'video', disc: 'Illustrazione' },
    { t: 'Fischio di mezzanotte', a: 'mara', type: 'audio', disc: 'Musica' },
    { t: 'Porto di Catania, ore 6', a: 'nicolo', type: 'image', disc: 'Pittura', w: 1200, h: 850 },
    { t: 'Neon su Rua Augusta', a: 'thiago', type: 'video', disc: 'Cinematografia' },
    { t: 'Soglia', a: 'ines', type: 'image', disc: 'Scultura', w: 850, h: 1200 },
  ];
  const FEED = FEED_SRC.map(addWork);
  // interleave a few films into the feed
  FEED.splice(2, 0, byId.w1);
  FEED.splice(6, 0, byId.w9);

  const COUNTRIES = [
    { it: 'Thailandia', en: 'Thailand', c: [100.9, 15.2] },
    { it: 'Italia', en: 'Italy', c: [12.6, 42.6] },
    { it: 'Giappone', en: 'Japan', c: [138.5, 36.8] },
    { it: 'India', en: 'India', c: [79, 22] },
    { it: 'Nigeria', en: 'Nigeria', c: [8.2, 9.4] },
    { it: 'Francia', en: 'France', c: [2.5, 46.6] },
    { it: 'Brasile', en: 'Brazil', c: [-51, -10] },
    { it: 'Messico', en: 'Mexico', c: [-102, 23.5] },
  ];

  const THREADS = [
    { id: 'aiko', time: '21:14', unread: 2, msgs: [['them', 'Ho finito il montaggio di "Il rumore dei ciottoli"'], ['me', 'Mandamelo, stasera lo guardo'], ['them', 'Ti ho mandato il link privato'], ['them', 'Dimmi se il finale regge']] },
    { id: 'kitti', time: '18:02', unread: 0, msgs: [['me', 'La foto di Yaowarat è pazzesca'], ['them', 'Grazie! Scattata alle 3 di notte, pioveva']] },
    { id: 'ruben', time: 'ieri', unread: 1, msgs: [['them', 'Stiamo cercando qualcuno per un muro a Oaxaca'], ['them', 'Ti interessa?']] },
    { id: 'mara', time: 'lun', unread: 0, msgs: [['them', 'Ho usato il tuo suono del porto in una traccia'], ['me', 'Onorato. Taggami quando esce']] },
    { id: 'ines', time: '12 set', unread: 0, msgs: [['me', 'Vendi ancora "Soglia"?'], ['them', 'Sì, è nel Mercato']] },
  ];

  /* ---------------- State ---------------- */
  const liked = new Set((store.get('novae.liked') || '').split(',').filter(Boolean));
  const saveLikes = () => store.set('novae.liked', [...liked].join(','));
  const likeCount = w => w.likes + (liked.has(w.id) ? 1 : 0);
  const readJSON = (k, def) => { try { return JSON.parse(store.get(k)) ?? def; } catch { return def; } };
  const followed = new Set(readJSON('novae.followed', ['aiko', 'kitti', 'livia', 'ruben', 'ines']));
  const saveFollowed = () => store.set('novae.followed', JSON.stringify([...followed]));
  // UI preferences remembered between visits
  const prefs = Object.assign({ seguiti: 'Tutti', cineTab: 'Film', cineSort: 'recenti', country: 0, lastHub: '' }, readJSON('novae.prefs', {}));
  const savePrefs = () => store.set('novae.prefs', JSON.stringify(prefs));
  let recent = readJSON('novae.recent', []);
  const addRecent = q => { q = q.trim(); if (q.length < 2) return; recent = [q, ...recent.filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, 6); store.set('novae.recent', JSON.stringify(recent)); };
  const buzz = () => { try { navigator.vibrate?.(12); } catch { /* unsupported */ } };
  const saved = new Set(readJSON('novae.saved', []));
  const saveSaved = () => store.set('novae.saved', JSON.stringify([...saved]));

  // You: editable profile + the works you publish (images kept as compressed data URLs, on this device only)
  const profile = Object.assign({ name: 'Il tuo nome', handle: 'tuonome', bio: 'Scrivi qui chi sei e cosa crei. Gli altri artisti lo leggeranno prima di seguirti.' }, readJSON('novae.profile', {}));
  ARTISTS.me = { name: profile.name, handle: profile.handle, country: 'Italia', bio: profile.bio };
  const MINE = readJSON('novae.mine', []);
  MINE.forEach(w => { WORKS.unshift(w); byId[w.id] = w; });
  function saveMine() {
    try { localStorage.setItem('novae.mine', JSON.stringify(MINE)); return true; } catch { return false; }
  }
  const profileHref = aid => aid === 'me' ? '#profilo' : '#artista/' + aid;
  const agoText = w => {
    const m = w.ts ? Math.max(1, Math.round((Date.now() - w.ts) / 60000)) : w.ago;
    return m < 60 ? `${m} min` : m < 1440 ? `${Math.round(m / 60)} h` : `${Math.round(m / 1440)} g`;
  };

  /* ---------------- Shared fragments ---------------- */
  const rating = (v, size = 18) => {
    const one = '<svg><use href="#star4"/></svg>';
    return `<span class="rating" style="--s:${size}px" role="img" aria-label="Valutazione ${String(v).replace('.', ',')} su 5"><span class="r-off">${one.repeat(5)}</span><span class="r-on" style="width:${v / 5 * 100}%">${one.repeat(5)}</span></span>`;
  };
  const heart = (w, withCount = false, cls = '') => {
    const on = liked.has(w.id);
    return `<button class="act like ${on ? 'on' : ''} ${cls}" data-act="like" data-id="${w.id}" aria-pressed="${on}" aria-label="Mi piace"><i class="${on ? 'ph-fill' : 'ph-light'} ph-heart"></i>${withCount ? `<small data-count="${w.id}">${fmt(likeCount(w))}</small>` : ''}</button>`;
  };
  const shareBtn = w => `<button class="act" data-act="share" data-id="${w.id}" aria-label="Condividi"><i class="ph-light ph-arrow-bend-up-right"></i></button>`;
  const commentBtn = w => `<button class="act" data-act="comments" data-id="${w.id}" aria-label="Commenti"><i class="ph-light ph-chat-circle"></i></button>`;
  const avatarRing = (aid, cls = '') => `<a class="avatar-ring ${cls}" href="${profileHref(aid)}" aria-label="${ARTISTS[aid].name}">${img(avatar(aid), '')}</a>`;
  const saveBtn = w => {
    const on = saved.has(w.id);
    return `<button class="act save ${on ? 'on' : ''}" data-act="save" data-id="${w.id}" aria-pressed="${on}" aria-label="Salva"><i class="${on ? 'ph-fill' : 'ph-light'} ph-bookmark-simple"></i></button>`;
  };
  const wave = seed => { const r = rng(seed); return `<span class="wave">${Array.from({ length: 34 }, () => `<span style="--h:${Math.round(18 + r() * 82)}%"></span>`).join('')}</span>`; };
  const mediaOverlay = w => w.type === 'video' ? '<span class="play-ico"><i class="ph-fill ph-play"></i></span>'
    : w.type === 'audio' ? `<span class="audio-bar"><i class="ph-fill ph-play"></i>${wave(w.likes)}</span>` : '';

  /* ---------------- Sky doodles ---------------- */
  function drawSky() {
    const r = rng(42);
    const sky = $('#sky');
    let html = '';
    for (let i = 0; i < 34; i++) {
      const x = (r() * 97 + 1).toFixed(1), y = (r() * 96 + 1).toFixed(1), sz = (4 + r() * 6).toFixed(1);
      html += `<svg style="left:${x}%;top:${y}%;--sz:${sz}px;--d:${(3 + r() * 5).toFixed(1)}s;--dl:${(-r() * 6).toFixed(1)}s"><use href="#star4"/></svg>`;
    }
    sky.innerHTML = html;
  }

  /* ---------------- 1. Gate ---------------- */
  function drawQR() {
    const c = $('#qr'), ctx = c.getContext('2d');
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
    // brand star in the middle
    ctx.fillStyle = '#030303'; box(10, 10, 5, 5);
    ctx.fillStyle = '#b3122f';
    ctx.save(); ctx.translate(c.width / 2, c.height / 2); ctx.scale(m * 2.2 / 50, m * 2.2 / 50);
    ctx.fill(new Path2D('M0-50C3-14 8-8 44 0 8 8 3 14 0 50-3 14-8 8-44 0-8-8-3-14 0-50Z')); ctx.restore();
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
    setTimeout(() => { gate.classList.remove('leaving'); location.hash = '#hub'; }, reduceMotion ? 0 : 750);
  });

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
    { k: 'seguiti', l: 'Seguiti', dx: -.256, dy: -.23 },
  ];
  function renderHub() {
    const hub = $('#hub');
    hub.innerHTML = `
      <div class="hub-core">${starSvg()}</div>
      <div class="hub-wordmark">${crop('wordmark')}</div>
      ${HUB.map(h => `<div class="hub-item ${prefs.lastHub === h.k ? 'hub-last' : ''}" style="--dx:${h.dx};--dy:${h.dy}"><a class="hub-btn" href="#${h.k}"><span class="hub-circle i-${h.k}">${icon(h.k)}</span><span class="hub-label">${h.l}</span></a></div>`).join('')}`;
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
  const wheel = { rot: 0, vel: 0, raf: 0, drag: null, sel: -1, live: false, snapT: 0 };
  const norm = a => ((a % 360) + 540) % 360 - 180; // -> [-180, 180), 0 = top
  const selIndex = () => ((Math.round(-wheel.rot / STEP) % WHEEL.length) + WHEEL.length) % WHEEL.length;
  const snapRot = r => Math.round(r / STEP) * STEP;
  const rotFor = k => { const base = -k * STEP; return base + Math.round((wheel.rot - base) / 360) * 360; };

  function renderArc() {
    $('#arc').innerHTML = `
      <div class="wheel-hit"></div>
      <svg class="wheel-mark" aria-hidden="true"><use href="#star4"/></svg>
      <div class="wheel-label" id="wheelLabel" aria-live="polite"></div>
      ${WHEEL.map((it, i) => `<a class="arc-item" data-k="${it.k}" data-i="${i}" href="#${it.k}" tabindex="-1" aria-label="${it.l.replace('<br>', ' ')}"><span class="arc-circle i-${it.k}">${icon(it.k)}</span></a>`).join('')}`;
  }
  function layoutWheel() {
    $$('.arc-item').forEach((el, i) => {
      const a = norm(i * STEP + wheel.rot);
      const rad = a * Math.PI / 180, abs = Math.abs(a);
      const s = 1 - .3 * Math.min(1, abs / 110);
      const o = abs > 100 ? 0 : Math.min(1, 1 - (abs - 55) / 45); // side slots fade so they don't crowd the dock icons
      el.style.transform = `translate(calc(-50% + ${(R * Math.sin(rad)).toFixed(1)}px), calc(-50% + ${(-R * Math.cos(rad)).toFixed(1)}px)) scale(${s.toFixed(3)})`;
      el.style.opacity = o.toFixed(2);
      el.style.pointerEvents = o > .3 ? '' : 'none';
      el.classList.toggle('sel', abs < STEP / 2);
    });
    $('#dockStar svg').style.transform = `rotate(${(wheel.rot * .5).toFixed(2)}deg) scale(.9)`;
    const sel = selIndex();
    if (sel !== wheel.sel) {
      wheel.sel = sel;
      $('#wheelLabel').textContent = WHEEL[sel].l.replace('<br>', ' ');
      if (wheel.live) { try { navigator.vibrate?.(4); } catch { /* unsupported */ } }
    }
  }
  function spinTo(target, dur, done) {
    cancelAnimationFrame(wheel.raf);
    const from = wheel.rot, t0 = performance.now();
    if (reduceMotion || dur <= 0) { wheel.rot = target; layoutWheel(); done?.(); return; }
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      wheel.rot = from + (target - from) * e;
      layoutWheel();
      if (k < 1) wheel.raf = requestAnimationFrame(step); else done?.();
    };
    wheel.raf = requestAnimationFrame(step);
  }
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
  function setArc(open) {
    const arc = $('#arc');
    const was = arc.classList.contains('open');
    const cur = document.body.dataset.screen === 'disciplina' ? 'stile' : document.body.dataset.screen;
    $$('.arc-item').forEach(a => a.classList.toggle('current', a.dataset.k === cur));
    arc.classList.toggle('open', open);
    $('#scrim').classList.toggle('open', open);
    $('#dockStar').setAttribute('aria-expanded', open);
    $('#dockStar').setAttribute('aria-label', open ? 'Chiudi ruota' : 'Apri ruota delle sezioni');
    $$('.arc-item').forEach(a => a.tabIndex = open ? 0 : -1);
    $('#dock').classList.toggle('spinning', open);
    if (open && !was) {
      // start on the section you're in, and spin in to it
      const k = Math.max(0, WHEEL.findIndex(h => h.k === cur));
      wheel.live = false;
      wheel.rot = -k * STEP + (reduceMotion ? 0 : 150);
      wheel.sel = -1;
      layoutWheel();
      spinTo(-k * STEP, 750, () => { wheel.live = true; });
    }
    if (!open && was) {
      cancelAnimationFrame(wheel.raf);
      wheel.drag = null;
      arc.classList.remove('dragging');
      $('#dockStar svg').style.transform = '';
    }
  }

  // Drag to spin: angle of the pointer around the star centre drives the rotation
  (() => {
    const arc = $('#arc');
    const angleAt = (e, c) => Math.atan2(e.clientX - c.x, -(e.clientY - c.y)) * 180 / Math.PI;
    arc.addEventListener('pointerdown', e => {
      if (!arc.classList.contains('open') || e.button > 0) return;
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
      if (!arc.classList.contains('open')) return;
      e.preventDefault();
      cancelAnimationFrame(wheel.raf);
      wheel.live = true;
      wheel.rot -= (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * .25;
      layoutWheel();
      clearTimeout(wheel.snapT);
      wheel.snapT = setTimeout(() => spinTo(snapRot(wheel.rot), 240), 140);
    }, { passive: false });
  })();

  /* ---------------- 3. Feed ---------------- */
  function postHtml(w) {
    const a = ARTISTS[w.a];
    return `<article class="post">
      ${w.rating ? rating(w.rating) : '<span class="rating new-tag">Nuova</span>'}
      <div class="post-side">${avatarRing(w.a)}<span class="post-by">${a.name.split(' ')[0]}<small>${agoText(w)}</small></span></div>
      <a class="frame" href="#vista/${w.id}" data-dbl="${w.id}" aria-label="${w.t} di ${a.name}">
        <span class="frame-inner ph-img">${img(w.thumb, w.t)}${mediaOverlay(w)}</span>
      </a>
      <div class="post-actions">${heart(w)}${shareBtn(w)}${commentBtn(w)}${saveBtn(w)}<button class="act" data-act="more" data-id="${w.id}" aria-label="Altre azioni"><i class="ph-light ph-dots-three"></i></button></div>
      <p class="post-title">${w.t}</p>
    </article>`;
  }
  function renderFeed() { $('#feed').innerHTML = [...MINE, ...FEED].map(postHtml).join(''); }

  /* ---------------- 4. Vista: full-screen vertical feed, like Reels / TikTok ----------------
     Native scroll-snap does the swiping; an IntersectionObserver tracks the reel on screen. */
  let reelObserver;
  function reelHtml(w) {
    const a = ARTISTS[w.a];
    const src = w.ts ? w.img : pic(w.id, 900, 1600); // portrait crop of the same photo
    const canFollow = w.a !== 'me' && !followed.has(w.a);
    return `<section class="reel" data-id="${w.id}" data-type="${w.type}" aria-label="${w.t} di ${a.name}">
      <div class="reel-media ph-img" data-dbl="${w.id}">${img(src, w.t)}</div>
      <span class="reel-shade" aria-hidden="true"></span>
      ${w.type !== 'image' ? '<span class="reel-paused" aria-hidden="true"><i class="ph-fill ph-play"></i></span><div class="progress"><span></span></div>' : ''}
      <div class="reel-rail">
        <span class="reel-ava">${avatarRing(w.a)}${canFollow ? `<button class="reel-follow" data-act="follow" data-a="${w.a}" aria-label="Segui ${a.name}">+</button>` : ''}</span>
        ${heart(w, true)}
        <button class="act" data-act="comments" data-id="${w.id}" aria-label="Commenti"><i class="ph-light ph-chat-circle"></i><small>${fmt(w.comments)}</small></button>
        ${saveBtn(w)}
        ${shareBtn(w)}
        <button class="act" data-act="more" data-id="${w.id}" aria-label="Altro"><i class="ph-light ph-dots-three"></i></button>
      </div>
      <div class="reel-meta">
        <a class="reel-by" href="${profileHref(w.a)}">@${a.handle}</a>
        <h2>${w.t}</h2>
        <p class="reel-desc" data-act="expand">${w.desc}</p>
        <p class="reel-tags">${w.rating ? rating(w.rating, 12) : '<span class="new-tag">Nuova</span>'}<span>${w.disc} · ${agoText(w)}</span></p>
      </div>
    </section>`;
  }
  function renderVista(id) {
    const all = [...MINE, ...FEED];
    const start = byId[id] || all[0];
    const list = all.includes(start) ? all : [start, ...all]; // e.g. a film opened from Cinematografia
    const root = $('#vista');
    root.className = 'vista';
    root.innerHTML = `
      <button class="vista-back icon-btn" data-act="back" data-fallback="#novae" aria-label="Indietro"><i class="ph-light ph-caret-left"></i></button>
      <p class="vista-hint" aria-hidden="true"><i class="ph-light ph-hand-swipe-up"></i>Scorri per la prossima</p>
      <div class="reels" id="reels">${list.map(reelHtml).join('')}</div>`;
    const reels = $('#reels');
    reels.scrollTop = reels.querySelector(`[data-id="${start.id}"]`).offsetTop;
    root.dataset.id = start.id;
    if (!store.get('novae.reelHint')) { root.classList.add('hint'); store.set('novae.reelHint', '1'); }
    reelObserver?.disconnect();
    reelObserver = new IntersectionObserver(entries => entries.forEach(en => {
      en.target.classList.toggle('active', en.isIntersecting);
      if (!en.isIntersecting) return;
      const wid = en.target.dataset.id, h = '#vista/' + wid;
      root.dataset.id = wid;
      if (location.hash !== h) { // keep the URL on the work you're watching, without adding history entries
        history.replaceState(null, '', h);
        curHash = h; trail[trail.length - 1] = h; cur.param = wid;
      }
    }), { root: reels, threshold: .6 });
    $$('.reel', reels).forEach(r => reelObserver.observe(r));
  }
  function stepVista(dir) {
    const reels = $('#reels');
    if (reels) reels.scrollBy({ top: dir * reels.clientHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  /* ---------------- 5. Seguiti: works by the artists you follow ---------------- */
  function renderSeguiti() {
    const ids = [...followed];
    if (prefs.seguiti !== 'Tutti' && !followed.has(prefs.seguiti)) prefs.seguiti = 'Tutti';
    $('#galleryPills').innerHTML = ids.length ? [`<button class="pill" role="tab" aria-selected="${prefs.seguiti === 'Tutti'}" data-act="gfilter" data-v="Tutti">Tutti</button>`,
      ...ids.map(id => `<button class="pill" role="tab" aria-selected="${prefs.seguiti === id}" data-act="gfilter" data-v="${id}"><img src="${avatar(id)}" alt="">${ARTISTS[id].name.split(' ')[0]}</button>`)].join('') : '';
    if (!ids.length) {
      $('#masonry').innerHTML = `<div class="empty" style="column-span:all">${starSvg()}<strong>Non segui ancora nessuno</strong><p>Trova artisti in Scopri e tocca Segui sul loro profilo.</p><a class="btn-ghost" href="#scopri">Apri Scopri</a></div>`;
      return;
    }
    const list = WORKS.filter(w => prefs.seguiti === 'Tutti' ? followed.has(w.a) : w.a === prefs.seguiti);
    $('#masonry').innerHTML = list.length ? list.map(w => {
      const h = Math.round(480 * (w.h || 900) / (w.w || 1200));
      return `<a class="m-tile" href="#opera/${w.id}"><div class="m-img"><div class="ph-img" style="aspect-ratio:480/${h}">${img(w.thumb, w.t)}${w.type === 'video' ? mediaOverlay(w) : ''}</div></div>
        <div class="m-cap"><strong>${w.t}</strong><span>${ARTISTS[w.a].name.split(' ')[0]}</span></div></a>`;
    }).join('') : `<div class="empty" style="column-span:all">${starSvg()}<strong>Ancora vuoto</strong><p>${ARTISTS[prefs.seguiti]?.name || 'Questo artista'} non ha ancora pubblicato opere.</p></div>`;
  }

  /* ---------------- 6. Stile ---------------- */
  function renderStile() {
    $('#disciplines').innerHTML = DISCIPLINES.map((d, i) => {
      const ws = WORKS.filter(w => w.disc === d);
      const thumbs = (ws.length ? ws : WORKS.slice(i * 2)).slice(0, 3);
      return `<a class="disc ${i === 0 ? 'active' : ''}" href="#stile/${d.toLowerCase()}">
        <div><h2>${d}</h2><p>${ws.length ? `${ws.length} opere` : 'In arrivo'}</p></div>
        <div class="disc-thumbs">${thumbs.map((w, k) => `<img src="${pic(w.id, 120, 150)}" alt="" loading="lazy" style="--r:${(k - 1) * 7}deg">`).join('')}</div>
      </a>`;
    }).join('');
  }

  /* ---------------- 7. Disciplina ---------------- */
  const cineState = { tab: prefs.cineTab, sort: prefs.cineSort, expanded: null, sortOpen: false, center: { Novae: 3, Thriller: 3, Storico: 3 } };
  const SIZES = [[46, 100], [12, 44], [8, 30], [5, 17]]; // width %, height % by distance from center
  function genreWorks(g) {
    let list = WORKS.filter(w => w.genre === g);
    if (cineState.tab === 'Serie') list = [...list].sort((a, b) => (a.kind === 'Serie' ? -1 : 1) - (b.kind === 'Serie' ? -1 : 1));
    if (cineState.tab === 'Classifica' || cineState.sort === 'stelle') list = [...list].sort((a, b) => b.rating - a.rating);
    if (cineState.sort === 'visti') list = [...list].sort((a, b) => b.views - a.views);
    if (cineState.tab === 'Classifica' || cineState.sort !== 'recenti') {
      // put the best in the middle, alternating outward
      const out = new Array(list.length); let l = 3, r = 3;
      list.forEach((w, i) => { if (i === 0) out[3] = w; else if (i % 2) out[++r] = w; else out[--l] = w; });
      list = out.filter(Boolean);
    }
    return list;
  }
  function renderCine(slug) {
    const name = DISCIPLINES.find(d => d.toLowerCase() === (slug || '').toLowerCase()) || 'Cinematografia';
    const root = $('#cine');
    if (name !== 'Cinematografia') {
      root.innerHTML = `<button class="cine-back icon-btn" data-act="back" data-fallback="#stile" aria-label="Indietro"><i class="ph-light ph-caret-left"></i></button>
        <h1 class="cine-title">${name}</h1>
        <div class="empty">${starSvg()}<strong>Sala in allestimento</strong><p>La sezione ${name.toLowerCase()} apre nella prossima alpha. Intanto trovi nuove opere nel feed.</p><a class="btn-ghost" href="#novae">Apri Novae</a></div>`;
      return;
    }
    const tabs = ['Serie', 'Film', 'Classifica', 'Ordina per'];
    root.innerHTML = `
      <button class="cine-back icon-btn" data-act="back" data-fallback="#stile" aria-label="Indietro"><i class="ph-light ph-caret-left"></i></button>
      <h1 class="cine-title">${name}</h1>
      <div class="tabs" role="tablist">${tabs.map(t => `<button class="tab" role="tab" data-act="ctab" data-v="${t}" aria-selected="${t === cineState.tab || (t === 'Ordina per' && cineState.sortOpen)}">${t}</button>`).join('')}</div>
      ${cineState.sortOpen ? `<div class="sortmenu" role="menu" style="top:${0}px">${[['recenti', 'Più recenti'], ['stelle', 'Più stelle'], ['visti', 'Più visti']].map(([v, l]) => `<button role="menuitemradio" aria-checked="${cineState.sort === v}" data-act="csort" data-v="${v}">${l}</button>`).join('')}</div>` : ''}
      ${Object.keys(FILM).map(rowHtml).join('')}`;
    const menu = $('.sortmenu', root);
    if (menu) menu.style.top = ($('.tabs', root).offsetTop + $('.tabs', root).offsetHeight + 6) + 'px';
  }
  function rowHtml(g) {
    const list = genreWorks(g);
    const c = Math.min(cineState.center[g], list.length - 1);
    const cw = list[c];
    const label = `<span class="cf-label ${g === 'Novae' ? 'red' : ''}">${g}</span>`;
    if (cineState.expanded === cw.id) {
      const a = ARTISTS[cw.a];
      return `<div class="cf-row">
        <div class="cf-head">${label}<span class="cf-views"><i class="ph-light ph-eye"></i>${fmt(cw.views)}</span></div>
        <button class="band-close icon-btn" data-act="collapse" aria-label="Chiudi"><i class="ph-light ph-x"></i></button>
        <div class="band">
          <div class="band-left">${avatarRing(cw.a, 'sm')}<small>${a.name}</small><span class="line"></span>${rating(cw.rating, 15)}</div>
          <a class="band-media ph-img" href="#opera/${cw.id}" data-dbl="${cw.id}">${img(cw.img, cw.t)}<span class="play-ico"><i class="ph-fill ph-play"></i></span></a>
          <div class="band-info"><h4>INFO*</h4>${cw.kind}, ${cw.year}. ${cw.desc}<br><a class="btn-ghost" href="#opera/${cw.id}">Scheda completa</a></div>
        </div>
        <div class="cf-foot">${heart(cw, true)}<a href="#opera/${cw.id}">${cw.t}</a>${commentBtn(cw)}</div>
      </div>`;
    }
    const items = list.map((w, i) => {
      const d = Math.abs(i - c);
      if (d > 3) return '';
      const [wd, h] = SIZES[d];
      return `<button class="cf-item ${d === 0 ? 'center' : ''} ph-img" style="--wd:${wd}%;--h:${h}%" data-act="${d === 0 ? 'expand' : 'cf'}" data-g="${g}" data-i="${i}" data-id="${w.id}" aria-label="${w.t}">${img(w.thumb, '')}</button>`;
    }).join('');
    return `<div class="cf-row">
      <div class="cf-head">${label}<span class="cf-views"><i class="ph-light ph-eye"></i>${fmt(cw.views)}</span></div>
      <div class="cf">${items}</div>
      <div class="cf-foot">${heart(cw, true)}<a href="#opera/${cw.id}">${cw.t}</a>${commentBtn(cw)}</div>
    </div>`;
  }

  /* ---------------- 8. Scheda opera ---------------- */
  function renderDetail(id) {
    const w = byId[id] || WORKS[0];
    const a = ARTISTS[w.a];
    const related = WORKS.filter(x => x !== w && (x.genre ? x.genre === w.genre : x.disc === w.disc || x.a === w.a)).slice(0, 6);
    $('#detail').innerHTML = `
      <div class="player ph-img" data-dbl="${w.id}">
        <button class="back icon-btn" data-act="back" data-fallback="#novae" aria-label="Indietro"><i class="ph-light ph-caret-left"></i></button>
        ${img(w.img, w.t)}
        ${w.type !== 'image' ? `<button class="vista-play" data-act="play" aria-label="Riproduci"><i class="ph-light ph-play"></i></button><div class="progress"><span></span></div>` : ''}
      </div>
      <div class="d-title">${avatarRing(w.a, 'sm')}<h1>${w.t}</h1>${rating(w.rating, 20)}</div>
      <div class="d-actions">${heart(w, true)}<span class="grow"></span>${commentBtn(w)}${shareBtn(w)}${saveBtn(w)}<button class="act" data-act="more" data-id="${w.id}" aria-label="Altro"><i class="ph-light ph-dots-three"></i></button></div>
      <div class="d-body">
        <div class="d-author">${avatarRing(w.a)}</div>
        <div class="d-desc">
          <h3>Descrizione</h3>
          <p>${w.desc}</p>
          <dl>
            <dt>Artista</dt><dd><a href="#artista/${w.a}">${a.name}</a></dd>
            <dt>Disciplina</dt><dd>${w.disc}${w.genre ? `, ${w.genre.toLowerCase()}` : ''}</dd>
            <dt>Anno</dt><dd>${w.year}</dd>
            <dt>Paese</dt><dd>${a.country}</dd>
            <dt>Visualizzazioni</dt><dd>${fmt(w.views)}</dd>
          </dl>
          <div class="related-panel" id="relPanel">
            <h3>Opere correlate</h3>
            ${related.map(r => `<a class="rel" href="#opera/${r.id}">${img(r.thumb, '')}<div><strong>${r.t}</strong><span>${ARTISTS[r.a].name}</span></div></a>`).join('')}
          </div>
        </div>
        <button class="related-tab" data-act="related" aria-expanded="false" aria-controls="relPanel">Opere correlate*</button>
      </div>`;
  }

  /* ---------------- 9. Scopri ---------------- */
  const startC = COUNTRIES[prefs.country] || COUNTRIES[0];
  const globe = { ready: false, loading: false, idx: COUNTRIES.indexOf(startC), rot: [-startC.c[0], -startC.c[1], 0] };
  function artistsIn(c) { return AIDS.filter(id => ARTISTS[id].country === c.it); }
  function updateCountryUi() {
    const c = COUNTRIES[globe.idx];
    const ids = artistsIn(c);
    const works = WORKS.filter(w => ids.includes(w.a)).length;
    $('#countryName').textContent = c.it;
    $('#countryMeta').textContent = `${ids.length} ${ids.length === 1 ? 'artista' : 'artisti'}, ${works} opere`;
    $('#countryArtists').innerHTML = ids.map(id => `<a class="c-artist" href="#artista/${id}"><span class="avatar-ring">${img(avatar(id), '')}</span>${ARTISTS[id].name.split(' ')[0]}</a>`).join('');
  }
  async function initGlobe() {
    updateCountryUi();
    if (globe.ready || globe.loading) return;
    if (!window.d3 || !window.topojson) { $('#globeMsg').textContent = 'Mappa non disponibile offline'; return; }
    globe.loading = true;
    try {
      const world = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(r => r.json());
      const feats = topojson.feature(world, world.objects.countries).features;
      const land = topojson.mesh(world, world.objects.countries, (a, b) => a === b);
      const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
      const proj = d3.geoOrthographic().scale(258).translate([270, 270]).clipAngle(90).rotate(globe.rot);
      const path = d3.geoPath(proj);
      const svg = d3.select('#globe');
      svg.append('circle').attr('class', 'sphere').attr('cx', 270).attr('cy', 270).attr('r', 258);
      const g = svg.append('g').attr('filter', 'url(#chalk)');
      const grat = g.append('path').attr('class', 'grat').datum(d3.geoGraticule10());
      const hits = g.append('g').selectAll('path').data(feats).join('path').attr('class', 'hit')
        .on('click', (e, f) => {
          const i = COUNTRIES.findIndex(c => c.en === f.properties.name);
          if (i > -1) selectCountry(i); else toast(`Ancora nessuna Nova in ${f.properties.name}`);
        });
      const coast = g.append('path').attr('class', 'land').datum(land);
      const bord = g.append('path').attr('class', 'land').attr('stroke-opacity', .35).datum(borders);
      const sel = g.append('path').attr('class', 'sel');
      const r = rng(9);
      const markers = COUNTRIES.flatMap(c => artistsIn(c).map(() => [c.c[0] + (r() - .5) * 6, c.c[1] + (r() - .5) * 4]))
        .concat(Array.from({ length: 10 }, () => [r() * 360 - 180, r() * 120 - 50]));
      const mk = svg.append('g').selectAll('use').data(markers).join('use').attr('href', '#star4').attr('class', 'mk').attr('width', 20).attr('height', 22);
      const draw = () => {
        proj.rotate(globe.rot);
        grat.attr('d', path); hits.attr('d', path); coast.attr('d', path); bord.attr('d', path);
        const cur = feats.find(f => f.properties.name === COUNTRIES[globe.idx].en);
        sel.datum(cur).attr('d', cur ? path : null);
        const center = [-globe.rot[0], -globe.rot[1]];
        mk.each(function (p) {
          const vis = d3.geoDistance(p, center) < Math.PI / 2 - .05;
          const [x, y] = proj(p);
          this.setAttribute('x', x - 10); this.setAttribute('y', y - 11);
          this.style.display = vis ? '' : 'none';
        });
      };
      globe.draw = draw;
      svg.call(d3.drag().clickDistance(4).on('drag', e => {
        const k = 75 / proj.scale();
        globe.rot = [globe.rot[0] + e.dx * k, Math.max(-70, Math.min(70, globe.rot[1] - e.dy * k)), 0];
        draw();
      }));
      draw();
      globe.ready = true;
      $('#globeMsg').textContent = '';
    } catch {
      $('#globeMsg').textContent = 'Non riesco a caricare il globo';
    } finally { globe.loading = false; }
  }
  function selectCountry(i) {
    globe.idx = (i + COUNTRIES.length) % COUNTRIES.length;
    prefs.country = globe.idx; savePrefs();
    updateCountryUi();
    if (!globe.ready) return;
    const c = COUNTRIES[globe.idx];
    const to = [-c.c[0], -c.c[1], 0];
    if (reduceMotion) { globe.rot = to; globe.draw(); return; }
    const interp = d3.interpolate(globe.rot, to);
    const t = d3.timer(el => {
      const k = Math.min(1, el / 1100);
      globe.rot = interp(d3.easeCubicInOut(k));
      globe.draw();
      if (k === 1) t.stop();
    });
  }

  /* ---------------- 10. Mercato ---------------- */
  function renderMarket() {
    const items = WORKS.filter(w => w.type !== 'audio').slice(8, 20);
    const feat = byId.w3;
    $('#market').innerHTML = `
      <div class="market-head"><h1>${coin()}Mercato Novae</h1>
        <span class="wallet">${coin()}<span><strong>1.240</strong> <small>crediti</small></span></span></div>
      <div class="m-feature">
        ${img(feat.img, feat.t)}
        <div><h2>${feat.t}</h2><p>Edizione unica di ${ARTISTS[feat.a].name}. Chi la acquista riceve il file originale e una stella sul profilo.</p>
          <div class="m-buy"><span class="price">${coin()}${fmt(feat.price)}</span><button class="btn-accent" data-act="buy" data-id="${feat.id}">Acquista</button></div></div>
      </div>
      <div class="market-grid">${items.map(w => `
        <div class="m-item">
          <a class="frame" href="#opera/${w.id}"><span class="frame-inner ph-img">${img(w.thumb, w.t)}</span></a>
          <div><h3>${w.t}</h3><span class="by">${ARTISTS[w.a].name}</span></div>
          <div class="m-buy"><span class="price">${coin()}${fmt(w.price)}</span><button class="btn-ghost" data-act="buy" data-id="${w.id}">Acquista</button></div>
        </div>`).join('')}</div>`;
  }

  /* ---------------- 11. Profilo / artista ---------------- */
  let profTab = 'Opere';
  function renderProfile(aid) {
    const other = aid && aid !== 'me' && ARTISTS[aid];
    const a = other || ARTISTS.me;
    const works = WORKS.filter(w => w.a === (other ? aid : 'me'));
    const savedList = WORKS.filter(w => saved.has(w.id));
    const tabs = other ? ['Opere', 'Stelle'] : ['Opere', 'Salvate', 'Stelle'];
    if (!tabs.includes(profTab)) profTab = 'Opere';
    const list = profTab === 'Opere' ? works : profTab === 'Salvate' ? savedList : works.filter(w => w.rating >= 4);
    const empty = {
      Opere: other ? ['Nessuna opera', `${a.name.split(' ')[0]} non ha ancora pubblicato.`] : ['La tua prima opera', 'Tocca "Pubblica opera" e condividila con chi ti segue.'],
      Salvate: ['Niente di salvato', 'Tocca il segnalibro su un\'opera e la ritrovi qui.'],
      Stelle: ['Nessuna stella', 'Le opere con almeno 4 stelle finiscono qui.'],
    }[profTab];
    const thumb = w => w.ts ? w.img : pic(w.id, 300, 300);
    $('#profile').innerHTML = `
      <div class="prof-top">
        ${other ? `<span class="avatar-ring lg">${img(avatar(aid), '')}</span>` : `<span class="prof-ring">${crop('profilo')}<button class="edit" data-act="edit-profile" aria-label="Modifica profilo"><i class="ph-light ph-pencil-simple"></i></button></span>`}
        <h1>${a.name}</h1>
        <span class="handle">@${a.handle}, ${a.country}</span>
        <p class="bio">${a.bio}</p>
        <div class="stats">
          <div><strong>${works.length}</strong><span>opere</span></div>
          <div><strong>${other ? fmt(works.reduce((s, w) => s + likeCount(w), 0)) : savedList.length}</strong><span>${other ? 'cuori' : 'salvate'}</span></div>
          <div><strong>${other ? fmt(120 + works.length * 37) : followed.size}</strong><span>${other ? 'seguaci' : 'seguiti'}</span></div>
        </div>
        <div class="prof-cta">${other
          ? `<button class="${followed.has(aid) ? 'btn-ghost' : 'btn-accent'}" data-act="follow" data-a="${aid}" aria-pressed="${followed.has(aid)}">${followed.has(aid) ? 'Segui già' : 'Segui'}</button><a class="btn-ghost" href="#messaggi/${aid}">Messaggio</a>`
          : `<button class="btn-accent" data-act="publish">Pubblica opera</button><button class="btn-ghost" data-act="edit-profile">Modifica</button>`}</div>
      </div>
      <div class="seg" role="tablist" style="grid-template-columns:repeat(${tabs.length},1fr)">${tabs.map(t => `<button role="tab" aria-selected="${t === profTab}" data-act="ptab" data-v="${t}" data-a="${aid || ''}">${t}</button>`).join('')}</div>
      ${list.length ? `<div class="grid3">${list.map(w => `<a href="#opera/${w.id}" class="ph-img">${img(thumb(w), w.t)}</a>`).join('')}</div>`
        : `<div class="empty">${starSvg()}<strong>${empty[0]}</strong><p>${empty[1]}</p>${!other && profTab === 'Opere' ? '<button class="btn-accent" data-act="publish">Pubblica opera</button>' : ''}</div>`}`;
  }

  /* ---------------- Publish + edit profile (local only, this device) ---------------- */
  function compressImage(file, max = 1080) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, max / Math.max(im.width, im.height));
        const c = document.createElement('canvas');
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        res({ data: c.toDataURL('image/jpeg', .8), w: c.width, h: c.height });
      };
      im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('image')); };
      im.src = url;
    });
  }
  function openPublish() {
    openSheet(`<h3>Nuova opera</h3>
      <form class="pub" id="pubForm" novalidate>
        <label class="pub-drop" id="pubDrop"><input type="file" accept="image/*" id="pubFile" aria-label="Immagine dell'opera"><img id="pubPrev" alt="" hidden><span><i class="ph-light ph-image-square"></i>Scegli un'immagine</span></label>
        <div class="field"><label for="pubT">Titolo</label><input id="pubT" maxlength="60" placeholder="Come si chiama?" autocomplete="off"></div>
        <div class="field"><label for="pubDisc">Disciplina</label><select id="pubDisc">${DISCIPLINES.map(d => `<option>${d}</option>`).join('')}</select></div>
        <div class="field"><label for="pubDesc">Descrizione</label><textarea id="pubDesc" maxlength="400" rows="3" placeholder="Racconta com'è nata (facoltativo)"></textarea></div>
        <p class="pub-err" id="pubErr" role="alert"></p>
        <button class="btn-accent" type="submit">Pubblica</button>
      </form>`);
  }
  async function onPubFile(file) {
    if (!file) return;
    try {
      const r = await compressImage(file);
      const f = $('#pubForm');
      Object.assign(f.dataset, { img: r.data, w: r.w, h: r.h });
      $('#pubPrev').src = r.data; $('#pubPrev').hidden = false;
      $('#pubDrop').classList.add('has');
      $('#pubErr').textContent = '';
    } catch { $('#pubErr').textContent = 'Non riesco a leggere questa immagine. Prova con un JPG o PNG.'; }
  }
  function submitPublish(f) {
    const t = $('#pubT').value.trim();
    if (!f.dataset.img) { $('#pubErr').textContent = 'Scegli prima un\'immagine.'; return; }
    if (!t) { $('#pubErr').textContent = 'Dai un titolo alla tua opera.'; $('#pubT').focus(); return; }
    const w = {
      id: 'u' + Date.now(), t, a: 'me', type: 'image', disc: $('#pubDisc').value, desc: $('#pubDesc').value.trim() || 'Appena pubblicata.',
      img: f.dataset.img, thumb: f.dataset.img, w: +f.dataset.w, h: +f.dataset.h,
      likes: 0, rating: 0, views: 0, comments: 0, price: 0, year: new Date().getFullYear(), ts: Date.now(),
    };
    MINE.unshift(w);
    if (!saveMine()) { MINE.shift(); $('#pubErr').textContent = 'Spazio pieno su questo dispositivo: elimina una tua opera e riprova.'; return; }
    WORKS.unshift(w); byId[w.id] = w;
    closeSheet(); toast('Opera pubblicata'); buzz();
    if (location.hash === '#novae') renderFeed(); else location.hash = '#novae';
  }
  function deleteMine(id) {
    const i = MINE.findIndex(w => w.id === id);
    if (i < 0) return;
    MINE.splice(i, 1); saveMine();
    const wi = WORKS.findIndex(w => w.id === id);
    if (wi > -1) WORKS.splice(wi, 1);
    delete byId[id];
    saved.delete(id); saveSaved();
    closeSheet(); toast('Opera eliminata');
    if (location.hash.includes(id)) location.hash = '#profilo'; else refresh();
  }
  function openEditProfile() {
    const q = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    openSheet(`<h3>Modifica profilo</h3>
      <form class="pub" id="profForm" novalidate>
        <div class="field"><label for="pfName">Nome</label><input id="pfName" maxlength="40" value="${q(profile.name)}" autocomplete="name"></div>
        <div class="field"><label for="pfHandle">Nome utente</label><input id="pfHandle" maxlength="24" value="${q(profile.handle)}" autocomplete="username" spellcheck="false"></div>
        <div class="field"><label for="pfBio">Bio</label><textarea id="pfBio" maxlength="160" rows="3">${q(profile.bio)}</textarea></div>
        <p class="pub-err" id="pfErr" role="alert"></p>
        <button class="btn-accent" type="submit">Salva</button>
      </form>`);
  }
  function submitProfile() {
    const name = $('#pfName').value.trim(), handle = $('#pfHandle').value.trim().replace(/^@/, '').toLowerCase();
    if (!name) { $('#pfErr').textContent = 'Il nome non può essere vuoto.'; return; }
    if (!/^[a-z0-9._]{3,24}$/.test(handle)) { $('#pfErr').textContent = 'Nome utente: 3-24 caratteri tra lettere, numeri, punto e trattino basso.'; return; }
    Object.assign(profile, { name, handle, bio: $('#pfBio').value.trim() || profile.bio });
    Object.assign(ARTISTS.me, { name, handle, bio: profile.bio });
    store.set('novae.profile', JSON.stringify(profile));
    closeSheet(); toast('Profilo aggiornato'); refresh();
  }

  /* ---------------- 12. Messaggi ---------------- */
  function renderMessages(tid) {
    const root = $('#messages');
    const th = THREADS.find(t => t.id === tid) || (tid && ARTISTS[tid] ? { id: tid, msgs: [], time: 'ora', unread: 0 } : null);
    if (th) {
      th.unread = 0;
      const a = ARTISTS[th.id];
      root.innerHTML = `
        <div class="chat">
          <div class="chat-top"><button class="icon-btn" data-act="back" data-fallback="#messaggi" aria-label="Indietro"><i class="ph-light ph-caret-left"></i></button>${avatarRing(th.id, 'sm')}<div><strong>${a.name}</strong><small>${a.country}</small></div></div>
          <div class="bubbles" id="bubbles">${th.msgs.length ? th.msgs.map(([who, text]) => `<p class="bubble ${who === 'me' ? 'me' : ''}">${text}</p>`).join('') : `<div class="empty"><strong>Inizia tu</strong><p>Scrivi il primo messaggio a ${a.name.split(' ')[0]}.</p></div>`}</div>
          <form class="composer" data-thread="${th.id}"><label class="sr-only" for="msgInput" hidden>Messaggio</label><input id="msgInput" placeholder="Scrivi un messaggio" autocomplete="off"><button aria-label="Invia"><i class="ph-light ph-paper-plane-right"></i></button></form>
        </div>`;
      if (!THREADS.includes(th)) THREADS.unshift(th);
      $('#bubbles').lastElementChild?.scrollIntoView({ block: 'end' });
      return;
    }
    root.innerHTML = `
      <div class="msg-head">${crop('messaggi')}<h1>Messaggi</h1><button class="icon-btn" data-act="soon" aria-label="Nuovo messaggio"><i class="ph-light ph-note-pencil"></i></button></div>
      ${THREADS.map(t => {
        const last = t.msgs[t.msgs.length - 1];
        return `<a class="thread ${t.unread ? 'unread' : ''}" href="#messaggi/${t.id}">${avatarRing(t.id, 'sm').replace(/<a /, '<span ').replace(/<\/a>$/, '</span>').replace(/href="[^"]*"/, '')}
          <div style="min-width:0"><strong>${ARTISTS[t.id].name}</strong><p>${last ? (last[0] === 'me' ? 'Tu: ' : '') + last[1] : ''}</p></div>
          <time>${t.time}${t.unread ? `<span class="badge">${t.unread}</span>` : ''}</time></a>`;
      }).join('')}`;
  }

  /* ---------------- 13. Impostazioni ---------------- */
  function renderSettings() {
    const code = store.get('novae.in') || 'NVE-ALFA';
    const toggles = store.get('novae.toggles') ? JSON.parse(store.get('novae.toggles')) : { priv: false, notif: true, auto: true, rate: true };
    const sw = (k, label, sub) => `<div class="set-row"><span>${label}<small>${sub}</small></span><label class="switch"><input type="checkbox" data-toggle="${k}" ${toggles[k] ? 'checked' : ''} aria-label="${label}"><span></span></label></div>`;
    $('#settings').innerHTML = `
      <div class="set-head">${crop('impostazioni')}<h1>Impostazioni</h1></div>
      <div class="set-group"><h2>Account</h2>
        <button class="set-row set-link" data-act="edit-profile"><span>Modifica profilo<small>${ARTISTS.me.name}, @${ARTISTS.me.handle}</small></span><i class="ph-light ph-caret-right"></i></button>
        ${sw('priv', 'Profilo privato', 'Solo chi segui vede le tue opere')}
        <div class="set-row"><span>Lingua<small>Interfaccia</small></span><select aria-label="Lingua"><option>Italiano</option><option>English</option><option>ไทย</option></select></div>
      </div>
      <div class="set-group"><h2>Esperienza</h2>
        ${sw('notif', 'Notifiche Novae', 'Quando un artista che segui pubblica')}
        ${sw('auto', 'Riproduzione automatica', 'Video e audio nel feed')}
        ${sw('rate', 'Mostra valutazioni', 'Le stelle rosse sopra le opere')}
      </div>
      <div class="set-group"><h2>Inviti</h2>
        <div class="set-row"><span>Il tuo codice<small>Sei entrato con questo invito</small></span><span class="invite-code">${code}</span></div>
        <div class="set-row"><span>Invita un artista<small>Hai 3 inviti disponibili</small></span><button class="btn-ghost" data-act="invite">Genera</button></div>
      </div>
      <div class="set-group">
        <div class="set-row"><span class="danger">Esci da NOVAE</span><button class="btn-ghost danger" data-act="logout">Esci</button></div>
      </div>`;
  }

  /* ---------------- Search ---------------- */
  function openSearch() {
    $('#search').hidden = false;
    $('#q').value = '';
    renderResults('');
    setTimeout(() => $('#q').focus(), 30);
  }
  function renderResults(q) {
    q = q.trim().toLowerCase();
    const works = WORKS.filter(w => !q || w.t.toLowerCase().includes(q) || w.disc.toLowerCase().includes(q) || ARTISTS[w.a].country.toLowerCase().includes(q)).slice(0, 8);
    const artists = AIDS.filter(id => !q || ARTISTS[id].name.toLowerCase().includes(q) || ARTISTS[id].country.toLowerCase().includes(q)).slice(0, 5);
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
  function openSheet(html) {
    clearTimeout(sheetT); // a pending close must not hide the sheet we are opening now
    if (!$('#sheet').classList.contains('open')) sheetOpener = document.activeElement;
    $('#sheetBody').innerHTML = html;
    $('#sheet').hidden = false;
    requestAnimationFrame(() => {
      $('#sheet').classList.add('open'); $('#sheetScrim').classList.add('open');
      // with a mouse/keyboard, focus the first field so you can type right away (on phones, don't pop the keyboard unasked)
      const field = $('#sheetBody input:not([type=file]), #sheetBody textarea');
      if (field && matchMedia('(hover: hover)').matches) field.focus({ preventScroll: true });
    });
  }
  function closeSheet() {
    if (!$('#sheet').classList.contains('open')) return;
    $('#sheet').classList.remove('open'); $('#sheetScrim').classList.remove('open');
    sheetT = setTimeout(() => { $('#sheet').hidden = true; }, 400);
    sheetOpener?.focus?.({ preventScroll: true }); // give focus back to what opened it
    sheetOpener = null;
  }
  let toastT;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
  }
  const COMMENTS = [['kitti', 'Il taglio di luce al minuto due. Come hai fatto?'], ['mara', 'Questo mi ha fatto venire voglia di registrare il mare.'], ['ananya', 'Cinque stelle, senza pensarci.']];

  /* ---------------- Router ---------------- */
  const RENDER = {
    invito: () => drawQR(),
    hub: renderHub,
    novae: renderFeed,
    vista: renderVista,
    seguiti: renderSeguiti,
    stile: renderStile,
    disciplina: renderCine,
    opera: renderDetail,
    scopri: initGlobe,
    mercato: renderMarket,
    profilo: () => renderProfile(),
    artista: renderProfile,
    messaggi: renderMessages,
    impostazioni: renderSettings,
  };
  const TITLES = {
    invito: 'Invito', novae: 'Novae', vista: 'Opera', seguiti: 'Seguiti', stile: 'Stile', disciplina: 'Cinematografia', opera: 'Opera',
    scopri: 'Scopri', mercato: 'Mercato', profilo: 'Profilo', artista: 'Artista', messaggi: 'Messaggi', impostazioni: 'Impostazioni',
  };
  const scrollMemo = new Map(); // hash -> scrollY, so "back" lands where you left
  let curHash = null;
  const trail = []; // visited hashes, so the back button knows if history.back() stays inside NOVAE
  function route() {
    if (curHash !== null) scrollMemo.set(curHash, window.scrollY);
    curHash = location.hash;
    if (trail.length > 1 && trail[trail.length - 2] === curHash) trail.pop(); else trail.push(curHash);
    let [name, param] = decodeURIComponent(location.hash.slice(1)).split('/');
    if (name === 'galleria') name = 'seguiti';
    if (!store.get('novae.in')) name = 'invito';
    else if (!name || name === 'invito' || !(name in RENDER)) name = 'hub';
    if (name === 'stile' && param) name = 'disciplina';
    const screen = name === 'artista' ? 'profilo' : name;
    setArc(false);
    closeSheet();
    $('#search').hidden = true;
    $$('.screen').forEach(s => s.classList.toggle('active', s.dataset.screen === screen));
    document.body.dataset.screen = screen;
    document.title = name === 'hub' ? 'NOVAE' : `${TITLES[name] || ''} | NOVAE`;
    if (HUB.some(h => h.k === name)) { prefs.lastHub = name; savePrefs(); }
    cur = { name, param };
    RENDER[name](param);
    const y = scrollMemo.get(curHash) || 0;
    window.scrollTo(0, 0);
    if (y) requestAnimationFrame(() => window.scrollTo(0, y));
  }
  let cur = { name: '', param: '' };
  // Re-render the current screen in place (after follow, publish, edits...), keeping the scroll position
  function refresh() {
    const y = window.scrollY;
    RENDER[cur.name]?.(cur.param);
    requestAnimationFrame(() => window.scrollTo(0, y));
  }
  // Pull to refresh on the feed (touch): pull down from the top, release to get a fresh order
  (() => {
    let y0 = null, dy = 0, busy = false;
    const ptr = $('#ptr');
    const reset = () => { ptr.classList.remove('ready', 'spin'); ptr.style.removeProperty('--pull'); ptr.style.opacity = ''; };
    window.addEventListener('touchstart', e => {
      if (cur.name !== 'novae' || window.scrollY > 0 || busy) return;
      y0 = e.touches[0].clientY; dy = 0;
    }, { passive: true });
    window.addEventListener('touchmove', e => {
      if (y0 === null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      ptr.style.setProperty('--pull', Math.min(dy, 110) + 'px');
      ptr.style.opacity = Math.min(1, dy / 70);
      ptr.classList.toggle('ready', dy > 70);
    }, { passive: true });
    window.addEventListener('touchend', () => {
      if (y0 === null) return;
      y0 = null;
      if (dy <= 70) { reset(); return; }
      busy = true; buzz();
      ptr.classList.add('spin');
      setTimeout(() => {
        for (let i = FEED.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [FEED[i], FEED[j]] = [FEED[j], FEED[i]]; }
        renderFeed(); reset(); busy = false;
        toast('Feed aggiornato');
      }, 900);
    });
  })();

  function goBack(fallback) {
    if (trail.length > 1) history.back(); else location.hash = fallback;
  }

  /* double-tap / double-click to like, with a heart burst */
  let dblTimer = null, dblEl = null;
  function setLike(w, on) {
    on ? liked.add(w.id) : liked.delete(w.id);
    saveLikes();
    $$(`[data-act="like"][data-id="${w.id}"]`).forEach(b => {
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
      b.querySelector('i').className = `${on ? 'ph-fill' : 'ph-light'} ph-heart`;
      b.classList.remove('pop'); void b.offsetWidth; if (on) b.classList.add('pop');
    });
    $$(`[data-count="${w.id}"]`).forEach(s => s.textContent = fmt(likeCount(w)));
    if (on) buzz();
  }
  function burst(host, e) {
    const r = host.getBoundingClientRect();
    const b = document.createElement('span');
    b.className = 'burst';
    b.innerHTML = '<i class="ph-fill ph-heart"></i>';
    b.style.setProperty('--x', (e.clientX - r.left) + 'px');
    b.style.setProperty('--y', (e.clientY - r.top) + 'px');
    host.appendChild(b);
    setTimeout(() => b.remove(), 900);
  }

  /* ---------------- Events ---------------- */
  document.addEventListener('load', e => {
    if (e.target.tagName === 'IMG') { e.target.classList.add('loaded'); e.target.parentElement?.classList.add('loaded'); }
  }, true);

  document.addEventListener('click', e => {
    // Double-tap target: first tap waits briefly, second tap likes instead of opening
    const dbl = e.target.closest('[data-dbl]');
    if (dbl && !e.target.closest('[data-act]')) {
      e.preventDefault();
      if (dblTimer && dblEl === dbl) {
        clearTimeout(dblTimer); dblTimer = null;
        const w = byId[dbl.dataset.dbl];
        if (!liked.has(w.id)) setLike(w, true);
        burst(dbl, e);
        return;
      }
      clearTimeout(dblTimer);
      dblEl = dbl;
      dblTimer = setTimeout(() => {
        dblTimer = null;
        const h = dbl.getAttribute('href');
        if (h) { location.hash = h; return; }
        const reel = dbl.closest('.reel'); // single tap on a reel: pause / resume video and audio
        if (reel && reel.dataset.type !== 'image') reel.classList.toggle('paused');
      }, 260);
      return;
    }
    if (e.target.closest('.sr')) addRecent($('#q').value);
    if (e.target.closest('#arc')) {
      // pointer taps are handled by the wheel (spin, then open); keyboard Enter (detail 0) follows the link
      if (e.detail === 0 && e.target.closest('.arc-item')) setArc(false); else e.preventDefault();
      return;
    }
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    const w = byId[el.dataset.id];
    switch (act) {
      case 'arc': setArc(el.getAttribute('aria-expanded') !== 'true'); break;
      case 'arc-close': setArc(false); break;
      case 'search': openSearch(); break;
      case 'search-close': $('#search').hidden = true; break;
      case 'sheet-close': closeSheet(); break;
      case 'back': goBack(el.dataset.fallback || '#hub'); break;
      case 'recent': $('#q').value = el.dataset.v; renderResults(el.dataset.v); $('#q').focus(); break;
      case 'recent-clear': recent = []; store.del('novae.recent'); renderResults(''); break;
      case 'like': setLike(w, !liked.has(w.id)); break;
      case 'share': {
        const url = location.href.split('#')[0] + '#opera/' + w.id;
        if (navigator.share) navigator.share({ title: w.t, url }).catch(() => {});
        else navigator.clipboard?.writeText(url).then(() => toast('Link copiato'), () => toast('Link: ' + url));
        break;
      }
      case 'comments':
        openSheet(`<h3>${fmt(w.comments)} commenti</h3>${w.comments ? COMMENTS.map(([id, t]) => `<div class="comment">${avatarRing(id, 'sm')}<div><strong>${ARTISTS[id].name}</strong><p>${t}</p></div></div>`).join('') : '<p>Ancora nessun commento. Scrivi il primo.</p>'}
          <form class="composer" data-comment="${w.id}"><input placeholder="Aggiungi un commento" aria-label="Commento" autocomplete="off"><button aria-label="Invia"><i class="ph-light ph-paper-plane-right"></i></button></form>`);
        break;
      case 'info':
        openSheet(`<h3>${w.t}</h3>${rating(w.rating, 18)}<p style="margin-top:12px">${w.desc}</p><p style="margin-top:8px;color:var(--ink-3)">${ARTISTS[w.a].name}, ${w.disc.toLowerCase()}, ${w.year}</p><a class="btn-ghost" href="#opera/${w.id}">Scheda completa</a>`);
        break;
      case 'more':
        openSheet(`<h3>${w.t}</h3><div class="action-list">
          <button data-act="save" data-id="${w.id}"><i class="ph-light ph-bookmark-simple"></i>${saved.has(w.id) ? 'Rimuovi dai salvati' : 'Salva'}</button>
          <button data-act="copy-link" data-id="${w.id}"><i class="ph-light ph-link-simple"></i>Copia link</button>
          <a href="${profileHref(w.a)}"><i class="ph-light ph-user"></i>${w.a === 'me' ? 'Vai al tuo profilo' : 'Vai a ' + ARTISTS[w.a].name}</a>
          ${w.a === 'me'
            ? `<button class="danger" data-act="delete" data-id="${w.id}"><i class="ph-light ph-trash"></i>Elimina opera</button>`
            : `<button class="danger" data-act="report"><i class="ph-light ph-flag"></i>Segnala</button>`}
        </div>`);
        break;
      case 'save': {
        const on = !saved.has(w.id);
        on ? saved.add(w.id) : saved.delete(w.id);
        saveSaved();
        $$(`.act[data-act="save"][data-id="${w.id}"]`).forEach(b => {
          b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
          b.querySelector('i').className = `${on ? 'ph-fill' : 'ph-light'} ph-bookmark-simple`;
        });
        if (el.closest('.sheet')) closeSheet();
        toast(on ? 'Salvata nel tuo profilo' : 'Rimossa dai salvati');
        if (on) buzz();
        break;
      }
      case 'copy-link': {
        const url = location.href.split('#')[0] + '#opera/' + w.id;
        navigator.clipboard?.writeText(url).then(() => toast('Link copiato'), () => toast(url));
        closeSheet();
        break;
      }
      case 'report': closeSheet(); toast('Grazie, la controlleremo'); break;
      case 'delete':
        openSheet(`<h3>Eliminare "${w.t}"?</h3><p>Sparisce dal feed e dal tuo profilo. Non si può annullare.</p>
          <div class="action-list"><button class="danger" data-act="delete-yes" data-id="${w.id}"><i class="ph-light ph-trash"></i>Elimina</button>
          <button data-act="sheet-close"><i class="ph-light ph-x"></i>Annulla</button></div>`);
        break;
      case 'delete-yes': deleteMine(el.dataset.id); break;
      case 'publish': openPublish(); break;
      case 'expand': el.classList.toggle('open'); break;
      case 'edit-profile': openEditProfile(); break;
      case 'play': {
        const box = el.closest('.vista, .player');
        const playing = !box.classList.contains('playing');
        box.classList.toggle('playing', playing);
        if (playing) toast('Anteprima: il player vero arriva nella prossima alpha');
        break;
      }
      case 'vista-step': stepVista(+el.dataset.dir); break;
      case 'gfilter': prefs.seguiti = el.dataset.v; savePrefs(); renderSeguiti(); break;
      case 'ctab':
        if (el.dataset.v === 'Ordina per') cineState.sortOpen = !cineState.sortOpen;
        else { cineState.tab = prefs.cineTab = el.dataset.v; cineState.sortOpen = false; cineState.expanded = null; savePrefs(); }
        renderCine('cinematografia'); break;
      case 'csort': cineState.sort = prefs.cineSort = el.dataset.v; cineState.sortOpen = false; savePrefs(); renderCine('cinematografia'); break;
      case 'cf': cineState.center[el.dataset.g] = +el.dataset.i; cineState.expanded = null; renderCine('cinematografia'); break;
      case 'expand': cineState.expanded = el.dataset.id; renderCine('cinematografia'); break;
      case 'collapse': cineState.expanded = null; renderCine('cinematografia'); break;
      case 'related': {
        const open = el.getAttribute('aria-expanded') !== 'true';
        el.setAttribute('aria-expanded', open);
        $('#relPanel').classList.toggle('open', open);
        break;
      }
      case 'country-prev': selectCountry(globe.idx - 1); break;
      case 'country-next': selectCountry(globe.idx + 1); break;
      case 'ptab': profTab = el.dataset.v; renderProfile(el.dataset.a || undefined); break;
      case 'follow': {
        const id = el.dataset.a;
        followed.has(id) ? followed.delete(id) : followed.add(id);
        saveFollowed();
        toast(followed.has(id) ? `Ora segui ${ARTISTS[id].name}` : `Non segui più ${ARTISTS[id].name}`);
        if (followed.has(id)) buzz();
        refresh();
        break;
      }
      case 'buy': toast('Acquisto in crediti disponibile a breve'); break;
      case 'invite': {
        const c = 'NVE-' + Math.random().toString(36).slice(2, 6).toUpperCase();
        navigator.clipboard?.writeText(c).catch(() => {});
        toast(`Nuovo invito: ${c} (copiato)`);
        break;
      }
      case 'logout': store.del('novae.in'); location.hash = '#invito'; break;
      case 'soon': toast('Presto disponibile'); break;
    }
  });

  document.addEventListener('submit', e => {
    const f = e.target;
    if (f.id === 'pubForm') { e.preventDefault(); submitPublish(f); return; }
    if (f.id === 'profForm') { e.preventDefault(); submitProfile(); return; }
    if (f.classList.contains('composer')) {
      e.preventDefault();
      const input = f.querySelector('input');
      const text = input.value.trim();
      if (!text) return;
      if (f.dataset.thread) {
        const th = THREADS.find(t => t.id === f.dataset.thread);
        th.msgs.push(['me', text]); th.time = 'ora';
        renderMessages(th.id);
        $('#msgInput').focus();
      } else {
        f.insertAdjacentHTML('beforebegin', `<div class="comment"><span class="avatar-ring sm" style="display:grid;place-items:center;--w:24px">${crop('profilo')}</span><div><strong>Tu</strong><p>${text.replace(/</g, '&lt;')}</p></div></div>`);
        input.value = '';
      }
    }
  });

  document.addEventListener('change', e => {
    if (e.target.id === 'pubFile') { onPubFile(e.target.files[0]); return; }
    const k = e.target.dataset.toggle;
    if (!k) return;
    const t = store.get('novae.toggles') ? JSON.parse(store.get('novae.toggles')) : { priv: false, notif: true, auto: true, rate: true };
    t[k] = e.target.checked;
    store.set('novae.toggles', JSON.stringify(t));
  });

  $('#q').addEventListener('input', e => renderResults(e.target.value));

  $('#q').addEventListener('keydown', e => { if (e.key === 'Enter') addRecent(e.target.value); });

  document.addEventListener('keydown', e => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
    const scr = document.body.dataset.screen;
    if (e.key === 'Escape') { setArc(false); closeSheet(); $('#search').hidden = true; return; }
    if ($('#arc').classList.contains('open')) {
      const dir = { ArrowRight: -1, ArrowDown: -1, ArrowLeft: 1, ArrowUp: 1 }[e.key];
      if (dir) { e.preventDefault(); wheel.live = true; spinTo(snapRot(wheel.rot) + dir * STEP, 260); return; }
      if (e.key === 'Enter' && !e.target.closest?.('.arc-item')) { e.preventDefault(); wheelGo(selIndex()); return; }
    }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/' && store.get('novae.in')) { e.preventDefault(); openSearch(); }
    if (scr === 'vista' && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); stepVista(e.key === 'ArrowDown' ? 1 : -1); }
    if (scr === 'scopri' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) selectCountry(globe.idx + (e.key === 'ArrowRight' ? 1 : -1));
  });

  window.addEventListener('hashchange', route);

  drawSky();
  renderArc();
  route();
})();
