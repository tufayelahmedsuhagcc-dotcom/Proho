# Methodology and scientific boundaries

**Rule version:** `PROHOR-IQR-3.0` · **Application:** 3.0.0

PROHOR detects changes under an explicit prototype rule. It does not detect disease, predict an adverse event, prescribe treatment or establish fitness for duty. A stable but unhealthy baseline can produce no alert. Symptoms and approved mission procedures take precedence.

## 1. Personal observation pipeline

1. Select one workspace mode, crew/profile, signal and flight day.
2. Preserve the entered value/unit, context note, timestamp and identifier.
3. Convert supported alternate units to a canonical unit.
4. Apply finite-number, supported-range and ordinal checks. These checks define software support, **not medical safety ranges**.
5. For each prior day, select the observation with the latest `recordedAt`; the last input row wins an exact timestamp tie. Do not average repeated measurements or count them as extra baseline days.
6. Exclude missing, invalid and non-finite values. No zero filling or other imputation is performed.
7. Compute the comparison only when at least seven distinct prior days are usable.

A valid new local record automatically switches to `LOCAL-01`. The synthetic fixture is not copied into personal storage. NASA archive records are never passed to the personal-baseline engine.

## 2. Baseline window

- **Local inputs:** flight days `d−30` through `d−1`, inclusive. Current and future days are excluded.
- **Synthetic replay:** a frozen enrollment period, FD 111–140, for scenario days 142–147. This makes the planted scenario reproducible instead of letting it redefine its own comparison baseline.
- **7–20 usable days:** provisional comparison.
- **21–30 usable days:** labeled established.
- **Fewer than 7 days:** building baseline; no numerical change classification.

These maturity labels are developer design choices, not clinical confidence intervals. Coverage is `usable distinct prior days / 30`; it is not data accuracy or diagnostic probability.

## 3. Quantiles and change band

Sort the usable values. For quantile `q`, use linear interpolation at `(n−1)q`:

```text
median = Q(0.50)
IQR    = Q(0.75) − Q(0.25)
width  = max(1.5 × IQR, signal-specific noise floor)
low    = median − width
high   = median + width
```

This is a **median-centered prototype band**, not Tukey's quartile-centered boxplot fences and not a statistically calibrated clinical interval. A value strictly outside the relevant side triggers `Review change`; equality does not. The `1.5` multiplier, floors, minimum sample count and directional choices are unvalidated developer choices.

The trend chart shades the **IQR (middle 50%)**, not the wider change band. Its caption explicitly names that distinction. Exact band values are shown in the explanation panel. Gaps in observations remain gaps in charts.

### Signal definitions

| Key | Canonical unit | Supported input bounds | Noise floor | Flag direction |
|---|---|---:|---:|---|
| `hr` | bpm | 20–250 | 7 | Both |
| `hrv` | ms, RMSSD | 1–300 | 10 | Lower only |
| `sleep` | hours | 0–24 | 1 | Lower only |
| `spo2` | % | 50–100 | 2 | Lower only |
| `temp` | °C | 30–45 | 0.5 | Both |
| `systolic` | mmHg | 40–300 | 15 | Both |
| `diastolic` | mmHg | 20–200 | 10 | Both |
| `glucose` | mg/dL | 10–1000 | 15 | Both |
| `mood` | integer 1–5 | 1–5 | 1 | Lower only |
| `fatigue` | integer 1–5 | 1–5 | 1 | Higher only |
| `exercise` | minutes | 0–480 | 25 | Lower only |
| `co2` | mmHg | 0–20 | 0.6 | Higher only |

**Do not use these bounds as healthy ranges, emergency cutoffs, medical targets or spacecraft limits.** For one-sided rules, a change in the other direction is not flagged. No physiological quantity here should be interpreted without measurement context.

Conversions: sleep minutes ÷ 60; °F → `(F−32)×5/9`; glucose mmol/L × 18.0182 → mg/dL. Canonical values are rounded to four decimals; source values/units are retained. HRV must be RMSSD, not a mixture of RMSSD and SDNN. ppm-to-mmHg CO₂ conversion is not offered without cabin pressure. Blood pressure components are logged separately and are not classified into clinical categories.

## 4. States and system aggregation

