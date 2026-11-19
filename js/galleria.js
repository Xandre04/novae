/* NOVAE · Galleria: the categories, a category page (Cinema e video rows) and the work page.
   The js/*.js files are plain scripts that share one scope, loaded in order by index.html. */
'use strict';

/* ---------------- 5. Galleria: the disciplines ---------------- */
function renderStile() {
  $('#disciplines').innerHTML = DISCIPLINES.map(d => {
    const ws = WORKS.filter(w => w.disc === d && canSee(w));
    return `<a class="disc ${ws.length ? '' : 'empty-disc'}" href="#galleria/${slugOf(d)}">
      ${catIcon(d)}<h2>${d}</h2>
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
  const name = DISCIPLINES.find(d => slugOf(d) === slug) || CINEMA; // unknown or old links (#galleria/cinematografia) -> Cinema e video
  const root = $('#cine');
  document.title = `${name} | NOVAE`;
  if (name !== CINEMA) {
    // every other category: its works in a grid, or "In arrivo" while it's empty
    const ws = WORKS.filter(w => w.disc === name && canSee(w)).sort(byRecent);
    root.innerHTML = `<button class="cine-back icon-btn" data-act="back" data-fallback="#galleria" aria-label="Indietro"><i class="ph-light ph-caret-left"></i></button>
      <h1 class="cine-title">${catIcon(name)}${name}</h1>
      ${ws.length ? `<p class="cat-count">${ws.length} ${ws.length === 1 ? 'opera' : 'opere'}</p><div class="grid3 cat-grid">${ws.map(w => `<a href="#opera/${w.id}" class="ph-img">${img(thumbOf(w), w.t)}</a>`).join('')}</div>`
        : `<div class="empty">${starSvg()}<strong>In arrivo</strong><p>Nessuna opera di ${name.toLowerCase()} per ora. Se sei un artista, pubblica la prima dal tuo profilo.</p><a class="btn-ghost" href="#scopri">Apri Scopri</a></div>`}`;
    return;
  }
  const tabs = ['Serie', 'Film', 'Classifica', 'Ordina per'];
  root.innerHTML = `
    <button class="cine-back icon-btn" data-act="back" data-fallback="#galleria" aria-label="Indietro"><i class="ph-light ph-caret-left"></i></button>
    <h1 class="cine-title">${catIcon(name)}${name}</h1>
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
  $('#detail').dataset.id = w.id;
  $('#detail').innerHTML = `
    <div class="player ph-img ${w.before || w.steps ? 'rich' : ''}" data-dbl="${w.id}">
      <button class="back icon-btn" data-act="back" data-fallback="#scopri" aria-label="Indietro"><i class="ph-light ph-caret-left"></i></button>
      ${workMedia(w, w.img)}
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
          <dt>${w.co ? 'Artisti' : 'Artista'}</dt><dd>${byline(w, '')}</dd>
          <dt>Categoria</dt><dd>${w.disc}${w.genre ? `, ${w.genre.toLowerCase()}` : ''}</dd>
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
  // the page takes the colour of the work, like Spotify with album covers (styles.css: body[data-screen="opera"])
  tintOf(w.img).then(c => { if (c && $('#detail').dataset.id === w.id) document.body.style.setProperty('--tint', `rgb(${c})`); });
}
