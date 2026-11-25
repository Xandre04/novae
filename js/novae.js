/* NOVAE · Novae: the globe with the artists of each country.
   The js/*.js files are plain scripts that share one scope, loaded in order by index.html. */
'use strict';

/* ---------------- 9. Scopri ---------------- */
const startC = COUNTRIES[prefs.country] || COUNTRIES[0];
const globe = { ready: false, loading: false, idx: COUNTRIES.indexOf(startC), rot: [-startC.c[0], -startC.c[1], 0], scale: 258 };
const WORLD = 258; // the globe's radius with nothing chosen; picking a country zooms in on it
// Points of interest: real places of art in each country (museums, street art, galleries, biennials)
const POIS = {
  Italia: [
    { name: 'Uffizi', type: 'Museo', city: 'Firenze', ll: [11.2553, 43.7678] },
    { name: 'Biennale', type: 'Biennale', city: 'Venezia', ll: [12.357, 45.43] },
    { name: 'Pinacoteca di Brera', type: 'Museo', city: 'Milano', ll: [9.1879, 45.4719] },
    { name: 'MAXXI', type: 'Arte contemporanea', city: 'Roma', ll: [12.4664, 41.9284] },
    { name: 'Murales di Orgosolo', type: 'Street art', city: 'Orgosolo', ll: [9.3536, 40.2063] },
    { name: 'Murales dei Quartieri Spagnoli', type: 'Street art', city: 'Napoli', ll: [14.2466, 40.8433] },
  ],
  Thailandia: [
    { name: 'Bangkok Art and Culture Centre', type: 'Galleria', city: 'Bangkok', ll: [100.53, 13.7467] },
    { name: 'MAIIAM', type: 'Arte contemporanea', city: 'Chiang Mai', ll: [99.0889, 18.771] },
    { name: 'Tempio Bianco', type: 'Luogo d\'arte', city: 'Chiang Rai', ll: [99.7631, 19.8244] },
  ],
  Giappone: [
    { name: 'teamLab Planets', type: 'Arte digitale', city: 'Tokyo', ll: [139.7895, 35.6491] },
    { name: 'Naoshima, l\'isola dell\'arte', type: 'Arte contemporanea', city: 'Naoshima', ll: [133.995, 34.46] },
    { name: 'Museo d\'arte di Kyoto', type: 'Museo', city: 'Kyoto', ll: [135.7826, 35.0124] },
  ],
  India: [
    { name: 'National Gallery of Modern Art', type: 'Museo', city: 'Nuova Delhi', ll: [77.2346, 28.61] },
    { name: 'CSMVS', type: 'Museo', city: 'Mumbai', ll: [72.8326, 18.9269] },
    { name: 'Kochi-Muziris Biennale', type: 'Biennale', city: 'Kochi', ll: [76.26, 9.9658] },
  ],
  Nigeria: [
    { name: 'Nike Art Gallery', type: 'Galleria', city: 'Lagos', ll: [3.492, 6.44] },
    { name: 'Bosco sacro di Osun', type: 'Luogo d\'arte', city: 'Osogbo', ll: [4.551, 7.755] },
    { name: 'Museo Nazionale', type: 'Museo', city: 'Benin City', ll: [5.623, 6.335] },
  ],
  Francia: [
    { name: 'Louvre', type: 'Museo', city: 'Parigi', ll: [2.3376, 48.8606] },
    { name: 'Fresque des Lyonnais', type: 'Street art', city: 'Lione', ll: [4.827, 45.768] },
    { name: 'MuCEM', type: 'Museo', city: 'Marsiglia', ll: [5.361, 43.2967] },
    { name: 'Fondation Maeght', type: 'Arte contemporanea', city: 'Saint-Paul-de-Vence', ll: [7.1146, 43.702] },
  ],
  Brasile: [
    { name: 'Beco do Batman', type: 'Street art', city: 'San Paolo', ll: [-46.6912, -23.5558] },
    { name: 'Museu do Amanhã', type: 'Museo', city: 'Rio de Janeiro', ll: [-43.1795, -22.894] },
    { name: 'Inhotim', type: 'Arte contemporanea', city: 'Brumadinho', ll: [-44.2236, -20.1236] },
  ],
  Messico: [
    { name: 'Museo Frida Kahlo', type: 'Museo', city: 'Città del Messico', ll: [-99.1626, 19.3551] },
    { name: 'Murales di Orozco', type: 'Street art', city: 'Guadalajara', ll: [-103.3366, 20.6766] },
    { name: 'MACO', type: 'Arte contemporanea', city: 'Oaxaca', ll: [-96.7253, 17.0627] },
  ],
};
const POI_ICONS = { Museo: 'bank', 'Street art': 'spray-bottle', Galleria: 'frame-corners', Biennale: 'globe-hemisphere-west', 'Arte contemporanea': 'cube', 'Arte digitale': 'cpu', "Luogo d'arte": 'tree' };
function openPoi(p) {
  const c = COUNTRIES[globe.idx], ids = artistsIn(c);
  openSheet(`<h3>${p.name}</h3><div class="poi-sheet">
    <p class="poi-type"><i class="ph-light ph-${POI_ICONS[p.type] || 'star'}"></i>${p.type}<span><span>${p.city}</span>, <span>${c.it}</span></span></p>
    ${ids.length ? `<p class="x-note">Artisti NOVAE in ${c.it}</p><div class="country-artists">${ids.map(id => `<a class="c-artist" href="#artista/${id}" data-act="sheet-close"><span class="avatar-ring">${img(avatar(id), '')}</span>${ARTISTS[id].name.split(' ')[0]}</a>`).join('')}</div>` : ''}
  </div>`);
}
// the countries in alphabetical order (in the interface language), for the wheel under the globe
const ORDER = COUNTRIES.map((c, i) => i).sort((a, b) => T(COUNTRIES[a].it).localeCompare(T(COUNTRIES[b].it), LOCALE));
const stepCountry = d => { const n = ORDER.length, p = ORDER.indexOf(globe.idx); selectCountry(ORDER[(p + d + n) % n], d); };
function artistsIn(c) { return AIDS.filter(id => ARTISTS[id].country === c.it); }
function updateCountryUi() {
  const c = COUNTRIES[globe.idx];
  const ids = artistsIn(c);
  const works = WORKS.filter(w => ids.includes(w.a)).length;
  $('#countryName').textContent = c.it;
  const n = ORDER.length, p = ORDER.indexOf(globe.idx); // the one before and the one after, on the sides of the wheel
  $('#countryPrev').textContent = COUNTRIES[ORDER[(p - 1 + n) % n]].it;
  $('#countryNext').textContent = COUNTRIES[ORDER[(p + 1) % n]].it;
  $('#countryMeta').textContent = `${ids.length} ${ids.length === 1 ? 'artista' : 'artisti'}, ${works} opere`;
  $('#countryArtists').innerHTML = ids.map(id => `<a class="c-artist" href="#artista/${id}"><span class="avatar-ring">${img(avatar(id), '')}</span>${ARTISTS[id].name.split(' ')[0]}</a>`).join('');
}
async function initGlobe() {
  updateCountryUi();
  if (globe.ready || globe.loading) return;
  globe.loading = true;
  try {
    await Promise.all([loadScript(LIBS.d3), loadScript(LIBS.topojson)]);
    const world = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(r => r.json());
    const feats = topojson.feature(world, world.objects.countries).features;
    const land = topojson.mesh(world, world.objects.countries, (a, b) => a === b);
    const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
    const proj = d3.geoOrthographic().scale(WORLD).translate([270, 270]).clipAngle(90).rotate(globe.rot);
    const path = d3.geoPath(proj);
    const svg = d3.select('#globe');
    svg.append('circle').attr('class', 'sphere').attr('cx', 270).attr('cy', 270).attr('r', WORLD);
    // zoomed in, the map grows inside the globe's circle, like looking through a lens
    svg.append('defs').append('clipPath').attr('id', 'globeClip').append('circle').attr('cx', 270).attr('cy', 270).attr('r', WORLD);
    const g = svg.append('g').attr('filter', 'url(#chalk)').attr('clip-path', 'url(#globeClip)');
    const grat = g.append('path').attr('class', 'grat').datum(d3.geoGraticule10());
    const hits = g.append('g').selectAll('path').data(feats).join('path').attr('class', 'hit')
      .on('click', (e, f) => {
        const i = COUNTRIES.findIndex(c => c.en === f.properties.name);
        if (i > -1) selectCountry(i); else toast('Ancora nessun artista in questo paese');
      });
    const coast = g.append('path').attr('class', 'land').datum(land);
    const bord = g.append('path').attr('class', 'land').attr('stroke-opacity', .35).datum(borders);
    const sel = g.append('path').attr('class', 'sel');
    const r = rng(9);
    const markers = COUNTRIES.flatMap(c => artistsIn(c).map(() => [c.c[0] + (r() - .5) * 6, c.c[1] + (r() - .5) * 4]))
      .concat(Array.from({ length: 10 }, () => [r() * 360 - 180, r() * 120 - 50]));
    const mk = svg.append('g').attr('clip-path', 'url(#globeClip)').selectAll('image').data(markers).join('image').attr('href', STAR_SRC).attr('class', 'mk').attr('width', 18).attr('height', 20);
    // points of interest of the chosen country: white stars on its museums, street art, galleries..., with the name
    const poiG = svg.append('g').attr('class', 'pois').attr('clip-path', 'url(#globeClip)');
    globe.showPois = () => {
      poiG.selectAll('*').remove();
      (POIS[COUNTRIES[globe.idx].it] || []).forEach((p, i) => {
        const g = poiG.append('g').attr('class', 'poi').datum(p).attr('tabindex', 0).attr('role', 'button')
          .attr('aria-label', `${p.name}, ${T(p.type)}`).on('click', () => openPoi(p));
        const inner = g.append('g').attr('class', 'poi-in').style('animation-delay', `${700 + i * 140}ms`);
        inner.append('circle').attr('r', 18).attr('class', 'poi-hit');
        inner.append('use').attr('href', '#star4').attr('x', -11).attr('y', -11).attr('width', 22).attr('height', 22);
        inner.append('text').attr('x', 15).attr('y', 5).text(p.name);
      });
      drawFrame();
    };
    // While the globe moves: no chalk filter (it re-renders the whole map every frame) and no invisible
    // tap areas; both come back once it stops. One redraw per frame at most.
    const out = document.createElement('button'); // back to the whole world, when zoomed in
    out.className = 'globe-out icon-btn'; out.dataset.act = 'globe-out'; out.setAttribute('aria-label', 'Torna al globo');
    // one button, two jobs: zoomed in it goes back to the world, at world level it zooms in on the chosen country
    $('.globe-wrap').append(out);
    globe.feats = feats;
    const drawFrame = () => {
      proj.rotate(globe.rot).scale(globe.scale);
      const zoomed = globe.scale >= WORLD * 1.15;
      if (out.dataset.zoomed !== String(zoomed)) {
        out.dataset.zoomed = zoomed; out.dataset.act = zoomed ? 'globe-out' : 'globe-in';
        out.setAttribute('aria-label', zoomed ? 'Torna al globo' : 'Avvicinati al paese');
        out.innerHTML = `<i class="ph-light ph-${zoomed ? 'globe-hemisphere-west' : 'magnifying-glass-plus'}"></i>`;
      }
      const fade = Math.max(0, Math.min(1, (globe.scale / WORLD - 1.1) / .4)); // the places fade with the zoom: gone at world level
      poiG.attr('opacity', fade).style('pointer-events', fade < .5 ? 'none' : null);
      grat.attr('d', path); coast.attr('d', path); bord.attr('d', path);
      const cur = feats.find(f => f.properties.name === COUNTRIES[globe.idx].en);
      sel.datum(cur).attr('d', cur ? path : null);
      const center = [-globe.rot[0], -globe.rot[1]];
      const pois = poiG.selectAll('.poi'), xs = pois.data().map(p => proj(p.ll)[0]);
      const mid = (Math.min(...xs) + Math.max(...xs)) / 2; // names point away from the middle of the country's places
      pois.each(function (p) {
        const [x, y] = proj(p.ll);
        this.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
        const left = x < mid, t = this.querySelector('text');
        t.setAttribute('x', left ? -15 : 15); t.setAttribute('text-anchor', left ? 'end' : 'start');
        this.style.display = d3.geoDistance(p.ll, center) < Math.PI / 2 - .05 ? '' : 'none';
      });
      mk.each(function (p) {
        const vis = d3.geoDistance(p, center) < Math.PI / 2 - .05;
        const [x, y] = proj(p);
        this.setAttribute('x', x - 9); this.setAttribute('y', y - 10);
        this.style.display = vis ? '' : 'none';
      });
    };
    const settle = () => { drawFrame(); hits.attr('d', path); g.attr('filter', 'url(#chalk)'); };
    let raf = 0, idleT;
    const draw = () => {
      g.attr('filter', null);
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; drawFrame(); });
      clearTimeout(idleT); idleT = setTimeout(settle, 200);
    };
    globe.draw = draw;
    // zoom by hand: pinch with two fingers, or the mouse wheel / a trackpad pinch; from the whole world to 9x
    const setScale = s => { globe.anim?.stop(); globe.scale = Math.max(WORLD, Math.min(WORLD * 9, s)); draw(); };
    const gap = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    let pinch = null, pinched = false; // while two fingers pinch, the globe doesn't spin
    const el = svg.node();
    el.addEventListener('touchstart', e => { if (e.touches.length === 2) { pinch = { d: gap(e.touches) || 1, s: globe.scale }; pinched = true; globe.anim?.stop(); } }, { passive: true });
    el.addEventListener('touchmove', e => { if (pinch && e.touches.length === 2) { e.preventDefault(); setScale(pinch.s * gap(e.touches) / pinch.d); } }, { passive: false });
    el.addEventListener('touchend', e => { if (e.touches.length < 2) pinch = null; if (!e.touches.length) pinched = false; });
    el.addEventListener('wheel', e => { e.preventDefault(); setScale(globe.scale * Math.exp(-e.deltaY * (e.ctrlKey ? .01 : .0015))); }, { passive: false });
    // drag to spin; on release it keeps going and slows down (momentum)
    const spin = (dx, dy) => { globe.rot = [globe.rot[0] + dx, Math.max(-70, Math.min(70, globe.rot[1] + dy)), 0]; draw(); };
    let vel = [0, 0], lastT = 0; // degrees per ms
    svg.call(d3.drag().clickDistance(4)
      .on('start', () => { globe.anim?.stop(); vel = [0, 0]; lastT = performance.now(); })
      .on('drag', e => {
        if (pinched) return;
        const k = 100 / proj.scale(), dx = e.dx * k, dy = -e.dy * k, now = performance.now(), dt = Math.max(8, now - lastT);
        lastT = now;
        vel = [vel[0] * .4 + dx / dt * .6, vel[1] * .4 + dy / dt * .6]; // smoothed, so one jittery event doesn't fling it
        spin(dx, dy);
      })
      .on('end', () => {
        if (pinched || reduceMotion || performance.now() - lastT > 90) return; // the finger stopped before lifting: no fling
        const cap = v => Math.max(-1.2, Math.min(1.2, v));
        vel = vel.map(cap);
        let prev = 0;
        const t = globe.anim = d3.timer(el => {
          const dt = el - prev; prev = el;
          const f = Math.exp(-dt / 380); // friction: about 1s to glide to a stop
          vel = [vel[0] * f, vel[1] * f];
          spin(vel[0] * dt, vel[1] * dt);
          if (Math.hypot(...vel) < .003) t.stop();
        });
      }));
    settle();
    globe.ready = true;
    selectCountry(globe.idx); // zoom in on the country picked last time
    $('#globeMsg').textContent = '';
  } catch {
    $('#globeMsg').textContent = navigator.onLine ? 'Non riesco a caricare il globo' : 'Mappa non disponibile offline';
  } finally { globe.loading = false; }
}
// where to look for a country: centred on it, zoomed so the country and its places fill about half the globe
function zoomFor(c) {
  const to = [-c.c[0], -c.c[1], 0];
  const p = d3.geoOrthographic().scale(WORLD).translate([270, 270]).clipAngle(90).rotate(to);
  let f = globe.feats.find(x => x.properties.name === c.en);
  if (f?.geometry.type === 'MultiPolygon') // only the land near the country's centre: France without French Guiana, etc.
    f = { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: f.geometry.coordinates.filter(poly => d3.geoDistance(d3.geoCentroid({ type: 'Polygon', coordinates: poly }), c.c) < .3) } };
  let [[x0, y0], [x1, y1]] = f?.geometry.coordinates.length ? d3.geoPath(p).bounds(f) : [[270, 270], [270, 270]];
  (POIS[c.it] || []).forEach(q => { const [x, y] = p(q.ll); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
  return [to, WORLD * Math.max(1, Math.min(9, 290 / Math.max(x1 - x0, y1 - y0, 1)))];
}
// fly: rotate and zoom together, pulling back a little halfway so a long trip doesn't race across a zoomed map
function flyTo(to, scale) {
  if (reduceMotion) { globe.rot = to; globe.scale = scale; globe.draw(); return; }
  globe.anim?.stop();
  const rot = d3.interpolate(globe.rot, to), zoom = d3.interpolate(globe.scale, scale);
  const dip = Math.min(.6, d3.geoDistance([-globe.rot[0], -globe.rot[1]], [-to[0], -to[1]]) * .5);
  const t = globe.anim = d3.timer(el => {
    const k = Math.min(1, el / 1300), e = d3.easeCubicInOut(k);
    globe.rot = rot(e);
    globe.scale = Math.max(WORLD, zoom(e) * (1 - dip * Math.sin(Math.PI * k)));
    globe.draw();
    if (k === 1) t.stop();
  });
}
function zoomOut() { if (globe.ready) flyTo(globe.rot, WORLD); }
function zoomIn() { if (globe.ready) flyTo(...zoomFor(COUNTRIES[globe.idx])); }
// dir: the wheel's direction (1 = next, -1 = previous), for its little slide
function selectCountry(i, dir) {
  globe.idx = (i + COUNTRIES.length) % COUNTRIES.length;
  prefs.country = globe.idx; savePrefs();
  updateCountryUi();
  const wh = $('#countryWheel');
  wh.classList.remove('slide-l', 'slide-r'); void wh.offsetWidth;
  if (dir) wh.classList.add(dir > 0 ? 'slide-l' : 'slide-r');
  if (!globe.ready) return;
  globe.showPois();
  const sel = document.querySelector('#globe .sel'); // a red glow pulses around the new country, then stays soft
  if (sel) { sel.classList.toggle('pulse', false); void sel.getBoundingClientRect(); sel.classList.toggle('pulse', true); }
  const c = COUNTRIES[globe.idx];
  flyTo([-c.c[0], -c.c[1], 0], globe.scale); // turn to it, keeping the zoom: zooming in is by hand (pinch) or the button
}
// swipe the wheel to run through the countries: one step every 56px dragged
{
  const wh = $('#countryWheel');
  let x0 = null, dragged = false;
  wh.addEventListener('pointerdown', e => { x0 = e.clientX; dragged = false; });
  wh.addEventListener('pointermove', e => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    if (!dragged && Math.abs(dx) > 8) { dragged = true; try { wh.setPointerCapture(e.pointerId); } catch { /* gone */ } }
    if (Math.abs(dx) >= 56) { stepCountry(dx < 0 ? 1 : -1); x0 = e.clientX; }
  });
  const end = () => { x0 = null; };
  wh.addEventListener('pointerup', end); wh.addEventListener('pointercancel', end);
  wh.addEventListener('click', e => { if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; } }, true); // a swipe isn't a tap
}
