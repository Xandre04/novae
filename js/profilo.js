/* NOVAE · Mercato, profiles (with publishing and editing), Messaggi and Impostazioni.
   The js/*.js files are plain scripts that share one scope, loaded in order by index.html. */
'use strict';

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
        <div class="m-buy"><span class="price">${coin()}${fmt(feat.price)}</span><button class="btn-accent" data-act="buy" data-id="${feat.id}">Acquista</button></div>
        ${AR_OK ? arBtn(feat) : ''}</div>
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
const REVIEW_TEXTS = [
  'Un lavoro maturo: la luce racconta più dei dialoghi. Il finale resta addosso.',
  'Composizione rigorosa, palette trattenuta. Manca solo un po\' di coraggio nel secondo atto.',
  'Raro vedere un esordio così controllato. Da tenere d\'occhio.',
  'Tecnica impeccabile, emozione a tratti. Merita comunque la visione.',
];
// a critic's reviews: yours are the replies you wrote; others' are sample ones
const reviewsOf = aid => aid === 'me'
  ? Object.entries(REPLIES_MINE).flatMap(([id, rs]) => byId[id] ? rs.map(r => ({ w: byId[id], text: r.text, rating: r.rating || 0 })) : []).reverse()
  : FEED.slice(1, 5).map((w, i) => ({ w, text: REVIEW_TEXTS[i % REVIEW_TEXTS.length], rating: Math.max(3, Math.round(w.rating)) }));
const reviewHtml = r => `<a class="review" href="#post/${r.w.id}">${img(r.w.ts ? r.w.img : pic(r.w.id, 200, 200), '')}
    <div><p class="x-title">${r.w.t}</p>${r.rating ? rating(r.rating, 13) : ''}<p class="review-text">${r.text}</p></div></a>`;
/* Costellazioni: collections of works an artist publishes, drawn as stars joined by a line */
const thumbOf = w => w.ts ? w.img : pic(w.id, 300, 300);
// sample constellations: a slice of the artist's works (from..to), so picking one changes the grid
const sampleCol = (id, a, name, desc, from, to) => ({ id, a, name, desc, works: WORKS.filter(w => w.a === a).slice(from, to).map(w => w.id) });
const COLLECTIONS = [
  sampleCol('c-aiko', 'aiko', 'Mestieri che scompaiono', 'Corti sulle mani che lavorano, girati in tre inverni.', 0, 3),
  sampleCol('c-aiko2', 'aiko', 'Inverni', 'Solo neve, solo luce bassa.', 2, 4),
  sampleCol('c-livia', 'livia', 'Pellicola scaduta', 'Tutto girato con rullini oltre la data di scadenza.', 0, 3),
  sampleCol('c-nicolo', 'nicolo', 'Porti del sud', 'Olio su tela, dal 2024.', 0, 2),
];
const MY_COLS = readJSON('novae.collections', []);
const saveCols = () => store.set('novae.collections', JSON.stringify(MY_COLS));
const colsOf = aid => aid === 'me' ? MY_COLS : COLLECTIONS.filter(c => c.a === aid);
const colWorks = c => c.works.map(id => byId[id]).filter(w => w && canSee(w));
// A constellation chip in the Opere strip: up to 4 works as stars joined by a dashed line
function colChip(c, on) {
  const ws = colWorks(c).slice(0, 4), r = rng([...c.id].reduce((s, ch) => s + ch.charCodeAt(0), 0));
  const pts = ws.map((_, i) => [Math.round(18 + i * (64 / Math.max(1, ws.length - 1))), Math.round(26 + r() * 48)]);
  return `<button class="col-chip ${on ? 'on' : ''}" data-act="pick-col" data-col="${c.id}" aria-pressed="${on}">
    <span class="col-mini" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${pts.map(p => p.join(',')).join(' ')}"/></svg>
      ${ws.map((w, i) => `<img src="${thumbOf(w)}" alt="" style="left:${pts[i][0]}%;top:${pts[i][1]}%">`).join('')}
    </span>
    <span class="col-name">${c.name}</span>
  </button>`;
}
// The strip above the works: "Tutte", each constellation, and "+" on your own profile
const colStrip = (cols, sel, mine) => `<div class="col-strip" role="toolbar" aria-label="Costellazioni">
    ${mine ? `<button class="col-chip add" data-act="new-col"><span class="col-mini" aria-hidden="true"><i class="ph-light ph-plus"></i></span><span class="col-name">Nuova</span></button>` : ''}
    <button class="col-chip all ${sel ? '' : 'on'}" data-act="pick-col" data-col="" aria-pressed="${!sel}"><span class="col-mini" aria-hidden="true"><img class="col-logo" src="${STAR_SRC}" alt=""></span><span class="col-name">Tutte</span></button>
    ${cols.map(c => colChip(c, sel === c)).join('')}
  </div>`;
