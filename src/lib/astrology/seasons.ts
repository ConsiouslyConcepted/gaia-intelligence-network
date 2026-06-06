// Wheel-of-the-Year seasonal engine. Derives terrestrial season state from the
// Sun's geocentric ecliptic longitude (true astronomical position), so values
// stay accurate across years without hardcoded dates.
import * as Astronomy from "astronomy-engine";

export type Hemisphere = "N" | "S";

export interface Station {
  id: string;
  longitude: number;       // solar ecliptic longitude where station occurs
  astroName: string;       // e.g. "March Equinox"
  traditionalName: string; // e.g. "Ostara"
  type: "equinox" | "solstice" | "cross-quarter";
  // Season this station BEGINS in the northern hemisphere
  nhSeason: Season;
}

export type Season = "spring" | "summer" | "autumn" | "winter";

// Anchored at solar longitude (0°, 45°, 90°, ...) — stable for any year.
export const STATIONS: Station[] = [
  { id: "march-equinox",     longitude:   0, astroName: "March Equinox",     traditionalName: "Ostara",     type: "equinox",       nhSeason: "spring" },
  { id: "beltane",           longitude:  45, astroName: "May Cross-Quarter", traditionalName: "Beltane",    type: "cross-quarter", nhSeason: "spring" },
  { id: "june-solstice",     longitude:  90, astroName: "June Solstice",     traditionalName: "Litha",      type: "solstice",      nhSeason: "summer" },
  { id: "lughnasadh",        longitude: 135, astroName: "August Cross-Quarter", traditionalName: "Lughnasadh", type: "cross-quarter", nhSeason: "summer" },
  { id: "september-equinox", longitude: 180, astroName: "September Equinox", traditionalName: "Mabon",      type: "equinox",       nhSeason: "autumn" },
  { id: "samhain",           longitude: 225, astroName: "November Cross-Quarter", traditionalName: "Samhain", type: "cross-quarter", nhSeason: "autumn" },
  { id: "december-solstice", longitude: 270, astroName: "December Solstice", traditionalName: "Yule",       type: "solstice",      nhSeason: "winter" },
  { id: "imbolc",            longitude: 315, astroName: "February Cross-Quarter", traditionalName: "Imbolc", type: "cross-quarter", nhSeason: "winter" },
];

const DEG = Math.PI / 180;
const OBLIQUITY = 23.4392911; // mean obliquity, degrees

export function getSolarLongitude(date: Date = new Date()): number {
  const vec = Astronomy.GeoVector(Astronomy.Body.Sun, date, true);
  const ecl = Astronomy.Ecliptic(vec);
  return ((ecl.elon % 360) + 360) % 360;
}

export function getSunDeclination(date: Date = new Date()): number {
  const lon = getSolarLongitude(date);
  // δ = arcsin( sin(ε) · sin(λ) ) — classic spherical-astronomy relation
  return Math.asin(Math.sin(OBLIQUITY * DEG) * Math.sin(lon * DEG)) / DEG;
}

/**
 * Civil day length in hours at a given latitude.
 * Uses sunrise equation: cos(H) = -tan(φ) · tan(δ)
 */
export function getDayLength(date: Date = new Date(), latitude: number): number {
  const decl = getSunDeclination(date);
  const phi = latitude * DEG;
  const delta = decl * DEG;
  const x = -Math.tan(phi) * Math.tan(delta);
  if (x <= -1) return 24;   // polar day
  if (x >=  1) return 0;    // polar night
  const H = Math.acos(x);   // hour angle of sunset, radians
  return (2 * H) / DEG / 15;
}

export interface SeasonalPhase {
  hemisphere: Hemisphere;
  season: Season;
  solarLongitude: number;
  previousStation: Station;
  nextStation: Station;
  daysUntilNext: number;
  daysSincePrev: number;
  progressInSegment: number; // 0..1 between prev and next station
}

