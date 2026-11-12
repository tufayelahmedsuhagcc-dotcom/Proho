import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import Papa from "papaparse";
import {
  normalizeArchive,
  archiveBaseline,
  sharedDepartures,
} from "../src/compute/research";
const bytes = readFileSync(
  new URL("../public/data/osd575-submitted.csv", import.meta.url),
);
const rows = normalizeArchive(
  Papa.parse<Record<string, string>>(bytes.toString("utf8"), {
    header: true,
    skipEmptyLines: true,
  }).data,
);
describe("reproducible NASA OSD-575 evidence", () => {
  it("matches the archived original source hash", () =>
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(
      "dab247eb794edab59aaaa683c85fd1f2dbf4ae3684872739338e10ead4192a0c",
    ));
  it("preserves 531 records, 19 analytes and four subjects", () => {
    expect(rows.length).toBe(531);
    expect(new Set(rows.map((x) => x.analyte)).size).toBe(19);
    expect(new Set(rows.map((x) => x.subject)).size).toBe(4);
  });
  it("reproduces the published preflight glucose median", () =>
    expect(archiveBaseline(rows, "C001", "GLUCOSE")).toEqual({
      median: 80,
      n: 3,
    }));
  it.each([
    ["C001", 10],
    ["C002", 11],
    ["C003", 28],
    ["C004", 14],
  ] as [string, number][])(
    "reproduces R+1 glucose delta for %s",
    (subject, delta) => {
      const base = archiveBaseline(rows, subject, "GLUCOSE")!;
      const after = rows.find(
        (x) =>
          x.subject === subject &&
          x.analyte === "GLUCOSE" &&
          x.timepoint === "R+1",
      )!;
      expect(after.value! - base.median).toBe(delta);
    },
  );
  it("surfaces the shared R+45 below-interval pattern", () =>
    expect(sharedDepartures(rows, "GLUCOSE")).toContainEqual({
      timepoint: "R+45",
      n: 4,
      count: 3,
      direction: "below",
    }));
  it("counts people rather than duplicate rows", () => {
    const one = rows.find(
      (x) =>
        x.subject === "C002" &&
        x.analyte === "GLUCOSE" &&
        x.timepoint === "R+45",
    )!;
    expect(sharedDepartures([one, one, one], "GLUCOSE")).toEqual([]);
  });
  it("preserves non-numeric values without false zeroes", () => {
    const r = normalizeArchive([
      {
        ANALYTE: "TEST",
        VALUE: ">60",
        RANGE_MIN: "",
        RANGE_MAX: "",
        UNITS: "u",
        SUBJECT_ID: "C001",
        timepoint: "L-3",
      },
    ])[0];
    expect(r).toMatchObject({
      value: null,
      rawValue: ">60",
      min: null,
      max: null,
      sourceRow: 2,
    });
  });
  it("does not invent a preflight comparison for unknown subjects", () =>
    expect(archiveBaseline(rows, "UNKNOWN", "GLUCOSE")).toBeNull());
});
