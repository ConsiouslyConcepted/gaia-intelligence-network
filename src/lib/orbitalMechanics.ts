// Heliocentric position solver from J2000 Keplerian elements.
// Source: NASA JPL approximate elements valid 1800–2050.

export interface KeplerElements {
  id: string;
  a: number;   // semi-major axis (AU)
  e: number;   // eccentricity
  i: number;   // inclination (deg)
  L: number;   // mean longitude at J2000 (deg)
  lp: number;  // longitude of perihelion (deg)
  node: number;// longitude of ascending node (deg)
  // rates per century
  dA: number; dE: number; dI: number; dL: number; dLp: number; dNode: number;
}

// Trimmed table: mean longitude rate dL is what drives motion most.
export const PLANET_ELEMENTS: KeplerElements[] = [
  { id: "mercury", a: 0.38709927, e: 0.20563593, i: 7.00497902, L: 252.25032350, lp: 77.45779628, node: 48.33076593,
    dA: 0.00000037, dE: 0.00001906, dI: -0.00594749, dL: 149472.67411175, dLp: 0.16047689, dNode: -0.12534081 },
  { id: "venus", a: 0.72333566, e: 0.00677672, i: 3.39467605, L: 181.97909950, lp: 131.60246718, node: 76.67984255,
    dA: 0.00000390, dE: -0.00004107, dI: -0.00078890, dL: 58517.81538729, dLp: 0.00268329, dNode: -0.27769418 },
  { id: "earth", a: 1.00000261, e: 0.01671123, i: -0.00001531, L: 100.46457166, lp: 102.93768193, node: 0.0,
    dA: 0.00000562, dE: -0.00004392, dI: -0.01294668, dL: 35999.37244981, dLp: 0.32327364, dNode: 0.0 },
  { id: "mars", a: 1.52371034, e: 0.09339410, i: 1.84969142, L: -4.55343205, lp: -23.94362959, node: 49.55953891,
    dA: 0.00001847, dE: 0.00007882, dI: -0.00813131, dL: 19140.30268499, dLp: 0.44441088, dNode: -0.29257343 },
  { id: "jupiter", a: 5.20288700, e: 0.04838624, i: 1.30439695, L: 34.39644051, lp: 14.72847983, node: 100.47390909,
    dA: -0.00011607, dE: -0.00013253, dI: -0.00183714, dL: 3034.74612775, dLp: 0.21252668, dNode: 0.20469106 },
  { id: "saturn", a: 9.53667594, e: 0.05386179, i: 2.48599187, L: 49.95424423, lp: 92.59887831, node: 113.66242448,
    dA: -0.00125060, dE: -0.00050991, dI: 0.00193609, dL: 1222.49362201, dLp: -0.41897216, dNode: -0.28867794 },
  { id: "uranus", a: 19.18916464, e: 0.04725744, i: 0.77263783, L: 313.23810451, lp: 170.95427630, node: 74.01692503,
    dA: -0.00196176, dE: -0.00004397, dI: -0.00242939, dL: 428.48202785, dLp: 0.40805281, dNode: 0.04240589 },
  { id: "neptune", a: 30.06992276, e: 0.00859048, i: 1.77004347, L: -55.12002969, lp: 44.96476227, node: 131.78422574,
    dA: 0.00026291, dE: 0.00005105, dI: 0.00035372, dL: 218.45945325, dLp: -0.32241464, dNode: -0.00508664 },
  { id: "pluto", a: 39.48211675, e: 0.24882730, i: 17.14001206, L: 238.92903833, lp: 224.06891629, node: 110.30393684,
    dA: -0.00031596, dE: 0.00005170, dI: 0.00004818, dL: 145.20780515, dLp: -0.04062942, dNode: -0.01183482 },
];

const DEG = Math.PI / 180;

function julianCenturiesSinceJ2000(date: Date): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  return (jd - 2451545.0) / 36525.0;
}

function solveKepler(M: number, e: number): number {
  // Newton-Raphson
  let E = M + e * Math.sin(M);
  for (let n = 0; n < 6; n++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-7) break;
  }
  return E;
}

