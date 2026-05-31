// Zodiac constellations rendered as detailed stick figures.
// Coordinate space: roughly -20..20 x by -10..10 y so each figure fits the
// constellation band. r = visual magnitude (1.8 ~ alpha star, 0.8 ~ faint).

export interface ConstellationStar { x: number; y: number; r: number }
export interface ConstellationPattern {
  stars: ConstellationStar[];
  lines: [number, number][];
}

// Reference: IAU/Stellarium stick figures, scaled and reoriented so the long
// axis of each constellation runs along x and the "top" of the figure points
// away from chart center after rotation.
export const CONSTELLATIONS: Record<string, ConstellationPattern> = {
  // The Ram — horn curl + body line
  aries: {
    stars: [
      { x: -16, y:  0, r: 1.8 }, // Hamal (α)
      { x: -10, y:  2, r: 1.4 }, // Sheratan (β)
      { x:  -7, y:  3, r: 1.1 }, // Mesarthim (γ)
      { x:  -4, y:  1, r: 0.9 }, // 41 Ari
      { x:   2, y: -1, r: 1.0 },
      { x:   9, y: -3, r: 1.1 },
      { x:  15, y: -5, r: 1.0 }, // Botein (δ)
      { x: -13, y: -3, r: 0.9 }, // horn tip
    ],
    lines: [[7,0],[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
  },

  // The Bull — V of Hyades + horns + Pleiades cluster
  taurus: {
    stars: [
      { x: -18, y:  4, r: 1.1 }, // Pleiades anchor
      { x: -16, y:  3, r: 0.9 },
      { x: -17, y:  5, r: 0.9 },
      { x: -10, y:  2, r: 1.2 }, // ε Tau
      { x:  -4, y:  0, r: 1.8 }, // Aldebaran (α)
      { x:  -7, y: -2, r: 1.1 },
      { x:  -1, y: -2, r: 1.0 },
      { x:   6, y: -5, r: 1.5 }, // Elnath (β) — horn tip
      { x:   8, y:  4, r: 1.4 }, // ζ Tau — horn tip
      { x:   2, y:  2, r: 1.0 },
    ],
    lines: [[0,1],[1,2],[2,0],[3,5],[3,4],[4,6],[5,4],[6,7],[4,9],[9,8]],
  },

  // The Twins — two parallel stick figures, heads at Castor & Pollux
  gemini: {
    stars: [
      { x: -16, y: -5, r: 1.6 }, // Castor (α)
      { x: -16, y:  3, r: 1.7 }, // Pollux (β)
      { x: -10, y: -4, r: 1.0 },
      { x: -10, y:  3, r: 1.1 },
      { x:  -4, y: -3, r: 1.0 },
      { x:  -4, y:  3, r: 1.1 },
      { x:   3, y: -2, r: 1.0 },
      { x:   3, y:  4, r: 1.1 },
      { x:  10, y: -4, r: 1.1 }, // Alhena (γ) — Pollux's foot
      { x:  10, y:  6, r: 1.0 },
      { x:  14, y: -1, r: 0.9 },
      { x:  14, y:  2, r: 0.9 },
    ],
    lines: [[0,2],[2,4],[4,6],[6,8],[1,3],[3,5],[5,7],[7,9],[2,3],[8,10],[9,11]],
  },

  // The Crab — faint Y shape
  cancer: {
    stars: [
      { x: -14, y:  4, r: 1.1 }, // Acubens (α)
      { x:  -6, y:  1, r: 1.2 }, // Asellus Australis (δ)
      { x:  -2, y: -2, r: 1.1 }, // Asellus Borealis (γ)
      { x:  -5, y: -5, r: 1.0 }, // ι Cnc
      { x:   6, y:  3, r: 1.0 }, // β Cnc — Tarf
      { x:  13, y:  5, r: 0.9 },
    ],
    lines: [[0,1],[1,2],[2,3],[1,4],[4,5]],
  },

  // The Lion — head sickle + body trapezoid + tail
  leo: {
    stars: [
      { x: -16, y:  0, r: 1.8 }, // Regulus (α) — heart
      { x: -14, y:  3, r: 1.2 }, // η Leo
      { x: -12, y:  5, r: 1.1 }, // γ Leo — Algieba
      { x: -10, y:  6, r: 1.0 }, // ζ Leo — Adhafera
      { x:  -8, y:  5, r: 1.0 }, // μ Leo
      { x:  -6, y:  3, r: 1.0 }, // ε Leo
      { x:  -4, y:  1, r: 1.0 }, // back of sickle
      { x:   2, y: -2, r: 1.1 }, // θ Leo — Chertan
      { x:   8, y: -1, r: 1.2 }, // δ Leo — Zosma
      { x:  14, y:  2, r: 1.6 }, // Denebola (β) — tail
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[0,7],[7,8],[8,9],[7,9]],
  },

  // The Maiden — long Y shape with Spica at the hand
  virgo: {
    stars: [
      { x: -17, y: -2, r: 1.0 }, // ν Vir
      { x: -12, y:  0, r: 1.2 }, // β Vir — Zavijava
      { x:  -6, y:  2, r: 1.1 }, // η Vir
      { x:  -1, y:  3, r: 1.2 }, // γ Vir — Porrima
      { x:   5, y:  1, r: 1.3 }, // δ Vir
      { x:  10, y: -1, r: 1.3 }, // ε Vir — Vindemiatrix
      { x:   2, y: -3, r: 1.8 }, // Spica (α)
      { x:  -3, y: -5, r: 1.0 }, // ζ Vir
      { x:   8, y:  5, r: 0.9 }, // ι Vir
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[3,6],[6,7],[4,8]],
  },

  // The Scales — beam + two pans
  libra: {
    stars: [
      { x: -12, y:  3, r: 1.3 }, // Zubenelgenubi (α)
      { x:   0, y: -3, r: 1.3 }, // Zubeneschamali (β)
      { x:  12, y:  3, r: 1.2 }, // Zubenelakrab (γ)
      { x:  -6, y:  5, r: 0.9 }, // pan left
      { x:   6, y:  5, r: 0.9 }, // pan right
      { x:  -3, y:  6, r: 0.8 },
      { x:   3, y:  6, r: 0.8 },
    ],
    lines: [[0,1],[1,2],[0,3],[2,4],[3,5],[5,6],[6,4]],
  },

  // The Scorpion — claws, body, curled tail
  scorpio: {
    stars: [
      { x: -18, y: -3, r: 1.1 }, // β Sco — Graffias
      { x: -16, y: -5, r: 1.0 }, // claw
      { x: -14, y: -1, r: 1.1 }, // δ Sco — Dschubba
      { x: -12, y:  1, r: 1.0 }, // π Sco
      { x:  -8, y:  2, r: 1.0 }, // σ Sco
      { x:  -4, y:  3, r: 1.8 }, // Antares (α)
      { x:   1, y:  4, r: 1.0 }, // τ Sco
      { x:   5, y:  4, r: 1.1 }, // ε Sco
      { x:   9, y:  3, r: 1.0 }, // μ Sco
      { x:  12, y:  1, r: 1.1 }, // ζ Sco
      { x:  14, y: -2, r: 1.0 }, // η Sco
      { x:  15, y: -5, r: 1.2 }, // θ Sco — Sargas
      { x:  13, y: -7, r: 1.3 }, // λ Sco — Shaula
      { x:  10, y: -6, r: 1.0 }, // υ Sco — Lesath
    ],
    lines: [[1,0],[0,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13]],
  },

  // The Archer — teapot asterism
  sagittarius: {
    stars: [
      { x: -14, y:  3, r: 1.3 }, // ε Sgr — Kaus Australis
      { x: -10, y:  0, r: 1.2 }, // δ Sgr — Kaus Media
      { x:  -7, y: -3, r: 1.1 }, // λ Sgr — Kaus Borealis
      { x:  -2, y: -4, r: 1.2 }, // φ Sgr
      { x:   3, y: -3, r: 1.3 }, // σ Sgr — Nunki
      { x:   8, y: -1, r: 1.1 }, // τ Sgr
      { x:  11, y:  2, r: 1.2 }, // ζ Sgr — Ascella
      { x:   6, y:  4, r: 1.0 }, // φ' Sgr
      { x:  -3, y:  5, r: 1.0 }, // η Sgr — handle
      { x:  -8, y:  5, r: 0.9 },
      { x:  -4, y: -6, r: 0.9 }, // lid tip
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,1],[0,8],[8,9],[2,10],[10,3]],
  },

  // The Sea-goat — long triangular outline
  capricorn: {
    stars: [
      { x: -16, y: -3, r: 1.3 }, // α Cap — Algedi
      { x: -13, y: -2, r: 1.1 }, // β Cap — Dabih
      { x:  -8, y:  1, r: 1.0 }, // ψ Cap
      { x:  -3, y:  3, r: 1.0 }, // ω Cap
      { x:   3, y:  5, r: 1.0 }, // ζ Cap
      { x:   9, y:  4, r: 1.1 }, // ε Cap
      { x:  14, y:  1, r: 1.3 }, // δ Cap — Deneb Algedi
      { x:  10, y: -2, r: 1.2 }, // γ Cap — Nashira
      { x:   4, y: -3, r: 1.0 }, // θ Cap
      { x:  -3, y: -4, r: 1.0 }, // ι Cap
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,1]],
  },

  // The Water-Bearer — Y of head + stream of water
  aquarius: {
    stars: [
      { x: -16, y: -2, r: 1.3 }, // α Aqr — Sadalmelik
      { x: -13, y:  0, r: 1.2 }, // β Aqr — Sadalsuud
      { x:  -9, y: -2, r: 1.0 }, // γ Aqr — Sadachbia
      { x:  -7, y:  0, r: 1.0 }, // ζ Aqr — water jar center
      { x:  -5, y: -3, r: 1.0 }, // η Aqr
      { x:  -3, y: -1, r: 1.0 }, // π Aqr
      { x:   2, y:  2, r: 1.1 }, // λ Aqr
      { x:   6, y:  4, r: 1.0 }, // φ Aqr — stream
      { x:  10, y:  5, r: 1.0 },
      { x:  14, y:  4, r: 1.0 },
      { x:  16, y:  1, r: 1.2 }, // δ Aqr — Skat
      { x:  -2, y:  3, r: 1.0 }, // θ Aqr
      { x:   4, y: -2, r: 0.9 },
    ],
    lines: [[0,1],[1,3],[3,2],[3,4],[3,5],[3,11],[11,6],[6,7],[7,8],[8,9],[9,10],[1,12],[12,11]],
  },

  // The Fishes — two arcs joined by a cord at Alrescha
  pisces: {
    stars: [
      { x: -18, y:  4, r: 0.9 }, // western fish tip
      { x: -14, y:  3, r: 1.0 },
      { x: -10, y:  2, r: 1.0 },
      { x:  -6, y:  3, r: 1.0 }, // ω Psc
      { x:  -2, y:  4, r: 1.0 },
      { x:   1, y:  2, r: 1.2 }, // α Psc — Alrescha (knot)
      { x:   3, y:  0, r: 1.0 },
      { x:   6, y: -2, r: 1.0 },
      { x:  10, y: -3, r: 1.0 },
      { x:  13, y: -2, r: 1.0 },
      { x:  16, y:  0, r: 1.1 }, // γ Psc
      { x:  14, y:  3, r: 1.0 },
      { x:  11, y:  4, r: 1.0 }, // eastern fish loop
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,9]],
  },
};
