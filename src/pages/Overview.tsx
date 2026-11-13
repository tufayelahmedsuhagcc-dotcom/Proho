import { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Activity,
  Moon,
  Heart,
  Wind,
  Thermometer,
  Plus,
  Check,
  ShieldCheck,
  Database,
  ChevronRight,
  Focus,
} from "lucide-react";
import { useProhor } from "../lib/context";
import {
  DOMAINS,
  SIGNALS,
  SOURCES,
  STATE_LABEL,
  ACTIONS,
} from "../data/catalog";
import { domainState, valueLabel, signed, chartRows } from "../compute/engine";
import {
  Panel,
  SectionHead,
  Badge,
  External,
  Notice,
  Empty,
} from "../components/UI";
import { BodyAtlas } from "../components/BodyAtlas";
import { ProjectVideo } from "../components/Presentation";
import { Sparkline, TrendChart } from "../components/Charts";
import type { Signal } from "../types";
const ICONS = { sleep: Moon, hr: Heart, spo2: Wind, temp: Thermometer };
export function MetricCard({ signal }: { signal: Signal }) {
  const c = useProhor(),
    a = c.assessments.find((a) => a.signal === signal)!,
    s = SIGNALS[signal],
    Icon = ICONS[signal as keyof typeof ICONS] || Activity;
  return (
    <button
      className="metric-card"
      onClick={() => {
        c.select(s.domain);
        c.setPage("trends");
      }}
    >
      <div className="metric-top">
        <span>
          <Icon size={15} />
          {s.short}
        </span>
        <ArrowUpRight size={14} />
      </div>
      <div className="metric-main">
        <div className="metric-value">
          {valueLabel(a.current?.value, signal)}
          <span>{s.unit}</span>
        </div>
        <Sparkline
          rows={chartRows(c.rows, signal, c.crew, c.mode, c.day, 10)}
          color={a.state === "watch" ? "var(--amber)" : "var(--mint)"}
        />
      </div>
      <div className="metric-foot">
        <span className={`status-dot ${a.state}`} />
        {a.delta !== null
          ? `${signed(a.delta, s.digits)} ${s.unit} vs baseline`
          : STATE_LABEL[a.state]}
      </div>
    </button>
  );
}
export function AtlasPanel({ expanded = false }: { expanded?: boolean }) {
  const c = useProhor(),
    [skeleton, setSkeleton] = useState(false),
    d = DOMAINS.find((d) => d.key === c.selected)!,
    state = domainState(c.assessments, c.selected),
    signals = c.assessments.filter((a) => d.signals.includes(a.signal)),
    representative = signals.find((a) => a.state === "watch") || signals[0];
  return (
    <Panel className={`atlas-panel ${expanded ? "expanded" : ""}`}>
      <SectionHead eyebrow="YOUR BODY, IN CONTEXT" title="Health intelligence">
        <div className="segmented small">
          <button
            className={!skeleton ? "active" : ""}
            onClick={() => setSkeleton(false)}
            aria-pressed={!skeleton}
          >
            Anatomy
          </button>
          <button
            className={skeleton ? "active" : ""}
            onClick={() => setSkeleton(true)}
            aria-pressed={skeleton}
          >
            Skeleton
          </button>
        </div>
      </SectionHead>
      <div className="atlas-grid">
        <div className="system-list">
          <span className="eyebrow">MONITORED SYSTEMS</span>
          {DOMAINS.map((sys, i) => {
            const s = domainState(c.assessments, sys.key);
            return (
              <button
                key={sys.key}
                className={`system-item ${c.selected === sys.key ? "selected" : ""}`}
                onClick={() => c.select(sys.key)}
                aria-pressed={c.selected === sys.key}
              >
                <span className="system-no">0{i + 1}</span>
                <span>
                  <strong>{sys.short}</strong>
                  <small>
                    <i className={`status-dot ${s}`} />
                    {STATE_LABEL[s]}
                  </small>
                </span>
                <ChevronRight size={13} />
              </button>
            );
          })}
          <div className="atlas-note">
            <Focus size={15} />
            <p>Select a system to trace the reading, baseline and evidence.</p>
          </div>
        </div>
        <div className="anatomy-stage">
          <BodyAtlas
            assessments={c.assessments}
            selected={c.selected}
            onSelect={c.select}
            skeleton={skeleton}
          />
          <div className="body-caption">ILLUSTRATION, NOT A CLINICAL SCAN</div>
        </div>
        <div className="system-detail" key={c.selected}>
          <span className="eyebrow">
            0{DOMAINS.indexOf(d) + 1} / SELECTED SYSTEM
          </span>
          <h3>{d.label}</h3>
          <Badge state={state} />
          <p className="system-description">{d.description}</p>
          <div className="detail-readings">
            {signals.map((a) => (
              <div key={a.signal}>
                <span>{SIGNALS[a.signal].short}</span>
                <strong>
                  {valueLabel(a.current?.value, a.signal)}
                  <small> {SIGNALS[a.signal].unit}</small>
                </strong>
              </div>
            ))}
          </div>
          {representative?.baseline ? (
            <div className="baseline-summary">
              <span className="eyebrow">PERSONAL BASELINE</span>
              <p>
                <strong>{representative.baseline.n} prior days</strong> ·{" "}
                {representative.baseline.n >= 21
                  ? "established"
                  : "provisional"}
              </p>
              <small>Rule-based comparison. Not a medical threshold.</small>
            </div>
          ) : (
            <div className="baseline-summary">
              <strong>Not enough prior readings</strong>
              <p>
                At least 7 distinct days are needed. No comparison is invented.
              </p>
            </div>
          )}
          <button className="text-button" onClick={() => c.setPage("trends")}>
            Inspect the evidence <ArrowRight size={14} />
          </button>
          <div className="hazard-tag">
            <span>RELATED SPACEFLIGHT HAZARD</span>
            <strong>{d.hazard}</strong>
          </div>
        </div>
      </div>
      <div className="atlas-footer">
        <div>
          <span>
            <i className="status-dot within" />
            Within baseline
          </span>
          <span>
            <i className="status-dot watch" />
            Review change
          </span>
          <span>
            <i className="status-dot missing" />
            Limited data
          </span>
        </div>
        <p>
          Colors describe available indicators—not healthy or damaged organs.
        </p>
      </div>
    </Panel>
  );
}
export function Overview() {
  const c = useProhor(),
    flagged = c.assessments.filter((a) => a.state === "watch"),
    available = c.assessments.filter(
      (a) => a.current?.quality === "valid" && a.current.value !== null,
    ).length;
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            CREW HEALTH / FLIGHT DAY {c.day.toString().padStart(3, "0")}
          </div>
          <h1>
            A little farther from Earth.
            <br className="mobile-only" /> <span>A little closer to you.</span>
          </h1>
          <p>Your readings. Your baseline. A clearer next step.</p>
        </div>
        <button
          className="button secondary"
          onClick={() => c.setPage("replay")}
        >
          <Activity size={15} />
          Explore the mission replay
          <ArrowUpRight size={15} />
        </button>
      </div>
      <section className="judge-path" aria-labelledby="judge-path-title">
        <div className="judge-path-intro">
          <span className="eyebrow">A QUICK GUIDED TOUR / SYNTHETIC DEMO</span>
          <h2 id="judge-path-title">One reading. A clearer story.</h2>
          <p>
            Follow a simulated sleep change from personal baseline to NASA
            research and a human-review handover. Selecting a step switches to
            the demo view; your local entries remain on this device.
          </p>
          <button
            className="judge-resource-link"
            onClick={() => c.setPage("judges")}
          >
            Judges’ resources &amp; PDF{" "}
            <ArrowUpRight size={15} aria-hidden="true" />
          </button>
        </div>
        <div className="judge-path-steps" aria-label="Guided demo steps">
          {[
            {
              number: "01",
              title: "See the change",
              detail: "Sleep & personal baseline",
              page: "trends",
            },
            {
              number: "02",
              title: "Explore the evidence",
              detail: "NASA OSD-575 research",
              page: "evidence",
            },
            {
              number: "03",
              title: "Prepare for review",
              detail: "A handover for a human",
              page: "handover",
            },
          ].map((step) => (
            <button
              key={step.number}
              className="judge-path-step"
              onClick={() => {
                if (c.storageWarning) {
                  c.toast(
                    "Demo navigation is unavailable until the local storage warning is resolved in Data & settings.",
                  );
                  return;
                }
                if (!c.setView({ mode: "demo", crew: "CDR-01", day: 146 }))
                  return;
                c.select("neuro");
                c.setPage(step.page);
              }}
            >
              <span className="judge-step-number">{step.number}</span>
              <span>
                <strong>{step.title}</strong>
                <small>{step.detail}</small>
              </span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>
      <div className="summary-strip">
        <div>
          <span
            className={`status-dot ${flagged.length ? "watch" : "within"}`}
          />
          <strong>
            {flagged.length
              ? `${flagged.length} indicators to review`
              : c.mode === "local" && !available
                ? "Your workspace is ready"
                : "No rule-level changes"}
          </strong>
          <span className="strip-divider" />
          <span>{available} of 12 readings available today</span>
        </div>
        <button onClick={() => c.setPage("trends")}>
          View analysis <ArrowRight size={14} />
        </button>
      </div>
      <div className="metrics-grid">
        {(["sleep", "hr", "spo2", "temp"] as Signal[]).map((s) => (
          <MetricCard key={s} signal={s} />
        ))}
      </div>
      <AtlasPanel />
      <div className="lower-grid">
        <Panel className="next-step-panel">
          <SectionHead
            eyebrow="FROM OBSERVATION TO ACTION"
            title="Your next step"
          >
            <span className="small-badge">CREW ROUTINE</span>
          </SectionHead>
          <div className="next-action">
            <span className="action-icon">
              <Moon size={22} />
            </span>
            <div>
              <h3>
                {flagged.some((a) => a.signal === "sleep")
                  ? "Protect your next sleep window"
                  : "Keep your check-in routine"}
              </h3>
              <p>
                {flagged.some((a) => a.signal === "sleep")
                  ? "Review your assigned rest period and document interruptions. A change is a prompt to check—not a diagnosis."
                  : "Record consistent measurements and context. Missing observations are visible, never treated as normal."}
              </p>
            </div>
          </div>
          <div className="panel-bottom">
            <External href={SOURCES.sleep.url}>NASA HRP evidence</External>
            <button
              className="text-button"
              onClick={() => c.setPage("actions")}
            >
              Open care plan <ArrowRight size={15} />
            </button>
          </div>
        </Panel>
        <Panel className="research-teaser">
          <span className="eyebrow">
            <Database size={12} /> GROUNDED IN NASA OPEN DATA
          </span>
          <h3>
            Small crew.
            <br />
            Real research. <span>Visible limits.</span>
          </h3>
          <p>
            Explore 531 published metabolic-panel observations from NASA’s
            Inspiration4 archive. See the original values and the checks behind
            them.
          </p>
          <button className="text-button" onClick={() => c.setPage("evidence")}>
            Explore OSD-575 <ArrowUpRight size={15} />
          </button>
          <span className="orbital-watermark" aria-hidden="true">
            ◎
          </span>
        </Panel>
      </div>
      <section className="landing-film" aria-labelledby="landing-film-title">
        <div className="landing-film-heading">
          <span className="eyebrow">THE PROJECT IN 30 SECONDS</span>
          <h2 id="landing-film-title">The mission, in a moment.</h2>
          <p>
            Meet the idea behind PROHOR, then explore the workspace yourself.
          </p>
        </div>
        <ProjectVideo kind="short" compact />
        <button className="text-button" onClick={() => c.setPage("judges")}>
          Explore both videos and seven slides{" "}
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      </section>
      <div className="quiet-disclaimer">
        <ShieldCheck size={15} />
        <span>
          Research prototype, not a medical device. If symptoms are severe or
          sudden, follow emergency procedures—do not wait for a baseline flag.
        </span>
      </div>
    </>
  );
}
