/* NOVAE · Novae: the globe with the artists of each country.
   The js/*.js files are plain scripts that share one scope, loaded in order by index.html. */
'use strict';

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
        if (i > -1) selectCountry(i); else toast('Ancora nessun artista in questo paese');
      });
    const coast = g.append('path').attr('class', 'land').datum(land);
    const bord = g.append('path').attr('class', 'land').attr('stroke-opacity', .35).datum(borders);
    const sel = g.append('path').attr('class', 'sel');
    const r = rng(9);
    const markers = COUNTRIES.flatMap(c => artistsIn(c).map(() => [c.c[0] + (r() - .5) * 6, c.c[1] + (r() - .5) * 4]))
      .concat(Array.from({ length: 10 }, () => [r() * 360 - 180, r() * 120 - 50]));
    const mk = svg.append('g').selectAll('image').data(markers).join('image').attr('href', STAR_SRC).attr('class', 'mk').attr('width', 18).attr('height', 20);
    // While the globe moves: no chalk filter (it re-renders the whole map every frame) and no invisible
    // tap areas; both come back once it stops. One redraw per frame at most.
    const drawFrame = () => {
      proj.rotate(globe.rot);
      grat.attr('d', path); coast.attr('d', path); bord.attr('d', path);
      const cur = feats.find(f => f.properties.name === COUNTRIES[globe.idx].en);
      sel.datum(cur).attr('d', cur ? path : null);
      const center = [-globe.rot[0], -globe.rot[1]];
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
    // drag to spin; on release it keeps going and slows down (momentum)
    const spin = (dx, dy) => { globe.rot = [globe.rot[0] + dx, Math.max(-70, Math.min(70, globe.rot[1] + dy)), 0]; draw(); };
    let vel = [0, 0], lastT = 0; // degrees per ms
    svg.call(d3.drag().clickDistance(4)
      .on('start', () => { globe.anim?.stop(); vel = [0, 0]; lastT = performance.now(); })
      .on('drag', e => {
        const k = 100 / proj.scale(), dx = e.dx * k, dy = -e.dy * k, now = performance.now(), dt = Math.max(8, now - lastT);
        lastT = now;
        vel = [vel[0] * .4 + dx / dt * .6, vel[1] * .4 + dy / dt * .6]; // smoothed, so one jittery event doesn't fling it
        spin(dx, dy);
      })
      .on('end', () => {
        if (reduceMotion || performance.now() - lastT > 90) return; // the finger stopped before lifting: no fling
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
  globe.anim?.stop();
  const interp = d3.interpolate(globe.rot, to);
  const t = globe.anim = d3.timer(el => {
    const k = Math.min(1, el / 1100);
    globe.rot = interp(d3.easeCubicInOut(k));
    globe.draw();
    if (k === 1) t.stop();
  });
}
