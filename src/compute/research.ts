import type { ResearchRow } from "../types";
import { quantile } from "./engine";
export const TIMEPOINTS = [
  "L-92",
  "L-44",
  "L-3",
  "R+1",
  "R+45",
  "R+82",
  "R+194",
];
export function archiveBaseline(
  rows: ResearchRow[],
  subject: string,
  analyte: string,
) {
  const points = rows.filter(
    (r) =>
      r.subject === subject &&
      r.analyte === analyte &&
      r.timepoint.startsWith("L-") &&
      r.value !== null,
  );
  return points.length
    ? {
        median: quantile(
          points.map((r) => r.value!),
          0.5,
        ),
        n: points.length,
      }
    : null;
}
export function sharedDepartures(rows: ResearchRow[], analyte: string) {
  return TIMEPOINTS.map((timepoint) => {
    const group = [
      ...new Map(
        rows
          .filter(
            (r) =>
              r.analyte === analyte &&
              r.timepoint === timepoint &&
              r.value !== null &&
              r.min !== null &&
              r.max !== null,
          )
          .map((r) => [r.subject, r]),
      ).values(),
    ];
    const low = group.filter((r) => r.value! < r.min!).length,
      high = group.filter((r) => r.value! > r.max!).length;
    return {
      timepoint,
      n: group.length,
      count: Math.max(low, high),
      direction: low >= high ? "below" : "above",
    };
  }).filter((x) => x.n >= 3 && x.count >= 3);
}
export function normalizeArchive(raw: Record<string, string>[]): ResearchRow[] {
  const num = (v: string) =>
    v?.trim() && Number.isFinite(Number(v)) ? Number(v) : null;
  return raw.map((r, i) => ({
    analyte: r.ANALYTE,
    value: num(r.VALUE),
    rawValue: r.VALUE,
    min: num(r.RANGE_MIN),
    max: num(r.RANGE_MAX),
    unit: r.UNITS,
    subject: r.SUBJECT_ID,
    timepoint: r.timepoint,
    sourceRow: i + 2,
  }));
}
