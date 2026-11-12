import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, ArrowRight, CheckCircle2 } from "lucide-react";
import { useProhor } from "../lib/context";
import { DAYS } from "../data/demo";
import { Panel, SectionHead, Notice, Empty } from "../components/UI";
import { MetricCard, AtlasPanel } from "./Overview";
export function Replay() {
  const c = useProhor(),
    [playing, setPlaying] = useState(false);
  const stage = DAYS.find((x) => x.day === c.day);
  useEffect(() => {
    if (!playing) return;
    if (c.mode !== "demo" || c.crew !== "CDR-01" || c.day >= 147) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => c.setView({ day: c.day + 1 }), 3500);
    return () => clearTimeout(t);
  }, [playing, c.day, c.mode, c.crew]);
  function load(day: number) {
    setPlaying(false);
    c.setView({ mode: "demo", crew: "CDR-01", day });
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            A REPRODUCIBLE SCENARIO / NOT A LIVE STREAM
          </span>
          <h1>
            One crew. Six days. <span>A pattern made visible.</span>
          </h1>
          <p>
            Step through a planted, deterministic change. Nothing here is real
            astronaut telemetry.
          </p>
        </div>
        <div className="toolbar">
          <button className="button secondary" onClick={() => load(142)}>
            <RotateCcw size={15} />
            Reset replay
          </button>
          <button
            className="button primary"
            onClick={() => {
              if (playing) setPlaying(false);
              else {
                if (
                  c.mode !== "demo" ||
                  c.crew !== "CDR-01" ||
                  c.day < 142 ||
                  c.day >= 147
                )
                  c.setView({ mode: "demo", crew: "CDR-01", day: 142 });
                setPlaying(true);
              }
            }}
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}{" "}
            {playing ? "Pause replay" : "Play scenario"}
          </button>
        </div>
      </div>
      <Notice>
        Replay does not change your local readings. The synthetic enrollment
        baseline contains 30 prior days. Scenario recovery is illustrative, not
        evidence that a countermeasure works.
      </Notice>
      <Panel className="replay-panel">
        <div className="replay-state">
          <span className={`status-dot ${playing ? "within" : "missing"}`} />
          {playing
            ? "REPLAY RUNNING · 3.5 SECONDS PER FLIGHT DAY"
            : "REPLAY PAUSED · SELECT A DAY"}
          <span className="small-badge">SIMULATION</span>
        </div>
        <div className="replay-timeline">
          {DAYS.map((d, i) => (
            <button
              className={c.mode === "demo" && c.day === d.day ? "active" : ""}
              key={d.day}
              onClick={() => load(d.day)}
              aria-pressed={c.mode === "demo" && c.day === d.day}
            >
              <span className="timeline-dot">{i + 1}</span>
              <small>FD {d.day}</small>
              <strong>{d.title}</strong>
            </button>
          ))}
        </div>
        <div className="replay-narrative">
          <span className="eyebrow">
            {c.mode === "demo" && stage
              ? `CHAPTER ${DAYS.indexOf(stage) + 1} OF 6`
              : "READY WHEN YOU ARE"}
          </span>
          <h2>
            {c.mode === "demo" && stage
              ? stage.title
              : "Load the synthetic mission"}
          </h2>
          <p>
            {c.mode === "demo" && stage
              ? stage.detail
              : "Choose a day above to inspect the known fixture. Personal records remain separate."}
          </p>
        </div>
      </Panel>
      {c.mode === "demo" && (
        <>
          <div className="metrics-grid">
            {(["sleep", "hr", "hrv", "exercise"] as const).map((s) => (
              <MetricCard key={s} signal={s} />
            ))}
          </div>
          <AtlasPanel />
        </>
      )}
      <Panel>
        <SectionHead
          eyebrow="A COMPLETE REVIEW LOOP"
          title="Take the next step"
        />
        <div className="journey-grid">
          {[
            [
              "trends",
              "01",
              "Inspect the rule",
              "See exactly which measurements crossed the transparent change band.",
            ],
            [
              "evidence",
              "02",
              "Verify the NASA source",
              "Open a real published dataset with its limitations and original CSV.",
            ],
            [
              "handover",
              "03",
              "Export the context",
              "Prepare a structured review packet. Nothing is sent automatically.",
            ],
          ].map(([page, n, t, p]) => (
            <button
              key={page}
              className="journey-card"
              onClick={() => c.setPage(page)}
            >
              <span className="eyebrow">{n} / REVIEW</span>
              <h3>
                {t}
                <ArrowRight size={17} />
              </h3>
              <p>{p}</p>
            </button>
          ))}
        </div>
      </Panel>
    </>
  );
}
