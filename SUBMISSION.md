# SUBMISSION · PROHOR

Everything a judge needs, and the exact text to paste into the Space Apps project page.

---

## 1. Identity

| Field                 | Value                                                                                                                                                                                                                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Project title**     | PROHOR — Mission Health Intelligence                                                                                                                                                                                                                                                                                             |
| **Tagline**           | A little farther from Earth. A little closer to you.                                                                                                                                                                                                                                                                             |
| **Challenge**         | [Create Health Monitoring Software for Astronauts on Space Missions](https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/)                                                                                                                                                                             |
| **Event**             | 2026 NASA Space Apps Challenge — _The Next Frontier_                                                                                                                                                                                                                                                                             |
| **Live prototype**    | https://prohor-rho.vercel.app                                                                                                                                                                                                                                                                                                    |
| **Source code**       | https://github.com/tufayelahmedsuhagcc-dotcom/prohor                                                                                                                                                                                                                                                                             |
| **Demo video (30 s)** | _add link_                                                                                                                                                                                                                                                                                                                       |
| **Judges' brief**     | [public/docs/PROHOR_Judges_Brief.pdf](public/docs/PROHOR_Judges_Brief.pdf) — four pages, also in-app under _Judges' resources_                                                                                                                                                                                                   |
| **Judges' library**   | Four source-linked dossiers in-app, or [ZIP](public/docs/PROHOR_Judges_Library.zip): [mission](public/docs/PROHOR_01_Mission_and_Demo.pdf) · [data](public/docs/PROHOR_02_Data_and_Evidence.pdf) · [technology](public/docs/PROHOR_03_Technology_and_Method.pdf) · [safety](public/docs/PROHOR_04_Safety_Impact_and_Roadmap.pdf) |
| **Slides (≤7)**       | [PROHOR_Deck_7slides.pdf](https://prohor-rho.vercel.app/docs/PROHOR_Deck_7slides.pdf) — also in the repo at [docs/demo/PROHOR-deck.pdf](docs/demo/PROHOR-deck.pdf)                                                                                                                                                               |
| **Licence**           | MIT (OSI-approved, as required for judging)                                                                                                                                                                                                                                                                                      |
| **Team**              | Skorpe Monad — five members, see §7                                                                                                                                                                                                                                                                                              |

**Suggested award category:** _Best Use of Data_ (strong alternative: _Best Use of Science_).
Reason: the differentiator is not the interface, it is that every flag is traceable to a
recomputed baseline and to a specific row of a NASA dataset that the user can inspect.

---

## 2. Paste-ready description

### One sentence

> PROHOR is an offline-capable health workspace that turns an astronaut's own readings into a
> transparent personal baseline, shows exactly why a change was flagged, and hands the crew
> member one conservative next step plus a review packet for the flight surgeon.

### Short description (~50 words)

> Astronauts on long missions must assess their own health with a delayed link to the ground.
> PROHOR records their readings, compares each one against a baseline built only from their own
> prior days, and shows the data coverage and rule behind every flag — then produces one routine
> action and an exportable handover for human review.

### Longer description (~150 words)

> On a long-duration mission a crew member cannot walk into a clinic, and a coloured dashboard
> is not a decision. PROHOR is a local-first health workspace built for that gap. A crew member
> records sleep, heart rate, SpO₂, temperature, mood, fatigue and other indicators; the app
> computes a personal median and interquartile range over distinct prior days, states how many
> days of data support the comparison, and refuses to reassure anyone when coverage is
> insufficient. Every flag opens the exact rule, the source readings and a body-system context.
> One conservative routine step follows, and a structured handover packet can be reviewed by a
> flight surgeon. The NASA evidence view parses the original Inspiration4 metabolic panel
> dataset in the browser, verifies its SHA-256 hash and recomputes the comparison in front of the
> user. Research prototype — not a medical device.

### Space agency partner data used

> **NASA OSDR OSD-575** (SpaceX Inspiration4 blood-serum metabolic panel and immune/cardiovascular
> panel; 531 published observations) — downloaded as original CSV, SHA-256 verified, parsed in the
> browser, recomputed for four coded subjects with source row numbers preserved.
> **NASA OSDR OSD-569** metadata for study context. **NASA Human Research Program** references on
> sleep, standard measures and the five hazards of human spaceflight. **NOAA SWPC** planetary
> K-index feed for the environmental context panel.

---

## 3. How it maps to the judging criteria

| Criterion        | Evidence in this project                                                                                                                                                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Impact**       | Targets the specific moment when a crew member is the only available assessor: a change that cannot wait for a delayed ground link. Reduces false reassurance (insufficient-data states are explicit) and reduces alarm fatigue (change floors, direction rules).                             |
| **Creativity**   | Inverts the usual "health dashboard" claim: instead of a score, PROHOR publishes its own uncertainty — baseline window, day count, missingness, rule direction — and makes the handover packet, not the alert, the product.                                                                   |
| **Validity**     | Deterministic, unit-tested engine (127 automated checks) with documented formula and floors in [METHODOLOGY.md](docs/METHODOLOGY.md); real, hashed, cited NASA/NOAA data; every limitation stated in-product; explicit boundaries (no diagnosis, no dose estimate, no fitness-for-duty call). |
| **Relevance**    | Directly answers the 2026 challenge statement's objectives — gather indicators, help the astronaut evaluate status, guide action, explain measurements to a non-specialist — and uses NASA Human Research Program material to choose and frame the indicators.                                |
| **Presentation** | Eleven coherent views, interactive anatomy, keyboard-operable controls, chart alternatives as tables, mobile and 320px layouts, offline install, 30-second demo path below.                                                                                                                   |

---

## 4. The 60-second demo path

Use this exact order; each step is a real, working interaction.

1. **Overview** — the _One reading. A clearer story_ guided tour, or start directly in Demo mission, CDR-01, flight day 146: five indicators under review, each with its delta and baseline day count.
2. **Health atlas** — select _Mind & recovery_: the panel states that sleep, mood and fatigue are check-ins, not brain measurements.
3. **Trends & baselines** — open the same signal: prior-day median, IQR band, coverage, and the literal rule that fired.
4. **NASA evidence** — pick glucose, then subject C001: original values, source row numbers, the recomputed pre-flight median of 80 mg/dL, and the shared interval caveat.
5. **Log a reading** — save it; the app switches to _Local workspace_ and reports insufficient prior data instead of borrowing the demo baseline. This is the honesty test.
6. **Care plan → Crew handover** — mark the routine done, add a note, export the review packet.

---

## 5. What we are _not_ claiming

Stated because it protects the crew it is designed for: PROHOR is a research prototype, not a
medical device. It does not diagnose, recommend treatment or dosing, estimate radiation dose,
clear a crew member for EVA, or replace a flight surgeon. Local storage is not encrypted and
supports a single user. The OSD-575 archive is four crew on one short flight and cannot establish
long-mission thresholds. No NASA endorsement is implied and no NASA mark is used.

## 6. AI-use disclosure

AI assistance (Arena.ai) was used during development and was reviewed rather than trusted: data
provenance is hashed, calculations are deterministic and unit-tested, and the executed test
record is included. There is no runtime AI service — no user reading leaves the browser, and the
product states this under _About → Privacy & attribution_. No watermarked AI imagery is used in
the submission.

---

## 7. Team — Skorpe Monad

_Five people. One working prototype. A clearer next step for crew health._

| Member                      | Role                                  |
| --------------------------- | ------------------------------------- |
| **Tufayel Ahmed**           | Team lead · main developer & designer |
| **Annapurna Das Protyasha** | Researcher · concept maker            |
| **Rakthim Deb Rudro**       | Advisor                               |
| **Mir Shahi Ahmad**         | Data scientist                        |
| **Tonusri Deb Diggi**       | Video & photo editor                  |

All members are registered and listed on the Space Apps team page (limit six). The advisor
contributes methodological review and is credited here; only registered participants count
towards the team size.

_Independent project. Not NASA software._
