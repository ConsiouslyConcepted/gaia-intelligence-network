/**
 * Solar system planets for HGS — real celestial bodies with
 * approximate Keplerian harmonic ratios between adjacent orbits.
 */
export interface SolarPlanet {
  id: string;
  name: string;
  color: string;
  orbitRadius: number; // normalized 0–1
  speed: number; // relative orbital speed (inner = faster)
  size: number; // visual radius in px
  image: string; // path to planet image
  cymaticImage: string; // path to cymatic frequency pattern
}

// Colors inspired by actual planetary appearance
export const SOLAR_PLANETS: SolarPlanet[] = [
  { id: "mercury", name: "Mercury", color: "#b0a090", orbitRadius: 0.12, speed: 4.15, size: 4, image: "/planets/mercury.png", cymaticImage: "/cymatics/mercury.png" },
  { id: "venus", name: "Venus", color: "#e8c86a", orbitRadius: 0.20, speed: 1.625, size: 6, image: "/planets/venus.png", cymaticImage: "/cymatics/venus.png" },
  { id: "earth", name: "Earth", color: "#4488cc", orbitRadius: 0.30, speed: 1.0, size: 7, image: "/planets/earth.png", cymaticImage: "/cymatics/earth.png" },
  { id: "mars", name: "Mars", color: "#cc5533", orbitRadius: 0.40, speed: 0.532, size: 5, image: "/planets/mars.png", cymaticImage: "/cymatics/mars.png" },
  { id: "jupiter", name: "Jupiter", color: "#e8893a", orbitRadius: 0.55, speed: 0.0843, size: 12, image: "/planets/jupiter.png", cymaticImage: "/cymatics/jupiter.png" },
  { id: "saturn", name: "Saturn", color: "#d49a4a", orbitRadius: 0.70, speed: 0.0339, size: 10, image: "/planets/saturn.png", cymaticImage: "/cymatics/saturn.png" },
  { id: "uranus", name: "Uranus", color: "#7ecbcb", orbitRadius: 0.82, speed: 0.0119, size: 8, image: "/planets/uranus.png", cymaticImage: "/cymatics/uranus.png" },
  { id: "neptune", name: "Neptune", color: "#7a4fcf", orbitRadius: 0.88, speed: 0.00607, size: 7, image: "/planets/neptune.png", cymaticImage: "/cymatics/neptune.png" },
  { id: "pluto", name: "Pluto", color: "#c4a882", orbitRadius: 0.96, speed: 0.00404, size: 4, image: "/planets/pluto.png", cymaticImage: "/cymatics/pluto.png" },
];

/**
 * Real approximate orbital resonance ratios between adjacent planets.
 * These produce the actual cymatic geometry when visualized.
 */
export const PLANET_RESONANCE_PAIRS = [
  { label: "Mercury – Venus", i: 0, j: 1, a: 5, b: 2, c1: "#b0a090", c2: "#e8c86a" },
  { label: "Venus – Earth", i: 1, j: 2, a: 13, b: 8, c1: "#e8c86a", c2: "#4488cc" },
  { label: "Earth – Mars", i: 2, j: 3, a: 2, b: 1, c1: "#4488cc", c2: "#cc5533" },
  { label: "Mars – Jupiter", i: 3, j: 4, a: 6, b: 1, c1: "#cc5533", c2: "#d4a56a" },
  { label: "Jupiter – Saturn", i: 4, j: 5, a: 5, b: 2, c1: "#d4a56a", c2: "#c8b070" },
  { label: "Saturn – Uranus", i: 5, j: 6, a: 3, b: 1, c1: "#c8b070", c2: "#7ecbcb" },
  { label: "Uranus – Neptune", i: 6, j: 7, a: 2, b: 1, c1: "#7ecbcb", c2: "#4466dd" },
  { label: "Neptune – Pluto", i: 7, j: 8, a: 3, b: 2, c1: "#4466dd", c2: "#c4a882" },
];
