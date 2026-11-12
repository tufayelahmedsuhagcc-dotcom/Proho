# Data provenance and reproduction

## Source inventory

| Source | What is used | What is not claimed |
|---|---|---|
| [NASA OSDR OSD-575](https://osdr.nasa.gov/bio/repo/data/studies/OSD-575) | Original submitted comprehensive metabolic panel; four coded Inspiration4 subjects; descriptive pre/post comparison | A clinical model, astronaut telemetry feed, validated long-duration threshold or fasting glucose classification |
| [NASA OSDR OSD-569](https://osdr.nasa.gov/bio/repo/data/studies/OSD-569) | Human-study title, description and repository link | New CBC calculations or personal reference ranges |
| [NASA OSDR OSD-87](https://osdr.nasa.gov/bio/repo/data/studies/OSD-87) | Optional mouse-study metadata, hidden from the library's default human filter | Human thresholds, personal measurements or evidence that a given user has an eye condition |
| [NASA HRP hazards](https://www.nasa.gov/hrp/hazards/) | Five-hazard framing and contextual routine prompts | Endorsement or certification of the app |
| [NASA Standard Measures](https://www.nasa.gov/reference/standard-measures/) | Rationale for consistent longitudinal measurement and context | Approval of developer-selected numerical change bands |
| [NASA sleep risk](https://www.nasa.gov/reference/risk-from-inadequate-sleep-and-irregular-schedules/) | Sleep/schedule context and rest-routine prompts | A diagnostic instrument or personalized treatment |
| [NOAA SWPC planetary Kp](https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json) | Public Earth geomagnetic observations, their observation times and retrieval times | Personal radiation exposure, cabin conditions, a forecast or EVA clearance |

All sources were downloaded directly from the publishing agency. Exact downloadable-byte provenance is in `public/data/source-manifest.json`. NASA/NOAA availability can change; source failures are not replaced with generated observations.

## OSD-575 files

**Submitted file used in the explorer:**

```text
LSDS-8_Comprehensive_Metabolic_Panel_CMP.upload_SUBMITTED.csv
Local: public/data/osd575-submitted.csv
Bytes: 25,275
SHA-256: dab247eb794edab59aaaa683c85fd1f2dbf4ae3684872739338e10ead4192a0c
Retrieved: 2026-11-11T13:32:44.837230+00:00
```

Source download:

https://osdr.nasa.gov/geode-py/ws/studies/OSD-575/download?source=datamanager&file=LSDS-8_Comprehensive_Metabolic_Panel_CMP.upload_SUBMITTED.csv

**Additional transformed file, retained for source traceability but not used to manufacture extra subjects or observations:**

```text
LSDS-8_Comprehensive_Metabolic_Panel_CMP_TRANSFORMED.csv
Local: public/data/osd575-transformed.csv
Bytes: 8,506
SHA-256: 5eb1e7f025dd8443a9e70111e62bc32afae3432753024489c5c013e401d709d9
Retrieved: 2026-11-11T13:32:45.639085+00:00
```

The NASA file index is preserved as `public/data/osd575-file-index.json`. Source columns include `ANALYTE, VALUE, RANGE_MIN, RANGE_MAX, UNITS, TEST_TYPE, SUBJECT_ID, SEX, timepoint`. The UI only projects the columns needed for the comparison; the unchanged source retains the others.

### Reproduce

```bash
python scripts/prepare-data.py
npm test
```

The Python script uses only the standard library. It writes `public/data/osd575.json` while leaving the input CSV unchanged. The app does **not** trust that generated JSON as its only calculation path: `Evidence.tsx` parses the original CSV independently and checks the file hash using Web Crypto.

Normalization retains raw text values, source units, ranges, subject code, timepoint and one-based CSV source row number (header is row 1). Non-numeric/censored values remain null for arithmetic and keep their original text. Missing measurements are not filled. Race-labeled eGFR columns remain available in the original file but are excluded from selectable analyses.

Tests reproduce the row/analyte/subject counts, the C001 glucose median, R+1 deltas and the R+45 shared below-interval pattern. See [METHODOLOGY.md](METHODOLOGY.md) for interpretation limits.

## Public API adapter contracts

```text
GET /api/feeds?feed=studies
GET /api/feeds?feed=space-weather
```

Response envelope:

```json
{
  "status": "live or cached",
  "retrievedAt": "source retrieval timestamp, not refreshed on a cache hit",
  "sourceUrl": "https://...",
  "data": "validated study array or weather object",
  "notice": "human-readable provenance/cache explanation"
}
```

- NASA metadata URLs: `https://osdr.nasa.gov/osdr/data/osd/meta/575`, `/569`, `/87`.
- NASA metadata titles/descriptions are read from `study["OSD-N"].studies[0]`, not nonexistent top-level fields.
- Metadata TTL: 24 hours. Kp TTL: 10 minutes. The cache is in-process and may be short-lived on serverless hosts.
- Upstream requests have a nine-second timeout and payload/schema checks. Client refresh requests have a timeout and independent response validation.
- NOAA accepts both observed object-array and header-plus-row formats. Invalid measurements are excluded, not coerced into zero. A feed with no valid records fails closed.
- If the source fails, use a prior server response or the bundled dated snapshot. The original retrieval/observation times are retained. `OFFLINE=1` forces explicit snapshot mode.
- `live` means the server fetched a response; it **does not mean the underlying observation is current**. The interface says Network response, not live crew telemetry.
- Unknown feed values → 400. Non-GET → 405. No health-record submission endpoint exists.

The NASA library is deliberately curated to three studies. Its search filters those entries; it is not a general search across all NASA research.

## Refreshing bundled data responsibly

Normal app refreshes do not overwrite the raw archive or committed snapshots. To update a research artifact, an authorized maintainer should:

1. Download from the original NASA file index and retain the original bytes.
2. Record source URL, retrieval time, size and SHA-256.
3. Review schema, study identity, consent/use terms, units and missingness.
4. Recompute and compare expected results; update both the manifest and tests only after reviewing real source changes.
5. Update the displayed study context and version as appropriate, then rebuild the service-worker cache.

Never merely change the expected hash to silence a checksum failure. A hash confirms identity relative to the stored manifest; it is not proof of scientific correctness or authenticity against an attacker who can modify both files.

## Failed or inaccessible integrations

The NASA `api.nasa.gov/DONKI/FLR` DEMO_KEY request returned 404 in this environment, and a CCMC alternative encountered a TLS connection failure. Neither failed response was treated as data. The working environmental integration is NOAA Kp, accurately attributed. No private credentials or API keys are required to run the project.

Original documentation's sensor/sync API routes were static or unsupported. They were not reused as verified data services.
