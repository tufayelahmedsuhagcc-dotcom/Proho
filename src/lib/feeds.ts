import { useState, useEffect, useCallback, useRef } from "react";
import type { SourceResponse } from "../types";
import { validFeed, type FeedName } from "../compute/feedValidation";
export function useFeed<T>(name: FeedName) {
  const [result, setResult] = useState<SourceResponse<T> | null>(null),
    [busy, setBusy] = useState(true),
    [error, setError] = useState("");
  const request = useRef(0),
    controller = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    const id = ++request.current;
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    setError("");
    let fallback: SourceResponse<T> | null = null;
    try {
      const r = await fetch(`/data/${name}.json`, { signal: abort.signal });
      if (!r.ok) throw new Error();
      const value: unknown = await r.json();
      if (!validFeed(name, value))
        throw new Error("Unexpected snapshot format");
      fallback = value as SourceResponse<T>;
      if (id === request.current) setResult(fallback);
    } catch {
      /* Retain any previously loaded view when the bundled source is unavailable. */
    }
    if (id !== request.current) return;
    const timer = setTimeout(() => abort.abort(), 13000);
    try {
      const r = await fetch(`/api/feeds?feed=${name}`, {
        signal: abort.signal,
        cache: "no-store",
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data: unknown = await r.json();
      if (!validFeed(name, data)) throw new Error("Unexpected source format");
      if (id === request.current) setResult(data as SourceResponse<T>);
    } catch {
      if (id === request.current) {
        if (fallback)
          setResult({
            ...fallback,
            status: "cached",
            notice:
              "Network refresh unavailable. Displaying the bundled, dated snapshot.",
          });
        else
          setError(
            "Neither the source nor the bundled snapshot could be loaded. Retry when a connection is available.",
          );
      }
    } finally {
      clearTimeout(timer);
      if (id === request.current) setBusy(false);
    }
  }, [name]);
  useEffect(() => {
    void refresh();
    return () => {
      request.current++;
      controller.current?.abort();
    };
  }, [refresh]);
  return { result, busy, error, refresh };
}
export function utc(value: string | null | undefined) {
  if (!value) return "Unavailable";
  const normalized = /Z$|[+-]\d\d:\d\d$/.test(value) ? value : value + "Z";
  const d = new Date(normalized);
  return Number.isFinite(d.getTime())
    ? d.toISOString().replace("T", " ").slice(0, 16) + " UTC"
    : "Unavailable";
}
export function ageHours(value: string | undefined) {
  if (!value) return Infinity;
  return (
    (Date.now() -
      new Date(
        /Z$|[+-]\d\d:\d\d$/.test(value) ? value : value + "Z",
      ).getTime()) /
    3600000
  );
}
