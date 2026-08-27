---
business: Fatman Parts
phase: automated
cadence_days: 7
last_touched: 2026-08-27
next:
  - "do: Fix category-page caching: move searchParams out of page.tsx:117 + add revalidate — verified real Aug 25: page awaits searchParams, no revalidate export, so every category page renders dynamic (no ISR)"
  - "watch: Chevrolet 1982-2013 downloading on the 4 workers — 9 of 32 years touched, 0 done yet, errors=0 everywhere. Nothing to publish until a year reaches state=done; then it needs a manual `systemctl start --no-block fatman-batch.service` + Telegram approve."
  - "do: Backfill images for ~5,016 held-back products — Aug 26 added 3,738 across the eight new years (2011=601, 2010=589, 2009=562, 2012=541, 2008=414, 2013=398, 2007=348, 2006=285). Post-2005 image coverage runs 92-96% vs ~98% for older years, so this is now the main ceiling on catalog size. They are skipped at import, so this needs generate + reimport."
  - "do: Reclaim ~19.5 G on the coordinator — `rm -rf /opt/fatman/output/offline-bundles/Ford` (18 G, the pre-fanout 1995/1996/1997 zips) and `/opt/fatman/output/rescue-bundles/Ford` (1.5 G). Those years are published and verified and nothing reads the zips. Deferred Aug 27, not urgent at 26% used — do it before Chevrolet 2006+ lands, or if the coordinator tightens. Keep the ford_*_v1.csv files and supabase_checkpoint_* dirs."
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

## Ford 1982–2005 is COMPLETE — verified Aug 25, 2026 (~08:06 PDT)

All 24 model years are live. A `generate_series(1982,2005) EXCEPT (distinct year)`
against `fitment_rules` returns **null** — no gaps anywhere in the range.

Catalog now: **31,999 products, 1,179,382 fitment rules** (was 29,676 / 854,940 at
07:30 the same morning).

### The last six published today, in one session

Rather than one year per night, the runner was triggered manually with
`systemctl start --no-block fatman-batch.service` after each approval — one batch per
invocation, Khan approving each on Telegram. Six years in ~2.5 hours.

| year | planned fitment | live fitment | products | image coverage |
|---|---|---|---|---|
| 1998 | 46,492 | 46,492 ✅ | 6,159 | 97.96% |
| 1999 | 55,918 | 55,918 ✅ | 6,627 | 97.97% |
| 2000 | 52,015 | 52,015 ✅ | 6,919 | 97.57% |
| 2002 | 53,223 | 53,223 ✅ | 7,182 | 97.12% |
| 2003 | 66,196 | 66,196 ✅ | 7,486 | 97.02% |
| 2004 | 50,598 | 50,598 ✅ | 7,301 | 96.84% |

Sum of the six = 324,442, and catalog fitment rose by exactly 324,442. No drift, no
double-insert.

**2002 failed its first apply and that was fine.** At 52,500 of 53,223 rows Supabase
returned `HTTP 500 {"code":"57014","message":"canceling statement due to statement
timeout"}` — Postgres killing an insert chunk under load, not a data problem. Recovery
was simply re-running the service: the runner resumes at the first incomplete stage,
the already-`completed` gate is NOT re-asked (no second Telegram approval), and
`--replace-existing-fitment-source` drops only that batch's own rows before
re-inserting. Live count landed on exactly 53,223 — no duplicates from the partial
first pass. **Do not reach for `resume_supabase_image_expansion_fitment.py` here; just
re-run the unit.**

**Apply duration varies by ~15x for the same work.** 1998 took ~25 min for 46,492 rows;
2003 took ~2 min for 66,196. Same code, same path — it tracks Supabase-side load, not
row count. A slow apply logs nothing for 20+ minutes because the importer only prints
per-chunk counters for categories and products, never fitment. **A silent apply is not
a hung apply** — query the live count to tell them apart.

## Ford 2006–2013 queued Aug 25 ~08:15 PDT

