# Fatman Parts Frontend Demo

Next.js + Tailwind mock frontend for Fatman Parts (OEM-first, fitment-led, fast-shipping brand concept).

## Run

```bash
cd /Users/macbook/.openclaw/workspace/fatman-site
npm install
npm run dev
```

Open: http://localhost:3000

## Data Sync (from CSV)

Source files:
- `/Users/macbook/.openclaw/workspace/fatman-data/products.csv`
- `/Users/macbook/.openclaw/workspace/fatman-data/fitment.csv`

Regenerate frontend data:

```bash
cd /Users/macbook/.openclaw/workspace/fatman-site
npm run sync:data
```

This updates `src/lib/generated-data.ts` used by product catalog + fitment logic.

## Demo Flow (2 minutes)

1. Homepage → click **Enable demo data** in header (preloads a demo vehicle)
2. Toggle **Light/Dark mode** in header
3. Go to **Engines** category and observe fitment badges
4. Open a product page and check fitment state + sticky mobile buy bar
5. Open **Cart** for checkout mock flow

## Routes

- `/` Homepage
- `/category/[slug]` Dynamic category pages
- `/product/[slug]` Product detail pages
- `/blog` Blog mock
- `/about` About page
- `/contact` Contact form mock
- `/cart` Cart/checkout mock

## Mock APIs

- `GET /api/products`
- `POST /api/fitment/check`

Example fitment check:

```bash
curl -X POST http://localhost:3000/api/fitment/check \
  -H "content-type: application/json" \
  -d '{
    "productSlug": "long-block-20l-turbo",
    "vehicle": {"year":"2022","make":"Honda","model":"Accord","engine":"2.0T"}
  }'
```
