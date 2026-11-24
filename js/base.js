/* NOVAE · Shared helpers, language, icons, mock data, saved state, small HTML fragments and the starry sky.
   The js/*.js files are plain scripts that share one scope, loaded in order by index.html. */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* storage blocked */ } },
};

/* ---------------- Language: Italian (source) or English (i18n.js) ---------------- */
// Chosen in Settings; the first time it follows the phone's language
const LANG = (v => v === 'it' || v === 'en' ? v : (navigator.language || '').toLowerCase().startsWith('it') ? 'it' : 'en')(store.get('novae.lang'));
const LOCALE = LANG === 'en' ? 'en-GB' : 'it-IT';
const T = s => LANG === 'en' && window.NOVAE_I18N ? NOVAE_I18N.en.tr(s) : s;
const fmt = n => n.toLocaleString(LOCALE);
if (LANG === 'en' && window.NOVAE_I18N) {
  // every interface text the app renders (text, placeholder, aria-label, title, prefilled values) is swapped as it appears
  document.documentElement.lang = 'en';
  const ATTRS = ['placeholder', 'aria-label', 'title', 'value'];
  const fixText = n => { const v = T(n.data); if (v !== n.data) n.data = v; };
  const fixEl = el => ATTRS.forEach(a => {
    const v = el.getAttribute(a);
    if (!v || (a === 'value' && el.tagName !== 'INPUT')) return;
    const t = T(v); if (t !== v) el.setAttribute(a, t);
  });
  const walk = root => {
    if (root.nodeType === 3) return fixText(root);
    if (root.nodeType !== 1 || root.matches('script, style')) return;
    fixEl(root); root.querySelectorAll('*').forEach(fixEl);
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) if (!n.parentElement.closest('script, style')) fixText(n);
  };
  const observe = () => {
    mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    mo.observe(document.head, { childList: true, subtree: true, characterData: true }); // the page title
  };
  const mo = new MutationObserver(ms => {
    mo.disconnect(); // our own swaps must not trigger it again
    try {
      for (const m of ms) m.type === 'characterData' ? fixText(m.target) : m.type === 'attributes' ? fixEl(m.target) : m.addedNodes.forEach(walk);
    } catch (err) { console.warn('i18n', err); } finally { observe(); } // one odd node must never switch translation off
  });
  walk(document.body); walk(document.querySelector('title')); observe();
}
const rng = seed => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const pic = (seed, w, h, gray) => `https://picsum.photos/seed/novae-${seed}/${w}/${h}${gray ? '?grayscale' : ''}`;
const img = (src, alt = '', cls = '') => `<img class="fade ${cls}" src="${src}" alt="${alt}" loading="lazy" decoding="async">`;

/* ---------------- Icons: the hand-drawn sketches in assets/icone/, traced to SVG in assets/svg/ ---------------- */
const crop = (name, extra = '') => `<img class="crop ${extra}" src="assets/svg/${name}.svg" alt="" aria-hidden="true" draggable="false"${name === 'wordmark' ? ' style="--ar:.26"' : ''}>`;
// The red star is the NOVAE logo itself
const STAR_SRC = 'assets/svg/stella.svg';
const starSvg = (cls = '') => `<img class="star-svg ${cls}" src="${STAR_SRC}" alt="" aria-hidden="true" draggable="false">`;
const icon = key => {
  if (key === 'novae') return crop('novae'); // telescope and stars (the NOVAE star stays the logo in the middle)
  if (key === 'galleria' || key === 'scopri') return `<img class="icon-png" src="assets/svg/${key}.svg" alt="" aria-hidden="true" draggable="false">`;
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
  giulia: { name: 'Giulia Ferri',     handle: 'giulia.critica', country: 'Italia',  bio: 'Critica. Scrivo di cinema indipendente e pittura contemporanea.', type: 'critico' },
  teo:    { name: 'Teo Marini',       handle: 'teo.guarda',  country: 'Francia',    bio: 'Guardo, salvo, voto. Non creo (ancora).', type: 'utente' },
};
const AIDS = Object.keys(ARTISTS);
const avatar = id => id === 'me' ? ME_AVATAR : pic('av-' + id, 160, 160, true);
const ME_AVATAR = 'assets/svg/profilo-avatar.svg'; // the hand-drawn profile silhouette, same as the Profilo screen
// Profile types: what each can do and what their profile shows
const TYPES = {
  artista: { label: 'Artista', icon: 'paint-brush', hint: 'Pubblica opere' },
  critico: { label: 'Critico', icon: 'pen-nib', hint: 'Scrive recensioni' },
  utente:  { label: 'Utente',  icon: 'eye', hint: 'Guarda, salva e vota' },
};
const typeOf = aid => ARTISTS[aid]?.type || 'artista';

