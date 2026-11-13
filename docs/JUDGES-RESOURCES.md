# Judges' resource hub

The Overview tour and navigation both lead to `#judges`. The hub includes a short overview brief and four separately downloadable, source-linked dossiers:

1. **Mission & demo** — challenge, walkthrough and team.
2. **Data & evidence** — source inventory, OSD-575 calculations, NOAA context and limitations.
3. **Technology & method** — architecture, baseline math, integration and reproducibility.
4. **Safety, impact & roadmap** — privacy, limitations and proposed validation.

`public/docs/PROHOR_Judges_Library.zip` contains the four dossiers. A production build includes all PDFs and the ZIP in the service-worker precache. Offline access requires an initial successful visit and functioning, retained browser storage.

## Editing and regenerating

Edit `scripts/generate_judges_library.py`, install Python `reportlab`, then run `python scripts/generate_judges_library.py` and `npm run build`. The original brief is generated separately by `scripts/generate_judges_brief.py`. Both scripts use DejaVu Sans at `/usr/share/fonts/truetype/dejavu/`; install it or adapt the paths on another system. Review page layout, source citations, links and AI disclosure before submission. Repository links in the PDFs and hub point at `main`; changes will not appear there until pushed to that branch. `tests/judges_library.py` verifies individual downloads, the bundle, responsive layout and offline access.

## Inspiration (not a current judging requirement)

- [Resonant Exoplanets](https://resonant-planet.vercel.app/), NASA's [2025 Best Use of Data winner](https://www.spaceappschallenge.org/2025/meet-the-2025-global-winners/), puts a presentation and research paper on its landing page. This inspired prominent document access, not an endorsement of its scientific claims.
- [SpaceGenes+](https://spacegenes-plus.framer.website/), the 2025 Best Use of Science winner, describes a data-to-analysis-to-results workflow and separates prototype from future examples.
- [Twisters/SkySense project page](https://www.spaceappschallenge.org/2025/find-a-team/twisters/?tab=project) lists a demonstration, technologies, data sources and AI disclosure. Its linked website was unavailable at review time; the Space Apps project page was used.

Prior winner examples are inspiration, not proof of current rules or a guarantee of an award.

## Videos and seven-slide presentation

The judges' page includes the recorded 30-second pitch (29.90 s, 1920×1080, mono narration, burned-in captions) and the 3:49.5 judging film, caption/transcript links, an interactive seven-slide overview, and a downloadable seven-page PDF (`public/docs/PROHOR_Seven_Slide_Presentation.pdf`). The overview page also features the short film. Video files in `public/media/` are streamed on demand and excluded from the offline service-worker cache to avoid downloading ~20 MB on installation; playback needs a network connection. Their existing captions are burned in, with downloadable transcripts and SRT files. PDF and presentation screenshots are cached after successful initial service-worker installation.

The slide text is edited in `src/components/Presentation.tsx`. The PDF is generated separately by `scripts/generate_presentation.py` using ReportLab; when changing content, update and check both versions. App footage is from the updated local build, not evidence that the currently deployed website already includes it. Neither film has been uploaded to a video host and no public video URL has been added to any submission form — the files live in this repository, and publishing them is the owner's decision. The presentation and videos describe synthetic demonstration readings separately from historical NASA research.
