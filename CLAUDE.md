# Fatman Parts — agent instructions

Storefront `fatmanparts.com` (Next.js on Vercel, Supabase catalog, Stripe). A
VPS autopilot (coordinator + 4 Hostinger workers, systemd) scrapes CHARM,
parses it, and publishes batches into Supabase behind a human Telegram gate.

Three folders, one business: **fatman-site** (this repo, storefront + STATUS.md),
**fatman-autopilot** (git reference copy of the pipeline, plus `RUNBOOK.md` and
`LESSONS.md`), **fatman-data** (the actual deploy source — see below).

`fatman-autopilot/LESSONS.md` and `RUNBOOK.md` are the deep docs. Read them
before changing pipeline code. This file is only what they don't say or get
wrong.

---

## Reaching the coordinator

`ssh fatmanvps` (IPv6) is dead from most networks — the coordinator's IPv4 is in
LACNIC space announced from Europe, so RPKI drops it inbound. Use
`ssh fatmanvps-jump` (via worker-1).

**`deploy.sh` defaults to `COORD=fatmanvps`.** Every invocation needs
`FATMAN_COORD_HOST=fatmanvps-jump ./scripts/autopilot/deploy.sh …` or it hangs
on "No route to host".

---

## Invariants — do not "improve" these

**Fanout years live in the systemd unit, NOT `queue.yaml`.** The download side
reads `ExecStart=… fanout.py --make Ford --years 1985,1986,…` in
`/etc/systemd/system/fatman-fanout.service`. `--years` is *required* and has no
fallback (`fanout.py:400`). `queue.yaml` drives the *batch/publish* runner only.
A year added to only one of the two silently never downloads, or downloads and
never publishes — neither produces an error. Adding a year means: edit the
unit's `--years`, `systemctl daemon-reload`, AND append to `queue.yaml`.
(RUNBOOK.md named only `queue.yaml` until this was corrected on 2026-08-25.)

**A year missing from `/opt/fatman/output/` is NOT necessarily missing from the
catalog.** The pre-autopilot years — 1982, 1983, 1984 and **1994** — were imported
before the fanout output convention existed, under `*-image-checkpoint-*` batch
ids. They have no CSV on the coordinator and appear in neither year list, which
makes them look like holes. They are fully live: 1994 carries all 74 of its
vehicles and 46,934 fitment rules. **Query Supabase before concluding a year is
missing**, or you will re-download and re-import a year that is already complete
(the importer refuses to re-apply a batch whose fitment source exists, so you
would burn days of CHARM budget to be told "no").

**The downloader's slowness is the feature.** `max_attempts=2`, retry base 150s,
batch pause 150s ±30, fanout timer twice a day 12h apart,
`FATMAN_FANOUT_RETRY_PASSES=0`. CHARM limits request *rate* per IP, not total.
The old 6-attempt/30–80s cycle consumed the exact allowance the next request
needed — a self-sustaining 429 loop. Raising retries or tightening the timer to
"speed things up" recreates it and makes throughput worse.

**Never parse a partial year.** The generated worker job bails to
`echo incomplete` when the download exits non-zero, on purpose: a partial CSV
looks complete downstream and imports as if the whole year were present. If a
bundle genuinely can't be fetched, add an explicit known-bad allowlist — do not
relax the guard.

**Two Mac copies must stay byte-identical.** `deploy.sh`'s `LOCAL_ROOT` resolves
to **`fatman-data/`**, not `fatman-autopilot/`. `fatman-autopilot` is the git
reference copy. Patch only one and you deploy something different from what's
committed, with nothing to warn you. Patch both, `md5` them, then deploy.

**`queue.yaml` is rsync-excluded** because years get appended on the VPS between
deploys. Don't "tidy" that exclude away — a push from a stale Mac would silently
revert live state.

**`.design-sync/` stays untracked — and stays un-ignored.** Despite the leading
dot it holds authored source (config, conventions, `make-sample-data.mjs`, 20
hand-written `previews/*.tsx`), so it is not a generated folder. Khan's call
2026-08-25: leave it out of git, it's Claude Design working material. Don't
commit it, and don't "tidy" it into `.gitignore` either — `.gitignore` already
excludes exactly its machine-state subpaths (`.cache/`, `learnings/`,
`node_modules`), which is the intended boundary. `graphify-out/` **is**
generated and is ignored.

**Workers never touch Supabase.** One staging DB, one dry-run, one writer.
Distributed *downloads* are fine; distributed writers would split-brain the
provenance.

---

## Fails silently — no error, looks fine

**A year stuck at "incomplete" can mean two opposite things.** Symptom is
identical: fanout logs `not finished (incomplete) — will resume on a later run`
and the year sits at 95–99% for days, burning a worker slot every run. Tell them
apart from the downloader's own `Summary:` counts line:
- `rate_limited=N, errors=0` → genuinely transient, it will resume.
- `errors=N` → it will **never** resume. Something is deterministically broken.

