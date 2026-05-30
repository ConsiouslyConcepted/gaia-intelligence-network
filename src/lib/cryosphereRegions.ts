import { SphereIntelligence, MetricReading } from "@/lib/sphereIntelligence";
import { Surface } from "@/lib/basinMasks";

export type CryoRegionId =
  | "global"
  | "arctic_sea_ice"
  | "antarctica"
  | "greenland"
  | "himalayas"
  | "andes"
  | "alps";

export interface CryoRegion {
  id: CryoRegionId;
  name: string;
  lat: number;
  lng: number;
  /** rectangular bounds [latMin, latMax, lngMin, lngMax] (multiple boxes allowed) */
  boxes: [number, number, number, number][];
  /** what to paint: ocean (sea ice), land (glaciers/ice sheets), or any */
  surface: Surface;
  /** Per-region character biases */
  extentBias: number;     // ice extent multiplier
  albedoBias: number;     // albedo (reflectivity) delta
  meltBias: number;       // melt-rate multiplier
  signature: string;
  tint: string;
}

export const CRYO_REGIONS: CryoRegion[] = [
  { id: "global",         name: "Global Cryosphere", lat: 0,    lng: 0,    boxes: [], surface: "any",   extentBias: 1.00, albedoBias:  0.00, meltBias: 1.00, signature: "planetary cold reservoir",        tint: "#cfe6f0" },
  { id: "arctic_sea_ice", name: "Arctic Sea Ice",    lat: 78,   lng: 0,    boxes: [[66, 90, -180, 180]],     surface: "ocean", extentBias: 0.85, albedoBias: -0.04, meltBias: 1.45, signature: "summer minimum extent collapse",  tint: "#bcdfe8" },
  { id: "antarctica",     name: "Antarctica",        lat: -82,  lng: 0,    boxes: [[-90, -60, -180, 180]],   surface: "land",  extentBias: 1.30, albedoBias:  0.02, meltBias: 0.85, signature: "ice shelf basal melt",            tint: "#e3f0f5" },
  { id: "greenland",      name: "Greenland Ice Sheet", lat: 72, lng: -40,  boxes: [[60, 84, -73, -12]],      surface: "land",  extentBias: 0.45, albedoBias: -0.06, meltBias: 1.60, signature: "surface meltwater runoff",        tint: "#d1e6ee" },
  { id: "himalayas",      name: "Himalayan Glaciers", lat: 30,  lng: 82,   boxes: [[26, 38, 68, 105]],       surface: "land",  extentBias: 0.30, albedoBias: -0.08, meltBias: 1.30, signature: "high-altitude glacier retreat",   tint: "#c6dfeb" },
  { id: "andes",          name: "Andean Glaciers",   lat: -15,  lng: -72,  boxes: [[-55, 10, -82, -65]],     surface: "land",  extentBias: 0.18, albedoBias: -0.05, meltBias: 1.20, signature: "tropical glacier loss",           tint: "#cbe2ec" },
  { id: "alps",           name: "Alpine Glaciers",   lat: 46,   lng: 9,    boxes: [[44, 48, 5, 16]],         surface: "land",  extentBias: 0.08, albedoBias: -0.07, meltBias: 1.35, signature: "European mountain snowpack decline", tint: "#d4e8ef" },
];

export function cryoRegionById(id: CryoRegionId): CryoRegion {
  return CRYO_REGIONS.find((r) => r.id === id) ?? CRYO_REGIONS[0];
}

