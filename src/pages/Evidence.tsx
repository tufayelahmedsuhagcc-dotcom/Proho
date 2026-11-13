import { useState, useEffect } from "react";
import Papa from "papaparse";
import {
  Database,
  ArrowUpRight,
  Download,
  RefreshCw,
  CheckCircle2,
  FileCheck,
  Search,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Panel, SectionHead, Badge, Notice, External } from "../components/UI";
import { useFeed, utc } from "../lib/feeds";
import {
  archiveBaseline,
  sharedDepartures,
  TIMEPOINTS,
  normalizeArchive,
} from "../compute/research";
import { signed } from "../compute/engine";
import type { ResearchRow, Study } from "../types";
import { SOURCES } from "../data/catalog";
const SUBJECTS = ["C001", "C002", "C003", "C004"];
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];
const LINE_PATTERNS = [undefined, "7 4", "3 4", "10 3 2 3"];
export function Evidence() {
  const [rows, setRows] = useState<ResearchRow[]>([]),
    [error, setError] = useState(""),
    [integrity, setIntegrity] = useState("Checking source integrity…"),
    [analyte, setAnalyte] = useState("GLUCOSE"),
    [subject, setSubject] = useState("C001"),
    [query, setQuery] = useState(""),
    [animals, setAnimals] = useState(false);
  const feed = useFeed<Study[]>("studies");
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [r, m] = await Promise.all([
          fetch("/data/osd575-submitted.csv"),
          fetch("/data/source-manifest.json"),
        ]);
        if (!r.ok || !m.ok) throw new Error("Source snapshot unavailable.");
        const bytes = await r.arrayBuffer(),
          manifest = await m.json(),
          text = new TextDecoder().decode(bytes),
          p = Papa.parse<Record<string, string>>(text, {
            header: true,
            skipEmptyLines: true,
          });
        if (p.errors.length || !p.meta.fields?.includes("SUBJECT_ID"))
          throw new Error("Unexpected archive schema.");
        const data = normalizeArchive(p.data);
        let check = "Checksum verification unavailable in this browser.";
        if (crypto.subtle) {
          const hash = Array.from(
            new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
          )
            .map((v) => v.toString(16).padStart(2, "0"))
            .join("");
          if (
            hash !==
            manifest.find(
              (x: { file: string }) => x.file === "osd575-submitted.csv",
            ).sha256
          )
            throw new Error(
              "Archive checksum mismatch. Analysis blocked; restore the verified source file.",
            );
          check = "SHA-256 verified · source bytes unchanged";
        }
        if (active) {
          setRows(data);
          setIntegrity(check);
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const analytes = [...new Set(rows.map((r) => r.analyte))]
      .filter((a) => !a.startsWith("eGFR"))
      .sort(),
    selected = rows.filter(
      (r) => r.analyte === analyte && r.subject === subject,
    ),
    baseline = archiveBaseline(rows, subject, analyte),
    alerts = sharedDepartures(rows, analyte),
    unit = selected[0]?.unit || "",
    data = rows.filter((r) => r.analyte === analyte && r.value !== null);
  const vals = data.map((r) => r.value!),
    min = Math.min(...vals, selected[0]?.min ?? Infinity),
    max = Math.max(...vals, selected[0]?.max ?? -Infinity),
    pad = (max - min) * 0.15 || 1;
  const Y = (v: number) =>
      228 - ((v - (min - pad)) / (max - min + 2 * pad)) * 181,
    X = (i: number) => 65 + i * 96;
  const studies = (feed.result?.data || []).filter(
    (s) =>
      (animals || s.organism === "Homo sapiens") &&
      (s.title + " " + s.accession).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            HISTORICAL RESEARCH / NEVER PERSONAL TELEMETRY
          </span>
          <h1>
            NASA data. <span>With the evidence attached.</span>
          </h1>
          <p>
            Explore a real source file, reproduce a comparison, and see where
            interpretation must stop.
          </p>
        </div>
        <External href={SOURCES.osd575.url}>Open NASA OSDR</External>
      </div>
      <div className="evidence-banner">
        <div className="dataset-emblem">
          <Database size={28} />
          <span>OSDR</span>
        </div>
        <div>
          <span className="eyebrow">
            OPEN SCIENCE DATA REPOSITORY · OSD-575
          </span>
          <h2>The Inspiration4 metabolic panel</h2>
          <p>4 crew members · 3-day flight · 2021 · before and after flight</p>
        </div>
        <span className="badge historical">Historical research</span>
      </div>
      {error ? (
        <Notice tone="warning">{error}</Notice>
      ) : !rows.length ? (
        <Panel>
          <p>Loading the published source table…</p>
        </Panel>
      ) : (
        <>
          <div className="research-stats">
            <div>
              <strong>{rows.length}</strong>
              <span>published observations</span>
            </div>
            <div>
              <strong>19</strong>
              <span>source analytes</span>
            </div>
            <div>
              <strong>7</strong>
              <span>sampling timepoints</span>
            </div>
            <div>
              <strong>0</strong>
              <span>values imputed</span>
            </div>
          </div>
          <Panel>
            <SectionHead
              eyebrow="FROM THE ORIGINAL NASA CSV"
              title="Before flight. After flight."
            >
              <div className="toolbar">
                <label className="sr-only" htmlFor="research-analyte">
                  Archive analyte
                </label>
                <select
                  id="research-analyte"
                  value={analyte}
                  onChange={(e) => setAnalyte(e.target.value)}
                >
                  {analytes.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
                <label className="sr-only" htmlFor="research-subject">
                  Archive subject
                </label>
                <select
                  id="research-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  {SUBJECTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </SectionHead>
            <div className="archive-context">
              <div>
                <span className="muted">{subject} · pre-flight median</span>
                <strong>
                  {baseline?.median ?? "—"} <small>{unit}</small>
                </strong>
                <span className="small">
                  {baseline?.n ?? 0} observations · descriptive only
                </span>
              </div>
              <div className="archive-legend">
                {SUBJECTS.map((s, i) => (
                  <button
                    key={s}
                    className={s === subject ? "selected" : ""}
                    onClick={() => setSubject(s)}
                  >
                    <i style={{ background: COLORS[i] }} />
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <svg
              className="archive-chart"
              viewBox="0 0 720 273"
              role="img"
              aria-label={`${analyte} before and after Inspiration4, four coded subjects. Exact values appear in the table below.`}
            >
              {Array.from({ length: 4 }, (_, i) => {
                const v = min + ((max - min) * i) / 3;
                return (
                  <g key={i}>
                    <line
                      x1="65"
                      x2="641"
                      y1={Y(v)}
                      y2={Y(v)}
                      stroke="var(--line)"
                      strokeDasharray="3 5"
                    />
                    <text
                      x="50"
                      y={Y(v) + 4}
                      textAnchor="end"
                      fill="var(--muted)"
                      fontSize="11"
                    >
                      {Number(v.toFixed(1))}
                    </text>
                  </g>
                );
              })}
              <rect
                x="282"
                y="20"
                width="35"
                height="215"
                fill="var(--historical-soft)"
              />
              <text
                x="300"
                y="13"
                textAnchor="middle"
                fill="var(--muted)"
                fontSize="9"
                letterSpacing="1"
              >
                FLIGHT
              </text>
              {SUBJECTS.map((s, i) => {
                let paths: string[] = [],
                  segment = "";
                TIMEPOINTS.forEach((t, j) => {
                  const r = data.find(
                    (r) => r.subject === s && r.timepoint === t,
                  );
                  if (r?.value !== null && r?.value !== undefined) {
                    segment += `${segment ? "L" : "M"}${X(j)},${Y(r.value)} `;
                  } else {
                    if (segment) paths.push(segment);
                    segment = "";
                  }
                });
                if (segment) paths.push(segment);
                return (
                  <g key={s} opacity={s === subject ? 1 : 0.8}>
                    {paths.map((d, k) => (
                      <path
                        key={k}
                        d={d}
                        fill="none"
                        stroke={COLORS[i]}
                        strokeWidth={s === subject ? 2.8 : 1.6}
                        strokeDasharray={LINE_PATTERNS[i]}
                      />
                    ))}
                    {data
                      .filter((r) => r.subject === s)
                      .map((r) => (
                        <circle
                          key={r.timepoint}
                          cx={X(TIMEPOINTS.indexOf(r.timepoint))}
                          cy={Y(r.value!)}
                          r={s === subject ? 4 : 2.5}
                          fill="var(--panel)"
                          stroke={COLORS[i]}
                        >
                          <title>
                            {s} · {r.timepoint}: {r.rawValue} {unit}
                          </title>
                        </circle>
                      ))}
                  </g>
                );
              })}
              {TIMEPOINTS.map((t, i) => (
                <text
                  key={t}
                  x={X(i)}
                  y="258"
                  textAnchor="middle"
                  fill="var(--muted)"
                  fontSize="11"
                >
                  {t}
                </text>
              ))}
            </svg>
            <p className="small muted chart-note">
              Categorical sampling points—not proportional time spacing. L =
              days before launch; R = days after return. Connecting lines guide
              the eye; they are not measurements between samples.
            </p>
            {alerts.map((a) => (
              <Notice key={a.timepoint} tone="warning">
                <strong>
                  {a.count} of {a.n} crew are {a.direction} their source
                  laboratory intervals at {a.timepoint}.
                </strong>{" "}
                This shared pattern merits a source and study-context review.
                PROHOR cannot determine whether it reflects biology, measurement
                conditions or data processing. It is not evidence of a
                diagnosis.
              </Notice>
            ))}
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Scrollable data table"
            >
              <table>
                <thead>
                  <tr>
                    <th>Timepoint</th>
                    <th>
                      {subject} · {analyte}
                    </th>
                    <th>Δ vs pre-flight median</th>
                    <th>Source laboratory interval</th>
                    <th>Source CSV row</th>
                  </tr>
                </thead>
                <tbody>
                  {TIMEPOINTS.map((t) => {
                    const r = selected.find((r) => r.timepoint === t);
                    return (
                      <tr key={t}>
                        <td className="mono">{t}</td>
                        <td>
                          {r?.rawValue ?? "Missing"} {r?.unit}
                        </td>
                        <td>
                          {r?.value !== null &&
                          r?.value !== undefined &&
                          baseline
                            ? signed(r.value - baseline.median, 1)
                            : "—"}
                        </td>
                        <td>
                          {r?.min ?? "—"}–{r?.max ?? "—"} {r?.unit}
                        </td>
                        <td>{r?.sourceRow ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
          <div className="two-columns">
            <Panel>
              <SectionHead
                eyebrow="REPRODUCIBLE, NOT OPAQUE"
                title="The provenance trail"
              />
              <ol className="pipeline">
                <li>
                  <strong>01 · Acquire</strong>
                  <p>
                    Original submitted CMP CSV from NASA OSDR’s OSD-575 file
                    index.
                  </p>
                </li>
                <li>
                  <strong>02 · Preserve</strong>
                  <p>
                    Original values, units, laboratory intervals, subject codes
                    and timepoints retained. No inferred fasting status.
                  </p>
                </li>
                <li>
                  <strong>03 · Compare</strong>
                  <p>
                    Median of three pre-flight observations, then post-flight
                    minus median. No clinical classification or learned
                    thresholds.
                  </p>
                </li>
                <li>
                  <strong>04 · Inspect</strong>
                  <p>
                    Shared interval departures are prompts for review, not
                    automatic rejection of a measurement.
                  </p>
                </li>
              </ol>
              <div className="integrity">
                <FileCheck size={15} />
                {integrity}
              </div>
              <a
                className="button secondary small"
                href="/data/osd575-submitted.csv"
                download
              >
                <Download size={14} />
                Original NASA CSV
              </a>
              <details className="technical-details">
                <summary>File identity & reproducibility</summary>
                <p>
                  LSDS-8_Comprehensive_Metabolic_Panel_CMP.upload_SUBMITTED.csv
                </p>
                <code>
                  dab247eb794edab59aaaa683c85fd1f2dbf4ae3684872739338e10ead4192a0c
                </code>
                <p>
                  Reproduce normalization:{" "}
                  <code>python scripts/prepare-data.py</code>. The browser
                  independently parses the same original CSV.
                </p>
                <a href="/data/source-manifest.json" download>
                  Download source manifest
                </a>
              </details>
            </Panel>
            <Panel>
              <SectionHead
                eyebrow="SCIENTIFIC BOUNDARIES"
                title="What this does not tell us"
              />
              <div className="limitation-list">
                <p>
                  <strong>Four people are not a population.</strong> This short
                  mission cannot establish clinical thresholds for a
                  long-duration crew.
                </p>
                <p>
                  <strong>
                    Fasting context is not recorded in this table.
                  </strong>{" "}
                  Differences in glucose cannot be assigned to spaceflight
                  alone.
                </p>
                <p>
                  <strong>Three pre-flight points are descriptive.</strong> They
                  do not establish the mature personal baseline used in the
                  separate mission demo.
                </p>
                <p>
                  <strong>
                    Not all legacy analytes should be interpreted.
                  </strong>{" "}
                  Race-labeled eGFR fields are preserved in the raw archive but
                  excluded from this explorer’s comparison menu.
                </p>
                <p>
                  <strong>NASA hosting is not clinical validation.</strong> The
                  data does not validate PROHOR’s heuristic thresholds, actions
                  or anatomy display.
                </p>
              </div>
              <External href="https://www.nature.com/articles/s41586-024-07639-y">
                SOMA research context
              </External>
            </Panel>
          </div>
        </>
      )}
      <Panel>
        <SectionHead
          eyebrow="REAL NASA API / DATED OFFLINE FALLBACK"
          title="Research library"
        >
          <button
            className="button secondary small"
            disabled={feed.busy}
            onClick={() => void feed.refresh()}
          >
            <RefreshCw size={14} className={feed.busy ? "spin" : ""} />
            {feed.busy ? "Checking source…" : "Refresh metadata"}
          </button>
        </SectionHead>
        <div className="library-controls">
          <label className="search-field">
            <Search size={16} />
            <input
              aria-label="Search NASA study library"
              placeholder="Search these studies…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              checked={animals}
              onChange={(e) => setAnimals(e.target.checked)}
            />
            Include animal-study metadata
          </label>
        </div>
        <p className="small muted">
          {!feed.result
            ? feed.busy
              ? "Loading source…"
              : "No source data"
            : feed.result.status === "live"
              ? "Network response"
              : "Dated snapshot"}{" "}
          · retrieved {utc(feed.result?.retrievedAt)}. This is a curated
          library, not a search of every NASA study. OSD-569 and OSD-571 are
          study metadata only; they are not part of the metabolic-panel chart or
          a source of personal thresholds.
        </p>
        {feed.error && <Notice tone="warning">{feed.error}</Notice>}
        {feed.result?.notice && (
          <p className="small muted">{feed.result.notice}</p>
        )}
        <div className="study-grid">
          {studies.map((s) => (
            <article className="study-card" key={s.accession}>
              <div>
                <span className="accession">{s.accession}</span>
                <span className="small muted">{s.organism}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.kind}</p>
              <details>
                <summary>Read source description</summary>
                <p>{s.description}</p>
              </details>
              <External href={s.url}>View study at NASA</External>
            </article>
          ))}
        </div>
        {!studies.length && !feed.busy && <p>No studies match this filter.</p>}
      </Panel>
    </>
  );
}
