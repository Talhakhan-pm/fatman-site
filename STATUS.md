---
business: Fatman Parts
phase: automated
cadence_days: 7
last_touched: 2026-08-25
next:
  - "Publish the last 6 years: let the 21:00 PDT batch runner work through 1998, 1999, 2000, 2002, 2003, 2004 (one batch per invocation). Verify each with planned-vs-live counts per RUNBOOK — a stage saying completed is a claim, a row count is evidence. That completes Ford 1982-2005."
  - "Decide the worker fleet by ~Sep 12: cancel the 4x Hostinger KVM 1 ($77.96/mo, renews 2026-09-19) or keep them. After these 6 publish there is NO queued download work left, so cancelling is the default unless a second make is starting."
  - "Pick the next make (or don't) — that decision is what makes the fleet question answerable, and it is the only thing blocking a clean shutdown"
  - "Fix category-page caching: move searchParams out of page.tsx:117 + add revalidate — verified real Aug 25: page awaits searchParams, no revalidate export, so every category page renders dynamic (no ISR)"
  - "Generate images for 1,278 held-back products (worst: 2001=191, 1997=128) — they are skipped at import, so a backfill+reimport is needed"
---
Live: fatmanparts.com (Next.js on Vercel, Supabase catalog, Stripe). VPS autopilot
(coordinator + 4 workers, systemd) runs the catalog pipeline; repo fatman-autopilot is
the reference copy of /opt/fatman. Agent-facing traps and the deploy/verify procedure
are in `CLAUDE.md` in this repo.

Coordinator is reachable only via `ssh fatmanvps-jump` right now (direct IPv6 route:
"No route to host"). `deploy.sh` needs `FATMAN_COORD_HOST=fatmanvps-jump` to match.

## Pipeline status — verified Aug 25, 2026 (~05:50 PDT)

**Downloading: nothing. All 17 queued years are collected.** That is new as of today —
three of them had been wedged for days (see below).

**Live in Supabase, verified 2026-08-25 (18 years):** 1982–1997, 2001, 2005. Catalog
totals 29,676 products and 854,940 fitment rules. The six not-yet-published years show
`products = 1` in `fitment_rules` — that is a single stray `source='generated-data'`
seed product touching those years, not a partial import.

**Downloaded, waiting on the 21:00 PDT batch runner (6):** 1998 (6,288 clean rows),
1999 (6,765), 2000 (7,092), 2002 (7,396), 2003 (7,718), 2004 (7,541). The runner does
one batch per invocation, so expect one to two years published per day — roughly
Aug 29 – Sep 1, ahead of the Sep 19 worker renewal.

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
