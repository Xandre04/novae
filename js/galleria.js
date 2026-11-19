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
          ${w.type === 'image' ? `<dt>Misure</dt><dd>${cmOf(w).join(' × ')} cm</dd>` : ''}
          <dt>Visualizzazioni</dt><dd>${fmt(w.views)}</dd>
        </dl>
        ${AR_OK && w.type === 'image' ? arBtn(w) : ''}
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

/* ---------------- Vedila sul tuo muro: the work in augmented reality (AR Quick Look, iPhone and iPad) ----------------
   The model is made on the phone: a black frame at the real size with the picture on it, packed as a USDZ file. */
const AR_OK = (() => { try { return document.createElement('a').relList.supports('ar'); } catch { return false; } })();
// size in cm: the one given when publishing, or a guess (60 cm on the long side) from the picture's shape
const cmOf = w => w.cm || (ar => ar >= 1 ? [60, Math.round(60 / ar)] : [Math.round(60 * ar), 60])((w.w || 1200) / (w.h || 900));
const arBtn = w => `<button class="btn-ghost ar-btn" data-act="ar" data-id="${w.id}"><i class="ph-light ph-cube-focus"></i>Vedila sul tuo muro</button>`;
async function openAR(w) {
  toast("Preparo l'opera per il tuo muro");
  const file = await makeUSDZ(w);
  if (!file) { toast('Non riesco a preparare questa immagine'); return; }
  const a = document.createElement('a');
  a.rel = 'ar'; a.href = URL.createObjectURL(file);
  a.append(document.createElement('img')); // Quick Look only opens links that hold an image
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 60000);
}
async function makeUSDZ(w) {
  const im = await loadImg(w.img);
  if (!im) return null;
  const k = Math.min(1, 2048 / Math.max(im.width, im.height)), c = document.createElement('canvas');
  c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
  const jpg = new Uint8Array(await (await new Promise(r => c.toBlob(r, 'image/jpeg', .9))).arrayBuffer());
  return usdzZip([['novae.usda', new TextEncoder().encode(usdaOf(...cmOf(w).map(v => v / 100)))], ['art.jpg', jpg]]);
}
// the scene, in metres: the frame is a 3 cm deep box 2.5 cm wider than the work on each side, the picture sits on its front
function usdaOf(W, H) {
  const f = n => +n.toFixed(4), x = f(W / 2 + .025), y = f(H / 2 + .025), d = .03, ax = f(W / 2), ay = f(H / 2), az = d + .0005;
  const pts = p => `[${p.map(q => `(${q.join(', ')})`).join(', ')}]`;
  const box = pts([[-x, -y, 0], [x, -y, 0], [x, y, 0], [-x, y, 0], [-x, -y, d], [x, -y, d], [x, y, d], [-x, y, d]]);
  const art = pts([[-ax, -ay, az], [ax, -ay, az], [ax, ay, az], [-ax, ay, az]]);
  const S = '/Root/Scenes/Scene';
  return `#usda 1.0
(
    customLayerData = {
        string creator = "NOVAE"
    }
    defaultPrim = "Root"
    metersPerUnit = 1
    upAxis = "Y"
)

def Xform "Root"
{
    def Scope "Scenes" (
        kind = "sceneLibrary"
    )
    {
        def Xform "Scene" (
            customData = {
                bool preliminary_collidesWithEnvironment = 0
                string sceneName = "Scene"
            }
            sceneName = "Scene"
        )
        {
            token preliminary:anchoring:type = "plane"
            token preliminary:planeAnchoring:alignment = "vertical"

            def Mesh "Frame" (
                prepend apiSchemas = ["MaterialBindingAPI"]
            )
            {
                int[] faceVertexCounts = [4, 4, 4, 4, 4, 4]
                int[] faceVertexIndices = [4, 5, 6, 7, 0, 3, 2, 1, 1, 2, 6, 5, 0, 4, 7, 3, 3, 7, 6, 2, 0, 1, 5, 4]
                point3f[] points = ${box}
                uniform token subdivisionScheme = "none"
                rel material:binding = <${S}/Black>
            }

            def Mesh "Art" (
                prepend apiSchemas = ["MaterialBindingAPI"]
            )
            {
                int[] faceVertexCounts = [4]
                int[] faceVertexIndices = [0, 1, 2, 3]
                point3f[] points = ${art}
                normal3f[] normals = [(0, 0, 1), (0, 0, 1), (0, 0, 1), (0, 0, 1)] (
                    interpolation = "vertex"
                )
                texCoord2f[] primvars:st = [(0, 0), (1, 0), (1, 1), (0, 1)] (
                    interpolation = "vertex"
                )
                uniform token subdivisionScheme = "none"
                rel material:binding = <${S}/Paint>
            }

            def Material "Black"
            {
                token outputs:surface.connect = <${S}/Black/Surface.outputs:surface>

                def Shader "Surface"
                {
                    uniform token info:id = "UsdPreviewSurface"
                    color3f inputs:diffuseColor = (0.03, 0.03, 0.03)
                    float inputs:roughness = 0.5
                    token outputs:surface
                }
            }

            def Material "Paint"
            {
                token outputs:surface.connect = <${S}/Paint/Surface.outputs:surface>

                def Shader "Surface"
                {
                    uniform token info:id = "UsdPreviewSurface"
                    color3f inputs:diffuseColor.connect = <${S}/Paint/Image.outputs:rgb>
                    float inputs:roughness = 0.9
                    token outputs:surface
                }

                def Shader "Reader"
                {
                    uniform token info:id = "UsdPrimvarReader_float2"
                    token inputs:varname = "st"
                    float2 outputs:result
                }

                def Shader "Image"
                {
                    uniform token info:id = "UsdUVTexture"
                    asset inputs:file = @art.jpg@
                    float2 inputs:st.connect = <${S}/Paint/Reader.outputs:result>
                    token inputs:wrapS = "clamp"
                    token inputs:wrapT = "clamp"
                    float3 outputs:rgb
                }
            }
        }
    }
}
`;
}
// USDZ = a zip with no compression whose files each start on a 64-byte boundary (the padding goes in the extra field)
const CRC_T = Array.from({ length: 256 }, (_, n) => { for (let k = 0; k < 8; k++) n = n & 1 ? 0xEDB88320 ^ (n >>> 1) : n >>> 1; return n >>> 0; });
const crc32 = b => { let c = -1; for (const v of b) c = CRC_T[(c ^ v) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function usdzZip(files) {
  const parts = [], central = [];
  let off = 0;
  for (const [name, data] of files) {
    const nm = new TextEncoder().encode(name), crc = crc32(data);
    const pad = (64 - (off + 30 + nm.length + 4) % 64) % 64, extra = new Uint8Array(4 + pad), ev = new DataView(extra.buffer);
    ev.setUint16(0, 0x1986, true); ev.setUint16(2, pad, true);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true);
    h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true);
    h.setUint16(26, nm.length, true); h.setUint16(28, extra.length, true);
    parts.push(new Uint8Array(h.buffer), nm, extra, data);
    const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true); cd.setUint16(4, 20, true); cd.setUint16(6, 20, true);
    cd.setUint32(16, crc, true); cd.setUint32(20, data.length, true); cd.setUint32(24, data.length, true);
    cd.setUint16(28, nm.length, true); cd.setUint32(42, off, true);
    central.push(new Uint8Array(cd.buffer), nm);
    off += 30 + nm.length + extra.length + data.length;
  }
  const size = central.reduce((s, p) => s + p.length, 0), end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, size, true); end.setUint32(16, off, true);
  return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: 'model/vnd.usdz+zip' });
}
