from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import json, math

OUT = Path(__file__).resolve().parent
ROOT = Path('/Users/macbook/Projects/fatman-site')
W = H = 1080
C = {
    'bg': '#f7f8fa', 'cream': '#fff7ed', 'white': '#ffffff', 'navy': '#0f172a',
    'slate': '#334155', 'muted': '#64748b', 'orange': '#ea580c', 'orange2': '#fb923c',
    'deep_orange': '#c2410c', 'border': '#e2e8f0', 'soft': '#f1f5f9', 'dark': '#07111f'
}
FB = '/System/Library/Fonts/Supplemental/Arial Black.ttf'
FBD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
FR = '/System/Library/Fonts/Supplemental/Arial.ttf'

def font(p, s): return ImageFont.truetype(p, s)
def rounded(d, box, r, fill, outline=None, width=1): d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)
def tsize(d, txt, f):
    b=d.textbbox((0,0),txt,font=f); return b[2]-b[0], b[3]-b[1]
def wrap(d, text, f, maxw):
    lines=[]; line=''
    for w in text.split():
        test=(line+' '+w).strip()
        if tsize(d,test,f)[0] <= maxw: line=test
        else:
            if line: lines.append(line)
            line=w
    if line: lines.append(line)
    return lines

def draw_fit(d, xy, text, fp, size, fill, maxw, maxh, spacing=8):
    for s in range(size, 15, -1):
        f=font(fp,s); lines=wrap(d,text,f,maxw)
        h=sum(tsize(d,l,f)[1] for l in lines)+spacing*(len(lines)-1)
        if h<=maxh: break
    x,y=xy
    for l in lines:
        d.text((x,y),l,font=f,fill=fill)
        y += tsize(d,l,f)[1]+spacing
    return y

def brand(d, x, y, scale=1.0, mode='dark'):
    # mode: dark = navy/orange on light, light = all white on orange/dark
    s=int(30*scale)
    f=font(FB,s)
    fat = 'white' if mode=='light' else C['navy']
    parts = 'white' if mode=='light' else C['orange']
    d.text((x,y),'FATMAN',font=f,fill=fat)
    d.text((x+int(160*scale),y),'PARTS',font=f,fill=parts)

