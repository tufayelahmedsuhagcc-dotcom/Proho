# PROHOR demo: problem → observation → explanation → human review

This is a practical walkthrough, not a claim about current submission requirements. Check the official [2026 participant FAQs](https://www.spaceappschallenge.org/resources/participant-faqs/) and your local event instructions for the current format, deadlines and judging guide.

## Suggested live walkthrough

1. **Problem and solution:** Explain that a crew member needs an understandable way to compare health observations when resources are limited. PROHOR is a non-diagnostic prototype that organizes readings, explains change and prepares a handover.
2. **Synthetic scenario:** On Mission overview, select **See the change** in the guided tour. This switches to the labeled synthetic CDR-01, FD 146 scenario. Trends shows a 5.6-hour simulated sleep reading against its 7.4-hour synthetic personal median.
3. **Explain the rule:** Show the baseline window, coverage, median, change band and direction. The rule is a developer-selected heuristic, not a clinical threshold. A missing baseline or an unflagged value is not proof of health.
4. **Research in a separate context:** Return to the guided tour and select **Explore the evidence**. The OSD-575 explorer uses historical Inspiration4 metabolic-panel data. Its values do not cause or validate the simulated sleep flag. Show the NASA study link, checksum and source-row information.
5. **Human handover:** Use **Prepare for review**. Export a handover and explain that the app creates a local file; it does not send anything to a clinician.
6. **Limitations and questions:** Open **Judges’ resources** for separate data, technical, safety and demo dossiers. Explain that local storage is not encrypted, no live health sensor is connected, and clinical validation is future work.

## Before presentation

- Verify the live link, all PDF downloads, the public repository and any demonstration video in a private window.
- Open the site online and wait for its cache to install before relying on offline access. Browser storage limits can prevent persistence.
- Review all team names, actual AI-tool disclosures and source links. Keep real health details out of a shared demonstration.
- Check the current official rules and your Local Lead’s instructions. A polished demo does not guarantee an award.

## The 30-second film (recorded — in this repository)

| Property     | Value                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| File         | [`public/media/prohor-30-second.mp4`](../public/media/prohor-30-second.mp4)                                                             |
| Measured     | 29.90 s, 1920×1080, H.264, 30 fps, mono AAC narration, 2.6 MB (ffprobe, 2026-11-12)                                                     |
| Captions     | Burned in, with [`prohor-30-second.srt`](../public/media/prohor-30-second.srt) and a plain transcript beside the file                   |
| Poster       | [`prohor-short-poster.jpg`](../public/media/prohor-short-poster.jpg)                                                                    |
| Source build | A local production build (`npm ci && npm run build && npm start`), captured at 1440×1050                                                |
| Narration    | Says "simulated readings with personal baselines" and "prepares a handover for human review" — the boundary is spoken, not only written |
| Scope        | No diagnosis, no dose estimate, no claim of astronaut use; the NASA view is called a research explorer, not validation                  |

Longer cut for asynchronously reviewing judges: [`prohor-four-minute.mp4`](../public/media/prohor-four-minute.mp4) (3:49.5, 17 MB) with its own `.srt` and transcript.

**Publication status:** the files are local repository assets. They are not uploaded to any video
host, and the submission form is not filled in. Publishing — or pasting a public URL into a form —
needs the owner's explicit approval, and the served URL only exists after the branch is merged and
deployed.

### If it has to be re-recorded (30 s, six beats)

| Time      | Beat                                | On screen                                                  |
| --------- | ----------------------------------- | ---------------------------------------------------------- |
| 0:00–0:02 | Team and name                       | Overview, top banner with the synthetic-data badge visible |
| 0:02–0:08 | The problem in one sentence         | Overview headline, no scrolling                            |
| 0:08–0:14 | One reading → personal baseline     | Trends & baselines: median, IQR, coverage, sample count    |
| 0:14–0:19 | Rule and explanation, then one step | Care plan panel for the flagged system                     |
| 0:19–0:24 | A handover for a human              | Crew handover: notes and local download                    |
| 0:24–0:30 | NASA evidence, kept separate        | NASA evidence: checksum line and source row numbers        |

Record at 1440×1050 or 1920×1080, one take per beat, no live typing of real health data, and keep
the "SYNTHETIC" and "research prototype" labels inside the frame.

## The seven-slide deck (primary artefact)

[`public/docs/PROHOR_Seven_Slide_Presentation.pdf`](../public/docs/PROHOR_Seven_Slide_Presentation.pdf)
— 7 slides, 531 KB, readable without the app; slide images are in
[`public/slides/`](../public/slides/) and render inside the judges' page. The deck is the primary
artefact; the film is optional supporting material, and the judges' brief (4 pages) covers the same
ground in text.