CHARM's Ford coverage ends at 2013 — the fitment CSV spans 1982–2013, 32 distinct
years, and 1982–2005 are all live. So these 8 are the last Ford work that exists:
**606 vehicle bundles, ~76/yr**, against 2,001 bundles already done at ~83/yr. Roughly
30% of the effort already spent, so ~3–4 days on the 4 workers.

Both required locations were updated (see the two-location invariant in CLAUDE.md):

- `/etc/systemd/system/fatman-fanout.service` — `--years` **replaced** with
  `2006,...,2013`, then `daemon-reload`. Replaced rather than appended: the 17 old
  years are complete, and re-listing them only makes every pass walk finished state.
- `scripts/autopilot/queue.yaml` — the 8 **appended** (now 25 entries). Completed
  batches are skipped via their state files, so history stays.

Backups of both are on the coordinator as `.bak-20260825T081209`.

Verified by evidence, not by "it started": the first fanout pass opened with
`[fanout] 4 workers, 8 jobs: Ford 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013` and
dispatched 2006–2009 across worker-1..4.

**Publishing them is not automatic.** Each finished year still needs
`systemctl start --no-block fatman-batch.service` plus a Telegram `approve` — the
21:00 timer would otherwise do one per night.

## How the batch runner actually behaves

**Only the 21:00 timer starts a *new* batch.** `gate-recheck.timer` fires every 15 min
but `gate_recheck.py` returns 0 unless a batch is *already parked at the gate*; it never
picks up the next one. So left alone this would have been one year per night. Triggering
`systemctl start --no-block fatman-batch.service` by hand after each approval is what
compressed it into one session — that is the lever for the next make too.

**Every batch needs a Telegram `approve`.** `FATMAN_GATE_MODE=B` in `/etc/fatman/env`,
so the gate always asks. Gate A would never fire anyway: it needs image coverage ≥ 99.0%
and real batches run 96–98%. A batch left unapproved parks harmlessly and gate-recheck
re-offers it every 15 min.

### Verifying a published batch — use fitment, not products

Planned-vs-live spot checks on six older published years, run Aug 25:

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


## Ford 1982–2013 COMPLETE — Aug 26, 2026

`generate_series(1982,2013)` against `fitment_rules` returns **0 missing years**.
**32/32 model years live: 44,938 products, 1,405,570 fitment rules, 3,095 categories.**
CHARM has no Ford past 2013, so this make is finished.

The eight years published Aug 26 sum to 226,188 fitment rows, and the catalog rose
from 1,179,382 to 1,405,570 — a difference of exactly 226,188. No drift, no
double-insert across eight batches.

| year | planned | live | | year | planned | live |
|---|---|---|---|---|---|---|
| 2006 | 31,197 | ✅ | | 2010 | 29,420 | ✅ |
| 2007 | 37,531 | ✅ | | 2011 | 26,990 | ✅ |
| 2008 | 27,800 | ✅ | | 2012 | 24,584 | ✅ |
| 2009 | 27,470 | ✅ | | 2013 | 21,196 | ✅ |

## How Aug 26 actually went — 7 of 8 years in one day

Started as a Hostinger disk-full alert on worker-3 and ended with **seven years
live**. Catalog went **31,999 → 44,660 products** and **1,179,382 → 1,380,986
fitment rules**.

| year | planned fitment | live fitment | products | image coverage |
|---|---|---|---|---|
| 2006 | 31,197 | 31,197 ✅ | 6,992 | 95.9% |
| 2007 | 37,531 | 37,531 ✅ | 8,105 | 95.7% |
| 2008 | 27,800 | 27,800 ✅ | 6,768 | 93.9% |
| 2009 | 27,470 | 27,470 ✅ | 6,949 | 91.9% |
| 2010 | 29,420 | 29,420 ✅ | 7,229 | 91.9% |
| 2011 | 26,990 | 26,990 ✅ | 7,505 | 92.0% |
| 2013 | 21,196 | 21,196 ✅ | 5,725 | 93.0% |

Planned matched live exactly on all seven. **Only Ford 2012 remains.**