def btn(d, box, text, fill=C['orange'], text_fill='white', size=28):
    rounded(d, box, 28, fill)
    d.text(((box[0]+box[2])//2,(box[1]+box[3])//2),text,font=font(FB,size),fill=text_fill,anchor='mm')

def diagonal_bg(light=True):
    im=Image.new('RGB',(W,H),C['bg'] if light else C['dark'])
    d=ImageDraw.Draw(im)
    if light:
        d.polygon([(0,0),(690,0),(560,1080),(0,1080)], fill=C['cream'])
        d.polygon([(660,0),(1080,0),(1080,1080),(780,1080)], fill=C['navy'])
    else:
        d.rectangle((0,0,W,H),fill=C['dark'])
        for y in range(-200,1300,110):
            d.line((0,y,1080,y-480),fill='#111827',width=34)
    return im,d

def product_card_stack(d, x, y):
    # Clean card stack instead of cartoon bumper art.
    labels=[('BUMPERS','READY TO MATCH'),('FENDERS','SHOP BY VEHICLE'),('LIGHTING','CHECK THE SETUP')]
    for i,(a,b) in enumerate(labels):
        yy=y+i*105
        rounded(d,(x,yy,x+360,yy+82),18,C['white'],C['border'],2)
        d.text((x+28,yy+18),a,font=font(FB,28),fill=C['navy'])
        d.text((x+28,yy+52),b,font=font(FBD,17),fill=C['muted'])
        d.text((x+323,yy+42),'→',font=font(FB,34),fill=C['orange'],anchor='mm')

def bumper_ad():
    im,d=diagonal_bg(True)
    brand(d,70,55,1.0)
    d.text((72,165),'BUMPER',font=font(FB,104),fill=C['navy'])
    d.text((72,282),'PARTS',font=font(FB,104),fill=C['orange'])
    d.text((72,400),'THAT FIT',font=font(FB,102),fill=C['navy'])
    d.text((72,520),'THE JOB',font=font(FB,92),fill=C['navy'])
    draw_fit(d,(78,650),'Match your vehicle. Pick your part. Get it moving.',FBD,34,C['slate'],520,85)
    btn(d,(75,850,455,925),'SHOP BUMPERS',size=28)
    product_card_stack(d,650,300)
    # Keep right-side text fully inside navy; no half-on/half-off diagonal contrast bug.
    rounded(d,(710,735,1010,830),24,C['orange'])
    d.text((860,782),'ORDER ONLINE',font=font(FB,30),fill='white',anchor='mm')
    return im

def wrong_part():
    im,d=diagonal_bg(False)
    rounded(d,(70,70,1010,1010),36,'#0f172a','#334155',3)
    brand(d,100,115,.9,mode='light')
    d.text((100,205),'WRONG',font=font(FB,128),fill='white')
    d.text((100,335),'PART.',font=font(FB,128),fill=C['orange'])
    d.text((100,505),'WRONG',font=font(FB,128),fill='white')
    d.text((100,635),'PAINT BILL.',font=font(FB,96),fill=C['orange'])
    d.line((100,765,980,765),fill=C['orange'],width=8)
    d.text((110,813),'FIT FIRST. PAINT SECOND.',font=font(FB,44),fill='white')
    btn(d,(110,900,520,970),'CHECK FATMAN',size=30)
    # Big clean warning symbol, positioned as background accent, not competing with copy.
    d.polygon([(835,160),(990,420),(680,420)], fill='#1f2937', outline=C['orange'])
    d.text((835,330),'!',font=font(FB,126),fill=C['orange'],anchor='mm')
    return im

def premium_brand():
    im=Image.new('RGB',(W,H),C['bg']); d=ImageDraw.Draw(im)
    rounded(d,(95,78,985,1002),52,C['white'],C['border'],2)
    brand(d,145,135,.95)
    d.text((145,245),'BODY PARTS',font=font(FB,78),fill=C['navy'])
    d.text((145,340),'WITHOUT THE',font=font(FB,68),fill=C['navy'])
    d.text((145,430),'JUNKYARD RUN',font=font(FB,68),fill=C['orange'])
    draw_fit(d,(150,560),'Search. Match. Order.',FBD,44,C['slate'],650,72)
    # No icons. Just premium process slabs.
    steps=[('01','SEARCH'),('02','MATCH'),('03','ORDER')]
    for i,(num,label) in enumerate(steps):
        x=145+i*265
        rounded(d,(x,690,x+220,805),26,C['cream'],C['border'],2)
        d.text((x+30,718),num,font=font(FB,30),fill=C['orange'])
        d.text((x+30,760),label,font=font(FB,28),fill=C['navy'])
    btn(d,(145,885,485,950),'SHOP FATMAN',size=28)
    d.text((555,907),'Replacement body parts, online.',font=font(FBD,26),fill=C['muted'])
    return im

def remove_white_bg(img):
    img=img.convert('RGBA')
    datas=img.getdata(); out=[]
    for r,g,b,a in datas:
        if r>245 and g>245 and b>245:
            out.append((255,255,255,0))
        else:
            out.append((r,g,b,a))
    img.putdata(out)
    return img

def headlight_spotlight():
    im=Image.new('RGB',(W,H),C['dark']); d=ImageDraw.Draw(im)
    d.rectangle((0,0,W,H),fill=C['dark'])
    d.polygon([(595,160),(1080,45),(1080,380),(595,440)],fill='#fff7ed')
    d.polygon([(595,455),(1080,405),(1080,690),(595,575)],fill=C['orange'])
    rounded(d,(70,95,610,770),44,'#0f172a','#334155',3)
    d.text((118,158),'LIGHTS',font=font(FB,104),fill='white')
    d.text((118,280),'THAT',font=font(FB,94),fill=C['orange'])
    d.text((118,392),'MATCH',font=font(FB,94),fill='white')
    d.text((118,505),'YOUR BUILD',font=font(FB,70),fill=C['orange'])
    draw_fit(d,(122,640),'Halogen. LED. Left. Right. Done right.',FBD,31,'#cbd5e1',430,72)
    # Real product image, not cartoon drawing.
    p=ROOT/'public/ai-product-images/white-bg/headlamp-representative-white.png'
    prod=remove_white_bg(Image.open(p))
    prod.thumbnail((360,360), Image.LANCZOS)
    shadow=Image.new('RGBA',(prod.width+70,prod.height+70),(0,0,0,0))
    sd=ImageDraw.Draw(shadow); sd.ellipse((35,prod.height-20,prod.width+35,prod.height+35),fill=(0,0,0,75))
    shadow=shadow.filter(ImageFilter.GaussianBlur(16))
    im.paste(shadow,(670,525),shadow)
    im.paste(prod,(700,505),prod)
    btn(d,(95,885,435,952),'SHOP LIGHTING',size=28)
    brand(d,655,900,.9,mode='light')
    return im

def direct_cta():
    im=Image.new('RGB',(W,H),C['white']); d=ImageDraw.Draw(im)
    d.rectangle((0,0,W,250),fill=C['orange'])
    brand(d,70,58,1.1,mode='light')
    d.text((70,155),'START YOUR SEARCH',font=font(FB,44),fill='white')
    d.text((70,330),'NEED',font=font(FB,132),fill=C['navy'])
    d.text((70,465),'BODY',font=font(FB,132),fill=C['orange'])
    d.text((70,600),'PARTS?',font=font(FB,132),fill=C['navy'])
    rounded(d,(620,340,995,555),34,'#f8fafc',C['border'],3)
    d.text((655,400),'Year',font=font(FBD,30),fill=C['muted'])
    d.text((655,462),'Make  Model',font=font(FBD,30),fill=C['muted'])
    d.line((640,520,940,520),fill=C['orange'],width=5)
    chips=[('BUMPERS',70,780),('FENDERS',260,780),('MIRRORS',450,780),('LIGHTS',640,780)]
    for chip,x,y in chips:
        tw=tsize(d,chip,font(FB,24))[0]+48
        rounded(d,(x,y,x+tw,y+58),29,C['cream'],C['orange'],3)
        d.text((x+tw/2,y+29),chip,font=font(FB,24),fill=C['navy'],anchor='mm')
    # Stronger CTA, no duplicate bottom filler text.
    btn(d,(70,905,590,985),'SEARCH FATMANPARTS.COM',size=27)
    return im

posts=[
 ('01-bold-bumper-ad.png',bumper_ad,'BUMPERS THAT FIT THE JOB','Need a replacement bumper? Start with your vehicle, match the details, and get the part moving with Fatman Parts.'),
 ('02-wrong-part-paint-bill.png',wrong_part,'WRONG PART. WRONG PAINT BILL.','The wrong part can burn time, paint, and labor. Check the details first and order with confidence.'),
 ('03-premium-brand-card.png',premium_brand,'BODY PARTS WITHOUT THE JUNKYARD RUN','Skip the yard run. Find replacement body parts online and get back to the repair.'),
 ('04-headlight-spotlight.png',headlight_spotlight,'LIGHTS THAT MATCH YOUR BUILD','Headlights are not one-size-fits-all. Match your setup and get the right look back on the road.'),
 ('05-direct-cta.png',direct_cta,'NEED BODY PARTS?','Replacement body parts made easier. Start with Fatman Parts and find what your repair needs.'),
]
meta=[]; imgs=[]
for file,fn,hook,caption in posts:
    img=fn(); path=OUT/file; img.save(path,quality=95)
    imgs.append(img); meta.append({'file':file,'hook':hook,'caption':caption,'path':str(path)})
cols=3; rows=2; gap=30
sheet=Image.new('RGB',(cols*W+(cols-1)*gap,rows*H+(rows-1)*gap),C['bg'])
for i,img in enumerate(imgs): sheet.paste(img,((i%cols)*(W+gap),(i//cols)*(H+gap)))
sheet_path=OUT/'contact-sheet.png'; sheet.save(sheet_path,quality=95)
with open(OUT/'captions.json','w') as f: json.dump(meta,f,indent=2)
print('output_dir='+str(OUT))
print('contact_sheet='+str(sheet_path))
for m in meta: print('post='+m['path'])
