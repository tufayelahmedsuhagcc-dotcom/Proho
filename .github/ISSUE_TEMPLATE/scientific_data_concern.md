---
name: Scientific or data concern
about: A number, threshold, dataset, citation or data-boundary statement looks wrong
title: "[data] short description"
labels: science, data
---

Concerns about scientific validity are treated as correctness bugs in this project, not as style
preferences. Thank you for reporting one.

**Where** — file, view or document (e.g. _docs/METHODOLOGY.md_, _NASA evidence view_, _README
"At a glance"_).

**The claim as written** — quote it exactly.

**What you think is wrong** — be specific: unit mismatch, window off by one, wrong denominator,
censored value silently imputed, a research row presented as a threshold, an unsupported citation.

**What supports your reading** — a source, a derivation, or a reproducible input. If it is a
calculation, include the numbers you used.

**Which data context is involved**

- [ ] Synthetic demo records (`src/data/demo.ts`)
- [ ] User-entered / imported measurements
- [ ] Historical NASA research data (OSDR OSD-575 / 569 / 571)
- [ ] Public Earth context (NOAA SWPC Kp)
- [ ] Documentation only

**Severity** — does this mislead a reader about health meaning, or is it an accuracy nit?

**Note on scope** — this project cannot adopt a change that turns a heuristic into a clinical
threshold, or that adds a diagnostic, dosing or dose-estimate claim, without external clinical
review. Proposals in that direction will be discussed, not silently implemented.
