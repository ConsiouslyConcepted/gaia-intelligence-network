// Cross-layer comparison helpers.
// Aligns two datasets to a common length, z-scores them, runs spectral overlay,
// best-lag cross-correlation, period-ratio detection, and classifies the
// resulting evidence tier.

import {
  crossCorrelation,
  nearestInterval,
  nearestRatio,
  spectrum,
  type CrossCorrelation,
  type SpectrumBin,
} from "./engine";
import type { Dataset } from "./datasets";

export type Evidence = "measured" | "statistical" | "exploratory";

export interface CrossLayerResult {
  a: Dataset;
  b: Dataset;
  zA: number[];
  zB: number[];
  topPeaksA: SpectrumBin[];
  topPeaksB: SpectrumBin[];
  sharedPeriods: { periodA: number; periodB: number; ratio: string; interval: string; cents: number }[];
  correlation: CrossCorrelation;
  evidence: Evidence;
  evidenceNote: string;
}

function zscore(s: number[]): number[] {
  const n = s.length;
  if (!n) return s;
  const mean = s.reduce((a, b) => a + b, 0) / n;
  const variance = s.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const sd = Math.sqrt(variance) || 1;
  return s.map((v) => (v - mean) / sd);
}

function resample(s: number[], targetLen: number): number[] {
  if (s.length === targetLen) return s;
  const out: number[] = [];
  const step = (s.length - 1) / Math.max(targetLen - 1, 1);
  for (let i = 0; i < targetLen; i++) {
    const t = i * step;
    const i0 = Math.floor(t);
    const i1 = Math.min(s.length - 1, i0 + 1);
    const f = t - i0;
    out.push(s[i0] * (1 - f) + s[i1] * f);
  }
  return out;
}

function classifyEvidence(a: Dataset, b: Dataset, r: number): { evidence: Evidence; note: string } {
  const provA = a.provenance ?? "synthetic";
  const provB = b.provenance ?? "synthetic";
  const absR = Math.abs(r);
  if (provA === "measured" && provB === "measured") {
    return {
      evidence: "measured",
      note: `Both series are anchored on direct observational sources; relationship is physically measurable.`,
    };
  }
  if (absR >= 0.4) {
    return {
      evidence: "statistical",
      note: `|r| = ${absR.toFixed(2)} across the overlap — a statistically meaningful linear relationship.`,
    };
  }
  return {
    evidence: "exploratory",
    note: `|r| = ${absR.toFixed(2)} is below the statistical-significance threshold. Treat this as a user-driven pattern comparison, not evidence.`,
  };
}

export function compareLayers(a: Dataset, b: Dataset): CrossLayerResult {
  const N = Math.min(a.series.length, b.series.length, 1024);
  const sa = resample(a.series.slice(0, Math.min(a.series.length, 1024)), N);
  const sb = resample(b.series.slice(0, Math.min(b.series.length, 1024)), N);
  const zA = zscore(sa);
  const zB = zscore(sb);

  const specA = spectrum(sa, a.sampleRate, a.unit);
  const specB = spectrum(sb, b.sampleRate, b.unit);
  const topPeaksA = specA.peaks.slice(0, 4);
  const topPeaksB = specB.peaks.slice(0, 4);

  const sharedPeriods: CrossLayerResult["sharedPeriods"] = [];
  for (const pa of topPeaksA) {
    for (const pb of topPeaksB) {
      const ratio = pa.period / pb.period;
      const nr = nearestRatio(ratio, 8);
      if (nr.error < 0.05) {
        const iv = nearestInterval(ratio);
        sharedPeriods.push({
          periodA: pa.period,
          periodB: pb.period,
          ratio: nr.label,
          interval: iv.interval.label,
          cents: iv.cents,
        });
      }
    }
  }

  const correlation = crossCorrelation(zA, zB);
  const { evidence, note } = classifyEvidence(a, b, correlation.bestR);

  return {
    a, b, zA, zB,
    topPeaksA, topPeaksB,
    sharedPeriods,
    correlation,
    evidence,
    evidenceNote: note,
  };
}

/** Curated, pedagogically useful pairings across nested layers. */
export const SUGGESTED_PAIRINGS: { label: string; a: string; b: string; note: string }[] = [
  { label: "Solar magnetic ↔ Earth magnetosphere", a: "imf-bt", b: "kp-index", note: "Heliospheric B drives geomagnetic disturbance." },
  { label: "Solar cycle ↔ Atmospheric seasonal", a: "sunspot", b: "co2-ppm", note: "Long-term solar forcing vs annual carbon cycle." },
  { label: "Orbital beat ↔ Musical intervals", a: "jupiter-saturn", b: "solar-system-beat", note: "Resonant orbital ratios mirror harmonic intervals." },
  { label: "Stellar oscillation ↔ Solar oscillation", a: "g-star-pmodes", b: "xray-flux", note: "Sun-like p-modes vs solar activity envelope." },
  { label: "Galactic field ↔ Heliosphere", a: "cosmic-ray-flux", b: "solar-wind", note: "Cosmic-ray modulation by heliospheric shielding." },
  { label: "Planetary coherence ↔ Solar activity", a: "ohc", b: "sunspot", note: "Ocean heat content vs Schwabe cycle." },
];