// Galleria categories, in this order
const DISCIPLINES = [
  'Pittura e illustrazione', 'Musica', 'Letteratura', 'Cinema e video', 'Fotografia', 'Design', 'Architettura',
  'Moda', 'Scultura', 'Fumetto', 'Animazione', 'Teatro e performance', 'Danza', 'Street art', 'Artigianato',
  'Installazione e arti ambientali', 'Arti digitali e tecnologiche', 'Videogiochi e arti interattive',
  'Arti culinarie', 'Body art', 'Arte memetica',
];
const CINEMA = 'Cinema e video'; // the category with its own page (rows of films by genre)
const slugOf = d => d.toLowerCase().replace(/\s+/g, '-');
// old category names (works published before the new list) -> new ones
const LEGACY_DISC = { Cinematografia: CINEMA, Pittura: 'Pittura e illustrazione', Illustrazione: 'Pittura e illustrazione', Poesia: 'Letteratura' };
const discOf = d => LEGACY_DISC[d] || d;

// sample descriptions: the film ones only go on films
const FILM_DESCS = [
  'Girato in tre notti con una sola lente. Il suono è registrato sul posto, senza doppiaggio.',
  'Nasce da un quaderno di appunti lasciato a metà. Ogni scena corrisponde a una pagina.',
  'Prima opera pubblicata su NOVAE. Montaggio lento, pochi dialoghi, molto mare.',
  'Realizzato insieme a una comunità di pescatori. Nessun attore professionista.',
];
const ART_DESCS = [
  'Un lavoro sulla distanza tra chi parte e chi resta, costruito con materiali trovati.',
  'Studio sul colore rosso e su quanto a lungo si può guardare un punto fisso.',
  "Fa parte di una serie iniziata d'inverno. Ogni pezzo nasce da un solo gesto, senza correzioni.",
  'Nato da un quaderno di appunti lasciato a metà e ripreso anni dopo.',
  "Fatto in una settimana, di notte, con quello che c'era in studio.",
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
    desc: (d => d[Math.floor(r() * d.length)])(o.disc === CINEMA || o.disc === 'Animazione' ? FILM_DESCS : ART_DESCS),
    ago: 4 + Math.floor(r() * r() * 5000), // minutes since it was published
    ...o,
  };
  w.views = Math.floor(w.likes * (2.2 + r() * 4));
  w.comments = Math.floor(w.likes / (28 + r() * 30));
  w.price = Math.floor(40 + r() * 900);
  const side = 40 + Math.floor(r() * 9) * 10, ar = (o.w || 1200) / (o.h || 900); // sample size in cm, long side 40-120
  w.cm = ar >= 1 ? [side, Math.round(side / ar)] : [Math.round(side * ar), side];
  w.img = pic(w.id, o.w || 1200, o.h || 900);
  w.thumb = pic(w.id, 480, Math.round(480 * (o.h || 900) / (o.w || 1200)));
  // sample "prima e dopo" and process posts: the same photo, grey and blurred, stands in for the sketch and the stages
  const stage = (blur, gray) => `${pic(w.id, o.w || 1200, o.h || 900, gray)}${gray ? '&' : '?'}blur=${blur}`;
  if (o.demo === 'cmp') w.before = stage(3, true);
  if (o.demo === 'steps') w.steps = [stage(10, true), stage(4, true), stage(1, true), stage(2)];
  // "In the making": what's behind the work, one swipe to the side of the post (every other sample work)
  if (!o.demo && o.type !== 'audio' && wid % 2 === 0) w.making = [{ src: stage(6, true), cap: 'Bozza' }, { src: pic('studio-' + w.id, o.w || 1200, o.h || 900), cap: 'Nello studio' }];
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
  titles.forEach((t, i) => addWork({ t, a: filmArtists[(i + gi * 2) % filmArtists.length], type: 'video', disc: CINEMA, genre, kind: i % 3 === 0 ? 'Serie' : 'Film' })));

