# Judges' resource hub

The Overview tour and navigation both lead to `#judges`, with a bundled PDF that can be opened or downloaded at `/docs/PROHOR_Judges_Brief.pdf`. A production build adds the PDF to the service-worker precache. Offline access requires an initial successful visit and functioning, retained browser storage.

## Editing the brief

Edit `scripts/generate_judges_brief.py`, install `reportlab` in Python, and run `python scripts/generate_judges_brief.py`, then `npm run build`. The generator uses DejaVu Sans at `/usr/share/fonts/truetype/dejavu/`; install it or adapt the font paths on another system. Review the result, links, source citations and AI disclosure before submission. The repository links in the PDF and hub point at `main`; changes are not reflected there until pushed to that branch.

## Inspiration (not a current judging requirement)

- [Resonant Exoplanets](https://resonant-planet.vercel.app/), NASA's [2025 Best Use of Data winner](https://www.spaceappschallenge.org/2025/meet-the-2025-global-winners/), puts a presentation and research paper on its landing page. This inspired prominent document access, not an endorsement of its scientific claims.
- [SpaceGenes+](https://spacegenes-plus.framer.website/), the 2025 Best Use of Science winner, describes a data-to-analysis-to-results workflow and separates prototype from future examples.
- [Twisters/SkySense project page](https://www.spaceappschallenge.org/2025/find-a-team/twisters/?tab=project) lists a demonstration, technologies, data sources and AI disclosure. Its linked website was unavailable at review time; the Space Apps project page was used.

Prior winner examples are inspiration, not proof of current rules or a guarantee of an award.