export interface PlanetState {
  id: string;
  x: number; y: number; z: number; // heliocentric ecliptic AU
  longitude: number; // deg, 0–360
}

export function computePlanetState(el: KeplerElements, date: Date): PlanetState {
  const T = julianCenturiesSinceJ2000(date);
  const a = el.a + el.dA * T;
  const e = el.e + el.dE * T;
  const i = (el.i + el.dI * T) * DEG;
  const L = el.L + el.dL * T;
  const lp = el.lp + el.dLp * T;
  const node = (el.node + el.dNode * T) * DEG;
  const omega = (lp - (el.node + el.dNode * T)) * DEG; // argument of perihelion
  let M = ((L - lp) % 360) * DEG;
  M = Math.atan2(Math.sin(M), Math.cos(M));
  const E = solveKepler(M, e);
  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const v = Math.atan2(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);
  const cosNode = Math.cos(node), sinNode = Math.sin(node);
  const cosI = Math.cos(i), sinI = Math.sin(i);
  const u = v + omega;
  const cosU = Math.cos(u), sinU = Math.sin(u);
  const x = r * (cosNode * cosU - sinNode * sinU * cosI);
  const y = r * (sinNode * cosU + cosNode * sinU * cosI);
  const z = r * (sinU * sinI);
  let longitude = (Math.atan2(y, x) / DEG + 360) % 360;
  return { id: el.id, x, y, z, longitude };
}

export function computeAllStates(date: Date): PlanetState[] {
  return PLANET_ELEMENTS.map((el) => computePlanetState(el, date));
}

// Sample an orbit trail as XYZ points by sweeping mean anomaly.
export function sampleOrbit(el: KeplerElements, date: Date, segments = 256): [number, number, number][] {
  const T = julianCenturiesSinceJ2000(date);
  const a = el.a + el.dA * T;
  const e = el.e + el.dE * T;
  const i = (el.i + el.dI * T) * DEG;
  const lp = el.lp + el.dLp * T;
  const node = (el.node + el.dNode * T) * DEG;
  const omega = (lp - (el.node + el.dNode * T)) * DEG;
  const cosNode = Math.cos(node), sinNode = Math.sin(node);
  const cosI = Math.cos(i), sinI = Math.sin(i);
  const pts: [number, number, number][] = [];
  for (let s = 0; s <= segments; s++) {
    const M = (s / segments) * Math.PI * 2 - Math.PI;
    const E = solveKepler(M, e);
    const xv = a * (Math.cos(E) - e);
    const yv = a * Math.sqrt(1 - e * e) * Math.sin(E);
    const v = Math.atan2(yv, xv);
    const r = Math.sqrt(xv * xv + yv * yv);
    const u = v + omega;
    const cosU = Math.cos(u), sinU = Math.sin(u);
    pts.push([
      r * (cosNode * cosU - sinNode * sinU * cosI),
      r * (sinU * sinI),
      r * (sinNode * cosU + cosNode * sinU * cosI),
    ]);
  }
  return pts;
}

// Detect alignment: any cluster of N+ planets within arcDeg heliocentric longitude.
export function detectAlignment(states: PlanetState[], minCount = 3, arcDeg = 15): {
  aligned: boolean; planets: string[]; spread: number;
} {
  let best: { planets: string[]; spread: number } = { planets: [], spread: 360 };
  const sorted = [...states].sort((a, b) => a.longitude - b.longitude);
  const n = sorted.length;
  // sliding window over circular longitudes
  for (let i = 0; i < n; i++) {
    for (let j = i + minCount - 1; j < i + n; j++) {
      const a = sorted[i].longitude;
      const b = sorted[j % n].longitude;
      let spread = (b - a + 360) % 360;
      if (spread > 180) continue;
      if (spread <= arcDeg) {
        const group: string[] = [];
        for (let k = i; k <= j; k++) group.push(sorted[k % n].id);
        if (group.length >= best.planets.length) best = { planets: group, spread };
      }
    }
  }
  return { aligned: best.planets.length >= minCount, planets: best.planets, spread: best.spread };
}
