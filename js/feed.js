/* NOVAE · Scopri: Sfoglia (X-style feed), the comments page of a post and Scorri (full-screen reels).
   The js/*.js files are plain scripts that share one scope, loaded in order by index.html. */
'use strict';

/* ---------------- 3. Scopri: X-style feed ----------------
   Tap the picture: reels. Tap anywhere else on the post (the black sides) or the comment
   button: the post's comments page (#post/id), like on X. */
const reposted = new Set(readJSON('novae.reposted', []));
const hidden = new Set(readJSON('novae.hidden', [])); // "Non mi interessa"
// from the "•••" menu of a profile: muted = their works leave your feed; blocked = their works leave everywhere
const muted = new Set(readJSON('novae.muted', [])), blocked = new Set(readJSON('novae.blocked', []));
const saveMuted = () => store.set('novae.muted', JSON.stringify([...muted]));
const saveBlocked = () => store.set('novae.blocked', JSON.stringify([...blocked]));
const REPLIES_MINE = readJSON('novae.replies', {}); // your replies, per work
const repostCount = w => Math.floor(w.likes / 11) + (reposted.has(w.id) ? 1 : 0);
// short counts like X: 842, 4,2K, 242K, 1,3M
const dec = s => LANG === 'en' ? s.replace('.0', '') : s.replace('.', ',').replace(',0', ''); // 4.2K / 4,2K
const short = n => n < 1000 ? String(n) : n < 1e6 ? `${dec((n / 1e3).toFixed(n < 1e4 ? 1 : 0))}K` : `${dec((n / 1e6).toFixed(1))}M`;
const replyCount = w => w.comments + (REPLIES_MINE[w.id]?.length || 0);
const xActions = (w, big = false) => {
  const on = liked.has(w.id), rp = reposted.has(w.id);
  return `<div class="x-actions ${big ? 'big' : ''}">
    <button class="act like ${on ? 'on' : ''}" data-act="like" data-id="${w.id}" aria-pressed="${on}" aria-label="Mi piace"><i class="${on ? 'ph-fill' : 'ph-light'} ph-heart"></i><small data-count="${w.id}" data-short="1">${short(likeCount(w))}</small></button>
    <button class="act" data-act="thread" data-id="${w.id}" aria-label="Commenti"><i class="ph-light ph-chat-circle"></i><small>${short(replyCount(w))}</small></button>
    <button class="act repost ${rp ? 'on' : ''}" data-act="repost" data-id="${w.id}" aria-pressed="${rp}" aria-label="Ripubblica"><i class="ph-light ph-repeat"></i><small data-rp="${w.id}" data-short="1">${short(repostCount(w))}</small></button>
    ${shareBtn(w)}
    <button class="act" data-act="more" data-id="${w.id}" aria-label="Altre azioni"><i class="ph-light ph-dots-three"></i></button>
  </div>`;
};
// A "prima e dopo" (drag the bar to compare sketch and finished work) or a process (the stages play one after the other,
// see the ticker in app.js); any other work is just its picture
const workMedia = (w, src) => {
  if (w.before) return `<div class="cmp" style="--x:50%">${img(src, w.t)}${img(w.before, '', 'cmp-before')}<span class="cmp-line" aria-hidden="true"></span><span class="cmp-tag" aria-hidden="true">Prima</span><span class="cmp-tag after" aria-hidden="true">Dopo</span><input type="range" class="cmp-range" data-act="cmp" min="0" max="100" value="50" aria-label="Prima e dopo: trascina per confrontare"></div>`;
  if (!w.steps?.length) return img(src, w.t);
  const all = [...w.steps, src];
  return `<div class="steps" data-k="0">${all.map((s, i) => img(s, i === all.length - 1 ? w.t : '', i ? '' : 'on')).join('')}<span class="steps-tag"><i class="ph-light ph-film-strip"></i>Processo</span><span class="steps-dots" aria-hidden="true">${all.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</span></div>`;
};
// "Correlati": the work first, then what's behind it; swipe sideways (or the arrows with a mouse), dots below
const hasMaking = w => !w.before && w.making?.length; // not on "prima e dopo": its bar takes the sideways drag
const carousel = (w, first) => `<div class="car" data-car="${w.id}">
    <div class="car-slide">${first}</div>
    ${w.making.map(m => `<div class="car-slide">${img(m.src, m.cap || '')}<span class="mk-tag"><i class="ph-light ph-film-strip"></i>Correlati</span>${m.cap ? `<span class="mk-cap">${m.cap}</span>` : ''}</div>`).join('')}
  </div>
  <span class="car-dots" aria-hidden="true">${[0, ...w.making].map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</span>
  <button class="car-arrow prev" data-act="car-step" data-dir="-1" aria-label="Indietro"><i class="ph-light ph-caret-left"></i></button>
  <button class="car-arrow next" data-act="car-step" data-dir="1" aria-label="Correlati"><i class="ph-light ph-caret-right"></i></button>`;
