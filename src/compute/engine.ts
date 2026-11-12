import type {
  Reading,
  Signal,
  Baseline,
  Assessment,
  Mode,
  State,
  Domain,
} from "../types";
import { SIGNALS, DOMAINS } from "../data/catalog";
export const RULE_VERSION = "PROHOR-IQR-3.0";
export function quantile(input: number[], q: number): number {
  if (!input.length || !Number.isFinite(q) || q < 0 || q > 1)
    throw new Error("Quantile requires finite observations and q in [0,1].");
  if (input.some((v) => !Number.isFinite(v)))
    throw new Error("Non-finite observation");
  const a = [...input].sort((a, b) => a - b);
  const i = (a.length - 1) * q;
  return a[Math.floor(i)] + (a[Math.ceil(i)] - a[Math.floor(i)]) * (i % 1);
}
export function normalize(signal: Signal, value: number, unit: string): number {
  const s = SIGNALS[signal];
  if (!Number.isFinite(value)) throw new Error("Enter a finite number.");
  if (!s.units.includes(unit))
    throw new Error(`Use ${s.units.join(" or ")} for ${s.label}.`);
  let v = value;
  if (signal === "sleep" && unit === "min") v = value / 60;
  if (signal === "temp" && unit === "°F") v = ((value - 32) * 5) / 9;
  if (signal === "glucose" && unit === "mmol/L") v = value * 18.0182;
  if (v < s.min || v > s.max)
    throw new Error(
      `Outside the supported input range (${s.min}–${s.max} ${s.unit}). Check the units and device; this range is not a medical safety range.`,
    );
  if ((signal === "mood" || signal === "fatigue") && !Number.isInteger(v))
    throw new Error("Choose a whole number from 1 to 5.");
  return Math.round(v * 10000) / 10000;
}
export function latestPerDay(rows: Reading[]): Reading[] {
  const map = new Map<number, Reading>();
  for (const r of rows) {
    const prev = map.get(r.day);
    if (!prev || r.recordedAt >= prev.recordedAt) map.set(r.day, r);
  }
  return [...map.values()].sort((a, b) => a.day - b.day);
}
export function getBaseline(
  rows: Reading[],
  signal: Signal,
  crew: string,
  mode: Mode,
  day: number,
): Baseline | null {
  const end = mode === "demo" ? Math.min(day - 1, 140) : day - 1,
    start = end - 29;
  const candidates = latestPerDay(
    rows.filter(
      (r) =>
        r.crew === crew &&
        r.mode === mode &&
        r.signal === signal &&
        r.day >= start &&
        r.day <= end,
    ),
  );
  const values = candidates
    .filter(
      (r) =>
        r.quality === "valid" && r.value !== null && Number.isFinite(r.value),
    )
    .map((r) => r.value!);
  if (values.length < 7) return null;
  const median = quantile(values, 0.5),
    q1 = quantile(values, 0.25),
    q3 = quantile(values, 0.75),
    width = Math.max(1.5 * (q3 - q1), SIGNALS[signal].floor);
  return {
    median,
    q1,
    q3,
    low: median - width,
    high: median + width,
    n: values.length,
    coverage: Math.round((values.length / 30) * 100),
    start,
    end,
  };
}
export function assess(
  rows: Reading[],
  signal: Signal,
  crew: string,
  mode: Mode,
  day: number,
): Assessment {
  const baseline = getBaseline(rows, signal, crew, mode, day),
    current =
      latestPerDay(
        rows.filter(
          (r) =>
            r.crew === crew &&
            r.mode === mode &&
            r.signal === signal &&
            r.day === day,
        ),
      )[0] || null;
  const base = { signal, current, baseline, delta: null, rule: RULE_VERSION };
  if (!current || current.value === null || current.quality === "missing")
    return {
      ...base,
      state: "missing",
      reason:
        "No usable observation for the selected day. No reassurance is inferred from missing data.",
    };
  if (current.quality !== "valid" || !Number.isFinite(current.value))
    return {
      ...base,
      state: "review",
      reason:
        "This reading failed a data-quality check and is excluded from analysis.",
    };
  if (!baseline)
    return {
      ...base,
      state: "learning",
      reason:
        "At least 7 distinct prior days are needed. Local inputs never borrow a simulated crew baseline.",
    };
  const delta = current.value - baseline.median,
    s = SIGNALS[signal],
    low = current.value < baseline.low,
    high = current.value > baseline.high;
  const watch =
    (s.direction !== "high" && low) || (s.direction !== "low" && high);
  return {
    ...base,
    delta,
    state: watch ? "watch" : "within",
    reason: watch
      ? `Outside the prototype change band (${baseline.low.toFixed(s.digits)}–${baseline.high.toFixed(s.digits)} ${s.unit}); check context and repeat if appropriate.`
      : "No rule-level change from this personal baseline. This does not establish good health or exclude an urgent problem.",
  };
}
export function domainState(assessments: Assessment[], domain: Domain): State {
  const list = assessments.filter((a) =>
    DOMAINS.find((d) => d.key === domain)!.signals.includes(a.signal),
  );
  if (list.some((a) => a.state === "watch")) return "watch";
  if (list.some((a) => a.state === "review")) return "review";
  if (list.every((a) => a.state === "missing")) return "missing";
  if (list.some((a) => a.state === "missing" || a.state === "learning"))
    return "learning";
  return "within";
}
export function signed(n: number, digits = 1) {
  return `${n > 0 ? "+" : ""}${n.toFixed(digits)}`;
}
export function valueLabel(v: number | null | undefined, signal: Signal) {
  return v === null || v === undefined
    ? "—"
    : v.toFixed(SIGNALS[signal].digits);
}
export function chartRows(
  rows: Reading[],
  signal: Signal,
  crew: string,
  mode: Mode,
  day: number,
  window = 14,
) {
  return latestPerDay(
    rows.filter(
      (r) =>
        r.signal === signal &&
        r.crew === crew &&
        r.mode === mode &&
        r.day <= day &&
        r.day > day - window,
    ),
  );
}
