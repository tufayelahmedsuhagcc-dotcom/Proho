# Attribution and third-party notices

## New PROHOR application

The 3.0 source, custom SVG mark, body schematic, interface, deterministic fixture and tests were produced with AI assistance through **Arena.ai**, disclosed openly. There is no runtime language model. The anatomy is a coded schematic: not a clinical scan, not a copied medical illustration. Human review precedes any scientific claim.

## Libraries and fonts

Dependency versions are locked in `package-lock.json`; `npm ci` reproduces them. Their upstream licenses apply separately from PROHOR's original code.

| Component           | Role                            | Upstream license          |
| ------------------- | ------------------------------- | ------------------------- |
| React / React DOM   | User interface                  | MIT                       |
| TypeScript          | Type checking                   | Apache-2.0                |
| Vite / React plugin | Build tooling                   | MIT                       |
| Express             | Same-origin read-only server    | MIT                       |
| Zod                 | Local data validation           | MIT                       |
| PapaParse           | CSV parsing/export              | MIT                       |
| Lucide              | Interface icons                 | ISC                       |
| Inter               | Local interface typography      | SIL Open Font License 1.1 |
| Space Grotesk       | Local headings/brand typography | SIL Open Font License 1.1 |
| Vitest              | Automated tests                 | MIT                       |
| Playwright          | Browser automation              | Apache-2.0                |
| axe-core            | Automated accessibility checks  | MPL-2.0                   |
| Prettier            | Source formatting               | MIT                       |

Font license texts are included in `docs/licenses/`. Dependencies' distributed notices remain in their installed packages; review upstream terms when redistributing dependencies. No font or icon CDN is required at runtime.

## Research and data

- NASA OSDR: original OSD-575 metabolic-panel source, related study metadata and file provenance. Attribution, source links and transformation details are in DATA-PROVENANCE.md and the downloadable source manifest.
- NASA Human Research Program: hazards, Standard Measures and sleep-risk context. These references do not validate PROHOR's heuristic thresholds.
- NOAA Space Weather Prediction Center: planetary Kp observations. NOAA is identified separately from NASA.
- No code, branding, assets or model from any other Space Apps project is incorporated into this application.
- The repository contains no third-party article text, slide deck or video. External material is
  cited by link, not copied.

NASA hosting does not make every contributor-created dataset or participant project public-domain software. Check each source's terms and attribution requirements before redistribution. No NASA insignia or Space Apps logo is used to imply affiliation. Names and source links identify references, not sponsors or endorsers.

## Licence scope

The MIT licence in [LICENSE](../LICENSE) covers the PROHOR application source, its custom SVG
mark and body schematic, the interface and the deterministic test fixture. Third-party
libraries, fonts, NASA/NOAA data extracts and any preserved upstream material retain their own
terms, listed above and in [DATA-PROVENANCE.md](DATA-PROVENANCE.md).
