# Trace NOVAE's hand-drawn icons into SVGs with vtracer.
# Needs Python 3.13 (vtracer crashes on 3.14):  py -3.13 -m pip install vtracer pillow
# Run from the repo root:  py -3.13 tools/trace-icons.py [name ...]   (no names = all)
# Each colour is a binary mask, traced on its own and stacked; black in the drawings becomes see-through.
import io, os, re, statistics
import vtracer
from PIL import Image, ImageChops, ImageFilter

INK, RED = '#ecebe6', '#960125'
TARGET = 640  # trace at about this many pixels on the long side
os.makedirs('assets/svg', exist_ok=True)

def trace(mask, scale):
    """mask: L image, 255 = ink, already at trace size. Returns <path> elements filled with {fill}."""
    m = mask.filter(ImageFilter.GaussianBlur(scale * .6)).point(lambda v: 0 if v > 127 else 255)  # vtracer traces the dark pixels
    buf = io.BytesIO(); m.convert('RGB').save(buf, 'PNG')
    svg = vtracer.convert_raw_image_to_svg(buf.getvalue(), img_format='png', colormode='binary', mode='spline',
                                          filter_speckle=int(4 * scale), corner_threshold=60, length_threshold=4.0,
                                          splice_threshold=45, path_precision=1)
    out = ''
    for tag in re.findall(r'<path [^>]*/>', svg):
        d = re.search(r' d="([^"]+)"', tag)[1]; t = re.search(r'transform="([^"]+)"', tag)
        out += f'<path fill="{{fill}}" d="{d}"' + (f' transform="{t[1]}"' if t else '') + '/>'
    return out

def write(name, im_size, layers):
    """layers: [(colour, L mask at original size)]; the SVG keeps the original size as width/height."""
    s = TARGET / max(im_size); w, h = round(im_size[0] * s), round(im_size[1] * s)
    body = ''.join(trace(m.resize((w, h), Image.LANCZOS), s).replace('{fill}', col) for col, m in layers)
    out = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{im_size[0]}" height="{im_size[1]}">{body}</svg>'
    open(name, 'w', encoding='utf-8').write(out)
    print(f'{name}: {len(out) // 1024} KB')

def window(f, fx, fy, sz, ar=1):
    im = Image.open(f).convert('RGB'); W = im.width; w = sz * W; h = w * ar
    return im.crop((round(fx * W - w / 2), round(fy * im.height - h / 2), round(fx * W + w / 2), round(fy * im.height + h / 2)))

def flat(f, bg=(0, 0, 0)):
    im = Image.open(f)
    if im.mode == 'RGBA':
        b = Image.new('RGBA', im.size, bg + (255,)); b.alpha_composite(im); im = b
    return im.convert('RGB')

def white(im): return im.convert('L').point(lambda v: 255 if v > 110 else 0)
def red(im):
    r, g, _ = im.split(); return ImageChops.subtract(r, g).point(lambda v: 255 if v > 50 else 0)
def brightwhite(im):
    r, g, b = im.split(); return ImageChops.darker(ImageChops.darker(r, g), b).point(lambda v: 255 if v > 150 else 0)

if __name__ == '__main__':
    import sys
    only = sys.argv[1:]
    def want(n): return not only or n in only
    for name, args in {
        'impostazioni': ('assets/icone/impostazioni.jpg', .480, .494, .085),
        'messaggi': ('assets/icone/messaggi.jpg', .502, .4975, .13),
        'profilo': ('assets/icone/profilo.jpg', .5159, .4860, .10),
        'wordmark': ('assets/icone/logo.jpg', .4956, .5938, .169, .26),
    }.items():
        if want(name): im = window(*args); write(f'assets/svg/{name}.svg', im.size, [(INK, white(im))])
    for name in ('galleria', 'scopri', 'profilo-avatar'):
        if want(name): im = flat(f'assets/icone/{name}.png'); write(f'assets/svg/{name}.svg', im.size, [(INK, white(im))])
    if want('stella'): im = flat('assets/icone/stella.png'); write('assets/svg/stella.svg', im.size, [(RED, red(im))])
    if want('stile'):
        im = window('assets/icone/stile.jpg', .517, .442, .205)
        write('assets/svg/stile.svg', im.size, [('#a0092e', red(im)), ('#ffffff', brightwhite(im))])
    if want('mercato'):
        im = window('assets/icone/mercato.jpg', .489, .495, .10)
        write('assets/svg/mercato.svg', im.size, [(INK, brightwhite(im)), (RED, red(im))])
    INK_OVERRIDE = {'cinema-e-video': '#5f86cf'}  # the drawing's navy (#2d4676) is too dark on the #141414 background
    CATS = {
     'pittura-e-illustrazione': 'Pittura.png', 'musica': 'Opera_senza_titolo_2.jpg', 'letteratura': 'Opera_senza_titolo_1.jpg',
     'cinema-e-video': 'Cinema.png', 'fotografia': 'Opera_senza_titolo.jpg', 'design': 'Opera_senza_titolo_5.jpg',
     'architettura': 'Opera_senza_titolo_4.jpg', 'moda': 'Opera_senza_titolo_3.jpg', 'scultura': 'Opera_senza_titolo7.jpg',
    }
    for slug, f in CATS.items():
        if not want(slug): continue
        im = flat('assets/icone/' + f, (255, 255, 255)); im.thumbnail((1400, 1400), Image.LANCZOS)
        px = list(im.getdata()); c = tuple(int(statistics.median(ch)) for ch in zip(*[p for p in px if min(p) < 150]))
        k = max(range(3), key=lambda i: 255 - c[i])
        ink = INK_OVERRIDE.get(slug, '#%02x%02x%02x' % c)
        a = im.getchannel('RGB'[k]).point(lambda v: max(0, min(255, round((255 - v) * 255 / (255 - c[k])))))
        b = a.point(lambda v: 255 if v > 60 else 0).getbbox(); pad = round((b[2] - b[0]) * .04)
        s = max(b[2] - b[0], b[3] - b[1]) + 2 * pad; cx, cy = (b[0] + b[2]) // 2, (b[1] + b[3]) // 2
        a = a.crop((cx - s // 2, cy - s // 2, cx + s // 2, cy + s // 2))
        write(f'assets/categorie/{slug}.svg', (160, 160), [(ink, a.point(lambda v: 255 if v > 110 else 0))])
