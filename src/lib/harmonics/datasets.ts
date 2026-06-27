// Dataset registry for the Harmonic Analysis Engine.
// Each dataset is a deterministic synthetic series anchored on real-world
// periods and amplitudes (sunspot cycle, orbital years, CMB peaks, etc.).
// Series are read-only and reproducible — no live polling here.

export type Scope =
  | "planetary"
  | "solar"
  | "stellar"
  | "galactic"
  | "universal"
  | "cosmological";

export interface Dataset {
  id: string;
  scope: Scope;
  label: string;
  description: string;
  unit: string;          // x-axis unit, e.g. "yr", "day", "Mpc", "ℓ"
  sampleRate: number;    // samples per unit
  series: number[];
  /** Optional anchor periods to seed harmonic-ladder defaults. */
  knownPeriod?: number;
  /** Hint for which methods make sense. */
  methods?: AnalyticalMethod[];
}

export type AnalyticalMethod =
  | "spectrum"        // Fourier / power spectrum
  | "harmonic"        // overtone ladder + ratio match
  | "timeSeries"      // raw + autocorrelation
  | "correlation"     // cross-correlation vs another dataset
  | "spherical"       // Yₗᵐ field view
  | "pattern";        // peaks / motifs

// ───────── Helpers ─────────

function seeded(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (((t ^ (t >>> 14)) >>> 0) / 0xffffffff);
  };
}

function compose(
  N: number,
  components: { period: number; amp: number; phase?: number }[],
  noise = 0.05,
  seed = 1,
): number[] {
  const rng = seeded(seed);
  const out: number[] = [];
  for (let i = 0; i < N; i++) {
    let v = 0;
    for (const c of components) {
      v += c.amp * Math.sin((2 * Math.PI * i) / c.period + (c.phase ?? 0));
    }
    v += (rng() - 0.5) * noise * 2;
    out.push(v);
  }
  return out;
}

// ───────── Planetary ─────────
// Sphere-domain time series at ~1 sample/day over ~22 years.
const N_PLANETARY = 1024;

const planetary: Dataset[] = [
  {
    id: "kp-index",
    scope: "planetary",
    label: "Geomagnetic Kp Index",
    description: "Planetary K-index reflects geomagnetic disturbance from solar wind.",
    unit: "day",
    sampleRate: 1,
    series: compose(N_PLANETARY, [
      { period: 365.25, amp: 0.6 },          // annual
      { period: 27, amp: 1.2 },              // solar-rotation
      { period: 11 * 365.25, amp: 1.4 },     // solar cycle
      { period: 13.5, amp: 0.4 },            // half-rotation
    ], 0.4, 11),
    knownPeriod: 27,
    methods: ["spectrum", "timeSeries", "correlation"],
  },
  {
    id: "co2-ppm",
    scope: "planetary",
    label: "Atmospheric CO₂",
    description: "Mauna-Loa-style seasonal + secular trend, detrended for spectral view.",
    unit: "day",
    sampleRate: 1,
    series: compose(N_PLANETARY, [
      { period: 365.25, amp: 3.0 },          // strong annual
      { period: 365.25 / 2, amp: 0.6 },      // semi-annual
    ], 0.3, 22),
    knownPeriod: 365.25,
    methods: ["spectrum", "timeSeries", "spherical"],
  },
  {
    id: "ohc",
    scope: "planetary",
    label: "Ocean Heat Content",
    description: "ENSO + annual mixed-layer variability.",
    unit: "day",
    sampleRate: 1,
    series: compose(N_PLANETARY, [
      { period: 365.25, amp: 0.8 },
      { period: 3.5 * 365.25, amp: 1.3 },    // ENSO
      { period: 22 * 365.25, amp: 0.6 },     // Hale
    ], 0.25, 33),
    knownPeriod: 3.5 * 365.25,
    methods: ["spectrum", "timeSeries", "correlation"],
  },
  {
    id: "sea-ice",
    scope: "planetary",
    label: "Arctic Sea Ice Extent",
    description: "Strong annual freeze–thaw with multi-year drift.",
    unit: "day",
    sampleRate: 1,
    series: compose(N_PLANETARY, [
      { period: 365.25, amp: 4.0 },
      { period: 11 * 365.25, amp: 0.5 },
    ], 0.3, 44),
    knownPeriod: 365.25,
    methods: ["spectrum", "timeSeries", "spherical"],
  },
  {
    id: "ndvi",
    scope: "planetary",
    label: "Global NDVI",
    description: "Vegetation greenness — biosphere annual respiration.",
    unit: "day",
    sampleRate: 1,
    series: compose(N_PLANETARY, [
      { period: 365.25, amp: 1.0, phase: Math.PI / 2 },
      { period: 365.25 / 2, amp: 0.2 },
    ], 0.15, 55),
    knownPeriod: 365.25,
    methods: ["spectrum", "timeSeries", "correlation"],
  },
  {
    id: "schumann",
    scope: "planetary",
    label: "Schumann Resonance (drift)",
    description: "Hourly drift around 7.83 Hz cavity mode.",
    unit: "day",
    sampleRate: 1,
    series: compose(N_PLANETARY, [
      { period: 1, amp: 0.05 },              // diurnal
      { period: 365.25, amp: 0.08 },
      { period: 11 * 365.25, amp: 0.04 },
    ], 0.04, 66),
    knownPeriod: 1,
    methods: ["spectrum", "timeSeries"],
  },
  {
    id: "grid-load",
    scope: "planetary",
    label: "Global Grid Load (Technosphere)",
    description: "Diurnal + weekly + seasonal demand cycle.",
    unit: "day",
    sampleRate: 1,
    series: compose(N_PLANETARY, [
      { period: 7, amp: 1.0 },
      { period: 365.25, amp: 1.4 },
      { period: 1, amp: 0.2 },
    ], 0.2, 77),
    knownPeriod: 7,
    methods: ["spectrum", "timeSeries", "correlation"],
  },
];

