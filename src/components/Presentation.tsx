import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  FileText,
  Film,
} from "lucide-react";

const SLIDES = [
  {
    eyebrow: "01 / THE MISSION",
    title: "A quieter watch. A clearer picture.",
    body: "PROHOR is an offline-capable research workspace for putting astronaut health readings into context.",
    points: [
      "Built by Team Skorpe Monad",
      "A prototype for self-assessment and human review",
      "Not a medical device",
    ],
    image: "/slides/atlas.jpg",
    alt: "PROHOR health atlas interface in the synthetic demonstration",
  },
  {
    eyebrow: "02 / THE CHALLENGE",
    title: "Distance changes the question.",
    body: "On long missions, crews need to understand changes in health indicators even when communication is delayed.",
    points: [
      "Collect meaningful measurements",
      "See change against personal history",
      "Prepare a clear, human-reviewed next step",
    ],
    image: "/slides/atlas.jpg",
    alt: "The health atlas organizes simulated indicators by body system",
  },
  {
    eyebrow: "03 / THE WORKFLOW",
    title: "Observe. Understand. Prepare.",
    body: "A simple flow connects a recorded reading to an explainable trend, a routine prompt and a handover.",
    points: [
      "Log a reading or import a local CSV",
      "Inspect a trend and its rule",
      "Export context for review—not an automated diagnosis",
    ],
    image: "/slides/handover.jpg",
    alt: "A structured human-review handover in PROHOR",
  },
  {
    eyebrow: "04 / A SYNTHETIC EXAMPLE",
    title: "One reading. More context.",
    body: "In the demo, flight-day sleep is 5.6 hours against a 7.4-hour personal median. This is simulated, not astronaut telemetry.",
    points: [
      "Compare to prior personal observations",
      "The rule is an unvalidated prototype heuristic",
      "A flag prompts review; it is not a diagnosis",
    ],
    image: "/slides/baseline.jpg",
    alt: "Synthetic sleep trend comparing 5.6 hours with a personal baseline",
  },
  {
    eyebrow: "05 / NASA OPEN DATA",
    title: "Real research. Clear limits.",
    body: "A separate explorer presents historical Inspiration4 blood-serum measurements from NASA OSD-575.",
    points: [
      "Source-linked measurements and study context",
      "Four coded participants; descriptive, historical data",
      "Not live telemetry or validation of the demo rule",
    ],
    image: "/slides/nasa.jpg",
    alt: "Historical NASA OSD-575 research chart displayed in PROHOR",
  },
  {
    eyebrow: "06 / OFFLINE & PORTABILITY",
    title: "Prepared for a gap.",
    body: "After initial caching, the workspace can reload without a network. Local records remain in the browser.",
    points: [
      "CSV import checks required fields and units",
      "Back up or export locally",
      "No hidden synchronization; browser storage is not encrypted",
    ],
    image: "/slides/offline.jpg",
    alt: "Data settings screen demonstrating offline readiness and local import",
  },
  {
    eyebrow: "07 / RESPONSIBLE NEXT STEPS",
    title: "Human first. Always.",
    body: "PROHOR is a research prototype—not NASA-endorsed, a medical device or a clinical decision system.",
    points: [
      "Validate with domain experts before any operational use",
      "Protect sensitive data and follow mission procedures",
      "Explore the source, methods and four judges’ dossiers",
    ],
    image: "/slides/handover.jpg",
    alt: "A handover prepared for a human reviewer",
  },
];

