import { SphereId } from "@/types/spheres";

export type ScorePolarity = "stability" | "activity";

export interface MetricSpec {
  key: string;
  label: string;
  unit: string;
  /** baseline value used as the long-term reference */
  baseline: number;
  /** standard deviation of the metric under normal conditions */
  sigma: number;
  /** amplitude of the deterministic oscillation around baseline */
  amplitude: number;
  /** angular speed for the deterministic oscillation */
  frequency: number;
  /** phase offset so different metrics don't move in lockstep */
  phase: number;
  /** if true, higher values reduce the score (stability polarity) */
  invert?: boolean;
  /** weight in the score (default 1) */
  weight?: number;
  /** number of decimal places for display */
  precision?: number;
}

export interface SphereIntelligenceSpec {
  id: SphereId;
  purpose: string;
  scoreLabel: string;
  polarity: ScorePolarity;
  metrics: MetricSpec[];
}

export interface MetricReading {
  spec: MetricSpec;
  value: number;
  /** z-score against baseline */
  z: number;
  /** rolling series for sparkline (oldest → newest) */
  series: number[];
  /** delta vs baseline as a signed percent */
  deltaPct: number;
  isAnomaly: boolean;
}

export interface SphereIntelligence {
  id: SphereId;
  purpose: string;
  scoreLabel: string;
  polarity: ScorePolarity;
  score: number;
  /** trend = current score minus score 12 ticks ago */
  trend: number;
  scoreSeries: number[];
  metrics: MetricReading[];
  anomalies: MetricReading[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-sphere specs
// Note: project uses Geosphere (lithospheric data lives here), Hydrosphere,
// Cryosphere, Biosphere, Noosphere, Magnetosphere (rendered as "Heliosphere"),
// Ionosphere (rendered as "Technosphere"), and Crystalsphere.
// ─────────────────────────────────────────────────────────────────────────────

export const SPHERE_INTEL: Record<SphereId, SphereIntelligenceSpec> = {
  geosphere: {
    id: "geosphere",
    purpose: "Track structural planetary activity.",
    scoreLabel: "Activity",
    polarity: "activity",
    metrics: [
      { key: "seismic", label: "Seismic Energy", unit: "PJ", baseline: 4.2, sigma: 1.1, amplitude: 1.4, frequency: 0.07, phase: 0.0, precision: 2 },
      { key: "quakes", label: "Quake Frequency", unit: "/day", baseline: 142, sigma: 22, amplitude: 28, frequency: 0.05, phase: 1.1, precision: 0 },
      { key: "volcanic", label: "Volcanic Activity", unit: "idx", baseline: 0.38, sigma: 0.09, amplitude: 0.11, frequency: 0.04, phase: 2.3, precision: 2 },
    ],
  },
  hydrosphere: {
    id: "hydrosphere",
    purpose: "Track oceanic dynamics.",
    scoreLabel: "Ocean Dynamics",
    polarity: "stability",
    metrics: [
      { key: "ohc", label: "Ocean Heat Content", unit: "ZJ", baseline: 14.2, sigma: 0.6, amplitude: 0.55, frequency: 0.03, phase: 0.0, invert: true, precision: 1 },
      { key: "sst", label: "SST Anomaly", unit: "°C", baseline: 0.32, sigma: 0.12, amplitude: 0.18, frequency: 0.06, phase: 1.7, invert: true, precision: 2 },
      { key: "amoc", label: "AMOC Strength", unit: "Sv", baseline: 16.8, sigma: 1.2, amplitude: 1.6, frequency: 0.04, phase: 2.9, precision: 1 },
    ],
  },
  cryosphere: {
    id: "cryosphere",
    purpose: "Track Earth's long-term thermal memory.",
    scoreLabel: "Stability",
    polarity: "stability",
    metrics: [
      { key: "arctic", label: "Arctic Sea Ice", unit: "M km²", baseline: 10.4, sigma: 0.8, amplitude: 1.2, frequency: 0.05, phase: 0.0, precision: 2 },
      { key: "antarctic", label: "Antarctic Sea Ice", unit: "M km²", baseline: 12.1, sigma: 0.9, amplitude: 1.4, frequency: 0.05, phase: 3.14, precision: 2 },
      { key: "snow", label: "Snow Cover", unit: "M km²", baseline: 24.6, sigma: 1.5, amplitude: 2.2, frequency: 0.04, phase: 1.5, precision: 1 },
    ],
  },
  atmosphere: {
    id: "atmosphere",
    purpose: "Track gaseous envelope chemistry and weather state.",
    scoreLabel: "Stability",
    polarity: "stability",
    metrics: [
      { key: "co2", label: "CO₂ Concentration", unit: "ppm", baseline: 424, sigma: 1.4, amplitude: 1.8, frequency: 0.03, phase: 0.0, invert: true, precision: 1 },
      { key: "ozone", label: "Ozone Column", unit: "DU", baseline: 298, sigma: 8, amplitude: 12, frequency: 0.05, phase: 1.6, precision: 0 },
      { key: "aerosol", label: "Aerosol Optical Depth", unit: "AOD", baseline: 0.16, sigma: 0.03, amplitude: 0.04, frequency: 0.06, phase: 2.4, invert: true, precision: 2 },
      { key: "tempAnom", label: "Surface Temp Anomaly", unit: "°C", baseline: 1.18, sigma: 0.08, amplitude: 0.1, frequency: 0.03, phase: 0.8, invert: true, precision: 2 },
    ],
  },
  biosphere: {
    id: "biosphere",
    purpose: "Track Earth's biological vitality.",
    scoreLabel: "Vitality",
    polarity: "stability",
    metrics: [
      { key: "ndvi", label: "Global NDVI", unit: "idx", baseline: 0.46, sigma: 0.04, amplitude: 0.05, frequency: 0.04, phase: 0.0, precision: 2 },
      { key: "carbon", label: "Carbon Uptake", unit: "GtC/yr", baseline: 11.2, sigma: 0.7, amplitude: 0.9, frequency: 0.03, phase: 1.3, precision: 1 },
      { key: "productivity", label: "Net Primary Productivity", unit: "PgC/yr", baseline: 56.4, sigma: 2.1, amplitude: 2.8, frequency: 0.03, phase: 2.5, precision: 1 },
    ],
  },
  noosphere: {
    id: "noosphere",
    purpose: "Track collective informational coherence.",
    scoreLabel: "Coherence",
    polarity: "stability",
    metrics: [
      { key: "flow", label: "Information Flow", unit: "Tb/s", baseline: 840, sigma: 60, amplitude: 80, frequency: 0.06, phase: 0.0, precision: 0 },
      { key: "snr", label: "Signal/Noise", unit: "dB", baseline: 14.2, sigma: 1.6, amplitude: 2.0, frequency: 0.05, phase: 1.8, precision: 1 },
      { key: "attention", label: "Collective Attention", unit: "idx", baseline: 0.62, sigma: 0.08, amplitude: 0.1, frequency: 0.04, phase: 2.6, precision: 2 },
    ],
  },
  magnetosphere: {
    id: "magnetosphere",
    purpose: "Track Earth's electromagnetic environment.",
    scoreLabel: "Coherence",
    polarity: "stability",
    metrics: [
      { key: "kp", label: "Kp Index", unit: "", baseline: 2.4, sigma: 0.9, amplitude: 1.1, frequency: 0.08, phase: 0.0, invert: true, precision: 1 },
      { key: "wind", label: "Solar Wind Pressure", unit: "nPa", baseline: 2.1, sigma: 0.6, amplitude: 0.8, frequency: 0.07, phase: 1.4, invert: true, precision: 2 },
      { key: "schumann", label: "Schumann Resonance", unit: "Hz", baseline: 7.83, sigma: 0.08, amplitude: 0.12, frequency: 0.04, phase: 2.1, precision: 2 },
      { key: "geomag", label: "Geomagnetic Activity", unit: "nT", baseline: 18, sigma: 6, amplitude: 8, frequency: 0.09, phase: 3.0, invert: true, precision: 0 },
    ],
  },
  ionosphere: {
    id: "ionosphere",
    purpose: "Track the planetary footprint of human infrastructure.",
    scoreLabel: "Stability",
    polarity: "stability",
    metrics: [
      { key: "grid", label: "Global Grid Load", unit: "TW", baseline: 28.4, sigma: 2.2, amplitude: 3.0, frequency: 0.06, phase: 0.0, invert: true, precision: 1 },
      { key: "dc_energy", label: "Data Center Energy", unit: "TWh/yr", baseline: 460, sigma: 22, amplitude: 30, frequency: 0.04, phase: 1.6, invert: true, precision: 0 },
      { key: "traffic", label: "Internet Traffic", unit: "Pb/s", baseline: 1.2, sigma: 0.08, amplitude: 0.12, frequency: 0.05, phase: 2.1, precision: 2 },
      { key: "satellites", label: "Active Satellites", unit: "k", baseline: 10.2, sigma: 0.25, amplitude: 0.35, frequency: 0.03, phase: 2.4, invert: true, precision: 1 },
    ],
  },
  crystalsphere: {
    id: "crystalsphere",
    purpose: "Track harmonic memory and cross-sphere phase lock.",
    scoreLabel: "Resonance",
    polarity: "stability",
    metrics: [
      { key: "lattice", label: "Lattice Symmetry", unit: "idx", baseline: 0.78, sigma: 0.06, amplitude: 0.08, frequency: 0.04, phase: 0.0, precision: 2 },
      { key: "phaseLock", label: "Phase Lock", unit: "%", baseline: 71, sigma: 6, amplitude: 8, frequency: 0.05, phase: 1.9, precision: 0 },
      { key: "coupling", label: "Coupling Strength", unit: "idx", baseline: 0.64, sigma: 0.07, amplitude: 0.09, frequency: 0.06, phase: 2.8, precision: 2 },
    ],
  },
  heliosphere: {
    id: "heliosphere",
    purpose: "Track solar activity transmitted to Earth's outer systems.",
    scoreLabel: "Activity",
    polarity: "activity",
    metrics: [
      { key: "sunspots", label: "Sunspot Number", unit: "SSN", baseline: 128, sigma: 22, amplitude: 28, frequency: 0.02, phase: 0.0, precision: 0 },
      { key: "solarWind", label: "Solar Wind Speed", unit: "km/s", baseline: 440, sigma: 60, amplitude: 80, frequency: 0.06, phase: 1.1, precision: 0 },
      { key: "xray", label: "X-Ray Flux", unit: "W/m²", baseline: 2.4, sigma: 0.6, amplitude: 0.9, frequency: 0.08, phase: 2.0, precision: 2 },
      { key: "imf", label: "IMF Bt", unit: "nT", baseline: 5.6, sigma: 1.4, amplitude: 1.8, frequency: 0.07, phase: 2.6, precision: 1 },
      { key: "cme", label: "CME Activity", unit: "idx", baseline: 0.42, sigma: 0.12, amplitude: 0.18, frequency: 0.05, phase: 0.8, precision: 2 },
      { key: "hai", label: "Heliospheric Activity Index", unit: "HAI", baseline: 0.55, sigma: 0.1, amplitude: 0.14, frequency: 0.04, phase: 1.7, precision: 2 },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic value generation
// ─────────────────────────────────────────────────────────────────────────────

/** Stable pseudo-random in [-1, 1] derived from a seed (mulberry32-ish). */
function noise(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 0xffffffff * 2 - 1;
}

/** Compute a metric value at integer tick t. */
export function metricAt(spec: MetricSpec, t: number, seedOffset = 0): number {
  const osc = Math.sin(t * spec.frequency + spec.phase) * spec.amplitude;
  const jitter = noise(Math.floor(t) + seedOffset) * spec.sigma * 0.35;
  return spec.baseline + osc + jitter;
}

/** Normalize a single metric's contribution to a 0–100 sub-score. */
function metricScore(spec: MetricSpec, value: number): number {
  const z = (value - spec.baseline) / Math.max(spec.sigma, 1e-6);
  // base 80 for on-baseline, lose 12 points per sigma of deviation (signed by invert)
  const signed = spec.invert ? z : -Math.abs(z);
  // For non-inverted stability metrics, deviation in either direction reduces score.
  // For inverted (lower is better), positive z reduces score, negative z raises it.
  const raw = spec.invert ? 80 - z * 12 : 80 - Math.abs(z) * 12;
  // touch `signed` so it isn't flagged as unused while preserving readable intent above
  void signed;
  return Math.max(0, Math.min(100, raw));
}

export function computeIntelligence(
  spec: SphereIntelligenceSpec,
  tick: number,
  seriesLength = 24,
): SphereIntelligence {
  const seedBase = spec.id.charCodeAt(0) * 131;

  const metrics: MetricReading[] = spec.metrics.map((m, idx) => {
    const value = metricAt(m, tick, seedBase + idx * 17);
    const series = Array.from({ length: seriesLength }, (_, i) =>
      metricAt(m, tick - (seriesLength - 1 - i), seedBase + idx * 17),
    );
    const z = (value - m.baseline) / Math.max(m.sigma, 1e-6);
    const deltaPct = ((value - m.baseline) / Math.max(Math.abs(m.baseline), 1e-6)) * 100;
    return {
      spec: m,
      value,
      z,
      series,
      deltaPct,
      isAnomaly: Math.abs(z) > 2,
    };
  });

  const scoreNow = weightedAverage(spec, metrics.map((r) => metricScore(r.spec, r.value)));

  const scoreSeries = Array.from({ length: seriesLength }, (_, i) => {
    const t = tick - (seriesLength - 1 - i);
    const sub = spec.metrics.map((m, idx) => metricScore(m, metricAt(m, t, seedBase + idx * 17)));
    return weightedAverage(spec, sub);
  });

  const trend = scoreNow - scoreSeries[0];

  return {
    id: spec.id,
    purpose: spec.purpose,
    scoreLabel: spec.scoreLabel,
    polarity: spec.polarity,
    score: Math.round(scoreNow),
    trend: Math.round(trend * 10) / 10,
    scoreSeries,
    metrics,
    anomalies: metrics.filter((r) => r.isAnomaly),
  };
}

function weightedAverage(spec: SphereIntelligenceSpec, subs: number[]): number {
  const weights = spec.metrics.map((m) => m.weight ?? 1);
  const sumW = weights.reduce((a, b) => a + b, 0);
  const sum = subs.reduce((a, v, i) => a + v * weights[i], 0);
  return sum / sumW;
}

export function formatMetric(reading: MetricReading): string {
  const p = reading.spec.precision ?? 2;
  return reading.value.toFixed(p);
}
