import { useState } from "react";
import { Plus, Download, Trash2, BookOpen } from "lucide-react";
import { useProhor } from "../lib/context";
import { SIGNALS, SIGNAL_KEYS } from "../data/catalog";
import { Panel, SectionHead, Notice, Modal, Empty } from "../components/UI";
import { csvExport, download } from "../lib/storage";
export function Logbook() {
  const c = useProhor(),
    [filter, setFilter] = useState("all"),
    [page, setPage] = useState(0),
    [remove, setRemove] = useState<string | null>(null),
    [allDays, setAllDays] = useState(true);
  const data = c.rows
    .filter(
      (r) =>
        r.crew === c.crew &&
        r.mode === c.mode &&
        r.day <= c.day &&
        (allDays || r.day === c.day) &&
        (filter === "all" || r.signal === filter),
    )
    .sort((a, b) => b.day - a.day || b.recordedAt.localeCompare(a.recordedAt));
  const currentPage = Math.min(
      page,
      Math.max(0, Math.ceil(data.length / 20) - 1),
    ),
    visible = data.slice(currentPage * 20, currentPage * 20 + 20);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            MEASURE CONSISTENTLY. KEEP THE CONTEXT.
          </span>
          <h1>Your mission logbook.</h1>
          <p>
            {c.mode === "demo"
              ? "You are exploring synthetic readings. New entries are saved to a separate local workspace."
              : "Your inputs stay on this device. Export regular backups; browser storage can be cleared."}
          </p>
        </div>
        <button className="button primary" onClick={() => c.openLog()}>
          <Plus size={16} />
          Log a reading
        </button>
      </div>
      <Notice>
        <strong>Not connected to a medical sensor.</strong> Inputs are entered
        or imported by you and are not independently verified. Values are
        normalized with the original unit preserved.
      </Notice>
      <Panel>
        <SectionHead
          title="Recorded measurements"
          eyebrow={`${data.length} RECORDS / ${c.mode === "demo" ? "SIMULATION" : "LOCAL INPUT"}`}
        >
          <div className="toolbar">
            <label className="sr-only" htmlFor="log-filter">
              Filter indicator
            </label>
            <select
              id="log-filter"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="all">All indicators</option>
              {SIGNAL_KEYS.map((s) => (
                <option key={s} value={s}>
                  {SIGNALS[s].label}
                </option>
              ))}
            </select>
            <button
              className="button small secondary"
              disabled={!data.length}
              onClick={() =>
                download(
                  `prohor-${c.mode}-readings.csv`,
                  csvExport(data),
                  "text/csv;charset=utf-8",
                )
              }
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </SectionHead>
        <label className="check-label">
          <input
            type="checkbox"
            checked={allDays}
            onChange={(e) => {
              setAllDays(e.target.checked);
              setPage(0);
            }}
          />
          Include prior days up to FD {c.day}
        </label>
        {!data.length ? (
          <Empty
            title="Start with one consistent reading"
            action={
              <button className="button primary" onClick={() => c.openLog()}>
                Log your first reading
              </button>
            }
          >
            There are no readings in this selection. You can record earlier
            flight days to build a personal baseline, or import a CSV in Data &
            settings.
          </Empty>
        ) : (
          <>
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Scrollable data table"
            >
              <table>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Indicator</th>
                    <th>Normalized</th>
                    <th>Original</th>
                    <th>Quality / context</th>
                    {c.mode === "local" && <th>Remove</th>}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr key={r.id}>
                      <td className="mono">{r.day}</td>
                      <td>{SIGNALS[r.signal].label}</td>
                      <td className="mono">
                        {r.value ?? "—"} {r.value !== null ? r.unit : ""}
                      </td>
                      <td>
                        {r.sourceValue ?? "—"}{" "}
                        {r.sourceValue !== null ? r.sourceUnit : ""}
                      </td>
                      <td>
                        <span className={`quality-label ${r.quality}`}>
                          {r.quality}
                        </span>
                        {r.note && (
                          <details className="row-note">
                            <summary>Context</summary>
                            <p>{r.note}</p>
                            <small>
                              {r.recordedAt} · {r.id}
                            </small>
                          </details>
                        )}
                      </td>
                      {c.mode === "local" && (
                        <td>
                          <button
                            className="icon-button"
                            aria-label={`Delete ${SIGNALS[r.signal].label} on day ${r.day}`}
                            onClick={() => setRemove(r.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>
                {currentPage * 20 + 1}–
                {Math.min((currentPage + 1) * 20, data.length)} of {data.length}
              </span>
              <div>
                <button
                  className="button small secondary"
                  disabled={!currentPage}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Previous
                </button>
                <button
                  className="button small secondary"
                  disabled={(currentPage + 1) * 20 >= data.length}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </Panel>
      <Panel>
        <SectionHead
          eyebrow="BETTER INPUTS, BETTER CONTEXT"
          title="Measurement guide"
        />
        <div className="measurement-grid">
          {["sleep", "hr", "spo2", "glucose"].map((k) => {
            const s = SIGNALS[k as keyof typeof SIGNALS];
            return (
              <details key={k}>
                <summary>
                  {s.label}
                  <Plus size={14} />
                </summary>
                <p>{s.instructions}</p>
                <p className="muted">{s.limitation}</p>
              </details>
            );
          })}
        </div>
      </Panel>
      {remove && (
        <Modal
          title="Delete this local reading?"
          onClose={() => setRemove(null)}
        >
          <p>
            This removes the reading from this browser. It may change your
            baseline and flags. Export a backup first if you need a record.
          </p>
          <div className="modal-footer">
            <button
              className="button secondary"
              onClick={() => setRemove(null)}
            >
              Keep reading
            </button>
            <button
              className="button danger"
              onClick={() => {
                if (
                  c.commit({
                    ...c.store,
                    readings: c.store.readings.filter((r) => r.id !== remove),
                  })
                ) {
                  setRemove(null);
                  c.toast("Local reading removed. Analysis recalculated.");
                }
              }}
            >
              Delete reading
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
