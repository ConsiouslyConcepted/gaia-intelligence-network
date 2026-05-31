// Simplified stick-figure constellation patterns for each zodiac sign.
// Coordinates are local SVG units (~ -18..18 x, -9..9 y) so the figure fits
// within the constellation band. r = star magnitude (visual brightness).
// lines = pairs of point indices to connect.

export interface ConstellationStar { x: number; y: number; r: number }
export interface ConstellationPattern {
  stars: ConstellationStar[];
  lines: [number, number][];
}

export const CONSTELLATIONS: Record<string, ConstellationPattern> = {
  aries: {
    stars: [
      { x: -14, y:  2, r: 1.6 }, // Hamal
      { x:  -6, y:  0, r: 1.3 }, // Sheratan
      { x:  -2, y:  1, r: 1.0 }, // Mesarthim
      { x:   8, y: -3, r: 1.1 },
      { x:  14, y: -5, r: 0.9 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4]],
  },
  taurus: {
    stars: [
      { x: -16, y:  4, r: 1.0 },
      { x: -10, y:  2, r: 1.2 },
      { x:  -4, y:  0, r: 1.7 }, // Aldebaran
      { x:   2, y: -3, r: 1.1 },
      { x:   8, y: -6, r: 1.3 }, // Elnath
      { x:   6, y:  4, r: 1.0 },
      { x:  12, y:  6, r: 0.9 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[2,5],[5,6]],
  },
  gemini: {
    stars: [
      { x: -14, y: -5, r: 1.5 }, // Castor
      { x: -10, y:  0, r: 1.0 },
      { x:  -4, y:  3, r: 1.0 },
      { x:   4, y:  3, r: 1.0 },
      { x:  10, y:  0, r: 1.0 },
      { x:  14, y: -5, r: 1.6 }, // Pollux
      { x: -12, y:  5, r: 0.9 },
      { x:  12, y:  5, r: 0.9 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[1,6],[4,7]],
  },
  cancer: {
    stars: [
      { x: -10, y:  3, r: 1.0 },
      { x:  -2, y:  0, r: 1.2 },
      { x:   2, y:  4, r: 0.9 },
      { x:   6, y: -3, r: 1.0 },
      { x:  12, y: -5, r: 0.9 },
    ],
    lines: [[0,1],[1,2],[1,3],[3,4]],
  },
  leo: {
    stars: [
      { x: -14, y: -2, r: 1.7 }, // Regulus
      { x: -10, y:  2, r: 1.1 },
      { x:  -6, y:  4, r: 1.2 },
      { x:   0, y:  3, r: 1.0 },
      { x:   6, y:  1, r: 1.3 },
      { x:  12, y: -3, r: 1.5 }, // Denebola
      { x:  -8, y: -4, r: 1.0 },
      { x:  -2, y: -3, r: 1.0 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[0,6],[6,7],[7,4]],
  },
  virgo: {
    stars: [
      { x: -15, y:  4, r: 1.0 },
      { x:  -8, y:  2, r: 1.1 },
      { x:  -2, y:  0, r: 1.2 },
      { x:   4, y: -3, r: 1.7 }, // Spica
      { x:  10, y:  1, r: 1.0 },
      { x:  14, y:  5, r: 0.9 },
      { x:  -4, y: -4, r: 0.9 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[2,6]],
  },
  libra: {
    stars: [
      { x: -12, y:  4, r: 1.2 },
      { x:  -2, y: -3, r: 1.3 },
      { x:  10, y:  4, r: 1.2 },
      { x:  -4, y:  5, r: 0.9 },
      { x:   4, y:  5, r: 0.9 },
    ],
    lines: [[0,1],[1,2],[0,3],[3,4],[4,2]],
  },
  scorpio: {
    stars: [
      { x: -16, y: -3, r: 1.0 },
      { x: -10, y: -1, r: 1.1 },
      { x:  -6, y:  0, r: 1.0 },
      { x:  -2, y:  1, r: 1.8 }, // Antares
      { x:   4, y:  3, r: 1.1 },
      { x:   9, y:  5, r: 1.0 },
      { x:  13, y:  3, r: 1.0 },
      { x:  15, y: -1, r: 1.1 }, // Shaula
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]],
  },
  sagittarius: {
    stars: [
      { x: -14, y:  4, r: 1.2 },
      { x:  -8, y:  1, r: 1.3 }, // Kaus Australis
      { x:  -2, y: -2, r: 1.1 },
      { x:   4, y: -4, r: 1.0 },
      { x:  10, y: -2, r: 1.0 },
      { x:  14, y:  2, r: 1.1 },
      { x:  -4, y:  5, r: 0.9 },
      { x:   2, y:  5, r: 0.9 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[1,6],[6,7],[7,2]],
  },
  capricorn: {
    stars: [
      { x: -14, y: -3, r: 1.2 },
      { x:  -8, y:  0, r: 1.0 },
      { x:  -2, y:  3, r: 1.0 },
      { x:   4, y:  4, r: 1.0 },
      { x:  10, y:  2, r: 1.1 },
      { x:  14, y: -2, r: 1.3 }, // Deneb Algedi
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]],
  },
  aquarius: {
    stars: [
      { x: -15, y: -2, r: 1.0 },
      { x:  -9, y:  0, r: 1.1 },
      { x:  -3, y:  2, r: 1.2 }, // Sadalmelik
      { x:   3, y:  2, r: 1.1 },
      { x:   9, y:  0, r: 1.0 },
      { x:  14, y: -3, r: 1.0 },
      { x:   0, y:  5, r: 0.9 },
      { x:   6, y:  5, r: 0.9 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[2,6],[3,7]],
  },
  pisces: {
    stars: [
      { x: -16, y:  3, r: 0.9 },
      { x: -10, y:  1, r: 1.0 },
      { x:  -4, y:  0, r: 1.2 },
      { x:   2, y:  1, r: 1.0 },
      { x:   8, y:  3, r: 1.0 },
      { x:  14, y:  5, r: 0.9 },
      { x:  -2, y: -4, r: 0.9 },
      { x:   6, y: -3, r: 0.9 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[2,6],[6,7],[7,3]],
  },
};
