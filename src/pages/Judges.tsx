import {
  ArrowRight,
  ArrowUpRight,
  Download,
  FileText,
  Database,
  Code2,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { External, Notice, Panel, SectionHead } from "../components/UI";
import { useProhor } from "../lib/context";
import { ProjectVideo, SlideDeck } from "../components/Presentation";

const PDF = "/docs/PROHOR_Judges_Brief.pdf";
const REPO = "https://github.com/tufayelahmedsuhagcc-dotcom/prohor";
const LIBRARY = [
  {
    number: "01",
    title: "Mission & demo",
    label: "THE STORY",
    description:
      "The problem, the working walkthrough, the team and what a judge can verify.",
    file: "PROHOR_01_Mission_and_Demo.pdf",
    icon: Compass,
  },
  {
    number: "02",
    title: "Data & evidence",
    label: "THE SOURCES",
    description:
      "NASA OSD-575, a reproducible glucose comparison, NOAA context and interpretation limits.",
    file: "PROHOR_02_Data_and_Evidence.pdf",
    icon: Database,
  },
  {
    number: "03",
    title: "Technology & method",
    label: "THE BUILD",
    description:
      "Architecture, integrations, the baseline rule, data quality and reproduction steps.",
    file: "PROHOR_03_Technology_and_Method.pdf",
    icon: Code2,
  },
  {
    number: "04",
    title: "Safety, impact & roadmap",
    label: "THE RESPONSIBILITY",
    description:
      "Privacy, honest boundaries, potential impact and the research needed before real use.",
    file: "PROHOR_04_Safety_Impact_and_Roadmap.pdf",
    icon: ShieldCheck,
  },
];

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
      <section className="judge-media" aria-labelledby="media-title">
        <div className="media-heading">
          <div>
            <span className="eyebrow">WATCH THE PROJECT</span>
            <h2 id="media-title">Two films. One mission.</h2>
            <p>A concise pitch and a deeper walkthrough of the prototype.</p>
          </div>
        </div>
        <div className="video-grid">
          <ProjectVideo kind="short" />
          <ProjectVideo kind="long" />
        </div>
        <p className="media-footnote">
          The app footage shows the updated local build. The films use synthetic
          demonstration readings; NASA study data are historical. Playback
          requires a connection.
        </p>
      </section>
      <SlideDeck />
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
      <section className="judge-library" aria-labelledby="library-title">
        <div className="judge-library-heading">
          <div>
            <span className="eyebrow">
              FOUR DEEP DIVES / ONE COMPLETE PICTURE
            </span>
            <h2 id="library-title">Explore the judges’ library.</h2>
            <p>
              Choose the question you want to explore. Each dossier is a
              separate, source-linked PDF.
            </p>
          </div>
          <a
            className="button secondary library-download-all"
            href="/docs/PROHOR_Judges_Library.zip"
            download
          >
            <Download size={16} aria-hidden="true" /> Download all four
          </a>
        </div>
        <div className="judge-library-grid">
          {LIBRARY.map(
            ({ number, title, label, description, file, icon: Icon }) => (
              <article className="dossier-card" key={file}>
                <div className="dossier-topline">
                  <span className="dossier-icon">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="dossier-number">{number}</span>
                </div>
                <span className="eyebrow">{label} / 3 PAGES</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <div className="dossier-actions">
                  <a
                    href={`/docs/${file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${title} PDF in a new tab`}
                  >
                    Open PDF <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                  <a
                    href={`/docs/${file}`}
                    download
                    aria-label={`Download ${title} PDF`}
                  >
                    <Download size={14} aria-hidden="true" /> Download
                  </a>
                </div>
              </article>
            ),
          )}
        </div>
        <p className="library-note">
          Use the project brief for the overview, then explore the individual
          dossiers for deeper evidence. Cached PDFs can be accessed offline
          after a successful initial visit.
        </p>
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
