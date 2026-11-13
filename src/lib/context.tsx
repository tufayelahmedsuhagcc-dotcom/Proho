import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import type {
  Store,
  Mode,
  Reading,
  Assessment,
  Signal,
  Domain,
} from "../types";
import { readStore, writeStore, STORE_KEY } from "./storage";
import { DEMO } from "../data/demo";
import { SIGNAL_KEYS } from "../data/catalog";
import { assess } from "../compute/engine";
interface Context {
  store: Store;
  mode: Mode;
  crew: string;
  day: number;
  rows: Reading[];
  assessments: Assessment[];
  page: string;
  setPage: (p: string) => void;
  setView: (v: Partial<Store["settings"]>) => boolean;
  commit: (s: Store, allowRecovery?: boolean) => boolean;
  toast: (s: string) => void;
  message: string;
  logOpen: boolean;
  openLog: (s?: Signal) => void;
  closeLog: () => void;
  initialSignal: Signal;
  selected: Domain;
  select: (d: Domain) => void;
  online: boolean;
  offlineReady: boolean;
  storageWarning: string;
}
const C = createContext<Context | null>(null);
const aliases: Record<string, string> = {
  "crew-data": "evidence",
  sources: "evidence",
  "data-sources": "evidence",
  "daily-check": "logbook",
  health: "logbook",
  baseline: "trends",
  anomalies: "trends",
  explanations: "trends",
  "data-quality": "trends",
  domains: "atlas",
  live: "replay",
  demo: "replay",
  timeline: "replay",
  mission: "overview",
  reports: "handover",
  offline: "settings",
  methodology: "about",
  limitations: "about",
  privacy: "about",
  science: "about",
  technology: "about",
  "five-questions": "about",
  contact: "about",
  cookies: "about",
  terms: "about",
};
const routes = [
  "overview",
  "atlas",
  "logbook",
  "trends",
  "actions",
  "evidence",
  "environment",
  "replay",
  "handover",
  "settings",
  "judges",
  "about",
];
function pageFromLocation() {
  const h = location.hash.slice(1).split("?")[0];
  if (h && routes.includes(h)) return h;
  const path =
    location.pathname.split("/").filter(Boolean).at(-1) || "overview";
  return aliases[path] || (routes.includes(path) ? path : "overview");
}
export function Provider({ children }: { children: ReactNode }) {
  const [initial] = useState(readStore),
    [store, setStore] = useState(initial.store),
    [storageWarning, setStorageWarning] = useState(initial.error || ""),
    [message, setMessage] = useState(""),
    [page, setPageState] = useState(pageFromLocation),
    [logOpen, setLogOpen] = useState(false),
    [initialSignal, setInitialSignal] = useState<Signal>("sleep"),
    [selected, select] = useState<Domain>("neuro"),
    [online, setOnline] = useState(navigator.onLine),
    [offlineReady, setOfflineReady] = useState(false);
  const mode = store.settings.mode,
    crew =
      mode === "demo"
        ? store.settings.crew === "MS-02"
          ? "MS-02"
          : "CDR-01"
        : "LOCAL-01",
    day =
      mode === "demo"
        ? Math.max(111, Math.min(147, store.settings.day))
        : store.settings.day;
  const rows = useMemo(() => [...DEMO, ...store.readings], [store.readings]);
  const assessments = useMemo(
    () => SIGNAL_KEYS.map((s) => assess(rows, s, crew, mode, day)),
    [rows, crew, mode, day],
  );
  const toast = (s: string) => setMessage(s);
  function commit(next: Store, allowRecovery = false) {
    if (storageWarning && !allowRecovery) {
      setMessage(
        "Saving is blocked to protect unreadable stored data. Open Data & settings to export the original value, then restore or explicitly erase it.",
      );
      return false;
    }
    try {
      writeStore(next);
      setStore(next);
      setStorageWarning("");
      return true;
    } catch {
      setMessage(
        "Not saved: browser storage is unavailable or full. Export your data and try another browser.",
      );
      return false;
    }
  }
  const setView = (v: Partial<Store["settings"]>) => {
    return commit({ ...store, settings: { ...store.settings, ...v } });
  };
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key !== STORE_KEY && e.key !== null) return;
      const updated = readStore();
      if (!updated.error) setStore(updated.store);
      setStorageWarning(updated.error || "");
      setMessage(
        updated.error
          ? "Another tab changed this workspace to an unreadable value. Saving is blocked."
          : "Workspace updated from another browser tab.",
      );
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    const f = () => setPageState(pageFromLocation());
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  useEffect(() => {
    const f = () => setOnline(navigator.onLine);
    window.addEventListener("online", f);
    window.addEventListener("offline", f);
    return () => {
      window.removeEventListener("online", f);
      window.removeEventListener("offline", f);
    };
  }, []);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 6500);
    return () => clearTimeout(t);
  }, [message]);
  useEffect(() => {
    document.documentElement.dataset.motion = store.settings.reducedMotion
      ? "reduced"
      : "auto";
  }, [store.settings.reducedMotion]);
  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    let active = true;
    const ready = () => {
      if (active) setOfflineReady(!!navigator.serviceWorker.controller);
    };
    navigator.serviceWorker.addEventListener("controllerchange", ready);
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then(ready)
      .catch(() => {
        if (active) setOfflineReady(false);
      });
    return () => {
      active = false;
      navigator.serviceWorker.removeEventListener("controllerchange", ready);
    };
  }, []);
  const setPage = (p: string) => {
    if (routes.includes(p)) {
      location.hash = p;
      setPageState(p);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };
  return (
    <C.Provider
      value={{
        store,
        mode,
        crew,
        day,
        rows,
        assessments,
        page,
        setPage,
        setView,
        commit,
        toast,
        message,
        logOpen,
        openLog: (s = "sleep") => {
          setInitialSignal(s);
          setLogOpen(true);
        },
        closeLog: () => setLogOpen(false),
        initialSignal,
        selected,
        select,
        online,
        offlineReady,
        storageWarning,
      }}
    >
      {children}
    </C.Provider>
  );
}
export function useProhor() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("PROHOR context unavailable");
  return ctx;
}
