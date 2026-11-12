import { useState } from "react";
import { Save, LockKeyhole, Plus } from "lucide-react";
import { Modal, Notice } from "./UI";
import { useProhor } from "../lib/context";
import { SIGNALS, SIGNAL_KEYS } from "../data/catalog";
import type { Signal, Reading } from "../types";
import { makeReading } from "../lib/storage";
export function LogModal() {
  const ctx = useProhor();
  const [signal, setSignal] = useState<Signal>(ctx.initialSignal),
    [unit, setUnit] = useState(SIGNALS[ctx.initialSignal].unit),
    [value, setValue] = useState(""),
    [diastolic, setDiastolic] = useState(""),
    [day, setDay] = useState(String(ctx.day)),
    [note, setNote] = useState(""),
    [error, setError] = useState(""),
    [tab, setTab] = useState<"single" | "checkin">("single"),
    [quick, setQuick] = useState({ sleep: "", mood: "", fatigue: "" });
  const def = SIGNALS[signal];
  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const d = Number(day);
      if (!Number.isInteger(d) || d < 1 || d > 5000)
        throw new Error("Flight day must be an integer from 1 to 5000.");
      let readings: Reading[] = [];
      if (tab === "single") {
        if (!value.trim()) throw new Error("Enter a reading.");
        readings = [makeReading(signal, Number(value), unit, d, note)];
        if (signal === "systolic" && diastolic.trim()) {
          if (Number(diastolic) >= Number(value))
            throw new Error(
              "Diastolic must be lower than systolic. Check the two values.",
            );
          readings.push(
            makeReading("diastolic", Number(diastolic), "mmHg", d, note),
          );
        }
      } else {
        for (const k of ["sleep", "mood", "fatigue"] as const) {
          if (quick[k].trim())
            readings.push(
              makeReading(k, Number(quick[k]), SIGNALS[k].unit, d, note),
            );
        }
        if (!readings.length)
          throw new Error(
            "Enter at least one check-in value. Blank fields are not recorded.",
          );
      }
      const next = {
        ...ctx.store,
        readings: [...ctx.store.readings, ...readings],
        settings: {
          ...ctx.store.settings,
          mode: "local" as const,
          crew: "LOCAL-01",
          day: d,
        },
      };
      if (ctx.commit(next)) {
        ctx.closeLog();
        ctx.toast(
          `${readings.length === 1 ? "Reading" : "Check-in"} saved on this device. Switched to your local workspace.`,
        );
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Modal title="Log a reading" onClose={ctx.closeLog}>
      <Notice>
        <LockKeyhole size={14} /> Saved only in this browser. Use demonstration
        or non-identifying data; storage is not encrypted. Local inputs never
        mix with the simulated crew.
      </Notice>
      <div className="segmented form-tabs" aria-label="Entry type">
        <button
          type="button"
          className={tab === "single" ? "active" : ""}
          onClick={() => setTab("single")}
        >
          One measurement
        </button>
        <button
          type="button"
          className={tab === "checkin" ? "active" : ""}
          onClick={() => setTab("checkin")}
        >
          Daily check-in
        </button>
      </div>
      <form onSubmit={submit}>
        <label className="field">
          Flight day
          <input
            type="number"
            min="1"
            max="5000"
            step="1"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            required
          />
        </label>
        {tab === "single" ? (
          <>
            <label className="field">
              Health indicator
              <select
                value={signal}
                onChange={(e) => {
                  const s = e.target.value as Signal;
                  setSignal(s);
                  setUnit(SIGNALS[s].unit);
                  setValue("");
                  setError("");
                }}
              >
                {SIGNAL_KEYS.map((s) => (
                  <option key={s} value={s}>
                    {SIGNALS[s].label}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label className="field">
                Measured value
                <input
                  autoFocus
                  inputMode="decimal"
                  type="number"
                  step="any"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter a value"
                  required
                />
              </label>
              <label className="field">
                Unit
                <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                  {def.units.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </label>
            </div>
            {signal === "systolic" && (
              <label className="field">
                Diastolic (optional, mmHg)
                <input
                  type="number"
                  step="1"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  placeholder="e.g. 76"
                />
              </label>
            )}
            <div className="measurement-help">
              <strong>How to measure</strong>
              <p>{def.instructions}</p>
            </div>
          </>
        ) : (
          <div className="form-grid">
            <label className="field">
              Sleep (hours)
              <input
                type="number"
                min="0"
                max="24"
                step="0.1"
                placeholder="Optional"
                value={quick.sleep}
                onChange={(e) => setQuick({ ...quick, sleep: e.target.value })}
              />
            </label>
            {(["mood", "fatigue"] as const).map((k) => (
              <label className="field" key={k}>
                {k === "mood"
                  ? "Mood · 1 low → 5 good"
                  : "Fatigue · 1 low → 5 high"}
                <select
                  value={quick[k]}
                  onChange={(e) => setQuick({ ...quick, [k]: e.target.value })}
                >
                  <option value="">Not recorded</option>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <option key={v} value={v}>
                      {v} / 5
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}
        <label className="field">
          Context note{" "}
          <span className="muted">optional · no identifying information</span>
          <textarea
            maxLength={500}
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Measurement method, meal timing, interrupted sleep…"
          />
        </label>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="modal-footer">
          <span>
            <LockKeyhole size={14} /> No server transmission
          </span>
          <button className="button primary" type="submit">
            <Save size={16} />
            Save on device
          </button>
        </div>
      </form>
    </Modal>
  );
}
