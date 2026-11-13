# Roadmap

This is a list of work that is **not done**, written so a reviewer can tell the difference between
what exists and what is intended. Nothing here has a promised date, a funder, or a clinical partner.
Anything that touches thresholds, health claims or validation requires people who are not on this
team, and would be raised as a proposal before it becomes code.

Guiding rule: PROHOR stays a **non-diagnostic, local-first explanation layer** for a human decision.
Features that would require it to become a medical device, a diagnostic, or a cloud health-record
system are out of scope, not "later".

## Now — correctness and honesty of what already exists

- [ ] Keep the committed `web/` build in parity with source. CI already rebuilds and diffs it; the
      next step is ensuring every PR that touches `src/`, `public/` or the service-worker script
      rebuilds before merge.
- [ ] Get the `browser-smoke` CI job green on the maintainers' machines and CI at least once, and
      attach a dated run to [docs/TEST-REPORT.md](docs/TEST-REPORT.md).
- [ ] Re-run the axe-core sweep after the video/slide additions and publish that run in
      [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) with its date and build hash.
- [ ] Replace the hand-maintained view/route counts in prose with a single source of truth so the
      README, ARCHITECTURE and SUBMISSION cannot drift apart again.
- [ ] Audit every remaining absolute claim in user-facing copy (for example "Nothing is a
      mock-up") and make sure the sentence around it names synthetic data explicitly.

## Next — study the rule before extending it

- [ ] **Sensitivity analysis** of `PROHOR-IQR-3.0`: how often does the flag fire on the synthetic
      fixture and on OSD-575 subjects across reasonable floors and `k` values? Publish the table
      rather than a single recommendation. This is analysis of a heuristic, not validation.
- [ ] **Baseline robustness**: quantify what happens when days are missing, units are mixed, or a
      crew member has fewer than seven prior days. The engine already refuses in those cases; the
      roadmap item is to show how often the refusal happens in realistic logging patterns.
- [ ] **Reviewer mode**: a read-only, shareable export of one handover packet (already a local file)
      with an explicit "synthetic / local / research" label per section, so a flight surgeon can
      check the provenance without the app.
- [ ] **Accessibility follow-through**: a session with at least one screen-reader user, then fixes
      filed as defects. Automated scans are not a substitute.

## Later — requires partners and approvals

- [ ] **Clinical review of the rule** by a flight surgeon or equivalent, with the outcome recorded
      as a written statement about what the tool may and may not be used for. Until that exists,
      nothing in this repository may be described as validated.
- [ ] **Data expansion**: additional OSDR studies with an explicit inclusion/exclusion rationale,
      kept in the research context and never wired into a personal baseline.
- [ ] **Encryption at rest** for local records (user-held key), which is a prerequisite for any
      discussion of real crew data — see pathway D in
      [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- [ ] **Longitudinal evaluation** with real users over mission-like durations, pre-registered, with
      a stated failure criterion for the tool.

## Explicitly not planned

- Runtime AI or LLM-generated health advice.
- Telemetry, analytics, or uploading health data to any server.
- Radiation-dose estimation from Kp or any other proxy.
- Fitness-for-duty, diagnosis, treatment or triage recommendations.
- Claims of NASA endorsement, astronaut use, clinical validation, or WCAG certification.

## How to influence this list

Open an issue using the **Scientific or data concern** template if something here is wrong or
missing on scientific grounds, or **Feature request** for scope suggestions. Data-boundary problems
are treated as correctness bugs, not polish.
