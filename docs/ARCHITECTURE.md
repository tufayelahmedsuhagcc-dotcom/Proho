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
  public/data/         │ compute/engine.ts ◀────────┴──────────────▶ pages/*  (11 views)     │
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
| `src/pages/*`                   | Ten view modules (eleven views including the expanded atlas panel)           | Each view owns its own limitation copy                                                        |
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

`web/` is committed on purpose: it lets a reviewer open the app without a toolchain, and CI
asserts the committed build is present and that the server + both feeds answer.

## What is not here

No database, no accounts, no server state beyond a TTL cache. That is a scope decision, not an
omission: a prototype that claims multi-user sync and clinical audit without a backend is worse
than one that says plainly it is single-user and local.
