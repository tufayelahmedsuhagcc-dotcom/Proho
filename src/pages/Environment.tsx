import {
  RefreshCw,
  Orbit,
  Sun,
  Radio,
  ShieldAlert,
  ArrowRight,
  CloudOff,
} from "lucide-react";
import { useFeed, utc, ageHours } from "../lib/feeds";
import { useProhor } from "../lib/context";
import { Panel, SectionHead, Notice, External, Badge } from "../components/UI";
import { valueLabel } from "../compute/engine";
interface Weather {
  points: { time: string; kp: number }[];
  latest: { time: string; kp: number };
}
export function Environment() {
  const c = useProhor(),
    feed = useFeed<Weather>("space-weather"),
    d = feed.result?.data,
    latest = d?.latest,
    age = ageHours(latest?.time),
    fresh = Number.isFinite(age) && age >= 0 && age <= 6,
    co2 = c.assessments.find((x) => x.signal === "co2")!;
  const points = d?.points.slice(-24) || [];
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            ENVIRONMENTAL CONTEXT / SEPARATE DATA CHANNELS
          </span>
          <h1>Know what is around you.</h1>
          <p>
            Local cabin inputs and Earth space-weather observations have
            different meanings. We keep them apart.
          </p>
        </div>
        <button
          className="button secondary"
          disabled={feed.busy}
          onClick={() => void feed.refresh()}
        >
          <RefreshCw size={15} className={feed.busy ? "spin" : ""} />
          {feed.busy ? "Checking source…" : "Refresh external data"}
        </button>
      </div>
      <Notice tone="warning">
        <strong>Space weather is not personal radiation dose.</strong> Kp
        describes Earth’s geomagnetic activity. It cannot determine a crew
        member’s exposure, a Mars surface hazard or whether an EVA is safe. No
        dose conversion is performed.
      </Notice>
      <div className="environment-grid">
        <Panel className="space-context">
          <SectionHead
            eyebrow="EARTH / EXTERNAL OBSERVATION"
            title="Planetary geomagnetic activity"
          >
            <span
              className={`badge ${feed.result?.status === "live" && fresh ? "within" : "historical"}`}
            >
              {!feed.result
                ? feed.busy
                  ? "Loading source…"
                  : "No data"
                : feed.result.status === "live"
                  ? "Network response"
                  : "Cached snapshot"}
            </span>
          </SectionHead>
          <div className="earth-graphic" aria-hidden="true">
            <svg viewBox="0 0 400 220">
              <defs>
                <radialGradient id="earth-glow">
                  <stop stopColor="var(--earth-light)" stopOpacity=".8" />
                  <stop offset=".55" stopColor="var(--earth-mid)" />
                  <stop offset="1" stopColor="var(--earth-edge)" />
                </radialGradient>
              </defs>
              <ellipse
                cx="200"
                cy="112"
                rx="173"
                ry="50"
                stroke="var(--earth-orbit)"
                fill="none"
                transform="rotate(-24 200 112)"
              />
              <ellipse
                cx="200"
                cy="112"
                rx="145"
                ry="72"
                stroke="var(--earth-orbit)"
                fill="none"
                transform="rotate(22 200 112)"
              />
              <circle
                cx="200"
                cy="112"
                r="76"
                fill="url(#earth-glow)"
                stroke="var(--atlas-outline)"
                strokeOpacity=".5"
              />
              <g fill="none" stroke="var(--earth-grid)" opacity=".48">
                <ellipse cx="200" cy="112" rx="40" ry="76" />
                <ellipse cx="200" cy="112" rx="66" ry="76" />
                <ellipse cx="200" cy="112" rx="76" ry="30" />
                <path d="M125 112H275M136 74H264M136 149H264M200 36V188" />
              </g>
              <path
                d="M153 68L174 61L193 71L195 88L179 103L173 125L157 115L148 95ZM212 116L232 105L252 120L242 142L224 155L218 141Z"
                fill="var(--earth-land)"
                opacity=".7"
              />
              <circle cx="337" cy="62" r="3" fill="var(--amber)" />
            </svg>
            <span>SCHEMATIC · EARTH REFERENCE ONLY</span>
          </div>
          <div className="weather-number">
            <span>Latest observed Kp</span>
            <strong>
              {latest?.kp ?? "—"}
              <small> / 9</small>
            </strong>
            <span>
              {fresh
                ? "Observation age within 6 hours"
                : "Historical or stale observation"}{" "}
              · not a forecast
            </span>
          </div>
          <div className="key-values">
            <div>
              <span>Observed</span>
              <strong>{utc(latest?.time)}</strong>
            </div>
            <div>
              <span>Retrieved</span>
              <strong>{utc(feed.result?.retrievedAt)}</strong>
            </div>
            <div>
              <span>Source</span>
              <strong>NOAA SWPC</strong>
            </div>
          </div>
          <p className="small muted">
            {feed.result?.notice ||
              feed.error ||
              "Fetching the source; a bundled observation is available offline."}
          </p>
          <External href="https://www.swpc.noaa.gov/products/planetary-k-index">
            NOAA Kp documentation
          </External>
        </Panel>
        <div className="stack">
          <Panel>
            <SectionHead
              eyebrow={`${c.mode === "demo" ? "SIMULATED" : "LOCAL INPUT"} / NOT EXTERNAL WEATHER`}
              title="Your cabin context"
            />
            <div className="cabin-reading">
              <Radio size={28} />
              <div>
                <span>CO₂ partial pressure</span>
                <strong>
                  {valueLabel(co2.current?.value, "co2")} <small>mmHg</small>
                </strong>
              </div>
              <Badge state={co2.state} />
            </div>
            <p>
              FD {c.day} · {c.crew}.{" "}
              {c.mode === "demo"
                ? "Generated scenario data. No station sensor is connected."
                : "User-entered cabin reading, not independently verified."}
            </p>
            <Notice>
              This is not an exposure dose or a compliance assessment. ppm
              conversion is not offered without a documented cabin pressure.
            </Notice>
            <button className="text-button" onClick={() => c.openLog("co2")}>
              Log cabin sensor context <ArrowRight size={15} />
            </button>
          </Panel>
          <Panel>
            <SectionHead
              eyebrow="FIVE HAZARDS / ONE CREW"
              title="How this connects"
            />
            <div className="hazards-list">
              {[
                [
                  "01",
                  "Space radiation",
                  "External context only. No personal dosimeter or shielding model.",
                ],
                [
                  "02",
                  "Isolation & confinement",
                  "Sleep, mood and fatigue check-ins.",
                ],
                [
                  "03",
                  "Distance from Earth",
                  "Offline records and a structured, exportable handover.",
                ],
                [
                  "04",
                  "Gravity fields",
                  "Resting physiology and exercise-adherence context.",
                ],
                [
                  "05",
                  "Closed environments",
                  "Cabin inputs kept separate from Earth observations.",
                ],
              ].map(([n, t, p]) => (
                <div key={n}>
                  <span>{n}</span>
                  <div>
                    <h3>{t}</h3>
                    <p>{p}</p>
                  </div>
                </div>
              ))}
            </div>
            <External href="https://www.nasa.gov/hrp/hazards/">
              NASA Human Research Program
            </External>
          </Panel>
        </div>
      </div>
      {points.length > 0 && (
        <Panel>
          <SectionHead
            eyebrow="3-HOUR OBSERVATIONS / EARTH MAGNETOSPHERE"
            title="Recent Kp history"
          />
          <div className="kp-chart">
            <svg
              viewBox="0 0 880 180"
              role="img"
              aria-label="Last 24 available planetary Kp observations. Values are listed in the table."
            >
              {[0, 3, 6, 9].map((n) => (
                <g key={n}>
                  <text
                    x="10"
                    y={155 - (n / 9) * 130}
                    fill="var(--muted)"
                    fontSize="10"
                  >
                    {n}
                  </text>
                  <path
                    d={`M35 ${152 - (n / 9) * 130}H860`}
                    stroke="var(--line)"
                  />
                </g>
              ))}
              {points.map((p, i) => (
                <rect
                  key={p.time}
                  x={40 + i * 34}
                  y={152 - (p.kp / 9) * 130}
                  width="22"
                  height={Math.max(1, (p.kp / 9) * 130)}
                  rx="2"
                  fill={p.kp >= 5 ? "var(--amber)" : "var(--mint)"}
                  opacity=".9"
                >
                  <title>
                    {utc(p.time)}: Kp {p.kp}
                  </title>
                </rect>
              ))}
            </svg>
          </div>
          <details className="chart-table">
            <summary>View observation timestamps and values</summary>
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Scrollable data table"
            >
              <table>
                <thead>
                  <tr>
                    <th>Observed (UTC)</th>
                    <th>Kp</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((p) => (
                    <tr key={p.time}>
                      <td>{utc(p.time)}</td>
                      <td>{p.kp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </Panel>
      )}
    </>
  );
}
