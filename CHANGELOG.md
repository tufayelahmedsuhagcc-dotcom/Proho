# Change log

Notes describe the shipped application. Release dates are deliberately omitted; the git history is the timeline.

## Judging polish update

- Added a three-step synthetic judging walkthrough on Mission overview, with a guard that keeps
  demo navigation from touching a local workspace whose storage warning is unresolved.
- Added a **Judges' resources** view: guided tour, a four-page project brief as a bundled PDF
  (open or download), and links to provenance, methodology and source.
- Bundled brief is part of the service-worker precache, so it survives an offline reload.
- Fixed a 320 CSS-pixel header overflow and raised several mobile touch targets to 44 px.
- Added real NASA **OSD-571** plasma-study metadata to the curated library, with a refreshed dated
  offline snapshot. Metadata only: no values reach the OSD-575 chart or a personal baseline.
- Linked the public repository from About.
- Added a judges' library alongside the brief: four separate three-page dossiers (mission & demo,
  data & evidence, technology & method, safety/impact/roadmap), each openable and downloadable,
  plus a single ZIP. All five documents and the ZIP are precached for offline use.
- Regression coverage: `tests/feeds.test.ts` asserts the OSD-571 snapshot entry (128 unit tests),
  and `tests/judges_resources.py` / `tests/judging_update.py` exercise the new view, the PDF
  download and 320/375/390 px layouts.

## 3.0.0 — white-build release

### Interface

- White/light surface system across all eleven views, with teal actions and restrained amber
  review states; semantic colour tokens centralised in CSS custom properties.
- Detailed interactive SVG anatomy and skeleton with numbered system hotspots, keyboard
  selection and a contextual evidence panel.
- Consistent navigation, command search, history/hash routing, per-view titles and legacy route
  aliases; mobile navigation, reduced-motion control and print styling.
- Locally bundled Inter and Space Grotesk; installable app manifest and icons.

### Working local workflows

- Validated single-reading entry and optional multi-indicator daily check-in, with unit
  normalisation and original units preserved.
- Local storage schema validation, quota and unreadable-storage handling, explicit recovery
  export and reset.
- CSV template and atomic import, spreadsheet-safe exports, validated JSON backup and restore.
- Cross-tab updates, profile/day/mode isolation, bounded logbook pagination.
- Routine done/deferred events and a structured handover packet (text, JSON, clipboard, print).

### Reproducible science

- Personal prior-day median/IQR engine with documented minimum coverage, direction rules and
  change floors.
- Deterministic 888-record synthetic fixture across two profiles and 37 days.
- Independent in-browser parsing of the original OSD-575 submitted CSV with SHA-256
  verification, four-subject comparison and source row references.
- Read-only NASA OSDR and NOAA SWPC adapters with timeouts, schema validation, allowlisted
  feeds, TTL cache and dated fallbacks.

### Durability

- Editable TypeScript source, production build, same-origin API, Vercel configuration and
  Node/Python hosting instructions.
- Content-hashed service worker that precaches the app, local fonts and research files; API
  responses are never silently cached.
- Unit tests, executable browser workflows, screenshots and a test report in `docs/`.

### Removed by design

- Fake live telemetry, decorative sensor/latency states and a sync queue with no endpoint.
- Simulated role-cookie authentication presented as access control.
- Unverified clinical claims, health scores, prediction probabilities and radiation-dose
  conversion.
- Runtime language-model dependency: explanations are deterministic and source-linked.
- Accounts, trackers, analytics and camera/microphone/location permissions.
