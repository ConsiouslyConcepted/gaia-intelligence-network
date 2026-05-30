import { SphereIntelligence, MetricReading } from "@/lib/sphereIntelligence";

export type BasinId = "global" | "pacific" | "atlantic" | "indian" | "southern" | "arctic";

export interface Basin {
  id: BasinId;
  name: string;
  /** representative center lat/lng for marker placement */
  lat: number;
  lng: number;
  /** Per-basin character — multipliers/biases applied to global readings. */
  ohcBias: number;   // ZJ multiplier vs global
  sstBias: number;   // °C added to SST anomaly
  amocBias: number;  // Sv multiplier
  /** signature phenomenon to mention */
  signature: string;
  /** color tint for the marker */
  tint: string;
}

export const BASINS: Basin[] = [
  { id: "global",   name: "Global Ocean",   lat: 0,    lng: 0,    ohcBias: 1.00, sstBias:  0.00, amocBias: 1.00, signature: "planetary-scale conveyor", tint: "#0a2540" },
  { id: "pacific",  name: "Pacific",        lat: 0,    lng: -150, ohcBias: 1.18, sstBias:  0.08, amocBias: 0.85, signature: "ENSO-modulated thermal pool", tint: "#0a2540" },
  { id: "atlantic", name: "Atlantic",       lat: 25,   lng: -40,  ohcBias: 0.92, sstBias:  0.04, amocBias: 1.20, signature: "AMOC overturning corridor", tint: "#0a2540" },
  { id: "indian",   name: "Indian",         lat: -15,  lng: 75,   ohcBias: 0.78, sstBias:  0.11, amocBias: 0.70, signature: "monsoon-coupled warming pool", tint: "#0a2540" },
  { id: "southern", name: "Southern",       lat: -60,  lng: 20,   ohcBias: 0.68, sstBias: -0.18, amocBias: 1.10, signature: "Antarctic bottom-water formation", tint: "#0a2540" },
  { id: "arctic",   name: "Arctic",         lat: 78,   lng: 0,    ohcBias: 0.35, sstBias: -0.22, amocBias: 0.55, signature: "ice-modulated freshwater cap", tint: "#0a2540" },
];

export function basinById(id: BasinId): Basin {
  return BASINS.find((b) => b.id === id) ?? BASINS[0];
}

