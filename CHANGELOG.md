# Change log

Versions describe the delivered application, not a release calendar.

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
