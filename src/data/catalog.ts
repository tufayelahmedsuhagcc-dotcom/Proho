import type { SignalDef, Domain, Signal } from "../types";
export const SIGNALS: Record<Signal, SignalDef> = {
  hr: {
    key: "hr",
    label: "Resting heart rate",
    short: "Heart rate",
    unit: "bpm",
    units: ["bpm"],
    domain: "cardio",
    min: 20,
    max: 250,
    floor: 7,
    direction: "both",
    digits: 0,
    instructions:
      "Rest quietly before measuring. Use the same device, posture, and time of day. Record a resting value, not an exercise peak.",
    limitation:
      "Heart rate varies with activity, stress, medication, posture, and device quality.",
  },
  hrv: {
    key: "hrv",
    label: "Heart rate variability",
    short: "HRV · RMSSD",
    unit: "ms",
    units: ["ms"],
    domain: "cardio",
    min: 1,
    max: 300,
    floor: 10,
    direction: "low",
    digits: 1,
    instructions:
      "Use a consistent, artifact-screened RMSSD measurement from the same device and recording window. Do not mix SDNN with RMSSD.",
    limitation:
      "HRV is context dependent; a deviation does not establish illness or autonomic dysfunction.",
  },
  sleep: {
    key: "sleep",
    label: "Sleep duration",
    short: "Sleep",
    unit: "h",
    units: ["h", "min"],
    domain: "neuro",
    min: 0,
    max: 24,
    floor: 1,
    direction: "low",
    digits: 1,
    instructions:
      "Record estimated time asleep, not time in bed. Keep the measurement method consistent and note interrupted sleep.",
    limitation:
      "A wearable estimate or self-report cannot diagnose a sleep disorder.",
  },
  spo2: {
    key: "spo2",
    label: "Oxygen saturation",
    short: "SpO₂",
    unit: "%",
    units: ["%"],
    domain: "respiratory",
    min: 50,
    max: 100,
    floor: 2,
    direction: "low",
    digits: 1,
    instructions:
      "Follow the device instructions. Keep the hand warm and still; wait for a stable signal. Record any poor signal quality.",
    limitation:
      "Pulse oximetry has device and skin-pigmentation limitations. Symptoms matter even with a reassuring reading.",
  },
  temp: {
    key: "temp",
    label: "Body temperature",
    short: "Temperature",
    unit: "°C",
    units: ["°C", "°F"],
    domain: "metabolic",
    min: 30,
    max: 45,
    floor: 0.5,
    direction: "both",
    digits: 1,
    instructions:
      "Use the same validated thermometer and measurement site. Note recent hot or cold drinks if using an oral thermometer.",
    limitation:
      "Measurements from different sites are not interchangeable. This app does not diagnose fever.",
  },
  systolic: {
    key: "systolic",
    label: "Systolic blood pressure",
    short: "Systolic BP",
    unit: "mmHg",
    units: ["mmHg"],
    domain: "cardio",
    min: 40,
    max: 300,
    floor: 15,
    direction: "both",
    digits: 0,
    instructions:
      "Use the correct cuff and a validated device. Follow mission-approved posture, rest, and repeat-measurement procedures.",
    limitation:
      "A baseline deviation is not a clinical blood-pressure category.",
  },
  diastolic: {
    key: "diastolic",
    label: "Diastolic blood pressure",
    short: "Diastolic BP",
    unit: "mmHg",
    units: ["mmHg"],
    domain: "cardio",
    min: 20,
    max: 200,
    floor: 10,
    direction: "both",
    digits: 0,
    instructions:
      "Record the diastolic value from the same cuff measurement as systolic. Repeat according to the device or mission protocol.",
    limitation:
      "Posture, cuff fit and measurement conditions affect the result.",
  },
  glucose: {
    key: "glucose",
    label: "Blood glucose",
    short: "Glucose",
    unit: "mg/dL",
    units: ["mg/dL", "mmol/L"],
    domain: "metabolic",
    min: 10,
    max: 1000,
    floor: 15,
    direction: "both",
    digits: 0,
    instructions:
      "Only use an appropriate device and approved procedure. Record fasting or meal context in the note; do not compare unlike conditions.",
    limitation:
      "Meal timing and device method matter. The app cannot diagnose diabetes or guide medication dosing.",
  },
  mood: {
    key: "mood",
    label: "Mood check-in",
    short: "Mood",
    unit: "/5",
    units: ["/5"],
    domain: "neuro",
    min: 1,
    max: 5,
    floor: 1,
    direction: "low",
    digits: 0,
    instructions:
      "Choose how you feel today: 1 very low, 2 low, 3 neutral, 4 good, 5 very good. This is optional and private to this browser.",
    limitation:
      "An ordinal self-report is not a validated mental-health screening instrument.",
  },
  fatigue: {
    key: "fatigue",
    label: "Perceived fatigue",
    short: "Fatigue",
    unit: "/5",
    units: ["/5"],
    domain: "neuro",
    min: 1,
    max: 5,
    floor: 1,
    direction: "high",
    digits: 0,
    instructions:
      "Rate fatigue: 1 very low to 5 very high. Note workload or interrupted rest if useful.",
    limitation: "Self-reported fatigue cannot determine fitness for duty.",
  },
  exercise: {
    key: "exercise",
    label: "Exercise completed",
    short: "Exercise",
    unit: "min",
    units: ["min"],
    domain: "mobility",
    min: 0,
    max: 480,
    floor: 25,
    direction: "low",
    digits: 0,
    instructions:
      "Log completed time from your assigned exercise plan. Follow the crew medical officer’s advice; do not increase intensity based on this app.",
    limitation:
      "Exercise minutes are an adherence proxy, not a measurement of bone density or muscle strength.",
  },
  co2: {
    key: "co2",
    label: "Cabin CO₂ partial pressure",
    short: "Cabin CO₂",
    unit: "mmHg",
    units: ["mmHg"],
    domain: "environment",
    min: 0,
    max: 20,
    floor: 0.6,
    direction: "high",
    digits: 2,
    instructions:
      "Record the value from an approved cabin sensor in mmHg. Note calibration status and location. Do not substitute outdoor air data.",
    limitation:
      "No spacecraft limit or personal exposure dose is inferred from this personal-baseline rule.",
  },
};
export const SIGNAL_KEYS = Object.keys(SIGNALS) as Signal[];
export const DOMAINS: {
  key: Domain;
  label: string;
  short: string;
  subtitle: string;
  signals: Signal[];
  hazard: string;
  source: string;
  description: string;
}[] = [
  {
    key: "neuro",
    label: "Mind & recovery",
    short: "Recovery",
    subtitle: "Sleep · mood · fatigue",
    signals: ["sleep", "mood", "fatigue"],
    hazard: "Isolation & confinement",
    source: "sleep",
    description:
      "Sleep, mood and fatigue are useful check-ins. They do not directly measure brain structure or mental health.",
  },
  {
    key: "cardio",
    label: "Cardiovascular",
    short: "Cardiovascular",
    subtitle: "Heart rate · HRV · blood pressure",
    signals: ["hr", "hrv", "systolic", "diastolic"],
    hazard: "Altered gravity",
    source: "standard",
    description:
      "Resting readings are compared with your own prior measurements. Changes need context and, when appropriate, medical review.",
  },
  {
    key: "respiratory",
    label: "Respiratory",
    short: "Respiratory",
    subtitle: "Peripheral oxygen saturation",
    signals: ["spo2"],
    hazard: "Hostile closed environments",
    source: "hazards",
    description:
      "SpO₂ is a peripheral oxygen estimate. It does not assess lung anatomy or rule out breathing problems.",
  },
  {
    key: "mobility",
    label: "Muscle & bone",
    short: "Muscle & bone",
    subtitle: "Exercise adherence proxy",
    signals: ["exercise"],
    hazard: "Altered gravity",
    source: "hazards",
    description:
      "Exercise supports the countermeasure routine. Bone density and muscle strength are not measured in this prototype.",
  },
  {
    key: "metabolic",
    label: "Metabolic indicators",
    short: "Metabolic",
    subtitle: "Temperature · glucose",
    signals: ["temp", "glucose"],
    hazard: "Spaceflight adaptation",
    source: "standard",
    description:
      "These measurements provide context, not an organ diagnosis. NASA archive measurements remain separate from your personal records.",
  },
  {
    key: "environment",
    label: "Cabin environment",
    short: "Environment",
    subtitle: "Cabin CO₂ context",
    signals: ["co2"],
    hazard: "Hostile closed environments",
    source: "hazards",
    description:
      "Cabin sensor readings belong to the local habitat. Earth space-weather feeds never replace them or estimate personal radiation dose.",
  },
];
export const SOURCES = {
  hazards: {
    title: "NASA HRP · Five hazards of human spaceflight",
    url: "https://www.nasa.gov/hrp/hazards/",
  },
  sleep: {
    title: "NASA HRP · Inadequate sleep and irregular schedules",
    url: "https://www.nasa.gov/reference/risk-from-inadequate-sleep-and-irregular-schedules/",
  },
  standard: {
    title: "NASA HRP · Spaceflight Standard Measures",
    url: "https://www.nasa.gov/reference/standard-measures/",
  },
  osd575: {
    title: "NASA OSDR · OSD-575",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-575",
  },
  challenge: {
    title: "Space Apps 2026 · Health monitoring software",
    url: "https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/",
  },
};
export const ACTIONS = [
  {
    id: "verify",
    title: "Verify an unexpected reading",
    tag: "MEASUREMENT QUALITY",
    description:
      "Check the device, units, posture and measurement context. Repeat using your approved procedure before interpreting an unexpected value.",
    source: "standard",
    domain: "cardio",
    steps: [
      "Check the device and its signal-quality indicator.",
      "Repeat under consistent conditions.",
      "Record both the repeat and its context; do not overwrite the original.",
    ],
  },
  {
    id: "rest",
    title: "Protect your next sleep window",
    tag: "RECOVERY",
    description:
      "Review the assigned sleep period and discuss schedule disruption with your crew. Follow the mission’s lighting and rest plan.",
    source: "sleep",
    domain: "neuro",
    steps: [
      "Review the planned rest period.",
      "Reduce avoidable interruptions with your crew.",
      "Log sleep and fatigue at the next check-in.",
    ],
  },
  {
    id: "exercise",
    title: "Review your assigned exercise plan",
    tag: "COUNTERMEASURE ROUTINE",
    description:
      "Check what was completed against your prescribed routine. Discuss pain or reduced tolerance with the crew medical officer.",
    source: "hazards",
    domain: "mobility",
    steps: [
      "Check the assigned routine, not a generic target.",
      "Document missed sessions or unusual discomfort.",
      "Do not change exercise intensity based on this prototype.",
    ],
  },
  {
    id: "checkin",
    title: "Make time for a crew check-in",
    tag: "CONNECTION",
    description:
      "Use a private, optional check-in to discuss fatigue or workload. Reach out through your mission support channels when needed.",
    source: "hazards",
    domain: "neuro",
    steps: [
      "Choose a comfortable, private time.",
      "Share only what you choose to share.",
      "Ask for support if a concern persists or worsens.",
    ],
  },
  {
    id: "cabin",
    title: "Confirm cabin sensor context",
    tag: "ENVIRONMENT",
    description:
      "Verify the cabin sensor’s location and calibration. Follow approved environmental procedures rather than interpreting an Earth weather feed as cabin data.",
    source: "hazards",
    domain: "environment",
    steps: [
      "Review sensor location, units and calibration status.",
      "Record the value and time.",
      "Escalate environmental concerns through mission procedures.",
    ],
  },
] as const;
export const STATE_LABEL = {
  within: "Within baseline",
  watch: "Review change",
  learning: "Building baseline",
  missing: "No reading",
  review: "Check input",
};
