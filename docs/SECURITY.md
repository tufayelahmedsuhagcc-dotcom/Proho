# Privacy, security and known limitations

## Intended use

Research/demo use with non-identifying data. This is not a secure clinical record system or a production flight-health service. Do not enter identifying or confidential health information.

## Data flow

- Health readings, notes, preferences and routine actions stay in the browser's `localStorage` under `prohor.v3.workspace`.
- The app's only backend endpoint fetches allowlisted public NASA/NOAA feeds. It accepts GET only; it has no health POST, sync or authentication endpoint.
- The browser requests app assets and public-source responses from its same-origin server. It does not send health values in API query parameters.
- NASA/NOAA requests contain no crew readings. Hosting providers can still observe normal network metadata, including IP addresses and access logs.
- There is no runtime AI service, tracking SDK, advertising, analytics, camera, microphone or location access.
- External reference links open third-party sites with their own privacy practices.
- Exports are plain files under the user's control. They are not encrypted, transmitted or addressed to a clinician automatically.

Browser workflow tests recorded zero health-record POST requests. That observation is limited to the tested application flows; it is not a formal security audit of the user's browser/extensions or hosting provider.

## Protections implemented

- Zod schema and version validation; finite-number, range, unit and timestamp checks.
- Atomic CSV validation before import and explicit JSON replacement/deletion confirmation.
- Spreadsheet formula escaping on CSV export.
- Notes rendered through React text nodes, not `dangerouslySetInnerHTML`.
- Corrupt-storage protection: ordinary preference changes and readings cannot silently overwrite an unreadable stored value.
- Feed-name allowlist; no user-specified upstream URL, avoiding an arbitrary fetch proxy.
- Upstream timeout/size/schema checks and frontend validation before rendering public responses.
- Read-only API with explicit 400/405 behavior, `nosniff`, appropriate cache headers and no secret in browser code.
- Native dialog focus management, mobile background inertness and explicit offline/data-source labels.
- Content-hashed offline cache scoped to PROHOR; old unrelated app caches are not deleted.
- Original NASA bytes checked against the bundled manifest; mismatch blocks that analysis.

## Boundaries that remain

- localStorage is unencrypted, accessible to scripts on the same origin and vulnerable if the origin is compromised. No access control, authenticated users, clinical audit trail or encrypted vault is implemented.
- A hash check detects changes against its manifest; it is not protection against a server attacker replacing both.
- Browser storage can be cleared, denied, evicted or exhausted. JSON backups are essential. Private browsing may not persist data.
- Storage events synchronize ordinary tab changes, but simultaneous writes are not transactional. Prefer one active editing tab.
- No real device, signal-quality hardware integration, clock synchronization or sensor calibration service is implemented.
- No API rate-limiter, production monitoring, formal penetration test or high-availability infrastructure is included. The public adapter has in-process caching and is read-only; add deployment controls before broad public use.
- The development server accepts any host so preview URLs work; it is not hardened hosting.
- This prototype was tested in Chromium automation. No comprehensive screen-reader, real-device, Safari/Firefox, flight hardware or adverse-network certification is claimed.
- No regulated medical, HIPAA/GDPR compliance, NASA flight qualification or clinical effectiveness claim is made.

For severe or sudden symptoms, follow approved emergency procedures rather than waiting for an application flag. No flag is not a safety clearance.

## Before operational or clinical use

Independent clinical/human-factors review, a hazard and threat assessment, measurement validation, authenticated/encrypted storage, regulatory analysis, prospective evaluation, device integration testing, access/audit controls, backup/recovery design and a clear accountable operator would all be required. That is a separate engineering and clinical program, not a final polish task for this hackathon prototype.