**The newer years really are thinner — this is source data, not a defect.**
2006–2013 land at 21–37 K fitment against 42–66 K for 2000–2005, and image
coverage slides from ~98.4% to ~92%. A long investigation treated Ford 2008's
27,800 as evidence of a broken parse; five later years landed in the same band
and settled it. Related trap now in `fatman-autopilot/CLAUDE.md`: a year's
parser output (`accepted_fitment_rows`) runs ~45% above its planned
`fitment_count` on every year — compare planned-to-planned, never
planned-to-parsed.

**The fanout resumes stalled years on its own; do not hand-run the downloader.**
The 04:00 PT pass completed 2006, 2007, 2009, 2010 and 2013 unattended. Earlier
that day the repeated `incomplete → starting <other year>` journal pattern was
misread as permanent abandonment, and Ford 2008 was rescued by hand — which
bypassed the job wrapper and left the year unparsed, its 18 GB of zips
undeleted and its CSVs uncollected until all three were done manually. Full
detail in `fatman-autopilot/CLAUDE.md`.

**Disk is the binding constraint on 2010–2013, and it is new.** Bundles grew
~8×: 1991 ≈ 56 MB, 2007 ≈ 182 MB, 2011 ≈ 466 MB, biggest single 688 MB. Two
modern years no longer fit on one 50 GB worker (2007 + 2011 = 51 GB), and the
fanout assigns a second year on idleness without checking. worker-3 hit 100% and
spent ~152 s per doomed retry burning CHARM budget — safely (temp-file +
`is_zipfile()` validation means no corrupt archive ever commits) but wastefully.
Upgrading KVM 1 → KVM 2 is +$5.00/mo each and was declined: unknown whether a
Hostinger resize preserves the disk, and losing a worker's zips costs far more
in re-downloads than the fee.

**Worker IPv4 went unreachable from Khan's Mac mid-session** — all four DCs at
once, while `ssh fatmanvps` over IPv6 and the Hostinger API kept working. Not
the boxes: no fail2ban, empty `iptables INPUT`, `ufw` inactive, sshd listening.
VPN off did not fix it. Reach workers through the coordinator with
`/root/.ssh/fatman_coord_to_worker`. `fatmanvps-jump` proxies via worker-1 so it
fails too — it is not a fallback for this.

## Chevrolet 1982–2013 started — checked Aug 27, 2026 ~06:20 PDT

The fanout unit was re-pointed at a new make. `ExecStart` now reads
`--make Chevrolet --years 1982,…,2013` (32 years), and `queue.yaml` is at **57
entries** — 25 Ford + 32 Chevrolet. Both halves of the two-location invariant are
satisfied.

**Download progress, 4 workers, ~2h into the 04:00 pass:**

| worker | done-ish (rate-limited remainder) | now |
|---|---|---|
| worker-1 | 1982 83/100, 1986 81/101 | 1990 @ 14% |
| worker-2 | 1983 80/96, 1987 85/109 | 1991 @ 17% |
| worker-3 | 1984 80/91 | 1988 @ 82% |
| worker-4 | 1985 96/112, 1989 78/98 | 1993 @ 7% |

**9 of 32 years touched, 0 at `state=done`, 716 zips on disk.** Every year that
logged `incomplete` did so with `errors=0, rate_limited=17–20` — the transient
kind that resumes on a later pass, not the deterministic kind that never will.
Nothing needs a human. First publishable years land in ~1–2 days; all 32 in
roughly 4–6 days, well inside the Sep 19 renewal.

### Disk: no crisis now, but Chevrolet 2006+ will repeat the Ford squeeze

Checked Aug 27. Nothing is tight today:

| box | disk | used | free |
|---|---|---|---|
| coordinator | 96 G | 25 G (26%) | 72 G |
| worker-1 | 48 G | 11 G (23%) | 37 G |
| worker-2 | 48 G | 11 G (23%) | 37 G |
| worker-3 | 48 G | 12 G (25%) | 36 G |
| worker-4 | 48 G | 12 G (24%) | 37 G |

