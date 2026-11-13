# Draft release notes — PROHOR v3.1.0 (not released)

**Status: draft only.** No tag, no GitHub release, no deployment was created for this text. It
exists so that whoever ships the branch has copy ready, and so the change set is reviewable as
prose.

Branch: `review/2026-11-12-hardening` · base commit `7f14346` · proposed version `3.1.0` (minor:
new media surfaces and CI, no breaking API or data-schema change).

## Suggested title

`v3.1.0 — Films, seven-slide deck, and a build check that actually checks`

## Highlights

- **Two recorded films, in the repository.** `public/media/prohor-30-second.mp4` (29.90 s,
  1920×1080, mono narration, burned-in captions) and `prohor-four-minute.mp4` (3:49.5). Both ship
  with `.srt` subtitles, plain-text transcripts and poster frames. They play in the overview and on
  the judges' page, stream on demand, and are deliberately excluded from the offline precache.
- **Seven-slide deck in-app.** `public/docs/PROHOR_Seven_Slide_Presentation.pdf`, with the same
  seven slides as keyboard-operable images in the judges' view and a slide-by-slide live region.
  The deck is the primary artefact; the films are optional supporting material.
- **CI now proves the committed build.** The step previously named "verify the committed build
  matches a fresh build" only checked that three files existed. It now rebuilds `web/` and fails on
  any modified, deleted or untracked file, printing the differences and the one-line fix.
- **A browser smoke job and a manual accessibility job.** Playwright workflows run against
  `OFFLINE=1` snapshots on every PR, upload logs and JSON reports as artifacts, and leave the tree
  clean; the slower axe-core sweep is `workflow_dispatch` only.
- **Documentation corrections.** Eleven routed views everywhere (twelve panels with the expanded
  health atlas); the personal-baseline vs NASA-research boundary restated in README, SUBMISSION and
  ARCHITECTURE; ARCHITECTURE now walks the four data pathways in plain text, with no diagram
  tooling required; ROADMAP.md, issue templates and a conservative Dependabot config added.

## Fixes and honesty passes

- SUBMISSION.md no longer implies that a flag traces to a NASA row. Your readings (typed or
  synthetic demo) feed the baseline; OSD-575 is a separate hashed research view.
- Unit-test count corrected to 128 (five files).
- "Nothing is a mock-up" is now qualified: the records are synthetic, the computation is real.
- The 30-second demo row in SUBMISSION.md no longer says "add link"; it points at the file in the
  repository and states that the public URL only exists after deployment.
- `public/media/` and `public/slides/` are excluded from the service-worker precache, so an offline
  install no longer implies a 20 MB download.

## Verification for this draft

Run on 2026-11-12 in a Linux container (Node v20.20.2): `npm ci`, `npm run format:check`,
`npm run typecheck`, `npm test` (128 passing), `npm run build` (precache 47 files), plus
`OFFLINE=1 npm start` asset smoke. Browser suites were **not** executed in that environment
(Chromium cannot launch); see [docs/TEST-REPORT.md](TEST-REPORT.md). Do not paste these notes into a
release until CI has run them.

## Compatibility

- No change to `RULE_VERSION` (`PROHOR-IQR-3.0`), thresholds, units or the storage schema. Existing
  local workspaces keep working.
- `web/` is rebuilt and committed; reviewers can still open it without a toolchain.

## Known limitations carried forward

Prototype, not a medical device. No diagnosis, dosing, radiation-dose estimate or fitness-for-duty
call. Demo records are synthetic. OSD-575 is four crew on one short flight, not a threshold source.
Local records are unencrypted and single-device. Passing tests are not clinical validation or WCAG
certification.