function pick(metrics: MetricReading[], key: string) {
  return metrics.find((m) => m.spec.key === key);
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const signed = (n: number, d = 1) => `${n >= 0 ? "+" : ""}${n.toFixed(d)}`;

export interface BasinReading {
  basin: Basin;
  ohc: number;
  sst: number;
  amoc: number;
  ohcDeltaPct: number;
  score: number;
  trend: number;
  summary: string;
  patterns: {
    name: string;
    description: string;
    timeScale: string;
    status: string;
    intensity: number;
  }[];
}

function regime(score: number): string {
  if (score >= 78) return "nominal";
  if (score >= 62) return "guarded";
  if (score >= 45) return "elevated";
  return "strained";
}

function trendPhrase(trend: number): string {
  if (trend > 1.5) return "strengthening";
  if (trend > 0.4) return "easing";
  if (trend < -1.5) return "rapidly degrading";
  if (trend < -0.4) return "softening";
  return "holding steady";
}

export function buildBasinReading(intel: SphereIntelligence, basin: Basin): BasinReading {
  const ohcR = pick(intel.metrics, "ohc");
  const sstR = pick(intel.metrics, "sst");
  const amocR = pick(intel.metrics, "amoc");

  const ohc = (ohcR?.value ?? 14.2) * basin.ohcBias;
  const sst = (sstR?.value ?? 0.3) + basin.sstBias;
  const amoc = (amocR?.value ?? 16.8) * basin.amocBias;
  const ohcBaseline = (ohcR?.spec.baseline ?? 14.2) * basin.ohcBias;
  const ohcDeltaPct = ((ohc - ohcBaseline) / Math.max(ohcBaseline, 1e-6)) * 100;

  // Per-basin score: re-weight global score by basin-specific deviation
  const sstWeight = Math.min(1.4, Math.abs(sst) / 0.35);
  const ohcWeight = Math.min(1.4, Math.abs(ohcDeltaPct) / 4);
  const localPenalty = (sstWeight + ohcWeight) * 4;
  const score = Math.max(0, Math.min(100, Math.round(intel.score - localPenalty)));
  const trend = intel.trend;

  const summary =
    basin.id === "global"
      ? `Hydrosphere coherence ${score} (${regime(score)}) — ${trendPhrase(trend)} across the planetary-scale conveyor. ` +
        `OHC ${ohc.toFixed(1)} ZJ (${signed(ohcDeltaPct)}%), SST anomaly ${sst.toFixed(2)} °C, AMOC ${amoc.toFixed(1)} Sv.`
      : `${basin.name} basin — score ${score} (${regime(score)}), ${trendPhrase(trend)}. ` +
        `Regional OHC ${ohc.toFixed(1)} ZJ (${signed(ohcDeltaPct)}% vs basin baseline), SST anomaly ${sst.toFixed(2)} °C, ` +
        `circulation transport ${amoc.toFixed(1)} Sv. Dominant signal: ${basin.signature}.`;

  return {
    basin,
    ohc,
    sst,
    amoc,
    ohcDeltaPct,
    score,
    trend,
    summary,
    patterns: [
      {
        name: basin.id === "pacific" ? "ENSO Thermal Redistribution" : "Ocean Heat Redistribution",
        description: basin.id === "pacific"
          ? "Equatorial Pacific warm pool migration drives global teleconnections; El Niño/La Niña phase modulates heat export to higher latitudes."
          : "Surface and thermohaline currents transport equatorial heat poleward, regulating regional climate and marine ecosystems.",
        timeScale: "Days → Decades",
        status: `Heat reservoir ${ohc.toFixed(1)} ZJ · drift ${signed(ohcDeltaPct)}%`,
        intensity: clamp01(0.2 + Math.abs(ohcDeltaPct) / 12),
      },
      {
        name: basin.id === "indian" ? "Monsoon Hydrological Cycling" : "Hydrological Cycling",
        description: basin.id === "indian"
          ? "Monsoon-driven evaporation and precipitation transfer enormous freshwater volumes across the basin annually."
          : "Evaporation, condensation, precipitation, and runoff continuously transfer water between reservoirs.",
        timeScale: "Hours → Years",
        status: `Surface forcing ${sst.toFixed(2)} °C`,
        intensity: clamp01(0.2 + Math.abs(sst) / 0.6),
      },
      {
        name: basin.id === "arctic" || basin.id === "southern" ? "Cryosphere–Ocean Coupling" : "Sea Level Variability",
        description: basin.id === "arctic"
          ? "Sea ice extent and Greenland meltwater modulate North Atlantic salinity and density structure."
          : basin.id === "southern"
            ? "Antarctic ice shelf basal melt drives bottom-water formation and abyssal stratification."
            : "Steric expansion, ice mass loss, and ocean basin redistribution drive measurable global mean sea level change.",
        timeScale: "Months → Decades",
        status: `Steric component tracking OHC ${signed(ohcDeltaPct)}%`,
        intensity: clamp01(0.2 + Math.abs(ohcDeltaPct) / 12),
      },
      {
        name: basin.id === "atlantic" ? "AMOC Overturning" : "Salinity & Density Drift",
        description: basin.id === "atlantic"
          ? "North Atlantic Deep Water formation drives the global overturning conveyor; weakening of this limb has planetary climate consequences."
          : "Freshwater input from ice melt and precipitation modulates ocean stratification and circulation strength.",
        timeScale: "Years → Centuries",
        status: `Transport ${amoc.toFixed(1)} Sv · ${trendPhrase(trend)}`,
        intensity: clamp01(0.2 + Math.abs(amoc - (amocR?.spec.baseline ?? 16.8) * basin.amocBias) / 4),
      },
    ],
  };
}
