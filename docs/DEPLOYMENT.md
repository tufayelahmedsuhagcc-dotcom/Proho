# Running and deploying PROHOR

## Requirements

- Node.js 20.19+ or 22.12+; npm.
- Modern browser with localStorage, native dialog, SVG and ES2022 support.
- HTTPS or localhost for offline service workers, Web Crypto and clipboard capability. Clipboard failure offers file download instead.
- No credentials, database, NASA key or external AI service are needed.

Tested locally with Node 20.20.2, npm 10.8.2 and Playwright Chromium. Safari/Firefox and real mobile devices have not been exhaustively tested.

## Development

```bash
npm ci
npm run dev
```

Port 5173, bound to `0.0.0.0`. Express handles `/api/feeds`, and Vite serves the React app through the same origin. Hosted preview hostnames are permitted. Do not expose the development server to untrusted public traffic for production use.

## Production

```bash
npm ci
npm run build
npm start
```

Port 3000 by default. Set `PORT` to change it. Production serves `web/`; raw fallback source bytes also exist in `public/data/` for the server adapter. Keep both directories with `server/` if deploying manually.

`npm run build` performs TypeScript checks, bundles the interface and local fonts, then generates `web/sw.js`. The service-worker cache name is a hash of build contents. After a new successful installation it replaces older **PROHOR-prefixed** caches only.

### Force a disconnected-source demo

macOS/Linux:

```bash
OFFLINE=1 npm start
```

PowerShell:

```powershell
$env:OFFLINE="1"
npm start
```

This disables upstream server fetches, not browser networking. To test true offline behavior, first load the production app, wait for **Offline ready**, then use browser DevTools Offline and reload. Both cases are distinct from a first-ever visit, which needs application files available.

## Static hosting without the API

The built `web/` can be served by any root-mounted static HTTP host. For a local demonstration:

```bash
python -m http.server 3000 --bind 0.0.0.0 --directory web
```

Use `http://localhost:3000`. Local records, analysis, NASA raw-file exploration and exports remain functional. `/api/feeds` will be absent; the client visibly falls back to bundled dated snapshots. This is intentional degraded operation, not a working upstream feed deployment.

Do not open `web/index.html` via `file://`. Serve at the origin root; subdirectory deployment is not configured. Hash routes (`/#evidence`) work without server rewrite rules. Optional legacy paths require index fallback.

## Vercel configuration

Included `vercel.json` configures:

- Build command `npm run build`, output `web/`.
- `api/feeds.mjs` as a read-only serverless entry importing the shared adapter.
- Inclusion of `public/data/**` fallback files in the function.
- Cache-control and safe content-type/referrer headers.
- Rewrites for original `/app/*` and selected informational paths.

Upload the whole project to a repository or your hosting provider, install from `package-lock.json`, and use the included settings. The function has a 30-second maximum duration; upstream calls time out earlier. No health data should be added as an environment variable or backend upload.

**This configuration is supplied, but a deployment to your external Vercel account was not executed.** After deploying, independently test the public URL in a private browser, both `/api/feeds` variants, offline readiness, imports/exports and legacy paths. The workspace's live preview is not a permanent public submission URL.

## Data and storage

Browser key: `prohor.v3.workspace`, schema version 3. Same-origin tabs receive storage updates, but this is not a concurrent database: simultaneous edits can still race. Use one active editing tab and export regular JSON backups. A different hostname/origin has a different workspace. Changing a preview URL does not migrate old local records.

- Measurements: maximum 10,000 records.
- Routine events: maximum 10,000.
- Import file: maximum 2 MB.
- Notes: bounded length; rendered as text.
- CSV import: `day,signal,value,unit`; optional `note,recordedAt`. `recordedAt`, when present, must be an ISO timestamp. Exported simulation or invalid-quality records are rejected as local numeric measurements. Use JSON for an exact backup/restore, not CSV.
- Backup import validates version, units and data before confirmation. It replaces the local workspace only after explicit consent.

The existing original website's browser storage is not automatically migrated. If you have original local entries you need to preserve, export them there before retiring that site and review/import authorized measurements using the new documented format.

## Troubleshooting

| Symptom | Check |
|---|---|
| `npm` missing | Install a supported Node.js version, reopen the terminal |
| Blank page from downloaded file | Use an HTTP server, not double-click/file URLs |
| Port already used | Stop the conflicting process or set `PORT` |
| No offline-ready badge | Use production build and HTTPS/localhost; wait for installation; check browser storage/service-worker restrictions |
| Cached environment data | Read observed/retrieved timestamps; source may be stale, unavailable, rate-limited or the deployment may be static-only |
| Local storage unavailable/full | No save is claimed. Export existing data; use a browser/origin with available persistent storage |
| Saved data cannot be read | Saving is blocked to protect the original value. Use Settings to export it, then restore a validated backup or explicitly erase |
| Archive checksum mismatch | Stop analysis; restore source bytes from the verified package/source. Do not bypass the check |
| No local baseline | At least seven distinct prior days, same signal and local profile, are needed; demo data is never borrowed |
| Old app after updating | Reconnect, reload and allow the new service worker to install; do not clear local records unnecessarily |
| Copy button denied | Use Download report; browser clipboard permissions are optional |

## Verification commands

```bash
npm run typecheck
npm test
npm run build
npm audit
```

See the README and TEST-REPORT for Python browser-test setup. All browser tests require a running server. For a clean-source check, remove the generated `web/`, reinstall dependencies with `npm ci`, rebuild, then start the server. `node_modules/` is not committed.
