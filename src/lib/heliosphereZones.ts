import { SphereIntelligence, MetricReading } from "@/lib/sphereIntelligence";

export type HelioZoneId =
  | "global"
  | "solar_wind"
  | "cme"
  | "magnetopause"
  | "auroral";

export interface HelioZone {
  id: HelioZoneId;
  name: string;
  short: string;
  tint: string;
  signature: string;
  /** SVG ring radius (relative units, 0..1) where this zone sits in the activity map */
  ring: number;
  /** Angular sweep on the ring (degrees, 0=right, CCW) */
  arc: [number, number];
}

export const HELIO_ZONES: HelioZone[] = [
  { id: "global",       name: "Heliosphere — Global",  short: "GLOBAL", tint: "#f5d9a8", signature: "solar magnetic bubble enveloping the heliopause", ring: 0,    arc: [0, 360] },
  { id: "solar_wind",   name: "Solar Wind Streams",     short: "WIND",   tint: "#f6c177", signature: "fast and slow streams sculpting the interplanetary medium", ring: 0.45, arc: [10, 170] },
  { id: "cme",          name: "Coronal Mass Ejections", short: "CME",    tint: "#e8775d", signature: "magnetized plasma eruptions propagating outward",          ring: 0.65, arc: [200, 340] },
  { id: "magnetopause", name: "Magnetopause Boundary",  short: "M-PAUSE",tint: "#9bd1ff", signature: "dayside pressure balance with Earth's magnetic shield",    ring: 0.82, arc: [330, 30] },
  { id: "auroral",      name: "Auroral Zones",          short: "AURORA", tint: "#bfa6ff", signature: "high-latitude precipitation driven by geomagnetic activity", ring: 0.95, arc: [60, 300] },
];

export function helioZoneById(id: HelioZoneId): HelioZone {
  return HELIO_ZONES.find((z) => z.id === id) ?? HELIO_ZONES[0];
}

function pick(metrics: MetricReading[], key: string) {
  return metrics.find((m) => m.spec.key === key);
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const signed = (n: number, d = 1) => `${n >= 0 ? "+" : ""}${n.toFixed(d)}`;

export interface HelioReading {
  zone: HelioZone;
  windSpeed: number;     // km/s
  density: number;       // p/cc
  bz: number;            // nT
  kp: number;            // 0..9
  score: number;
  trend: number;
  summary: string;
  patterns: { name: string; description: string; timeScale: string; status: string; intensity: number }[];
}

function regime(score: number) {
  if (score >= 78) return "quiet";
  if (score >= 62) return "unsettled";
  if (score >= 45) return "active";
  return "stormy";
}
function trendPhrase(trend: number) {
  if (trend > 1.5) return "calming";
  if (trend > 0.4) return "easing";
  if (trend < -1.5) return "rapidly intensifying";
  if (trend < -0.4) return "intensifying";
  return "holding steady";
}

export function buildHelioReading(intel: SphereIntelligence, zone: HelioZone): HelioReading {
  const wsR = pick(intel.metrics, "solar_wind") ?? pick(intel.metrics, "wind_speed");
  const dnR = pick(intel.metrics, "proton_density") ?? pick(intel.metrics, "density");
  const bzR = pick(intel.metrics, "bz") ?? pick(intel.metrics, "imf_bz");
  const kpR = pick(intel.metrics, "kp") ?? pick(intel.metrics, "kp_index");

  const windSpeed = wsR?.value ?? 420;
  const density = dnR?.value ?? 6.2;
  const bz = bzR?.value ?? -1.4;
  const kp = kpR?.value ?? 2.3;

  // Zone-specific penalty so score shifts when you select different zones
  const zoneBias: Record<HelioZoneId, number> = {
    global: 0,
    solar_wind: Math.min(12, Math.max(0, (windSpeed - 450) / 25)),
    cme: Math.min(15, Math.max(0, -bz * 2.2)),
    magnetopause: Math.min(14, Math.max(0, (density - 6) * 1.4 + (windSpeed - 450) / 60)),
    auroral: Math.min(18, Math.max(0, kp * 2.0)),
  };
  const score = Math.max(0, Math.min(100, Math.round(intel.score - zoneBias[zone.id])));
  const trend = intel.trend;

  const baseLine =
    `Solar wind ${windSpeed.toFixed(0)} km/s · density ${density.toFixed(1)} p/cc · Bz ${signed(bz, 1)} nT · Kp ${kp.toFixed(1)}.`;

  const summary = zone.id === "global"
    ? `Heliosphere coherence ${score} (${regime(score)}) — ${trendPhrase(trend)} across the interplanetary medium. ${baseLine}`
    : `${zone.name} — score ${score} (${regime(score)}), ${trendPhrase(trend)}. ${baseLine} Dominant signal: ${zone.signature}.`;

  const cmeRisk = clamp01(0.2 + Math.max(0, -bz) / 8 + Math.max(0, (windSpeed - 500) / 400));
  const auroralIntensity = clamp01(0.15 + kp / 9);
  const mpStress = clamp01(0.2 + Math.max(0, (windSpeed - 400) / 500) + Math.max(0, (density - 5) / 20));

  return {
    zone,
    windSpeed,
    density,
    bz,
    kp,
    score,
    trend,
    summary,
    patterns: [
      {
        name: "Solar Wind Streams",
        description: "Fast (coronal hole) and slow (streamer belt) streams interact, forming co-rotating interaction regions that buffet planetary magnetospheres.",
        timeScale: "Hours → Days",
        status: `${windSpeed.toFixed(0)} km/s`,
        intensity: clamp01(0.2 + Math.max(0, (windSpeed - 350) / 450)),
      },
      {
        name: "Coronal Mass Ejections",
        description: "Magnetized plasma clouds ejected from the corona; southward Bz inside the cloud drives the strongest geomagnetic responses.",
        timeScale: "Minutes → Days",
        status: `Bz ${signed(bz, 1)} nT`,
        intensity: cmeRisk,
      },
      {
        name: "Magnetopause Standoff",
        description: "Pressure balance between solar wind dynamic pressure and Earth's magnetic field sets the dayside boundary distance.",
        timeScale: "Minutes → Hours",
        status: `Dynamic pressure ${(density * windSpeed * windSpeed * 1e-6).toFixed(1)} nPa`,
        intensity: mpStress,
      },
      {
        name: "Auroral Activity",
        description: "Geomagnetic Kp index tracks high-latitude disturbance; elevated values expand the auroral oval equatorward.",
        timeScale: "Hours → Days",
        status: `Kp ${kp.toFixed(1)}`,
        intensity: auroralIntensity,
      },
    ],
  };
}