- **No reading:** absent/null/missing current observation; never inferred to be normal.
- **Check input:** invalid current observation excluded from analysis.
- **Building baseline:** insufficient prior data, or a body system with incomplete signal coverage.
- **Review change:** supported current value exceeds the declared directional rule.
- **Within baseline:** no rule-level change. This does not establish good health or exclude an urgent problem.

A system shows a change if any included indicator changes; otherwise input-review takes priority, then missingness/learning. A completely missing system is labeled No reading. This aggregation is not an organ risk score.

The SVG is a **schematic navigation aid**, not a scan or validated anatomical model. Brain highlighting summarizes sleep/mood/fatigue; lung highlighting summarizes peripheral SpO₂; muscle/bone highlighting summarizes exercise adherence. None measures the pictured organ's structure. Colors are paired with text and icons and are not the sole way to read status.

## 5. Synthetic scenario

`src/data/demo.ts` generates **888 records**: two profiles × 37 flight days × 12 signals. It is deterministic; it does not use random sensor traffic or a real astronaut database.

- CDR-01 FD 142: nominal fixture, no change flags.
- FD 143: shorter sleep.
- FD 144: shorter sleep, fatigue/HRV changes.
- FD 145–146: several co-occurring changes. FD 146 has exactly five flagged indicators: HR, HRV, sleep, fatigue and exercise.
- FD 147: nearer the enrollment baseline, no rule-level change flags.
- MS-02: deliberately absent HRV and intermittent missing SpO₂.

Replay advances one day per 3.5 seconds when played. It is a narrative over daily measurements, **not a physiological time-series stream**. The final day does not establish that any action caused recovery. No cross-signal causal model is implemented.

## 6. Historical NASA research computation

Source: **OSD-575**, Inspiration4 submitted comprehensive metabolic panel. The browser independently parses the original CSV with PapaParse and verifies SHA-256 where Web Crypto is available. A hash mismatch blocks archive analysis. On an insecure/unsupported browser, checksum unavailability is explicitly displayed rather than falsely claiming verification.

The preserved table contains 531 rows, 19 analytes, four coded subjects and seven categorical sampling points: L−92, L−44, L−3, R+1, R+45, R+82, R+194. L is days before launch and R days after return. Charts use **categorical spacing**, not a continuous mission timeline. Lines guide the eye and are not observations between samples.

For a selected subject/analyte, compute the median of its finite pre-flight values, then show each value minus that median. Three observations are descriptive, not an established clinical baseline. Laboratory reference intervals remain source metadata, not PROHOR thresholds.

Reproducible glucose checks:

| Subject | Pre-flight median | R+1 value | R+1 delta | R+45 value |
|---|---:|---:|---:|---:|
| C001 | 80 | 90 | +10 | 84 |
| C002 | 72 | 83 | +11 | 44 |
| C003 | 75 | 103 | +28 | 36 |
| C004 | 83 | 97 | +14 | 43 |

All values are mg/dL. See the source rows and executed unit tests; do not infer fasting state from the table. At R+45, three distinct subjects fall below their source laboratory intervals (65–99). The explorer computes this shared pattern when at least three distinct subjects depart on the same side. It is a **source/study-context review cue**, not a diagnosis, automatic data invalidation or proof of a spaceflight effect.

Race-labeled legacy eGFR fields are preserved in raw files but excluded from the comparison menu. No threshold is derived from the optional animal-study metadata. Four people on a three-day mission do not validate long-duration crew monitoring.

## 7. Environmental context

The public adapter fetches NOAA SWPC planetary Kp. It validates finite values in [0,9], interpretable observation timestamps and supported object/header-array response formats. It never converts Kp to a radiation dose. Observation time and retrieval time are displayed separately. A successful network request does not make an old observation current.

The UI's six-hour freshness label is an interface convention, not an operational forecast, exposure alarm or mission safety limit. NOAA is a U.S. agency distinct from NASA; attribution is kept explicit.

## 8. What NASA references do and do not support

NASA HRP hazards, Standard Measures and sleep-risk material inform the workflow, measurement-context prompts, transparent data handling and need for human review. They do **not** endorse PROHOR's numbers, floors, actions or anatomy colors. The routine prompts are static, conservative reminders to follow approved plans—not treatments.

No clinical trial, prospective validation, sensitivity/specificity estimate, regulatory assessment, hazard analysis for flight operations or clinician review has been completed. Software test success is not scientific validation.
