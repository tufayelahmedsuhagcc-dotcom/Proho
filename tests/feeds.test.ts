import { describe, it, expect } from "vitest";
// JavaScript server modules are intentionally shared with Vercel without transpilation.
// @ts-expect-error server module is exercised at runtime
import { normalizeKp, getFeed } from "../server/feeds.mjs";
describe("public data adapters", () => {
  it("accepts NOAA object representation", () =>
    expect(
      normalizeKp([{ time_tag: "2026-11-11T12:00:00", Kp: 2.33 }]).latest.kp,
    ).toBe(2.33));
  it("accepts NOAA array-header representation", () =>
    expect(
      normalizeKp([
        ["time_tag", "Kp"],
        ["2026-11-11 12:00:00", "3"],
      ]).latest.kp,
    ).toBe(3));
  it("orders observations by time", () =>
    expect(
      normalizeKp([
        { time_tag: "2026-11-11T12:00:00", Kp: 3 },
        { time_tag: "2026-11-11T09:00:00", Kp: 2 },
      ]).latest.kp,
    ).toBe(3));
  it("does not coerce an empty measurement to zero", () =>
    expect(() =>
      normalizeKp([{ time_tag: "2026-11-11T12:00:00", Kp: "" }]),
    ).toThrow());
  it("rejects missing measurements", () =>
    expect(() =>
      normalizeKp([{ time_tag: "2026-11-11T12:00:00", kp: null }]),
    ).toThrow());
  it("rejects out-of-range index", () =>
    expect(() =>
      normalizeKp([{ time_tag: "2026-11-11T12:00:00", Kp: 10 }]),
    ).toThrow());
  it("rejects invalid observation dates", () =>
    expect(() => normalizeKp([{ time_tag: "invalid", Kp: 2 }])).toThrow());
  it.each(["studies", "space-weather"])(
    "serves an explicit dated fallback for %s",
    async (name) => {
      const r = await getFeed(name, true);
      expect(r.status).toBe("cached");
      expect(r.retrievedAt).toBeTruthy();
      expect(r.notice).toContain("Offline");
      expect(r.sourceUrl.startsWith("https://")).toBe(true);
    },
  );
  it("includes real related plasma-study metadata in the offline snapshot", async () => {
    const r = await getFeed("studies", true);
    const plasma = r.data.find(
      (s: { accession: string }) => s.accession === "OSD-571",
    );
    expect(plasma).toBeDefined();
    expect(plasma.organism).toBe("Homo sapiens");
    expect(plasma.kind).toContain("metadata only");
    expect(plasma.url).toBe(
      "https://osdr.nasa.gov/bio/repo/data/studies/OSD-571",
    );
  });
  it("rejects non-allowlisted feed names", async () => {
    await expect(getFeed("https://example.org", true)).rejects.toThrow();
  });
});
