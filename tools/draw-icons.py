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
'letteratura': ('#437a54', '''
<path fill="none" stroke-width="2.6" d="M27.5 32.5H33M67 32.5H72.5M27.5 32.5V67.5H44.5Q50 74 55.5 67.5H72.5V32.5"/><path fill="none" stroke-width="2.4" d="M31 35V66C37 62 46 62 50 66V35C46 30.5 36 30.5 31 35ZM69 35V66C63 62 54 62 50 66V35C54 30.5 64 30.5 69 35Z"/><path stroke="none" d="M54.8 32.5H58.2V46L56.5 44.2L54.8 46Z"/><path fill="none" stroke-width="2.3" d="M34.5 38.5Q41 35.5 46.8 37.5M34.5 43Q41 40 46.8 42M34.5 52Q41 49 46.8 51M34.5 56.5Q41 53.5 46.8 55.5M34.5 61Q41 58 46.8 60M53.2 37.2Q53.6 37 54 37M60 36.8Q63 37.3 66 38.6M53.2 46Q53.6 45.8 54 45.8M60 45.8Q63.2 46.4 66.2 47.8M53.2 51Q59.5 49.5 66.2 52.2M53.2 55.5Q59.5 54 66.2 56.7M53.2 60Q59.5 58.5 66.2 61.2"/>'''),

'fotografia': ('#3b9ab4', '''
<path fill="none" stroke-width="2.9" d="M28.5 34.5H38.5Q40 34.5 40.6 33L41.4 30.5Q42 29 43.5 29H56.5Q58 29 58.6 30.5L59.4 33Q60 34.5 61.5 34.5H71.5Q74.5 34.5 74.5 37.5V63.5Q74.5 66.5 71.5 66.5H28.5Q25.5 66.5 25.5 63.5V37.5Q25.5 34.5 28.5 34.5ZM34.5 34.5V66.5"/><rect x="29" y="30" width="6" height="4.5" rx="1" stroke="none"/><rect x="65" y="30.2" width="5.5" height="4.3" rx=".8" fill="none" stroke-width="2.2"/><circle cx="41.2" cy="39" r="1.9" stroke="none"/><circle cx="50" cy="51" r="8.2" fill="none" stroke-width="4.4"/><circle cx="50" cy="51" r="2.8" stroke="none"/>'''),

'arti-digitali-e-tecnologiche': ('#4c7cd4', '''
<rect x="31.5" y="31.5" width="37" height="37" rx="1.5" fill="none" stroke-width="3"/><rect x="36.5" y="36.5" width="27" height="27" rx="1" fill="none" stroke-width="2"/><rect x="42.5" y="42.5" width="15" height="15" rx="1" stroke="none"/><path fill="none" stroke-width="2.6" d="M40 31.5V26.5M54 31.5V20.5M61.5 31.5V26.5M68.5 45H74.5M68.5 55H74.5M68.5 65H80M40 68.5V74.5M50 68.5V80M62 68.5V74.5M31.5 35H20M31.5 45H26.5M31.5 55H26.5"/><g stroke="none"><circle cx="54" cy="19.5" r="3"/><circle cx="81" cy="65" r="3"/><circle cx="50" cy="81" r="3"/><circle cx="19" cy="35" r="3"/></g>'''),

'installazione-e-arti-ambientali': ('#84a259', '''
<path stroke="none" d="M47 52H50.5V67C50.5 74 54 79 59.5 82.5Q60.5 83.5 59 84H47.5Q46 83.5 46.5 82C48 76 48 68 47 62L40.5 56L42.5 54.5L47.5 59Z"/><path fill="none" stroke-width="2.6" d="M33 63.5C27 65 20.5 61 20 54.5C19.5 49 23.5 46 25.5 45.5C21 43 20.5 35.5 24 31.5C27.5 28 31 28 32 28.5C32.5 23 38 20.5 43 22C47.5 23.5 49.5 26 50 28C53 23.5 60 22.5 65 26.5C69.5 29.5 70.5 33.5 70 35.5C74.5 37 77 42 75 47C73.5 51 71.5 53 69.5 54C70.5 57.5 66 61.5 61.5 60C60.5 63.5 54 64.5 51 61"/><path fill="none" stroke-width="2.5" d="M31 52.5Q36 57.5 42.5 57.5M46 49.5Q50 53 54 49.5M51.5 48Q56.5 44.5 58 40"/><path fill="none" stroke-width="2.7" d="M23.5 39L63.5 26.5M32.5 24.5L75.5 43.5V65.5M32.5 24.5L68.5 59.5V74M29 59.5V76"/>'''),

