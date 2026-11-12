export type Mode = "demo" | "local";
export type Signal =
  | "hr"
  | "hrv"
  | "sleep"
  | "spo2"
  | "temp"
  | "systolic"
  | "diastolic"
  | "glucose"
  | "mood"
  | "fatigue"
  | "exercise"
  | "co2";
export type Domain =
  "neuro" | "cardio" | "respiratory" | "mobility" | "metabolic" | "environment";
export type State = "within" | "watch" | "learning" | "missing" | "review";
export interface Reading {
  id: string;
  crew: string;
  day: number;
  signal: Signal;
  value: number | null;
  unit: string;
  sourceValue: number | null;
  sourceUnit: string;
  quality: "valid" | "missing" | "invalid";
  mode: Mode;
  recordedAt: string;
  note: string;
}
export interface SignalDef {
  key: Signal;
  label: string;
  short: string;
  unit: string;
  units: string[];
  domain: Domain;
  min: number;
  max: number;
  floor: number;
  direction: "both" | "low" | "high";
  digits: number;
  instructions: string;
  limitation: string;
}
export interface Baseline {
  median: number;
  q1: number;
  q3: number;
  low: number;
  high: number;
  n: number;
  coverage: number;
  start: number;
  end: number;
}
export interface Assessment {
  signal: Signal;
  current: Reading | null;
  baseline: Baseline | null;
  state: State;
  delta: number | null;
  reason: string;
  rule: string;
}
export interface ActionEvent {
  id: string;
  crew: string;
  mode: Mode;
  day: number;
  action: string;
  status: "done" | "deferred";
  at: string;
}
export interface Store {
  version: 3;
  readings: Reading[];
  actions: ActionEvent[];
  settings: { crew: string; day: number; mode: Mode; reducedMotion: boolean };
}
export interface ResearchRow {
  analyte: string;
  value: number | null;
  rawValue: string;
  min: number | null;
  max: number | null;
  unit: string;
  subject: string;
  timepoint: string;
  sourceRow: number;
}
export interface Study {
  accession: string;
  title: string;
  description: string;
  organism: string;
  url: string;
  kind: string;
}
export interface SourceResponse<T> {
  status: "live" | "cached" | "unavailable";
  retrievedAt: string | null;
  sourceUrl: string;
  data: T;
  notice?: string;
}
