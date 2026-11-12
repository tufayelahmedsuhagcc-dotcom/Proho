# Executed test report · PROHOR 3.0

This is a record of tests actually run against this implementation — not a proposed test plan.
The full suite is reproducible with the commands in [the README](../README.md#verification).
Passing these scans is not formal accessibility certification and says nothing about clinical
effectiveness.

## Summary

**127 unit tests, 48 end-to-end checks, 36 hardening checks, 22 route/viewport observations and
34 theme-specific checks passed.** Eleven desktop and eleven mobile view scans plus seven
dialog/menu state scans reported no violations in the configured axe rules. Formatting,
TypeScript, production build and dependency audit were rerun on the final build. The
API, upstream, development-server and static-hosting checks were run against the functionally
identical earlier build of the same source; those integrations were not all re-executed for the
interface revision.

## Full suite summary

| Check | Actual result |
|---|---|
| Clean dependency installation (`npm ci`) | Passed |
| TypeScript (`npm run typecheck`) | Passed |
| Formatting (`npm run format:check`) | Passed |
| Production build | Passed; app generated in `web/` |
| Automated unit/adapter tests | **127 passed, 0 failed**, five test files |
| Main end-to-end workflow | **48 checks passed** |
| Browser hardening, mobile accessibility and 320px layout | **36 checks passed** |
| Desktop/mobile route sweep | **22 route/viewport checks**, no uncaught page errors or page-level horizontal overflow |
| Accessibility | **Zero axe violations in 11 desktop + 11 mobile view scans** for the configured WCAG 2 A/AA and 2.1 AA rules |
| API integration | Five method/path cases passed: 200, 200, 400, 405, 404 |
| Public upstream fetch | NASA metadata and NOAA Kp each returned a real validated network response in the recorded fresh-process check |
| Legacy deep routes | Six paths resolved to the expected view |
| Development server | App rendered, API returned data, Vite HMR connected on the same port; zero uncaught page errors |
| Static-only build | Python HTTP server, absent API, visible dated fallback, verified NASA CSV and true offline reload all passed |
| Printable handover | One-page PDF generated; extracted text contains the entered context and rule version |
| Dependency audit | **0 reported vulnerabilities** at the final check, including development dependencies |

Counts overlap intentionally: the 36 hardening checks include the eleven mobile axe scans and eleven 320px checks. Do not add every row as if each were a distinct test. The 84 browser workflow/hardening checks are 48 + 36; the separate route sweep adds route/viewport observations.

## Environment

- Node.js **20.20.2**, npm **10.8.2**.
- TypeScript/Vite production build; React 19; Vitest 4.1.12.
- Python 3.13.16 with Playwright Chromium and axe-core 4.11.0.
- Desktop: **1440×1050** in route sweep, 1440×1000 in workflows.
- Mobile layouts: **390×844**, plus **320×720**.
- Node production app bound to `0.0.0.0:3000`; automated runner used loopback locally. The browser app itself uses relative API/asset URLs.
- Development smoke check: port 5173. Static-only smoke check: port 3001. Those temporary check servers were stopped; the production preview remains the main app.

Use a maintained Node LTS for public hosting. The environment version above records what was tested, not a recommendation to use an unsupported runtime indefinitely.

## 1. Numerical and state tests

`tests/engine.test.ts` — 61 checks:

- Interpolated quantiles and non-mutating input behavior.
- Empty/non-finite data rejection and quantile bounds.
- Alternate-unit normalization, finite input, each signal's supported bounds and whole-number ordinal values.
- Current/future exclusion, mode/profile/signal separation and prior-window boundaries.
- Seven distinct prior days required; repeated same-day samples cannot manufacture maturity.
- Latest same-day observation selected; an invalid latest reading is not hidden by an earlier valid one.
- Missing values excluded without zero imputation; missing current data is not reassuring.
- Cold-start local user does not inherit a demo baseline.
- Threshold equality, zero-spread floor and planted change behavior.
- FD 142 nominal, FD 146 five-signal change, FD 147 nearer-baseline fixture.
- Partial-sensor profile exposes incomplete coverage.

`tests/storage.test.ts` — 24 checks:

- Initial empty local readings, round-trip persistence and original-unit preservation.
- Malformed storage not erased; quota failure propagated.
- Backup version, units, values, duplicate IDs, source mode, workspace identity and demo-day validation.
- Quoted/multiline CSV, legitimate zero, blank rejection, atomic invalid-row rejection and row cap.
- Spreadsheet-formula escaping on export.

`tests/research.test.ts` — 11 checks:

- Original source SHA-256.
- **531 rows, 19 analytes, four subjects**.
- C001 pre-flight glucose median **80**.
- R+1 glucose deltas: C001 **+10**, C002 **+11**, C003 **+28**, C004 **+14** mg/dL.
- R+45 shared low-source-interval pattern counts **three of four distinct subjects**, not duplicate rows.
- Non-numeric/censored values retained as raw text and excluded from arithmetic.

`tests/feeds.test.ts` — 10 checks:

- NOAA object/header-array representations and observation ordering.
- Blank/missing/out-of-range values and invalid times rejected.
- Dated forced-offline fallback for both feeds.
- Non-allowlisted feed rejected.

`tests/hardening.test.ts` — 21 checks:

- Real bundled response shapes accepted; malformed envelopes, timestamps and unsafe library URLs rejected.
- Boolean Kp not coerced to one; timezone-offset ordering uses actual instants.
- Upstream 503 and changed NASA schema produce explicit dated fallbacks.
- CSV does not promote exported simulation/invalid records into valid local observations.
- Optional recordedAt preserved/validated, non-finite quantile parameter rejected and directional rule behavior explicit.

## 2. Main end-to-end workflow

`tests/e2e.py` exercised the production build, not just development:

1. Waited for service-worker control and verified default simulation labeling.
2. Selected systems and skeleton layer; changed crew/day and verified recalculated states.
3. Opened/dismissed the reading dialog; rejected an impossible value without persisting it.
4. Saved sleep minutes → canonical hours, changed to the separate local workspace and reloaded successfully.
5. Saved only selected optional check-in fields and checked that HTML-like notes are not executed.
6. Blocked an invalid CSV atomically; required confirmation for a valid import.
7. Built a local baseline from 30 prior days, then detected a new local change.
8. Persisted a routine action after reload.
9. Downloaded and inspected JSON/text handovers, verified user notes and no-transmission wording, and generated PDF.
10. Downloaded backup, deleted a local record, then restored the complete validated backup after confirmation.
11. Verified NASA source integrity in-browser, switched subject/analyte, filtered the library and inspected the computed shared pattern.
12. Aborted API traffic and observed the dated fallback.
13. Switched the actual browser context offline, reloaded, used NASA raw-file analysis and saved another local reading.
14. Played/paused/reset the mission replay without deleting personal records.
15. Exercised mobile navigation and checked viewport overflow.
16. Recorded **zero health POST requests** and **zero uncaught JavaScript errors** in these flows.
17. Seeded corrupt browser storage; verified ordinary changes could not overwrite it; explicitly reset via confirmation.

## 3. Hardening and accessibility

`tests/browser_hardening.py` verified keyboard selection on the anatomy, dialog focus restoration, Ctrl+K search, chart arrow-key readouts and a tabular alternative. It checked empty-workspace pagination, persisted reduced motion and storage updates between two browser tabs.

Negative paths included malformed HTTP-200 API JSON and altered NASA CSV bytes. Malformed feed data fell back visibly; the altered source failed its checksum and the archive chart was blocked.

Mobile navigation is hidden from focus when closed. When open it makes the background inert, contains Tab/Shift+Tab focus, closes with Escape and restores focus. Each of the eleven views then passed the configured mobile axe scan and 320px overflow check. A prior scrollable-table focus violation was fixed before the final run.

`tests/browser_sweep.py` additionally checked every view at desktop and 390px width, saved representative screenshots, scanned desktop accessibility and failed if it encountered a recorded violation, overflow or page error.

**Limit:** zero automated violations is not a WCAG certification. Manual screen-reader testing, real-device motor/vision usability, cross-browser and clinical human-factors studies remain necessary.

## 4. API and source checks

`tests/api_integration.py` tested:

```text
GET  /api/feeds?feed=studies                → 200, valid live/cached envelope
GET  /api/feeds?feed=space-weather          → 200, valid live/cached envelope
GET  /api/feeds?feed=https://example.org    → 400
POST /api/feeds?feed=studies                → 405
GET  /api/unknown                          → 404
```

A separate fresh-process check fetched real NASA and NOAA responses. Later API hits may correctly say cached because of the server TTL. Retrieval time is not relabeled on cache hits, and network success is not observation freshness.

Reference-link checks returned HTTP 200 for the NASA research/HRP links, Nature context and NOAA documentation (with its current redirect). Python requests encountered a local certificate-chain verification error at the Space Apps challenge URL; that page had been successfully read through the page-fetching tool. This is recorded as an environment access issue, not falsely reported as a validated HTTP 200 from that checker.

## 5. Build, offline and delivery checks

- Clean install and typechecked production build succeeded after dependency upgrades.
- Final entry bundle: approximately **472.48 kB** uncompressed, **144.60 kB gzip**, as reported by Vite. This is bundle size, not a Lighthouse/load-time benchmark.
- Service worker precaches **28 files** including local fonts, raw research data, icons, manifest and license notices. It excludes the API.
- Static-only serving was actually tested, not merely inferred: the absent backend returned 404, the client displayed the correct dated snapshot, the original NASA CSV verified and offline reload succeeded.
- The repository contains no installed dependencies, credential files or scratch caches; `npm ci` reproduces the tested dependency tree from the committed lockfile.

## Saved artifacts

Every check above is reproduced by the commands in the README and writes its own machine-readable
result. Representative actual-render screenshots of the shipped build are in
[`docs/screenshots/`](screenshots/); the printable handover sample used in testing contains
synthetic fixture content, not a real patient record.

## Not tested or not claimed

- Clinical efficacy, medical sensitivity/specificity, diagnosis, treatment, prediction, astronaut outcomes or fitness for duty.
- Real sensors, spaceflight hardware, medical-device certification, authentication, encryption or remote sync.
- Formal penetration testing, concurrency/load testing or multi-user operational reliability.
- Exhaustive Safari/Firefox, assistive-technology or real mobile-device coverage.
- External Vercel deployment, hosting-account configuration or permanent public submission URL.
- Any third-party algorithm, external backend or hosted service not included in this repository.
- NASA acceptance, eligibility or a guaranteed competition result.

The app is ready to run and review within its stated prototype scope. Passing these tests must not be presented as medical, regulatory or NASA approval.
