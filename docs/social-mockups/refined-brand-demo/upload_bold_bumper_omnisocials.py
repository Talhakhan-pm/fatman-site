import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path('/Users/macbook/Projects/fatman-site')
IMAGE = ROOT / 'docs/social-mockups/refined-brand-demo/01-bold-bumper-ad.png'
ENV = Path('/Users/macbook/.hermes/.env')

CAPTION_DEFAULT = """Big bumper energy. Fatman Parts helps you find replacement bumpers without turning your repair into a three-week scavenger hunt.

Match the vehicle. Pick the part. Get it moving.

Because a bumper should take the hit — not your wallet, your paint guy, or your patience.

Shop FatmanParts.com

#fatmanparts #autoparts #carparts #truckparts #bodyparts #replacementparts #bumper #bumpers #collisionrepair #autobody #autobodyrepair #bodyshop #mechaniclife #diyrepair #carrepair #truckrepair #repairshop #rebuildlife #projectcar #worktruck #shoplife #aftermarketparts #partsdepartment #getitmoving"""

CAPTION_X = """Big bumper energy. Find replacement bumpers without turning your repair into a scavenger hunt.

Match the vehicle. Pick the part. Get it moving.

FatmanParts.com

#fatmanparts #autoparts #carparts #bumper #autobody #collisionrepair"""


def get_key():
    key = os.environ.get('OMNISOCIALS_API_KEY')
    if key:
        return key
    if ENV.exists():
        for line in ENV.read_text().splitlines():
            if line.startswith('OMNISOCIALS_API_KEY='):
                return line.split('=', 1)[1].strip().strip('"').strip("'")
    return None


def curl_json(args, input_data=None):
    res = subprocess.run(args, input=input_data, text=True, capture_output=True)
    if res.returncode != 0:
        return {'ok': False, 'returncode': res.returncode, 'stderr': res.stderr[:500], 'stdout': res.stdout[:500]}
    try:
        return {'ok': True, 'json': json.loads(res.stdout)}
    except Exception:
        return {'ok': False, 'raw': res.stdout[:1000], 'stderr': res.stderr[:500]}


def main():
    key = get_key()
    if not key:
        print(json.dumps({'ok': False, 'error': 'missing OMNISOCIALS_API_KEY'}))
        return 0
    if not IMAGE.exists():
        print(json.dumps({'ok': False, 'error': f'image missing: {IMAGE}'}))
        return 0

    # Accounts
    accounts_res = curl_json(['curl', '-sS', 'https://api.omnisocials.com/v1/accounts', '-H', f'Authorization: Bearer {key}'])
    if not accounts_res['ok']:
        print(json.dumps({'ok': False, 'step': 'accounts', 'result': accounts_res}, indent=2))
        return 0
    accounts_raw = accounts_res['json'].get('data', accounts_res['json'].get('accounts', []))
    accounts = [a for a in accounts_raw if not a.get('needs_reconnect') and a.get('status') == 'active' and a.get('platform') in ('instagram', 'facebook')]
    account_ids = [a['id'] for a in accounts]
    if not account_ids:
        print(json.dumps({'ok': False, 'error': 'no active instagram/facebook accounts', 'accounts_seen': accounts_raw}, indent=2))
        return 0

    # Upload media
    upload_res = curl_json([
        'curl', '-sS', '-X', 'POST', 'https://api.omnisocials.com/v1/media/upload',
        '-H', f'Authorization: Bearer {key}',
        '-F', f'file=@{IMAGE}'
    ])
    if not upload_res['ok']:
        print(json.dumps({'ok': False, 'step': 'media_upload', 'result': upload_res}, indent=2))
        return 0
    media_json = upload_res['json']
    media_obj = media_json.get('data', media_json.get('media', media_json))
    media_id = media_obj.get('id') if isinstance(media_obj, dict) else None
    if not media_id:
        print(json.dumps({'ok': False, 'step': 'media_id_parse', 'media_response': media_json}, indent=2))
        return 0

    # Create draft (not live publish) for review.
    payload = {
        'type': 'post',
        'content': {
            'default': CAPTION_DEFAULT,
            'instagram': CAPTION_DEFAULT,
            'facebook': CAPTION_DEFAULT,
            'x': CAPTION_X,
            'bluesky': CAPTION_X,
        },
        'accounts': account_ids,
        'media_ids': [media_id],
    }
    post_res = curl_json([
        'curl', '-sS', '-X', 'POST', 'https://api.omnisocials.com/v1/posts/create',
        '-H', f'Authorization: Bearer {key}',
        '-H', 'Content-Type: application/json',
        '-d', json.dumps(payload),
    ])
    if not post_res['ok']:
        print(json.dumps({'ok': False, 'step': 'post_create', 'result': post_res}, indent=2))
        return 0
    post_json = post_res['json']
    post_obj = post_json.get('data', post_json.get('post', post_json))
    safe_accounts = [{'id': a.get('id'), 'platform': a.get('platform'), 'display_name': a.get('display_name'), 'status': a.get('status')} for a in accounts]
    print(json.dumps({
        'ok': True,
        'mode': 'draft_created',
        'image': str(IMAGE),
        'media_id': media_id,
        'accounts': safe_accounts,
        'post_id': post_obj.get('id') if isinstance(post_obj, dict) else None,
        'post_status': post_obj.get('status') if isinstance(post_obj, dict) else None,
        'caption_default_chars': len(CAPTION_DEFAULT),
        'caption_x_chars': len(CAPTION_X),
        'hashtags_lowercase': True,
        'api_response_keys': sorted(post_obj.keys()) if isinstance(post_obj, dict) else None,
    }, indent=2))
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
