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

## Measured

- Zero violations under the configured **axe-core 4.11.0** rule set (WCAG 2.0/2.1 A + AA) across
  **11 desktop and 11 mobile view scans**, plus seven dialog/menu states.
- Route sweep at 1440×1050, 390×844 and 320×720 with no page-level horizontal overflow.
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

## Not verified

- **No testing with assistive-technology users** (VoiceOver, NVDA, TalkBack) and no formal audit.
  Automated scans find a subset of real problems.
- **No exhaustive cross-browser coverage.** Chromium is the tested engine; Safari and Firefox were
  not systematically exercised.
- **Not certified** against WCAG 2.2 AA or any national accessibility standard. Passing axe is
  evidence, not a certificate.

If you are reviewing this project and find a barrier, that is a defect worth reporting under
[issues](https://github.com/tufayelahmedsuhagcc-dotcom/prohor/issues) — it will be handled as a
correctness problem, not a polish item.
