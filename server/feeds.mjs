import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const dataDir = new URL("../public/data/", import.meta.url);
const cache = new Map();
const studyIds = [575, 569, 87];
export async function jsonFetch(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(9000),
    headers: { Accept: "application/json" },
  });
  if (!response.ok)
    throw new Error(`Upstream returned HTTP ${response.status}`);
  const text = await response.text();
  if (text.length > 4_000_000) throw new Error("Upstream payload too large");
  return JSON.parse(text);
}
export function normalizeKp(raw) {
  if (!Array.isArray(raw) || !raw.length) throw new Error("Missing Kp records");
  const records = Array.isArray(raw[0])
    ? raw
        .slice(1)
        .map((r) => Object.fromEntries(raw[0].map((k, i) => [k, r[i]])))
    : raw;
  const points = records
    .filter(
      (r) =>
        r &&
        ["string", "number"].includes(typeof (r.Kp ?? r.kp)) &&
        (r.Kp ?? r.kp) !== null &&
        (r.Kp ?? r.kp) !== undefined &&
        String(r.Kp ?? r.kp).trim() !== "",
    )
    .map((r) => ({ time: String(r.time_tag || ""), kp: Number(r.Kp ?? r.kp) }))
    .filter(
      (r) =>
        r.time &&
        Number.isFinite(r.kp) &&
        r.kp >= 0 &&
        r.kp <= 9 &&
        Number.isFinite(
          Date.parse(/Z$|[+-]\d\d:\d\d$/.test(r.time) ? r.time : r.time + "Z"),
        ),
    )
    .sort(
      (a, b) =>
        Date.parse(/Z$|[+-]\d\d:\d\d$/.test(a.time) ? a.time : a.time + "Z") -
        Date.parse(/Z$|[+-]\d\d:\d\d$/.test(b.time) ? b.time : b.time + "Z"),
    );
  if (!points.length) throw new Error("No valid Kp observations");
  return { points, latest: points[points.length - 1] };
}
export async function getFeed(
  feed,
  forceOffline = process.env.OFFLINE === "1",
) {
  const allowed = ["studies", "space-weather"];
  if (!allowed.includes(feed)) throw new Error("Unknown feed");
  const ttl = feed === "studies" ? 86_400_000 : 600_000;
  const existing = cache.get(feed);
  if (!forceOffline && existing && Date.now() - existing.at < ttl)
    return {
      ...existing.payload,
      status: "cached",
      notice: "Server cache. Observed and retrieved timestamps are preserved.",
    };
  let error = "Offline mode requested";
  if (!forceOffline) {
    try {
      let data, sourceUrl;
      if (feed === "studies") {
        sourceUrl = "https://osdr.nasa.gov/osdr/data/osd/meta/575";
        data = await Promise.all(
          studyIds.map(async (id) => {
            const raw = await jsonFetch(
              `https://osdr.nasa.gov/osdr/data/osd/meta/${id}`,
            );
            const study = raw?.study?.[`OSD-${id}`]?.studies?.[0];
            if (
              typeof study?.title !== "string" ||
              typeof study?.description !== "string"
            )
              throw new Error("NASA metadata schema changed");
            return {
              accession: `OSD-${id}`,
              title: study.title,
              description: study.description,
              organism: id === 87 ? "Mus musculus" : "Homo sapiens",
              url: `https://osdr.nasa.gov/bio/repo/data/studies/OSD-${id}`,
              kind:
                id === 575
                  ? "Human research · analyzed CMP table"
                  : id === 87
                    ? "Animal research · metadata only"
                    : "Human research · metadata only",
            };
          }),
        );
      } else {
        sourceUrl =
          "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";
        data = normalizeKp(await jsonFetch(sourceUrl));
      }
      const payload = {
        status: "live",
        retrievedAt: new Date().toISOString(),
        sourceUrl,
        data,
        notice:
          "Fetched from the source. A network response is not a guarantee that the underlying observation is current.",
      };
      cache.set(feed, { at: Date.now(), payload });
      return payload;
    } catch (e) {
      error = e.message;
    }
  }
  const fallback =
    existing?.payload ||
    JSON.parse(await readFile(new URL(`${feed}.json`, dataDir), "utf8"));
  return {
    ...fallback,
    status: "cached",
    notice: `${forceOffline ? "Offline mode" : "Source unavailable"} — using a dated research snapshot. ${forceOffline ? "" : error}`,
  };
}
export async function apiHandler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end(
      JSON.stringify({
        error:
          "Read-only public-data API. Health records remain in your browser.",
      }),
    );
  }
  const url = new URL(req.url, "https://prohor.local"),
    feed = url.searchParams.get("feed");
  if (!["studies", "space-weather"].includes(feed)) {
    res.statusCode = 400;
    return res.end(
      JSON.stringify({ error: "feed must be studies or space-weather" }),
    );
  }
  try {
    res.end(JSON.stringify(await getFeed(feed)));
  } catch {
    res.statusCode = 503;
    res.end(
      JSON.stringify({
        status: "unavailable",
        error: "Source and snapshot unavailable",
      }),
    );
  }
}