export function ProjectVideo({
  kind,
  compact = false,
}: {
  kind: "short" | "long";
  compact?: boolean;
}) {
  const isShort = kind === "short";
  const name = isShort ? "prohor-30-second" : "prohor-four-minute";
  const title = isShort
    ? "30-second project pitch"
    : "Four-minute judging film";
  return (
    <article
      className={`project-video ${compact ? "project-video-compact" : ""}`}
    >
      <div className="video-frame">
        <video
          controls
          playsInline
          preload="none"
          poster={`/media/prohor-${isShort ? "short" : "long"}-poster.jpg`}
          aria-label={title}
        >
          <source src={`/media/${name}.mp4`} type="video/mp4" />
          Your browser cannot play this video.{" "}
          <a href={`/media/${name}.mp4`}>Download {title}</a>.
        </video>
      </div>
      <div className="video-info">
        <span className="eyebrow">
          <Film size={14} aria-hidden="true" />{" "}
          {isShort ? "00:30 / GLOBAL PITCH" : "03:49 / PROJECT DEMO"}
        </span>
        <h3>{title}</h3>
        <p>
          {isShort
            ? "Meet PROHOR and see the essentials in half a minute."
            : "Follow the challenge, the real prototype walkthrough, evidence and team."}
        </p>
        <div className="video-actions">
          <a href={`/media/${name}.mp4`} download>
            <ArrowDownToLine size={15} aria-hidden="true" /> Download video
          </a>
          <a href={`/media/${name}-transcript.txt`}>
            <FileText size={15} aria-hidden="true" /> Read transcript
          </a>
          <a href={`/media/${name}.srt`} download>
            Download captions
          </a>
        </div>
        <p className="video-note">
          English captions are embedded. Videos require a network connection and
          are not cached for offline playback.
        </p>
      </div>
    </article>
  );
}

export function SlideDeck() {
  const [current, setCurrent] = useState(0);
  const slide = SLIDES[current];
  return (
    <section className="slide-section" aria-labelledby="slide-title">
      <div className="media-heading">
        <div>
          <span className="eyebrow">THE PROJECT IN SEVEN SLIDES</span>
          <h2 id="slide-title">A clear story, at your pace.</h2>
          <p>From the mission to the evidence, the workflow and its limits.</p>
        </div>
        <a
          className="button secondary"
          href="/docs/PROHOR_Seven_Slide_Presentation.pdf"
          download
        >
          <ArrowDownToLine size={16} aria-hidden="true" /> Download slides · PDF
        </a>
      </div>
      <div
        className="slide-viewer"
        role="region"
        aria-label="Seven-slide PROHOR presentation"
      >
        <div className="slide-top">
          <span>PROHOR / MISSION HEALTH INTELLIGENCE</span>
          <span>{String(current + 1).padStart(2, "0")} / 07</span>
        </div>
        <div className="slide-body" aria-live="polite" aria-atomic="true">
          <div className="slide-copy">
            <span className="eyebrow">{slide.eyebrow}</span>
            <h3>{slide.title}</h3>
            <p>{slide.body}</p>
            <ul>
              {slide.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
          <div className="slide-image">
            <img src={slide.image} alt={slide.alt} />
          </div>
        </div>
        <div className="slide-bottom">
          <span>TEAM SKORPE MONAD</span>
          <span>RESEARCH PROTOTYPE · NOT A MEDICAL DEVICE</span>
        </div>
      </div>
      <div className="slide-controls" aria-label="Slide controls">
        <button
          className="button secondary"
          onClick={() => setCurrent((i) => Math.max(0, i - 1))}
          disabled={current === 0}
          aria-label="Previous slide"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Previous
        </button>
        <div className="slide-dots" aria-label={`Slide ${current + 1} of 7`}>
          {SLIDES.map((s, i) => (
            <button
              key={s.eyebrow}
              onClick={() => setCurrent(i)}
              className={current === i ? "active" : ""}
              aria-label={`Go to slide ${i + 1}: ${s.title}`}
              aria-current={current === i ? "true" : undefined}
            />
          ))}
        </div>
        <button
          className="button secondary"
          onClick={() => setCurrent((i) => Math.min(SLIDES.length - 1, i + 1))}
          disabled={current === SLIDES.length - 1}
          aria-label="Next slide"
        >
          Next <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
