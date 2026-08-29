---
business: Fatman Parts
phase: automated
cadence_days: 7
last_touched: 2026-08-29
next:
  - "do: RESTART THE FANOUT once the parser-fix deploy lands (that session presents to Khan first). Image-harvest step deployed and verified (autopilot commit da01c2f). Restart: `systemctl start fatman-fanout.timer && systemctl start --no-block fatman-fanout.service`; --years reads the remaining 12 (2002-2013). Note: 2002-2005's parsed CSVs likely still sit uncollected on workers (fanout stopped before collection) — expect them to collect on restart, then re-run the publish loop for them."
  - "do: make the importer PRESERVE metadata.images on product upsert — today a batch re-stamping a shared SKU rebuilds metadata and silently drops the factory-diagram gallery (6,503 products carry one as of Aug 29). Patch import_supabase_checkpoint.py to merge the images + imageDiagramsBatch keys, both trees, before the next publish run."
  - "watch: first full year through the image harvest — compare HARVEST_MB in the worker log against the ~3 GB/year planning budget before committing coordinator disk to a GMC-scale make."
  - "DECIDE THE FLEET by ~2026-09-12 ($77.96/mo, cancel_by 2026-09-19). ~12 Chevrolet years of downloads remain, so this is not a free cancel; art re-downloads (Ford + Chevy 2002-2005) also depend on keeping it."
  - "do: extend diagram enrichment beyond Ford 1994 — run enrich_product_images.py on the local Ford 1983/1984 bundles and, once harvests land, on coordinator stores (harvest mode needs the crawler CSV for the parts side). Then Tier 2 AI pool expansion for the ~5,200 held-back products (the catalog-size ceiling)."
  - "Fix category-page caching: move searchParams out of page.tsx:117 + add revalidate — verified real Aug 25: every category page renders dynamic (no ISR)"
  - "Consider adding scripts/catalog_db/import_supabase_image_expansion.py and enrich_product_images.py to deploy.sh's --check manifest."
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


## Chevrolet started Aug 26 — parser incident, fixed and verified Aug 28

Catalog: **50,238 products / 1,463,040 fitment**. Chevrolet **1 of 32 years
published** (1994, 57,470 rows — planned matched live exactly, and the catalog rose
from 1,405,570 by precisely that). Getting there took finding and fixing a bug that
had silently destroyed a year, and the story is worth keeping.

**The parser silently rejected 100% of Chevrolet rows.** `valid_part_number`
required a letter — true of every Ford part number (`F5TZ-1104-A`), false of every
GM one (`24229186`). Chevrolet 1997 downloaded 69/69 bundles cleanly, then parsed
to `clean_rows=0, rejected_rows=80309`.

**What made it destructive rather than merely wrong:** the job wrapper only
branched on the *download* exit code. A parse that produced a bare header still
wrote `done`, fired `{cleanup}` to delete all 69 zips, and shipped empty CSVs —
which `already_collected()` then read as proof the year was finished, so it could
never be retried. That year now needs a full re-download; it is the only
permanent loss.

Both halves are fixed and deployed (parser accepts GM digit runs; wrapper refuses
cleanup on an empty parse). Verified on real data: Chevrolet 1988 re-parsed to
6,253 clean rows at a 3.5% rejection rate, in line with Ford's usual 3-4%.

**Two process lessons, both in `fatman-autopilot/CLAUDE.md`:**

- **Validate a new make on one year before running the fleet.** A ten-minute dry
  parse to /tmp would have caught this before two days of four workers produced
  zero publishable years.
- **The fanout walks years breadth-first and CHARM cuts every year at ~80%**, so
  on a fresh make all 32 years get opened and parked one tail short before any
  completes. Narrow the unit's `--years` to the incomplete years, cheapest tail
  first, and restart — each completion frees 5-9 GB for the next.

Also fixed: the morning digest was printing 28 finished Ford batches and 30
unchanged `(±0)` fitment sources every day, reading as though Ford were still
active. It now collapses finished makes to one line and shows only sources that
moved.


### Resolution — verified end to end Aug 28

**Chevrolet 1994 ran the whole chain unattended** — download → parse → cleanup →
collect → stage → QA → dry-run → gate → apply → verify — and landed 57,470 rows.
Ten hours earlier the same year would have imported zero and had its bundles
deleted. Parse health: `raw_rows=89183, clean_rows=5475, rejected_rows=3045` — a
3.4% rejection rate, in Ford's usual 3-4% band, versus 100% before the fix.

Image coverage 96.8% (175 held back), better than any post-2005 Ford year.

**Damage was contained to one year.** Chevrolet 1997 lost its 69 zips and needs a
full re-download; all 23 other in-flight years kept theirs and only need re-parsing
via the normal drain. Note the cleanup had to happen in **two** places: the empty
CSVs on the coordinator (which made `already_collected()` skip the year forever)
*and* the stale `done` state file plus empty CSVs on the worker — otherwise the
wrapper's `DONE_PENDING_FETCH` branch would have handed the empty CSVs straight
back and silently re-polluted the coordinator.

**Why nothing published for two days:** the fanout walks years breadth-first, and
CHARM cuts every year off around 80%. It opened all 32 years and parked each one a
tail short before any completed, because a year only yields CSVs at 100%. The fix
is to narrow `--years` to just the incomplete years so the fanout can only close
years, never open new ones — which is why restoring that list later is the second
`next:` item and easy to forget.

