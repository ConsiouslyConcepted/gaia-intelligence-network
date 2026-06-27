// Harmonic Analysis Engine — pure analytical functions.
// All methods are deterministic, in-process, and dependency-free.

export type Complex = { re: number; im: number };

// ───────── FFT (Cooley–Tukey, radix-2) ─────────

function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

export function fft(input: number[]): Complex[] {
  const N = nextPow2(input.length);
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  for (let i = 0; i < input.length; i++) re[i] = input[i];

  // bit-reversal permutation
  for (let i = 1, j = 0; i < N; i++) {
    let bit = N >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }

  for (let len = 2; len <= N; len <<= 1) {
    const half = len >> 1;
    const ang = (-2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < N; i += len) {
      let cRe = 1, cIm = 0;
      for (let k = 0; k < half; k++) {
        const tRe = cRe * re[i + k + half] - cIm * im[i + k + half];
        const tIm = cRe * im[i + k + half] + cIm * re[i + k + half];
        re[i + k + half] = re[i + k] - tRe;
        im[i + k + half] = im[i + k] - tIm;
        re[i + k] += tRe;
        im[i + k] += tIm;
        const nRe = cRe * wRe - cIm * wIm;
        cIm = cRe * wIm + cIm * wRe;
        cRe = nRe;
      }
    }
  }

  const out: Complex[] = new Array(N);
  for (let i = 0; i < N; i++) out[i] = { re: re[i], im: im[i] };
  return out;
}

// ───────── Spectral analysis ─────────

export interface SpectrumBin {
  freq: number;        // cycles per unit time (sampleRate units)
  period: number;      // 1 / freq
  magnitude: number;   // |X(k)|
  power: number;       // magnitude²
}

export interface Spectrum {
  bins: SpectrumBin[];
  sampleRate: number;  // samples per unit time
  unit: string;        // e.g. "yr", "day"
  peaks: SpectrumBin[];
  fundamental: SpectrumBin | null;
}

function detrend(series: number[]): number[] {
  const n = series.length;
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) { sx += i; sy += series[i]; sxx += i * i; sxy += i * series[i]; }
  const slope = (n * sxy - sx * sy) / Math.max(n * sxx - sx * sx, 1e-9);
  const intercept = (sy - slope * sx) / n;
  return series.map((v, i) => v - (slope * i + intercept));
}

function hann(n: number, N: number): number {
  return 0.5 * (1 - Math.cos((2 * Math.PI * n) / (N - 1)));
}

export function spectrum(series: number[], sampleRate = 1, unit = "tick"): Spectrum {
  if (series.length < 4) {
    return { bins: [], sampleRate, unit, peaks: [], fundamental: null };
  }
  const dt = detrend(series);
  const N = dt.length;
  const windowed = dt.map((v, i) => v * hann(i, N));
  const X = fft(windowed);
  const M = X.length;
  const bins: SpectrumBin[] = [];
  for (let k = 1; k < M / 2; k++) {
    const re = X[k].re, im = X[k].im;
    const mag = Math.sqrt(re * re + im * im) / N;
    const freq = (k * sampleRate) / M;
    bins.push({ freq, period: freq > 1e-9 ? 1 / freq : Infinity, magnitude: mag, power: mag * mag });
  }
  // peak picking — local maxima above 0.5 × mean
  const meanP = bins.reduce((a, b) => a + b.power, 0) / Math.max(bins.length, 1);
  const peaks: SpectrumBin[] = [];
  for (let i = 1; i < bins.length - 1; i++) {
    if (bins[i].power > bins[i - 1].power && bins[i].power > bins[i + 1].power && bins[i].power > meanP * 1.2) {
      peaks.push(bins[i]);
    }
  }
  peaks.sort((a, b) => b.power - a.power);
  return { bins, sampleRate, unit, peaks: peaks.slice(0, 8), fundamental: peaks[0] ?? null };
}

// ───────── Autocorrelation ─────────

export function autocorrelation(series: number[], maxLag?: number): number[] {
  const n = series.length;
  const mean = series.reduce((a, b) => a + b, 0) / n;
  const dev = series.map((v) => v - mean);
  const denom = dev.reduce((a, b) => a + b * b, 0) || 1;
  const L = maxLag ?? Math.floor(n / 2);
  const out: number[] = [];
  for (let k = 0; k < L; k++) {
    let s = 0;
    for (let i = 0; i < n - k; i++) s += dev[i] * dev[i + k];
    out.push(s / denom);
  }
  return out;
}

