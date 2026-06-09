import json
import os
import subprocess
import sys
import time
from pathlib import Path
from PIL import Image

FILES = [
"/Users/macbook/Downloads/file_00000000f2cc71fa88291049cb60e41c (1).png",
"/Users/macbook/Downloads/file_000000002ab472078b7c18dfa56c6c16.png",
"/Users/macbook/Downloads/file_000000008fd871faa80cf72510c805c6.png",
"/Users/macbook/Downloads/file_00000000811871faa9cffb6825891a7d.png",
"/Users/macbook/Downloads/file_00000000221c7207845363bd551c9364.png",
"/Users/macbook/Downloads/file_00000000217072079e1bf35e0ab940a9.png",
"/Users/macbook/Downloads/file_000000000c4872079749fa77b1081f0b.png",
"/Users/macbook/Downloads/file_00000000167471fa967933b44326c5b3.png",
"/Users/macbook/Downloads/file_00000000aa2471fabb6c79c564ab3638.png",
"/Users/macbook/Downloads/file_0000000083647206a4ba6d9ab9f7c7c4.png",
"/Users/macbook/Downloads/file_000000002bd072078ea0a3560408ceed.png",
"/Users/macbook/Downloads/file_0000000018a471faa0f355acbae6d5c4.png",
"/Users/macbook/Downloads/file_00000000893471faafae010d5dba65a9.png",
"/Users/macbook/Downloads/file_000000004acc7206b35f012b87cef8cf.png",
"/Users/macbook/Downloads/file_00000000162472099c8ca61f9d2b934a.png",
"/Users/macbook/Downloads/file_000000005c6c72078b7190c0fead5d03.png",
"/Users/macbook/Downloads/file_00000000ab487207851a13ce59a872eb.png",
"/Users/macbook/Downloads/file_000000005f9071fa8bb12f761bddaee3.png",
"/Users/macbook/Downloads/file_000000003b1072079acf1ce7948c6eb2.png",
"/Users/macbook/Downloads/file_00000000a8d071fa8ea846e32291d781.png",
"/Users/macbook/Downloads/file_0000000070f871faa0118d4aaef4361e.png",
"/Users/macbook/Downloads/file_00000000056472079136bb251bc90189.png",
"/Users/macbook/Downloads/file_000000006c3071fa863157d53054ffa0.png",
"/Users/macbook/Downloads/file_000000000e1871fa855fac14afefb100.png",
"/Users/macbook/Downloads/file_000000001bd071fa823d9a76a940f6f2.png",
"/Users/macbook/Downloads/file_0000000073b471faa5cf8c17aa93054a.png",
"/Users/macbook/Downloads/file_000000009f2071faafa6d0c2eea80774.png",
"/Users/macbook/Downloads/file_00000000c04c7207b69fa448dcd51520.png",
"/Users/macbook/Downloads/file_00000000712471fa9a02a8295b140bc8.png",
"/Users/macbook/Downloads/file_000000005e7871fab166be1c8f65255c.png",
"/Users/macbook/Downloads/file_00000000ccec71fa87d5f1862de42d7b.png",
"/Users/macbook/Downloads/file_00000000380c7207a36d937a0ce674f7.png",
]

CAPTIONS = [
"Fresh parts dump. OEM or aftermarket, we’re not picky — your repair just needs to stop looking dramatic.\n\nShop FatmanParts.com\n\n#fatmanparts #autoparts #oemparts #aftermarketparts #carparts #truckparts #bodyparts #replacementparts #collisionrepair #autobody #bodyshop #mechaniclife #diyrepair #carrepair #truckrepair #projectcar #rebuildlife #partsdepartment #shoplife #getitmoving",
"More parts. Less parking-lot detective work. OEM and aftermarket options for the repairs that refuse to wait.\n\nShop FatmanParts.com\n\n#fatmanparts #autoparts #oemparts #aftermarketparts #replacementparts #bodyparts #carparts #truckparts #collisionrepair #autobodyrepair #bodyshop #mechaniclife #repairshop #diymechanic #carrepair #truckrepair #projectcar #shoplife #partsdepartment #getitmoving",
"If your car had a shopping cart, this would be in it. OEM + aftermarket parts, ready for the next repair mission.\n\nShop FatmanParts.com\n\n#fatmanparts #autoparts #oemparts #aftermarketparts #carparts #truckparts #replacementparts #bodyparts #autobody #collisionrepair #bodyshop #mechaniclife #repairlife #diyrepair #carrepair #truckrepair #projectcar #rebuildlife #partsdepartment #getitmoving",
"The parts shelf called. It said stop guessing. OEM and aftermarket options are waiting.\n\nShop FatmanParts.com\n\n#fatmanparts #autoparts #oemparts #aftermarketparts #replacementparts #carparts #truckparts #bodyparts #collisionrepair #autobody #bodyshop #repairshop #mechaniclife #diyrepair #carrepair #truckrepair #projectcar #shoplife #partsdepartment #getitmoving",
]

ENV = Path('/Users/macbook/.hermes/.env')
OUTDIR = Path('/Users/macbook/Projects/fatman-site/docs/social-mockups/download-album-posts')
OUTDIR.mkdir(parents=True, exist_ok=True)


