---
business: Fatman Parts
phase: automated
cadence_days: 7
last_touched: 2026-08-25
next:
  - "Tonight (Aug 25, after 21:00 PDT): reply `approve ford-1998-autopilot-001` on Telegram, then verify live fitment == dryrun fitment_count. Repeat nightly — 1999 Aug 26, 2000 Aug 27, 2002 Aug 28, 2003 Aug 29, 2004 Aug 30 — one year per night, each needing its own approve. Verify on FITMENT only; the live product count is a last-writer-wins stamp and under-reports every batch but the newest (see STATUS body). That completes Ford 1982-2005."
  - "Decide the worker fleet by ~Sep 12: cancel the 4x Hostinger KVM 1 ($77.96/mo, renews 2026-09-19) or keep them. After these 6 publish there is NO queued download work left, so cancelling is the default unless a second make is starting."
  - Pick the next make (or don't) — that decision is what makes the fleet question answerable, and it is the only thing blocking a clean shutdown
  - "Fix category-page caching: move searchParams out of page.tsx:117 + add revalidate — verified real Aug 25: page awaits searchParams, no revalidate export, so every category page renders dynamic (no ISR)"
  - "Generate images for 1,278 held-back products (worst: 2001=191, 1997=128) — they are skipped at import, so a backfill+reimport is needed"
---
Live: fatmanparts.com (Next.js on Vercel, Supabase catalog, Stripe). VPS autopilot
(coordinator + 4 workers, systemd) runs the catalog pipeline; repo fatman-autopilot is
the reference copy of /opt/fatman. Agent-facing traps and the deploy/verify procedure
are in `CLAUDE.md` in this repo.

**Coordinator SSH: try both hosts, neither is permanently the answer.** On Aug 25
~05:50 the direct IPv6 route was dead and `ssh fatmanvps-jump` was the only way in;
by 07:34 the reverse was true — direct `ssh fatmanvps` connected, and `fatman-w1`
(the jump's ProxyJump) timed out on port 22. Both paths fail intermittently and for
unrelated reasons. Test `ssh fatmanvps` first, fall back to `fatmanvps-jump`, and set
`FATMAN_COORD_HOST` to whichever answered.

## Pipeline status — verified Aug 25, 2026 (~05:50 PDT)

**Downloading: nothing. All 17 queued years are collected.** That is new as of today —
three of them had been wedged for days (see below).

**Live in Supabase, verified 2026-08-25 (18 years):** 1982–1997, 2001, 2005. Catalog
totals 29,676 products and 854,940 fitment rules. The six not-yet-published years show
`products = 1` in `fitment_rules` — that is a single stray `source='generated-data'`
seed product touching those years, not a partial import.

**Downloaded, waiting on the 21:00 PDT batch runner (6):** 1998 (6,288 clean rows),
1999 (6,765), 2000 (7,092), 2002 (7,396), 2003 (7,718), 2004 (7,541).

**Publish queue verified ready Aug 25 ~07:40 PDT.** All six years have their full
4-CSV set in `/opt/fatman/output/`, all six are in `queue.yaml`, none has a state file
or a `supabase_checkpoint_` dir, and `runner.py --plan` selects **Ford 1998** with
`resume at: download` (adoption skips download/parse — the CSVs are already there).
Nothing needed changing.

**Exactly one year per night — the 21:00 timer is the only thing that starts a new
batch.** `gate-recheck.timer` fires every 15 min but `gate_recheck.py` returns 0 unless
a batch is *already parked at the gate*; it never picks up the next one. So the Aug 24
night's nine `fatman-batch` invocations were all one batch (2001) being re-polled, not
nine batches. Schedule: 1998 Aug 25 → 1999 Aug 26 → 2000 Aug 27 → 2002 Aug 28 →
2003 Aug 29 → 2004 Aug 30. Done Aug 30/31, ahead of the Sep 19 worker renewal.

**Every one of the six needs a Telegram `approve` from Khan.** `FATMAN_GATE_MODE=B` in
`/etc/fatman/env`, so the gate always asks. Gate A would not have helped anyway: it
requires image coverage ≥ 99.0%, and real batches run 96–97% (2001: 97.39%, 2005:
96.23%) — both were `auto_approvable: false` and manually approved. A batch left
unapproved parks at the gate and burns a 15-min recheck slot indefinitely; it does not
time out and it does not block the next night's year.

### Verifying a published batch — use fitment, not products

Planned-vs-live for all six published-year spot checks, run Aug 25:

| year | planned fitment | live fitment | planned products | live products |
|---|---|---|---|---|
| 1985 | 65,626 | 65,626 ✅ | 4,369 | 380 |
| 1990 | 43,618 | 43,618 ✅ | 5,794 | 907 |
| 1995 | 37,492 | 37,492 ✅ | 7,073 | 454 |
| 1997 | 49,303 | 49,303 ✅ | 7,641 | 2,946 |
| 2001 | 64,196 | 64,196 ✅ | 7,121 | 4,320 |
| 2005 | 42,920 | 42,920 ✅ | 7,076 | 7,076 |

**Fitment is exact every time. The product column is a trap and those are not
failures.** `fitment_rules.source` is per-batch, so a batch's fitment count is frozen
at apply. `products.metadata->>importBatchId` is a *last-writer-wins stamp*: a SKU that
fits both 2001 and 2005 is one row, and the later import re-stamps it. Summing live
products across all 20 batch ids gives **29,676 — exactly the catalog total**, so
nothing was lost; the rows moved. The most recently applied batch (2005) therefore
always reads 100%, and older ones decay as later years claim shared SKUs.

So: **compare `dryrun.fitment_count` to live `fitment_rules`**. The product number is
only true at apply time and is already recorded there in the state file's `apply` and
`verify` numbers — read it from the state file, never re-query it days later.

Verification command (`fitment_count` / `product_count` live under
`stages.dryrun.numbers` in `scripts/autopilot/state/ford_<year>.json`):

```bash
ssh fatmanvps 'set -a; . /etc/fatman/env; set +a
B=ford-1998-autopilot-001
cnt(){ curl -s -o /dev/null -D - -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" -H "Prefer: count=exact" -H "Range: 0-0" "$1" | grep -i content-range | sed "s|.*/||" | tr -d "\r"; }
echo "live fitment: $(cnt "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/fitment_rules?source=eq.charm_staging:$B&select=id")"
python3 -c "import json;n=json.load(open(\"/opt/fatman/scripts/autopilot/state/ford_1998.json\"))[\"stages\"][\"dryrun\"][\"numbers\"];print(\"planned fitment:\",n[\"fitment_count\"],\"| planned products:\",n[\"product_count\"])"'
```

**There is no 1994 gap.** It looked like one — 1994 has no CSV on the coordinator and
is in neither year list — but Supabase says it is fully live: all 74 vehicles, 46,934
fitment rules, 6,713 products, imported 2026-05-26 under `ford-1994-image-checkpoint-001`.
Same for 1982, 1983 and 1984 (imported May 23–25). Those four predate the autopilot by
three months, from the Mac-driven era, which is why they leave no trace in
`/opt/fatman/output/`. **Acting on the apparent gap would have re-downloaded a complete
year for nothing.** Check `fitment_rules` before believing a year is missing.

## Fixed Aug 25: the paren-URL download bug

1998/1999/2000 had been wedged for days, each exactly one bundle short, always the same
vehicle — `Contour V6-153 2.5L VIN G (24 Valve) SFI`.

- **Cause.** The downloader handed aiohttp a URL *string*. aiohttp routes every string
  through yarl, and yarl 1.24.5 decodes `%28`/`%29` back to literal `(` `)`. CHARM
  302-redirects the literal form to the encoded form; yarl decodes it again; the
  redirect loops until aiohttp raises `TooManyRedirects`, logged as the useless
  `0, message=''`. Only vehicles with parentheses in the name are affected.
- **Not rate limiting.** Proved with an A/B/A on one worker in one session, 20s apart:
  encoded → HTTP 200, plain string → TooManyRedirects, encoded → HTTP 200. Three
  different worker IPs also failed on the same one vehicle and nothing else.
- **Why it was silent.** The runner correctly refuses to parse a partial year (a partial
  CSV would import as if the year were whole), so the year just looped `incomplete`
  forever, burning a worker slot every fanout run.
- **Fix.** `session.get(yarl.URL(url, encoded=True), ...)` in
  `scripts/crawler/download_offline_bundles.py`. Deployed via `deploy.sh --push` to the
  coordinator and all 4 workers; hashes verified matching. Committed as fatman-autopilot
  `d7867d9`, along with RUNBOOK/LESSONS corrections.
- **Result.** On the first fanout run after the deploy, all three completed and parsed
  in 185–261s each, `errors=0`, rc=0. 2003 then finished on the same run (501s).

## Worker fleet decision

4 × Hostinger KVM 1, **$77.96/mo, renews 2026-09-19** (`money.yaml` `cancel_by`). Decide
by ~Sep 12: cancel, or keep them for the next make. Every queued year is downloaded and
1994 turned out not to need doing, so the fleet has **no remaining work at all** — the
only thing that would justify keeping it is starting a second make.
