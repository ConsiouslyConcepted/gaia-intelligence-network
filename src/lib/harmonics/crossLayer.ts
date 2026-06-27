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

/** Curated cross-layer pairings, grouped by the boundary they straddle. */
export type PairingGroup =
  | "Planetary ↔ Solar"
  | "Solar ↔ Stellar"
  | "Stellar ↔ Galactic"
  | "Galactic ↔ Cosmological"
  | "Harmonic & Mathematical";

export interface Pairing {
  label: string;
  a: string;
  b: string;
  note: string;
  group: PairingGroup;
  /** Expected evidence tier — informational only; runtime classifier still applies. */
  expected: Evidence;
}

export const SUGGESTED_PAIRINGS: Pairing[] = [
  // Planetary ↔ Solar
  { group: "Planetary ↔ Solar", label: "Solar wind ↔ Magnetosphere (Kp)", a: "solar-wind", b: "kp-index", note: "Solar wind speed drives geomagnetic Kp response.", expected: "measured" },
  { group: "Planetary ↔ Solar", label: "IMF Bt ↔ Geomagnetic activity", a: "imf-bt", b: "kp-index", note: "Heliospheric magnetic field correlates with geomagnetic disturbance.", expected: "measured" },
  { group: "Planetary ↔ Solar", label: "Sunspot cycle ↔ Ocean heat", a: "sunspot", b: "ohc", note: "Schwabe cycle vs ocean heat content (modest, modulated).", expected: "statistical" },
  { group: "Planetary ↔ Solar", label: "Solar X-ray ↔ Atmospheric CO₂ cycle", a: "xray-flux", b: "co2-ppm", note: "Solar activity envelope vs annual carbon cycle.", expected: "exploratory" },
  { group: "Planetary ↔ Solar", label: "Sunspot ↔ Sea-ice extent", a: "sunspot", b: "sea-ice", note: "Solar forcing vs cryosphere response.", expected: "statistical" },
  { group: "Planetary ↔ Solar", label: "Schumann resonance ↔ Solar X-ray", a: "schumann", b: "xray-flux", note: "Ionospheric cavity tuning vs solar ionizing flux.", expected: "statistical" },

  // Solar ↔ Stellar
  { group: "Solar ↔ Stellar", label: "Solar p-modes ↔ Stellar p-modes", a: "xray-flux", b: "g-star-pmodes", note: "Asteroseismology — solar oscillation envelope vs sun-like star.", expected: "measured" },
  { group: "Solar ↔ Stellar", label: "Solar cycle ↔ Stellar starspot rotation", a: "sunspot", b: "starspot-rotation", note: "Magnetic-cycle analog across sun-like stars.", expected: "statistical" },
  { group: "Solar ↔ Stellar", label: "Solar irradiance proxy ↔ Cepheid pulsation", a: "xray-flux", b: "variable-cepheid", note: "Stellar evolution beats vs solar activity envelope.", expected: "exploratory" },

  // Stellar ↔ Galactic
  { group: "Stellar ↔ Galactic", label: "Stellar motions ↔ Galactic orbit", a: "starspot-rotation", b: "galactic-orbit", note: "Local stellar dynamics vs Milky Way rotation.", expected: "exploratory" },
  { group: "Stellar ↔ Galactic", label: "Cosmic-ray flux ↔ Spiral-arm density", a: "cosmic-ray-flux", b: "arm-density", note: "Local interstellar environment vs galactic structure.", expected: "statistical" },
  { group: "Stellar ↔ Galactic", label: "Cosmic-ray flux ↔ Solar wind shielding", a: "cosmic-ray-flux", b: "solar-wind", note: "Heliospheric modulation of galactic cosmic rays.", expected: "measured" },

  // Galactic ↔ Cosmological
  { group: "Galactic ↔ Cosmological", label: "Galactic orbit ↔ CMB angular spectrum", a: "galactic-orbit", b: "cmb-cl", note: "Local rotation vs large-scale anisotropy harmonics.", expected: "exploratory" },
  { group: "Galactic ↔ Cosmological", label: "Spiral-arm density ↔ BAO scale", a: "arm-density", b: "bao", note: "Galactic density wave vs baryon acoustic feature.", expected: "exploratory" },
  { group: "Galactic ↔ Cosmological", label: "Cosmic-ray flux ↔ Primordial spectrum", a: "cosmic-ray-flux", b: "primordial", note: "Galactic field environment vs cosmological initial conditions.", expected: "exploratory" },

  // Harmonic & Mathematical
  { group: "Harmonic & Mathematical", label: "Jupiter–Saturn ↔ Solar-system beat", a: "jupiter-saturn", b: "solar-system-beat", note: "Resonant orbital ratios mirror harmonic intervals.", expected: "statistical" },
  { group: "Harmonic & Mathematical", label: "Cepheid pulsation ↔ Solar p-modes", a: "variable-cepheid", b: "g-star-pmodes", note: "Oscillator topology shared across scales.", expected: "exploratory" },
  { group: "Harmonic & Mathematical", label: "BAO ↔ CMB Cℓ", a: "bao", b: "cmb-cl", note: "Acoustic peak harmonics across two probes.", expected: "measured" },
];
