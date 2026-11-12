import { useRef, useState } from "react";
import {
  Download,
  Upload,
  Trash2,
  WifiOff,
  HardDrive,
  ShieldCheck,
  FileJson,
  FileSpreadsheet,
  Check,
  LockKeyhole,
  ArrowUpRight,
} from "lucide-react";
import { Panel, SectionHead, Notice, Modal } from "../components/UI";
import { useProhor } from "../lib/context";
import {
  download,
  parseCsv,
  validateStore,
  emptyStore,
  csvExport,
  STORE_KEY,
} from "../lib/storage";
import type { Reading, Store } from "../types";
export function Settings() {
  const c = useProhor(),
    csvRef = useRef<HTMLInputElement>(null),
    jsonRef = useRef<HTMLInputElement>(null),
    [error, setError] = useState(""),
    [preview, setPreview] = useState<
      { type: "csv"; rows: Reading[] } | { type: "backup"; store: Store } | null
    >(null),
    [clear, setClear] = useState(false),
    [confirm, setConfirm] = useState("");
  async function read(file: File | undefined, type: "csv" | "backup") {
    setError("");
    if (!file) return;
    if (file.size > 2_000_000) {
      setError("Choose a file smaller than 2 MB.");
      return;
    }
    try {
      const t = await file.text();
      if (type === "csv") {
        const result = parseCsv(t);
        if (result.errors.length)
          throw new Error(result.errors.slice(0, 8).join("\n"));
        if (!result.rows.length)
          throw new Error("The CSV contains no observations.");
        if (c.store.readings.length + result.rows.length > 10000)
          throw new Error(
            "Import would exceed the 10,000-record workspace limit. Export and clear first.",
          );
        setPreview({ type, rows: result.rows });
      } else {
        setPreview({ type, store: validateStore(JSON.parse(t)) });
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function apply() {
    if (!preview) return;
    const next =
      preview.type === "csv"
        ? {
            ...c.store,
            readings: [...c.store.readings, ...preview.rows],
            settings: {
              ...c.store.settings,
              mode: "local" as const,
              crew: "LOCAL-01",
              day: Math.max(...preview.rows.map((r) => r.day)),
            },
          }
        : preview.store;
    if (c.commit(next, preview.type === "backup")) {
      setPreview(null);
      c.toast("Import complete. Data stays on this device.");
    }
  }
  const template =
    "day,signal,value,unit,note\n141,sleep,420,min,SYNTHETIC EXAMPLE — replace with your own authorized data\n141,temp,98.6,°F,SYNTHETIC EXAMPLE\n141,mood,4,/5,SYNTHETIC EXAMPLE\n";
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">LOCAL-FIRST / NO ACCOUNT REQUIRED</span>
          <h1>
            Your data. <span>Your control.</span>
          </h1>
          <p>
            Backup, import and offline readiness—with no hidden synchronization
            or pretend authentication.
          </p>
        </div>
      </div>
      <Notice tone="warning">
        <strong>Use non-identifying demonstration data.</strong> Browser storage
        is not encrypted and can be cleared by your browser or device
        administrator. This is not a secure clinical record system.
      </Notice>
      {c.storageWarning && (
        <Notice tone="warning">
          {c.storageWarning}
          <button
            className="text-button"
            onClick={() =>
              download(
                "prohor-unparsed-storage.txt",
                localStorage.getItem(STORE_KEY) || "",
                "text/plain",
              )
            }
          >
            Export original storage value
          </button>
        </Notice>
      )}
      <div className="two-columns">
        <Panel>
          <SectionHead
            eyebrow="BACKUP & PORTABILITY"
            title="Your local workspace"
          >
            <HardDrive size={20} />
          </SectionHead>
          <div className="storage-stats">
            <strong>
              {c.store.readings.length}
              <span>local readings</span>
            </strong>
            <strong>
              {c.store.actions.length}
              <span>routine events</span>
            </strong>
          </div>
          <p>
            JSON preserves units, notes, provenance and action history. CSV is
            designed for inspection and interoperability.
          </p>
          <div className="button-row">
            <button
              className="button primary"
              onClick={() =>
                download(
                  "prohor-workspace-backup.json",
                  JSON.stringify(c.store, null, 2),
                )
              }
            >
              <Download size={15} />
              Backup JSON
            </button>
            <button
              className="button secondary"
              onClick={() =>
                download(
                  "prohor-local-readings.csv",
                  csvExport(c.store.readings),
                  "text/csv;charset=utf-8",
                )
              }
              disabled={!c.store.readings.length}
            >
              Export CSV
            </button>
          </div>
          <hr />
          <h3>Restore a backup</h3>
          <p>
            Validated before replacing this workspace. You will be asked to
            confirm; the synthetic mission demo and research archive are not
            overwritten.
          </p>
          <input
            ref={jsonRef}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            aria-label="Backup JSON file"
            onChange={(e) => {
              void read(e.target.files?.[0], "backup");
              e.target.value = "";
            }}
          />
          <button
            className="button secondary"
            onClick={() => jsonRef.current?.click()}
          >
            <FileJson size={15} />
            Choose backup JSON
          </button>
        </Panel>
        <Panel>
          <SectionHead
            eyebrow="VALIDATED, ATOMIC IMPORT"
            title="Import measurements"
          >
            <FileSpreadsheet size={20} />
          </SectionHead>
          <p>
            Required CSV columns: <code>day, signal, value, unit</code>.
            Optional: <code>note, recordedAt</code>. Use signal keys such as{" "}
            <code>sleep</code>, <code>hr</code>, <code>glucose</code> or{" "}
            <code>temp</code>.
          </p>
          <div className="code-sample">
            day,signal,value,unit,note
            <br />
            141,sleep,420,min,Consistent measurement
            <br />
            141,temp,98.6,°F,Oral thermometer
          </div>
          <p>
            Units are checked and normalized. An invalid row rejects the entire
            import. Repeated same-day readings are preserved; analysis uses the
            latest timestamp, with last source row breaking ties. CSV accepts
            valid numeric measurements only; use JSON for a lossless backup.
          </p>
          <input
            ref={csvRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            aria-label="Measurements CSV file"
            onChange={(e) => {
              void read(e.target.files?.[0], "csv");
              e.target.value = "";
            }}
          />
          <div className="button-row">
            <button
              className="button primary"
              onClick={() => csvRef.current?.click()}
            >
              <Upload size={15} />
              Choose CSV
            </button>
            <button
              className="button secondary"
              onClick={() =>
                download(
                  "prohor-csv-template.csv",
                  template,
                  "text/csv;charset=utf-8",
                )
              }
            >
              Get template
            </button>
          </div>
          <p className="small muted">
            Template rows are labeled synthetic examples. Imports are local,
            unverified inputs—not connected-sensor or NASA observations.
          </p>
        </Panel>
      </div>
      {error && (
        <div className="form-error import-error" role="alert">
          <strong>Import blocked. Nothing changed.</strong>
          <pre>{error}</pre>
        </div>
      )}
      <div className="two-columns">
        <Panel>
          <SectionHead
            eyebrow="BUILT FOR DISCONNECTED OPERATIONS"
            title="Offline readiness"
          >
            <WifiOff size={20} />
          </SectionHead>
          <div className="readiness-row">
            <span
              className={`status-dot ${c.offlineReady ? "within" : "learning"}`}
            />
            <strong>
              {c.offlineReady
                ? "Offline application cache is ready"
                : "Offline cache not active yet"}
            </strong>
          </div>
          <p>
            {c.offlineReady
              ? "The application, fonts, original NASA CSV and bundled source metadata are installed in the service-worker cache. Local records remain in this browser."
              : "The production app installs its offline cache after the first successful load over HTTPS or localhost. Development mode does not install a service worker."}
          </p>
          <ul className="plain-list">
            <li>Reading entry, baseline analysis and exports work offline.</li>
            <li>NASA archive exploration uses bundled real source bytes.</li>
            <li>External feeds fall back to labeled, dated snapshots.</li>
            <li>No pending sync queue. No records are sent to a server.</li>
          </ul>
          <Notice>
            To test: load the production app, wait for “Offline ready,” switch
            the browser offline, then reload. A first-ever visit still needs a
            connection.
          </Notice>
        </Panel>
        <Panel>
          <SectionHead
            eyebrow="ACCESSIBILITY & PRIVACY"
            title="Designed to stay quiet"
          >
            <ShieldCheck size={20} />
          </SectionHead>
          <label className="toggle-field">
            <div>
              <strong>Reduce motion</strong>
              <p>
                Limit decorative movement and smooth scrolling. System
                reduced-motion preferences are also respected.
              </p>
            </div>
            <input
              type="checkbox"
              checked={c.store.settings.reducedMotion}
              onChange={(e) => c.setView({ reducedMotion: e.target.checked })}
            />
          </label>
          <hr />
          <div className="privacy-points">
            <p>
              <Check size={15} />
              No analytics or advertising trackers.
            </p>
            <p>
              <Check size={15} />
              No remote AI processes your readings.
            </p>
            <p>
              <Check size={15} />
              External requests contain no health records.
            </p>
            <p>
              <Check size={15} />
              No camera, microphone or location access.
            </p>
          </div>
        </Panel>
      </div>
      <Panel className="danger-zone">
        <div>
          <h2>Erase the local workspace</h2>
          <p>
            Remove your local readings, routine history and preferences. Nothing
            outside this browser’s storage for PROHOR is affected.
          </p>
        </div>
        <button
          className="button danger"
          onClick={() => {
            setConfirm("");
            setClear(true);
          }}
        >
          <Trash2 size={15} />
          Erase local data
        </button>
      </Panel>
      {preview && (
        <Modal
          title={
            preview.type === "csv"
              ? "Confirm CSV import"
              : "Replace this workspace?"
          }
          onClose={() => setPreview(null)}
        >
          <p>
            {preview.type === "csv"
              ? `${preview.rows.length} validated measurements will be added to your local workspace. Your current records will remain.`
              : `This replaces the current workspace with ${preview.store.readings.length} readings and ${preview.store.actions.length} routine events from the backup. Export your current workspace first.`}
          </p>
          <Notice>
            Only local browser storage changes. NASA research data and the
            synthetic fixture remain separate.
          </Notice>
          <div className="modal-footer">
            <button
              className="button secondary"
              onClick={() => setPreview(null)}
            >
              Cancel
            </button>
            <button className="button primary" onClick={apply}>
              {preview.type === "csv" ? "Import readings" : "Replace workspace"}
            </button>
          </div>
        </Modal>
      )}
      {clear && (
        <Modal
          title="Permanently erase local data?"
          onClose={() => setClear(false)}
        >
          <p>
            This cannot be undone without a backup. Export your JSON first. Type
            DELETE to confirm.
          </p>
          <label className="field">
            Confirmation
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="off"
            />
          </label>
          <div className="modal-footer">
            <button
              className="button secondary"
              onClick={() => setClear(false)}
            >
              Cancel
            </button>
            <button
              className="button danger"
              disabled={confirm !== "DELETE"}
              onClick={() => {
                if (c.commit(emptyStore(), true)) {
                  setClear(false);
                  c.toast(
                    "Local workspace erased. The synthetic demo is available.",
                  );
                }
              }}
            >
              Erase data
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
