import {
  Check,
  Clock,
  ArrowUpRight,
  ClipboardList,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { useProhor } from "../lib/context";
import { ACTIONS, SOURCES } from "../data/catalog";
import { Panel, SectionHead, External, Notice } from "../components/UI";
export function Actions() {
  const c = useProhor();
  const events = c.store.actions.filter(
    (e) => e.mode === c.mode && e.crew === c.crew && e.day === c.day,
  );
  const status = (id: string) =>
    events.filter((e) => e.action === id).at(-1)?.status;
  const done = ACTIONS.filter((a) => status(a.id) === "done").length;
  function record(action: string, s: "done" | "deferred") {
    const event = {
      id: crypto.randomUUID(),
      crew: c.crew,
      mode: c.mode,
      day: c.day,
      action,
      status: s,
      at: new Date().toISOString(),
    };
    if (c.commit({ ...c.store, actions: [...c.store.actions, event] }))
      c.toast(
        s === "done"
          ? "Task marked complete on this device."
          : "Task deferred. No health outcome is inferred.",
      );
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">OBSERVE → VERIFY → DOCUMENT</span>
          <h1>A practical next step.</h1>
          <p>
            NASA-informed routine prompts, adapted for this prototype. Not
            treatment instructions or a prescription.
          </p>
        </div>
        <button
          className="button secondary"
          onClick={() => c.setPage("handover")}
        >
          <ClipboardList size={16} />
          Prepare handover
        </button>
      </div>
      <div className="summary-strip">
        <div>
          <Check size={16} />
          <strong>
            {done} of {ACTIONS.length} routine tasks recorded
          </strong>
          <span className="strip-divider" />
          <span>
            FD {c.day} · {c.crew}
          </span>
        </div>
        <span className="small muted">
          Task completion is not a health score.
        </span>
      </div>
      <div className="action-grid">
        {ACTIONS.map((a, i) => (
          <Panel
            key={a.id}
            className={`action-card ${status(a.id) === "done" ? "completed" : ""}`}
          >
            <div className="action-card-top">
              <span className="eyebrow">
                0{i + 1} / {a.tag}
              </span>
              {status(a.id) === "done" && (
                <span className="badge within">
                  <Check size={12} />
                  Recorded done
                </span>
              )}
              {status(a.id) === "deferred" && (
                <span className="badge missing">Deferred</span>
              )}
            </div>
            <h2>{a.title}</h2>
            <p>{a.description}</p>
            <ol>
              {a.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <External href={SOURCES[a.source].url}>
              {SOURCES[a.source].title}
            </External>
            <div className="action-controls">
              <button
                className={`button small ${status(a.id) === "done" ? "secondary" : "primary"}`}
                disabled={status(a.id) === "done"}
                onClick={() => record(a.id, "done")}
              >
                <Check size={14} />
                Mark done
              </button>
              <button
                className="button small secondary"
                disabled={status(a.id) === "deferred"}
                onClick={() => record(a.id, "deferred")}
              >
                <Clock size={14} />
                Defer
              </button>
            </div>
          </Panel>
        ))}
      </div>
      <Notice tone="warning">
        <strong>When to get help:</strong> persistent or worsening concerns need
        review through your mission medical procedures. Severe or sudden
        symptoms require immediate emergency action, even if the app shows no
        change. This prototype cannot determine fitness for duty.
      </Notice>
      <Panel>
        <SectionHead
          eyebrow="STAY IN CONTROL"
          title="Keep the context with the handover"
        />
        <p>
          A structured report can include readings, baseline windows, rule
          versions, missing data and your own notes. Exporting does not contact
          a flight surgeon.
        </p>
        <button className="text-button" onClick={() => c.setPage("handover")}>
          Create a review packet <ArrowRight size={15} />
        </button>
      </Panel>
    </>
  );
}
