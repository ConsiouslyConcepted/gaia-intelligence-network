// Live coupling metrics for the Cross-Layer Resonance Network.
// For each curated pairing, compute the current best-lag correlation over a
// configurable window of the underlying series. Classify each coupling against
// its expected evidence tier and flag anomalies (drop-out, sign flip, or
// unexpected spike).

import { crossCorrelation } from "./engine";
import { getDataset, type Dataset } from "./datasets";
import { SUGGESTED_PAIRINGS, type Evidence, type Pairing } from "./crossLayer";

export type Timeframe = "30d" | "90d" | "1y" | "all";

export const TIMEFRAMES: { id: Timeframe; label: string; samples: number | "all" }[] = [
  { id: "30d", label: "30d", samples: 30 },
  { id: "90d", label: "90d", samples: 90 },
  { id: "1y", label: "1y", samples: 365 },
  { id: "all", label: "All", samples: "all" },
];

export type AnomalyKind = "normal" | "weak" | "strong" | "sign-flip" | "missing";

export interface CouplingMetric {
  pairing: Pairing;
  a?: Dataset;
  b?: Dataset;
  /** Best-lag Pearson r over the window, in [-1, 1]. */
  r: number;
  /** |r| in [0, 1] used for visual weight. */
  absR: number;
  /** Best lag in samples. */
  lag: number;
  /** Window length actually used. */
  n: number;
  /** Live-classified evidence tier from |r|. */
  liveTier: Evidence;
  /** Expected vs live divergence classification. */
  anomaly: AnomalyKind;
  anomalyNote?: string;
}

function zscore(s: number[]): number[] {
  const n = s.length;
  if (!n) return s;
  const mean = s.reduce((a, b) => a + b, 0) / n;
  const variance = s.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const sd = Math.sqrt(variance) || 1;
  return s.map((v) => (v - mean) / sd);
}

function sliceTail(series: number[], samples: number | "all"): number[] {
  if (samples === "all" || samples >= series.length) return series.slice();
  return series.slice(series.length - samples);
}

function classifyTier(absR: number): Evidence {
  if (absR >= 0.6) return "measured";
  if (absR >= 0.3) return "statistical";
  return "exploratory";
}

const TIER_RANK: Record<Evidence, number> = { exploratory: 0, statistical: 1, measured: 2 };

function classifyAnomaly(
  expected: Evidence,
  live: Evidence,
  r: number,
  expectedSignPositive = true,
): { anomaly: AnomalyKind; note?: string } {
  if (!Number.isFinite(r)) {
    return { anomaly: "missing", note: "Insufficient data in window." };
  }
  // Sign-flip: expected positive coupling now strongly negative (or vice versa).
  if (Math.abs(r) >= 0.35 && (r < 0) === expectedSignPositive) {
    return {
      anomaly: "sign-flip",
      note: `Coupling reversed (r=${r.toFixed(2)}). Direction inverted from expected.`,
    };
  }
  const diff = TIER_RANK[live] - TIER_RANK[expected];
  if (diff <= -2) {
    return {
      anomaly: "weak",
      note: `Expected measured coupling has collapsed (|r|=${Math.abs(r).toFixed(2)}).`,
    };
  }
  if (diff <= -1) {
    return {
      anomaly: "weak",
      note: `Coupling weaker than expected (|r|=${Math.abs(r).toFixed(2)}).`,
    };
  }
  if (diff >= 2) {
    return {
      anomaly: "strong",
      note: `Coupling stronger than expected (|r|=${Math.abs(r).toFixed(2)}). Possible emerging signal.`,
    };
  }
  return { anomaly: "normal" };
}

export function computeCouplings(timeframe: Timeframe): CouplingMetric[] {
  const tf = TIMEFRAMES.find((t) => t.id === timeframe) ?? TIMEFRAMES[3];
  return SUGGESTED_PAIRINGS.map((p) => {
    const a = getDataset(p.a);
    const b = getDataset(p.b);
    if (!a || !b) {
      return {
        pairing: p, r: NaN, absR: 0, lag: 0, n: 0,
        liveTier: "exploratory" as Evidence,
        anomaly: "missing" as AnomalyKind,
        anomalyNote: "Dataset unavailable.",
      };
    }
    const sa = sliceTail(a.series, tf.samples);
    const sb = sliceTail(b.series, tf.samples);
    const n = Math.min(sa.length, sb.length);
    if (n < 10) {
      return {
        pairing: p, a, b, r: NaN, absR: 0, lag: 0, n,
        liveTier: "exploratory" as Evidence,
        anomaly: "missing" as AnomalyKind,
        anomalyNote: "Window too short.",
      };
    }
    const za = zscore(sa.slice(0, n));
    const zb = zscore(sb.slice(0, n));
    const cc = crossCorrelation(za, zb);
    const r = cc.bestR;
    const absR = Math.abs(r);
    const liveTier = classifyTier(absR);
    const { anomaly, note } = classifyAnomaly(p.expected, liveTier, r);
    return {
      pairing: p,
      a, b,
      r, absR,
      lag: cc.bestLag,
      n,
      liveTier,
      anomaly,
      anomalyNote: note,
    };
  });
}

export function couplingColorHue(tier: Evidence): number {
  if (tier === "measured") return 150;
  if (tier === "statistical") return 200;
  return 280;
}

export function anomalyColorHue(a: AnomalyKind): number | null {
  if (a === "sign-flip") return 340; // magenta-red
  if (a === "weak") return 30;       // amber
  if (a === "strong") return 55;     // gold
  if (a === "missing") return 0;     // muted red
  return null;
}