// ───────── Solar ─────────
const N_SOLAR = 1024;
const solar: Dataset[] = [
  {
    id: "sunspot",
    scope: "solar",
    label: "Sunspot Number (SSN)",
    description: "Schwabe ~11-yr cycle with Hale 22-yr magnetic envelope.",
    unit: "month",
    sampleRate: 1,
    series: compose(N_SOLAR, [
      { period: 11 * 12, amp: 80 },
      { period: 22 * 12, amp: 20 },
      { period: 87 * 12, amp: 25 },          // Gleissberg
    ], 6, 101).map((v) => Math.max(0, v + 80)),
    knownPeriod: 11 * 12,
    methods: ["spectrum", "harmonic", "timeSeries", "correlation"],
  },
  {
    id: "solar-wind",
    scope: "solar",
    label: "Solar Wind Speed",
    description: "27-day Carrington rotation imprints onto bulk flow.",
    unit: "day",
    sampleRate: 1,
    series: compose(N_SOLAR, [
      { period: 27, amp: 80 },
      { period: 13.5, amp: 30 },
      { period: 11 * 365.25, amp: 60 },
    ], 25, 111).map((v) => v + 440),
    knownPeriod: 27,
    methods: ["spectrum", "timeSeries", "correlation"],
  },
  {
    id: "imf-bt",
    scope: "solar",
    label: "Interplanetary Magnetic Field |B|",
    description: "Heliospheric magnetic-field magnitude at 1 AU.",
    unit: "day",
    sampleRate: 1,
    series: compose(N_SOLAR, [
      { period: 27, amp: 1.4 },
      { period: 11 * 365.25, amp: 1.6 },
    ], 0.6, 121).map((v) => v + 5.6),
    knownPeriod: 27,
    methods: ["spectrum", "timeSeries", "correlation"],
  },
  {
    id: "xray-flux",
    scope: "solar",
    label: "X-Ray Flux (log)",
    description: "Background coronal X-ray follows the solar cycle.",
    unit: "day",
    sampleRate: 1,
    series: compose(N_SOLAR, [
      { period: 11 * 365.25, amp: 1.2 },
      { period: 27, amp: 0.3 },
    ], 0.25, 131).map((v) => v - 6),
    knownPeriod: 11 * 365.25,
    methods: ["spectrum", "timeSeries"],
  },
];