const FEED_SRC = [
  { t: 'Il rumore dei ciottoli', a: 'aiko', type: 'video', disc: CINEMA },
  { t: 'Crepa n. 3', a: 'nicolo', type: 'image', disc: 'Pittura e illustrazione', w: 900, h: 1200 },
  { t: 'Notturno a Yaowarat', a: 'kitti', type: 'image', disc: 'Fotografia' },
  { t: 'Sale e ferro', a: 'mara', type: 'audio', disc: 'Musica' },
  { t: 'Muro di via Allende', a: 'ruben', type: 'image', disc: 'Pittura e illustrazione', w: 1200, h: 800, demo: 'steps' },
  { t: 'Testa di bullone', a: 'ines', type: 'image', disc: 'Scultura', w: 900, h: 1150 },
  { t: 'Lettera senza vocali', a: 'ananya', type: 'image', disc: 'Letteratura', w: 1000, h: 1000 },
  { t: 'La volpe e il monsone', a: 'ploy', type: 'video', disc: 'Animazione' },
  { t: 'Fischio di mezzanotte', a: 'mara', type: 'audio', disc: 'Musica' },
  { t: 'Porto di Catania, ore 6', a: 'nicolo', type: 'image', disc: 'Pittura e illustrazione', w: 1200, h: 850, demo: 'cmp' },
  { t: 'Neon su Rua Augusta', a: 'thiago', type: 'video', disc: 'Street art' },
  { t: 'Soglia', a: 'ines', type: 'image', disc: 'Scultura', w: 850, h: 1200 },
  // a "utente": publishes only for followers
  { t: 'Quaderno di Lione', a: 'teo', type: 'image', disc: 'Pittura e illustrazione', audience: 'followers' },
  { t: 'Finestra, martedì', a: 'teo', type: 'image', disc: 'Fotografia', w: 900, h: 1200, audience: 'followers' },
  // one sample post for every other category, so each category tag shows up in the feed (added last: older ids stay the same)
  { t: 'Sedia per chi aspetta', a: 'ines', type: 'image', disc: 'Design', w: 1000, h: 1000, mix: 1 },
  { t: 'Casa sul canale', a: 'livia', type: 'image', disc: 'Architettura', w: 1200, h: 850, mix: 1 },
  { t: 'Cappotto di rete', a: 'kitti', type: 'image', disc: 'Moda', w: 900, h: 1200, mix: 1 },
  { t: 'Il gatto del faro, tavola 4', a: 'ploy', co: 'ananya', type: 'image', disc: 'Fumetto', w: 900, h: 1250, mix: 1 },
  { t: 'Monologo per una sedia vuota', a: 'thiago', type: 'video', disc: 'Teatro e performance', mix: 1 },
  { t: 'Prova delle sei', a: 'aiko', type: 'video', disc: 'Danza', mix: 1 },
  { t: 'Ciotola di Oaxaca', a: 'ruben', type: 'image', disc: 'Artigianato', w: 1000, h: 1000, mix: 1 },
  { t: 'Cento lanterne sul fiume', a: 'kitti', type: 'image', disc: 'Installazione e arti ambientali', w: 1200, h: 800, mix: 1 },
  { t: 'Rumore bianco, versione 2', a: 'mara', type: 'video', disc: 'Arti digitali e tecnologiche', mix: 1 },
  { t: 'Isola senza mappa', a: 'thiago', type: 'video', disc: 'Videogiochi e arti interattive', mix: 1 },
  { t: 'Risotto al nero, in tre passaggi', a: 'nicolo', type: 'image', disc: 'Arti culinarie', w: 1000, h: 1000, mix: 1 },
  { t: 'Mano di henné', a: 'ananya', type: 'image', disc: 'Body art', w: 900, h: 1200, mix: 1 },
  { t: 'Quando compila al primo colpo', a: 'livia', type: 'image', disc: 'Arte memetica', w: 1000, h: 1000, mix: 1 },
];
const FEED = FEED_SRC.map(addWork);
// interleave a few films into the feed
FEED.splice(2, 0, byId.w1);
FEED.splice(6, 0, byId.w9);
// and spread the per-category samples through it, one every other post
FEED.filter(w => w.mix).forEach((w, k) => { FEED.splice(FEED.indexOf(w), 1); FEED.splice(1 + k * 2, 0, w); });

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
const prefs = Object.assign({ cineTab: 'Film', cineSort: 'recenti', country: 0, lastHub: '' }, readJSON('novae.prefs', {}));
const savePrefs = () => store.set('novae.prefs', JSON.stringify(prefs));
let recent = readJSON('novae.recent', []);
const addRecent = q => { q = q.trim(); if (q.length < 2) return; recent = [q, ...recent.filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, 6); store.set('novae.recent', JSON.stringify(recent)); };
const buzz = () => { try { navigator.vibrate?.(12); } catch { /* unsupported */ } };
const saved = new Set(readJSON('novae.saved', []));
const saveSaved = () => store.set('novae.saved', JSON.stringify([...saved]));

