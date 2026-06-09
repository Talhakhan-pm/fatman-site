from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import json

OUT = Path(__file__).resolve().parent
W = H = 1080
C = {
    'bg': '#f7f8fa', 'cream': '#fff7ed', 'white': '#ffffff', 'navy': '#0f172a',
    'slate': '#334155', 'muted': '#64748b', 'orange': '#ea580c', 'orange2': '#fb923c',
    'deep_orange': '#c2410c', 'border': '#e2e8f0', 'red': '#dc2626', 'amber': '#f59e0b'
}
FB = '/System/Library/Fonts/Supplemental/Arial Black.ttf'
FBD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
FR = '/System/Library/Fonts/Supplemental/Arial.ttf'

def font(p, s): return ImageFont.truetype(p, s)
def bbox(d, txt, f):
    b = d.textbbox((0,0), txt, font=f); return b[2]-b[0], b[3]-b[1]
def rounded(d, box, r, fill, outline=None, width=1): d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)
def wrap(d, text, f, maxw):
    lines=[]; line=''
    for w in text.split():
        t=(line+' '+w).strip()
        if bbox(d,t,f)[0] <= maxw: line=t
        else:
            if line: lines.append(line)
            line=w
    if line: lines.append(line)
    return lines

def draw_fit(d, xy, text, fp, size, fill, maxw, maxh, spacing=8):
    for s in range(size, 15, -1):
        f=font(fp,s); lines=wrap(d,text,f,maxw)
        h=sum(bbox(d,l,f)[1] for l in lines)+spacing*(len(lines)-1)
        if h <= maxh: break
    x,y=xy
    for l in lines:
        d.text((x,y),l,font=f,fill=fill)
        y += bbox(d,l,f)[1] + spacing
    return y

def logo(d, x, y, scale=1.0, light=False):
    # Draw as two words with intentional spacing; avoid the cramped FATMANPARTS bug.
    d.text((x,y),'FATMAN',font=font(FB,int(30*scale)),fill=C['white'] if light else C['navy'])
    d.text((x+int(152*scale),y),'PARTS',font=font(FB,int(30*scale)),fill=C['orange'])

