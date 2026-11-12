import { describe, it, expect } from "vitest";
import {
  quantile,
  normalize,
  getBaseline,
  assess,
  latestPerDay,
  domainState,
  chartRows,
} from "../src/compute/engine";
import { DEMO } from "../src/data/demo";
import { SIGNALS, SIGNAL_KEYS } from "../src/data/catalog";
import type { Reading, Signal } from "../src/types";
function r(
  day: number,
  value: number | null = 60,
  extra: Partial<Reading> = {},
): Reading {
  return {
    id: `r${day}`,
    crew: "LOCAL-01",
    day,
    signal: "hr",
    value,
    unit: "bpm",
    sourceValue: value,
    sourceUnit: "bpm",
    quality: value === null ? "missing" : "valid",
    mode: "local",
    recordedAt: "2026-01-01T00:00:00.000Z",
    note: "Test fixture",
    ...extra,
  };
}
const steady = Array.from({ length: 30 }, (_, i) => r(i + 1));
describe("deterministic statistics", () => {
  it("uses interpolated quantiles without mutating input", () => {
    const a = [4, 1, 3, 2];
    expect(quantile(a, 0.5)).toBe(2.5);
    expect(quantile(a, 0.25)).toBe(1.75);
    expect(a).toEqual([4, 1, 3, 2]);
  });
  it.each([{ values: [] }, { values: [NaN] }, { values: [Infinity] }])(
    "rejects invalid observation set $values",
    ({ values }) => expect(() => quantile(values, 0.5)).toThrow(),
  );
  it("rejects invalid quantile", () =>
    expect(() => quantile([1, 2], 1.1)).toThrow());
  it("accepts singleton", () => expect(quantile([4], 0.25)).toBe(4));
});
describe("units and input quality", () => {
  it.each([
    ["sleep", 420, "min", 7],
    ["temp", 98.6, "°F", 37],
    ["glucose", 5, "mmol/L", 90.091],
    ["hr", 60, "bpm", 60],
    ["spo2", 98, "%", 98],
    ["sleep", 0, "h", 0],
  ] as [Signal, number, string, number][])(
    "normalizes %s %s %s",
    (s, v, u, e) => expect(normalize(s, v, u)).toBeCloseTo(e, 3),
  );
  it.each(SIGNAL_KEYS)("rejects below supported range: %s", (s) =>
    expect(() => normalize(s, SIGNALS[s].min - 1, SIGNALS[s].unit)).toThrow(),
  );
  it.each(SIGNAL_KEYS)("rejects above supported range: %s", (s) =>
    expect(() => normalize(s, SIGNALS[s].max + 1, SIGNALS[s].unit)).toThrow(),
  );
  it.each([NaN, Infinity, -Infinity])("rejects non-finite input %s", (v) =>
    expect(() => normalize("hr", v, "bpm")).toThrow(),
  );
  it("rejects incompatible units", () =>
    expect(() => normalize("hr", 60, "mg/dL")).toThrow());
  it("rejects fractional ordinal values", () =>
    expect(() => normalize("mood", 3.2, "/5")).toThrow());
});
describe("personal baselines and honest states", () => {
  it("computes 30 distinct days and applies a zero-spread floor", () => {
    const b = getBaseline(steady, "hr", "LOCAL-01", "local", 31)!;
    expect(b).toMatchObject({
      median: 60,
      n: 30,
      q1: 60,
      q3: 60,
      low: 53,
      high: 67,
      coverage: 100,
      start: 1,
      end: 30,
    });
  });
  it("does not use the current day or future days", () => {
    const b = getBaseline(
      [...steady, r(31, 100), r(32, 110)],
      "hr",
      "LOCAL-01",
      "local",
      31,
    );
    expect(b?.median).toBe(60);
    expect(b?.n).toBe(30);
  });
  it("ignores a different person, source mode and signal", () => {
    const extra = Array.from({ length: 3 }, (_, i) =>
      r(i + 2, 200, {
        crew: i === 0 ? "OTHER" : "LOCAL-01",
        mode: i === 1 ? "demo" : "local",
        signal: i === 2 ? "systolic" : "hr",
      }),
    );
    expect(
      getBaseline([...steady, ...extra], "hr", "LOCAL-01", "local", 31)?.median,
    ).toBe(60);
  });
  it("needs seven distinct prior days", () => {
    expect(
      getBaseline(steady.slice(0, 6), "hr", "LOCAL-01", "local", 31),
    ).toBeNull();
    expect(
      getBaseline(steady.slice(0, 7), "hr", "LOCAL-01", "local", 31)?.n,
    ).toBe(7);
  });
  it("cannot manufacture maturity from repeated same-day samples", () => {
    const rows = Array.from({ length: 30 }, (_, i) =>
      r(1, 60, { id: String(i) }),
    );
    expect(getBaseline(rows, "hr", "LOCAL-01", "local", 2)).toBeNull();
  });
  it("latest same-day observation wins; an invalid latest reading is not hidden", () => {
    const duplicate = r(30, 200, {
      id: "latest",
      recordedAt: "2026-01-02T00:00:00.000Z",
      quality: "invalid",
    });
    expect(
      getBaseline([...steady, duplicate], "hr", "LOCAL-01", "local", 31)?.n,
    ).toBe(29);
  });
  it("excludes missing values without imputing zero", () => {
    expect(
      getBaseline(
        [...steady.filter((r) => r.day !== 30), r(30, null)],
        "hr",
        "LOCAL-01",
        "local",
        31,
      )?.n,
    ).toBe(29);
  });
  it("uses only preceding 30-day window", () =>
    expect(
      getBaseline([r(0, 200), ...steady], "hr", "LOCAL-01", "local", 31)
        ?.median,
    ).toBe(60));
  it("missing current data never means within baseline", () =>
    expect(assess(steady, "hr", "LOCAL-01", "local", 31).state).toBe(
      "missing",
    ));
  it("invalid current readings are flagged for input review", () =>
    expect(
      assess(
        [...steady, r(31, 180, { quality: "invalid" })],
        "hr",
        "LOCAL-01",
        "local",
        31,
      ).state,
    ).toBe("review"));
  it("a new local user never inherits a demo baseline", () =>
    expect(
      assess([...DEMO, r(147, 60)], "hr", "LOCAL-01", "local", 147).state,
    ).toBe("learning"));
  it("detects a planted change", () =>
    expect(
      assess([...steady, r(31, 73)], "hr", "LOCAL-01", "local", 31).state,
    ).toBe("watch"));
  it("does not flag a value exactly on the change boundary", () =>
    expect(
      assess([...steady, r(31, 67)], "hr", "LOCAL-01", "local", 31).state,
    ).toBe("within"));
  it("baseline uses frozen enrollment for the synthetic scenario", () =>
    expect(getBaseline(DEMO, "hr", "CDR-01", "demo", 146)).toMatchObject({
      start: 111,
      end: 140,
      n: 30,
    }));
  it("nominal fixture does not trigger alerts", () =>
    expect(
      SIGNAL_KEYS.filter(
        (s) => assess(DEMO, s, "CDR-01", "demo", 142).state === "watch",
      ),
    ).toEqual([]));
  it("multi-signal fixture has five pre-specified changes", () =>
    expect(
      SIGNAL_KEYS.filter(
        (s) => assess(DEMO, s, "CDR-01", "demo", 146).state === "watch",
      ),
    ).toEqual(["hr", "hrv", "sleep", "fatigue", "exercise"]));
  it("recovery fixture returns toward baseline without claiming causality", () =>
    expect(
      SIGNAL_KEYS.filter(
        (s) => assess(DEMO, s, "CDR-01", "demo", 147).state === "watch",
      ),
    ).toEqual([]));
  it("partial-sensor crew exposes limited cardiovascular data", () => {
    const a = SIGNAL_KEYS.map((s) => assess(DEMO, s, "MS-02", "demo", 146));
    expect(a.find((x) => x.signal === "hrv")?.state).toBe("missing");
    expect(domainState(a, "cardio")).toBe("learning");
  });
  it("trend extraction excludes future mission days", () =>
    expect(
      chartRows(DEMO, "sleep", "CDR-01", "demo", 144, 14).every(
        (r) => r.day <= 144 && r.day > 130,
      ),
    ).toBe(true));
  it("latest records preserve originals in the input list", () => {
    const rows = [
      r(1, 60),
      r(1, 62, { id: "rnew", recordedAt: "2026-01-02T00:00:00.000Z" }),
    ];
    expect(latestPerDay(rows)[0].value).toBe(62);
    expect(rows.length).toBe(2);
  });
});
