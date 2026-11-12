import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  emptyStore,
  validateStore,
  makeReading,
  parseCsv,
  csvExport,
  readStore,
  writeStore,
  STORE_KEY,
} from "../src/lib/storage";
let map = new Map<string, string>();
beforeEach(() => {
  map = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => map.get(k) || null,
    setItem: (k: string, v: string) => map.set(k, v),
    removeItem: (k: string) => map.delete(k),
  });
});
describe("persistent local workspace", () => {
  it("starts without inventing local readings", () =>
    expect(readStore().store.readings).toEqual([]));
  it("round trips a unit-preserving local record", () => {
    const s = emptyStore();
    s.readings.push(makeReading("sleep", 420, "min", 146));
    writeStore(s);
    const r = readStore().store.readings[0];
    expect(r.value).toBe(7);
    expect(r.sourceValue).toBe(420);
    expect(r.sourceUnit).toBe("min");
    expect(r.mode).toBe("local");
  });
  it("does not delete malformed saved data", () => {
    map.set(STORE_KEY, "broken");
    expect(readStore().error).toBeTruthy();
    expect(map.get(STORE_KEY)).toBe("broken");
  });
  it("propagates quota failure instead of claiming success", () => {
    vi.stubGlobal("localStorage", {
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    });
    expect(() => writeStore(emptyStore())).toThrow();
  });
  it("rejects unknown backup version", () =>
    expect(() => validateStore({ ...emptyStore(), version: 1 })).toThrow());
  it("rejects corrupted normalized value", () => {
    const s = emptyStore(),
      r = makeReading("sleep", 420, "min", 146);
    s.readings = [{ ...r, value: 420 }];
    expect(() => validateStore(s)).toThrow();
  });
  it("rejects wrong canonical unit", () => {
    const s = emptyStore(),
      r = makeReading("sleep", 420, "min", 146);
    s.readings = [{ ...r, unit: "min" }];
    expect(() => validateStore(s)).toThrow();
  });
  it("rejects a simulated record in personal storage", () => {
    const s = emptyStore(),
      r = makeReading("hr", 61, "bpm", 146);
    s.readings = [{ ...r, mode: "demo" }];
    expect(() => validateStore(s)).toThrow();
  });
  it("rejects duplicate identifiers", () => {
    const s = emptyStore(),
      r = makeReading("hr", 61, "bpm", 146);
    s.readings = [r, r];
    expect(() => validateStore(s)).toThrow();
  });
  it("rejects out-of-range restored demo day", () =>
    expect(() =>
      validateStore({
        ...emptyStore(),
        settings: { ...emptyStore().settings, day: 500 },
      }),
    ).toThrow());
  it("rejects records hidden behind unsupported workspace identifier", () => {
    const s = emptyStore();
    s.readings = [{ ...makeReading("hr", 61, "bpm", 146), crew: "OTHER" }];
    expect(() => validateStore(s)).toThrow();
  });
});
describe("atomic CSV import and safe exports", () => {
  it("supports quoted commas and unit conversion", () => {
    const d = parseCsv(
      'day,signal,value,unit,note\n147,temp,98.6,°F,"Rested, same device"',
    );
    expect(d.errors).toEqual([]);
    expect(d.rows[0]).toMatchObject({
      value: 37,
      sourceValue: 98.6,
      note: "Rested, same device",
    });
  });
  it("does not coerce blanks to zero", () =>
    expect(parseCsv("day,signal,value,unit\n147,sleep,,h").errors.length).toBe(
      1,
    ));
  it("accepts a genuine zero", () =>
    expect(parseCsv("day,signal,value,unit\n147,sleep,0,h").rows[0].value).toBe(
      0,
    ));
  it("rejects the entire import if any row fails", () => {
    const d = parseCsv("day,signal,value,unit\n147,hr,61,bpm\n147,hr,900,bpm");
    expect(d.rows).toEqual([]);
    expect(d.errors.length).toBe(1);
  });
  it.each([
    "147,unknown,60,bpm",
    "0,hr,60,bpm",
    "1.2,hr,60,bpm",
    "147,hr,NaN,bpm",
    "147,hr,60,mg/dL",
  ])("rejects row %s", (row) =>
    expect(
      parseCsv("day,signal,value,unit\n" + row).errors.length,
    ).toBeGreaterThan(0),
  );
  it("requires documented headers", () =>
    expect(parseCsv("a,b\n1,2").errors[0]).toContain("Required columns"));
  it("retains quoted multiline notes", () =>
    expect(
      parseCsv('day,signal,value,unit,note\n147,hr,61,bpm,"line1\nline2"')
        .rows[0].note,
    ).toBe("line1\nline2"));
  it("neutralizes spreadsheet formula injection in exports", () => {
    const r = makeReading(
      "hr",
      61,
      "bpm",
      147,
      '=HYPERLINK("https://example.org")',
    );
    expect(csvExport([r])).toContain("'=HYPERLINK");
  });
  it("does not silently exceed the row cap", () =>
    expect(
      parseCsv(
        "day,signal,value,unit\n" +
          Array.from({ length: 10001 }, () => "147,hr,60,bpm").join("\n"),
      ).errors[0],
    ).toContain("10,000"));
});