def button(d, box, text, fill=C['orange'], text_fill='white'):
    rounded(d, box, 24, fill)
    d.text(((box[0]+box[2])//2,(box[1]+box[3])//2), text, font=font(FB,24), fill=text_fill, anchor='mm')

def bumper_ad():
    im=Image.new('RGB',(W,H),C['cream']); d=ImageDraw.Draw(im)
    # fresh composition: ecommerce hero/product-card style
    d.rectangle((0,0,W,118), fill=C['white'])
    logo(d,70,38,.95)
    button(d,(760,35,1010,88),'SHOP NOW')
    d.text((70,180),'BUMPER',font=font(FB,102),fill=C['navy'])
    d.text((70,295),'PARTS',font=font(FB,102),fill=C['orange'])
    d.text((70,410),'THAT FIT',font=font(FB,102),fill=C['navy'])
    d.text((70,525),'THE JOB',font=font(FB,92),fill=C['navy'])
    draw_fit(d,(76,655),'Match your vehicle. Pick your part. Get it moving.',FBD,34,C['slate'],500,86)
    # stylized bumper/product silhouette, kept clear of headline
    rounded(d,(635,250,1015,700),44,C['white'],C['border'],3)
    d.arc((665,355,960,580), 190, 350, fill=C['navy'], width=28)
    rounded(d,(690,465,940,560),42,'#f1f5f9',C['border'],3)
    d.rectangle((725,505,905,535), fill=C['orange'])
    for x in (700,910): d.ellipse((x-20,555,x+20,595),fill=C['navy'])
    rounded(d,(660,645,965,705),22,C['navy'])
    d.text((812,675),'REPLACEMENT BUMPERS',font=font(FB,20),fill='white',anchor='mm')
    button(d,(70,840,440,918),'FATMANPARTS.COM')
    d.text((610,825),'FAST PART SEARCH',font=font(FB,35),fill=C['navy'])
    d.text((610,875),'BUILT FOR REPAIR WORK',font=font(FB,28),fill=C['orange'])
    return im

def wrong_part():
    im=Image.new('RGB',(W,H),C['navy']); d=ImageDraw.Draw(im)
    # dramatic warning layout, totally different
    d.rectangle((0,0,W,H), fill=C['navy'])
    for i in range(-200,1200,95): d.line((i,0,i-520,1080),fill='#1f2937',width=26)
    rounded(d,(70,70,1010,1010),36,'#111827','#334155',3)
    d.text((100,120),'BODY SHOP WARNING',font=font(FB,28),fill=C['orange'])
    d.text((100,215),'WRONG',font=font(FB,125),fill='white')
    d.text((100,340),'PART.',font=font(FB,125),fill=C['orange'])
    d.text((100,505),'WRONG',font=font(FB,125),fill='white')
    d.text((100,630),'PAINT BILL.',font=font(FB,96),fill=C['orange'])
    d.line((100,760,980,760),fill=C['orange'],width=8)
    d.text((110,805),'FIT FIRST. PAINT SECOND.',font=font(FB,44),fill='white')
    button(d,(110,900,480,966),'CHECK FATMAN')
    logo(d,710,912,.9,light=True)
    # warning icon
    d.polygon([(835,145),(980,390),(690,390)], fill=C['orange'])
    d.text((835,300),'!',font=font(FB,130),fill=C['navy'],anchor='mm')
    return im

def premium_brand():
    im=Image.new('RGB',(W,H),C['bg']); d=ImageDraw.Draw(im)
    # Minimal premium card, cleaned: no missing glyph checkmarks, stronger grid, tighter whitespace.
    rounded(d,(110,92,970,988),48,C['white'],C['border'],2)
    logo(d,150,145,.95)
    d.text((150,250),'BODY PARTS',font=font(FB,76),fill=C['navy'])
    d.text((150,342),'WITHOUT THE',font=font(FB,68),fill=C['navy'])
    d.text((150,432),'JUNKYARD RUN',font=font(FB,68),fill=C['orange'])
    draw_fit(d,(154,560),'Search. Match. Order.',FBD,44,C['slate'],650,72)
    # Three premium process tiles; vector checkmarks are drawn with lines, not font glyphs.
    tiles=[(150,'SEARCH'),(405,'MATCH'),(660,'ORDER')]
    for x,label in tiles:
        rounded(d,(x,690,x+190,810),28,C['cream'],C['border'],2)
        d.ellipse((x+71,708,x+119,756),fill=C['white'],outline=C['orange'],width=4)
        d.line((x+83,734,x+94,746,x+110,719),fill=C['orange'],width=5)
        d.text((x+95,782),label,font=font(FB,23),fill=C['navy'],anchor='mm')
    button(d,(150,885,470,947),'SHOP FATMAN')
    d.text((555,906),'Replacement body parts, online.',font=font(FBD,26),fill=C['muted'])
    return im

def headlight_spotlight():
    im=Image.new('RGB',(W,H),C['navy']); d=ImageDraw.Draw(im)
    # Cleaner spotlight: beams live on the right, text has its own protected panel.
    d.rectangle((0,0,W,H), fill='#07111f')
    d.polygon([(610,210),(1080,90),(1080,330),(610,400)], fill='#fff7ed')
    d.polygon([(610,440),(1080,390),(1080,650),(610,560)], fill='#f97316')
    rounded(d,(80,110,610,760),42,'#0f172a','#334155',3)
    d.text((125,165),'LIGHTS',font=font(FB,100),fill='white')
    d.text((125,282),'THAT',font=font(FB,92),fill=C['orange'])
    d.text((125,392),'MATCH',font=font(FB,92),fill='white')
    d.text((125,500),'YOUR BUILD',font=font(FB,70),fill=C['orange'])
    draw_fit(d,(128,630),'Halogen. LED. Left. Right. Done right.',FBD,31,'#cbd5e1',420,72)
    # More intentional headlight/product block.
    rounded(d,(690,610,1000,800),70,C['white'],C['border'],3)
    rounded(d,(720,648,970,762),46,'#e2e8f0',C['navy'],4)
    d.ellipse((750,670,845,765),fill='#e0f2fe',outline=C['navy'],width=5)
    d.ellipse((872,680,948,756),fill='#fef3c7',outline=C['navy'],width=5)
    d.line((650,835,1015,835),fill=C['orange'],width=7)
    button(d,(95,885,400,950),'SHOP LIGHTING')
    logo(d,655,900,.9,light=True)
    return im

def direct_cta():
    im=Image.new('RGB',(W,H),C['white']); d=ImageDraw.Draw(im)
    # Direct-response poster. Removed giant cursor; fixed brand/header balance.
    d.rectangle((0,0,W,1080),fill=C['white'])
    d.rectangle((0,0,W,250),fill=C['orange'])
    # Header is on orange, so draw both words in white instead of hiding PARTS in orange.
    d.text((70,58),'FATMAN',font=font(FB,33),fill='white')
    d.text((250,58),'PARTS',font=font(FB,33),fill='white')
    d.text((70,155),'START YOUR SEARCH',font=font(FB,44),fill='white')
    d.text((70,330),'NEED',font=font(FB,132),fill=C['navy'])
    d.text((70,465),'BODY',font=font(FB,132),fill=C['orange'])
    d.text((70,600),'PARTS?',font=font(FB,132),fill=C['navy'])
    rounded(d,(620,335,995,535),34,'#f8fafc',C['border'],3)
    d.text((655,395),'Year',font=font(FBD,30),fill=C['muted'])
    d.text((655,455),'Make  Model',font=font(FBD,30),fill=C['muted'])
    d.line((640,505,940,505),fill=C['orange'],width=5)
    # category chips with safe spacing, no overlaps.
    chips=[('BUMPERS',70,780),('FENDERS',260,780),('MIRRORS',450,780),('LIGHTS',640,780)]
    for chip,x,y in chips:
        w=bbox(d,chip,font(FB,24))[0]+48
        rounded(d,(x,y,x+w,y+58),29,C['cream'],C['orange'],3)
        d.text((x+w/2,y+29),chip,font=font(FB,24),fill=C['navy'],anchor='mm')
    button(d,(70,920,520,985),'SEARCH FATMANPARTS.COM')
    d.text((620,925),'Bumpers. Fenders. Mirrors. Lights.',font=font(FBD,28),fill=C['slate'])
    return im

posts = [
    ('01-bold-bumper-ad.png', bumper_ad, 'BUMPERS THAT FIT THE JOB', 'Need a replacement bumper? Start with your vehicle, match the details, and get the part moving with Fatman Parts.'),
    ('02-wrong-part-paint-bill.png', wrong_part, 'WRONG PART. WRONG PAINT BILL.', 'The wrong part can burn time, paint, and labor. Check the details first and order with confidence.'),
    ('03-premium-brand-card.png', premium_brand, 'BODY PARTS WITHOUT THE JUNKYARD RUN', 'Skip the yard run. Find replacement body parts online and get back to the repair.'),
    ('04-headlight-spotlight.png', headlight_spotlight, 'LIGHTS THAT MATCH YOUR BUILD', 'Headlights are not one-size-fits-all. Match your setup and get the right look back on the road.'),
    ('05-direct-cta.png', direct_cta, 'NEED BODY PARTS?', 'Replacement body parts made easier. Start with Fatman Parts and find what your repair needs.'),
]

meta=[]; imgs=[]
for file, fn, hook, caption in posts:
    img=fn(); path=OUT/file; img.save(path,quality=95)
    imgs.append(img); meta.append({'file':file,'hook':hook,'caption':caption,'path':str(path)})

cols=3; rows=2; gap=30
sheet=Image.new('RGB',(cols*W+(cols-1)*gap, rows*H+(rows-1)*gap), C['bg'])
for i,img in enumerate(imgs): sheet.paste(img, ((i%cols)*(W+gap), (i//cols)*(H+gap)))
sheet_path=OUT/'contact-sheet.png'; sheet.save(sheet_path,quality=95)
with open(OUT/'captions.json','w') as f: json.dump(meta,f,indent=2)
print('output_dir='+str(OUT))
print('contact_sheet='+str(sheet_path))
for m in meta: print('post='+m['path'])
