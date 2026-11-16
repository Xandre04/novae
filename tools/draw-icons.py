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
<g fill="none" stroke-width="3.2">
  <g id="h"><path d="M50 33Q36 23 21.5 30V70Q36 63 50 72"/></g>
  <use href="#h" {M}/>
  <path d="M50 33V72"/>
</g>
<path d="M56.5 29.5V51L59.5 47.5L62.5 51V28z" stroke="none"/>'''),

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
'fumetto': ('#deb440', '''
<path d="M33.6 56.3A22.2 16 0 1 1 42.5 60.8C38.5 61.5 35 68 26.5 69.8C30.5 65.5 33.5 61 33.6 56.3z" fill="none"/>
<path d="M40 41H56M39.5 45.8H61.5M40 50.6H56" fill="none" stroke-width="2"/>'''),

'danza': ('#d57aaa', '''
<g stroke="none">
  <path d="M29.8 25.5Q37 22 42 25.5L43.5 33Q37 28 29.5 29z"/>
  <path d="M27.5 33.5C24 37 21 41 21.8 44.5Q22.8 47.8 25.5 49C29 52 30.5 56 30.5 62V75.5Q30.5 79 34 79Q38.5 79 40 74C42.5 68 44 61 43.5 57C42 48 37 39 27.5 33.5z"/>
  <path d="M55.8 25.5Q62 29.5 69.5 23.5L68.5 28.5Q62 32.5 56.5 29.5z"/>
  <path fill-rule="evenodd" d="M58 40C55 50 55 62 57.5 74Q59 79.5 64.5 79.5Q70 79.5 71.5 74C74.5 62 74.5 50 71 40zM64.5 41C60 47 59 58 60 62.5Q61 67 64.5 67Q68 67 69 62.5C70 58 69 47 64.5 41z"/>
</g>
<path d="M57.5 32.5L71 40.5M71 32.5L57.5 40.5" fill="none" stroke-width="2.6" stroke-linecap="butt"/>'''),

'street-art': ('#d04c38', '''
<rect x="47" y="15.5" width="6" height="5" rx="1" stroke="none"/>
<rect x="49" y="20" width="2" height="6" stroke="none"/>
<path d="M38.5 38.5C38.5 30 43.5 27 50 27C56.5 27 61.5 30 61.5 38.5M40.5 41.5C42 52 41.5 66 38.5 79M59.5 41.5C58 52 58.5 66 61.5 79" fill="none"/>
<rect x="37" y="38" width="26" height="3.6" rx="1.8" stroke="none"/>
<rect x="37.5" y="77.5" width="25" height="4.5" rx="1" stroke="none"/>'''),

'artigianato': ('#85633f', f'''
<rect x="38.5" y="20" width="23" height="4.5" rx="1.2" stroke="none"/>
<path d="M30.5 49.5H69.5L70 59.5H30z" stroke="none"/>
<g fill="none" stroke-width="2.3">
  <path d="M42 24.5C42 30 38 36 34 43.5H66C62 36 58 30 58 24.5"/>
  <path d="M32.5 46H67.5M30.5 62.5H69.5"/>
  <path d="M32.5 46C29.5 52 29 60 31 64Q33 70.5 40 71H60Q67 70.5 69 64C71 60 70.5 52 67.5 46"/>
  <g id="h"><path d="M39 24.5C35 24.5 34.5 27 34.5 30L32 41.5C31.5 44 29 45 28 43.5C27 42 28.5 40.5 29.5 41.5M39 25C41.5 25.5 41.5 29 39.8 29.2C38.6 29.3 38.6 27.8 39.6 27.8" stroke-width="1.8"/></g>
  <use href="#h" {M}/>
</g>'''),
}

for name, (col, body) in ICONS.items():
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" fill="{col}" stroke="{col}" '
           f'stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">{RING}{body.strip()}</svg>\n')
    open(f'assets/categorie/{name}.svg', 'w', encoding='utf-8').write(svg)
    print(name, len(svg), 'bytes')
