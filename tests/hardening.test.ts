import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { validFeed } from "../src/compute/feedValidation";
import { parseCsv, csvExport, makeReading } from "../src/lib/storage";
import { quantile, assess } from "../src/compute/engine";
import { DEMO } from "../src/data/demo";
// @ts-expect-error Shared Node/Vercel runtime module
import { normalizeKp, getFeed } from "../server/feeds.mjs";
const studies = JSON.parse(
  readFileSync(new URL("../public/data/studies.json", import.meta.url), "utf8"),
);
const weather = JSON.parse(
  readFileSync(
    new URL("../public/data/space-weather.json", import.meta.url),
    "utf8",
  ),
);
afterEach(() => vi.unstubAllGlobals());
describe("defensive public-feed rendering", () => {
  it("accepts both real bundled snapshots", () => {
    expect(validFeed("studies", studies)).toBe(true);
    expect(validFeed("space-weather", weather)).toBe(true);
  });
  it.each([null, [], {}, "<html>Error</html>", { status: "live", data: [] }])(
    "rejects invalid envelopes: %s",
    (v) => expect(validFeed("studies", v)).toBe(false),
  );
  it("blocks wrong-shape study data", () =>
    expect(
      validFeed("studies", { ...studies, data: { title: "not an array" } }),
    ).toBe(false));
  it("blocks non-HTTPS library links", () =>
    expect(
      validFeed("studies", {
        ...studies,
        data: [{ ...studies.data[0], url: "javascript:alert(1)" }],
      }),
    ).toBe(false));
  it("blocks invalid retrieval timestamp", () =>
    expect(validFeed("studies", { ...studies, retrievedAt: "bad" })).toBe(
      false,
    ));
  it("blocks invalid weather data", () =>
    expect(
      validFeed("space-weather", {
        ...weather,
        data: {
          points: [{ time: "bad", kp: 25 }],
          latest: { time: "bad", kp: 25 },
        },
      }),
    ).toBe(false));
  it("blocks boolean Kp instead of coercing it to one", () =>
    expect(() =>
      normalizeKp([{ time_tag: "2026-11-11T12:00:00", Kp: true }]),
    ).toThrow());
  it("sorts offset timestamps by instant rather than lexical order", () =>
    expect(
      normalizeKp([
        { time_tag: "2026-11-11T12:00:00+03:00", Kp: 1 },
        { time_tag: "2026-11-11T10:00:00Z", Kp: 2 },
      ]).latest.kp,
    ).toBe(2));
  it("preserves the snapshot date on upstream HTTP failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 503 })),
    );
    const result = await getFeed("space-weather", false);
    expect(result.status).toBe("cached");
    expect(result.retrievedAt).toBe(weather.retrievedAt);
    expect(result.notice).toContain("503");
  });
  it("fails closed when NASA metadata changes shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, text: async () => "{}" })),
    );
    const result = await getFeed("studies", false);
    expect(result.status).toBe("cached");
    expect(result.notice).toContain("schema changed");
  });
});
describe("provenance-preserving CSV and explicit directional rules", () => {
  it("does not promote a simulated export into a personal observation", () => {
    const r = { ...makeReading("hr", 60, "bpm", 147), mode: "demo" as const };
    expect(parseCsv(csvExport([r])).errors[0]).toContain("simulation");
  });
  it("does not promote an invalid observation into a valid one", () => {
    const r = {
      ...makeReading("hr", 60, "bpm", 147),
      quality: "invalid" as const,
    };
    expect(parseCsv(csvExport([r])).errors[0]).toContain("valid numeric");
  });
  it("preserves optional recordedAt for same-day chronology", () => {
    const r = makeReading("hr", 60, "bpm", 147);
    r.recordedAt = "2026-01-01T01:00:00.000Z";
    expect(parseCsv(csvExport([r])).rows[0].recordedAt).toBe(r.recordedAt);
  });
  it("rejects invalid optional recordedAt", () =>
    expect(
      parseCsv("day,signal,value,unit,recordedAt\n147,hr,60,bpm,not-a-date")
        .errors.length,
    ).toBe(1));
  it("rejects a non-finite quantile parameter", () =>
    expect(() => quantile([1, 2], NaN)).toThrow());
  it("only flags lower sleep values, according to the declared rule", () => {
    const rows = DEMO.map((r) =>
      r.day === 146 && r.signal === "sleep" && r.crew === "CDR-01"
        ? { ...r, value: 10 }
        : r,
    );
    expect(assess(rows, "sleep", "CDR-01", "demo", 146).state).toBe("within");
  });
  it("flags elevated temperature in the two-sided rule", () => {
    const rows = DEMO.map((r) =>
      r.day === 146 && r.signal === "temp" && r.crew === "CDR-01"
        ? { ...r, value: 38 }
        : r,
    );
    expect(assess(rows, "temp", "CDR-01", "demo", 146).state).toBe("watch");
  });
});
