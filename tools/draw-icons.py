# NOVAE category icons, redrawn by hand as clean SVG (perfect ring, straight lines, mirrored halves).
# Proportions measured on the drawings (ring outer edge = 4..96 of a 100 grid). Run from the repo root.
RING = '<circle cx="50" cy="50" r="44.75" fill="none" stroke-width="2.5"/>'
M = 'transform="matrix(-1 0 0 1 100 0)"'  # mirror across x = 50

ICONS = {
'architettura': ('#6c767f', f'''
<defs><mask id="a"><rect width="100" height="100" fill="#fff"/><path d="M42.5 80V45.5a7.5 7.5 0 0 1 15 0V80z" fill="#000" stroke="none"/></mask></defs>
<path d="M25.5 35a24.5 18.5 0 0 1 49 0" fill="none"/>
<rect x="22.5" y="34" width="55" height="8.5" rx="1.2" stroke="none" mask="url(#a)"/>
<path d="M41.25 72V45.5a8.75 8.75 0 0 1 17.5 0V72" fill="none"/>
<g id="h">
  <path d="M12.2 26H28.6M6.6 39H22.5M12.9 75H22.5M26.25 42.5V72M36.75 42.5V72" fill="none"/>
  <rect x="22.5" y="71.5" width="20" height="8" rx="1.2" stroke="none"/>
  <rect x="12.75" y="40.75" width="6.5" height="5.5" rx=".6" fill="none" stroke-width="2"/>
  <rect x="14.25" y="46" width="3.5" height="21" stroke="none"/>
  <rect x="12.75" y="67" width="6.5" height="6" rx=".6" fill="none" stroke-width="2"/>
</g>
<use href="#h" {M}/>'''),

'letteratura': ('#437a54', f'''
<g fill="none">
  <rect x="21.25" y="22.5" width="57.5" height="51.25" rx="1"/>
  <rect x="26.75" y="32" width="46.5" height="37" rx=".8"/>
  <path d="M38.25 73.75V93M61.75 73.75V93M50 36.5V66.5"/>
  <g id="h">
    <path d="M50 36.5Q41 27.5 32 35V65.5Q41 59 50 66.5"/>
    <path d="M29.75 34.5V68.25" stroke-width="1.3"/>
    <path d="M29.75 68.25Q40 62.5 46.5 67.25L50 70" stroke-width="2"/>
  </g>
  <use href="#h" {M}/>
</g>
<path d="M54.5 33V47.5L56 45.5L57.5 47.5V33z" stroke="none"/>'''),

'musica': ('#7656b6', '''
<path d="M17.5 44L75.5 28.4M14.5 63L87 43.4M23.5 78L85.5 61.3" fill="none" stroke-width="2.3"/>
<path d="M25.4 60V35.8L32.8 33.8M54.2 70V47.2M75.2 65V41.5" fill="none" stroke-width="2.3"/>
<path d="M53.05 45.7L76.35 39.4V43.2L53.05 49.5z" stroke="none"/>
<g stroke="none">
  <ellipse cx="21.6" cy="60.4" rx="4.3" ry="3.5" transform="rotate(-20 21.6 60.4)"/>
  <ellipse cx="50.4" cy="70.4" rx="4.3" ry="3.5" transform="rotate(-20 50.4 70.4)"/>
  <ellipse cx="71.4" cy="65.4" rx="4.3" ry="3.5" transform="rotate(-20 71.4 65.4)"/>
</g>'''),

'moda': ('#d36497', '''
<defs><g id="m">
  <circle cx="0" cy="25.5" r="4.75" fill="none" stroke-width="3.4"/>
  <path d="M-3 29.6H3L6.5 36H-6.5z" stroke="none"/>
  <path fill-rule="evenodd" stroke="none" d="M-6 35.5H6C9.5 35.5 12.5 37.5 12.8 41V46.5C12.8 48 11.8 49 10.3 49H5.8L5.3 52.5H-5.3L-5.8 49H-10.3C-11.8 49-12.8 48-12.8 46.5V41C-12.5 37.5-9.5 35.5-6 35.5zM-6 39.5H6L4.2 49.5H-4.2z"/>
  <rect x="-1.4" y="52" width="2.8" height="30" stroke="none"/>
  <path d="M-8.5 79.5L8.5 84.5M-8.5 84.5L8.5 79.5" fill="none" stroke-width="2.6"/>
</g></defs>
<use href="#m" transform="translate(50 0)"/>
<use href="#m" transform="translate(26.5 9.2) scale(.66)"/>
<use href="#m" transform="translate(73.5 9.2) scale(.66)"/>'''),

'design': ('#c69f31', '''
<path d="M37 22.2H63L70.5 49.2H29.5z" fill="none"/>
<path d="M40 49.2V67.5" fill="none" stroke-width="2"/>
<path d="M42 50a8 7.5 0 0 0 16 0z" stroke="none"/>
<rect x="48.6" y="57" width="2.8" height="6" stroke="none"/>
<path d="M45.5 63.6H54.5L57.5 79.8H42.5z" fill="none"/>
<path d="M12.9 75H43.4M56.6 75H87.1" fill="none" stroke-width="2"/>'''),

'fotografia': ('#3b9ab4', f'''
<rect x="36" y="11.5" width="28" height="8.3" rx="3" stroke="none"/>
<g fill="none">
  <path d="M27.75 35H37.5Q39 35 39.8 33.6L41.2 31.2Q42 30 43.4 30H56.6Q58 30 58.8 31.2L60.2 33.6Q61 35 62.5 35H72.25Q74.75 35 74.75 37.5V64Q74.75 66.5 72.25 66.5H27.75Q25.25 66.5 25.25 64V37.5Q25.25 35 27.75 35z"/>
  <path d="M41 19.8C41 23 43.8 22.8 43.8 25.5V30M33.75 35V66.5M41 66.5L42.5 75.5H57.5L59 66.5M46.25 75.5V82.75H53.75V75.5"/>
  <path d="M59 19.8C59 23 56.2 22.8 56.2 25.5V30"/>
  <rect x="64.75" y="30.25" width="6" height="3.25" rx=".6" stroke-width="1.8"/>
  <circle cx="50" cy="51" r="8" stroke-width="5"/>
</g>
<rect x="28.5" y="29.5" width="6" height="5.5" rx="1.2" stroke="none"/>
<rect x="47.5" y="82.5" width="5" height="11.5" stroke="none"/>
<circle cx="40.5" cy="38.5" r="1.7" stroke="none"/>
<circle cx="50" cy="51" r="3" stroke="none"/>'''),
}

for name, (col, body) in ICONS.items():
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" fill="{col}" stroke="{col}" '
           f'stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">{RING}{body.strip()}</svg>\n')
    open(f'assets/categorie/{name}.svg', 'w', encoding='utf-8').write(svg)
    print(name, len(svg), 'bytes')
