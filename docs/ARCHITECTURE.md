# Architecture

One page for a reviewer who wants to know how the thing actually works before believing a
screenshot. Nothing here is aspirational; every module named below exists in this repository.

## Shape of the system

```text
                       ┌──────────────────────────── browser ────────────────────────────┐
  user entry / CSV ───▶│ LogModal, Settings ─▶ lib/storage.ts ─▶ localStorage             │
                       │                            │  (validate, atomic import, export)   │
                       │                            ▼                                     │
  synthetic fixture ──▶│ data/demo.ts ────────▶ lib/context.tsx ── (workspace state) ──┐   │
  (888 records)        │                            ▲                                   │   │
                       │                            │                                   ▼   │
  public/data/         │ compute/engine.ts ◀────────┴──────────────▶ pages/*  (11 routed views)│
  osd575.json  ───────▶│  RULE_VERSION PROHOR-IQR-3.0               components/*  (SVG atlas, │
  (531 observations)   │  quantile · getBaseline · assess            charts, dialogs)       │
                       └───────────────▲──────────────────────────────────────────────────┘
                                       │ relative fetch, no credentials
                       ┌───────────────┴──────────────────────────────────────────────────┐
                       │ server/feeds.mjs  (or api/feeds.mjs on Vercel)                   │
                       │ allowlist: studies | space-weather · TTL cache · schema check    │
                       │ OFFLINE=1 → serve the dated snapshot in public/data/, no network │
                       └───────────────▲──────────────────────────────────────────────────┘
                                       │ outbound, read-only, 9 s timeout
                          NASA OSDR (OSD-575/569/87)      NOAA SWPC (planetary Kp)
```

## Four pathways, in plain text

No diagram tooling is required to read this. The four pathways are four **separate data
contexts**; the app never blends one into another, and neither should a reader.

### A. Synthetic demo record or your own entry → baseline → rule → explanation

1. `src/data/demo.ts` (synthetic, labelled TODAY / SYNTHETIC) or the entry form produce a
   reading `{mode, crew, signal, value, unit, day}`.
2. `src/lib/context.tsx` holds workspace state; readings persist through `src/lib/storage.ts`.
3. `src/compute/engine.ts` takes the 30 distinct **prior** days for that `(mode, crew, signal)`,
   computes median/IQR and coverage, applies `PROHOR-IQR-3.0`, and returns state, delta, window,
   rule id and the source readings that fed it.
4. The view prints the flag, the sample count, the rule sentence and those same source readings;
   the care plan attaches one routine step. The explanation is the computation's own output, not
   a second opinion generated afterwards.

**Boundary:** the demo record is synthetic and the rest is self-entered. The arithmetic is real;
the data behind it is not NASA's and not a patient's.

### B. NASA OSDR OSD-575 → evidence view (research context, never your baseline)

1. `public/data/osd575-submitted.csv` is the original download; `source-manifest.json` pins its
   SHA-256 and byte length; `.gitattributes` keeps CSVs binary so line-ending translation cannot
   break the hash.
2. `src/compute/research.ts` parses without imputation — censored and non-numeric cells stay as
   raw text next to their source row number.
3. `src/pages/Evidence.tsx` re-hashes the file in the browser, compares it to the manifest, then
   shows four coded subjects and their pre-flight recomputation.

**Boundary:** 531 rows, four crew, one short flight. A hash match proves the bytes are the
published bytes — it is not clinical validity, not representativeness, and not a threshold
source. No value from this pathway enters a crew member's baseline.

### C. NOAA Kp + OSDR study metadata → adapter → dated snapshot fallback

1. The browser calls `/api/feeds?feed=…` with a relative URL and no credentials.
2. `server/feeds.mjs` (or `api/feeds.mjs` on Vercel) allowlists `studies` and `space-weather`,
   enforces a 9 s timeout, validates the payload shape, caches with a TTL, and preserves the
   observation time on cache hits.
3. On network or validation failure, `src/lib/feeds.ts` falls back to the dated snapshot under
   `public/data/` and labels it as a snapshot; a shape failure surfaces an error rather than
   substituted values.

**Boundary:** planetary Kp is geomagnetic context. It is not radiation dose, not absorbed dose,
and not an EVA or fitness-for-duty input. OSD-569/571 arrive as metadata only.

