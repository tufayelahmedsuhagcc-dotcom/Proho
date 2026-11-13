# Accessibility

Written because a health tool that only works for some crew members is not a health tool. This
page states what was implemented, what was actually measured, and what remains unverified.

## Implemented

- **Keyboard first.** Every interactive control is reachable and operable by keyboard, including
  the anatomy hotspots, which are buttons with visible focus rings and an explicit selected state.
- **Native dialogs.** Entry and reading dialogs use the browser's `<dialog>` element, so focus is
  trapped and restored by the platform rather than by a bespoke script.
- **No colour-only meaning.** Each state (within baseline / review / limited data) carries a text
  label and, in the atlas list, a numeric index. Colour is reinforcement, never the message.
- **Charts have table equivalents.** Every chart is paired with a focusable, labelled data table;
  wide tables scroll inside their own region instead of widening the page.
- **Motion is optional.** A reduced-motion preference is persisted and respected by the replay
  and chart animations.
- **Layout survives 320 px.** The narrow-width check is part of the browser suite, not an
  aspiration.
- **Language and semantics.** One `<h1>` per view, landmark regions, `aria-pressed` on toggles,
  `aria-current` in navigation, live regions for save/error confirmations.

## Measured — by run, not merged into one number

Historical and current results are kept apart on purpose, because a number without a date and a
revision is not evidence.

| Run                                  | Build / revision                    | Engine                                  | Viewports                   | Result                                                                                                                                                                      |
| ------------------------------------ | ----------------------------------- | --------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recorded in this document previously | v3.0 build, pre-`f0a2` docs refresh | Chromium (Playwright) + axe-core 4.11.0 | 1440×1050, 390×844, 320×720 | 0 axe violations across 24 view scans (12 routes × 2 widths) plus 7 dialog/menu states; no page-level overflow                                                              |
| 2026-11-12 review branch             | `review/2026-11-12-hardening`       | **not executed**                        | —                           | The review sandbox cannot launch Chromium (`libnspr4.so`, no root), so nothing was re-measured. The new CI `browser-smoke` job is the mechanism that will produce this row. |

The 12 routes are: overview, atlas, logbook, trends, actions, evidence, environment, replay,
handover, judges, settings, about — eleven in the navigation plus About.

- Zero violations under the configured **axe-core 4.11.0** rule set (WCAG 2.0/2.1 A + AA) in the
  earlier run described above.
- Route sweep at 1440×1050, 390×844 and 320×720 with no page-level horizontal overflow in that
  same run.
- **Contrast measured from the shipped CSS tokens** (WCAG 2.1 relative-luminance formula, sRGB,
  `src/styles.css`):

  | Pair                                      | Ratio                       | Result   |
  | ----------------------------------------- | --------------------------- | -------- |
  | Primary text `#20372c` on panel `#ffffff` | 12.77:1                     | AA / AAA |
  | Primary text on page canvas `#f5f8f6`     | 11.94:1                     | AA / AAA |
  | Body text `#4c6355` on panel              | 6.52:1                      | AA       |
  | Muted text `#5c7065` on panel             | 5.30:1                      | AA       |
  | Muted text on tinted panel `#f0f6f2`      | 4.84:1                      | AA       |
  | "Review" amber `#92550f` on panel         | 5.95:1                      | AA       |
  | "Within baseline" mint `#146e53` on panel | 6.20:1                      | AA       |
  | Warning text `#765323` on `#fff6e8`       | 6.46:1                      | AA       |
  | Info text `#385e79` on `#eef5fa`          | 6.26:1                      | AA       |
  | White on accent `#146e53`                 | 6.20:1                      | AA       |
  | Chart series 1–4 on white                 | 6.65 / 6.01 / 6.54 / 6.61:1 | AA       |

  Worst pair in the shipped theme is 4.84:1, above the 4.5:1 AA threshold for normal text. These
  are computed token pairs, not a screenshot-based sample, and they do not cover images or
  non-text graphics (icons, chart bands), which rely on shape and labels as well as hue.

## Media added since that run

The 30-second and 3:49.5 films and the seven-slide deck are new surfaces, and they were built with
accessibility in mind but **not re-scanned** (see the table above):

- `<video controls preload="none" poster=… aria-label=…>` — no autoplay, so nothing moves or
  speaks without a decision; a poster frame stands in before playback.
- Narrated audio is also burned in as captions, and each film ships an `.srt` plus a plain-text
  transcript that can be downloaded without playing the video.
- The deck is a keyboard-operable region: previous/next buttons, seven labelled dot buttons with
  `aria-current`, and a polite live region announcing the slide change. Each slide image carries
  alt text; the PDF is downloadable and readable outside the app.
- Videos are excluded from the offline precache (about 20 MB), so playback needs a network
  connection — an availability limitation, stated in the interface.

## Not verified

- **No testing with assistive-technology users** (VoiceOver, NVDA, TalkBack) and no formal audit.
  Automated scans find a subset of real problems.
- **No exhaustive cross-browser coverage.** Chromium is the tested engine; Safari and Firefox were
  not systematically exercised.
- **Not certified** against WCAG 2.2 AA or any national accessibility standard. Passing axe is
  evidence, not a certificate. This file is a record of what was measured and what was not; it is
  not an accessibility conformance report, and no third party has assessed the project.

If you are reviewing this project and find a barrier, that is a defect worth reporting under
[issues](https://github.com/tufayelahmedsuhagcc-dotcom/prohor/issues) — it will be handled as a
correctness problem, not a polish item.