function openNewCol() {
  // you can join your own works and the ones you saved
  const pool = [...WORKS.filter(w => w.a === 'me'), ...WORKS.filter(w => saved.has(w.id) && w.a !== 'me')];
  openSheet(`<h3>Nuova costellazione</h3>
    <form class="pub" id="colForm" novalidate>
      <div class="field"><label for="colName">Nome</label><input id="colName" maxlength="40" placeholder="Es. Notti d'inverno" autocomplete="off"></div>
      <div class="field"><label for="colDesc">Descrizione</label><textarea id="colDesc" maxlength="200" rows="2" placeholder="Cosa tiene insieme queste opere? (facoltativo)"></textarea></div>
      <div class="field"><span class="field-label">Opere (almeno 2)</span>
        ${pool.length ? `<div class="col-pick">${pool.map(w => `<label><input type="checkbox" value="${w.id}"><img src="${thumbOf(w)}" alt=""><span>${w.t}</span></label>`).join('')}</div>`
          : '<p class="x-note">Pubblica o salva almeno due opere per creare una costellazione.</p>'}</div>
      <p class="pub-err" id="colErr" role="alert"></p>
      <button class="btn-accent" type="submit" ${pool.length < 2 ? 'disabled' : ''}>Crea costellazione</button>
    </form>`);
}
function submitCol() {
  const name = $('#colName').value.trim(), picked = $$('#colForm .col-pick input:checked').map(i => i.value);
  if (!name) { $('#colErr').textContent = 'Dai un nome alla costellazione.'; $('#colName').focus(); return; }
  if (picked.length < 2) { $('#colErr').textContent = 'Scegli almeno due opere.'; return; }
  const col = { id: 'c' + Date.now(), name: esc(name), desc: esc($('#colDesc').value.trim()), works: picked };
  MY_COLS.unshift(col);
  saveCols(); closeSheet(); toast('Costellazione pubblicata'); buzz();
  picked.forEach(wid => {
    const w = byId[wid];
    const recipients = w ? [w.a, w.co].filter(aid => aid && aid !== 'me') : [];
    if (recipients.length) {
      window.NovaePush?.notifyEvent('E10', { workId: w.id, workTitle: w.t, colId: col.id, colName: name, actorId: 'me', actorName: ARTISTS.me.name }, { recipients, actorId: 'me' });
    }
  });
  profTab = 'Opere'; profCol = col.id; refresh();
}

// "Seguito da Aiko, Livia e altri 2": the people you follow who follow them too (sample: a fixed pick per profile)
function mutualHtml(aid) {
  const r = rng([...aid].reduce((s, ch) => s + ch.charCodeAt(0), 0));
  const mutual = [...followed].filter(x => x !== aid && ARTISTS[x] && r() < .6);
  if (!mutual.length) return '';
  const names = mutual.slice(0, 2).map(x => `<strong>${ARTISTS[x].name.split(' ')[0]}</strong>`);
  const rest = mutual.length - names.length;
  return `<p class="mutual"><span class="mutual-ava" aria-hidden="true">${mutual.slice(0, 3).map(x => `<img src="${avatar(x)}" alt="">`).join('')}</span>
    <span>Seguito da ${names.join(rest ? ', ' : ' e ')}${rest ? ` e ${rest === 1 ? 'un altro' : `altri ${rest}`}` : ''}</span></p>`;
}
let profSort = 'recenti'; // Opere filter: recenti / stelle
let showList = { works: [], name: '' }; // the works on screen in the profile, for "Mostra" (pannelli.js: openShow)
let profCol = null, profColOf = null; // constellation picked in the Opere strip, and whose profile it belongs to
const byRecent = (x, y) => (y.ts || 0) - (x.ts || 0) || x.ago - y.ago;
// sample reposts for other profiles; yours are the works you reposted
const repostsOf = aid => aid === 'me' ? WORKS.filter(w => reposted.has(w.id) && canSee(w))
  : FEED.filter(w => w.a !== aid && canSee(w)).filter((_, i) => (i + aid.length) % 4 === 0).slice(0, 6);
