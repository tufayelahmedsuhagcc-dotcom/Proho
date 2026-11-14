import { useEffect, useState, Component, type ReactNode } from "react";
import {
  LayoutDashboard,
  ScanLine,
  BookOpen,
  ChartNoAxesCombined,
  ClipboardCheck,
  Database,
  Orbit,
  Play,
  FileText,
  Settings2,
  ArrowUpRight,
  Plus,
  ChevronDown,
  Search,
  Menu,
  X,
  Wifi,
  WifiOff,
  ShieldCheck,
  Info,
  Command,
  ArrowRight,
} from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import { useProhor } from "./lib/context";
import { Modal, Notice } from "./components/UI";
import { LogModal } from "./components/LogModal";
import { Overview, AtlasPanel } from "./pages/Overview";
import { Trends } from "./pages/Trends";
import { Logbook } from "./pages/Logbook";
import { Actions } from "./pages/Actions";
import { Evidence } from "./pages/Evidence";
import { Environment } from "./pages/Environment";
import { Replay } from "./pages/Replay";
import { Handover } from "./pages/Handover";
import { Settings } from "./pages/Settings";
import { About } from "./pages/About";
import { Judges } from "./pages/Judges";
const NAV = [
  {
    title: "CREW WORKSPACE",
    items: [
      ["overview", "Mission overview", LayoutDashboard],
      ["atlas", "Health atlas", ScanLine],
      ["logbook", "Logbook", BookOpen],
      ["trends", "Trends & baselines", ChartNoAxesCombined],
      ["actions", "Care plan", ClipboardCheck],
    ],
  },
  {
    title: "SCIENCE & CONTEXT",
    items: [
      ["evidence", "NASA evidence", Database],
      ["environment", "Space environment", Orbit],
    ],
  },
  {
    title: "MISSION TOOLS",
    items: [
      ["replay", "Mission replay", Play],
      ["handover", "Crew handover", FileText],
      ["judges", "Judges’ resources", BookOpen],
      ["settings", "Data & settings", Settings2],
    ],
  },
] as const;
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    if (this.state.error)
      return (
        <div className="fatal-error">
          <img src="/icons/mark.svg" width="48" alt="PROHOR" />
          <h1>The workspace could not render.</h1>
          <p>
            Your local records have not been erased. Reload the page; if this
            persists, preserve your browser data before resetting.
          </p>
          <button className="button primary" onClick={() => location.reload()}>
            Reload safely
          </button>
        </div>
      );
    return this.props.children;
  }
}
export default function App() {
  const c = useProhor(),
    [menu, setMenu] = useState(false),
    [search, setSearch] = useState(false),
    [query, setQuery] = useState("");
  const current = NAV.flatMap((g) => [...g.items]).find((x) => x[0] === c.page),
    title = current?.[1] || "About PROHOR";
  useEffect(() => {
    document.title = `${title} · PROHOR`;
    setMenu(false);
  }, [c.page, title]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((s) => !s);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const previous = document.activeElement as HTMLElement | null,
      sidebar = document.querySelector(".sidebar") as HTMLElement,
      oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(
        sidebar.querySelectorAll<HTMLElement>("a[href],button:not([disabled])"),
      ).filter((el) => el.getClientRects().length > 0);
    (
      sidebar.querySelector("[aria-current=page]") as HTMLElement | null
    )?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMenu(false);
      }
      if (e.key === "Tab") {
        const items = focusable(),
          first = items[0],
          last = items.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    const resize = () => {
      if (innerWidth > 780) setMenu(false);
    };
    window.addEventListener("keydown", key);
    window.addEventListener("resize", resize);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", resize);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [menu]);
  const views: Record<string, ReactNode> = {
    overview: <Overview />,
    atlas: (
      <>
        <div className="page-heading">
          <div>
            <span className="eyebrow">
              A MAP OF YOUR INDICATORS, NOT YOUR DIAGNOSES
            </span>
            <h1>
              Your health, <span>in context.</span>
            </h1>
            <p>
              Select a body system to see what is measured, what changed, and
              what remains unknown.
            </p>
          </div>
        </div>
        <AtlasPanel expanded />
        <Notice>
          Direct measures of brain function, lung anatomy, bone density and
          organ damage are unavailable. Highlighting a region never establishes
          an organ’s condition.
        </Notice>
      </>
    ),
    logbook: <Logbook />,
    trends: <Trends />,
    actions: <Actions />,
    evidence: <Evidence />,
    environment: <Environment />,
    replay: <Replay />,
    handover: <Handover />,
    settings: <Settings />,
    judges: <Judges />,
    about: <About />,
  };
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to content
      </a>
      {menu && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <aside
        className={`sidebar ${menu ? "open" : ""}`}
        aria-label="Main navigation"
        role={menu ? "dialog" : undefined}
        aria-modal={menu || undefined}
      >
        <button
          className="icon-button mobile-nav-close"
          onClick={() => setMenu(false)}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
        <a
          href="#overview"
          className="brand"
          onClick={() => c.setPage("overview")}
        >
          <img src="/icons/mark.svg" alt="" />
          <div>
            <strong>PROHOR</strong>
            <span>MISSION HEALTH INTELLIGENCE</span>
          </div>
        </a>
        <div className="workspace-label">
          <span className="mini-orbit">◎</span>
          <div>
            <strong>Deep-space crew</strong>
            <small>Research workspace · v3.0</small>
          </div>
        </div>
        <nav>
          {NAV.map((group) => (
            <div className="nav-group" key={group.title}>
              <span className="nav-group-label">{group.title}</span>
              {group.items.map(([id, label, Icon]) => (
                <a
                  href={`#${id}`}
                  key={id}
                  className={`nav-link ${c.page === id ? "active" : ""}`}
                  aria-current={c.page === id ? "page" : undefined}
                  onClick={() => setMenu(false)}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                  {id === "evidence" && <span className="nav-tag">NASA</span>}
                  {id === "overview" && c.page === id && <i />}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="about-link" onClick={() => c.setPage("about")}>
            <Info size={16} />
            About & methodology
            <ArrowUpRight size={14} />
          </button>
          <div className="mission-signature">
            <span className="signature-orbit">✳</span>
            <div>
              <strong>THE NEXT FRONTIER</strong>
              <span>SPACE APPS 2026 · PROTOTYPE</span>
            </div>
          </div>
          <p>
            Independent project.
            <br />
            No NASA endorsement implied.
          </p>
        </div>
      </aside>
      <div className="workspace" inert={menu}>
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMenu(!menu)}
              aria-label="Toggle navigation"
              aria-expanded={menu}
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumb">
              <span>Mission workspace</span>
              <span>/</span>
              <strong>{title}</strong>
            </div>
          </div>
          <div className="topbar-actions">
            <button
              className="search-trigger"
              onClick={() => {
                setQuery("");
                setSearch(true);
              }}
              aria-label="Find a view"
            >
              <Search size={16} />
              <span>Find a view</span>
              <kbd>⌘ K</kbd>
            </button>
            <span
              className={`connection ${c.online ? "online" : ""}`}
              title="Browser connectivity only; not a guarantee of source availability"
            >
              {c.online ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span>{c.online ? "Online" : "Offline"}</span>
            </span>
            <button
              className="button primary small"
              onClick={() => c.openLog()}
            >
              <Plus size={16} />
              <span>Log a reading</span>
            </button>
          </div>
        </header>
        <div className="mission-context">
          <div className="context-controls">
            <label>
              <span>WORKSPACE</span>
              <select
                aria-label="Data workspace"
                value={c.mode}
                onChange={(e) => {
                  const mode = e.target.value as "demo" | "local";
                  c.setView({
                    mode,
                    crew: mode === "demo" ? "CDR-01" : "LOCAL-01",
                    day:
                      mode === "demo"
                        ? 146
                        : Math.max(147, ...c.store.readings.map((r) => r.day)),
                  });
                }}
              >
                <option value="demo">Demo mission</option>
                <option value="local">Local workspace</option>
              </select>
            </label>
            <span className="context-separator" />
            <label>
              <span>CREW</span>
              {c.mode === "demo" ? (
                <select
                  aria-label="Crew profile"
                  value={c.crew}
                  onChange={(e) => c.setView({ crew: e.target.value })}
                >
                  <option value="CDR-01">CDR-01</option>
                  <option value="MS-02">MS-02 · partial data</option>
                </select>
              ) : (
                <strong>LOCAL-01</strong>
              )}
            </label>
            <span className="context-separator" />
            <label>
              <span>FLIGHT DAY</span>
              {c.mode === "demo" ? (
                <select
                  aria-label="Flight day"
                  value={c.day}
                  onChange={(e) => c.setView({ day: Number(e.target.value) })}
                >
                  {[142, 143, 144, 145, 146, 147].map((d) => (
                    <option key={d} value={d}>
                      {d.toString().padStart(3, "0")}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  key={`${c.mode}-${c.day}`}
                  aria-label="Local flight day"
                  type="number"
                  min="1"
                  max="5000"
                  defaultValue={c.day}
                  onBlur={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isInteger(v) && v >= 1 && v <= 5000)
                      c.setView({ day: v });
                    else {
                      e.target.value = String(c.day);
                      c.toast("Flight day must be between 1 and 5000.");
                    }
                  }}
                />
              )}
            </label>
          </div>
          <button
            className="cache-status"
            onClick={() => c.setPage("settings")}
          >
            <ShieldCheck size={14} />
            {c.offlineReady ? "Offline ready" : "Device-local records"}
            <ArrowUpRight size={12} />
          </button>
        </div>
        <div className={`mode-ribbon ${c.mode}`}>
          <span className="ribbon-tag">
            {c.mode === "demo" ? "SIMULATION" : "LOCAL INPUT"}
          </span>
          <span>
            {c.mode === "demo"
              ? "Generated crew readings. Not real astronaut records."
              : "User-entered measurements. Not independently verified."}
          </span>
          <span className="ribbon-tail">
            Research prototype · Not a medical device
          </span>
        </div>
        <main id="main-content" tabIndex={-1}>
          {c.storageWarning && (
            <Notice tone="warning">
              Saved browser data needs review. Saving is blocked to protect the
              original value.{" "}
              <button
                className="text-button"
                onClick={() => c.setPage("settings")}
              >
                Open recovery controls
              </button>
            </Notice>
          )}
          <ErrorBoundary key={c.page}>
            {views[c.page] || <Overview />}
          </ErrorBoundary>
        </main>
        <footer className="app-footer">
          <span>
            PROHOR <b> / </b> A quiet watch for a long journey.
          </span>
          <button onClick={() => c.setPage("about")}>
            Methodology & limitations <ArrowUpRight size={12} />
          </button>
          <span>BUILD 3.0 · OPEN SCIENCE</span>
        </footer>
      </div>
      {c.logOpen && <LogModal />}
      {search && (
        <Modal
          title="Where would you like to go?"
          onClose={() => setSearch(false)}
        >
          <label className="search-field command-search">
            <Search size={18} />
            <input
              autoFocus
              placeholder="Search views, science, settings…"
              aria-label="Find a view"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="command-results">
            {NAV.flatMap((g) => [...g.items])
              .filter(([, label]) =>
                label.toLowerCase().includes(query.toLowerCase()),
              )
              .map(([id, label, Icon]) => (
                <button
                  key={id}
                  onClick={() => {
                    c.setPage(id);
                    setSearch(false);
                  }}
                >
                  <Icon size={17} />
                  {label}
                  <ArrowRight size={15} />
                </button>
              ))}
          </div>
        </Modal>
      )}
      <div
        className={`toast ${c.message ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {c.message && (
          <>
            <Info size={17} />
            <span>{c.message}</span>
          </>
        )}
      </div>
      <Analytics />
    </div>
  );
}
