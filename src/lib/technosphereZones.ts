import { SphereIntelligence, MetricReading } from "@/lib/sphereIntelligence";

export type TechnoZoneId =
  | "global"
  | "power_grid"
  | "data_centers"
  | "undersea_cables"
  | "satellites";

export interface TechnoZone {
  id: TechnoZoneId;
  name: string;
  short: string;
  tint: string;
  signature: string;
  /** SVG ring radius (0..1) where this zone sits in the infrastructure map */
  ring: number;
  /** Angular sweep on the ring (degrees, 0=right, CCW) */
  arc: [number, number];
}

export const TECHNO_ZONES: TechnoZone[] = [
  { id: "global",           name: "Technosphere — Global",      short: "GLOBAL", tint: "#cfd8e0", signature: "planet-wide human-built infrastructure mesh",                       ring: 0,    arc: [0, 360] },
  { id: "power_grid",       name: "Power & Energy Grid",        short: "GRID",   tint: "#e8c47a", signature: "transmission networks, generation mix, electrification load",        ring: 0.42, arc: [200, 340] },
  { id: "data_centers",     name: "Data Centers & Compute",     short: "DC",     tint: "#9bd1ff", signature: "hyperscale compute, AI training clusters, electricity intensity",    ring: 0.6,  arc: [20, 160] },
  { id: "undersea_cables",  name: "Submarine Cable Backbone",   short: "CABLE",  tint: "#7ec9c7", signature: "intercontinental fiber carrying ~99% of internet traffic",          ring: 0.78, arc: [180, 360] },
  { id: "satellites",       name: "Satellite Constellations",   short: "SAT",    tint: "#bfa6ff", signature: "LEO/MEO/GEO orbital infrastructure for comms, GNSS, observation",   ring: 0.95, arc: [30, 330] },
];

export function technoZoneById(id: TechnoZoneId): TechnoZone {
  return TECHNO_ZONES.find((z) => z.id === id) ?? TECHNO_ZONES[0];
}

function pick(metrics: MetricReading[], key: string) {
  return metrics.find((m) => m.spec.key === key);
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const signed = (n: number, d = 1) => `${n >= 0 ? "+" : ""}${n.toFixed(d)}`;

export interface TechnoReading {
  zone: TechnoZone;
  gridLoad: number;       // TW
  dcEnergy: number;       // TWh/yr
  traffic: number;        // Tb/s
  satellites: number;     // thousands in orbit
  score: number;
  trend: number;
  summary: string;
  patterns: { name: string; description: string; timeScale: string; status: string; intensity: number }[];
}

function regime(score: number) {
  if (score >= 78) return "nominal";
  if (score >= 62) return "guarded";
  if (score >= 45) return "strained";
  return "overloaded";
}
function trendPhrase(trend: number) {
  if (trend > 1.5) return "rapidly improving";
  if (trend > 0.4) return "easing";
  if (trend < -1.5) return "rapidly degrading";
  if (trend < -0.4) return "tightening";
  return "holding steady";
}

export function buildTechnoReading(intel: SphereIntelligence, zone: TechnoZone): TechnoReading {
  const grid = pick(intel.metrics, "grid");
  const dc = pick(intel.metrics, "dc_energy");
  const traf = pick(intel.metrics, "traffic");
  const sats = pick(intel.metrics, "satellites");

  const gridLoad = grid?.value ?? 28.4;
  const dcEnergy = dc?.value ?? 460;
  const traffic = traf?.value ?? 1.2;
  const satellites = sats?.value ?? 9.4;

  // Zone-specific penalty so score shifts per selection
  const zoneBias: Record<TechnoZoneId, number> = {
    global: 0,
    power_grid: Math.min(14, Math.max(0, (gridLoad - 27) * 1.4)),
    data_centers: Math.min(16, Math.max(0, (dcEnergy - 420) / 12)),
    undersea_cables: Math.min(12, Math.max(0, (traffic - 1.0) * 6)),
    satellites: Math.min(18, Math.max(0, (satellites - 8) * 2.4)),
  };
  const score = Math.max(0, Math.min(100, Math.round(intel.score - zoneBias[zone.id])));
  const trend = intel.trend;

  const baseLine =
    `Grid ${gridLoad.toFixed(1)} TW · datacenters ${dcEnergy.toFixed(0)} TWh/yr · traffic ${traffic.toFixed(2)} Pb/s · sats ${(satellites * 1000).toFixed(0)}.`;

  const summary = zone.id === "global"
    ? `Technosphere coherence ${score} (${regime(score)}) — ${trendPhrase(trend)} across global infrastructure. ${baseLine}`
    : `${zone.name} — score ${score} (${regime(score)}), ${trendPhrase(trend)}. ${baseLine} Dominant signal: ${zone.signature}.`;

  return {
    zone,
    gridLoad,
    dcEnergy,
    traffic,
    satellites,
    score,
    trend,
    summary,
    patterns: [
      {
        name: "Power & Energy Grid",
        description: "Global electricity transmission and generation systems. Load growth from electrification (EVs, heat pumps) and AI compute is straining capacity in many regions.",
        timeScale: "Seconds → Decades",
        status: `${gridLoad.toFixed(1)} TW`,
        intensity: clamp01(0.2 + (gridLoad - 25) / 12),
      },
      {
        name: "Data Center Footprint",
        description: "Hyperscale compute and AI training clusters now consume ~1–2% of global electricity, with rapid growth driven by generative AI and cloud services.",
        timeScale: "Months → Years",
        status: `${dcEnergy.toFixed(0)} TWh/yr`,
        intensity: clamp01(0.2 + (dcEnergy - 400) / 200),
      },
      {
        name: "Submarine Cable Network",
        description: "~600+ active fiber-optic cables carry roughly 99% of intercontinental internet traffic. Cuts and geopolitical chokepoints are growing risks.",
        timeScale: "Milliseconds → Years",
        status: `${traffic.toFixed(2)} Pb/s`,
        intensity: clamp01(0.25 + (traffic - 1.0) * 0.7),
      },
      {
        name: "Orbital Satellite Belt",
        description: "LEO mega-constellations (Starlink, OneWeb, Kuiper) plus MEO/GEO assets. Population is climbing past 10,000 active satellites, raising collision risk.",
        timeScale: "Days → Decades",
        status: `${(satellites * 1000).toFixed(0)} active`,
        intensity: clamp01(0.2 + (satellites - 7) / 10),
      },
    ],
  };
}
