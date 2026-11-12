import { useState } from "react";
import {
  Download,
  Printer,
  ClipboardList,
  Copy,
  ShieldCheck,
} from "lucide-react";
import { useProhor } from "../lib/context";
import { SIGNALS, SOURCES, STATE_LABEL } from "../data/catalog";
import { valueLabel, RULE_VERSION } from "../compute/engine";
import { download } from "../lib/storage";
import { Panel, SectionHead, Notice, Badge } from "../components/UI";
export function Handover() {
  const c = useProhor(),
    [situation, setSituation] = useState(""),
    [background, setBackground] = useState(""),
    [request, setRequest] = useState("");
  const flags = c.assessments.filter((a) => a.state === "watch"),
    missing = c.assessments.filter(
      (a) => !a.current || a.current.quality !== "valid",
    );
  const report = () => ({
    project: "PROHOR",
    version: "3.0.0",
    generatedAt: new Date().toISOString(),
    purpose:
      "Non-diagnostic research review packet. Not sent to any recipient.",
    mode:
      c.mode === "demo"
        ? "SYNTHETIC DEMONSTRATION"
        : "LOCAL USER INPUT · UNVERIFIED",
    crew: c.crew,
    missionDay: c.day,
    rule: RULE_VERSION,
    situation,
    background,
    request,
    assessments: c.assessments,
    actions: c.store.actions.filter(
      (e) => e.mode === c.mode && e.day === c.day && e.crew === c.crew,
    ),
    sources: Object.values(SOURCES),
    limitations: [
      "Not a medical device or clinical assessment.",
      "Prototype change rules are not clinically validated.",
      "No diagnosis, prescription, radiation dose or fitness-for-duty decision.",
      "Absence of a flag is not evidence of good health.",
      "Historical NASA studies do not become personal clinical thresholds.",
    ],
  });
  const text = () => {
    const r = report();
    return `PROHOR · CREW REVIEW PACKET\n${r.mode}\nFlight day ${c.day} · ${c.crew}\nGenerated ${r.generatedAt}\nRule: ${RULE_VERSION}\n\nSITUATION\n${situation || "Not provided."}\n${flags.length} rule-level changes; ${missing.length} unavailable or invalid indicators.\n\nBACKGROUND\n${background || "Not provided."}\n\nOBSERVATIONS (NOT A DIAGNOSIS)\n${c.assessments.map((a) => `${SIGNALS[a.signal].label}: ${valueLabel(a.current?.value, a.signal)} ${SIGNALS[a.signal].unit} | ${STATE_LABEL[a.state]} | median ${a.baseline?.median ?? "not established"} | prior days ${a.baseline?.n ?? "insufficient"}`).join("\n")}\n\nREQUEST FOR REVIEW\n${request || "Not provided."}\n\nLIMITATIONS\n${r.limitations.join("\n")}\n\nNo message has been transmitted. Follow mission-approved emergency procedures for urgent concerns.\n`;
  };
  return (
    <>
      <div className="page-heading no-print">
        <div>
          <span className="eyebrow">CLEAR CONTEXT / HUMAN REVIEW</span>
          <h1>
            A better handover, <span>not an automated diagnosis.</span>
          </h1>
          <p>
            Prepare a structured review packet. Your free-text notes are
            retained only while this page is open; export to keep them.
          </p>
        </div>
        <button className="button secondary" onClick={() => window.print()}>
          <Printer size={16} />
          Print / save PDF
        </button>
      </div>
      <Notice>
        <strong>Nothing is sent.</strong> This tool does not contact a flight
        surgeon, emergency service or mission control. Review and share the
        export through your approved channel. Do not include identifying
        information.
      </Notice>
      <div className="two-columns handover-grid">
        <Panel className="no-print">
          <SectionHead
            title="Add the human context"
            eyebrow="OPTIONAL · MAX 1500 CHARACTERS EACH"
          />
          <label className="field">
            Situation
            <textarea
              rows={4}
              maxLength={1500}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="What changed, and what prompted this review?"
            />
          </label>
          <label className="field">
            Background
            <textarea
              rows={4}
              maxLength={1500}
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="Measurement context, workload, repeat readings…"
            />
          </label>
          <label className="field">
            Request for review
            <textarea
              rows={4}
              maxLength={1500}
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="What do you want the reviewer to consider?"
            />
          </label>
          <div className="report-buttons">
            <button
              className="button primary"
              onClick={() =>
                download(
                  `prohor-review-FD${c.day}.txt`,
                  text(),
                  "text/plain;charset=utf-8",
                )
              }
            >
              <Download size={15} />
              Download report
            </button>
            <button
              className="button secondary"
              onClick={() =>
                download(
                  `prohor-evidence-FD${c.day}.json`,
                  JSON.stringify(report(), null, 2),
                )
              }
            >
              Evidence JSON
            </button>
            <button
              className="button secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(text());
                  c.toast("Report copied. Nothing has been sent.");
                } catch {
                  c.toast(
                    "Clipboard permission unavailable. Use Download report instead.",
                  );
                }
              }}
            >
              <Copy size={15} />
              Copy
            </button>
          </div>
        </Panel>
        <Panel className="report-preview">
          <div className="report-brand">
            <img src="/icons/mark.svg" alt="" />
            <strong>
              PROHOR <span>/ REVIEW PACKET</span>
            </strong>
          </div>
          <h2>Crew health review</h2>
          <p>
            FD {c.day} · {c.crew} ·{" "}
            {c.mode === "demo"
              ? "SYNTHETIC DEMONSTRATION"
              : "LOCAL INPUT · UNVERIFIED"}
          </p>
          <div className="report-block">
            <span className="eyebrow">S / SITUATION</span>
            <p>{situation || "No additional situation entered."}</p>
            <strong>
              {flags.length} indicators changed · {missing.length} unavailable /
              invalid
            </strong>
          </div>
          <div className="report-block">
            <span className="eyebrow">B / BACKGROUND</span>
            <p>{background || "No additional background entered."}</p>
          </div>
          <div className="report-block">
            <span className="eyebrow">
              A / OBSERVATIONS — NOT A CLINICAL ASSESSMENT
            </span>
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
                    <th>Value</th>
                    <th>State</th>
                  </tr>
                </thead>
                <tbody>
                  {c.assessments.map((a) => (
                    <tr key={a.signal}>
                      <td>{SIGNALS[a.signal].short}</td>
                      <td>
                        {valueLabel(a.current?.value, a.signal)}{" "}
                        {SIGNALS[a.signal].unit}
                      </td>
                      <td>{STATE_LABEL[a.state]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="report-block">
            <span className="eyebrow">R / REQUEST FOR REVIEW</span>
            <p>{request || "No specific request entered."}</p>
          </div>
          <p className="small muted">
            Rule {RULE_VERSION}. Includes personal-baseline context, not
            clinical thresholds. No diagnosis or treatment decision. No NASA
            endorsement.
          </p>
        </Panel>
      </div>
    </>
  );
}
