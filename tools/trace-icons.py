# Trace NOVAE's hand-drawn icons into SVGs with vtracer.
# Needs Python 3.13 (vtracer crashes on 3.14):  py -3.13 -m pip install vtracer pillow
# Run from the repo root:  py -3.13 tools/trace-icons.py [name ...]   (no names = all)
# Each colour is a binary mask, traced on its own and stacked; black in the drawings becomes see-through.
import io, math, os, re, statistics
from collections import deque
import vtracer
from PIL import Image, ImageDraw, ImageFilter

INK = '#ecebe6'
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

def fit_circle(pts):
    """Algebraic Kasa circle fit -> (cx, cy, radius)."""
    n = len(pts)
    mx = sum(x for x, _ in pts) / n; my = sum(y for _, y in pts) / n
    suu = suv = svv = suuu = svvv = suvv = svuu = 0.0
    for x, y in pts:
        u, v = x - mx, y - my
        suu += u * u; suv += u * v; svv += v * v
        suuu += u * u * u; svvv += v * v * v; suvv += u * v * v; svuu += v * u * u
    det = 2 * (suu * svv - suv * suv)
    uc = (svv * (suuu + suvv) - suv * (svvv + svuu)) / det
    vc = (suu * (svvv + svuu) - suv * (suuu + suvv)) / det
    cx, cy = mx + uc, my + vc
    return cx, cy, sum(math.hypot(x - cx, y - cy) for x, y in pts) / n

def strip_hand_ring(alpha):
    """Fit the outer hand-drawn ring, normalize onto a TARGET x TARGET mask without the ring,
    so every category icon gets a mathematically perfect geometric SVG <circle> ring."""
    R_OUT = 295.0   # outer edge of the clean SVG ring (r=286, stroke-width=18 -> 277..295)
    R_IN = 277.0    # inner edge of the clean SVG ring
    R_CLIP = 287.0  # clip connected strokes at the ring centerline (8px inside outer edge 295)
    m = alpha.point(lambda v: 255 if v > 110 else 0)
    b = m.getbbox()
    pad = 12
    x0, y0, x1, y1 = max(0, b[0] - pad), max(0, b[1] - pad), min(alpha.width, b[2] + pad), min(alpha.height, b[3] + pad)
    mc = m.crop((x0, y0, x1, y1))
    ac = alpha.crop((x0, y0, x1, y1))
    W, H = mc.size; pix = mc.load()
    cx0, cy0, rmax = W / 2, H / 2, max(W, H) / 2
    pts = []
    for deg in range(360):
        ang = math.radians(deg); dx, dy = math.cos(ang), math.sin(ang)
        for r in range(int(rmax), int(rmax * 0.6), -1):
            x, y = int(round(cx0 + dx * r)), int(round(cy0 + dy * r))
            if 0 <= x < W and 0 <= y < H and pix[x, y] > 0:
                pts.append((x, y)); break
    cx, cy, ro = fit_circle(pts)
    pts2 = [p for p in pts if abs(math.hypot(p[0] - cx, p[1] - cy) - ro) < 3.5]
    cx, cy, ro = fit_circle(pts2 or pts)

    # BFS from the outer ring perimeter: if it doesn't reach deep inside, it's a pure floating ring
    vis = set(); q = deque()
    for x, y in (pts2 or pts):
        if (x, y) not in vis: vis.add((x, y)); q.append((x, y))
    min_r = ro
    while q:
        x, y = q.popleft()
        d = math.hypot(x - cx, y - cy)
        if d < min_r: min_r = d
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in vis and pix[nx, ny] > 0:
                vis.add((nx, ny)); q.append((nx, ny))

    if min_r > ro * 0.78:
        # Case A (floating inner artwork): erase the entire outer-ring component cleanly (dilate 1px on soft halo)
        ap = ac.load()
        for x, y in vis:
            ap[x, y] = 0
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < W and 0 <= ny < H and math.hypot(nx - cx, ny - cy) > min_r - 3:
                    ap[nx, ny] = 0
        scale = R_OUT / ro
    else:
        # Case B (inner lines connect into the ring): align the hand-drawn ring's inner edge to R_IN
        rins = []
        for deg in range(360):
            ang = math.radians(deg); dx, dy = math.cos(ang), math.sin(ang)
            hit = None
            for r in range(int(round(ro + 3)), int(ro * 0.75), -1):
                x, y = int(round(cx + dx * r)), int(round(cy + dy * r))
                if 0 <= x < W and 0 <= y < H and pix[x, y] > 0:
                    hit = r; break
            if hit is None: continue
            for r in range(hit, int(ro * 0.75), -1):
                x, y = int(round(cx + dx * r)), int(round(cy + dy * r))
                if pix[x, y] == 0:
                    if hit - r < 45: rins.append(r + 1)
                    break
        r_in_med = statistics.median(rins) if rins else ro * 0.935
        scale = (R_IN + 7.5) / r_in_med  # bury any +/-5px hand-drawn ring thickness wobble inside the 277..295 geometric ring

    # Center (cx, cy) onto (TARGET/2, TARGET/2) at uniform scale
    half = (TARGET / 2) / scale
    box = (cx - half, cy - half, cx + half, cy + half)
    norm = ac.transform((TARGET, TARGET), Image.Transform.EXTENT, box, resample=Image.BICUBIC)
    # Clip cleanly inside the geometric ring band so connected bars embed seamlessly with zero outer protrusion
    disk = Image.new('L', (TARGET, TARGET), 0)
    c0, c1 = TARGET / 2 - R_CLIP, TARGET / 2 + R_CLIP
    ImageDraw.Draw(disk).ellipse((c0, c0, c1, c1), fill=255)
    norm = Image.composite(norm, Image.new('L', (TARGET, TARGET), 0), disk)
    return norm.filter(ImageFilter.GaussianBlur(.7)).point(lambda v: 0 if v > 118 else 255)

