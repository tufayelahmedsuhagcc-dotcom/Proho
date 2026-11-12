import { useId, useState } from "react";
import type { Reading, Baseline, Signal } from "../types";
import { SIGNALS } from "../data/catalog";
export function Sparkline({
  rows,
  color = "var(--mint)",
}: {
  rows: Reading[];
  color?: string;
}) {
  const first = rows[0]?.day ?? 0,
    last = rows.at(-1)?.day ?? -1,
    map = new Map(rows.map((r) => [r.day, r]));
  const values = Array.from(
      { length: Math.max(0, last - first + 1) },
      (_, i) => {
        const r = map.get(first + i);
        return r?.quality === "valid" ? r.value : null;
      },
    ),
    valid = values.filter((v): v is number => v !== null);
  if (!valid.length) return <div className="spark-empty">No readings</div>;
  const min = Math.min(...valid),
    max = Math.max(...valid),
    range = max - min || 1;
  let paths: string[] = [];
  let active = "";
  values.forEach((v, i) => {
    if (v === null) {
      if (active) paths.push(active);
      active = "";
    } else
      active += `${active ? "L" : "M"}${(i / (values.length - 1 || 1)) * 100} ${32 - ((v - min) / range) * 25} `;
  });
  if (active) paths.push(active);
  return (
    <svg className="sparkline" viewBox="0 0 100 38" aria-hidden="true">
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="1.7"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
export function TrendChart({
  rows,
  baseline,
  signal,
  endDay,
  window = 14,
}: {
  rows: Reading[];
  baseline: Baseline | null;
  signal: Signal;
  endDay: number;
  window?: number;
}) {
  const uid = useId(),
    [hover, setHover] = useState<number | null>(null);
  const s = SIGNALS[signal];
  const from = endDay - window + 1,
    days = Array.from({ length: window }, (_, i) => from + i);
  const map = new Map(rows.map((r) => [r.day, r]));
  const all = rows
    .filter((r) => r.value !== null && r.quality === "valid")
    .map((r) => r.value!);
  if (baseline) all.push(baseline.q1, baseline.q3, baseline.median);
  if (!all.length)
    return (
      <div className="empty-chart">
        Log readings to see a trend. Missing data is never filled in.
      </div>
    );
  const lo = Math.min(...all),
    hi = Math.max(...all),
    padding = Math.max((hi - lo) * 0.25, s.floor * 0.25),
    min = lo - padding,
    max = hi + padding;
  const X = (day: number) => 52 + ((day - from) / (window - 1)) * 600,
    Y = (v: number) => 205 - ((v - min) / (max - min)) * 165;
  let segment = "",
    segments: string[] = [];
  days.forEach((d) => {
    const r = map.get(d);
    if (!r || r.value === null || r.quality !== "valid") {
      if (segment) segments.push(segment);
      segment = "";
    } else segment += `${segment ? "L" : "M"}${X(d)},${Y(r.value)} `;
  });
  if (segment) segments.push(segment);
  const active = hover === null ? null : map.get(days[hover]);
  return (
    <div className="chart-wrap">
      <div className="chart-caption">
        <span>
          <i className="legend-line" /> {s.label}
        </span>
        <span>
          <i className="legend-band" /> Personal IQR (middle 50%)
        </span>
      </div>
      <svg
        viewBox="0 0 690 246"
        role="img"
        aria-label={`${s.label} over ${window} mission days. Use left and right arrow keys to inspect. A complete data table follows.`}
        tabIndex={0}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          setHover(
            Math.max(
              0,
              Math.min(
                window - 1,
                Math.round(
                  ((((e.clientX - box.left) / box.width) * 690 - 52) / 600) *
                    (window - 1),
                ),
              ),
            ),
          );
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            setHover(Math.min(window - 1, (hover ?? -1) + 1));
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            setHover(Math.max(0, (hover ?? window) - 1));
          }
        }}
      >
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="var(--mint)" stopOpacity=".13" />
            <stop offset="1" stopColor="var(--mint)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 4 }, (_, i) => {
          const v = min + ((max - min) * i) / 3;
          return (
            <g key={i}>
              <line
                x1="52"
                y1={Y(v)}
                x2="652"
                y2={Y(v)}
                stroke="var(--line)"
                strokeDasharray="3 5"
              />
              <text
                x="40"
                y={Y(v) + 3}
                textAnchor="end"
                fill="var(--muted)"
                fontSize="10"
              >
                {v.toFixed(s.digits)}
              </text>
            </g>
          );
        })}
        {baseline && (
          <g>
            <rect
              x="52"
              y={Y(baseline.q3)}
              width="600"
              height={Math.max(3, Y(baseline.q1) - Y(baseline.q3))}
              fill="var(--chart-band)"
            />
            <path
              d={`M52 ${Y(baseline.median)}H652`}
              stroke="var(--mint)"
              strokeWidth=".8"
              strokeDasharray="5 5"
              opacity=".8"
            />
          </g>
        )}
        {segments.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="var(--mint)"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
        ))}
        {days.map((d, i) => {
          const r = map.get(d);
          return (
            <g key={d}>
              {r?.value !== null &&
              r?.value !== undefined &&
              r.quality === "valid" ? (
                <circle
                  cx={X(d)}
                  cy={Y(r.value)}
                  r={i === hover ? 5 : 3}
                  stroke="var(--mint)"
                  fill="var(--panel)"
                />
              ) : (
                <path
                  d={`M${X(d) - 3} 201l6 6m0-6l-6 6`}
                  stroke="var(--muted)"
                />
              )}
              {(i === 0 || i === days.length - 1 || i % 3 === 0) && (
                <text
                  x={X(d)}
                  y="230"
                  textAnchor="middle"
                  fill="var(--muted)"
                  fontSize="10"
                >
                  {d}
                </text>
              )}
            </g>
          );
        })}
        {hover !== null && (
          <line
            x1={X(days[hover])}
            y1="35"
            x2={X(days[hover])}
            y2="209"
            stroke="var(--muted)"
            opacity=".35"
          />
        )}
      </svg>
      <div className="chart-readout" aria-live="polite">
        {hover !== null ? (
          <>
            FD {days[hover]} ·{" "}
            {active?.value !== null &&
            active?.value !== undefined &&
            active.quality === "valid"
              ? `${active.value.toFixed(s.digits)} ${s.unit}`
              : "No usable reading"}
          </>
        ) : (
          <>Flight day · Gaps indicate missing or invalid data</>
        )}
      </div>
      <details className="chart-table">
        <summary>View accessible data table</summary>
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Scrollable data table"
        >
          <table>
            <thead>
              <tr>
                <th>Flight day</th>
                <th>Reading</th>
                <th>Quality</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => {
                const r = map.get(d);
                return (
                  <tr key={d}>
                    <td>{d}</td>
                    <td>
                      {r?.value ?? "—"}{" "}
                      {r?.value !== null && r?.value !== undefined
                        ? s.unit
                        : ""}
                    </td>
                    <td>{r?.quality || "missing"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
