# Contributing

PROHOR is a research prototype submitted to the 2026 NASA Space Apps Challenge. The rules that
keep it honest are simple, and a pull request that breaks one will be declined even if it looks
nicer.

## Ground rules

1. **No invented data.** Every number on screen must be traceable to a user entry, the labelled
   synthetic fixture, an original NASA/NOAA byte in `public/data/`, or a deterministic function
   of those. No placeholder "live" feeds, no fabricated device states.
2. **No clinical claims.** No diagnosis, treatment or dosing advice, radiation-dose estimate,
   fitness-for-duty decision, or health score. A flag is a prompt to review, never a verdict.
3. **Say what the data is made of.** Any new comparison must expose its window, sample count,
   direction and limitations next to the result.
4. **No new network surface for personal data.** Readings stay in the browser. External requests
   are limited to the read-only public-data feeds.

## Developing

```bash
npm ci
npm run dev          # http://localhost:5173
npm run typecheck
npm test
npm run build
npm run format       # Prettier; run before opening a PR
```

If you change `src/`, `public/` or configuration, rebuild and commit `web/` in the same change —
the prebuilt directory is part of the deliverable.

## Scientific or methodological changes

Changes to the baseline window, change floors, direction rules or indicator set need an update to
[docs/METHODOLOGY.md](docs/METHODOLOGY.md) and a test in `tests/` that fails before the change.
Cite a source for any new threshold; "it felt reasonable" is not a source.

## Reporting a problem

Open an issue with the view, the crew/day/mode selection, and what you expected instead. If the
problem is a misleading claim rather than a bug, say so plainly — that is the most valuable kind
of report this project can receive.