// the frame takes the work's own shape: wide works are wide, tall works are tall and narrower
const mediaFrame = w => {
  const ratio = Math.max(.56, Math.min(1.91, (w.w || 1200) / (w.h || 900)));
  const width = ratio < 1 ? Math.round(56 + ratio * 30) : 100; // portrait: ~73% at 3:4, ~73-85% range
  const style = `style="aspect-ratio:${ratio.toFixed(3)};width:${width}%"`;
  const src = w.ts || w.before || w.steps ? w.img : w.thumb; // the stages are full size, so the finished work matches them
  if (w.before) return `<div class="x-media ph-img" ${style}>${workMedia(w, src)}</div>`; // no link: the bar takes the drag
  const main = workMedia(w, src) + mediaOverlay(w);
  return `<a class="x-media ph-img" href="#vista/${w.id}" data-dbl="${w.id}" ${style} aria-label="Apri ${w.t} a schermo intero">${hasMaking(w) ? carousel(w, main) : main}</a>`;
};
// who can see a work: a "utente" publishes only for followers
const canSee = w => !blocked.has(w.a) && (w.audience !== 'followers' || w.a === 'me' || followed.has(w.a));
const audTag = w => w.audience === 'followers' ? '<span class="aud-tag" title="Visibile solo a chi segue l\'autore"><i class="ph-light ph-lock-simple"></i>Follower</span>' : '';
// comment tag: colour + star by profile type (critics gold, artists red, users plain)
const whoTag = aid => {
  const t = typeOf(aid);
  if (t === 'critico') return '<span class="who-tag t-critico"><i class="nstar" aria-hidden="true"></i>Critico</span>';
  if (t === 'artista') return `<span class="who-tag t-artista"><img src="${STAR_SRC}" alt="">Artista</span>`;
  return '';
};
// category tag on posts: icon + name, links to the category page
const CAT_ICONS = {
  'Pittura e illustrazione': 'paint-brush', 'Musica': 'music-notes', 'Letteratura': 'book-open', 'Cinema e video': 'film-strip',
  'Fotografia': 'camera', 'Design': 'pen-nib', 'Architettura': 'buildings', 'Moda': 't-shirt', 'Scultura': 'cube',
  'Fumetto': 'chat-circle-text', 'Animazione': 'shooting-star', 'Teatro e performance': 'mask-happy', 'Danza': 'sneaker-move',
  'Street art': 'spray-bottle', 'Artigianato': 'hammer', 'Installazione e arti ambientali': 'tree', 'Arti digitali e tecnologiche': 'cpu',
  'Videogiochi e arti interattive': 'game-controller', 'Arti culinarie': 'cooking-pot', 'Body art': 'drop', 'Arte memetica': 'smiley',
};
// hand-drawn icons (assets/categorie/<slug>.svg) and their ink colour
const CAT_COLORS = {
  'Pittura e illustrazione': '#dd7a3f', 'Musica': '#7656b6', 'Letteratura': '#427a53', 'Cinema e video': '#5f86cf', 'Fotografia': '#399ab4',
  'Design': '#c69f31', 'Architettura': '#6a747f', 'Moda': '#d36095', 'Scultura': '#ab8666',
  'Fumetto': '#e5bb47', 'Animazione': '#b773d3', 'Teatro e performance': '#833d69', 'Danza': '#d87dac',
  'Street art': '#d74f3a', 'Artigianato': '#856545', 'Installazione e arti ambientali': '#84a258', 'Arti digitali e tecnologiche': '#4b7cd4',
  'Videogiochi e arti interattive': '#1ca198', 'Arti culinarie': '#c27e36', 'Body art': '#9e4d5a', 'Arte memetica': '#8fc12f',
};
const catIcon = d => CAT_COLORS[d] ? `<img class="cat-ico" src="assets/categorie/${slugOf(d)}.svg" alt="" aria-hidden="true">`
  : `<span class="cat-ico ring" aria-hidden="true"><i class="ph-light ph-${CAT_ICONS[d]}"></i></span>`;
