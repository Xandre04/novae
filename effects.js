/* NOVAE visual effects (progressive enhancement: if WebGL or the CDN fail, the SVG star stays).
   - Liquid Logo: Paper Shaders "liquid metal" applied to the NOVAE star
   - Shader gradient: Paper Shaders "mesh gradient" as a slow crimson nebula behind hub and gate */
import {
  ShaderMount,
  liquidMetalFragmentShader,
  toProcessedLiquidMetal,
  meshGradientFragmentShader,
  getShaderColorFromString,
  defaultObjectSizing,
  ShaderFitOptions,
} from 'https://cdn.jsdelivr.net/npm/@paper-design/shaders@0.0.81/+esm';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const STAR = 'M0-50C3-14 8-8 44 0 8 8 3 14 0 50-3 14-8 8-44 0-8-8-3-14 0-50Z';

const sizing = (over = {}) => {
  const s = { ...defaultObjectSizing, ...over };
  return {
    u_fit: ShaderFitOptions[s.fit], u_scale: s.scale, u_rotation: s.rotation,
    u_offsetX: s.offsetX, u_offsetY: s.offsetY, u_originX: s.originX, u_originY: s.originY,
    u_worldWidth: s.worldWidth, u_worldHeight: s.worldHeight,
  };
};
const loadImage = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

// The star as a black-on-transparent PNG: the mask the liquid metal shader flows inside
function starPng() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const x = c.getContext('2d');
  x.translate(256, 256);
  x.scale(4.7, 5);
  x.fill(new Path2D(STAR));
  return c.toDataURL('image/png');
}

let starImage;
const mounted = {}; // one shader per slot; re-rendered hosts get the same canvas moved in
async function liquidStar(slot, host, speed = .55) {
  if (!host || host.dataset.fx) return;
  if (mounted[slot]) { host.appendChild(mounted[slot]); host.dataset.fx = 'on'; return; }
  host.dataset.fx = 'loading';
  starImage ??= toProcessedLiquidMetal(starPng()).then(r => loadImage(URL.createObjectURL(r.pngBlob)));
  const image = await starImage;
  const el = document.createElement('div');
  el.className = 'fx-liquid';
  mounted[slot] = el;
  host.appendChild(el);
  new ShaderMount(el, liquidMetalFragmentShader, {
    u_image: image,
    u_isImage: true,
    u_shape: 0,
    u_colorBack: getShaderColorFromString('rgba(0,0,0,0)'),
    u_colorTint: getShaderColorFromString('#d61c40'),
    u_softness: .12,
    u_repetition: 2.2,
    u_shiftRed: .3,
    u_shiftBlue: .3,
    u_distortion: .08,
    u_contour: .45,
    u_angle: 70,
    ...sizing({ scale: 1 }),
  }, { premultipliedAlpha: true, alpha: true }, reduce ? 0 : speed);
  host.dataset.fx = 'on';
}

let nebulaMounted = false;
function nebula() {
  if (nebulaMounted) return;
  nebulaMounted = true;
  const el = document.getElementById('nebula');
  new ShaderMount(el, meshGradientFragmentShader, {
    u_colors: ['#020202', '#3b0714', '#070708', '#6e0c22', '#020202', '#1c0409'].map(getShaderColorFromString),
    u_colorsCount: 6,
    u_distortion: .85,
    u_swirl: .35,
    u_grainMixer: 0,
    u_grainOverlay: 0,
    ...sizing({ fit: 'cover' }),
  }, undefined, reduce ? 0 : .12);
  el.classList.add('on');
}

function wrapGateStar() {
  const svg = document.querySelector('.gate-star');
  if (!svg || svg.parentElement.classList.contains('fx-host')) return svg?.parentElement;
  const host = document.createElement('div');
  host.className = 'fx-host gate-star-host';
  svg.replaceWith(host);
  host.appendChild(svg);
  return host;
}

function onScreen(name) {
  try {
    if (name === 'hub' || name === 'invito') nebula();
    if (name === 'hub') liquidStar('hub', document.querySelector('.hub-core'));
    if (name === 'invito') liquidStar('gate', wrapGateStar(), .7);
  } catch (err) {
    console.warn('NOVAE effects disabled:', err);
  }
}

document.addEventListener('novae:screen', e => onScreen(e.detail));
onScreen(document.body.dataset.screen); // the app may have routed before this module loaded