function renderProfile(aid, focus) {
  const other = aid && aid !== 'me' && ARTISTS[aid];
  const id = other ? aid : 'me';
  const a = ARTISTS[id];
  const type = typeOf(id), T = TYPES[type];
  const locked = other && type === 'utente' && !followed.has(aid); // a user's works: followers only
  const sortFn = profSort === 'stelle' ? (x, y) => y.rating - x.rating : byRecent;
  const cols = type === 'artista' ? colsOf(id) : [];
  if (focus) {
    profColOf = id;
    if (focus === 'repost') { profTab = 'Repost'; profCol = null; }
    else if (cols.some(c => c.id === focus)) { profTab = 'Opere'; profCol = focus; }
  } else if (profColOf !== id) {
    profCol = null; profColOf = id; // a new profile starts on "Tutte"
  }
  const col = cols.find(c => c.id === profCol) || null;
  // Opere and Costellazioni are one view: the strip picks which works the grid shows
  const works = locked ? [] : (col ? colWorks(col) : WORKS.filter(w => authorOf(w, id))).slice().sort(sortFn); // a collaboration shows on both profiles
  const own = WORKS.filter(w => authorOf(w, id)); // stats always count all works, whatever the strip shows
  showList = { works, name: a.name };
  const savedList = WORKS.filter(w => saved.has(w.id));
  const reviews = type === 'critico' ? reviewsOf(id) : [];
  const tabs = {
    artista: ['Opere', 'Repost'],
    critico: ['Recensioni', 'Repost'], // a critic's reviews take the place of posts
    utente: ['Opere', 'Repost'],
  }[type].concat(other ? [] : ['Salvate']);
  if (!tabs.includes(profTab)) profTab = tabs[0];
  const list = profTab === 'Opere' ? works : profTab === 'Salvate' ? savedList : profTab === 'Repost' ? repostsOf(id) : [];
  const first = a.name.split(' ')[0];
  const empty = {
    Opere: locked ? ['Solo per i follower', `${first} condivide le sue opere solo con i suoi follower.`]
      : other ? ['Nessuna opera', `${first} non ha ancora pubblicato.`]
      : type === 'utente' ? ['La tua prima opera', 'Pubblicala: la vedranno solo le persone che ti seguono.'] : ['La tua prima opera', 'Tocca "Pubblica opera" e condividila con chi ti segue.'],
    Salvate: ['Niente di salvato', 'Tocca i tre puntini su un\'opera e scegli Salva.'],
    Repost: other ? ['Nessun repost', `${first} non ha ancora ripubblicato opere.`] : ['Nessun repost', 'Tocca le frecce sotto un\'opera in Scopri per ripubblicarla qui.'],
    Recensioni: other ? ['Nessuna recensione', 'Non ha ancora recensito opere.'] : ['La tua prima recensione', 'Apri un\'opera in Scopri, scegli le stelle e scrivi cosa ne pensi.'],
  }[profTab];
  const emptyBtn = locked ? `<button class="btn-accent" data-act="follow" data-a="${aid}">Segui</button>`
    : !other && profTab === 'Opere' ? `<button class="btn-accent" data-act="publish">${type === 'utente' ? 'Pubblica per i follower' : 'Pubblica opera'}</button>` : '';
  // your constellation strip only once you have two works to join (before that the "first work" invite comes first)
  const showStrip = profTab === 'Opere' && type === 'artista' && (cols.length || (!other && own.length >= 2));
  const colHead = col ? `<div class="col-head">
      <p class="col-title"><img src="${STAR_SRC}" alt="" aria-hidden="true">${col.name}<small>${works.length} ${label(works.length, 'opere')}</small></p>
      ${col.desc ? `<p class="col-desc">${col.desc}</p>` : ''}
      ${MY_COLS.includes(col) ? `<button class="link-btn" data-act="del-col" data-col="${col.id}">Elimina costellazione</button>` : ''}
    </div>` : '';
  const banner = other ? pic('banner-' + aid, 1200, 420) : profile.banner;
  const isBlocked = other && blocked.has(aid);
  const fans = n => fmt(n + (other && followed.has(aid) ? 1 : 0)); // following them counts at once
  const thumb = thumbOf;
  const stats = {
    artista: [[own.length, 'opere'], [other ? fmt(own.reduce((s, w) => s + likeCount(w), 0)) : savedList.length, other ? 'cuori' : 'salvate'], [other ? fans(120 + own.length * 37) : followed.size, other ? 'seguaci' : 'seguiti']],
    critico: [[reviews.length, 'recensioni'], [other ? fmt(860) : savedList.length, other ? 'lettori' : 'salvate'], [other ? fans(412) : followed.size, other ? 'seguaci' : 'seguiti']],
    utente: [[other ? fmt(214) : liked.size, 'mi piace'], [other ? fans(37) : savedList.length, other ? 'seguaci' : 'salvate'], [other ? fmt(64) : followed.size, 'seguiti']],
  }[type];
  $('#profile').innerHTML = `
    <div class="prof-banner ${banner ? 'has' : ''}" ${banner ? `style="background-image:url('${banner}')"` : ''}>
      ${other ? `<button class="banner-edit" data-act="prof-more" data-a="${aid}" aria-label="Altre azioni"><i class="ph-light ph-dots-three"></i></button>`
        : `<button class="banner-edit" data-act="edit-profile" aria-label="Cambia banner"><i class="ph-light ph-image"></i></button>`}
    </div>
    <div class="prof-top">
      ${other ? `<span class="avatar-ring lg">${img(avatar(aid), '')}</span>` : `<span class="prof-ring">${crop('profilo')}<button class="edit" data-act="edit-profile" aria-label="Modifica profilo"><i class="ph-light ph-pencil-simple"></i></button></span>`}
      <h1>${a.name}</h1>
      <span class="type-badge t-${type}"><i class="ph-light ph-${T.icon}"></i>${T.label}</span>
      <p class="handle">@${a.handle}<span class="place"><i class="ph-light ph-map-pin"></i>${a.country}</span></p>
      ${a.bio ? `<p class="bio">${a.bio}</p>` : other ? '' : '<button class="bio-empty" data-act="edit-profile"><i class="ph-light ph-plus"></i>Aggiungi una bio per farti trovare</button>'}
      ${!other && profile.link ? `<a class="prof-link" href="${esc(profile.link)}" target="_blank" rel="noopener nofollow ugc"><i class="ph-light ph-link-simple"></i>${esc(profile.link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>` : ''}
      ${other && !isBlocked ? mutualHtml(aid) : ''}
      <div class="stats">${stats.map(([n, l]) => `<div><strong>${n}</strong><span>${label(n, l)}</span></div>`).join('')}</div>
      <div class="prof-cta">${other
        ? isBlocked ? `<button class="btn-ghost" data-act="unblock" data-a="${aid}">Sblocca</button>`
          : `<button class="${followed.has(aid) ? 'btn-ghost' : 'btn-accent'}" data-act="follow" data-a="${aid}" aria-pressed="${followed.has(aid)}">${followed.has(aid) ? 'Segui già' : 'Segui'}</button><a class="btn-ghost" href="#messaggi/${aid}">Messaggio</a>`
        : `${type === 'artista' ? '<button class="btn-accent" data-act="publish">Pubblica opera</button>' : type === 'critico' ? '<a class="btn-accent" href="#scopri">Scrivi una recensione</a>' : '<button class="btn-accent" data-act="publish">Pubblica per i follower</button>'}<button class="btn-ghost" data-act="edit-profile">Modifica profilo</button>`}</div>
    </div>
    ${isBlocked ? `<div class="empty">${starSvg()}<strong>Hai bloccato ${first}</strong><p>Non vedi le sue opere e non può scriverti. Puoi sbloccarlo quando vuoi.</p></div>` : `
    <div class="seg" role="tablist" style="grid-template-columns:repeat(${tabs.length},1fr)">${tabs.map(t => `<button role="tab" aria-selected="${t === profTab}" data-act="ptab" data-v="${t}" data-a="${aid || ''}">${t}</button>`).join('')}</div>
    ${showStrip ? colStrip(cols, col, !other) : ''}
    ${colHead}
    ${profTab === 'Opere' && works.length > 1 ? `<div class="prof-sort"><span role="radiogroup" aria-label="Ordina le opere">${[['recenti', 'Recenti'], ['stelle', 'Stelle']].map(([v, l]) => `<button role="radio" aria-checked="${profSort === v}" data-act="psort" data-v="${v}" data-a="${aid || ''}">${l}</button>`).join('')}</span><button data-act="show"><i class="ph-light ph-frame-corners"></i>Mostra</button></div>` : ''}
    ${profTab === 'Recensioni' && reviews.length ? `<div class="reviews">${reviews.map(reviewHtml).join('')}</div>`
      : list.length ? `<div class="grid3">${list.map(w => `<a href="#opera/${w.id}" class="ph-img">${img(thumb(w), w.t)}${w.audience === 'followers' ? '<i class="ph-fill ph-lock-simple grid-lock" aria-label="Solo follower"></i>' : ''}</a>`).join('')}</div>`
      : `<div class="empty">${starSvg()}<strong>${empty[0]}</strong><p>${empty[1]}</p>${emptyBtn}</div>`}`}`;
  if (focus) {
    setTimeout(() => {
      if (cur.name !== 'artista' && cur.name !== 'profilo') return;
      if (focus === 'repost') $('.seg', $('#profile'))?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      else {
        $('.col-chip.on', $('#profile'))?.scrollIntoView({ inline: 'center', block: 'nearest' });
        $('.col-head', $('#profile'))?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }, 90);
  }
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
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
// new work, or (with w) edit one of yours: same form, prefilled
function openPublish(w) {
  openSheet(`<h3>${w ? 'Modifica opera' : 'Nuova opera'}</h3>
    <form class="pub" id="pubForm" novalidate ${w ? `data-edit="${w.id}" data-img="${w.img}" data-w="${w.w}" data-h="${w.h}"` : ''}>
      ${!w && typeOf('me') === 'utente' ? '<p class="pub-note"><i class="ph-light ph-lock-simple"></i>Come utente, le tue opere le vede solo chi ti segue.</p>' : ''}
      <label class="pub-drop ${w ? 'has' : ''}" id="pubDrop"><input type="file" accept="image/*" id="pubFile" aria-label="Immagine dell'opera"><img id="pubPrev" alt="" ${w ? `src="${w.img}"` : 'hidden'}><span><i class="ph-light ph-image-square"></i>Scegli un'immagine</span>${w ? '<em class="pub-change">Cambia immagine</em>' : ''}</label>
      <div class="field"><label for="pubT">Titolo</label><input id="pubT" maxlength="60" placeholder="Come si chiama?" autocomplete="off" value="${w ? esc(w.t) : ''}"></div>
      <div class="field"><label for="pubDisc">Categoria</label><select id="pubDisc">${DISCIPLINES.map(d => `<option ${w?.disc === d ? 'selected' : ''}>${d}</option>`).join('')}</select></div>
      <div class="field"><label for="pubDesc">Descrizione</label><textarea id="pubDesc" maxlength="400" rows="3" placeholder="Racconta com'è nata (facoltativo)">${w ? esc(w.desc) : ''}</textarea></div>
      <details class="pub-more" ${w?.before || w?.steps || w?.co || w?.cm ? 'open' : ''}><summary>Misure, bozza, processo, collaborazione</summary>
        <div class="field"><span class="field-label">Misure in cm</span>
          <div class="pub-cm"><input id="pubCmW" type="number" inputmode="numeric" min="1" max="2000" placeholder="Larghezza" aria-label="Larghezza in cm" value="${w?.cm?.[0] || ''}"><span>×</span><input id="pubCmH" type="number" inputmode="numeric" min="1" max="2000" placeholder="Altezza" aria-label="Altezza in cm" value="${w?.cm?.[1] || ''}"></div>
          <small class="x-note">Servono per vederla sul muro, in realtà aumentata, alla grandezza vera.</small></div>
        <div class="field"><span class="field-label">Prima e dopo</span>
          <label class="pub-extra"><input type="file" accept="image/*" id="pubBefore"><i class="ph-light ph-columns"></i><span id="pubBeforeTxt"></span></label>
          <small class="x-note">Chi guarda trascina una barra per confrontare la bozza con l'opera finita.</small></div>
        <div class="field"><span class="field-label">Processo</span>
          <label class="pub-extra"><input type="file" accept="image/*" multiple id="pubSteps"><i class="ph-light ph-film-strip"></i><span id="pubStepsTxt"></span></label>
          <small class="x-note">Da 2 a 6 foto delle fasi, in ordine: scorrono come un piccolo video e finiscono sull'opera.</small></div>
        <div class="field"><span class="field-label">In the making</span>
          <label class="pub-extra"><input type="file" accept="image/*" multiple id="pubMaking"><i class="ph-light ph-film-strip"></i><span id="pubMakingTxt"></span></label>
          <small class="x-note">Fino a 4 foto di com'è nata (studio, schizzi, materiali): si vedono scorrendo di lato il post.</small></div>
        <div class="field"><label for="pubCo">Insieme a</label><select id="pubCo"><option value="">Nessuno</option>${AIDS.filter(id => typeOf(id) === 'artista').map(id => `<option value="${id}" ${w?.co === id ? 'selected' : ''}>${ARTISTS[id].name}</option>`).join('')}</select>
          <small class="x-note">L'opera compare su tutti e due i profili. Con il server, l'altro artista dovrà accettare.</small></div>
      </details>
      <p class="pub-err" id="pubErr" role="alert"></p>
      <button class="btn-accent" type="submit">${w ? 'Salva modifiche' : 'Pubblica'}</button>
    </form>`);
  pubExtra = { before: w?.before, steps: w?.steps };
  pubMaking = w?.making || null;
  pubExtraText();
}
const pubCm = () => { const cm = [+$('#pubCmW').value, +$('#pubCmH').value]; return cm.every(n => n > 0 && n <= 2000) ? cm : undefined; };
// extras of the work being published: a sketch for "prima e dopo" or the stages of the process (one or the other)
let pubExtra = {}, pubMaking = null; // pubMaking: the "In the making" photos, alongside either extra
function pubExtraText() {
  $('#pubBeforeTxt').textContent = T(pubExtra.before ? 'Bozza aggiunta. Tocca per cambiarla' : 'Aggiungi la bozza');
  $('#pubStepsTxt').textContent = pubExtra.steps ? `${pubExtra.steps.length} ${T('fasi aggiunte. Tocca per cambiarle')}` : T('Aggiungi le fasi');
  $('#pubMakingTxt').textContent = pubMaking ? `${pubMaking.length} ${T('foto aggiunte. Tocca per cambiarle')}` : T('Aggiungi le foto');
}
async function onPubExtra(input) {
  const files = [...input.files];
  if (!files.length) return;
  try {
    if (input.id === 'pubMaking') pubMaking = (await Promise.all(files.slice(0, 4).map(f => compressImage(f, 720)))).map(r => ({ src: r.data }));
    else if (input.id === 'pubBefore') pubExtra = { before: (await compressImage(files[0])).data };
    else {
      if (files.length < 2) { $('#pubErr').textContent = 'Scegli almeno due foto delle fasi.'; return; }
      pubExtra = { steps: (await Promise.all(files.slice(0, 6).map(f => compressImage(f, 720)))).map(r => r.data) };
    }
    $('#pubErr').textContent = '';
    pubExtraText();
  } catch { $('#pubErr').textContent = 'Non riesco a leggere questa immagine. Prova con un JPG o PNG.'; }
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
  if (f.dataset.edit) {
    const w = byId[f.dataset.edit], before = { ...w };
    Object.assign(w, { t, disc: $('#pubDisc').value, desc: $('#pubDesc').value.trim() || w.desc, img: f.dataset.img, thumb: f.dataset.img, w: +f.dataset.w, h: +f.dataset.h,
      before: pubExtra.before, steps: pubExtra.steps, co: $('#pubCo').value || undefined, cm: pubCm(), making: pubMaking || undefined });
    if (!saveMine()) { Object.assign(w, before); $('#pubErr').textContent = 'Spazio pieno su questo dispositivo: usa un\'immagine più leggera.'; return; }
    if (w.co && w.co !== before.co && w.co !== 'me') {
      window.NovaePush?.notifyEvent('E5', { workId: w.id, workTitle: w.t, actorName: ARTISTS.me.name }, { recipients: [w.co], actorId: 'me' });
    }
    closeSheet(); toast('Opera aggiornata'); refresh();
    return;
  }
  const w = {
    id: 'u' + Date.now(), t, a: 'me', type: 'image', disc: $('#pubDisc').value, desc: $('#pubDesc').value.trim() || 'Appena pubblicata.',
    img: f.dataset.img, thumb: f.dataset.img, w: +f.dataset.w, h: +f.dataset.h,
    likes: 0, rating: 0, views: 0, comments: 0, price: 0, year: new Date().getFullYear(), ts: Date.now(),
    audience: typeOf('me') === 'utente' ? 'followers' : 'public', // users publish only for their followers
    before: pubExtra.before, steps: pubExtra.steps, co: $('#pubCo').value || undefined, cm: pubCm(), making: pubMaking || undefined,
  };
  MINE.unshift(w);
  if (!saveMine()) { MINE.shift(); $('#pubErr').textContent = 'Spazio pieno su questo dispositivo: elimina una tua opera e riprova.'; return; }
  WORKS.unshift(w); byId[w.id] = w;
  if (w.co && w.co !== 'me') {
    window.NovaePush?.notifyEvent('E5', { workId: w.id, workTitle: w.t, actorName: ARTISTS.me.name }, { recipients: [w.co], actorId: 'me' });
  }
  toast('Opera pubblicata'); buzz();
  closeSheet(() => { if (location.hash === '#scopri') renderFeed(); else location.hash = '#scopri'; });
}
function deleteMine(id) {
  const i = MINE.findIndex(w => w.id === id);
  if (i < 0) return;
  MINE.splice(i, 1); saveMine();
  const wi = WORKS.findIndex(w => w.id === id);
  if (wi > -1) WORKS.splice(wi, 1);
  delete byId[id];
  saved.delete(id); saveSaved();
  toast('Opera eliminata');
  // change page only once the sheet's history entry is gone, or its "back" would land on the deleted work
  closeSheet(() => { if (location.hash.includes(id)) location.hash = '#profilo'; else refresh(); });
}
function openEditProfile() {
  openSheet(`<h3>Modifica profilo</h3>
    <form class="pub" id="profForm" novalidate data-banner="${profile.banner}">
      <div class="field"><span class="field-label">Banner</span>
        <label class="banner-drop ${profile.banner ? 'has' : ''}" id="bnDrop" ${profile.banner ? `style="background-image:url('${profile.banner}')"` : ''}><input type="file" accept="image/*" id="bnFile" aria-label="Immagine del banner"><span><i class="ph-light ph-image"></i>Scegli un banner</span></label>
        <button type="button" class="link-btn" data-act="banner-clear" ${profile.banner ? '' : 'hidden'}>Togli il banner</button></div>
      <div class="field"><span class="field-label">Tipo di profilo</span>
        <div class="type-pick" role="radiogroup" aria-label="Tipo di profilo">${Object.entries(TYPES).map(([k, t]) => `<label><input type="radio" name="pfType" value="${k}" ${profile.type === k ? 'checked' : ''}><span><i class="ph-light ph-${t.icon}"></i>${t.label}<small>${t.hint}</small></span></label>`).join('')}</div></div>
      <div class="field"><span class="field-label">Firma</span>
        <div class="sig-pad"><canvas id="sigPad" width="900" height="300" aria-label="Disegna qui la tua firma"></canvas><span id="sigHint">Firma qui col dito</span></div>
        <button type="button" class="link-btn" data-act="sig-clear">Cancella la firma</button>
        <small class="x-note">Compare sulle targhette delle tue opere nella Mostra e sul biglietto da visita.</small></div>
      <div class="field"><label for="pfName">Nome</label><input id="pfName" maxlength="40" value="${esc(profile.name)}" autocomplete="name"></div>
      <div class="field"><label for="pfHandle">Nome utente</label><input id="pfHandle" maxlength="24" value="${esc(profile.handle)}" autocomplete="username" spellcheck="false"></div>
      <div class="field"><label for="pfBio">Bio</label><textarea id="pfBio" maxlength="160" rows="3" placeholder="Chi sei e cosa crei, in poche parole">${esc(profile.bio)}</textarea></div>
      <div class="field"><label for="pfLink">Link</label><input id="pfLink" type="url" inputmode="url" maxlength="200" placeholder="Il tuo sito o portfolio" value="${esc(profile.link || '')}" autocomplete="url" spellcheck="false"></div>
      <p class="pub-err" id="pfErr" role="alert"></p>
      <button class="btn-accent" type="submit">Salva</button>
    </form>`);
  initSigPad();
}
/* Firma: drawn once with a finger (or the mouse) in Modifica profilo, kept as a black PNG cropped to the strokes */
let sigDirty = false;
const SIG_INK = '#ecebe6';
function initSigPad() {
  const c = $('#sigPad'), x = c.getContext('2d', { willReadFrequently: true });
  sigDirty = false;
  x.lineCap = x.lineJoin = 'round'; x.lineWidth = 7; x.strokeStyle = x.fillStyle = SIG_INK;
  if (profile.signature) {
    $('#sigHint').hidden = true;
    loadImg(profile.signature).then(im => {
      if (!im) return;
      const k = Math.min(c.width * .9 / im.width, c.height * .8 / im.height);
      x.drawImage(inkCanvas(im, SIG_INK), (c.width - im.width * k) / 2, (c.height - im.height * k) / 2, im.width * k, im.height * k);
    });
  }
  let last = null;
  const pos = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height]; };
  c.addEventListener('pointerdown', e => {
    try { c.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
    last = pos(e); sigDirty = true; $('#sigHint').hidden = true;
    x.beginPath(); x.arc(last[0], last[1], x.lineWidth / 2, 0, 7); x.fill();
  });
  c.addEventListener('pointermove', e => {
    if (!last) return;
    const evs = e.getCoalescedEvents?.(); // the in-between points of a fast stroke (not on iPhone: then just this one)
    for (const ev of evs?.length ? evs : [e]) { const p = pos(ev); x.beginPath(); x.moveTo(...last); x.lineTo(...p); x.stroke(); last = p; }
  });
  const end = () => { last = null; };
  c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
}
function clearSig() {
  const c = $('#sigPad');
  c.getContext('2d').clearRect(0, 0, c.width, c.height);
  sigDirty = true; $('#sigHint').hidden = false;
}
// what to save: the old signature if untouched, none if cleared, otherwise the strokes cropped to their edges, in black
function sigOut() {
  if (!sigDirty) return profile.signature || '';
  const c = $('#sigPad'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    if (d[(y * c.width + x) * 4 + 3] < 20) continue;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  if (x1 < 0) return '';
  const pad = 6, out = document.createElement('canvas');
  out.width = x1 - x0 + 1 + pad * 2; out.height = y1 - y0 + 1 + pad * 2;
  out.getContext('2d').drawImage(c, x0 - pad, y0 - pad, out.width, out.height, 0, 0, out.width, out.height);
  return inkCanvas(out, '#000').toDataURL('image/png');
}
async function onBannerFile(file) {
  if (!file) return;
  try {
    const r = await compressImage(file, 1200);
    $('#profForm').dataset.banner = r.data;
    $('#bnDrop').style.backgroundImage = `url('${r.data}')`; $('#bnDrop').classList.add('has');
    $('[data-act="banner-clear"]').hidden = false;
    $('#pfErr').textContent = '';
  } catch { $('#pfErr').textContent = 'Non riesco a leggere questa immagine. Prova con un JPG o PNG.'; }
}
function submitProfile() {
  const name = $('#pfName').value.trim(), handle = $('#pfHandle').value.trim().replace(/^@/, '').toLowerCase();
  if (!name) { $('#pfErr').textContent = 'Il nome non può essere vuoto.'; return; }
  if (!/^[a-z0-9._]{3,24}$/.test(handle)) { $('#pfErr').textContent = 'Nome utente: 3-24 caratteri tra lettere, numeri, punto e trattino basso.'; return; }
  const type = $('#profForm input[name="pfType"]:checked')?.value || profile.type;
  let link = $('#pfLink').value.trim();
  if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link;
  try { if (link) link = new URL(link).href; } catch { $('#pfErr').textContent = 'Il link non sembra un indirizzo web.'; $('#pfLink').focus(); return; }
  const next = { ...profile, name, handle, type, bio: $('#pfBio').value.trim(), link, banner: $('#profForm').dataset.banner || '', signature: sigOut() };
  try { localStorage.setItem('novae.profile', JSON.stringify(next)); }
  catch { $('#pfErr').textContent = 'Spazio pieno su questo dispositivo: scegli un banner più leggero.'; return; }
  Object.assign(profile, next);
  Object.assign(ARTISTS.me, { name, handle, type, bio: profile.bio });
  closeSheet(); toast('Profilo aggiornato'); refresh();
}

/* ---------------- 12. Messaggi ---------------- */
function renderMessages(tid) {
  const root = $('#messages');
  const th = blocked.has(tid) ? null : THREADS.find(t => t.id === tid) || (tid && ARTISTS[tid] ? { id: tid, msgs: [], time: 'ora', unread: 0 } : null);
  if (th) {
    th.unread = 0;
    window.NovaePush?.syncAppBadge();
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
    ${THREADS.filter(t => !blocked.has(t.id)).map(t => { // a blocked person can't write to you: no chat
      const last = t.msgs[t.msgs.length - 1];
      return `<a class="thread ${t.unread ? 'unread' : ''}" href="#messaggi/${t.id}">${avatarRing(t.id, 'sm').replace(/<a /, '<span ').replace(/<\/a>$/, '</span>').replace(/href="[^"]*"/, '')}
        <div style="min-width:0"><strong>${ARTISTS[t.id].name}</strong><p>${last ? (last[0] === 'me' ? 'Tu: ' : '') + last[1] : ''}</p></div>
        <time>${t.time}${t.unread ? `<span class="badge">${t.unread}</span>` : ''}</time></a>`;
    }).join('')}`;
}

/* ---------------- 13. Impostazioni ---------------- */
// installing as an app (PWA): Chrome/Android hands us a prompt; iPhone needs Share > Add to Home Screen
let installEvt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; });
window.addEventListener('appinstalled', () => { installEvt = null; toast('NOVAE installata'); if (cur.name === 'impostazioni') refresh(); });
const isApp = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
function install() {
  if (installEvt) { installEvt.prompt(); installEvt = null; return; }
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  openSheet(`<h3>Installa NOVAE</h3>${ios
    ? '<p>In Safari tocca <strong>Condividi</strong> <i class="ph-light ph-export"></i>, poi <strong>Aggiungi alla schermata Home</strong>.</p>'
    : '<p>Apri il menu del browser <i class="ph-light ph-dots-three-vertical"></i> e scegli <strong>Installa app</strong> (o <strong>Aggiungi a schermata Home</strong>).</p>'}`);
}
function renderSettings() {
  const code = store.get('novae.in') || 'NVE-ALFA';
  const toggles = store.get('novae.toggles') ? JSON.parse(store.get('novae.toggles')) : { priv: false, notif: false, auto: true, rate: true };
  const push = window.NovaePush;
  const pushStatus = push ? push.getStatus() : 'unsupported';
  const pushOn = pushStatus === 'active';
  const pushSub = {
    active: 'Attive su questo dispositivo',
    'ios-install': 'Su iPhone aggiungi prima NOVAE alla schermata Home',
    denied: 'Bloccate dal browser: riattivale nelle impostazioni',
    unsupported: 'Non supportate da questo browser',
    off: 'Messaggi, recensioni, commenti e attività',
  }[pushStatus];
  const pushNote = pushStatus === 'ios-install'
    ? '<div class="push-note"><span>Per ricevere notifiche su iPhone aggiungi NOVAE alla schermata Home da Safari (Condividi → Aggiungi alla schermata Home).</span><button type="button" class="btn-ghost" data-act="install">Come aggiungerla</button></div>'
    : pushStatus === 'denied'
      ? '<div class="push-note"><span>Hai bloccato le notifiche: riattivale dalle impostazioni di Safari o del dispositivo.</span></div>'
      : '';
  const pushPrefs = push ? push.getPrefs() : {};
  let pushTestHtml = '';
  /* TEST-PUSH-UI-START */
  if (pushOn && push) {
    pushTestHtml = `<div class="push-test">
      <select id="pushTestEvent" aria-label="Evento di test">${push.events.map(ev => `<option value="${ev.id}">${ev.id} · ${T(ev.label)}</option>`).join('')}</select>
      <button type="button" class="btn-ghost" data-act="push-test">Invia notifica di test</button>
    </div>`;
  }
  /* TEST-PUSH-UI-END */
  const pushSubList = pushOn && push
    ? `<div class="push-sublist">${push.events.map(ev => `<div class="set-row"><span>${ev.label}<small>${ev.sub}</small></span><label class="switch"><input type="checkbox" data-push-pref="${ev.id}" ${pushPrefs[ev.id] ? 'checked' : ''} aria-label="${ev.label}"><span></span></label></div>`).join('')}${pushTestHtml}</div>`
    : '';
  const sw = (k, label, sub, checked = toggles[k]) => `<div class="set-row"><span>${label}<small>${sub}</small></span><label class="switch"><input type="checkbox" data-toggle="${k}" ${checked ? 'checked' : ''} aria-label="${label}"><span></span></label></div>`;
  $('#settings').innerHTML = `
    <div class="set-head">${crop('impostazioni')}<h1>Impostazioni</h1></div>
    <div class="set-group"><h2>Account</h2>
      <button class="set-row set-link" data-act="edit-profile"><span>Modifica profilo<small>${ARTISTS.me.name}, @${ARTISTS.me.handle}</small></span><i class="ph-light ph-caret-right"></i></button>
      ${sw('priv', 'Profilo privato', 'Solo chi segui vede le tue opere')}
      <div class="set-row"><span>Lingua<small>Interfaccia</small></span><select aria-label="Lingua" data-lang><option value="it" ${LANG === 'it' ? 'selected' : ''}>Italiano</option><option value="en" ${LANG === 'en' ? 'selected' : ''}>English</option></select></div>
    </div>
    <div class="set-group"><h2>Esperienza</h2>
      ${sw('notif', 'Notifiche Novae', pushSub, pushOn)}
      ${pushNote}
      ${pushSubList}
      ${sw('auto', 'Riproduzione automatica', 'Video e audio nel feed')}
      ${sw('rate', 'Mostra valutazioni', 'Le stelle rosse sopra le opere')}
    </div>
    <div class="set-group"><h2>Inviti</h2>
      <div class="set-row"><span>Il tuo codice<small>Sei entrato con questo invito</small></span><span class="invite-code">${code}</span></div>
      <div class="set-row"><span>Invita qualcuno<small>${INVITES} inviti, ognuno vale 14 giorni</small></span><button class="btn-ghost" data-act="my-qr">Mostra QR</button></div>
    </div>
    <div class="set-group"><h2>App</h2>
      ${isApp() ? '<div class="set-row"><span>App installata<small>Stai usando NOVAE dalla schermata Home</small></span><i class="ph-light ph-check"></i></div>'
        : '<div class="set-row"><span>Installa l\'app<small>NOVAE sulla schermata Home, a schermo intero</small></span><button class="btn-ghost" data-act="install">Installa</button></div>'}
    </div>
    <div class="set-group"><h2>Regole e privacy</h2>
      <a class="set-row set-link" href="#doc/regole"><span>Regole della community<small>Cosa si può pubblicare e come funzionano le segnalazioni</small></span><i class="ph-light ph-caret-right"></i></a>
      <a class="set-row set-link" href="#doc/termini"><span>Termini d'uso</span><i class="ph-light ph-caret-right"></i></a>
      <a class="set-row set-link" href="#doc/privacy"><span>Privacy</span><i class="ph-light ph-caret-right"></i></a>
    </div>
    <div class="set-group">
      <div class="set-row"><span class="danger">Esci da NOVAE</span><button class="btn-ghost danger" data-act="logout">Esci</button></div>
    </div>`;
}
