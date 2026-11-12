## What changed

## Which invariant does this touch?

- [ ] No invented data (every number is traceable to an entry, the fixture, a NASA/NOAA byte, or a deterministic function of those)
- [ ] No clinical claim (no diagnosis, treatment/dosing, dose estimate, fitness-for-duty, health score)
- [ ] Comparison still exposes window, sample count, direction and limitation
- [ ] No new network surface for personal data

## Checks

- [ ] `npm run format:check`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`, and `web/` committed if source changed
- [ ] `docs/METHODOLOGY.md` updated if a window, floor or threshold moved
