/**
 * IndexNow — pushes changed URLs to Bing, Yandex, Naver and Seznam the
 * moment they change, instead of waiting for a crawl. Google does not
 * participate; its only supported push (the Indexing API) is limited to
 * JobPosting and BroadcastEvent, so this is deliberately Bing-first.
 *
 * The key is public by design: crawlers fetch `keyLocation` and compare it
 * to `key` to prove we control the host. It is NOT the Bing Webmaster API
 * key, which is a secret and must never be published this way.
 */

const HOST = "fatmanparts.com";
const KEY = "165bd88a90b91b705c19075723c69479";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

/** IndexNow caps a single submission at 10,000 URLs. */
const MAX_PER_BATCH = 10_000;

export type IndexNowResult = {
  submitted: number;
  batches: Array<{ count: number; status: number; ok: boolean }>;
};

export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const clean = [...new Set(urls)].filter((u) => u.startsWith(`https://${HOST}/`));
  const batches: IndexNowResult["batches"] = [];

  for (let i = 0; i < clean.length; i += MAX_PER_BATCH) {
    const urlList = clean.slice(i, i + MAX_PER_BATCH);
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
    });
    // 200 accepted, 202 accepted but key still being validated
    batches.push({ count: urlList.length, status: response.status, ok: response.ok });
  }

  return { submitted: clean.length, batches };
}

export function productUrl(slug: string) {
  return `https://${HOST}/product/${slug}`;
}
