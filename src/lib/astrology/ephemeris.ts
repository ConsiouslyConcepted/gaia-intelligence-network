// Live ephemeris using astronomy-engine. Returns geocentric ecliptic longitudes.
import * as Astronomy from "astronomy-engine";
import { PLANET_ORDER, longitudeToSign } from "./constants";
import { KEPLER_ASPECTS, getAspectMeta } from "./harmonics";

export interface PlanetPosition {
  id: string;
  longitude: number; // 0..360 ecliptic longitude
  signId: string;
  signName: string;
  signGlyph: string;
  degInSign: number;
  retrograde: boolean;
}

export interface AspectLink {
  a: string;
  b: string;
  name: string;
  angle: number;
  /** Orb in degrees from exact. */
  orb: number;
  color: string;
  /** Generating polygon sides (regular or star). */
  polygonSides: number;
  /** Star-polygon stride k for {n/k}. 1 for regular polygons. */
  polygonStride: number;
  /** Linked musical interval id from src/lib/geometry/musicGeometry.ts, when applicable. */
  intervalId: string | null;
  /** Compact label like "P5 · 3:2". */
  intervalLabel: string;
  /** 0..1 — Keplerian consonance weight. */
  consonance: number;
  /** "major" or "minor" aspect tier (Kepler). */
  tier: "major" | "minor";
  /** True if the aspect is tightening (applying); false if separating. */
  applying: boolean;
  polygonGlyph: string;
}

const BODY_MAP: Record<string, Astronomy.Body> = {
  sun: Astronomy.Body.Sun,
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
  uranus: Astronomy.Body.Uranus,
  neptune: Astronomy.Body.Neptune,
  pluto: Astronomy.Body.Pluto,
};

function geocentricLongitude(body: Astronomy.Body, date: Date): number {
  const vec = Astronomy.GeoVector(body, date, true);
  const ecl = Astronomy.Ecliptic(vec);
  return ((ecl.elon % 360) + 360) % 360;
}

function moonLongitude(date: Date): number {
  const m = Astronomy.EclipticGeoMoon(date);
  return ((m.lon % 360) + 360) % 360;
}

export function computePositions(date: Date = new Date()): PlanetPosition[] {
  const out: PlanetPosition[] = [];
  for (const id of PLANET_ORDER) {
    try {
      let lon: number;
      let retro = false;
      if (id === "moon") {
        lon = moonLongitude(date);
        retro = false;
      } else {
        const body = BODY_MAP[id];
        lon = geocentricLongitude(body, date);
        if (id !== "sun") {
          const earlier = geocentricLongitude(body, new Date(date.getTime() - 24 * 3600 * 1000));
          const diff = ((lon - earlier + 540) % 360) - 180;
          retro = diff < 0;
        }
      }
      const { sign, degInSign } = longitudeToSign(lon);
      out.push({
        id,
        longitude: lon,
        signId: sign.id,
        signName: sign.name,
        signGlyph: sign.glyph,
        degInSign,
        retrograde: retro,
      });
    } catch (e) {
      console.warn(`ephemeris ${id} failed`, e);
    }
  }
  return out;
}

function shortDelta(a: number, b: number): number {
  let delta = Math.abs(a - b);
  if (delta > 180) delta = 360 - delta;
  return delta;
}

export function computeAspects(positions: PlanetPosition[], date?: Date): AspectLink[] {
  // Sample positions one hour ahead to determine applying/separating direction.
  const future = date ? computePositions(new Date(date.getTime() + 3600 * 1000)) : null;
  const futureMap = future ? new Map(future.map((p) => [p.id, p.longitude])) : null;

  const links: AspectLink[] = [];
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const a = positions[i];
      const b = positions[j];
      const delta = shortDelta(a.longitude, b.longitude);
      for (const asp of KEPLER_ASPECTS) {
        const diff = Math.abs(delta - asp.angle);
        if (diff <= asp.orb) {
          let applying = false;
          if (futureMap) {
            const fa = futureMap.get(a.id);
            const fb = futureMap.get(b.id);
            if (fa !== undefined && fb !== undefined) {
              const futureDiff = Math.abs(shortDelta(fa, fb) - asp.angle);
              applying = futureDiff < diff;
            }
          }
          const meta = getAspectMeta(asp.name)!;
          links.push({
            a: a.id,
            b: b.id,
            name: asp.name,
            angle: asp.angle,
            orb: diff,
            color: meta.color,
            polygonSides: meta.polygonSides,
            polygonStride: meta.polygonStride,
            intervalId: meta.intervalId,
            intervalLabel: meta.intervalLabel,
            consonance: meta.consonance,
            tier: meta.tier,
            applying,
            polygonGlyph: meta.polygonGlyph,
          });
          break;
        }
      }
    }
  }
  return links;
}