export function getSeasonalPhase(date: Date = new Date(), hemisphere: Hemisphere = "N"): SeasonalPhase {
  const lon = getSolarLongitude(date);
  // find bounding stations
  let prevIdx = 0;
  for (let i = 0; i < STATIONS.length; i++) {
    if (STATIONS[i].longitude <= lon) prevIdx = i;
  }
  const prev = STATIONS[prevIdx];
  const next = STATIONS[(prevIdx + 1) % STATIONS.length];
  // segment width is always 45°
  const into = ((lon - prev.longitude + 360) % 360);
  const progress = into / 45;
  // Sun moves ~0.9856°/day; refine via direct search for accuracy at solstices
  const nextDate = findSolarLongitudeDate(next.longitude, date, +1);
  const prevDate = findSolarLongitudeDate(prev.longitude, date, -1);
  const daysUntilNext = (nextDate.getTime() - date.getTime()) / 86400000;
  const daysSincePrev = (date.getTime() - prevDate.getTime()) / 86400000;
  const nhSeason = prev.nhSeason;
  const season: Season = hemisphere === "N"
    ? nhSeason
    : (({ spring: "autumn", autumn: "spring", summer: "winter", winter: "summer" }) as const)[nhSeason];
  return {
    hemisphere,
    season,
    solarLongitude: lon,
    previousStation: prev,
    nextStation: next,
    daysUntilNext,
    daysSincePrev,
    progressInSegment: progress,
  };
}

/**
 * Locate the date at which the Sun's ecliptic longitude equals `targetLon`.
 * Direction +1 searches forward, -1 backward. Coarse-step then bisect.
 */
function findSolarLongitudeDate(targetLon: number, from: Date, direction: 1 | -1): Date {
  const stepHours = 6 * direction;
  let prev = from;
  let prevDiff = signedDiff(getSolarLongitude(prev), targetLon);
  for (let i = 0; i < 400; i++) {
    const next = new Date(prev.getTime() + stepHours * 3600 * 1000);
    const nextDiff = signedDiff(getSolarLongitude(next), targetLon);
    if (Math.sign(prevDiff) !== Math.sign(nextDiff) && Math.abs(prevDiff) < 30) {
      // bisect
      let lo = prev, hi = next, loD = prevDiff, hiD = nextDiff;
      for (let j = 0; j < 24; j++) {
        const mid = new Date((lo.getTime() + hi.getTime()) / 2);
        const midD = signedDiff(getSolarLongitude(mid), targetLon);
        if (Math.sign(midD) === Math.sign(loD)) { lo = mid; loD = midD; } else { hi = mid; hiD = midD; }
      }
      return new Date((lo.getTime() + hi.getTime()) / 2);
    }
    prev = next; prevDiff = nextDiff;
  }
  return prev;
}

function signedDiff(current: number, target: number): number {
  // signed shortest difference in degrees, -180..180
  return ((current - target + 540) % 360) - 180;
}

/**
 * Earth–Sun distance in AU, plus normalized orbital position (0 at perihelion).
 */
export function getEarthOrbitalPosition(date: Date = new Date()) {
  const vec = Astronomy.GeoVector(Astronomy.Body.Sun, date, true);
  const distanceAU = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
  // Perihelion ~ Jan 3, aphelion ~ Jul 4. Use approximate day-of-year position.
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const doy = (date.getTime() - start) / 86400000;
  const perihelionDoy = 3;
  const orbitalPhase = ((doy - perihelionDoy + 365.25) % 365.25) / 365.25;
  return { distanceAU, orbitalPhase };
}

/**
 * Phenological phase label derived from solar longitude + hemisphere.
 * Heuristic / phase proxy — NOT measured NDVI.
 */
export function getPhenologyPhase(date: Date, hemisphere: Hemisphere): {
  ndviPhase: "dormant" | "emerging" | "growing" | "peak" | "senescing";
  carbonFlux: "drawdown" | "release" | "neutral";
} {
  const phase = getSeasonalPhase(date, hemisphere);
  const s = phase.season;
  const p = phase.progressInSegment;
  let ndviPhase: "dormant" | "emerging" | "growing" | "peak" | "senescing";
  if (s === "spring") ndviPhase = p < 0.5 ? "emerging" : "growing";
  else if (s === "summer") ndviPhase = p < 0.5 ? "peak" : "peak";
  else if (s === "autumn") ndviPhase = p < 0.5 ? "senescing" : "senescing";
  else ndviPhase = "dormant";
  // NH drawdown roughly Apr–Sep, release Oct–Mar (sign-only proxy)
  let carbonFlux: "drawdown" | "release" | "neutral";
  if (s === "spring" || s === "summer") carbonFlux = "drawdown";
  else if (s === "autumn" || s === "winter") carbonFlux = "release";
  else carbonFlux = "neutral";
  return { ndviPhase, carbonFlux };
}

export function formatDegMin(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}° ${m.toString().padStart(2, "0")}′`;
}
