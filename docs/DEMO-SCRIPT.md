# Demo assets · script and deck

Two accepted demo formats: a **30-second video** or **up to 7 slides**. Both are below; use one.

---

## A. 30-second video script

Target: **30.0 s**, ~78 spoken words. Screen recording of the live deploy at 1440×900, cursor
visible, no music louder than the voice, English (or burned-in English subtitles).

| Time | On screen | Voiceover |
|---|---|---|
| 0:00–0:05 | Overview, CDR-01, flight day 146. Five flags visible. | "On a long mission, no one can walk into a clinic. This crew member has five readings to review — and no doctor nearby." |
| 0:05–0:11 | Click *Trends & baselines* on sleep: median, IQR band, 30 prior days, rule line. | "PROHOR compares each reading only against that person's own prior days, and shows how much data supports the comparison." |
| 0:11–0:18 | Hover the coverage figure; then open *NASA evidence*, choose glucose + C001, show source row numbers and the 80 mg/dL median. | "Every flag opens its evidence — here, the original Inspiration4 dataset, parsed in the browser and recomputed in front of you." |
| 0:18–0:24 | Log a new reading → switches to *Local workspace* → "insufficient prior data" state. | "Log a new reading and it refuses to reassure you: two days of data is not a baseline." |
| 0:24–0:30 | *Care plan* → done → *Crew handover* → export packet → logo. | "One conservative next step, and a handover the flight surgeon can actually read. PROHOR. Not a diagnosis — a clearer next question." |

**Recording checklist**

- Record at 1440×900 or 1280×720, 30 fps; keep the browser chrome out of frame.
- Pre-seed the *Local workspace* with a 2-day history so the insufficient-data state appears instantly.
- Wait for **Offline ready** before recording — then the whole demo also works with Wi-Fi off,
  which is worth saying out loud if you have two spare seconds.
- Export H.264 MP4, upload **public** to YouTube; verify in a private window.

---

## B. Seven-slide deck

16:9. One idea per slide, ≤25 words of body text. Screenshots on slides 2, 4 and 6.

**1 · Title**
PROHOR — Mission Health Intelligence
*Your readings. Your baseline. A clearer next step.*
Challenge · team · live link (as text, not a QR code only).

**2 · The moment**
Screenshot: overview at flight day 146.
"Up to twenty-two minutes of light-time delay. Five readings to review. No clinic."
The gap: today's tools give a colour, not a reason.

**3 · Why a colour fails**
Three-line argument: a flag without its baseline, day count and rule is unfalsifiable; a score
without its limits invites over-trust. What a crew member needs is a *traceable* comparison.

**4 · What PROHOR does**
Screenshot: trends + baseline panel.
Median/IQR over distinct prior days · 7-day minimum · coverage shown · rule exposed ·
insufficient-data state instead of a green light.

**5 · The evidence is inspectable**
Screenshot: NASA evidence view.
Original OSD-575 CSV, SHA-256 verified, 531 observations, four coded subjects, source row
numbers, recomputed medians, stated limits.

**6 · From observation to action**
Screenshot: care plan + handover packet.
One conservative routine step → documented → exported for the flight surgeon. The packet, not the
alert, is the product.

**7 · Boundaries and what's next**
Not a medical device · no diagnosis or dose estimate · unencrypted single-user storage ·
four-crew archive cannot set long-mission thresholds.
Next: validated indicator set with flight surgeons, on-orbit data ingestion, multi-crew roles.
Live link + repo link, large and legible.

---

## C. Judge-proofing before you submit

- [ ] Live link opens in a private window with no login (test on a phone too).
- [ ] GitHub repository is **public** and the MIT licence is visible in the repo header.
- [ ] Video URL is public and playable without a Google account.
- [ ] All team members are registered on the team page (max six).
- [ ] The "consider for Global Judging" box is checked.
- [ ] Every screenshot in the deck shows the current white build.
- [ ] No NASA logo or NASA endorsement language anywhere.