const catTag = w => CAT_ICONS[w.disc] ? `<a class="cat-tag" href="#galleria/${slugOf(w.disc)}"${CAT_COLORS[w.disc] ? ` style="--c:${CAT_COLORS[w.disc]}"` : ''}>${CAT_COLORS[w.disc] ? `<img src="assets/categorie/${slugOf(w.disc)}.svg" alt="" aria-hidden="true">` : `<i class="ph-light ph-${CAT_ICONS[w.disc]}"></i>`}${w.disc}</a>` : '';
// the stars in a pill with the vote in numbers ("3,9"), in every feed; a work with no vote yet says "Nuova"
const ratePill = w => `<span class="rate-pill">${w.rating ? `${rating(w.rating, 11)}<b>${w.rating.toLocaleString(LOCALE, { minimumFractionDigits: 1 })}</b>` : '<b>Nuova</b>'}</span>`;
// in Scorri the category is just its icon (the name is in its label for screen readers)
const catIconLink = w => CAT_ICONS[w.disc] ? `<a class="reel-cat" href="#galleria/${slugOf(w.disc)}" aria-label="${w.disc}" title="${w.disc}">${CAT_COLORS[w.disc] ? `<img src="assets/categorie/${slugOf(w.disc)}.svg" alt="">` : `<i class="ph-light ph-${CAT_ICONS[w.disc]}"></i>`}</a>` : '';
function postX(w) {
  return `<article class="xpost" data-thread="${w.id}">
    <div class="x-ava">${avatarRing(w.a)}${w.co ? avatarRing(w.co, 'co') : ''}</div>
    <div class="x-body">
      <div class="x-head">
        <p class="x-meta">${byline(w)} <span class="x-time">· ${agoText(w)}</span></p>
        ${ratePill(w)}
      </div>
      <p class="x-title">${w.t}</p>
      <p class="x-tags">${catTag(w)}${audTag(w)}</p>
      <p class="x-desc">${w.desc}</p>
      ${mediaFrame(w)}
      ${xActions(w)}
    </div>
  </article>`;
}
// Sfoglia (list) / Scorri (full-screen) switch at the top of Scopri, like Instagram's "Per te / Amici": same works, two ways to browse
const modeTabs = on => `<nav class="mode-tabs" aria-label="Modo di vista"><a href="#scopri" ${on === 'feed' ? 'class="on" aria-current="page"' : ''}>Sfoglia</a><a href="#vista" ${on === 'reel' ? 'class="on" aria-current="page"' : ''}>Scorri</a></nav>`;
const feedList = () => [...MINE, ...FEED].filter(w => !hidden.has(w.id) && !muted.has(w.a) && canSee(w));
function renderFeed() {
  const list = feedList();
  $('#feed').className = 'xfeed';
  $('#feed').innerHTML = modeTabs('feed') + (list.length ? list.map(postX).join('')
    : `<div class="empty">${starSvg()}<strong>Hai nascosto tutto</strong><p>Le opere che segni "Non mi interessa" spariscono da qui.</p><button class="btn-ghost" data-act="unhide-all">Mostrale di nuovo</button></div>`);
}

