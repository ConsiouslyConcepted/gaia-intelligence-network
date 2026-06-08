// Zodiac sign metadata and planet glyphs for the astrology chart
export type Element = "fire" | "earth" | "air" | "water";

export interface SignMeta {
  id: string;
  name: string;
  glyph: string;
  element: Element;
  modality: "cardinal" | "fixed" | "mutable";
  ruler: string;
  startDeg: number; // ecliptic longitude where this sign starts
  tint: string; // hsl tint (subtle wayfinding hue, cream/gold range allowed)
}

export const SIGNS: SignMeta[] = [
  { id: "aries",       name: "Aries",       glyph: "♈", element: "fire",  modality: "cardinal", ruler: "Mars",    startDeg:   0, tint: "hsl(15, 55%, 65%)" },
  { id: "taurus",      name: "Taurus",      glyph: "♉", element: "earth", modality: "fixed",    ruler: "Venus",   startDeg:  30, tint: "hsl(95, 30%, 60%)" },
  { id: "gemini",      name: "Gemini",      glyph: "♊", element: "air",   modality: "mutable",  ruler: "Mercury", startDeg:  60, tint: "hsl(50, 60%, 70%)" },
  { id: "cancer",      name: "Cancer",      glyph: "♋", element: "water", modality: "cardinal", ruler: "Moon",    startDeg:  90, tint: "hsl(200, 45%, 70%)" },
  { id: "leo",         name: "Leo",         glyph: "♌", element: "fire",  modality: "fixed",    ruler: "Sun",     startDeg: 120, tint: "hsl(35, 70%, 65%)" },
  { id: "virgo",       name: "Virgo",       glyph: "♍", element: "earth", modality: "mutable",  ruler: "Mercury", startDeg: 150, tint: "hsl(110, 25%, 55%)" },
  { id: "libra",       name: "Libra",       glyph: "♎", element: "air",   modality: "cardinal", ruler: "Venus",   startDeg: 180, tint: "hsl(330, 35%, 70%)" },
  { id: "scorpio",     name: "Scorpio",     glyph: "♏", element: "water", modality: "fixed",    ruler: "Pluto",   startDeg: 210, tint: "hsl(0, 50%, 55%)" },
  { id: "sagittarius", name: "Sagittarius", glyph: "♐", element: "fire",  modality: "mutable",  ruler: "Jupiter", startDeg: 240, tint: "hsl(280, 35%, 65%)" },
  { id: "capricorn",   name: "Capricorn",   glyph: "♑", element: "earth", modality: "cardinal", ruler: "Saturn",  startDeg: 270, tint: "hsl(30, 25%, 50%)" },
  { id: "aquarius",    name: "Aquarius",    glyph: "♒", element: "air",   modality: "fixed",    ruler: "Uranus",  startDeg: 300, tint: "hsl(190, 55%, 65%)" },
  { id: "pisces",      name: "Pisces",      glyph: "♓", element: "water", modality: "mutable",  ruler: "Neptune", startDeg: 330, tint: "hsl(220, 50%, 70%)" },
];

export const PLANET_GLYPHS: Record<string, { glyph: string; name: string; color: string }> = {
  sun:     { glyph: "☉", name: "Sun",     color: "hsl(45, 90%, 65%)" },
  moon:    { glyph: "☾", name: "Moon",    color: "hsl(210, 30%, 88%)" },
  mercury: { glyph: "☿", name: "Mercury", color: "hsl(35, 50%, 75%)" },
  venus:   { glyph: "♀", name: "Venus",   color: "hsl(40, 70%, 80%)" },
  mars:    { glyph: "♂", name: "Mars",    color: "hsl(10, 70%, 60%)" },
  jupiter: { glyph: "♃", name: "Jupiter", color: "hsl(30, 60%, 70%)" },
  saturn:  { glyph: "♄", name: "Saturn",  color: "hsl(40, 35%, 65%)" },
  uranus:  { glyph: "♅", name: "Uranus",  color: "hsl(180, 50%, 70%)" },
  neptune: { glyph: "♆", name: "Neptune", color: "hsl(220, 55%, 70%)" },
  pluto:   { glyph: "♇", name: "Pluto",   color: "hsl(300, 30%, 60%)" },
};

export const PLANET_ORDER = ["sun","moon","mercury","venus","mars","jupiter","saturn","uranus","neptune","pluto"] as const;

export function longitudeToSign(lon: number): { sign: SignMeta; degInSign: number } {
  const norm = ((lon % 360) + 360) % 360;
  const idx = Math.floor(norm / 30);
  return { sign: SIGNS[idx], degInSign: norm - idx * 30 };
}

// Keplerian aspect set — re-exported from harmonics.ts so the chart and
// ephemeris stay in sync. Includes the classical 5 plus Kepler's minor
// aspects derived from harmonic polygons (quintile, biquintile, semi-sextile,
// quincunx, semi-square, sesquiquadrate).
export { KEPLER_ASPECTS as ASPECTS } from "./harmonics";
