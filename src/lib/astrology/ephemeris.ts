// Live ephemeris using astronomy-engine. Returns geocentric ecliptic longitudes.
import * as Astronomy from "astronomy-engine";
import { ASPECTS, PLANET_ORDER, longitudeToSign } from "./constants";

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
  orb: number;
  color: string;
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
  // EclipticGeoMoon returns geocentric ecliptic of date
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
        const earlier = moonLongitude(new Date(date.getTime() - 24 * 3600 * 1000));
        retro = false; // Moon never retrograde in practice
        void earlier;
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
      // skip on failure
      console.warn(`ephemeris ${id} failed`, e);
    }
  }
  return out;
}

export function computeAspects(positions: PlanetPosition[]): AspectLink[] {
  const links: AspectLink[] = [];
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const a = positions[i];
      const b = positions[j];
      let delta = Math.abs(a.longitude - b.longitude);
      if (delta > 180) delta = 360 - delta;
      for (const asp of ASPECTS) {
        const diff = Math.abs(delta - asp.angle);
        if (diff <= asp.orb) {
          links.push({
            a: a.id,
            b: b.id,
            name: asp.name,
            angle: asp.angle,
            orb: diff,
            color: asp.color,
          });
          break;
        }
      }
    }
  }
  return links;
}