if __name__ == '__main__':
    import sys
    only = sys.argv[1:]
    def want(n): return not only or n in only
    for name, args in {
        'impostazioni': ('assets/icone/sezioni/impostazioni.jpg', .480, .494, .085),
        'messaggi': ('assets/icone/sezioni/messaggi.jpg', .502, .4975, .13),
        'profilo': ('assets/icone/sezioni/profilo.jpg', .5159, .4860, .10),
    }.items():
        if want(name): im = window(*args); write(f'assets/svg/{name}.svg', im.size, [(INK, white(im))])
    for name in ('galleria', 'scopri', 'profilo-avatar'):
        if want(name): im = flat(f'assets/icone/sezioni/{name}.png'); write(f'assets/svg/{name}.svg', im.size, [(INK, white(im))])
    # stella.svg, wordmark.svg, stile.svg and mercato.svg are redrawn by hand with clean lines (the clean star is
    # also inside stile and mercato): they are edited as SVG now, not traced again from assets/icone/sezioni.
    # categories traced from the drawings in assets/icone/categorie/
    os.makedirs('assets/categorie', exist_ok=True)
    INK_OVERRIDE = {'cinema-e-video': '#5f86cf'}  # the drawing's navy (#2b4574) is too dark on the #141414 background
    CATS = {
        'pittura-e-illustrazione': 'pittura.jpg',
        'musica': 'musica.jpg',
        'letteratura': 'letteratura.jpg',
        'cinema-e-video': 'Video.jpg',
        'fotografia': 'fotografia.jpg',
        'design': 'design.jpg',
        'architettura': 'architettura.jpg',
        'moda': 'moda.jpg',
        'scultura': 'scultura.jpg',
        'fumetto': 'fumettojpg.jpg',
        'animazione': 'animazione.jpg',
        'teatro-e-performance': 'teatro e performance.jpg',
        'danza': 'danza.jpg',
        'street-art': 'street-art.webp',
        'artigianato': 'artigianato.jpg',
        'installazione-e-arti-ambientali': 'arti ambientali.jpg',
        'arti-digitali-e-tecnologiche': 'arti-digitali-e-tecnologiche.jpg',
        'videogiochi-e-arti-interattive': 'videogiochi e arte interattiva.jpg',
        'arti-culinarie': 'cucina.jpg',
        'body-art': 'body art.jpg',
        'arte-memetica': 'arte-memetica.webp',
    }
    if 'categorie' in only:
        only = list(CATS)
    for slug, f in CATS.items():
        if not want(slug): continue
        im = flat('assets/icone/categorie/' + f, (255, 255, 255))
        sample = im.copy(); sample.thumbnail((512, 512), Image.LANCZOS)
        px = list(sample.get_flattened_data() if hasattr(sample, 'get_flattened_data') else sample.getdata())
        c = tuple(int(statistics.median(ch)) for ch in zip(*[p for p in px if min(p) < 150]))
        k = max(range(3), key=lambda i: 255 - c[i])
        ink = INK_OVERRIDE.get(slug, '#%02x%02x%02x' % c)
        a = im.getchannel('RGB'[k]).point(lambda v: max(0, min(255, round((255 - v) * 255 / (255 - c[k])))))
        m = strip_hand_ring(a)
        ring = f'<circle cx="320" cy="320" r="286" fill="none" stroke="{ink}" stroke-width="18"/>'
        parts = [ring]
        if slug == 'fumetto':
            # Replace the hand-drawn speech bubble (largest connected component) with a clean geometric oval + tail,
            # while keeping the original hand-drawn "! ?" glyphs intact inside.
            pix = m.load(); vis = set(); best = []
            for y in range(TARGET):
                for x in range(TARGET):
                    if pix[x, y] == 0 and (x, y) not in vis:
                        q = deque([(x, y)]); vis.add((x, y)); comp = []
                        while q:
                            cx, cy = q.popleft(); comp.append((cx, cy))
                            for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                                if 0 <= nx < TARGET and 0 <= ny < TARGET and pix[nx, ny] == 0 and (nx, ny) not in vis:
                                    vis.add((nx, ny)); q.append((nx, ny))
                        if len(comp) > len(best): best = comp
            for x, y in best: pix[x, y] = 255
            parts.append(f'<path d="M244 414.3A238 108 0 1 1 310 419.9L244 488Z" fill="none" stroke="{ink}" stroke-width="16" stroke-linejoin="round"/>')
        buf = io.BytesIO(); m.convert('RGB').save(buf, 'PNG')
        raw_svg = vtracer.convert_raw_image_to_svg(buf.getvalue(), img_format='png', colormode='binary', mode='spline',
                                                   filter_speckle=4, corner_threshold=45, length_threshold=3.5,
                                                   splice_threshold=20, path_precision=2)
        for tag in re.findall(r'<path [^>]*/>', raw_svg):
            d = re.search(r' d="([^"]+)"', tag)[1]; t = re.search(r'transform="([^"]+)"', tag)
            parts.append(f'<path fill="{ink}" d="{d}"' + (f' transform="{t[1]}"' if t else '') + '/>')
        body = ''.join(parts)
        out = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {TARGET} {TARGET}" width="160" height="160">{body}</svg>\n'
        open(f'assets/categorie/{slug}.svg', 'w', encoding='utf-8', newline='\n').write(out)
        print(f'assets/categorie/{slug}.svg: {len(out) // 1024} KB ({ink})')