// ───────── Stellar ─────────
// Asteroseismology p-mode oscillations for a Sun-like star.
const N_STELLAR = 2048;
const stellar: Dataset[] = [
  {
    id: "g-star-pmodes",
    scope: "stellar",
    label: "G2V p-mode Oscillations",
    description: "Solar-type 5-min oscillations — Δν ≈ 135 μHz spacing.",
    unit: "5min",
    sampleRate: 1,
    series: compose(N_STELLAR, [
      { period: 60 / 0.135, amp: 1.0 },      // ν_max anchor
      { period: 60 / 0.27, amp: 0.7 },
      { period: 60 / 0.405, amp: 0.4 },
    ], 0.4, 201),
    knownPeriod: 60 / 0.135,
    methods: ["spectrum", "harmonic", "timeSeries"],
  },
  {
    id: "variable-cepheid",
    scope: "stellar",
    label: "Cepheid Variable Light Curve",
    description: "Classical Cepheid with sharp rise / slow decline.",
    unit: "day",
    sampleRate: 4,
    series: (() => {
      const N = 1024;
      const period = 5.4 * 4;
      const out: number[] = [];
      for (let i = 0; i < N; i++) {
        const phase = (i % period) / period;
        out.push(phase < 0.25 ? -1 + phase * 8 : 1 - (phase - 0.25) / 0.75 * 2);
      }
      return out;
    })(),
    knownPeriod: 5.4 * 4,
    methods: ["spectrum", "harmonic", "timeSeries"],
  },
  {
    id: "starspot-rotation",
    scope: "stellar",
    label: "Starspot Rotation Modulation",
    description: "Photometric dip pattern from rotating active region.",
    unit: "day",
    sampleRate: 1,
    series: compose(N_STELLAR, [
      { period: 25.4, amp: 0.6 },             // rotation
      { period: 11 * 365.25, amp: 0.3 },      // activity cycle
    ], 0.1, 211),
    knownPeriod: 25.4,
    methods: ["spectrum", "timeSeries", "correlation"],
  },
];

// ───────── Galactic ─────────
const N_GAL = 1024;
const galactic: Dataset[] = [
  {
    id: "galactic-orbit",
    scope: "galactic",
    label: "Solar Galactic Orbit (z-height)",
    description: "Vertical oscillation through the galactic plane (~30 Myr).",
    unit: "Myr",
    sampleRate: 1,
    series: compose(N_GAL, [
      { period: 225, amp: 0.4 },              // galactic year
      { period: 30, amp: 1.0 },               // vertical
      { period: 60, amp: 0.3 },               // arm crossings
    ], 0.1, 301),
    knownPeriod: 30,
    methods: ["spectrum", "timeSeries", "correlation"],
  },
  {
    id: "cosmic-ray-flux",
    scope: "galactic",
    label: "Cosmic Ray Flux at Earth",
    description: "Anti-correlated with solar cycle; modulated by arm passage.",
    unit: "yr",
    sampleRate: 1,
    series: compose(N_GAL, [
      { period: 11, amp: 1.0, phase: Math.PI },
      { period: 22, amp: 0.4 },
      { period: 145, amp: 0.6 },              // Spiral arm crossing residue
    ], 0.2, 311),
    knownPeriod: 11,
    methods: ["spectrum", "timeSeries", "correlation"],
  },
  {
    id: "arm-density",
    scope: "galactic",
    label: "Local ISM Density along orbit",
    description: "Sun's passage through spiral arms shows density spikes.",
    unit: "Myr",
    sampleRate: 1,
    series: compose(N_GAL, [
      { period: 60, amp: 1.0 },
      { period: 225, amp: 0.5 },
    ], 0.15, 321).map((v) => Math.max(0, v + 1)),
    knownPeriod: 60,
    methods: ["spectrum", "timeSeries"],
  },
];

// ───────── Universal (cross-scale orbital harmonics) ─────────
// Planetary orbital periods (years) for ratio analysis.
export const ORBITAL_PERIODS: { name: string; periodYears: number }[] = [
  { name: "Mercury", periodYears: 0.2408 },
  { name: "Venus", periodYears: 0.6152 },
  { name: "Earth", periodYears: 1.0 },
  { name: "Mars", periodYears: 1.8809 },
  { name: "Jupiter", periodYears: 11.862 },
  { name: "Saturn", periodYears: 29.457 },
  { name: "Uranus", periodYears: 84.011 },
  { name: "Neptune", periodYears: 164.79 },
];

const N_UNI = 1024;
const universal: Dataset[] = [
  {
    id: "solar-system-beat",
    scope: "universal",
    label: "Solar-System Composite Beat",
    description: "Sum of planetary orbital sines — exposes resonance overtones.",
    unit: "yr",
    sampleRate: 4,
    series: (() => {
      const N = N_UNI;
      const out: number[] = [];
      const dt = 0.25;
      for (let i = 0; i < N; i++) {
        const t = i * dt;
        let v = 0;
        for (const p of ORBITAL_PERIODS) {
          v += Math.sin((2 * Math.PI * t) / p.periodYears) / Math.sqrt(p.periodYears);
        }
        out.push(v);
      }
      return out;
    })(),
    knownPeriod: 11.86 * 4,
    methods: ["spectrum", "harmonic", "timeSeries"],
  },
  {
    id: "jupiter-saturn",
    scope: "universal",
    label: "Jupiter–Saturn Conjunction Beat",
    description: "Classic 2:5 near-resonance — Great Conjunction every ~19.86 yr.",
    unit: "yr",
    sampleRate: 4,
    series: (() => {
      const N = 1024, dt = 0.25;
      const out: number[] = [];
      for (let i = 0; i < N; i++) {
        const t = i * dt;
        out.push(Math.sin((2 * Math.PI * t) / 11.862) + Math.sin((2 * Math.PI * t) / 29.457));
      }
      return out;
    })(),
    knownPeriod: 19.86 * 4,
    methods: ["spectrum", "harmonic", "timeSeries", "correlation"],
  },
];

