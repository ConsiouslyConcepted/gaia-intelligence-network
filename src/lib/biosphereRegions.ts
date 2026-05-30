import { SphereIntelligence, MetricReading } from "@/lib/sphereIntelligence";
import { Surface } from "@/lib/basinMasks";

export type BioRegionId =
  | "global"
  | "amazon"
  | "congo"
  | "boreal"
  | "southeast_asia"
  | "savanna"
  | "temperate"
  | "australia"
  | "coral_reefs";

export interface BioRegion {
  id: BioRegionId;
  name: string;
  lat: number;
  lng: number;
  boxes: [number, number, number, number][];
  surface: Surface;
  npp: number;        // net primary productivity multiplier
  biodiv: number;     // biodiversity index multiplier
  stress: number;     // anthropogenic stress multiplier (>1 = more stressed)
  signature: string;
  tint: string;
}

export const BIO_REGIONS: BioRegion[] = [
  { id: "global",         name: "Global Biosphere",      lat: 0,    lng: 0,    boxes: [], surface: "any",  npp: 1.00, biodiv: 1.00, stress: 1.00, signature: "planetary photosynthetic envelope", tint: "#9adfb5" },
  { id: "amazon",         name: "Amazon Basin",          lat: -3,   lng: -62,  boxes: [[-15, 7, -78, -45]],    surface: "land",  npp: 1.55, biodiv: 1.70, stress: 1.45, signature: "moist tropical forest carbon sink", tint: "#7ecbcb" },
  { id: "congo",          name: "Congo Rainforest",      lat: 0,    lng: 22,   boxes: [[-7, 6, 10, 32]],       surface: "land",  npp: 1.40, biodiv: 1.55, stress: 1.25, signature: "central African moist forest",     tint: "#85c7a8" },
  { id: "boreal",         name: "Boreal Forest",         lat: 60,   lng: 95,   boxes: [[50, 70, -170, 180]],   surface: "land",  npp: 0.80, biodiv: 0.75, stress: 1.30, signature: "taiga carbon and permafrost belt",  tint: "#94b89a" },
  { id: "southeast_asia", name: "Southeast Asian Forests", lat: 0,  lng: 110,  boxes: [[-10, 22, 92, 142]],    surface: "land",  npp: 1.45, biodiv: 1.60, stress: 1.55, signature: "Indo-Malayan biodiversity hotspot", tint: "#8ed1b8" },
  { id: "savanna",        name: "African Savanna",       lat: -8,   lng: 28,   boxes: [[-25, 12, 8, 42]],      surface: "land",  npp: 0.85, biodiv: 1.20, stress: 1.20, signature: "grassland–megafauna mosaic",        tint: "#b8c98a" },
  { id: "temperate",      name: "Temperate Forests",     lat: 45,   lng: -85,  boxes: [[30, 55, -130, -60], [35, 55, -10, 40]], surface: "land", npp: 1.00, biodiv: 0.95, stress: 1.10, signature: "deciduous + mixed temperate forest", tint: "#a8c98e" },
  { id: "australia",      name: "Australian Bioregions", lat: -25,  lng: 134,  boxes: [[-40, -10, 112, 154]],  surface: "land",  npp: 0.70, biodiv: 1.15, stress: 1.35, signature: "endemic xeric and eucalypt systems", tint: "#c4c186" },
  { id: "coral_reefs",    name: "Tropical Coral Reefs",  lat: -10,  lng: 150,  boxes: [[-30, 30, 30, 180], [-30, 30, -180, -60]], surface: "ocean", npp: 1.10, biodiv: 1.65, stress: 1.70, signature: "tropical reef bleaching corridor",  tint: "#88c8d4" },
];

export function bioRegionById(id: BioRegionId): BioRegion {
  return BIO_REGIONS.find((r) => r.id === id) ?? BIO_REGIONS[0];
}