function pick(metrics: MetricReading[], key: string) {
  return metrics.find((m) => m.spec.key === key);
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const signed = (n: number, d = 1) => `${n >= 0 ? "+" : ""}${n.toFixed(d)}`;

export interface CryoReading {
  region: CryoRegion;
  extent: number;
  albedo: number;
  melt: number;
  extentDeltaPct: number;
  score: number;
  trend: number;
  summary: string;
  patterns: { name: string; description: string; timeScale: string; status: string; intensity: number }[];
}

function regime(score: number) {
  if (score >= 78) return "nominal";
  if (score >= 62) return "guarded";
  if (score >= 45) return "elevated";
  return "strained";
}
function trendPhrase(trend: number) {
  if (trend > 1.5) return "strengthening";
  if (trend > 0.4) return "easing";
  if (trend < -1.5) return "rapidly degrading";
  if (trend < -0.4) return "softening";
  return "holding steady";
}

export function buildCryoReading(intel: SphereIntelligence, region: CryoRegion): CryoReading {
  // Pull whatever metrics exist; fall back to sane defaults so the panel is readable
  const extR = pick(intel.metrics, "ice_extent") ?? pick(intel.metrics, "extent");
  const albR = pick(intel.metrics, "albedo");
  const melR = pick(intel.metrics, "melt_rate") ?? pick(intel.metrics, "mass_loss");

  const extent = (extR?.value ?? 12.4) * region.extentBias;
  const albedo = (albR?.value ?? 0.55) + region.albedoBias;
  const melt = (melR?.value ?? 1.0) * region.meltBias;
  const extentBaseline = (extR?.spec.baseline ?? 12.4) * region.extentBias;
  const extentDeltaPct = ((extent - extentBaseline) / Math.max(extentBaseline, 1e-6)) * 100;

  const meltPenalty = Math.min(1.5, Math.abs(melt - 1) * 1.2);
  const albedoPenalty = Math.min(1.4, Math.abs(region.albedoBias) * 12);
  const localPenalty = (meltPenalty + albedoPenalty) * 4;
  const score = Math.max(0, Math.min(100, Math.round(intel.score - localPenalty)));
  const trend = intel.trend;

  const summary = region.id === "global"
    ? `Cryosphere coherence ${score} (${regime(score)}) — ${trendPhrase(trend)} across the planetary cold reservoir. ` +
      `Extent ${extent.toFixed(1)} Mkm² (${signed(extentDeltaPct)}%), albedo ${albedo.toFixed(2)}, melt index ${melt.toFixed(2)}×.`
    : `${region.name} — score ${score} (${regime(score)}), ${trendPhrase(trend)}. ` +
      `Regional extent ${extent.toFixed(2)} Mkm² (${signed(extentDeltaPct)}% vs baseline), albedo ${albedo.toFixed(2)}, ` +
      `melt index ${melt.toFixed(2)}×. Dominant signal: ${region.signature}.`;

  return {
    region,
    extent,
    albedo,
    melt,
    extentDeltaPct,
    score,
    trend,
    summary,
    patterns: [
      {
        name: region.surface === "ocean" ? "Sea Ice Seasonality" : "Glacier Mass Balance",
        description: region.surface === "ocean"
          ? "Annual freeze–melt cycle modulates planetary albedo and the polar amplification feedback."
          : "Net difference between snowfall accumulation and meltwater runoff drives multi-decadal ice volume change.",
        timeScale: "Months → Decades",
        status: `Extent drift ${signed(extentDeltaPct)}%`,
        intensity: clamp01(0.2 + Math.abs(extentDeltaPct) / 10),
      },
      {
        name: "Albedo Feedback",
        description: "Loss of bright reflective surface increases solar absorption, accelerating local warming and further loss.",
        timeScale: "Years → Decades",
        status: `Albedo ${albedo.toFixed(2)}`,
        intensity: clamp01(0.25 + Math.abs(region.albedoBias) * 6),
      },
      {
        name: region.id === "greenland" || region.id === "antarctica" ? "Ice Sheet Mass Loss" : "Meltwater Discharge",
        description: region.id === "greenland" || region.id === "antarctica"
          ? "Gravity-derived mass changes capture ice sheet contribution to global mean sea level."
          : "Seasonal melt feeds rivers, aquifers, and downstream ecosystems; shifts in timing destabilize regional hydrology.",
        timeScale: "Years → Centuries",
        status: `Melt index ${melt.toFixed(2)}×`,
        intensity: clamp01(0.2 + Math.abs(melt - 1) * 0.6),
      },
      {
        name: "Cryosphere–Ocean Coupling",
        description: "Freshwater pulses from ice loss alter ocean stratification, salinity, and overturning circulation.",
        timeScale: "Decades → Centuries",
        status: `${trendPhrase(trend)}`,
        intensity: clamp01(0.2 + Math.abs(trend) / 4),
      },
    ],
  };
}