**Expect a few years to close per pass, not all at once.** Within one pass a
refused bundle gets 2 attempts and is then abandoned; across passes the per-IP
budget recovers and they land. Evidence: 1997 went 10-for-10 and Ford 2008 went
10-for-10 on previously-refused bundles. Passes run 04:00 and 16:00 PT.

Also fixed Aug 28: the morning digest was printing 28 finished Ford batches and 30
unchanged `(±0)` fitment sources daily, reading as though Ford were still active.
It now collapses finished makes to one line and shows only sources that moved.


## Aug 28 (later) — the exporter was Ford-specific too; fixed and backfilled

**7 Chevrolet years live** (1982-1987, 1994), 13 more collected and awaiting a
publish. All 20 drain years completed, including 1997's full re-download.

**Every Chevrolet product published before this fix carried `brand='Ford'`**,
Ford alt text and Ford short descriptions, because
`scripts/catalog_db/export_live_import_plan.py` hard-coded the make into every
customer-visible string. The make now comes from the batch name
("Chevrolet 1987 autopilot v1"), which is the only place the original casing
survives — the slugified `import_batch_id` cannot round-trip "GMC" or
"Dodge and Ram", both of which are real makes still to come.

**It was seven literals across three files**, not the three in one that it first
appeared to be, and `make_product()` turned out to have callers in two *other*
files that the first deploy crashed on. Full detail in
`fatman-autopilot/CLAUDE.md`.

**Backfill: 8,412 rows corrected** across chevrolet-1982/83/84/85/86/94 — brand,
short_description, metadata.imageAlt, metadata.imageText. Verified afterwards
that Ford's 44,710 products were untouched, which is the check that proves the
anchored update did not reach outside its filter.

Worth knowing for any future backfill: the damage count **moved on its own**.
Publishing 1987 re-stamped every SKU it shared with earlier years and re-branded
them correctly, dropping the rows needing repair from 14,355 to 8,412 with no
intervention. `importBatchId` is last-writer-wins, so re-measure immediately
before running any repair.

**The exporter had never been in `deploy.sh`'s `--check` manifest** — its live
copy sat at a May 25 build for three months, shipping on every `--push` (which
rsyncs all of `scripts/`) but never verified by anything. Now on the list.

## Aug 28 (evening) — image diversity investigated, plan written

Why every category grid shows one photo repeated: 101 AI renders serve ~59k
products (top image fronts 8,612 alone), assigned at export by first-match
substring in `export_live_import_plan.py` — CHARM parts pages carry no images at
all. But the bundle zips DO ship 1,400–2,100 real factory illustrations per
vehicle, joinable to products by component breadcrumb name with zero fuzzy
matching — proven end-to-end on three products (clutch disc, brake caliper, fuel
injector) from the local Ford '94 bundles. Full findings, phases, and invariants:
`docs/image-diversity-plan.md`. Visual proof artifact:
https://claude.ai/code/artifact/0198eb8a-ecc7-4891-a64a-7f238f871351

Two catches recorded there: workers delete zips after parse, so the un-restarted
fanout's 12 remaining Chevrolet years are the last free art (hence the new
`decide:` above), and 170/529 of the Mustang '94 parts pages parse to zero rows
from malformed `<tr>` markup — a silent catalog gap spun off as its own task.

## Aug 29 — 13 years published overnight; factory diagrams LIVE on the storefront

**Overnight publish run (Khan-delegated approvals): 13/13 Chevrolet years
published, zero errors, zero interventions.** A driver on the coordinator
(`/opt/fatman/overnight/`) parked each batch at the gate, re-computed the gate
evaluation with strict bands (coverage 88-99.9%, ratio ±0.20, zero QA flags,
fitment 5k-120k), approved via the state file's resume semantics, and verified
planned-vs-live before the next year. Chevrolet is now 20/32 live. The driver
stopped itself at 2002 (no collected CSVs) exactly as designed. 1988 sample:
6,966 products / 86,056 fitment planned = live exactly.

**Image diversity Phases C+D shipped and deployed** (commits `4ca84a5` →
`9d9b07c`, master fast-forwarded, Vercel READY):
- `fatman-data/scripts/catalog_db/enrich_product_images.py` — joins CHARM
  factory line art to parts by component breadcrumb; full Ford 1994 run:
  88.2% of products got ≥1 diagram, 3,639 deduped blobs / 63.5MB.
- Storefront: PDP "Factory diagrams" gallery (light wells, honest
  component-level captions), per-page grid dedup (max 4 cards per image, then
  spec-plate with category icon + tint), deterministic per-SKU crop/scale
  variation, search-dropdown hardening.
- Backfill: 3,325 diagrams in Storage (`fatman-catalog/diagrams/`), **6,503
  live products across 17 categories** carry `metadata.images`, tagged
  `imageDiagramsBatch=ford-1994-diagrams-001` (rollback = strip that key by
  tag). Verified on production: pilot + random non-pilot PDPs serve 4 diagrams.

**Durability trap (now next: #2): the importer rebuilds metadata on upsert**,
so any future batch that re-stamps a shared SKU drops that product's gallery
silently. Merge-preserve `images`/`imageDiagramsBatch` in the importer before
the next publish run.