// You: editable profile + the works you publish (images kept as compressed data URLs, on this device only)
const profile = Object.assign({ name: T('Il tuo nome'), handle: LANG === 'en' ? 'yourname' : 'tuonome', bio: '', link: '', type: 'artista', banner: '' }, readJSON('novae.profile', {}));
// the old default bio was a placeholder saved as real text: it's an empty bio (the profile invites you to write one)
if (/^(Scrivi qui chi sei e cosa crei|Write who you are and what you make)/.test(profile.bio)) profile.bio = '';
ARTISTS.me = { name: profile.name, handle: profile.handle, country: 'Italia', bio: profile.bio, type: profile.type };
const MINE = readJSON('novae.mine', []);
MINE.forEach(w => { w.disc = discOf(w.disc); WORKS.unshift(w); byId[w.id] = w; });
function saveMine() {
  try { localStorage.setItem('novae.mine', JSON.stringify(MINE)); return true; } catch { return false; }
}
const profileHref = aid => aid === 'me' ? '#profilo' : '#artista/' + aid;
const agoText = w => {
  const m = w.ts ? Math.max(1, Math.round((Date.now() - w.ts) / 60000)) : w.ago;
  if (m < 60) return `${m} min`;
  if (m < 1440) return `${Math.round(m / 60)} h`;
  if (m < 7 * 1440) return `${Math.round(m / 1440)} g`;
  // older than a week: the date (“400 g” means nothing to anyone), with the year only when it isn't this one
  const d = new Date(Date.now() - m * 60000);
  return d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', ...(d.getFullYear() !== new Date().getFullYear() && { year: 'numeric' }) }).replace('.', '');
};
// “1 opera”, not “1 opere”: the singular of the labels shown next to a count
const ONE = { opere: 'opera', recensioni: 'recensione', salvate: 'salvata', seguiti: 'seguito', seguaci: 'seguace', cuori: 'cuore', lettori: 'lettore', ripubblicazioni: 'ripubblicazione', visualizzazioni: 'visualizzazione',
  'mi piace': 'mi piace⁠' }; // same word in Italian; the invisible mark lets i18n.js say “1 like”
const label = (n, many) => String(n) === '1' ? ONE[many] || many : many;

/* ---------------- Shared fragments ---------------- */
const rating = (v, size = 18) => {
  // the red star is the NOVAE logo star, not a redrawing
  const one = `<img src="${STAR_SRC}" alt="" draggable="false">`;
  return `<span class="rating" style="--s:${size}px" role="img" aria-label="Valutazione ${String(v).replace('.', ',')} su 5"><span class="r-off">${one.repeat(5)}</span><span class="r-on" style="width:${v / 5 * 100}%">${one.repeat(5)}</span></span>`;
};
const heart = (w, withCount = false, cls = '') => {
  const on = liked.has(w.id);
  return `<button class="act like ${on ? 'on' : ''} ${cls}" data-act="like" data-id="${w.id}" aria-pressed="${on}" aria-label="Mi piace"><i class="${on ? 'ph-fill' : 'ph-light'} ph-heart"></i>${withCount ? `<small data-count="${w.id}">${fmt(likeCount(w))}</small>` : ''}</button>`;
};
const shareBtn = w => `<button class="act" data-act="share" data-id="${w.id}" aria-label="Condividi"><i class="ph-light ph-arrow-bend-up-right"></i></button>`;
const commentBtn = w => `<button class="act" data-act="comments" data-id="${w.id}" aria-label="Commenti"><i class="ph-light ph-chat-circle"></i></button>`;
// a work's authors, each name linking to its profile; in the narrow post header a collaboration uses first names ("Ploy e Ananya")
const byline = (w, cls = 'x-name') => [w.a, w.co].filter(Boolean).map(aid => `<a class="${cls}" href="${profileHref(aid)}">${w.co && cls ? ARTISTS[aid].name.split(' ')[0] : ARTISTS[aid].name}</a>`).join(' <span class="x-and">e</span> ');
const authorOf = (w, aid) => w.a === aid || w.co === aid;
// The colour of a work (Spotify-style): the most common saturated colour of a tiny copy of the image, cached per image
const TINTS = new Map();
function tintOf(src) {
  if (!TINTS.has(src)) TINTS.set(src, new Promise(res => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => {
      try {
        const c = document.createElement('canvas'); c.width = c.height = 24;
        const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0, 24, 24);
        const d = x.getImageData(0, 0, 24, 24).data, bins = {};
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2], sat = Math.max(r, g, b) - Math.min(r, g, b);
          const k = (r >> 5) << 6 | (g >> 5) << 3 | b >> 5, bin = bins[k] ||= [0, 0, 0, 0];
          const wt = 1 + sat / 16; // colourful pixels count more, so a grey sky doesn't win over a red boat
          bin[0] += r * wt; bin[1] += g * wt; bin[2] += b * wt; bin[3] += wt;
        }
        const top = Object.values(bins).sort((p, q) => q[3] - p[3])[0];
        res(top.slice(0, 3).map(v => Math.round(v / top[3])));
      } catch { res(null); } // a picture from a site that doesn't allow reading it
    };
    im.onerror = () => res(null);
    im.src = src;
  }));
  return TINTS.get(src);
}
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
