import { z } from "zod";
import Papa from "papaparse";
import type { Reading, Signal, Store } from "../types";
import { SIGNAL_KEYS, SIGNALS } from "../data/catalog";
import { normalize } from "../compute/engine";
export const STORE_KEY = "prohor.v3.workspace";
const ReadingSchema = z.object({
  id: z.string().min(1).max(120),
  crew: z.string().min(1).max(40),
  day: z.number().int().min(1).max(5000),
  signal: z.enum(SIGNAL_KEYS as [Signal, ...Signal[]]),
  value: z.number().finite().nullable(),
  unit: z.string().max(15),
  sourceValue: z.number().finite().nullable(),
  sourceUnit: z.string().max(15),
  quality: z.enum(["valid", "missing", "invalid"]),
  mode: z.enum(["demo", "local"]),
  recordedAt: z.string().datetime(),
  note: z.string().max(500),
});
const StoreSchema = z.object({
  version: z.literal(3),
  readings: z.array(ReadingSchema).max(10000),
  actions: z
    .array(
      z.object({
        id: z.string().max(120),
        crew: z.string().max(40),
        mode: z.enum(["demo", "local"]),
        day: z.number().int().min(1).max(5000),
        action: z.string().max(30),
        status: z.enum(["done", "deferred"]),
        at: z.string().datetime(),
      }),
    )
    .max(10000),
  settings: z.object({
    crew: z.string().max(40),
    day: z.number().int().min(1).max(5000),
    mode: z.enum(["demo", "local"]),
    reducedMotion: z.boolean(),
  }),
});
export const emptyStore = (): Store => ({
  version: 3,
  readings: [],
  actions: [],
  settings: { crew: "CDR-01", day: 146, mode: "demo", reducedMotion: false },
});
export function validateStore(input: unknown): Store {
  const data = StoreSchema.parse(input) as Store;
  for (const r of data.readings) {
    if (r.crew !== "LOCAL-01")
      throw new Error(
        "Local backups must use the LOCAL-01 workspace identifier.",
      );
    if (r.mode !== "local")
      throw new Error(
        "Backups may contain local inputs only, never simulated crew records.",
      );
    if (r.quality === "valid") {
      if (r.value === null || r.sourceValue === null)
        throw new Error("A valid reading needs a value.");
      const expected = normalize(r.signal, r.sourceValue, r.sourceUnit);
      if (
        Math.abs(expected - r.value) > 0.01 ||
        r.unit !== SIGNALS[r.signal].unit
      )
        throw new Error("Inconsistent measurement units in backup.");
    }
  }
  if (
    data.settings.mode === "demo" &&
    (data.settings.day < 142 || data.settings.day > 147)
  )
    throw new Error("Demo flight days are 142–147.");
  if (new Set(data.readings.map((r) => r.id)).size !== data.readings.length)
    throw new Error("Duplicate record identifiers in backup.");
  return data;
}
export function readStore(): { store: Store; error?: string } {
  try {
    const value = localStorage.getItem(STORE_KEY);
    return { store: value ? validateStore(JSON.parse(value)) : emptyStore() };
  } catch {
    return {
      store: emptyStore(),
      error:
        "Saved data could not be read. The original browser value has not been deleted. Export or inspect it before saving new work.",
    };
  }
}
export function writeStore(store: Store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(validateStore(store)));
}
export function makeReading(
  signal: Signal,
  value: number,
  unit: string,
  day: number,
  note = "",
  crew = "LOCAL-01",
): Reading {
  const normalized = normalize(signal, value, unit);
  return ReadingSchema.parse({
    id: crypto.randomUUID(),
    crew,
    day,
    signal,
    value: normalized,
    unit: SIGNALS[signal].unit,
    sourceValue: value,
    sourceUnit: unit,
    quality: "valid",
    mode: "local",
    recordedAt: new Date().toISOString(),
    note,
  });
}
export function parseCsv(text: string): { rows: Reading[]; errors: string[] } {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });
  const errors = parsed.errors.map((e) => `CSV: ${e.message}`);
  const rows: Reading[] = [];
  const required = ["day", "signal", "value", "unit"];
  if (required.some((k) => !parsed.meta.fields?.includes(k)))
    return {
      rows: [],
      errors: ["Required columns: day, signal, value, unit. Optional: note."],
    };
  if (parsed.data.length > 10000)
    return { rows: [], errors: ["Maximum 10,000 rows per import."] };
  parsed.data.forEach((r, i) => {
    try {
      const signal = r.signal?.trim() as Signal;
      if (!SIGNAL_KEYS.includes(signal)) throw new Error("Unknown signal key.");
      if (!r.day?.trim() || !r.value?.trim())
        throw new Error("Day and value must not be blank.");
      if (r.mode?.trim() === "demo")
        throw new Error(
          "A simulation export cannot be imported as local measurements. Use the separate demo workspace.",
        );
      if (r.quality?.trim() && r.quality.trim() !== "valid")
        throw new Error(
          "CSV import accepts valid numeric measurements only. Use JSON backup for missing or invalid records.",
        );
      const day = Number(r.day);
      if (!Number.isInteger(day) || day < 1 || day > 5000)
        throw new Error("Day must be an integer from 1 to 5000.");
      const reading = makeReading(
        signal,
        Number(r.value),
        r.unit?.trim(),
        day,
        (r.note || "Imported local data; not independently verified.").slice(
          0,
          500,
        ),
      );
      if (r.recordedAt?.trim()) reading.recordedAt = r.recordedAt.trim();
      rows.push(ReadingSchema.parse(reading));
    } catch (e) {
      errors.push(`Row ${i + 2}: ${(e as Error).message}`);
    }
  });
  return { rows: errors.length ? [] : rows, errors };
}
export function csvExport(rows: Reading[]): string {
  return Papa.unparse(
    rows.map((r) => ({
      day: r.day,
      signal: r.signal,
      value: r.sourceValue,
      unit: r.sourceUnit,
      note: r.note,
      quality: r.quality,
      mode: r.mode,
      recordedAt: r.recordedAt,
    })),
    { escapeFormulae: true },
  );
}
export function download(
  name: string,
  text: string,
  type = "application/json",
) {
  const u = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