'animazione': ('#b775d3', '''
<circle cx="40" cy="73" r="9.5" fill="none" stroke-width="3.2"/><path fill="none" stroke-width="2.6" d="M5.5 47C19 32 39 20 62 20.5C79 21 86 31.5 85.5 43.5C85 52 78.5 58 71 61.5"/><path stroke="none" d="M18 42C30 29.5 46 24 61 24C76.5 24 81.5 33 81 43.5C80.5 55.5 67.5 65 49 71.2L48 67.8C64.5 61.8 76.5 53.5 77 43.5C77.5 35 72.5 28 60.5 28C46.5 28 31.5 33 20 44.5Q18.2 44.5 18 42Z"/><path fill="none" stroke-width="2.5" d="M64 30.5C71.5 32.5 74.5 37.5 73.5 43.5C72.5 51 62 57.5 50.5 61"/>'''),

'teatro-e-performance': ('#833f6a', '''
<path fill-rule="evenodd" stroke="none" d="M20 42Q41 32 62.5 41C63.5 58 55.5 72 41.2 83.5C27 72 19.5 58 20 42ZM26.5 47.5Q31 44.5 35.8 45.8Q37.5 43.8 35.5 42.5Q31 41.5 25.5 45.2Q24.5 46.8 26.5 47.5ZM56 47.5Q51.5 44.5 46.7 45.8Q45 43.8 47 42.5Q51.5 41.5 57 45.2Q58 46.8 56 47.5ZM29 50.5Q33.5 48 38 50.8Q38.5 52.5 36.2 52.5H33.5Q34.5 54.8 35.8 55.5Q34.5 57 33 55.5Q30.8 53.5 31.2 51.8Q28.5 51.8 29 50.5ZM53.5 50.5Q49 48 44.5 50.8Q44 52.5 46.3 52.5H49Q48 54.8 46.7 55.5Q48 57 49.5 55.5Q51.7 53.5 51.3 51.8Q54 51.8 53.5 50.5ZM37 59.5Q35 61 36.5 62.5Q41.2 64.5 46 62.5Q47.5 61 45.5 59.5Q44 61 41.2 61.5Q38.5 61 37 59.5ZM31 62.5Q29 64 30.5 66Q32 65 32.5 63.5ZM51.5 62.5Q53.5 64 52 66Q50.5 65 50 63.5ZM33 65.8Q41.2 69 49.5 65.8Q48.5 72 41.2 72Q34 72 33 65.8Z"/><path fill="none" stroke-width="2.2" d="M19.5 41C16.5 34.5 13 36.5 14 43C15.5 52 17 59 13 65L15.5 67.5C19.5 60 18.5 51 16.5 41.5M41.5 38L41 30.5Q62 21 83 30.5C83.5 46 76 59.5 62.5 69.5Q57.5 66 54 62"/><path stroke="none" d="M49.5 34.5Q54.5 33 57.5 29.5Q59.5 31 57.5 33.5Q54 36 49.5 36.5ZM76 34.5Q71 33 68 29.5Q66 31 68 33.5Q71.5 36 76 36.5ZM51 39.5Q54.5 36 59 38.5Q58 41.5 51 39.5ZM65.5 38.5Q70 35.5 74.5 39.5Q70 42 65.5 38.5ZM58.5 54Q64 50.5 68.5 55Q67 59 62 56.5Q59 57 58.5 54ZM82.5 31.5C85 39 87 48 85 59.5H82C83.5 49 82 40 80.5 33Z"/><path fill="none" stroke-width="2" d="M62 47.5Q64.5 48.5 65.5 46.5M68.5 51Q70.5 52 71.5 54.5"/>'''),
}

for name, (col, body) in ICONS.items():
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160" fill="{col}" stroke="{col}" '
           f'stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">{RING}{body.strip()}</svg>\n')
    open(f'assets/categorie/{name}.svg', 'w', encoding='utf-8').write(svg)
    print(name, len(svg), 'bytes')
