// Keplerian harmonic configurations (Harmonice Mundi, Book IV).
// Each aspect carries its generating polygon and the musical interval
// derived from the same harmonic ratio.

export interface KeplerAspect {
  name: string;
  angle: number;
  orb: number;
  /** "major" aspects use standard wide orbs; "minor" are tighter. */
  tier: "major" | "minor";
  /** Number of vertices in the generating polygon (regular or star). */
  polygonSides: number;
  /** Star polygon stride k for {n/k} polygons; 1 for simple regular polygons. */
  polygonStride: number;
  /** Linked musical interval id from src/lib/geometry/musicGeometry.ts where applicable. */
  intervalId: string | null;
  /** Compact interval label for the sidebar (ratio-like). */
  intervalLabel: string;
  /** 0..1 — Keplerian consonance weight; opposition/conjunction = highest, dissonant = low. */
  consonance: number;
  /** Single-character polygon glyph for compact display. */
  polygonGlyph: string;
  color: string;
}

// Order from most consonant (top) to most dissonant.
export const KEPLER_ASPECTS: KeplerAspect[] = [
  { name: "conjunction",     angle:   0, orb: 8,   tier: "major", polygonSides: 1,  polygonStride: 1, intervalId: null,  intervalLabel: "unison 1:1", consonance: 1.00, polygonGlyph: "•",  color: "hsl(45, 70%, 70%)"  },
  { name: "opposition",      angle: 180, orb: 8,   tier: "major", polygonSides: 2,  polygonStride: 1, intervalId: "P8",  intervalLabel: "P8 · 2:1",    consonance: 0.95, polygonGlyph: "—",  color: "hsl(280, 35%, 68%)" },
  { name: "trine",           angle: 120, orb: 6,   tier: "major", polygonSides: 3,  polygonStride: 1, intervalId: "P5",  intervalLabel: "P5 · 3:2",    consonance: 0.92, polygonGlyph: "△",  color: "hsl(140, 40%, 62%)" },
  { name: "square",          angle:  90, orb: 6,   tier: "major", polygonSides: 4,  polygonStride: 1, intervalId: "P4",  intervalLabel: "P4 · 4:3",    consonance: 0.65, polygonGlyph: "▢",  color: "hsl(0, 55%, 58%)"   },
  { name: "sextile",         angle:  60, orb: 4,   tier: "major", polygonSides: 6,  polygonStride: 1, intervalId: "M6",  intervalLabel: "M6 · 5:3",    consonance: 0.80, polygonGlyph: "⬡",  color: "hsl(180, 45%, 65%)" },
  { name: "quintile",        angle:  72, orb: 2,   tier: "minor", polygonSides: 5,  polygonStride: 1, intervalId: "M3",  intervalLabel: "M3 · 5:4",    consonance: 0.78, polygonGlyph: "⬠",  color: "hsl(50, 55%, 68%)"  },
  { name: "biquintile",      angle: 144, orb: 2,   tier: "minor", polygonSides: 5,  polygonStride: 2, intervalId: "m6",  intervalLabel: "m6 · 8:5",    consonance: 0.62, polygonGlyph: "✶",  color: "hsl(60, 45%, 65%)"  },
  { name: "semi-sextile",    angle:  30, orb: 1.5, tier: "minor", polygonSides: 12, polygonStride: 1, intervalId: "M2",  intervalLabel: "M2 · 9:8 ★",  consonance: 0.45, polygonGlyph: "⬢",  color: "hsl(40, 55%, 70%)"  },
  { name: "quincunx",        angle: 150, orb: 2,   tier: "minor", polygonSides: 12, polygonStride: 5, intervalId: null,  intervalLabel: "m7 · 9:5",    consonance: 0.30, polygonGlyph: "✷",  color: "hsl(300, 30%, 60%)" },
  { name: "semi-square",     angle:  45, orb: 1.5, tier: "minor", polygonSides: 8,  polygonStride: 1, intervalId: null,  intervalLabel: "m2 · 16:15",  consonance: 0.25, polygonGlyph: "⯃",  color: "hsl(10, 50%, 55%)"  },
  { name: "sesquiquadrate",  angle: 135, orb: 1.5, tier: "minor", polygonSides: 8,  polygonStride: 3, intervalId: null,  intervalLabel: "tritone 45:32", consonance: 0.20, polygonGlyph: "✦",  color: "hsl(20, 50%, 55%)"  },
];

export function getAspectMeta(name: string): KeplerAspect | undefined {
  return KEPLER_ASPECTS.find((a) => a.name === name);
}

export interface HarmonicFieldScore {
  /** 0..100 aggregate consonance, weighted by exactness (1 - orb/maxOrb). */
  score: number;
  count: number;
  mostConsonant: { name: string; consonance: number } | null;
  mostDissonant: { name: string; consonance: number } | null;
}

export function scoreHarmonicField(aspects: { name: string; orb: number }[]): HarmonicFieldScore {
  if (aspects.length === 0) {
    return { score: 0, count: 0, mostConsonant: null, mostDissonant: null };
  }
  let weighted = 0;
  let totalWeight = 0;
  let best: { name: string; consonance: number } | null = null;
  let worst: { name: string; consonance: number } | null = null;
  for (const a of aspects) {
    const meta = getAspectMeta(a.name);
    if (!meta) continue;
    const exactness = Math.max(0, 1 - a.orb / Math.max(meta.orb, 0.001));
    const w = 0.4 + 0.6 * exactness;
    weighted += meta.consonance * w;
    totalWeight += w;
    if (!best || meta.consonance > best.consonance) best = { name: a.name, consonance: meta.consonance };
    if (!worst || meta.consonance < worst.consonance) worst = { name: a.name, consonance: meta.consonance };
  }
  return {
    score: totalWeight > 0 ? Math.round((weighted / totalWeight) * 100) : 0,
    count: aspects.length,
    mostConsonant: best,
    mostDissonant: worst,
  };
}

/**
 * Compute the polygon vertex angles for an aspect inscribed in the chart,
 * starting from `startDeg` and stepping by the aspect angle. Returns the
 * sequence of ecliptic longitudes that close the (possibly star-shaped) polygon.
 */
export function polygonAngles(startDeg: number, aspectAngle: number, maxVertices = 24): number[] {
  if (aspectAngle <= 0) return [];
  const pts: number[] = [];
  let theta = startDeg;
  for (let i = 0; i < maxVertices; i++) {
    pts.push(((theta % 360) + 360) % 360);
    theta += aspectAngle;
    const closed = ((theta - startDeg) % 360 + 360) % 360;
    if (closed < 0.5 || closed > 359.5) break;
  }
  return pts;
}
