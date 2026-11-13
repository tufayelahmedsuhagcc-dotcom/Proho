import {
  ArrowUpRight,
  Code2,
  ShieldCheck,
  Database,
  Satellite,
  ArrowRight,
} from "lucide-react";
import { Panel, SectionHead, External, Notice } from "../components/UI";
import { SOURCES } from "../data/catalog";
import { useProhor } from "../lib/context";
export function About() {
  const c = useProhor();
  return (
    <>
      <div className="about-hero">
        <span className="eyebrow">PROHOR / PERSONAL HEALTH INTELLIGENCE</span>
        <h1>
          A quiet watch.
          <br />
          <span>For a long journey.</span>
        </h1>
        <p>
          Far from Earth, a reading is only useful if you can understand it.
          PROHOR brings personal measurements, transparent baselines and NASA
          research into one offline-capable workspace.
        </p>
        <button className="button primary" onClick={() => c.setPage("replay")}>
          Explore the working prototype <ArrowRight size={16} />
        </button>
      </div>
      <Notice>
        This is an independent research prototype built toward the 2026 NASA
        Space Apps health-monitoring challenge. It is not NASA software,
        NASA-endorsed, a medical device or a clinically validated decision
        system.
      </Notice>
      <div className="two-columns">
        <Panel>
          <SectionHead
            eyebrow="THE CHALLENGE"
            title="Observe. Understand. Act."
          />
          <p>
            The official challenge asks for software that gathers health
            indicators and helps astronauts assess their status and take
            appropriate action. PROHOR supports the workflow without claiming to
            diagnose or prescribe.
          </p>
          <ol className="pipeline">
            <li>
              <strong>Gather</strong>
              <p>
                Enter indicators and their units, import CSV, or explore the
                labeled mission fixture.
              </p>
            </li>
            <li>
              <strong>Understand</strong>
              <p>
                See personal deviations with the baseline window, data quality
                and exact rule.
              </p>
            </li>
            <li>
              <strong>Respond</strong>
              <p>
                Document routine follow-up and prepare a structured packet for
                human review.
              </p>
            </li>
          </ol>
          <External href={SOURCES.challenge.url}>
            Read the official 2026 challenge
          </External>
        </Panel>
        <Panel>
          <SectionHead
            eyebrow="SCIENTIFIC METHOD"
            title="Deterministic by design"
          />
          <p>
            The core computes medians and interquartile ranges on distinct prior
            days. It excludes the current day, future days, invalid measurements
            and missing values. It never borrows data from another person or a
            different mode.
          </p>
          <p>
            At least 7 days are needed for a provisional comparison; 21 or more
            are labeled established. Neither label is a clinical confidence
            estimate. Developer-selected change floors prevent zero-spread
            baselines from producing hypersensitive alerts.
          </p>
          <p>
            Explanations are built from computed results and reviewed static
            context. There is no runtime language model, health score, automated
            diagnosis or treatment recommendation.
          </p>
          <button className="text-button" onClick={() => c.setPage("trends")}>
            Inspect the rule and assumptions <ArrowUpRight size={14} />
          </button>
        </Panel>
      </div>
      <Panel>
        <SectionHead
          eyebrow="FOUR DISTINCT DATA CONTEXTS"
          title="Never blend evidence with simulation"
        />
        <div className="context-grid">
          {[
            [
              "01",
              "Synthetic mission",
              "A reproducible fixture for demonstrating a known sequence. Not real astronauts or sensors.",
            ],
            [
              "02",
              "Local inputs",
              "User-entered or imported measurements. Kept in browser storage; not independently verified.",
            ],
            [
              "03",
              "Historical NASA research",
              "Published OSD-575 measurements and curated study metadata. Not personal health records.",
            ],
            [
              "04",
              "External environment",
              "NOAA Earth geomagnetic observations. Dated, with visible cache and freshness status; never personal radiation dose.",
            ],
          ].map(([n, t, p]) => (
            <div key={n}>
              <span className="eyebrow">{n}</span>
              <h3>{t}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </Panel>
      <div className="two-columns">
        <Panel>
          <SectionHead
            eyebrow="BEFORE REAL-WORLD USE"
            title="Important limitations"
          />
          <ul className="plain-list">
            <li>
              No clinical validation, prospective trial, flight qualification or
              medical oversight has been completed.
            </li>
            <li>
              Personal baselines can be abnormal. No change does not mean good
              health.
            </li>
            <li>
              The anatomy is a schematic navigation aid. No imaging or
              organ-function assessment is performed.
            </li>
            <li>
              Exercise adherence is not bone density. SpO₂ is not lung imaging.
              Mood check-ins are not psychiatric screening.
            </li>
            <li>
              No dose estimation, radiation shielding model or EVA safety
              decision is provided.
            </li>
            <li>
              The archive has four crew on a short flight; it cannot establish
              long-mission medical thresholds.
            </li>
            <li>
              Local storage is not encrypted and provides no multi-user access
              control, clinical audit certification or remote synchronization.
            </li>
          </ul>
        </Panel>
        <Panel>
          <SectionHead
            eyebrow="PRIVACY & ATTRIBUTION"
            title="What leaves this browser"
          />
          <p>
            Health readings and notes are stored only on your device. No
            personal measurements are sent to the app’s public-data API or a
            third-party AI service.
          </p>
          <p>
            Refreshing research metadata or space weather makes a request to the
            app server. It requests public data from NASA OSDR or NOAA SWPC.
            Hosting providers may log routine network metadata such as IP
            addresses.
          </p>
          <p>
            Exports are plain files you control. External source links open in a
            new tab and follow those websites’ privacy policies. Do not use this
            prototype to store identifying or confidential medical information.
          </p>
          <p>
            Development was AI-assisted through Arena.ai, disclosed here for
            transparency. Deterministic methods, source provenance, changes and
            executed tests are documented in this repository, and human review
            precedes any scientific or clinical use.
          </p>
        </Panel>
      </div>
      <Panel>
        <SectionHead eyebrow="PRIMARY REFERENCES" title="Start at the source" />
        <div className="source-links">
          {Object.entries(SOURCES).map(([k, s]) => (
            <External key={k} href={s.url}>
              {s.title}
            </External>
          ))}
          <External href="https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json">
            NOAA SWPC · planetary Kp source feed
          </External>
          <External href="https://github.com/tufayelahmedsuhagcc-dotcom/prohor">
            PROHOR source code, methods and tests
          </External>
        </div>
        <a className="external" href="/licenses/THIRD-PARTY.txt" download>
          Download third-party notices · local fonts and libraries
        </a>
        <p className="small muted">
          Relevant NASA context informs the interface and routine prompts. It
          does not validate the prototype’s numerical thresholds. No NASA logo
          is used to imply affiliation.
        </p>
      </Panel>
    </>
  );
}
