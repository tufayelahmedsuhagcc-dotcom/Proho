---
name: Feature request
about: Suggest a capability, a view or a workflow
title: "[feature] short description"
labels: enhancement
---

**Problem it solves** — describe the crew-side or reviewer-side situation, not the UI.

**Who it is for** — crew member, flight surgeon reviewing a handover, judge/reviewer, maintainer.

**Proposed behaviour** — what the user would do and see. Sketches welcome; screenshots of the
current state help.

**Data context** — which of these would it touch?

- [ ] Synthetic demo records
- [ ] Local user records (unencrypted `localStorage`, single device)
- [ ] NASA research data (display only)
- [ ] Public NOAA context
- [ ] None — tooling, docs, tests or accessibility

**Boundaries to check**

- [ ] It does not require diagnosis, dosing, radiation-dose estimation or a fitness-for-duty call
- [ ] It does not send personal health data off the device
- [ ] It does not add telemetry, analytics or a runtime model
- [ ] It can be explained from data the app already shows

**Alternatives considered** — including doing nothing.