function pick(metrics: MetricReading[], key: string) {
  return metrics.find((m) => m.spec.key === key);
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const signed = (n: number, d = 1) => `${n >= 0 ? "+" : ""}${n.toFixed(d)}`;

export interface BioReading {
  region: BioRegion;
  npp: number;
  biodiv: number;
  stress: number;
  nppDeltaPct: number;
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

export function buildBioReading(intel: SphereIntelligence, region: BioRegion): BioReading {
  const nppR = pick(intel.metrics, "npp") ?? pick(intel.metrics, "gpp");
  const bioR = pick(intel.metrics, "biodiversity") ?? pick(intel.metrics, "species");
  const stsR = pick(intel.metrics, "stress") ?? pick(intel.metrics, "deforestation");

  const npp = (nppR?.value ?? 1.0) * region.npp;
  const biodiv = (bioR?.value ?? 1.0) * region.biodiv;
  const stress = (stsR?.value ?? 1.0) * region.stress;
  const nppBaseline = (nppR?.spec.baseline ?? 1.0) * region.npp;
  const nppDeltaPct = ((npp - nppBaseline) / Math.max(nppBaseline, 1e-6)) * 100;

  const stressPenalty = Math.min(1.6, Math.abs(stress - 1) * 1.3);
  const nppPenalty = Math.min(1.4, Math.abs(nppDeltaPct) / 6);
  const localPenalty = (stressPenalty + nppPenalty) * 4;
  const score = Math.max(0, Math.min(100, Math.round(intel.score - localPenalty)));
  const trend = intel.trend;

  const summary = region.id === "global"
    ? `Biosphere coherence ${score} (${regime(score)}) — ${trendPhrase(trend)} across the planetary photosynthetic envelope. ` +
      `NPP ${npp.toFixed(2)}× baseline (${signed(nppDeltaPct)}%), biodiversity index ${biodiv.toFixed(2)}, stress load ${stress.toFixed(2)}×.`
    : `${region.name} — score ${score} (${regime(score)}), ${trendPhrase(trend)}. ` +
      `Regional NPP ${npp.toFixed(2)}× (${signed(nppDeltaPct)}% vs baseline), biodiversity ${biodiv.toFixed(2)}, stress ${stress.toFixed(2)}×. ` +
      `Dominant signal: ${region.signature}.`;

  return {
    region,
    npp,
    biodiv,
    stress,
    nppDeltaPct,
    score,
    trend,
    summary,
    patterns: [
      {
        name: region.surface === "ocean" ? "Reef Productivity" : "Primary Production",
        description: region.surface === "ocean"
          ? "Symbiotic algae drive reef carbon fixation; thermal stress disrupts the symbiosis and triggers bleaching."
          : "Plants convert sunlight, water, and CO₂ into biomass — the foundation of the regional food web.",
        timeScale: "Days → Years",
        status: `NPP ${npp.toFixed(2)}× · ${signed(nppDeltaPct)}%`,
        intensity: clamp01(0.2 + Math.abs(nppDeltaPct) / 10),
      },
      {
        name: "Biodiversity Integrity",
        description: "Species richness and functional diversity sustain ecosystem services and resilience to disturbance.",
        timeScale: "Years → Centuries",
        status: `Index ${biodiv.toFixed(2)}`,
        intensity: clamp01(0.25 + Math.abs(biodiv - 1) * 0.6),
      },
      {
        name: region.id === "amazon" || region.id === "congo" || region.id === "southeast_asia"
          ? "Deforestation Pressure"
          : region.id === "coral_reefs" ? "Thermal Bleaching" : "Anthropogenic Stress",
        description: region.surface === "ocean"
          ? "Marine heatwaves push coral systems past thermal tolerance, causing mass bleaching events."
          : "Land conversion, fragmentation, and fire fragment habitat and release stored carbon.",
        timeScale: "Months → Decades",
        status: `Stress ${stress.toFixed(2)}×`,
        intensity: clamp01(0.2 + Math.abs(stress - 1) * 0.8),
      },
      {
        name: "Carbon–Climate Coupling",
        description: "Net carbon flux between this biome and the atmosphere feeds back into the global climate system.",
        timeScale: "Years → Centuries",
        status: `${trendPhrase(trend)}`,
        intensity: clamp01(0.2 + Math.abs(trend) / 4),
      },
    ],
  };
}
