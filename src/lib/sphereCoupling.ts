import { SphereId, SPHERE_ARRAY } from "@/types/spheres";
import { SPHERE_INTEL, computeIntelligence } from "./sphereIntelligence";

const WINDOW = 48;
const MAX_LAG = 8;

function pearson(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 4) return 0;
  let sa = 0, sb = 0;
  for (let i = 0; i < n; i++) { sa += a[i]; sb += b[i]; }
  const ma = sa / n, mb = sb / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    const xa = a[i] - ma, xb = b[i] - mb;
    num += xa * xb; da += xa * xa; db += xb * xb;
  }
  const denom = Math.sqrt(da * db);
  return denom < 1e-9 ? 0 : num / denom;
}

/** Positive lag = source leads target by `lag` ticks. */
function bestLag(a: number[], b: number[], maxLag = MAX_LAG): { lag: number; r: number } {
  let best = { lag: 0, r: pearson(a, b) };
  for (let L = 1; L <= maxLag; L++) {
    const r1 = pearson(a.slice(0, a.length - L), b.slice(L));        // source leads
    const r2 = pearson(a.slice(L), b.slice(0, b.length - L));        // source follows
    if (Math.abs(r1) > Math.abs(best.r)) best = { lag: L, r: r1 };
    if (Math.abs(r2) > Math.abs(best.r)) best = { lag: -L, r: r2 };
  }
  return best;
}

export type CouplingDirection = "outgoing" | "incoming" | "bidirectional";

export interface CouplingResult {
  target: SphereId;
  r: number;                  // signed Pearson at best lag
  strength: number;           // |r|, 0..1
  lag: number;                // ticks; >0 source leads, <0 source follows
  direction: CouplingDirection;
  sourceSeries: number[];
  targetSeries: number[];
}

function classifyDirection(lag: number): CouplingDirection {
  if (lag >= 2) return "outgoing";
  if (lag <= -2) return "incoming";
  return "bidirectional";
}

export function computeCouplings(source: SphereId, tick: number): CouplingResult[] {
  const src = computeIntelligence(SPHERE_INTEL[source], tick, WINDOW);
  const results = SPHERE_ARRAY.filter((s) => s.id !== source).map((s) => {
    const tgt = computeIntelligence(SPHERE_INTEL[s.id], tick, WINDOW);
    const { lag, r } = bestLag(src.scoreSeries, tgt.scoreSeries);
    return {
      target: s.id,
      r,
      strength: Math.abs(r),
      lag,
      direction: classifyDirection(lag),
      sourceSeries: src.scoreSeries,
      targetSeries: tgt.scoreSeries,
    } as CouplingResult;
  });
  return results.sort((a, b) => b.strength - a.strength);
}