**The workers already threw their Ford zips away by themselves.** The job wrapper
ends in `rm -rf output/offline-bundles/{make}/{year}` after a successful parse
(`fanout.py:122`), so a year's bundles live only between download and parse. All
four workers now hold Chevrolet only — the single exception is 64 MB of Ford 1990
on worker-3, orphaned by the Aug 26 hand-rescue that bypassed the wrapper. Ford is
costing the fleet nothing.

**~19.5 G of dead Ford data does sit on the coordinator**, left from the
pre-fanout era when the coordinator downloaded directly:
`output/offline-bundles/Ford` (18 G — 1995 4.4 G, 1996 5.1 G, 1997 8.6 G) and
`output/rescue-bundles/Ford` (1.5 G, the 1988 Tempo rescue). Those years are
published and verified, so the zips are re-derivable from CHARM and nothing reads
them. Safe to delete whenever; at 26% used it is not urgent.

**Keep the Ford CSVs and checkpoints** — `output/ford_*_v1.csv` (1.6 G) plus
`supabase_checkpoint_*` (748 M). They are the only local copy of the parse and the
only way to re-import a batch without re-downloading the year. 2.3 G is cheap
insurance.

**The projection is the real finding.** Chevrolet is 2,823 bundles over 32 years
(Ford was 2,607), so ~8 years per worker. 1980s years measure 3.6–5.6 G each
(~47 MB/bundle). But Ford's modern bundles ran ~466 MB each, and Chevrolet
2010–2013 carry 67–75 bundles per year — **~28–35 G for a single year**, against
37 G free on a 48 G worker. One modern year very nearly fills a worker; two
concurrently cannot fit. Compounding it: an `incomplete` year keeps its zips
(below), so a worker holding two stalled 1980s years starts a modern year already
8 G down. Expect the squeeze to start around Chevrolet 2006, roughly eight fanout
passes out.

### `incomplete` → start a different year is deliberate, not drift

The pattern in the journal — `Chevrolet 1982 not finished (incomplete) — keeping
downloaded bundles, will resume on a later run` followed immediately by
`starting Chevrolet 1986` — is the designed behaviour, in four parts:

1. `poll_job` treats `incomplete` as a **terminal** state, same as `done`. The
   worker is free, so the dispatcher hands it the next year.
2. The zips are kept on purpose. `rm -rf` only runs after a successful parse, so
   a partial year's bundles survive.
3. `progress_<make>_<year>.json` records what already landed, so the resume does
   not re-download — recovered bundles come back on the `exists=` counter, not
   `downloaded=`.
4. The point is the rate limit. CHARM caps request *rate* per IP, and the
   remaining bundles of a stalled year are exactly the ones with no allowance
   left. Retrying them immediately burns the budget they need; spending it on a
   fresh year's untouched bundles makes real progress on the same IP.

So a year sitting at 80% across several passes is the system working. The tell
that something is actually wrong is `errors=N` in the `Summary:` line rather than
`rate_limited=N` — currently 0 everywhere. **The cost of the design is disk**:
every stalled year holds its bundles until it finishes, which is what makes the
modern-year projection above tight rather than comfortable.

`queue.yaml` `status:` is **not a progress ledger** — all 57 entries read
`pending`, including Ford years that are demonstrably live. The runner tracks
completion in the per-batch state files and never writes back to the queue. Read
completion from `fitment_rules` or the state files.

**Connectivity today: direct IPv6 dead, jump alive, but the jump needs a longer
timeout.** `ssh fatmanvps` returned `No route to host` on the coordinator's
IPv6 (`2a02:4780:4:fb48::1`) from Khan's Mac, while worker-1 pings that same
address in 61 ms — so it is a path problem from the Mac, not the box. `ssh
fatmanvps-jump` works, but at `ConnectTimeout=10/15` it dies during banner
exchange and looks exactly like a dead host. **Use `ConnectTimeout=30` on the
jump before concluding it is down.**
