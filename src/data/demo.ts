import { SIGNALS, SIGNAL_KEYS } from "./catalog";
import type { Reading, Signal } from "../types";
const base: Record<Signal, number> = {
  hr: 61,
  hrv: 57,
  sleep: 7.4,
  spo2: 98.1,
  temp: 36.5,
  systolic: 116,
  diastolic: 76,
  glucose: 91,
  mood: 4,
  fatigue: 2,
  exercise: 110,
  co2: 2.2,
};
const amp: Record<Signal, number> = {
  hr: 2,
  hrv: 4,
  sleep: 0.25,
  spo2: 0.4,
  temp: 0.14,
  systolic: 4,
  diastolic: 3,
  glucose: 4,
  mood: 0,
  fatigue: 0,
  exercise: 8,
  co2: 0.15,
};
const changes: Record<number, Partial<Record<Signal, number>>> = {
  143: { sleep: 5.4 },
  144: { sleep: 5.1, fatigue: 4, hrv: 44 },
  145: { sleep: 5.3, fatigue: 4, hr: 72, hrv: 38, exercise: 55 },
  146: { sleep: 5.6, fatigue: 4, hr: 73, hrv: 40, exercise: 65 },
  147: { sleep: 7.1, fatigue: 3, hr: 63, hrv: 53, exercise: 105 },
};
export const DEMO: Reading[] = ["CDR-01", "MS-02"].flatMap((crew, c) =>
  Array.from({ length: 37 }, (_, i) => i + 111).flatMap((day) =>
    SIGNAL_KEYS.map((signal, idx) => {
      const missing =
        crew === "MS-02" &&
        (signal === "hrv" || (signal === "spo2" && day % 3 === 0));
      let value =
        base[signal] +
        Math.sin(day * 1.7 + idx) * amp[signal] +
        (c && signal === "hr" ? 5 : 0);
      if (!c && changes[day]?.[signal] !== undefined)
        value = changes[day][signal]!;
      value = Number(value.toFixed(SIGNALS[signal].digits));
      return {
        id: `demo-${crew}-${day}-${signal}`,
        crew,
        day,
        signal,
        value: missing ? null : value,
        unit: SIGNALS[signal].unit,
        sourceValue: missing ? null : value,
        sourceUnit: SIGNALS[signal].unit,
        quality: missing ? "missing" : "valid",
        mode: "demo",
        recordedAt: `2026-01-01T12:${String(idx).padStart(2, "0")}:00.000Z`,
        note: "Deterministic synthetic mission fixture; not an astronaut record.",
      } as Reading;
    }),
  ),
);
export const DAYS = [
  {
    day: 142,
    title: "Nominal cruise",
    detail: "Readings stay close to the enrollment baseline.",
  },
  {
    day: 143,
    title: "A shorter night",
    detail: "Sleep duration departs from the personal baseline.",
  },
  {
    day: 144,
    title: "Recovery changes",
    detail: "Fatigue and HRV change alongside shorter sleep.",
  },
  {
    day: 145,
    title: "Higher workload",
    detail: "Several changes co-occur. No cause is inferred.",
  },
  {
    day: 146,
    title: "Review together",
    detail:
      "A multi-signal shift is visible; document context and a next step.",
  },
  {
    day: 147,
    title: "Moving toward baseline",
    detail:
      "The fixture shows readings nearer baseline. This is not proof of treatment efficacy.",
  },
];
