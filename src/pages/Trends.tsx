import { useState } from "react";
import {
  ArrowRight,
  SlidersHorizontal,
  Info,
  Download,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { useProhor } from "../lib/context";
import { SIGNALS, SIGNAL_KEYS, DOMAINS, SOURCES } from "../data/catalog";
import {
  chartRows,
  valueLabel,
  signed,
  RULE_VERSION,
  latestPerDay,
} from "../compute/engine";
import { TrendChart } from "../components/Charts";
import { Badge, Panel, SectionHead, Notice, External } from "../components/UI";
import type { Signal } from "../types";
export function Trends() {
  const c = useProhor(),
    [signal, setSignal] = useState<Signal>(
      DOMAINS.find((d) => d.key === c.selected)!.signals[0],
    ),
    [window, setWindow] = useState(14);
  const a = c.assessments.find((a) => a.signal === signal)!,
    s = SIGNALS[signal],
    flagged = c.assessments.filter((a) => a.state === "watch");
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">EXPLAINABLE BY DESIGN</span>
          <h1>
            Know what changed. <span>And why it was flagged.</span>
          </h1>
          <p>
            No black-box health score. Every comparison is traceable to a
            reading and a rule.
          </p>
        </div>
      </div>
      {flagged.length >= 2 && (
        <Notice tone="warning">
          <strong>
            {flagged.length} indicators changed together on FD {c.day}.
          </strong>{" "}
          This is a co-occurring pattern, not evidence of a shared cause. Review
          workload, sleep, device quality and symptoms with the appropriate crew
          professional.
        </Notice>
      )}
      <Panel>
        <SectionHead eyebrow="LONGITUDINAL VIEW" title="Your personal trend">
          <div className="toolbar">
            <label className="sr-only" htmlFor="trend-signal">
              Trend indicator
            </label>
            <select
              id="trend-signal"
              value={signal}
              onChange={(e) => setSignal(e.target.value as Signal)}
            >
              {SIGNAL_KEYS.map((k) => (
                <option key={k} value={k}>
                  {SIGNALS[k].label}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="trend-window">
              Chart window
            </label>
            <select
              id="trend-window"
              value={window}
              onChange={(e) => setWindow(Number(e.target.value))}
            >
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>
        </SectionHead>
        <div className="trend-hero">
          <div>
            <span className="muted">
              FD {c.day} · {s.label}
            </span>
            <div className="big-number">
              {valueLabel(a.current?.value, signal)} <small>{s.unit}</small>
            </div>
          </div>
          <div>
            <Badge state={a.state} />
            {a.delta !== null && (
              <p>
                {signed(a.delta, s.digits)} {s.unit} from personal median
              </p>
            )}
          </div>
        </div>
        <TrendChart
          rows={chartRows(c.rows, signal, c.crew, c.mode, c.day, window)}
          baseline={a.baseline}
          signal={signal}
          endDay={c.day}
          window={window}
        />
      </Panel>
      <div className="two-columns">
        <Panel>
          <SectionHead
            eyebrow="THE MATH, NOT A DIAGNOSIS"
            title="Inside this comparison"
          />
          <div className="key-values">
            <div>
              <span>Current reading</span>
              <strong>
                {valueLabel(a.current?.value, signal)} {s.unit}
              </strong>
            </div>
            <div>
              <span>Personal median</span>
              <strong>
                {a.baseline
                  ? `${valueLabel(a.baseline.median, signal)} ${s.unit}`
                  : "Not established"}
              </strong>
            </div>
            <div>
              <span>Baseline window</span>
              <strong>
                {a.baseline
                  ? `FD ${a.baseline.start}–${a.baseline.end}`
                  : "7+ prior days needed"}
              </strong>
            </div>
            <div>
              <span>Valid prior days</span>
              <strong>
                {a.baseline ? `${a.baseline.n} / 30` : "Insufficient"}
              </strong>
            </div>
            <div>
              <span>Prototype change band</span>
              <strong>
                {a.baseline
                  ? `${valueLabel(a.baseline.low, signal)}–${valueLabel(a.baseline.high, signal)} ${s.unit}`
                  : "Not calculated"}
              </strong>
            </div>
            <div>
              <span>Rule direction</span>
              <strong>
                {s.direction === "both"
                  ? "Either direction"
                  : s.direction === "low"
                    ? "Lower values only"
                    : "Higher values only"}
              </strong>
            </div>
          </div>
          <div className="formula">
            median ± max(1.5 × IQR, {s.floor} {s.unit})
          </div>
          <p className="small muted">
            {RULE_VERSION} · Current and future days excluded. Invalid and
            missing observations excluded. Latest entry per day used. Demo
            enrollment is fixed at FD 111–140; local inputs use the preceding 30
            days.
          </p>
          <Notice>
            The change band is an unvalidated prototype heuristic, not a NASA
            medical limit. Noise floors are developer-selected. An established
            personal baseline can still be unhealthy.
          </Notice>
        </Panel>
        <Panel>
          <SectionHead
            eyebrow="READING → RULE → CONTEXT"
            title="A plain-language explanation"
          />
          <ol className="explanation-list">
            <li>
              <span>01</span>
              <div>
                <h3>What changed</h3>
                <p>
                  {a.delta !== null
                    ? `${s.label} is ${Math.abs(a.delta).toFixed(s.digits)} ${s.unit} ${a.delta < 0 ? "below" : "above"} your personal median.`
                    : "No supported comparison is available yet."}
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>What the rule says</h3>
                <p>{a.reason}</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>What we cannot infer</h3>
                <p>{s.limitation}</p>
              </div>
            </li>
            <li>
              <span>04</span>
              <div>
                <h3>A reasonable next step</h3>
                <p>
                  Check measurement context. Follow your mission-approved
                  routine and seek medical review for persistent concerns. Do
                  not alter medication or treatment based on this app.
                </p>
              </div>
            </li>
          </ol>
          <External href={SOURCES.standard.url}>
            NASA Standard Measures · contextual evidence
          </External>
        </Panel>
      </div>
      <Panel>
        <SectionHead eyebrow="NOTHING HIDDEN" title="Data coverage & quality" />
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Scrollable data table"
        >
          <table>
            <thead>
              <tr>
                <th>Indicator</th>
                <th>Today</th>
                <th>Baseline days</th>
                <th>Data state</th>
                <th>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {c.assessments.map((x) => (
                <tr key={x.signal}>
                  <td>{SIGNALS[x.signal].label}</td>
                  <td className="mono">
                    {valueLabel(x.current?.value, x.signal)}{" "}
                    {SIGNALS[x.signal].unit}
                  </td>
                  <td>{x.baseline?.n ?? "Fewer than 7"}</td>
                  <td>
                    <Badge state={x.state} />
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`Inspect ${SIGNALS[x.signal].label}`}
                      onClick={() => {
                        setSignal(x.signal);
                        document
                          .querySelector("main")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <ArrowRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
