# Turns category icons drawn as "<rect> + luminance <mask>" into one plain even-odd <path>.
# Masks inside an <img> SVG render badly on iPhone (WebKit), a plain path renders the same everywhere.
# Works because the mask shapes are nested (white ring, black hole, white glyph, black hole...),
# so even-odd parity gives the same result. Check the output by eye if an icon has overlapping shapes.
# Usage: python tools/flatten-icons.py assets/categorie/*.svg   (files without a mask are skipped)
import re, sys

def circle(cx, cy, r):
    cx, cy, r = float(cx), float(cy), float(r)
    return f'M{cx - r:g} {cy}a{r} {r} 0 1 0 {2 * r:g} 0a{r} {r} 0 1 0 {-2 * r:g} 0Z'

for f in sys.argv[1:]:
    svg = open(f, encoding='utf-8').read()
    mask = re.search(r'<mask[^>]*>(.*)</mask>', svg)
    if not mask:
        continue
    parts = []
    for tag, attrs in re.findall(r'<(path|circle)([^>]*)/>', mask.group(1)):
        a = dict(re.findall(r'([\w-]+)="([^"]*)"', attrs))
        parts.append(a['d'] if tag == 'path' else circle(a['cx'], a['cy'], a['r']))
    view = re.search(r'viewBox="([^"]*)"', svg).group(1)
    color = re.search(r'<rect[^>]*fill="([^"]*)"', svg).group(1)
    out = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" width="160" height="160">'
           f'<path fill="{color}" fill-rule="evenodd" d="{"".join(parts)}"/></svg>\n')
    open(f, 'w', encoding='utf-8', newline='\n').write(out)
    print('flattened', f)