/* ---------------- Post comments page (#post/id), like an X thread ---------------- */
const REPLY_TEXTS = [
  'Il taglio di luce al minuto due. Come hai fatto?', 'Questo mi ha fatto venire voglia di tornare a dipingere.',
  'Cinque stelle, senza pensarci.', 'La composizione è pazzesca, ci ho messo un po\' a capirla.',
  'Lo guardo da dieci minuti. Grazie.', 'Mi ricorda casa, in un modo che non so spiegare.',
  'Quando esce la serie completa?', 'Il suono è perfetto con le cuffie.', 'Colori incredibili. Che pellicola usi?',
];
const mockReplies = w => {
  const r = rng(w.likes || 7);
  const shuffled = list => list.map(v => [r(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]); // no author or text twice
  const ids = shuffled(AIDS.filter(id => id !== w.a)), texts = shuffled(REPLY_TEXTS);
  const rp = rng((w.likes || 7) + 99); // its own sequence, so the points don't change the rest
  const out = Array.from({ length: w.ts ? 0 : 6 }, (_, i) => {
    const a = ids[i];
    return { a, text: texts[i], ago: 3 + i * 17 + Math.floor(r() * 40), likes: Math.floor(r() * 900),
      rating: typeOf(a) === 'critico' ? 3 + Math.floor(r() * 3) : 0, // only critics give stars
      pt: i === 0 || i === 3 ? [Math.round(18 + rp() * 64), Math.round(18 + rp() * 64)] : null };
  });
  if (!w.ts && !out.some(rp => typeOf(rp.a) === 'critico')) out.splice(1, 0, { a: 'giulia', text: REVIEW_TEXTS[(w.likes || 0) % REVIEW_TEXTS.length], ago: 22, likes: 341, rating: Math.max(3, Math.round(w.rating || 4)) });
  return out;
};
const replyHtml = rp => `<div class="x-reply ${typeOf(rp.a) === 'critico' ? 'is-critic' : ''}" data-author="${rp.a}">
    <div class="x-ava">${avatarRing(rp.a, 'sm')}</div>
    <div><p class="x-meta"><a class="x-name" href="${profileHref(rp.a)}">${ARTISTS[rp.a].name}</a> ${whoTag(rp.a)} <span class="x-time">· ${rp.ts ? agoText(rp) : agoText({ ago: rp.ago })}</span></p>
      ${rp.rating ? `<div class="x-reply-rating">${rating(rp.rating, 14)}</div>` : ''}
      <p class="x-text">${rp.pt ? ptChip(rp.pt) : ''}${rp.text}</p>
      ${rp.likes ? `<p class="x-reply-likes"><i class="ph-light ph-heart"></i> ${fmt(rp.likes)}</p>` : ''}</div>
  </div>`;
// star picker for critics (the only ones who can give stars)
const starPicker = n => `<div class="star-pick" role="radiogroup" aria-label="Le tue stelle">${[1, 2, 3, 4, 5].map(i => `<button type="button" role="radio" aria-checked="${i === n}" aria-label="${i} ${i === 1 ? 'stella' : 'stelle'}" data-act="pick-star" data-v="${i}" class="${i <= n ? 'on' : ''}"><img src="${STAR_SRC}" alt=""></button>`).join('')}</div>`;
function renderThread(id, focus) {
  const w = byId[id];
  const root = $('#thread');
  document.body.classList.remove('pt-picking'); // a half-chosen point doesn't follow you to another post
  if (!w) { root.innerHTML = `<div class="empty">${starSvg()}<strong>Post non trovato</strong><p>Forse è stato eliminato.</p><a class="btn-ghost" href="#scopri">Torna a Scopri</a></div>`; return; }
  const a = ARTISTS[w.a];
  if (!canSee(w)) { root.innerHTML = `<header class="x-top"><button class="icon-btn" data-act="back" data-fallback="#scopri" aria-label="Indietro"><i class="ph-light ph-arrow-left"></i></button><h1>Post</h1></header><div class="empty">${starSvg()}<strong>Solo per i follower</strong><p>${a.name} condivide le sue opere solo con i suoi follower.</p><button class="btn-accent" data-act="follow" data-a="${w.a}">Segui</button></div>`; return; }
  const mine = (REPLIES_MINE[w.id] || []).map(t => ({ a: 'me', text: t.text, ts: t.ts, rating: t.rating || 0, pt: t.pt }));
  const critic = typeOf('me') === 'critico';
  root.innerHTML = `
    <header class="x-top"><button class="icon-btn" data-act="back" data-fallback="#scopri" aria-label="Indietro"><i class="ph-light ph-arrow-left"></i></button><h1>Post</h1></header>
    <article class="xpost open">
      <div class="x-ava">${avatarRing(w.a)}${w.co ? avatarRing(w.co, 'co') : ''}</div>
      <div class="x-body">
        <div class="x-head">
          <p class="x-meta">${byline(w)} <span class="x-time">· ${agoText(w)}</span></p>
          ${ratePill(w)}
        </div>
        <p class="x-title">${w.t}</p>
      <p class="x-tags">${catTag(w)}${audTag(w)}</p>
        <p class="x-desc open">${w.desc}</p>
        ${mediaFrame(w)}
        <p class="x-stats"><span><strong data-rp="${w.id}">${fmt(repostCount(w))}</strong> ${label(repostCount(w), 'ripubblicazioni')}</span><span><strong data-count="${w.id}">${fmt(likeCount(w))}</strong> ${label(likeCount(w), 'mi piace')}</span><span><strong>${fmt(w.views)}</strong> ${label(w.views, 'visualizzazioni')}</span></p>
        ${xActions(w, true)}
      </div>
    </article>
    <form class="x-compose ${critic ? 'critic' : ''}" data-reply="${w.id}" data-stars="0">
      <img class="x-me" src="${avatar('me')}" alt="">
      <label for="replyInput" class="sr-only">${critic ? 'La tua recensione' : 'La tua risposta'}</label>
      <input id="replyInput" placeholder="${critic ? 'Scrivi la tua recensione' : 'Scrivi la tua risposta'}" autocomplete="off" maxlength="280">
      <button class="btn-accent" type="submit">${critic ? 'Pubblica' : 'Rispondi'}</button>
      <button type="button" class="pt-pick" data-act="pt-pick" aria-pressed="false"><i class="ph-light ph-crosshair-simple"></i><span>Indica un punto dell'opera</span></button>
      ${critic ? starPicker(0) : '<p class="x-note"><i class="nstar" aria-hidden="true"></i>Solo i critici possono dare le stelle.</p>'}
    </form>
    <div class="x-replies">${[...mine.reverse(), ...mockReplies(w)].map(replyHtml).join('') || '<p class="x-none">Ancora nessuna risposta. Scrivi la prima.</p>'}</div>`;
  if (focusReply) { focusReply = false; requestAnimationFrame(() => $('#replyInput')?.focus({ preventScroll: true })); }
  if (focus) {
    setTimeout(() => {
      if (cur.name !== 'post' || cur.param !== w.id) return;
      const hit = focus === 'critico' ? $('.x-reply.is-critic', root)
        : focus.startsWith('c:') ? $$('.x-reply', root).find(el => el.dataset.author === focus.slice(2))
        : $('.x-reply', root);
      if (hit) {
        hit.classList.add('notif-hit');
        hit.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
        const chip = $('.pt-chip', hit);
        if (chip) setTimeout(() => showPt(+chip.dataset.x, +chip.dataset.y), 450);
      }
    }, 90);
  }
}
/* Comments on a point of the work, shown like a video timestamp: a small "Qui" chip in the text. Tapping it flashes
   a ring on that spot of the picture for a moment, so nothing is ever drawn on the work itself. */
const ptChip = ([x, y]) => `<button class="pt-chip" data-act="pt" data-x="${x}" data-y="${y}" aria-label="Mostra il punto sull'opera"><i class="ph-light ph-crosshair-simple"></i>Qui</button> `;
function showPt(x, y) {
  const m = $('#thread .x-media');
  if (!m) return;
  m.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
  $$('.pt-mark', m).forEach(el => el.remove());
  const mark = document.createElement('span');
  mark.className = 'pt-mark'; mark.style.left = x + '%'; mark.style.top = y + '%';
  m.append(mark);
  setTimeout(() => mark.remove(), 2600);
}
// the composer's "Indica un punto" button: on, the next tap on the work marks the point (app.js); tapped again, no point
function togglePtPick(btn) {
  const f = btn.closest('form');
  if (f.dataset.pt) { delete f.dataset.pt; ptPickUi(f); return; }
  const on = !document.body.classList.contains('pt-picking');
  document.body.classList.toggle('pt-picking', on);
  ptPickUi(f);
  if (on) $('#thread .x-media')?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
}
function setPt(media, e) {
  const r = media.getBoundingClientRect();
  const x = Math.round((e.clientX - r.left) / r.width * 100), y = Math.round((e.clientY - r.top) / r.height * 100);
  const f = $('#thread .x-compose');
  f.dataset.pt = `${x},${y}`;
  document.body.classList.remove('pt-picking');
  ptPickUi(f); showPt(x, y);
  $('#replyInput')?.focus({ preventScroll: true });
}
function ptPickUi(f) {
  const b = $('.pt-pick', f), picking = document.body.classList.contains('pt-picking');
  b.setAttribute('aria-pressed', String(!!(f.dataset.pt || picking)));
  $('span', b).textContent = T(f.dataset.pt ? 'Punto scelto. Tocca per toglierlo' : picking ? "Tocca il punto sull'opera" : "Indica un punto dell'opera");
}
let focusReply = false; // set by the comment button, so you can type right away
function submitReply(f) {
  const input = f.querySelector('input');
  const text = input.value.trim();
  if (!text) { input.focus(); return; }
  const id = f.dataset.reply;
  const stars = typeOf('me') === 'critico' ? +f.dataset.stars || 0 : 0; // only critics can give stars
  const pt = f.dataset.pt ? f.dataset.pt.split(',').map(Number) : undefined;
  (REPLIES_MINE[id] ||= []).push({ text: text.replace(/&/g, '&amp;').replace(/</g, '&lt;'), ts: Date.now(), rating: stars, pt });
  store.set('novae.replies', JSON.stringify(REPLIES_MINE));
  const w = byId[id];
  const recipients = w ? [w.a, w.co].filter(aid => aid && aid !== 'me') : [];
  if (stars > 0 && typeOf('me') === 'critico') {
    window.NovaePush?.notifyEvent('E2', { workId: id, workTitle: w?.t || '', actorId: 'me', actorName: ARTISTS.me.name, stars }, { recipients, actorId: 'me' });
  } else {
    window.NovaePush?.notifyEvent('E3', { workId: id, workTitle: w?.t || '', actorId: 'me', actorName: ARTISTS.me.name, text, hasPoint: !!pt, pt }, { recipients, actorId: 'me' });
  }
  renderThread(id);
  toast(stars ? `Recensione pubblicata con ${stars} ${stars === 1 ? 'stella' : 'stelle'}` : 'Risposta pubblicata');
}

/* ---------------- 4. Vista: full-screen vertical feed, like Reels / TikTok ----------------
   Native scroll-snap does the swiping; an IntersectionObserver tracks the reel on screen. */
let reelObserver;
function reelHtml(w) {
  const a = ARTISTS[w.a];
  const src = w.ts ? w.img : pic(w.id, 720, 1280); // portrait crop of the same photo (sharp on a phone, a third lighter than 900x1600)
  const follows = followed.has(w.a);
  return `<section class="reel" data-id="${w.id}" data-type="${w.type}" aria-label="${w.t} \u2014 ${a.name}">
    <div class="reel-media ph-img" data-dbl="${w.id}">${img(src, w.t).replace(' src="', ' data-src="')}</div>
    <span class="reel-shade" aria-hidden="true"></span>
    ${w.type !== 'image' ? '<span class="reel-paused" aria-hidden="true"><i class="ph-fill ph-play"></i></span><div class="progress"><span></span></div>' : ''}
    <div class="reel-rail">
      ${heart(w, true)}
      <button class="act" data-act="comments" data-id="${w.id}" aria-label="Commenti"><i class="ph-light ph-chat-circle"></i><small>${short(w.comments)}</small></button>
      <button class="act repost ${reposted.has(w.id) ? 'on' : ''}" data-act="repost" data-id="${w.id}" aria-pressed="${reposted.has(w.id)}" aria-label="Ripubblica"><i class="ph-light ph-repeat"></i><small data-rp="${w.id}" data-short="1">${short(repostCount(w))}</small></button>
      ${shareBtn(w)}
      ${saveBtn(w)}
      <button class="act" data-act="more" data-id="${w.id}" aria-label="Altro"><i class="ph-light ph-dots-three"></i></button>
    </div>
    <div class="reel-meta">
      <div class="reel-who">${avatarRing(w.a, 'sm')}
        <p class="reel-by">${[w.a, w.co].filter(Boolean).map(aid => `<a href="${profileHref(aid)}">@${ARTISTS[aid].handle}</a>`).join(' <span class="x-and">e</span> ')} <span class="reel-time">· ${agoText(w)}</span></p>
        ${w.a === 'me' ? '' : `<button class="reel-follow ${follows ? 'on' : ''}" data-act="follow" data-a="${w.a}" aria-pressed="${follows}">${follows ? 'Segui già' : 'Segui'}</button>`}
      </div>
      <h2>${w.t}</h2>
      <p class="reel-tags">${catIconLink(w)}${ratePill(w)}</p>
      <p class="reel-desc" data-act="expand">${w.desc}</p>
    </div>
  </section>`;
}
// Only the reels near the one on screen hold their pictures (the pictures carry data-src): on a phone, 40 full-screen
// images at once ran out of memory and Safari closed the page. Near ones load, far ones are let go.
// (No "Correlati" carousel in Scorri: a sideways snapping scroller inside the vertical snapping reels crashed iPhone Safari.
// They stay in Sfoglia.)
function windowReels(reels, at) {
  $$('.reel', reels).forEach((r, j) => {
    const d = Math.abs(j - at);
    $$('.reel-media img[data-src]', r).forEach(im => {
      if (d <= 2) { if (!im.getAttribute('src')) im.src = im.dataset.src; }
      else if (d > 4 && im.getAttribute('src')) { im.removeAttribute('src'); im.classList.remove('loaded'); im.parentElement.classList.remove('loaded'); }
    });
  });
}
function renderVista(id) {
  const all = [...MINE, ...FEED].filter(w => (!hidden.has(w.id) && !muted.has(w.a) && canSee(w)) || w.id === id);
  const start = byId[id] || all[0];
  const list = all.includes(start) ? all : [start, ...all]; // e.g. a film opened from Cinema e video
  const root = $('#vista');
  root.className = 'vista';
  root.innerHTML = `
    ${modeTabs('reel')}
    <p class="vista-hint" aria-hidden="true"><i class="ph-light ph-hand-swipe-up"></i>Scorri per la prossima</p>
    <div class="reels" id="reels">${list.map(reelHtml).join('')}</div>`;
  const reels = $('#reels');
  reels.scrollTop = reels.querySelector(`[data-id="${start.id}"]`).offsetTop;
  windowReels(reels, list.indexOf(start));
  let wr = 0; // as you scroll, the reel on screen decides which pictures are held (once per frame)
  reels.addEventListener('scroll', () => { if (!wr) wr = requestAnimationFrame(() => { wr = 0; windowReels(reels, Math.round(reels.scrollTop / reels.clientHeight)); }); }, { passive: true });
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
