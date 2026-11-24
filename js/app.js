/* NOVAE · Router, all the event listeners and start-up. Loaded last.
   The js/*.js files are plain scripts that share one scope, loaded in order by index.html. */
'use strict';

/* ---------------- Router ---------------- */
const RENDER = {
  invito: () => drawQR(),
  doc: renderDoc,
  hub: renderHub,
  scopri: renderFeed,
  post: renderThread,
  vista: renderVista,
  galleria: renderStile,
  stile: () => {}, // static "coming soon" page
  disciplina: renderCine,
  opera: renderDetail,
  novae: initGlobe,
  mercato: renderMarket,
  profilo: extra => renderProfile(undefined, extra),
  artista: renderProfile,
  messaggi: renderMessages,
  impostazioni: renderSettings,
};
const TITLES = {
  invito: 'Invito', doc: 'Regole e privacy', scopri: 'Scopri', post: 'Post', vista: 'Opera', galleria: 'Galleria', stile: 'Stile', disciplina: 'Galleria', opera: 'Opera',
  novae: 'Novae', mercato: 'Mercato', profilo: 'Profilo', artista: 'Artista', messaggi: 'Messaggi', impostazioni: 'Impostazioni',
};
const scrollMemo = new Map(); // hash -> scrollY, so "back" lands where you left
let curHash = null;
const trail = []; // visited hashes, so the back button knows if history.back() stays inside NOVAE
function route() {
  if (curHash !== null) scrollMemo.set(curHash, window.scrollY);
  curHash = location.hash;
  if (trail.length > 1 && trail[trail.length - 2] === curHash) trail.pop(); else trail.push(curHash);
  let [name, param, extra] = decodeURIComponent(location.hash.slice(1)).split('/');
  if (name === 'seguiti') name = 'stile'; // old link to the followed-artists works
  document.body.classList.toggle('out', !store.get('novae.in'));
  if (!store.get('novae.in') && name !== 'doc') name = 'invito'; // rules, terms and privacy are readable before entering
  else if (!name || name === 'invito' || !(name in RENDER)) name = 'hub';
  if (name === 'galleria' && param) name = 'disciplina';
  const screen = name === 'artista' ? 'profilo' : name;
  setArc(false);
  closeSheet();
  $('#search').hidden = true;
  // leaving Scorri or Sfoglia lets go of their pictures (both are drawn again on the way back): two full feeds in memory
  // at once were too much for iPhone Safari
  const was = document.body.dataset.screen;
  if (was === 'vista' && screen !== 'vista') { reelObserver?.disconnect(); $('#vista').innerHTML = ''; }
  if (was === 'scopri' && screen !== 'scopri') $('#feed').innerHTML = '';
  $$('.screen').forEach(s => s.classList.toggle('active', s.dataset.screen === screen));
  document.body.dataset.screen = screen;
  document.title = name === 'hub' ? 'NOVAE' : `${TITLES[name] || ''} | NOVAE`;
  if (HUB.some(h => h.k === name)) { prefs.lastHub = name; savePrefs(); }
  cur = { name, param };
  RENDER[name](param, extra);
  markScrollable();
  const y = scrollMemo.get(curHash) || 0;
  window.scrollTo(0, 0);
  if (y) requestAnimationFrame(() => window.scrollTo(0, y));
}
let cur = { name: '', param: '' };
// Re-render the current screen in place (after follow, publish, edits...), keeping the scroll position
function refresh() {
  const y = window.scrollY;
  RENDER[cur.name]?.(cur.param);
  markScrollable();
  requestAnimationFrame(() => window.scrollTo(0, y));
}
// the scroll rail only makes sense when the page scrolls; checked again once the enter animation and images settle
const checkScrollable = () => document.body.classList.toggle('no-scroll', document.documentElement.scrollHeight <= innerHeight + 8);
let scrollT;
const markScrollable = () => { checkScrollable(); clearTimeout(scrollT); scrollT = setTimeout(checkScrollable, 900); };
window.addEventListener('resize', checkScrollable);
// Pull to refresh on the feed (touch): pull down from the top, release to get a fresh order
(() => {
  let y0 = null, dy = 0, busy = false;
  const ptr = $('#ptr');
  const reset = () => { ptr.classList.remove('ready', 'spin'); ptr.style.removeProperty('--pull'); ptr.style.opacity = ''; };
  window.addEventListener('touchstart', e => {
    if (cur.name !== 'scopri' || window.scrollY > 0 || busy) return;
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
function setLike(w, on, actorId = 'me') {
  on ? liked.add(w.id) : liked.delete(w.id);
  saveLikes();
  $$(`[data-act="like"][data-id="${w.id}"]`).forEach(b => {
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    b.querySelector('i').className = `${on ? 'ph-fill' : 'ph-light'} ph-heart`;
    b.classList.remove('pop'); void b.offsetWidth; if (on) b.classList.add('pop');
  });
  $$(`[data-count="${w.id}"]`).forEach(s => s.textContent = s.dataset.short ? short(likeCount(w)) : fmt(likeCount(w)));
  if (on) {
    buzz();
    const recipients = [w.a, w.co].filter(aid => aid && aid !== actorId);
    window.NovaePush?.notifyEvent('E8', { workId: w.id, workTitle: w.t, actorId, actorName: ARTISTS[actorId]?.name || ARTISTS.me.name }, { recipients, actorId });
  }
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
// a picture that can't load: stop the shimmer and leave a quiet empty frame instead of a broken-image icon
document.addEventListener('error', e => {
  if (e.target.tagName === 'IMG') { e.target.classList.add('broken'); e.target.parentElement?.classList.add('loaded'); }
}, true);
addEventListener('offline', () => toast('Sei offline: vedi quello che hai già aperto'));
addEventListener('online', () => toast('Di nuovo online'));

document.addEventListener('click', e => {
  // a link to the page you're already on (e.g. Sfoglia while in Sfoglia) takes you back to the top
  const here = e.target.closest('a[href^="#"]');
  if (here && here.getAttribute('href') === location.hash && !here.closest('#sheet') && !e.target.closest('[data-dbl]')) {
    e.preventDefault(); scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); return;
  }
  // choosing the point of a comment: a tap on the work marks it instead of opening it
  const ptMedia = document.body.classList.contains('pt-picking') && e.target.closest('#thread .x-media');
  if (ptMedia) { e.preventDefault(); setPt(ptMedia, e); return; }
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
      const tapped = byId[dbl.dataset.dbl];
      if (dbl.matches('.x-media') && tapped?.pair) { const [a, b] = pairOf(tapped); if (a && b) openDiptych(a, b); return; } // a dittico: its two works side by side
      if (dbl.matches('.x-media')) { // Sfoglia: the feed as an exhibition, from this work
        const works = feedList();
        openShow({ works, name: T('Sfoglia'), start: Math.max(0, works.findIndex(w => w.id === dbl.dataset.dbl)) });
        return;
      }
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
  if (!el) {
    // a tap on the post's empty/black area (not the picture, a link or a button) opens its comments
    const xp = e.target.closest('.xpost[data-thread]');
    if (xp && !e.target.closest('a, button, input, [data-dbl]') && !getSelection().toString()) location.hash = '#post/' + xp.dataset.thread;
    return;
  }
  const act = el.dataset.act;
  const w = byId[el.dataset.id];
  switch (act) {
    case 'thread':
      if (cur.name === 'post' && cur.param === w.id) { $('#replyInput')?.focus(); break; }
      focusReply = true;
      location.hash = '#post/' + w.id;
      break;
    case 'repost': {
      const on = !reposted.has(w.id);
      on ? reposted.add(w.id) : reposted.delete(w.id);
      store.set('novae.reposted', JSON.stringify([...reposted]));
      $$(`[data-act="repost"][data-id="${w.id}"]`).forEach(b => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      $$(`[data-rp="${w.id}"]`).forEach(s => s.textContent = s.dataset.short ? short(repostCount(w)) : fmt(repostCount(w)));
      toast(on ? 'Ripubblicata per chi ti segue' : 'Ripubblicazione annullata');
      if (on) {
        buzz();
        const recipients = [w.a, w.co].filter(aid => aid && aid !== 'me');
        window.NovaePush?.notifyEvent('E9', { workId: w.id, workTitle: w.t, actorId: 'me', actorName: ARTISTS.me.name }, { recipients, actorId: 'me' });
      }
      break;
    }
    case 'not-interested': {
      hidden.add(w.id);
      store.set('novae.hidden', JSON.stringify([...hidden]));
      closeSheet();
      const undo = () => { hidden.delete(w.id); store.set('novae.hidden', JSON.stringify([...hidden])); if (cur.name === 'scopri') refresh(); };
      toast('Non vedrai più questa opera', { label: 'Annulla', fn: undo });
      if (cur.name === 'scopri') refresh();
      else if (cur.name === 'post') location.hash = '#scopri';
      break;
    }
    case 'unhide-all': hidden.clear(); store.del('novae.hidden'); refresh(); break;
    case 'arc': {
      // double tap on the star: back to the main menu (timed by hand, dblclick isn't reliable on phones)
      const now = Date.now(), dbl = now - lastStarTap < 350;
      lastStarTap = dbl ? 0 : now;
      if (dbl) location.hash = '#hub';
      else setArc(el.getAttribute('aria-expanded') !== 'true');
      break;
    }
    case 'arc-close': setArc(false); break;
    case 'search': openSearch(); break;
    case 'search-close': $('#search').hidden = true; break;
    case 'sheet-close': { // a link inside a sheet: close it first, then go (otherwise going back would land on the sheet again)
      const h = el.getAttribute('href');
      if (h) { e.preventDefault(); closeSheet(() => { location.hash = h; }); } else closeSheet();
      break;
    }
    case 'bars': setArc(false); openBars(); break;
    case 'install': install(); break;
    case 'notifs': openNotifs(); break;
    case 'create': openCreate(); break;
    case 'my-qr': openMyQR(); break;
    case 'card': openCard(); break;
    case 'prof-more': openProfMore(el.dataset.a); break;
    case 'share-profile': shareProfile(el.dataset.a); break;
    case 'mute': toggleMute(el.dataset.a); break;
    case 'block': blockUser(el.dataset.a); break;
    case 'unblock': unblockUser(el.dataset.a); break;
    case 'report-user': openReportUser(el.dataset.a); break;
    case 'card-save': saveCard(); break;
    case 'show': openShow(showList); break;
    case 'cmp': break;
    case 'globe-out': zoomOut(); break;
    case 'globe-in': zoomIn(); break;
    case 'car-step': { // a mouse has no sideways swipe: the arrows move the carousel one slide
      e.preventDefault();
      const car = el.parentElement.querySelector('.car');
      car.scrollBy({ left: +el.dataset.dir * car.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
      break;
    }
    case 'pt-pick': togglePtPick(el); break;
    case 'pt': showPt(+el.dataset.x, +el.dataset.y); break;
    case 'sig-clear': clearSig(); break;
    case 'ar': openAR(w); break; // the "prima e dopo" bar: dragging it must not open or like the work
    case 'problem': openProblem(); break;
    case 'invite-share': {
      const text = `Entra su NOVAE con il mio codice ${myCode()}`, url = inviteLink(myCode());
      if (navigator.share) navigator.share({ title: 'NOVAE', text, url }).catch(() => {});
      else navigator.clipboard?.writeText(`${text}: ${url}`).then(() => toast('Invito copiato'), () => toast(myCode()));
      break;
    }
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
      openSheet(`<h3>${fmt(w.comments)} commenti</h3>${w.comments ? COMMENTS.map(([id, t]) => `<div class="comment">${avatarRing(id, 'sm')}<div><strong>${ARTISTS[id].name}</strong> ${whoTag(id)}${typeOf(id) === 'critico' ? `<div class="x-reply-rating">${rating(4.5, 13)}</div>` : ''}<p>${t}</p></div></div>`).join('') : '<p>Ancora nessun commento. Scrivi il primo.</p>'}
        <form class="composer" data-comment="${w.id}"><input placeholder="Aggiungi un commento" aria-label="Commento" autocomplete="off"><button aria-label="Invia"><i class="ph-light ph-paper-plane-right"></i></button></form>`);
      break;
    case 'info':
      openSheet(`<h3>${w.t}</h3>${rating(w.rating, 18)}<p style="margin-top:12px">${w.desc}</p><p style="margin-top:8px;color:var(--ink-3)">${ARTISTS[w.a].name}, ${w.disc.toLowerCase()}, ${w.year}</p><a class="btn-ghost" href="#opera/${w.id}">Scheda completa</a>`);
      break;
    case 'more':
      // three dots: Salva, Segnala, Non mi interessa (your own works: Salva, Elimina)
      openSheet(`<h3>${w.t}</h3><div class="action-list">
        <button data-act="save" data-id="${w.id}"><i class="${saved.has(w.id) ? 'ph-fill' : 'ph-light'} ph-bookmark-simple"></i>${saved.has(w.id) ? 'Rimuovi dai salvati' : 'Salva'}</button>
        <button data-act="art-reply" data-id="${w.id}"><i class="ph-light ph-arrow-bend-down-right"></i>Rispondi con un'opera</button>
        ${w.pair ? '' : `<button data-act="pair" data-id="${w.id}"><i class="ph-light ph-columns"></i>Metti accanto a…</button>`}
        ${w.a === 'me'
          ? `<button data-act="edit-work" data-id="${w.id}"><i class="ph-light ph-pencil-simple"></i>Modifica opera</button>
             <button class="danger" data-act="delete" data-id="${w.id}"><i class="ph-light ph-trash"></i>Elimina opera</button>`
          : `<button data-act="report" data-id="${w.id}"><i class="ph-light ph-flag"></i>Segnala</button>
             <button data-act="not-interested" data-id="${w.id}"><i class="ph-light ph-eye-slash"></i>Non mi interessa</button>`}
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
    case 'report': openReport(w); break;
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
    case 'edit-work': openPublish(w); break;
    case 'art-reply': closeSheet(() => openPublish(null, el.dataset.id)); break;
    case 'pair': closeSheet(() => openPairPicker(w)); break;
    case 'pair-with': closeSheet(() => openDiptych(byId[el.dataset.id], byId[el.dataset.b], true)); break;
    case 'pick-star': {
      const f = el.closest('form'), n = +el.dataset.v;
      f.dataset.stars = f.dataset.stars == n ? 0 : n; // tap the same star again to clear
      $$('[data-act="pick-star"]', f).forEach(b => { b.classList.toggle('on', +b.dataset.v <= +f.dataset.stars); b.setAttribute('aria-checked', +b.dataset.v === +f.dataset.stars); });
      break;
    }
    case 'banner-clear': {
      $('#profForm').dataset.banner = '';
      $('#bnDrop').style.backgroundImage = ''; $('#bnDrop').classList.remove('has');
      el.hidden = true;
      break;
    }
    case 'ctab':
      if (el.dataset.v === 'Ordina per') cineState.sortOpen = !cineState.sortOpen;
      else { cineState.tab = prefs.cineTab = el.dataset.v; cineState.sortOpen = false; cineState.expanded = null; savePrefs(); }
      renderCine(slugOf(CINEMA)); break;
    case 'csort': cineState.sort = prefs.cineSort = el.dataset.v; cineState.sortOpen = false; savePrefs(); renderCine(slugOf(CINEMA)); break;
    case 'cf': cineState.center[el.dataset.g] = +el.dataset.i; cineState.expanded = null; renderCine(slugOf(CINEMA)); break;
    case 'expand': cineState.expanded = el.dataset.id; renderCine(slugOf(CINEMA)); break;
    case 'collapse': cineState.expanded = null; renderCine(slugOf(CINEMA)); break;
    case 'related': {
      const open = el.getAttribute('aria-expanded') !== 'true';
      el.setAttribute('aria-expanded', open);
      $('#relPanel').classList.toggle('open', open);
      break;
    }
    case 'country-prev': selectCountry(globe.idx - 1); break;
    case 'country-next': selectCountry(globe.idx + 1); break;
    case 'ptab': profTab = el.dataset.v; renderProfile(el.dataset.a || undefined); break;
    case 'psort': profSort = el.dataset.v; renderProfile(el.dataset.a || undefined); break;
    case 'pick-col': profCol = el.dataset.col || null; refresh(); break;
    case 'new-col': openNewCol(); break;
    case 'del-col': { const i = MY_COLS.findIndex(c => c.id === el.dataset.col); if (i > -1) { MY_COLS.splice(i, 1); saveCols(); } profCol = null; toast('Costellazione eliminata'); refresh(); break; }
    case 'follow': {
      const id = el.dataset.a;
      followed.has(id) ? followed.delete(id) : followed.add(id);
      saveFollowed();
      toast(followed.has(id) ? `Ora segui ${ARTISTS[id].name}` : `Non segui più ${ARTISTS[id].name}`);
      if (followed.has(id)) {
        buzz();
        if (id && id !== 'me') window.NovaePush?.notifyEvent('E6', { actorId: 'me', actorName: ARTISTS.me.name }, { recipients: [id], actorId: 'me' });
      }
      refresh();
      if (followed.has(id)) $(`#profile [data-act="follow"][data-a="${id}"]`)?.classList.add('pop'); // small press-back on the new state
      break;
    }
    /* TEST-PUSH-UI-START */
    case 'push-test': window.NovaePush?.sendTest($('#pushTestEvent')?.value); break;
    /* TEST-PUSH-UI-END */
    case 'buy': toast('Acquisto in crediti disponibile a breve'); break;
    case 'logout': store.del('novae.in'); location.hash = '#invito'; break;
    case 'soon': toast('Presto disponibile'); break;
  }
});

document.addEventListener('submit', e => {
  const f = e.target;
  if (f.id === 'pubForm') { e.preventDefault(); submitPublish(f); return; }
  if (f.dataset.reply) { e.preventDefault(); submitReply(f); return; }
  if (f.id === 'profForm') { e.preventDefault(); submitProfile(); return; }
  if (f.id === 'colForm') { e.preventDefault(); submitCol(); return; }
  if (f.id === 'problemForm') { e.preventDefault(); submitProblem(); return; }
  if (f.id === 'reportForm') { e.preventDefault(); submitReport(f); return; }
  if (f.id === 'dipForm') { e.preventDefault(); submitDiptych(f); return; }
  if (f.classList.contains('composer')) {
    e.preventDefault();
    const input = f.querySelector('input');
    const text = input.value.trim();
    if (!text) return;
    if (f.dataset.thread) {
      const th = THREADS.find(t => t.id === f.dataset.thread);
      th.msgs.push(['me', text]); th.time = 'ora';
      window.NovaePush?.notifyEvent('E1', { threadId: th.id, senderName: ARTISTS.me.name, text }, { recipients: [th.id], actorId: 'me' });
      renderMessages(th.id);
      $('#msgInput').focus();
    } else {
      f.insertAdjacentHTML('beforebegin', `<div class="comment"><span class="avatar-ring sm" style="display:grid;place-items:center;--w:24px">${crop('profilo')}</span><div><strong>Tu</strong><p>${text.replace(/</g, '&lt;')}</p></div></div>`);
      const cw = byId[f.dataset.comment];
      const recipients = cw ? [cw.a, cw.co].filter(aid => aid && aid !== 'me') : [];
      window.NovaePush?.notifyEvent('E3', { workId: f.dataset.comment, workTitle: cw?.t || '', actorId: 'me', actorName: ARTISTS.me.name, text, hasPoint: false }, { recipients, actorId: 'me' });
      input.value = '';
    }
  }
});

document.addEventListener('change', e => {
  if (e.target.id === 'pubFile') { onPubFile(e.target.files[0]); return; }
  if (e.target.id === 'bnFile') { onBannerFile(e.target.files[0]); return; }
  if (e.target.id === 'pubBefore' || e.target.id === 'pubSteps' || e.target.id === 'pubMaking') { onPubExtra(e.target); return; }
  if (e.target.matches('[data-lang]')) { store.set('novae.lang', e.target.value); location.reload(); return; }
  if (e.target.dataset.pushPref) { window.NovaePush?.setEventPref(e.target.dataset.pushPref, e.target.checked); return; }
  const k = e.target.dataset.toggle;
  if (!k) return;
  if (k === 'notif' && window.NovaePush) { window.NovaePush.handleMasterToggle(e.target); return; }
  const t = store.get('novae.toggles') ? JSON.parse(store.get('novae.toggles')) : { priv: false, notif: false, auto: true, rate: true };
  t[k] = e.target.checked;
  store.set('novae.toggles', JSON.stringify(t));
});

$('#q').addEventListener('input', e => renderResults(e.target.value));
// carousels: the dot of the slide on screen lights up
document.addEventListener('scroll', e => {
  const car = e.target;
  if (!car.classList?.contains('car')) return;
  const i = Math.round(car.scrollLeft / car.clientWidth), box = car.parentElement;
  $$('.car-dots i', box).forEach((d, j) => d.classList.toggle('on', j === i));
  box.classList.toggle('car-moved', i > 0); box.classList.toggle('car-end', i === car.children.length - 1);
}, true);
// "prima e dopo": the bar moves the edge between sketch and finished work
document.addEventListener('input', e => { if (e.target.matches('.cmp-range')) e.target.parentElement.style.setProperty('--x', e.target.value + '%'); });
// process posts: every 1.2 s each one shows its next stage, and holds one beat longer on the finished work
setInterval(() => $$('.steps').forEach(s => {
  const ims = $$('img', s), k = (+s.dataset.k + 1) % (ims.length + 1), on = Math.min(k, ims.length - 1);
  s.dataset.k = k;
  ims.forEach((im, i) => im.classList.toggle('on', i === on));
  $$('.steps-dots i', s).forEach((d, i) => d.classList.toggle('on', i === on));
}), 1200);

$('#q').addEventListener('keydown', e => { if (e.key === 'Enter') addRecent(e.target.value); });

document.addEventListener('keydown', e => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
  const scr = document.body.dataset.screen;
  if (e.key === 'Escape') { setArc(false); closeSheet(); $('#search').hidden = true; return; }
  if ($('#arc').classList.contains('open') && !$('#arc').classList.contains('closing')) {
    const dir = { ArrowRight: -1, ArrowDown: -1, ArrowLeft: 1, ArrowUp: 1 }[e.key];
    if (dir) { e.preventDefault(); wheel.live = true; spinTo(snapRot(wheel.rot) + dir * STEP, 260); return; }
    if (e.key === 'Enter' && !e.target.closest?.('.arc-item')) { e.preventDefault(); wheelGo(selIndex()); return; }
  }
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === '/' && store.get('novae.in')) { e.preventDefault(); openSearch(); }
  if (scr === 'vista' && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); stepVista(e.key === 'ArrowDown' ? 1 : -1); }
  if (scr === 'novae' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) selectCountry(globe.idx + (e.key === 'ArrowRight' ? 1 : -1));
});

window.addEventListener('hashchange', route);

drawSky();
renderArc();
markBars();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {}); // app: offline + installable
route();
