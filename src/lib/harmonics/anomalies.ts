// Cross-layer anomaly & event detection.
// Runs lightweight deterministic detectors over every dataset in the registry,
// returning a flat feed of recent "events" with layer, severity, and evidence tier.

import { DATASETS, type Dataset, type Scope } from "./datasets";
import { spectrum } from "./engine";

export type EventKind =
  | "spike"          // single-sample z-score outlier
  | "trend"          // sustained drift over the tail window
  | "peak-shift"     // dominant period changed vs the long baseline
  | "harmonic-lock"; // small-integer ratio detected between two top peaks

export type Severity = "info" | "watch" | "alert";

export interface HarmonicEvent {
  id: string;
  scope: Scope;
  datasetId: string;
  datasetLabel: string;
  kind: EventKind;
  severity: Severity;
  /** Index of the most recent sample referenced by the event. */
  sampleIndex: number;
  /** Position along the series, expressed in the dataset's native unit. */
  position: number;
  unit: string;
  /** Plain-language description of what was detected. */
  summary: string;
  /** Evidence tier inherited from the dataset's provenance. */
  evidence: "measured" | "modeled" | "synthetic";
  /** Numeric score used to rank the event (higher = more notable). */
  score: number;
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / Math.max(xs.length, 1);
}
function stddev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length;
  return Math.sqrt(v);
}

function severityFromZ(z: number): Severity {
  const a = Math.abs(z);
  if (a >= 3.5) return "alert";
  if (a >= 2.25) return "watch";
  return "info";
}

function detectSpike(ds: Dataset): HarmonicEvent | null {
  const s = ds.series;
  const n = s.length;
  if (n < 16) return null;
  const tailLen = Math.max(8, Math.floor(n * 0.1));
  const baseline = s.slice(0, n - tailLen);
  const mu = mean(baseline);
  const sd = stddev(baseline) || 1;
  let bestZ = 0;
  let bestIdx = n - tailLen;
  for (let i = n - tailLen; i < n; i++) {
    const z = (s[i] - mu) / sd;
    if (Math.abs(z) > Math.abs(bestZ)) {
      bestZ = z;
      bestIdx = i;
    }
  }
  if (Math.abs(bestZ) < 2) return null;
  const dir = bestZ > 0 ? "surge" : "drop";
  return {
    id: `${ds.id}-spike-${bestIdx}`,
    scope: ds.scope,
    datasetId: ds.id,
    datasetLabel: ds.label,
    kind: "spike",
    severity: severityFromZ(bestZ),
    sampleIndex: bestIdx,
    position: bestIdx / ds.sampleRate,
    unit: ds.unit,
    summary: `${ds.label} ${dir} of ${Math.abs(bestZ).toFixed(2)}σ vs prior baseline.`,
    evidence: ds.provenance ?? "synthetic",
    score: Math.abs(bestZ),
  };
}

function detectTrend(ds: Dataset): HarmonicEvent | null {
  const s = ds.series;
  const n = s.length;
  if (n < 32) return null;
  const windowLen = Math.max(16, Math.floor(n * 0.2));
  const recent = s.slice(n - windowLen);
  // OLS slope on recent window, expressed in standard deviations per sample.
  const sd = stddev(s) || 1;
  const xMean = (windowLen - 1) / 2;
  const yMean = mean(recent);
  let num = 0, den = 0;
  for (let i = 0; i < windowLen; i++) {
    num += (i - xMean) * (recent[i] - yMean);
    den += (i - xMean) ** 2;
  }
  const slope = num / (den || 1);
  const slopeZ = (slope * windowLen) / sd; // total drift in σ over the window
  if (Math.abs(slopeZ) < 1.5) return null;
  const dir = slopeZ > 0 ? "rising" : "falling";
  return {
    id: `${ds.id}-trend-${n}`,
    scope: ds.scope,
    datasetId: ds.id,
    datasetLabel: ds.label,
    kind: "trend",
    severity: severityFromZ(slopeZ),
    sampleIndex: n - 1,
    position: (n - 1) / ds.sampleRate,
    unit: ds.unit,
    summary: `${ds.label} ${dir} ${Math.abs(slopeZ).toFixed(2)}σ across the last ${windowLen} samples.`,
    evidence: ds.provenance ?? "synthetic",
    score: Math.abs(slopeZ),
  };
}

function detectPeakShift(ds: Dataset): HarmonicEvent | null {
  const s = ds.series;
  const n = s.length;
  if (n < 128 || !ds.knownPeriod) return null;
  const half = Math.floor(n / 2);
  const oldSpec = spectrum(s.slice(0, half), ds.sampleRate, ds.unit);
  const newSpec = spectrum(s.slice(half), ds.sampleRate, ds.unit);
  if (!oldSpec.fundamental || !newSpec.fundamental) return null;
  const a = oldSpec.fundamental.period;
  const b = newSpec.fundamental.period;
  const drift = Math.abs(a - b) / Math.max(a, 0.001);
  if (drift < 0.08) return null;
  const score = Math.min(drift * 10, 4);
  return {
    id: `${ds.id}-peakshift-${n}`,
    scope: ds.scope,
    datasetId: ds.id,
    datasetLabel: ds.label,
    kind: "peak-shift",
    severity: score >= 2.25 ? "watch" : "info",
    sampleIndex: n - 1,
    position: (n - 1) / ds.sampleRate,
    unit: ds.unit,
    summary: `Dominant period drifted ${a.toFixed(2)} → ${b.toFixed(2)} ${ds.unit} (${(drift * 100).toFixed(0)}%).`,
    evidence: ds.provenance ?? "synthetic",
    score,
  };
}

export interface ScanOptions {
  scopes?: Scope[];
  minSeverity?: Severity;
  limit?: number;
}

const SEVERITY_RANK: Record<Severity, number> = { info: 0, watch: 1, alert: 2 };

/** Run all detectors over every dataset and return a ranked event feed. */
export function scanAllLayers(opts: ScanOptions = {}): HarmonicEvent[] {
  const list = DATASETS.filter((d) => !opts.scopes || opts.scopes.includes(d.scope));
  const events: HarmonicEvent[] = [];
  for (const ds of list) {
    const spike = detectSpike(ds);
    if (spike) events.push(spike);
    const trend = detectTrend(ds);
    if (trend) events.push(trend);
    const shift = detectPeakShift(ds);
    if (shift) events.push(shift);
  }
  const minRank = SEVERITY_RANK[opts.minSeverity ?? "info"];
  const filtered = events.filter((e) => SEVERITY_RANK[e.severity] >= minRank);
  filtered.sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] || b.score - a.score);
  return opts.limit ? filtered.slice(0, opts.limit) : filtered;
}

export const EVENT_KIND_LABEL: Record<EventKind, string> = {
  spike: "Spike",
  trend: "Trend",
  "peak-shift": "Peak shift",
  "harmonic-lock": "Harmonic lock",
};

export const SEVERITY_STYLE: Record<Severity, { color: string; border: string; bg: string; label: string }> = {
  info:  { color: "hsla(210,40%,80%,0.95)", border: "hsla(210,40%,55%,0.45)", bg: "hsla(210,40%,18%,0.35)", label: "Info" },
  watch: { color: "hsla(45,100%,82%,0.95)",  border: "hsla(45,90%,55%,0.5)",   bg: "hsla(45,60%,22%,0.35)",  label: "Watch" },
  alert: { color: "hsla(0,80%,82%,0.95)",    border: "hsla(0,70%,55%,0.55)",   bg: "hsla(0,60%,22%,0.35)",   label: "Alert" },
};