// ───────── Cosmological ─────────
// CMB angular power spectrum Cℓ — ΛCDM-like, peaks at ℓ ≈ 220, 540, 800.
const cosmological: Dataset[] = [
  {
    id: "cmb-cl",
    scope: "cosmological",
    label: "CMB Angular Power Spectrum",
    description: "Acoustic peaks in the temperature-temperature angular spectrum.",
    unit: "ℓ",
    sampleRate: 1,
    series: (() => {
      const out: number[] = [];
      const peaks = [{ l: 220, w: 70, a: 5800 }, { l: 540, w: 100, a: 2600 }, { l: 810, w: 110, a: 2400 }, { l: 1120, w: 130, a: 1500 }, { l: 1420, w: 160, a: 900 }];
      for (let l = 2; l < 1500; l++) {
        let v = 200 / Math.sqrt(l);
        for (const p of peaks) v += p.a * Math.exp(-Math.pow((l - p.l) / p.w, 2));
        v *= Math.exp(-l / 1800);
        out.push(v);
      }
      return out;
    })(),
    knownPeriod: 220,
    methods: ["spectrum", "spherical", "pattern"],
  },
  {
    id: "bao",
    scope: "cosmological",
    label: "Baryon Acoustic Oscillations",
    description: "Galaxy two-point correlation showing the ~150 Mpc BAO bump.",
    unit: "Mpc",
    sampleRate: 0.2,
    series: (() => {
      const out: number[] = [];
      for (let i = 0; i < 400; i++) {
        const r = i * 5;
        const power = 30 / Math.pow(r + 5, 0.6) + 0.6 * Math.exp(-Math.pow((r - 150) / 18, 2));
        out.push(power);
      }
      return out;
    })(),
    knownPeriod: 150,
    methods: ["spectrum", "pattern"],
  },
  {
    id: "primordial",
    scope: "cosmological",
    label: "Primordial Power P(k)",
    description: "Near-scale-invariant n_s ≈ 0.965 spectrum with turnover.",
    unit: "h/Mpc",
    sampleRate: 100,
    series: (() => {
      const out: number[] = [];
      for (let i = 1; i < 1024; i++) {
        const k = i / 100;
        out.push(Math.pow(k, 0.965) / (1 + Math.pow(k / 0.02, 2)));
      }
      return out;
    })(),
    methods: ["spectrum", "pattern"],
  },
];

export const DATASETS: Dataset[] = [
  ...planetary,
  ...solar,
  ...stellar,
  ...galactic,
  ...universal,
  ...cosmological,
];

export function getDataset(id: string): Dataset | undefined {
  return DATASETS.find((d) => d.id === id);
}

export function datasetsByScope(scope: Scope): Dataset[] {
  return DATASETS.filter((d) => d.scope === scope);
}

export const SCOPES: { id: Scope; label: string; tagline: string }[] = [
  { id: "planetary", label: "Planetary", tagline: "Earth-system fields & oscillations" },
  { id: "solar", label: "Solar", tagline: "Sun & heliosphere dynamics" },
  { id: "stellar", label: "Stellar", tagline: "Asteroseismology & variability" },
  { id: "galactic", label: "Galactic", tagline: "Milky Way context & cycles" },
  { id: "universal", label: "Universal", tagline: "Cross-scale harmonic ratios" },
  { id: "cosmological", label: "Cosmological", tagline: "CMB, BAO, large-scale structure" },
];

export const METHODS: { id: AnalyticalMethod; label: string; description: string }[] = [
  { id: "spectrum", label: "Spectrum (Fourier)", description: "Power spectrum + dominant peaks" },
  { id: "harmonic", label: "Harmonic Ladder", description: "Fundamental + overtones with ratios" },
  { id: "timeSeries", label: "Time Series", description: "Raw signal + autocorrelation" },
  { id: "correlation", label: "Cross-Correlation", description: "Compare two datasets with lag" },
  { id: "spherical", label: "Spherical Harmonics", description: "Yₗᵐ field decomposition (3D)" },
  { id: "pattern", label: "Pattern / Peaks", description: "Detected peaks and motifs" },
];