### D. Your readings → localStorage (unencrypted, this device only)

1. Writes are atomic: the full payload is validated and a partially invalid import is rejected.
2. There is no encryption. Anyone with access to this browser profile or machine can read the
   records. There is no account, no sync and no server copy.
3. Export and erase are explicit — CSV/JSON download, confirmation before deletion. Handover
   packets are generated locally and downloaded; nothing is transmitted.

**Boundary:** do not type identifiable real medical records into a shared machine. "Local-first"
is a privacy property of _where_ data goes, not a claim of secure clinical storage.

## Modules

| Path                            | Responsibility                                                               | Deliberate constraint                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `src/compute/engine.ts`         | Quantiles, unit normalisation, prior-day baseline, assessment, domain rollup | Pure functions, no I/O, no randomness, no clock reads. `RULE_VERSION` is stamped into exports |
| `src/compute/research.ts`       | Normalises the OSD-575 archive for the evidence view                         | Never imputes; non-numeric and censored values stay as raw text with source row numbers       |
| `src/compute/feedValidation.ts` | Shape checks on NASA/NOAA payloads                                           | A failed validation surfaces as an error, never as substituted data                           |
| `src/lib/storage.ts`            | localStorage schema, validation, CSV parse/export, backup, quota errors      | Atomic: a partially invalid import is rejected, not partly applied                            |
| `src/lib/context.tsx`           | Single workspace state, mode/profile/day isolation                           | Demo baselines are never inherited by a local workspace                                       |
| `src/lib/feeds.ts`              | Hook that prefers `/api/feeds`, falls back to the dated file                 | Failed network ⇒ visible "snapshot" label, not silence                                        |
| `src/components/BodyAtlas.tsx`  | Interactive anatomy + skeleton, 6 systems                                    | Schematic illustration with proxy labels; not imaging                                         |
| `src/pages/*`                   | Eleven routed view modules (twelve panels with the expanded health atlas)    | Each view owns its own limitation copy                                                        |
| `server/feeds.mjs`              | Read-only same-origin adapters, allowlist, TTL cache                         | No auth, no writes, no proxying of arbitrary URLs                                             |

## The one calculation that matters

```
inputs : readings for (mode, crew, signal), target day D
baseline: median + IQR over the last 30 DISTINCT prior days, D excluded
coverage: < 7 days → "insufficient"   ·   ≥ 21 days → "established"
flag    : |current − median| > max(configured floor, k · IQR)
output  : state, delta, coverage, window, rule id, source rows
```

`compute/engine.ts` exports exactly these steps so `tests/engine.test.ts` (61 checks) can assert
them: same-day duplicates cannot manufacture maturity, an invalid latest reading is not masked by
an earlier valid one, missing values are excluded rather than zero-filled, and threshold equality
does not flag.

## Trust boundaries

1. **Personal data never leaves the browser.** No telemetry, no analytics, no runtime AI call.
2. **The server only fetches.** Two allowlisted public feeds, validated, cached, with the
   observation time preserved and never relabelled on a cache hit.
3. **Bytes are verified, not trusted.** `public/data/source-manifest.json` records SHA-256 and
   byte length; `scripts/prepare-data.py` refuses to run if the CSV does not match, and the
   evidence view re-verifies in the browser.
4. **`.gitattributes` pins the CSVs as binary** (`*.csv -text`) so a clone cannot silently rewrite
   line endings and break that hash check.

## Build and packaging

```text
vite build → web/  (content-hashed assets)
scripts/build-sw.mjs → web/sw.js  (precache built app, data and judges' resources; API never cached)
server/start.mjs → static files + /api/feeds      [Node]
api/feeds.mjs     → same handler as a Vercel function
python3 -m http.server --directory web            [static-only fallback]
```

`web/` is committed on purpose: it lets a reviewer open the app without a toolchain. CI
therefore does three things rather than trusting the folder: it rebuilds `web/` and fails if the
result differs from the committed bytes, it smokes the built server plus both feed endpoints, and
a separate job drives the committed build in headless Chromium against the offline snapshots.

## What is not here

No database, no accounts, no server state beyond a TTL cache. That is a scope decision, not an
omission: a prototype that claims multi-user sync and clinical audit without a backend is worse
than one that says plainly it is single-user and local.