def get_key():
    key = os.environ.get('OMNISOCIALS_API_KEY')
    if key:
        return key
    if ENV.exists():
        for line in ENV.read_text().splitlines():
            if line.startswith('OMNISOCIALS_API_KEY='):
                return line.split('=', 1)[1].strip().strip('"').strip("'")
    return None


def curl_json(args):
    res = subprocess.run(args, capture_output=True, text=True)
    if res.returncode != 0:
        return {'ok': False, 'returncode': res.returncode, 'stderr': res.stderr[:1000], 'stdout': res.stdout[:1000]}
    try:
        return {'ok': True, 'json': json.loads(res.stdout)}
    except Exception:
        return {'ok': False, 'raw': res.stdout[:2000], 'stderr': res.stderr[:1000]}


def normalize_image(src, idx):
    src = Path(src)
    im = Image.open(src).convert('RGB')
    # Preserve original aspect, but make Instagram-safe high-quality JPEG.
    # If images are already square/portrait this avoids forced crop.
    max_side = 1440
    if max(im.size) > max_side:
        im.thumbnail((max_side, max_side), Image.LANCZOS)
    out = OUTDIR / f'{idx:02d}-{src.stem}.jpg'
    im.save(out, 'JPEG', quality=95, subsampling=0, optimize=True)
    return out, im.size


def main():
    key = get_key()
    if not key:
        print(json.dumps({'ok': False, 'error': 'missing OMNISOCIALS_API_KEY'})); return 0
    missing = [p for p in FILES if not Path(p).exists()]
    if missing:
        print(json.dumps({'ok': False, 'error': 'missing_files', 'missing': missing}, indent=2)); return 0

    auth = 'Authorization: Bearer ' + key
    acct_res = curl_json(['curl','-sS','https://api.omnisocials.com/v1/accounts','-H',auth])
    if not acct_res['ok']:
        print(json.dumps({'ok': False, 'step': 'accounts', 'result': acct_res}, indent=2)); return 0
    raw = acct_res['json'].get('data', acct_res['json'].get('accounts', []))
    accounts = [a for a in raw if a.get('platform') in ('instagram','facebook') and a.get('status') == 'active' and not a.get('needs_reconnect')]
    ids = [a['id'] for a in accounts]
    if not ids:
        print(json.dumps({'ok': False, 'error': 'no_active_instagram_facebook_accounts', 'accounts': raw}, indent=2)); return 0

    normalized = []
    for i, p in enumerate(FILES, 1):
        out, size = normalize_image(p, i)
        normalized.append({'src': p, 'path': str(out), 'size': size})

    uploads = []
    for item in normalized:
        up = curl_json(['curl','-sS','-X','POST','https://api.omnisocials.com/v1/media/upload','-H',auth,'-F',f"file=@{item['path']}"])
        if not up['ok']:
            print(json.dumps({'ok': False, 'step': 'upload', 'file': item['path'], 'result': up}, indent=2)); return 0
        obj = up['json'].get('data', up['json'].get('media', up['json']))
        mid = obj.get('id') if isinstance(obj, dict) else None
        if not mid:
            print(json.dumps({'ok': False, 'step': 'upload_parse', 'file': item['path'], 'response': up['json']}, indent=2)); return 0
        uploads.append({**item, 'media_id': mid})
        time.sleep(0.2)

    # Instagram carousel cap = 10. Use 4 albums of 8 to keep it clean and balanced.
    chunks = [uploads[i:i+8] for i in range(0, len(uploads), 8)]
    posts = []
    for i, chunk in enumerate(chunks, 1):
        caption = CAPTIONS[i-1]
        payload = {
            'type': 'post',
            'content': {'default': caption, 'instagram': caption, 'facebook': caption},
            'accounts': ids,
            'media_ids': [x['media_id'] for x in chunk],
        }
        cr = curl_json(['curl','-sS','-X','POST','https://api.omnisocials.com/v1/posts/create','-H',auth,'-H','Content-Type: application/json','-d',json.dumps(payload)])
        if not cr['ok']:
            print(json.dumps({'ok': False, 'step': 'create_post', 'album': i, 'result': cr}, indent=2)); return 0
        obj = cr['json'].get('data', cr['json'].get('post', cr['json']))
        posts.append({
            'album': i,
            'post_id': obj.get('id') if isinstance(obj, dict) else None,
            'status': obj.get('status') if isinstance(obj, dict) else None,
            'media_count': len(chunk),
            'media_ids': [x['media_id'] for x in chunk],
            'caption_chars': len(caption),
        })

    summary = {
        'ok': True,
        'mode': 'drafts_created',
        'account_ids': ids,
        'accounts': [{'id': a.get('id'), 'platform': a.get('platform'), 'display_name': a.get('display_name')} for a in accounts],
        'input_images': len(FILES),
        'normalized_images': len(normalized),
        'uploaded_media': len(uploads),
        'albums': posts,
        'normalized_dir': str(OUTDIR),
        'note': 'Created 4 draft carousel posts of 8 images each. Not published live.',
    }
    (OUTDIR / 'omnisocials_album_summary.json').write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2))
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
