from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, re

OUT = Path(__file__).resolve().parent
W = H = 1080
SHEET_GAP = 40

C = {
    'bg': '#f7f8fa',
    'cream': '#fff7ed',
    'white': '#ffffff',
    'navy': '#0f172a',
    'slate': '#334155',
    'muted': '#64748b',
    'orange': '#ea580c',
    'orange2': '#fb923c',
    'border': '#e2e8f0',
    'green': '#16a34a',
    'red': '#dc2626',
}

FONT_BLACK = '/System/Library/Fonts/Supplemental/Arial Black.ttf'
FONT_BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
FONT_REG = '/System/Library/Fonts/Supplemental/Arial.ttf'

def f(path, size):
    return ImageFont.truetype(path, size)

def text_w(draw, text, font):
    b = draw.textbbox((0, 0), text, font=font)
    return b[2] - b[0]

def text_h(draw, text, font):
    b = draw.textbbox((0, 0), text, font=font)
    return b[3] - b[1]

def wrap_lines(draw, text, font, max_width):
    words = text.split()
    lines = []
    line = ''
    for word in words:
        test = (line + ' ' + word).strip()
        if text_w(draw, test, font) <= max_width:
            line = test
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines

def fit_font(draw, text, font_path, max_width, max_height, start, min_size=16, spacing=8):
    for size in range(start, min_size - 1, -1):
        font = f(font_path, size)
        lines = wrap_lines(draw, text, font, max_width)
        h = sum(text_h(draw, ln, font) for ln in lines) + spacing * max(0, len(lines)-1)
        if h <= max_height and all(text_w(draw, ln, font) <= max_width for ln in lines):
            return font, lines, spacing
    font = f(font_path, min_size)
    return font, wrap_lines(draw, text, font, max_width), max(3, spacing // 2)

def draw_wrapped(draw, xy, text, font_path, size, fill, max_width, max_height=None, spacing=8, anchor=None):
    if max_height:
        font, lines, spacing = fit_font(draw, text, font_path, max_width, max_height, size, spacing=spacing)
    else:
        font = f(font_path, size)
        lines = wrap_lines(draw, text, font, max_width)
    x, y = xy
    total_h = sum(text_h(draw, ln, font) for ln in lines) + spacing * max(0, len(lines)-1)
    if anchor == 'center':
        y -= total_h / 2
    for ln in lines:
        draw.text((x, y), ln, font=font, fill=fill)
        y += text_h(draw, ln, font) + spacing
    return y

def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def logo(draw, x, y, scale=1.0, dark=False):
    draw.text((x, y), 'FATMAN', font=f(FONT_BLACK, int(31*scale)), fill=C['white'] if dark else C['navy'])
    draw.text((x + int(132*scale), y), 'PARTS', font=f(FONT_BLACK, int(31*scale)), fill=C['orange'])

def base_canvas():
    im = Image.new('RGB', (W, H), C['bg'])
    draw = ImageDraw.Draw(im)
    draw.polygon([(0,0), (650,0), (765,1080), (0,1080)], fill=C['cream'])
    draw.polygon([(620,0), (1080,0), (1080,1080), (740,1080)], fill=C['navy'])
    for y in [100, 250, 400, 550, 700, 850, 1000]:
        draw.line((55, y, 1025, y), fill='#eadfd4' if y < 620 else '#1f2b44', width=1)
    return im, draw

def pill(draw, text, x=82, y=80, w=330):
    rounded(draw, (x, y, x+w, y+44), 22, C['orange'])
    draw.text((x+w/2, y+22), text, font=f(FONT_BOLD, 18), fill='white', anchor='mm')

def checklist_row(draw, y, num, text, max_text=355):
    rounded(draw, (90, y, 635, y+84), 14, C['white'], C['border'], 2)
    rounded(draw, (112, y+20, 168, y+76), 12, C['orange'])
    draw.text((140, y+48), num, font=f(FONT_BLACK, 22), fill='white', anchor='mm')
    draw_wrapped(draw, (190, y+26), text, FONT_BLACK, 24, C['navy'], max_text, max_height=42, spacing=3)
    draw.ellipse((590, y+27, 622, y+59), fill='#ecfdf5', outline=C['green'], width=2)
    draw.line((598, y+43, 605, y+51, 616, y+35), fill=C['green'], width=4)

def right_box(draw, title, main, sub, cta):
    rx = 755
    draw.text((rx, 140), 'FATMAN PARTS', font=f(FONT_BLACK, 23), fill=C['orange'])
    draw_wrapped(draw, (rx, 210), title, FONT_BLACK, 37, 'white', max_width=260, max_height=105, spacing=6)
    rounded(draw, (735, 365, 1035, 592), 24, C['white'], C['orange2'], 3)
    draw.text((760, 406), 'THE MOVE', font=f(FONT_BLACK, 18), fill=C['orange'])
    draw_wrapped(draw, (760, 458), main, FONT_BLACK, 34, C['navy'], max_width=240, max_height=72, spacing=4)
    draw_wrapped(draw, (760, 545), sub, FONT_BOLD, 20, C['slate'], max_width=240, max_height=36, spacing=3)
    draw.arc((700, 660, 1120, 1090), 210, 30, fill=C['orange'], width=7)
    draw.arc((750, 705, 1065, 1025), 210, 30, fill=C['border'], width=3)
    draw.text((785, 760), 'SHOP', font=f(FONT_BLACK, 42), fill='white')
    draw_wrapped(draw, (785, 815), cta, FONT_BLACK, 24, C['orange'], max_width=240, max_height=60, spacing=3)

def post_bumper():
    im, d = base_canvas()
    pill(d, 'BUYER CHECKLIST')
    d.text((88, 165), 'BEFORE', font=f(FONT_BLACK, 86), fill=C['navy'])
    d.text((88, 260), 'YOU BUY', font=f(FONT_BLACK, 86), fill=C['navy'])
    d.text((88, 355), 'A BUMPER.', font=f(FONT_BLACK, 86), fill=C['orange'])
    draw_wrapped(d, (90, 465), 'Three checks that reduce paint, return, and install headaches.', FONT_BOLD, 30, C['slate'], max_width=455, max_height=82)
    checklist_row(d, 615, '01', 'Year / make / model / trim')
    checklist_row(d, 714, '02', 'Sensor + fog light cutouts')
    checklist_row(d, 813, '03', 'Shipping + paint-prep notes')
    right_box(d, 'ORDER WITH LESS GUESSING', 'Check before paint.', 'Solve fitment questions first.', 'FATMANPARTS.COM')
    logo(d, 80, 1000, .9)
    return im

def post_fenders():
    im, d = base_canvas()
    pill(d, 'SHOP TIP')
    d.text((88, 165), 'FENDERS', font=f(FONT_BLACK, 84), fill=C['navy'])
    d.text((88, 260), 'NEED', font=f(FONT_BLACK, 88), fill=C['navy'])
    d.text((88, 355), 'DETAILS.', font=f(FONT_BLACK, 88), fill=C['orange'])
    draw_wrapped(d, (90, 465), 'A cheap panel gets expensive when the lines do not match.', FONT_BOLD, 31, C['slate'], max_width=455, max_height=82)
    checklist_row(d, 615, '01', 'Match trim + body style')
    checklist_row(d, 714, '02', 'Check side marker holes')
    checklist_row(d, 813, '03', 'Confirm paint-prep notes')
    right_box(d, 'FIT FIRST PAINT SECOND', 'Ask before prep.', 'Better questions now. Fewer surprises later.', 'CHECK FENDERS')
    logo(d, 80, 1000, .9)
    return im

def post_headlights():
    im, d = base_canvas()
    pill(d, 'PART MATCH')
    d.text((88, 165), 'HEADLIGHT', font=f(FONT_BLACK, 76), fill=C['navy'])
    d.text((88, 260), 'MATCHES', font=f(FONT_BLACK, 82), fill=C['navy'])
    d.text((88, 355), 'MATTER.', font=f(FONT_BLACK, 90), fill=C['orange'])
    draw_wrapped(d, (90, 465), 'One body style can have multiple lamp setups. Check before checkout.', FONT_BOLD, 30, C['slate'], max_width=455, max_height=86)
    checklist_row(d, 615, '01', 'Halogen or LED setup')
    checklist_row(d, 714, '02', 'Left / right side')
    checklist_row(d, 813, '03', 'Connector + trim notes')
    right_box(d, 'LESS WRONG-PART RISK', 'Match the setup.', 'Small details save big delays.', 'SHOP LIGHTING')
    logo(d, 80, 1000, .9)
    return im

posts = [
    {
        'file': '01-bumper-checklist.png',
        'bucket': 'buyer checklist',
        'hook': 'BEFORE YOU BUY A BUMPER.',
        'caption_default': 'Buying a replacement bumper? Check trim, sensor/fog-light cutouts, and shipping/paint-prep notes before ordering. Fewer surprises after the box shows up.',
        'caption_x': 'Buying a bumper? Check trim, sensor/fog cutouts, and shipping/paint-prep notes before ordering. Fewer surprises after the box shows up.',
        'cta': 'Shop FatmanParts.com',
        'hashtags': ['#FatmanParts', '#BodyShop', '#DIYRepair', '#AutoBodyRepair'],
        'renderer': post_bumper,
    },
    {
        'file': '02-fender-details.png',
        'bucket': 'problem-solution',
        'hook': 'FENDERS NEED DETAILS.',
        'caption_default': 'A cheap fender gets expensive when body lines, marker holes, or prep notes are wrong. Match the details before paint work starts.',
        'caption_x': 'A cheap fender gets expensive when body lines or marker holes are wrong. Match the details before paint work starts.',
        'cta': 'Check Fenders',
        'hashtags': ['#FatmanParts', '#CollisionRepair', '#AutoParts', '#CarRebuild'],
        'renderer': post_fenders,
    },
    {
        'file': '03-headlight-matches.png',
        'bucket': 'informational',
        'hook': 'HEADLIGHT MATCHES MATTER.',
        'caption_default': 'One vehicle can have multiple headlight setups. Check halogen vs LED, side, connectors, and trim notes before checkout.',
        'caption_x': 'One vehicle can have multiple headlight setups. Check halogen vs LED, side, connectors, and trim notes before checkout.',
        'cta': 'Shop Lighting',
        'hashtags': ['#FatmanParts', '#TruckParts', '#AutoBody', '#DIYRepair'],
        'renderer': post_headlights,
    },
]

rendered = []
for post in posts:
    img = post['renderer']()
    path = OUT / post['file']
    img.save(path, quality=95)
    clean = {k: v for k, v in post.items() if k != 'renderer'}
    clean['path'] = str(path)
    rendered.append(clean)

sheet = Image.new('RGB', (W * len(rendered) + SHEET_GAP * (len(rendered)-1), H), C['bg'])
for i, post in enumerate(rendered):
    sheet.paste(Image.open(post['path']).convert('RGB'), (i * (W + SHEET_GAP), 0))
sheet_path = OUT / 'contact-sheet.png'
sheet.save(sheet_path, quality=95)

with open(OUT / 'captions.json', 'w') as fp:
    json.dump(rendered, fp, indent=2)

forbidden = ['CHARM', 'staging', 'importer', 'seed', 'scrape', 'guarantee', 'same-day', 'VIN-match', 'no returns', 'exact-fit', 'bolts on']
text = json.dumps(rendered)
hits = [w for w in forbidden if re.search(w, text, re.I)]
print('output_dir=' + str(OUT))
print('contact_sheet=' + str(sheet_path))
for post in rendered:
    print('post=' + post['path'])
print('forbidden_hits=' + json.dumps(hits))
if hits:
    raise SystemExit(2)