// ───────── Cross-correlation with lag ─────────

export interface CrossCorrelation {
  lags: number[];        // negative = b leads a
  values: number[];      // correlation per lag
  bestLag: number;
  bestR: number;
}

export function crossCorrelation(a: number[], b: number[], maxLag?: number): CrossCorrelation {
  const n = Math.min(a.length, b.length);
  const ma = a.reduce((s, v) => s + v, 0) / n;
  const mb = b.reduce((s, v) => s + v, 0) / n;
  const da = a.map((v) => v - ma);
  const db = b.map((v) => v - mb);
  const sa = Math.sqrt(da.reduce((s, v) => s + v * v, 0)) || 1;
  const sb = Math.sqrt(db.reduce((s, v) => s + v * v, 0)) || 1;
  const L = maxLag ?? Math.floor(n / 3);
  const lags: number[] = [];
  const values: number[] = [];
  let bestLag = 0, bestR = 0;
  for (let lag = -L; lag <= L; lag++) {
    let s = 0, count = 0;
    for (let i = 0; i < n; i++) {
      const j = i + lag;
      if (j < 0 || j >= n) continue;
      s += da[i] * db[j];
      count++;
    }
    const r = count > 0 ? s / (sa * sb) : 0;
    lags.push(lag);
    values.push(r);
    if (Math.abs(r) > Math.abs(bestR)) { bestR = r; bestLag = lag; }
  }
  return { lags, values, bestLag, bestR };
}

// ───────── Harmonic ladder / ratio matching ─────────

export interface HarmonicRow {
  n: number;          // overtone index (1 = fundamental)
  period: number;
  freq: number;
  ratioLabel: string; // n:1 vs fundamental
}

export function harmonicLadder(fundamentalPeriod: number, count = 8): HarmonicRow[] {
  if (!isFinite(fundamentalPeriod) || fundamentalPeriod <= 0) return [];
  const out: HarmonicRow[] = [];
  for (let n = 1; n <= count; n++) {
    const period = fundamentalPeriod / n;
    out.push({ n, period, freq: 1 / period, ratioLabel: `${n}:1` });
  }
  return out;
}

/** Match a numeric ratio to the closest small-integer ratio (Stern–Brocot search). */
export function nearestRatio(value: number, maxDen = 12): { num: number; den: number; error: number; label: string } {
  let bestNum = 1, bestDen = 1, bestErr = Math.abs(value - 1);
  for (let d = 1; d <= maxDen; d++) {
    const n = Math.round(value * d);
    if (n <= 0) continue;
    const err = Math.abs(value - n / d);
    if (err < bestErr) { bestErr = err; bestNum = n; bestDen = d; }
  }
  const g = gcd(bestNum, bestDen);
  bestNum /= g; bestDen /= g;
  return { num: bestNum, den: bestDen, error: bestErr, label: `${bestNum}:${bestDen}` };
}

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }

/** Map a frequency ratio to the closest 12-TET musical interval. */
export const MUSICAL_INTERVALS = [
  { label: "Unison", semitones: 0, ratio: "1:1" },
  { label: "Minor 2nd", semitones: 1, ratio: "16:15" },
  { label: "Major 2nd", semitones: 2, ratio: "9:8" },
  { label: "Minor 3rd", semitones: 3, ratio: "6:5" },
  { label: "Major 3rd", semitones: 4, ratio: "5:4" },
  { label: "Perfect 4th", semitones: 5, ratio: "4:3" },
  { label: "Tritone", semitones: 6, ratio: "45:32" },
  { label: "Perfect 5th", semitones: 7, ratio: "3:2" },
  { label: "Minor 6th", semitones: 8, ratio: "8:5" },
  { label: "Major 6th", semitones: 9, ratio: "5:3" },
  { label: "Minor 7th", semitones: 10, ratio: "7:4" },
  { label: "Major 7th", semitones: 11, ratio: "15:8" },
  { label: "Octave", semitones: 12, ratio: "2:1" },
];

export function nearestInterval(freqRatio: number): { interval: typeof MUSICAL_INTERVALS[number]; cents: number; deviation: number } {
  const folded = freqRatio < 1 ? 1 / freqRatio : freqRatio;
  const semis = 12 * Math.log2(folded);
  const idx = Math.max(0, Math.min(12, Math.round(semis)));
  const interval = MUSICAL_INTERVALS[idx];
  const cents = (semis - idx) * 100;
  return { interval, cents, deviation: Math.abs(cents) };
}
