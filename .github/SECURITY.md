# Security policy

PROHOR is a research and demonstration project, not a clinical record system or a flight-health
service. Do not enter identifying or confidential health information into it.

## Scope

The application has no accounts, no authentication and no health-data endpoint. Readings, notes and
preferences stay in the browser's `localStorage`; the only backend endpoint fetches allowlisted
public NASA/NOAA feeds over GET. The full threat model, protections implemented and the boundaries
that remain are in [docs/SECURITY.md](../docs/SECURITY.md).

## Reporting a problem

- For ordinary bugs — including accessibility, layout, browser-storage and data-handling issues —
  open an issue using the bug report template. Do not include personal health data, tokens or
  screenshots containing either.
- If you believe you have found something that could put a user at risk (for example a way to make
  the interface present an unverified value as verified, or to import data past validation), say so
  plainly in the issue title and describe the smallest reproduction you can.
- This repository does not run a bug bounty and cannot offer payment. Reports are handled on a
  best-effort basis by the team.

## What is not claimed

No formal penetration test, third-party audit, rate-limiter, production monitoring or
high-availability infrastructure is in place. A passing test suite does not certify security,
accessibility or clinical safety.
