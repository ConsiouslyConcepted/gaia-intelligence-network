/**
 * Geometry of Music — Pythagorean / Kepler ratios mapped onto the
 * 12-tone chromatic wheel and Scafetta's (b/a)^(2/3) ≈ 9/8 mirror-pair
 * scaling of the solar system.
 */

export interface Interval {
  id: string;
  short: string;
  name: string;
  ratio: string;
  value: number;
  /** Semitones between the two notes on the 12-tone wheel (1..11) */
  semitones: number;
  /** Description shown in the sidebar */
  desc: string;
  /** Marks the Pythagorean epogdoon — fundamental planetary-scale ratio */
  fundamental?: boolean;
}

export const INTERVALS: Interval[] = [
  { id: "P8",  short: "P8", name: "Octave (Diapason)", ratio: "2/1", value: 2 / 1, semitones: 12, desc: "Same note, next octave." },
  { id: "P5",  short: "P5", name: "Perfect Fifth (Diapente)", ratio: "3/2", value: 3 / 2, semitones: 7, desc: "Strongest consonance after the octave." },
  { id: "P4",  short: "P4", name: "Perfect Fourth (Diatessaron)", ratio: "4/3", value: 4 / 3, semitones: 5, desc: "Inversion of the perfect fifth." },
  { id: "M3",  short: "M3", name: "Major Third", ratio: "5/4", value: 5 / 4, semitones: 4, desc: "Bright, consonant triad interval." },
  { id: "m3",  short: "m3", name: "Minor Third", ratio: "6/5", value: 6 / 5, semitones: 3, desc: "Dark, consonant triad interval." },
  { id: "M6",  short: "M6", name: "Major Sixth", ratio: "5/3", value: 5 / 3, semitones: 9, desc: "Open, lifting consonance." },
  { id: "m6",  short: "m6", name: "Minor Sixth", ratio: "8/5", value: 8 / 5, semitones: 8, desc: "Restless consonance." },
  { id: "M2",  short: "M2", name: "Major Second · Epogdoon ★", ratio: "9/8", value: 9 / 8, semitones: 2, desc: "Pythagorean whole-tone — the fundamental ratio of the planetary scale.", fundamental: true },
];

export interface PlanetRef {
  id: string;
  name: string;
  color: string;
  /** Semi-major axis in AU */
  au: number;
}

const P: Record<string, PlanetRef> = {
  mercury: { id: "mercury", name: "Mercury", color: "#b0a090", au: 0.387 },
  venus:   { id: "venus",   name: "Venus",   color: "#e8c86a", au: 0.723 },
  earth:   { id: "earth",   name: "Earth",   color: "#4488cc", au: 1.000 },
  mars:    { id: "mars",    name: "Mars",    color: "#cc5533", au: 1.524 },
  jupiter: { id: "jupiter", name: "Jupiter", color: "#e8893a", au: 5.203 },
  saturn:  { id: "saturn",  name: "Saturn",  color: "#d49a4a", au: 9.537 },
  uranus:  { id: "uranus",  name: "Uranus",  color: "#7ecbcb", au: 19.191 },
  neptune: { id: "neptune", name: "Neptune", color: "#7a4fcf", au: 30.069 },
};

export const EPOGDOON = 9 / 8;
export const ASTEROID_BELT_AU = 2.77;

const pow23 = (b: number, a: number) => Math.pow(b / a, 2 / 3);

export interface PlanetPair {
  id: string;
  label: string;
  inner: PlanetRef;
  outer: PlanetRef;
  /** (b/a)^(2/3) */
  value: number;
  /** Matching interval id from INTERVALS */
  intervalId: string;
  /** Target ratio value for the matching interval */
  target: number;
  /** Accuracy as a percentage close to target (adjacent) or to belt (mirror) */
  accuracy: number;
  /** Geometric-mean semi-major axis √(a·b) in AU */
  geoMeanAU: number;
  /** Deviation from the asteroid belt centre in AU (signed) — mirror pairs */
  beltDeltaAU: number;
  kind: "mirror" | "adjacent";
}

const mkPair = (
  id: string,
  inner: PlanetRef,
  outer: PlanetRef,
  intervalId: string,
  kind: "mirror" | "adjacent",
): PlanetPair => {
  const value = pow23(outer.au, inner.au);
  const target = INTERVALS.find((i) => i.id === intervalId)!.value;
  const geoMeanAU = Math.sqrt(inner.au * outer.au);
  const beltDeltaAU = geoMeanAU - ASTEROID_BELT_AU;
  const accuracy =
    kind === "mirror"
      ? 100 - Math.abs(beltDeltaAU / ASTEROID_BELT_AU) * 100
      : 100 - Math.abs((value - target) / target) * 100;
  return {
    id,
    label: `${inner.name} – ${outer.name}`,
    inner,
    outer,
    value,
    intervalId,
    target,
    accuracy,
    geoMeanAU,
    beltDeltaAU,
    kind,
  };
};

/**
 * Mirror pairs across the asteroid belt — all approximate the epogdoon 9/8.
 */
export const MIRROR_PAIRS: PlanetPair[] = [
  mkPair("jup-mars",  P.mars,    P.jupiter, "M2",  "mirror"),
  mkPair("sat-earth", P.earth,   P.saturn,  "M2",  "mirror"),
  mkPair("ura-venus", P.venus,   P.uranus,  "M2",  "mirror"),
  mkPair("nep-merc",  P.mercury, P.neptune, "M2",  "mirror"),
];

/**
 * Adjacent neighbouring pairs whose (b/a)^(2/3) lands on a musical consonance.
 */
export const ADJACENT_PAIRS: PlanetPair[] = [
  mkPair("merc-venus",  P.mercury, P.venus,   "m3",  "adjacent"),
  mkPair("venus-earth", P.venus,   P.earth,   "M3",  "adjacent"),
  mkPair("earth-mars",  P.earth,   P.mars,    "M3",  "adjacent"),
  mkPair("jup-sat",     P.jupiter, P.saturn,  "P4",  "adjacent"),
  mkPair("sat-ura",     P.saturn,  P.uranus,  "P5",  "adjacent"),
  mkPair("ura-nep",     P.uranus,  P.neptune, "m3",  "adjacent"),
];

export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