**Parenthesised vehicle names (fixed 2026-08-25 — keep it fixed).** aiohttp
routes every URL *string* through yarl, and yarl 1.24.5 decodes `%28`/`%29` back
to literal `(` `)`. CHARM 302-redirects the literal form to the encoded form,
yarl decodes it again, and the redirect loops until aiohttp raises
`TooManyRedirects` — logged as the uninformative `0, message=''`. This wedged
Ford 1998/1999/2000 for days, each one bundle short of the same Contour.
The fix is `session.get(yarl.URL(url, encoded=True), …)` in
`download_offline_bundles.py`. **Do not simplify that back to passing a string.**
If a vehicle name ever contains other sub-delims (`+ & ' ,`), suspect this class
first.

**Before blaming the IP, prove it.** Rate limiting and encoding bugs both look
like "downloads failing". Run A/B/A in a *single* session on *one* worker —
good call, suspect call, good call, ~20s apart. Sequential tests minutes apart
prove nothing, because CHARM recovers on its own in that window. A 429 arrives
as `HTTP 429` / `rate_limited`; an encoding bug arrives as `errors`.

**PostgREST silently caps responses at 1,000 rows.** No error, no warning — the
array is just short. `getProductSlugs` (`src/lib/catalog-db.ts:363`) pages
deliberately for exactly this reason. Any new query that needs the whole catalog
must page, or it will quietly serve a truncated sitemap/report.

**Truncated downloads return `HTTP 200`.** Capped `curl` tests looked great and
full bundles still truncated to corrupt ZIPs (see LESSONS.md on the Evomi
proxy). Acceptance test for any download path is one *complete* bundle verified
by size and ZIP integrity — `is_valid_zip_file` checks the end-of-central-
directory record, not just the `PK` magic, because a cleanly truncated stream
passes a magic-plus-size check forever.

---

## Deploying pipeline code, and proving it worked

```bash
cd ~/Projects/fatman-data
FATMAN_COORD_HOST=fatmanvps-jump ./scripts/autopilot/deploy.sh --check   # ALWAYS first
FATMAN_COORD_HOST=fatmanvps-jump ./scripts/autopilot/deploy.sh --push
FATMAN_COORD_HOST=fatmanvps-jump ./scripts/autopilot/deploy.sh --check   # confirm
```

`--check` first is not optional: `--push` has no newer-than check, so if the VPS
was hot-patched, pushing silently reverts the live fixes. If `--check` shows
`DIFFERS`, run `--pull` and commit before you edit.

`--push` refuses while `fatman-fanout` or `fatman-batch` is active — replacing a
script under a running job is how half-applied state happens. Wait for
`inactive`; do not work around the gate. (Overwriting a `.py` while a *worker*
job runs is safe: CPython has already loaded the module into memory.)

**Then verify by evidence, not by "it started".** Trigger with
`systemctl start --no-block fatman-fanout.service` (`Type=oneshot` blocks and
times out your SSH without `--no-block`), then look for:

| Evidence | Where |
|---|---|
| `WORKER_DOWNLOAD_RC=0` and `valid_zips=N/N` | worker `status/Ford_YYYY.log` |
| `state=done` (not `running`/`incomplete`) | worker `status/Ford_YYYY.state` |
| `done Ford YYYY in Ns (N clean rows, 4 CSVs)` | `journalctl -u fatman-fanout` |
| CSV actually present | coordinator `/opt/fatman/output/` |

For a *published* batch, planned-vs-live row counts (procedure in RUNBOOK.md).
A stage that says `completed` is a claim; a row count is evidence.

---

## Which source is authoritative for what

Several questions here have two plausible sources that disagree. The wrong one
is usually the more convenient one.

| Question | Ask this | Not this |
|---|---|---|
| Is year Y in the catalog? | Supabase `fitment_rules` | the coordinator's `output/`, `queue.yaml`, or git |
| Will year Y download? | `--years` in the fanout systemd unit | `queue.yaml` |
| Will year Y publish? | `queue.yaml` | the fanout unit |
| Did a batch really apply? | planned-vs-live row counts | a stage that says `completed` |
| What does the fleet cost, when? | `mission-control/data/money.yaml` | anything quoted in prose |
| How many products lack images? | the batch state files (1,278 as of 08-25) | LESSONS.md's older ~400 |

`RUNBOOK.md` and `LESSONS.md` were corrected on 2026-08-25 (commits `d7867d9`,
`cd6fb5e`). Anything in them predating that is unreviewed, not verified.

---

## Working with Khan on this

- Never commit fatman-site code without explicit instruction; typecheck and
  build must both pass first.
- Never push `graphify-out/` or `.design-sync/`.
- When he asks "why is X happening", diagnose and show the evidence before
  offering a fix. He pushes back on plausible-sounding causes — expect to have
  to rule out the alternative you didn't test.
- One next action at the end, not a roadmap.
