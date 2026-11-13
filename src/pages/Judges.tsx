import { ArrowRight, ArrowUpRight, Download, FileText } from "lucide-react";
import { External, Notice, Panel, SectionHead } from "../components/UI";
import { useProhor } from "../lib/context";

const PDF = "/docs/PROHOR_Judges_Brief.pdf";
const REPO = "https://github.com/tufayelahmedsuhagcc-dotcom/prohor";

export function Judges() {
  const c = useProhor();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">PROHOR / JUDGES’ RESOURCES</span>
          <h1>
            Everything behind <span>the demonstration.</span>
          </h1>
          <p>
            One clear starting point for the data, decisions and limitations
            behind our prototype.
          </p>
        </div>
      </div>
      <section className="judge-brief-hero" aria-labelledby="brief-title">
        <div className="brief-icon" aria-hidden="true">
          <FileText size={26} />
        </div>
        <div>
          <span className="eyebrow">PROJECT BRIEF / PDF</span>
          <h2 id="brief-title">Review the evidence, not just the interface.</h2>
          <p>
            A concise guide to the challenge, NASA data, integrations, baseline
            method, demo and scientific boundaries. Includes links to primary
            sources and code.
          </p>
          <div className="brief-actions">
            <a
              className="button primary"
              href={PDF}
              download="PROHOR_Judges_Brief.pdf"
            >
              <Download size={16} /> Download judges’ brief
            </a>
            <a
              className="button secondary"
              href={PDF}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open PDF <ArrowUpRight size={15} />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
          <p className="small muted">
            Static project document · No personal readings are included ·
            Available offline after a successful cache
          </p>
        </div>
      </section>
      <div className="two-columns judges-columns">
        <Panel>
          <SectionHead
            eyebrow="THE WORKING WALKTHROUGH"
            title="See the workflow"
          />
          <p>
            Use the labeled synthetic mission, inspect its prior-day rule,
            explore historical NASA research, and prepare a handover for a
            human.
          </p>
          <ol className="judge-list">
            <li>
              <strong>01 / Observe</strong> — A simulated sleep change appears
              on flight day 146.
            </li>
            <li>
              <strong>02 / Understand</strong> — Review the baseline window,
              rule and data coverage.
            </li>
            <li>
              <strong>03 / Prepare</strong> — Explore NASA evidence and export a
              structured handover.
            </li>
          </ol>
          <button className="text-button" onClick={() => c.setPage("overview")}>
            Open the guided tour <ArrowRight size={15} />
          </button>
        </Panel>
        <Panel>
          <SectionHead eyebrow="REPRODUCIBILITY" title="Inspect the source" />
          <p>
            Read the public repository, data provenance, baseline methodology
            and software test documentation. NASA’s archive and source manifest
            remain accessible from the evidence explorer.
          </p>
          <div className="judge-source-links">
            <External href={REPO}>Source code and README</External>
            <External href={`${REPO}/blob/main/docs/DATA-PROVENANCE.md`}>
              Data provenance
            </External>
            <External href={`${REPO}/blob/main/docs/METHODOLOGY.md`}>
              Baseline methodology
            </External>
            <External href="https://osdr.nasa.gov/bio/repo/data/studies/OSD-575">
              NASA OSD-575 study
            </External>
          </div>
        </Panel>
      </div>
      <Notice>
        PROHOR is an independent research prototype, not NASA-endorsed and not a
        medical device. NASA study data are historical and separate from
        simulated or local crew readings. No clinical validation is claimed.
      </Notice>
    </>
  );
}
