import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CommonsIcon } from "@/components/CommonsIcon";
import { NightSkyBackground } from "@/components/NightSkyBackground";
import CosmicAddressWorkspace from "@/components/mission-control/CosmicAddressWorkspace";

import { useChordPlayer } from "@/hooks/useChordPlayer";
import { useNOAASolarCycle } from "@/hooks/usePlanetaryData";
import { cn } from "@/lib/utils";

const HudPanel = ({ children, className = "", topBar = false }: { children: React.ReactNode; className?: string; topBar?: boolean }) => (
  <div
    className={`relative rounded-xl backdrop-blur-2xl ${className}`}
    style={{
      background: "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
      border: "1.5px solid hsla(220,35%,60%,0.55)",
      boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 32px hsla(210,75%,62%,0.28), 0 0 64px hsla(210,70%,55%,0.18), 0 12px 40px rgba(0,0,0,0.55)",
    }}
  >
    <div
      className="absolute -top-px left-4 right-4 h-px pointer-events-none"
      style={{
        background: topBar
          ? "hsla(220,30%,55%,0.35)"
          : "linear-gradient(90deg, transparent 0%, hsla(200,60%,78%,0.55) 25%, hsla(200,60%,85%,0.75) 50%, hsla(200,60%,78%,0.55) 75%, transparent 100%)",
      }}
    />
    <div
      className="absolute bottom-0 left-6 right-6 h-px pointer-events-none"
      style={{ background: "linear-gradient(90deg, transparent, hsla(210,40%,50%,0.15), transparent)" }}
    />
    {children}
  </div>
);

const TOGGLE_BTN_BASE =
  "text-center px-2.5 py-2 xl:px-4 xl:py-2.5 xl:min-w-[120px] whitespace-nowrap rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05] hover:text-foreground/70";

const ACTIVE_BTN_STYLE: React.CSSProperties = {
  background: "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
  color: "hsla(0,0%,100%,0.95)",
  border: "1.5px solid hsla(220,35%,60%,0.55)",
  boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 32px hsla(210,75%,62%,0.28), 0 0 64px hsla(210,70%,55%,0.18), 0 12px 40px rgba(0,0,0,0.55)",
};

type UniversalLayer = "address" | "cycles" | "ratios" | "wave";

interface LayerSpec {
  key: UniversalLayer;
  card: string;
  title: string;
  question: string;
  metrics: { label: string; value: string; unit?: string }[];
}

const LAYERS: LayerSpec[] = [
  {
    key: "address",
    card: "Cosmic Address",
    title: "Earth's Place in the Universe",
    question: "Where is Earth situated in the universe?",
    metrics: [
      { label: "Local Bubble", value: "~300", unit: "ly" },
      { label: "Orion Arm Width", value: "~3,500", unit: "ly" },
      { label: "Local Group", value: "~10", unit: "Mly" },
      { label: "Observable Universe", value: "93", unit: "Gly" },
    ],
  },
  {
    key: "cycles",
    card: "Harmonic Cycles",
    title: "Dewey's Pattern of Periods",
    question: "Why do natural cycles cluster at related periods?",
    metrics: [
      { label: "Foundational Period", value: "17.75", unit: "yr" },
      { label: "Sunspot Cycle", value: "11.08", unit: "yr" },
      { label: "Common Multipliers", value: "×2 ×3", unit: "" },
    ],
  },
  {
    key: "ratios",
    card: "Musical Ratios",
    title: "Pythagoras to Tomes",
    question: "What ratios govern resonance across scales?",
    metrics: [
      { label: "Octave", value: "2:1", unit: "" },
      { label: "Fifth", value: "3:2", unit: "" },
      { label: "Major Third", value: "5:4", unit: "" },
      { label: "Harmonic Seventh", value: "7:4", unit: "" },
    ],
  },
  {
    key: "wave",
    card: "Wave Structure",
    title: "Tomes Harmonics Theory",
    question: "Does the universe itself have a wave architecture?",
    metrics: [
      { label: "Scales Unified", value: "Cell → Galaxy", unit: "" },
      { label: "Cascade Steps", value: "n × (2,3,5,7)", unit: "" },
      { label: "Field", value: "Non-linear", unit: "" },
      { label: "Prediction", value: "Discrete scales", unit: "" },
    ],
  },
];

interface LayerInfo {
  title: string;
  seeing: string;
  why: string[];
  interact: string[];
}

const LAYER_INFO: Record<UniversalLayer, LayerInfo> = {
  address: {
    title: "Cosmic Address",
    seeing: "Ten nested wireframe shells, logarithmically spaced from Earth out to the Observable Universe.",
    why: [
      "Every resonator's size sets the frequencies it can hold.",
      "Earth, Sun, Galaxy, and cosmic web each carry the same Yₗᵐ math at different scales.",
      "Locates you physically before the harmonic math begins.",
    ],
    interact: [
      "Drag to orbit · scroll to zoom.",
      "Hover a shell for its name and size.",
      "Outer shells rotate slower — period scales with size.",
    ],
  },
  cycles: {
    title: "Harmonic Cycles",
    seeing: "Edward Dewey's catalog of natural periods — geology, climate, biology, markets — plotted as dots. The gold row at 17.75 years is the foundation; every other row is a small-integer multiple of it.",
    why: [
      "Unrelated systems cluster at the same periods, consistent with one underlying harmonic series.",
      "Multipliers ×2, ×3, ×5, ×7 — the integers behind musical consonance — appear throughout.",
      "Live sunspot data anchors the pattern to a verifiable system.",
    ],
    interact: [
      "Rows pulse with the frame clock.",
      "Right-column labels map each row to a known cycle.",
      "Compare with Musical Ratios — same integers.",
    ],
  },
  ratios: {
    title: "Musical Ratios",
    seeing: "Pythagorean intervals as live waveforms. Each row is a small-integer ratio over a 220 Hz base.",
    why: [
      "Musical consonance follows the same arithmetic as orbital resonance: 2:1, 3:2, 4:3, 5:4.",
      "Planet-pair distance ratios collapse to these same intervals (right column).",
      "Hearing the chord is the most direct test of the ratio.",
    ],
    interact: [
      "Click a row to play base + interval.",
      "Click again to stop; click another row to switch.",
      "Waveforms animate at the actual frequency ratio.",
    ],
  },
  wave: {
    title: "Wave Structure",
    seeing: "A cascade of nested waves — fundamental on top, harmonics 1–4 below — under a shared amplitude envelope.",
    why: [
      "Tomes' Harmonics Theory models the universe as one nonlinear standing wave with indefinitely nested harmonics.",
      "It predicts discrete preferred scales — galaxies, stars, planets, cells, atoms — at integer multiples.",
      "Explains why cycles, ratios, and spherical modes repeat at every scale.",
    ],
    interact: [
      "Higher harmonics oscillate faster — sub-octaves of one root.",
      "Each doubling (n=1, 2, 4, 8) is one octave.",
      "Bridges the Ratios layer (math) and Harmonics layer (modes).",
    ],
  },
};

// ───────── Cosmic Address (3D) ─────────
const AddressView = () => (
  <div className="w-full h-full">
    <CosmicAddressWorkspace />
  </div>
);


// ───────── Harmonic Cycles (Dewey table) with cross-references ─────────
const FOUNDATION_YR = 17.75;

type CycleDot = {
  yr: number;
  driver: string;   // physical/observational driver
};
type CycleRow = {
  label: string;    // right-side band label
  driver: string;   // one-line description for tooltip fallback
  dots: CycleDot[];
  emphasis?: boolean;
};

const DEWEY_ROWS: CycleRow[] = [
  {
    label: "Gleissberg envelope",
    driver: "Long solar activity envelope modulating sunspot maxima.",
    dots: [
      { yr: 142.0, driver: "Gleissberg upper octave" },
      { yr: 213.9, driver: "Suess / de Vries solar" },
      { yr: 319.5, driver: "Bray climate cycle" },
      { yr: 479.3, driver: "Hallstatt millennial solar" },
    ],
  },
  {
    label: "Climate / drought",
    driver: "Multi-decadal drought & ocean oscillation clusters.",
    dots: [
      { yr: 71.0, driver: "AMO half-cycle" },
      { yr: 106.5, driver: "Gleissberg lower octave" },
      { yr: 159.8, driver: "Drought megacycle" },
    ],
  },
  {
    label: "Brückner climate",
    driver: "Brückner temperature/precipitation cycle.",
    dots: [
      { yr: 35.5, driver: "Brückner cycle" },
      { yr: 53.3, driver: "Brückner ×3 harmonic" },
    ],
  },
  {
    label: "Foundation",
    driver: "17.75 yr · Lunar nodal 18.6 · Saros 18.03 — the anchor of the ladder.",
    emphasis: true,
    dots: [
      { yr: 17.75, driver: "Dewey foundational period" },
    ],
  },
  {
    label: "ENSO band",
    driver: "ENSO envelope & sunspot fractional harmonics.",
    dots: [
      { yr: 5.92, driver: "Foundation ÷3 · ENSO band" },
      { yr: 8.88, driver: "Foundation ÷2 · Hale sub-harmonic" },
    ],
  },
  {
    label: "QBO / ENSO",
    driver: "Stratospheric QBO and El Niño / La Niña rhythms.",
    dots: [
      { yr: 1.97, driver: "QBO ~2.2 yr" },
      { yr: 2.96, driver: "Foundation ÷6" },
      { yr: 4.44, driver: "ENSO 3-5 yr band" },
    ],
  },
  {
    label: "Annual · biennial",
    driver: "Annual insolation and biennial atmospheric coupling.",
    dots: [
      { yr: 0.66, driver: "Semi-annual monsoon" },
      { yr: 0.99, driver: "Annual insolation" },
      { yr: 1.48, driver: "Foundation ÷12" },
      { yr: 2.22, driver: "Biennial oscillation" },
    ],
  },
  {
    label: "Seasonal · lunar",
    driver: "Seasonal, lunar-monthly and sub-monthly rhythms.",
    dots: [
      { yr: 0.22, driver: "Lunar ~80 d" },
      { yr: 0.33, driver: "Seasonal quarter" },
      { yr: 0.49, driver: "Half year" },
      { yr: 0.74, driver: "9-month gestation" },
      { yr: 1.11, driver: "Annual +10%" },
    ],
  },
];

// Nearest small-integer multiplier of foundation (× or ÷), for a compact ratio label.
function foundationRatio(yr: number): string {
  const r = yr / FOUNDATION_YR;
  if (r >= 1) {
    const n = Math.round(r);
    const err = Math.abs(r - n) / r;
    return err < 0.15 ? `×${n}` : `×${r.toFixed(1)}`;
  }
  const n = Math.round(1 / r);
  const err = Math.abs(1 / r - n) * r;
  return err < 0.15 ? `÷${n}` : `÷${(1 / r).toFixed(1)}`;
}

// Fractional year for phase computation.
function fractionalYear(now: Date): number {
  const y = now.getUTCFullYear();
  const start = Date.UTC(y, 0, 1);
  const next = Date.UTC(y + 1, 0, 1);
  return y + (now.getTime() - start) / (next - start);
}

// Musical mapping vs foundation (relative frequency = FOUNDATION_YR / yr, fold to octave).
const INTERVAL_NAMES = [
  "Unison", "Minor 2nd", "Major 2nd", "Minor 3rd", "Major 3rd", "Perfect 4th",
  "Tritone", "Perfect 5th", "Minor 6th", "Major 6th", "Minor 7th", "Major 7th", "Octave",
];
function nearestInterval(yr: number): string {
  let ratio = FOUNDATION_YR / yr;
  while (ratio >= 2) ratio /= 2;
  while (ratio < 1) ratio *= 2;
  const semis = 12 * Math.log2(ratio);
  const idx = Math.max(0, Math.min(12, Math.round(semis)));
  const cents = Math.round((semis - idx) * 100);
  return `${INTERVAL_NAMES[idx]} (${cents >= 0 ? "+" : ""}${cents}¢)`;
}

const CyclesView = ({ tick }: { tick: number }) => {
  const { data: solarCycle } = useNOAASolarCycle();
  const latestSSN = solarCycle?.[solarCycle.length - 1]?.ssn;

  // viewBox: wider to give room for right-side labels + ratio column.
  const VB_X = -1.15;
  const VB_W = 2.55;
  const now = new Date();
  const fy = fractionalYear(now);
  const epoch = 2000; // arbitrary but consistent phase reference

  return (
    <svg viewBox={`${VB_X} -1 ${VB_W} 2`} className="w-full h-full">
      {/* Foundation baseline */}
      <line x1={-1.05} y1="0" x2={1.4} y2="0"
        stroke="hsla(45,60%,70%,0.25)" strokeWidth={0.004} strokeDasharray="0.024 0.02" />

      {DEWEY_ROWS.map((row, i) => {
        const y = -0.68 + (i / (DEWEY_ROWS.length - 1)) * 1.42;
        return (
          <g key={i}>
            {row.dots.map((d, k) => {
              const x = -0.88 + (k / 5) * 1.5;
              const pulse = row.emphasis ? 1 + Math.sin(tick * 1.5) * 0.15 : 1;
              const size = 0.026 + Math.min(d.yr, 100) * 0.00022;

              // live phase: fraction of the current period completed
              const phase = (((fy - epoch) % d.yr) + d.yr) % d.yr / d.yr;
              const arcR = size * pulse + 0.018;
              const arcAngle = phase * Math.PI * 2;
              const ax = x + arcR * Math.sin(arcAngle);
              const ay = y - arcR * Math.cos(arcAngle);
              const largeArc = phase > 0.5 ? 1 : 0;
              const arcPath =
                `M ${x} ${y - arcR} A ${arcR} ${arcR} 0 ${largeArc} 1 ${ax} ${ay}`;

              const ratio = foundationRatio(d.yr);
              const interval = nearestInterval(d.yr);

              return (
                <g key={k}>
                  {/* live phase arc */}
                  <circle cx={x} cy={y} r={arcR}
                    fill="none" stroke="hsla(200,40%,70%,0.15)" strokeWidth={0.003} />
                  <path d={arcPath}
                    fill="none"
                    stroke={row.emphasis ? "hsla(45,90%,80%,0.9)" : "hsla(190,70%,75%,0.75)"}
                    strokeWidth={0.006} strokeLinecap="round" />
                  {/* phase head marker */}
                  <circle cx={ax} cy={ay} r={0.008}
                    fill={row.emphasis ? "hsla(45,95%,88%,1)" : "hsla(190,90%,88%,0.95)"} />

                  {/* dot */}
                  <circle
                    cx={x} cy={y} r={size * pulse}
                    fill={row.emphasis ? "hsla(45,90%,75%,0.9)" : "hsla(200,65%,70%,0.6)"}
                    stroke="hsla(200,50%,80%,0.45)"
                    strokeWidth={0.002}
                    style={{ cursor: "help" }}
                  >
                    <title>
                      {`${d.yr} yr — ${d.driver}\nRatio vs 17.75 yr foundation: ${ratio}\nHarmonic interval: ${interval}\nCurrent phase: ${Math.round(phase * 100)}%`}
                    </title>
                  </circle>

                  {/* ratio chip above dot */}
                  <text x={x} y={y - size * pulse - 0.026} fontSize="0.026" textAnchor="middle"
                    fill={row.emphasis ? "hsla(45,90%,85%,0.95)" : "hsla(45,50%,78%,0.55)"}
                    style={{ fontFamily: "monospace", letterSpacing: "0.06em" }}>
                    {ratio}
                  </text>

                  {/* period value below dot */}
                  <text x={x} y={y + size * pulse + 0.05} fontSize="0.032" textAnchor="middle"
                    fill={row.emphasis ? "hsla(45,90%,88%,0.98)" : "hsla(0,0%,100%,0.72)"}
                    style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>
                    {d.yr < 1 ? d.yr.toFixed(2) : d.yr.toFixed(d.yr < 10 ? 2 : 1)}
                  </text>
                </g>
              );
            })}

            {/* right-side band label */}
            <text x={1.4} y={y + 0.012} fontSize="0.032" textAnchor="end"
              fill={row.emphasis ? "hsla(45,80%,82%,0.85)" : "hsla(200,40%,78%,0.65)"}
              style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>
              {row.label}
            </text>
          </g>
        );
      })}

      <text x={0.125} y="-0.94" fontSize="0.038" fill="hsla(0,0%,100%,0.6)" textAnchor="middle" style={{ letterSpacing: "0.18em" }}>
        DEWEY · COMMON CYCLE PERIODS (years)
      </text>
      <text x={0.125} y="-0.88" fontSize="0.022" fill="hsla(200,40%,70%,0.5)" textAnchor="middle" style={{ letterSpacing: "0.24em", textTransform: "uppercase" }}>
        Hover a dot · live phase arcs · ratios to 17.75 yr foundation
      </text>

      <text x={0.125} y="0.92" fontSize="0.034" fill="hsla(45,70%,75%,0.7)" textAnchor="middle" style={{ letterSpacing: "0.15em" }}>
        Foundation 17.75 yr · ratios ×2 ×3 ×5 ×7
      </text>
      {latestSSN !== undefined && (
        <text x={0.125} y="0.975" fontSize="0.03" fill="hsla(200,70%,80%,0.7)" textAnchor="middle"
          style={{ letterSpacing: "0.18em" }}>
          LIVE · CURRENT SUNSPOT NUMBER {Math.round(latestSSN)} · CYCLE 25
        </text>
      )}
    </svg>
  );
};

// ───────── Musical Ratios (clickable, audible) ─────────
const RATIOS = [
  { label: "Unison", ratio: "1:1", value: 1, link: "Self-resonance" },
  { label: "Octave", ratio: "2:1", value: 2, link: "Saturn ↔ Neptune ≈ 1:2" },
  { label: "Fifth", ratio: "3:2", value: 1.5, link: "Jupiter ↔ Saturn 5:2 · planetary spine" },
  { label: "Fourth", ratio: "4:3", value: 1.333, link: "Earth-day vs lunar tide" },
  { label: "Maj 3rd", ratio: "5:4", value: 1.25, link: "Venus ↔ Earth pent-symmetry" },
  { label: "Min 3rd", ratio: "6:5", value: 1.2, link: "Mercury ↔ Venus ≈ 5:2" },
  { label: "Harm 7th", ratio: "7:4", value: 1.75, link: "Blue note · cosmic dissonance" },
];

const BASE_FREQ = 220; // A3 anchor

const RatiosView = ({ tick }: { tick: number }) => {
  const { play, stop, chordId, isPlaying } = useChordPlayer();
  return (
    <div className="w-full h-full flex flex-col px-5 py-6 overflow-hidden">
      <div className="text-center mb-3 shrink-0">
        <div className="text-[11px] tracking-[0.22em] uppercase text-foreground/80 font-semibold">
          Harmonic Ratios · Click a Row to Hear
        </div>
        <div className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground/55 mt-1">
          Base A3 · 220 Hz — base tone plus ratio interval play together
        </div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col justify-center gap-1.5 w-full max-w-[760px] mx-auto">
        {RATIOS.map((r, i) => {
          const id = `ratio-${r.label}`;
          const playing = isPlaying && chordId === id;
          const freq = r.value * 4;
          const handle = () => { if (playing) { stop(); return; } play(id, [BASE_FREQ, BASE_FREQ * r.value], 4); };
          const pts: string[] = [];
          const N = 80;
          for (let k = 0; k <= N; k++) {
            const x = k / N;
            const px = x * 100;
            const amp = 14 * Math.sin(x * Math.PI);
            const py = 20 + Math.sin(x * Math.PI * freq + tick * 1.8) * amp;
            pts.push(`${k === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`);
          }
          return (
            <button
              key={r.label}
              onClick={handle}
              className="grid items-center rounded-lg px-3 py-2 border transition-all duration-300 text-left w-full"
              style={{
                gridTemplateColumns: "28px 96px 52px minmax(0,1fr) minmax(0,1.4fr)",
                gap: "12px",
                background: playing ? "hsla(45,60%,40%,0.14)" : "hsla(240,20%,10%,0.45)",
                borderColor: playing ? "hsla(45,80%,70%,0.6)" : "hsla(220,30%,40%,0.25)",
                boxShadow: playing ? "0 0 22px hsla(45,80%,60%,0.18)" : undefined,
              }}
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full border"
                style={{
                  borderColor: playing ? "hsla(45,90%,75%,0.7)" : "hsla(220,30%,55%,0.4)",
                  background: playing ? "hsla(45,80%,60%,0.25)" : "hsla(228,40%,8%,0.6)",
                }}>
                {playing
                  ? <span className="block w-1.5 h-2 rounded-sm" style={{ background: "hsla(45,90%,82%,0.95)" }} />
                  : <span className="block w-0 h-0" style={{
                      borderLeft: "6px solid hsla(0,0%,100%,0.75)",
                      borderTop: "4px solid transparent",
                      borderBottom: "4px solid transparent",
                      marginLeft: "2px",
                    }} />}
              </span>
              <span className="text-[11px] font-semibold tracking-[0.15em] uppercase truncate"
                style={{ color: playing ? "hsla(45,90%,88%,0.98)" : "hsla(0,0%,100%,0.88)" }}>
                {r.label}
              </span>
              <span className="text-[12px] font-mono tabular-nums"
                style={{ color: playing ? "hsla(45,85%,82%,0.95)" : "hsla(200,60%,80%,0.85)" }}>
                {r.ratio}
              </span>
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-7">
                <line x1="0" y1="20" x2="100" y2="20" stroke="hsla(220,30%,40%,0.25)" strokeWidth="0.3" />
                <path d={pts.join(" ")} fill="none"
                  stroke={playing ? "hsla(45,95%,80%,0.95)" : `hsla(${200 + i * 8},65%,72%,0.7)`}
                  strokeWidth={playing ? "1.2" : "0.9"} />
              </svg>
              <span className="text-[10px] tracking-[0.1em] uppercase leading-tight truncate"
                style={{ color: "hsla(200,40%,78%,0.7)" }}>
                {r.link}
              </span>
            </button>
          );
        })}
      </div>
      <div className="text-center mt-3 text-[9px] tracking-[0.2em] uppercase text-muted-foreground/45 shrink-0">
        Pythagoras · Galilei · Tomes — small-integer ratios echo across orbital pairs
      </div>
    </div>
  );
};

// ───────── Wave Structure ─────────
const WaveView = ({ tick }: { tick: number }) => {
  const W = 2.0;
  // Cascading harmonics
  const cascades = 5;
  return (
    <svg viewBox={`${-W / 2 - 0.08} -1 ${W + 0.16} 2`} className="w-full h-full">
      {Array.from({ length: cascades }).map((_, i) => {
        const y = -0.7 + i * 0.32;
        const freq = Math.pow(2, i) * 1.2;
        const amp = 0.13 / (i * 0.5 + 1);
        const pts: string[] = [];
        const N = 200;
        for (let k = 0; k <= N; k++) {
          const x = k / N;
          const px = -0.9 + x * 1.8;
          const env = Math.exp(-Math.pow((x - 0.5) * 2.5, 2));
          const py = y + Math.sin(x * Math.PI * freq * 2 - tick * 1.5) * amp * env;
          pts.push(`${k === 0 ? "M" : "L"} ${px.toFixed(4)} ${py.toFixed(4)}`);
        }
        return (
          <g key={i}>
            <path d={pts.join(" ")} fill="none"
              stroke={`hsla(${200 + i * 8},70%,${80 - i * 5}%,${0.75 - i * 0.1})`}
              strokeWidth={0.005 - i * 0.0005}
            />
            <text x={-0.95} y={y + 0.012} fontSize="0.034" textAnchor="end" fill="hsla(0,0%,100%,0.5)" style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>
              n={Math.pow(2, i)}
            </text>
            <text x={0.95} y={y + 0.012} fontSize="0.032" textAnchor="start" fill="hsla(45,60%,75%,0.55)" style={{ letterSpacing: "0.1em" }}>
              {i === 0 ? "FUNDAMENTAL" : `HARMONIC ${i}`}
            </text>
          </g>
        );
      })}
      <text x="0" y="-0.92" fontSize="0.04" fill="hsla(0,0%,100%,0.55)" textAnchor="middle" style={{ letterSpacing: "0.18em" }}>
        WAVE BEGETS WAVE · TOMES HARMONICS THEORY
      </text>
      <text x="0" y="0.96" fontSize="0.032" fill="hsla(0,0%,100%,0.45)" textAnchor="middle" style={{ letterSpacing: "0.12em" }}>
        Each wave develops harmonically related waves; each of these does the same.
      </text>
    </svg>
  );
};

const LayerStage = ({ layer, tick }: { layer: UniversalLayer; tick: number }) => {
  if (layer === "address") return <AddressView />;
  if (layer === "cycles") return <CyclesView tick={tick} />;
  if (layer === "ratios") return <RatiosView tick={tick} />;
  return <WaveView tick={tick} />;
};

const Universal = () => {
  const navigate = useNavigate();
  const [layer, setLayer] = useState<UniversalLayer>("address");
  const active = LAYERS.find((l) => l.key === layer)!;

  const [tick, setTick] = useState(0);
  const raf = useRef<number>();
  useEffect(() => {
    const start = performance.now();
    const loop = (now: number) => {
      setTick((now - start) / 1000);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <NightSkyBackground />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none px-4 pt-6">
        <HudPanel className="pointer-events-auto px-4 py-4 flex items-center justify-between" topBar>
          <div>
            <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-foreground/90">Universal Intelligence</h1>
            <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/50 mt-0.5">
              Cosmic Address · Harmonic Cycles · Wave Structure of the Universe
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex gap-1 xl:gap-1.5 rounded-2xl p-1 xl:p-1.5 overflow-x-auto max-w-full"
              style={{
                background: "hsla(228,40%,5%,0.6)",
                border: "1px solid hsla(220,40%,65%,0.5)",
                boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.08), inset 0 -1px 0 rgba(0,0,0,0.4), 0 0 24px hsla(210,70%,60%,0.28), 0 0 48px hsla(210,70%,55%,0.18), 0 12px 32px rgba(0,0,0,0.5)",
                backdropFilter: "blur(12px)",
              }}
            >
              <button onClick={() => navigate("/")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Home</button>
              <button onClick={() => navigate("/planetary")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Planetary</button>
              <button onClick={() => navigate("/planetary?view=hgs")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Solar</button>
              <button onClick={() => navigate("/stellar")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Stellar</button>
              <button onClick={() => navigate("/galactic")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Galactic</button>
              <button onClick={() => navigate("/cosmological")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Cosmological</button>
              <button className="text-center px-2.5 py-2 xl:px-4 xl:py-2.5 xl:min-w-[120px] whitespace-nowrap rounded-xl text-[11px] font-semibold tracking-[0.18em] uppercase" style={ACTIVE_BTN_STYLE}>Universal</button>
              <button onClick={() => navigate("/harmonics")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(45,100%,75%,0.7)" }}>Analysis</button>

            </div>

            <button
              onClick={() => navigate("/commons")}
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 hover:bg-foreground/[0.06]"
              style={{ color: "hsla(0,0%,100%,0.75)", border: "1px solid hsla(220,30%,55%,0.35)", background: "hsla(240,25%,8%,0.5)", boxShadow: "inset 0 1px 0 hsla(200,60%,78%,0.18), inset 0 0 6px hsla(210,50%,60%,0.08), 0 0 14px -4px hsla(210,60%,65%,0.2)" }}
              title="Planetary Commons Data"
            >
              <CommonsIcon size={20} />
            </button>
          </div>
        </HudPanel>
      </div>

      {/* Left rail — layer selector */}
      <div className="absolute left-4 top-32 bottom-44 z-10 pointer-events-none w-[240px] hidden lg:flex flex-col">
        <HudPanel className="pointer-events-auto p-3 flex-1 flex flex-col gap-2">
          <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 px-2 pt-1 pb-2">
            Universal Layers
          </div>
          {LAYERS.map((l, idx) => {
            const isActive = l.key === layer;
            return (
              <button
                key={l.key}
                onClick={() => setLayer(l.key)}
                className="text-left rounded-lg p-3 border transition-all duration-300"
                style={{
                  background: isActive ? "hsla(210,50%,18%,0.75)" : "hsla(240,20%,10%,0.5)",
                  borderColor: isActive ? "hsla(200,70%,70%,0.6)" : "hsla(220,30%,40%,0.25)",
                  boxShadow: isActive ? "inset 0 1px 0 hsla(200,60%,80%,0.15), 0 0 20px hsla(200,70%,60%,0.22)" : undefined,
                }}
              >
                <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-foreground/85">
                  {l.card}
                </div>
                <div className="text-[9px] text-muted-foreground/55 mt-1">{l.title}</div>
              </button>
            );
          })}
        </HudPanel>
      </div>

      {/* Center stage */}
      <div className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none pt-40 pb-44 lg:pl-[260px] lg:pr-[300px] px-4">
        <div
          className={cn(
            "pointer-events-auto relative",
            layer === "address"
              ? "w-full h-[calc(100vh-300px)] p-6 flex items-center justify-center"
              : "aspect-square w-[min(880px,calc(100vh-260px),100%)]"
          )}
          style={{ filter: "drop-shadow(0 0 30px hsla(210,70%,55%,0.18))" }}
        >
          <LayerStage layer={layer} tick={tick} />
        </div>
      </div>

      {/* Right rail — context for every layer (+ controls for Spherical Harmonics) */}
      <div className="absolute right-4 top-32 bottom-44 z-10 pointer-events-auto w-[280px] hidden lg:flex flex-col">
        <HudPanel className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">
          {(() => {
            const info = LAYER_INFO[layer];
            return (
              <>
                <div>
                  <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1">What you're seeing</div>
                  <div className="text-[13px] font-semibold tracking-[0.08em] uppercase text-foreground/90">{info.title}</div>
                  <p className="text-[10px] leading-relaxed text-muted-foreground mt-2">{info.seeing}</p>
                </div>

                <div className="border-t border-border/30 pt-3">
                  <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1.5">Why this matters</div>
                  <ul className="text-[10px] leading-relaxed text-muted-foreground space-y-1.5 list-disc list-inside marker:text-foreground/40">
                    {info.why.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>

                <div className="border-t border-border/30 pt-3">
                  <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1.5">How to interact</div>
                  <ul className="text-[10px] leading-relaxed text-muted-foreground space-y-1 list-disc list-inside marker:text-foreground/40">
                    {info.interact.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>

              </>
            );
          })()}
        </HudPanel>
      </div>


      {/* Bottom metric rail */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none px-4 pb-6">
        <HudPanel className="pointer-events-auto p-3">
          <div className="flex lg:hidden gap-1.5 mb-3 overflow-x-auto">
            {LAYERS.map((l) => {
              const isActive = l.key === layer;
              return (
                <button
                  key={l.key}
                  onClick={() => setLayer(l.key)}
                  className="px-3 py-1.5 rounded-md text-[9px] tracking-[0.15em] uppercase whitespace-nowrap border transition-all"
                  style={{
                    background: isActive ? "hsla(210,50%,18%,0.75)" : "hsla(240,20%,10%,0.5)",
                    borderColor: isActive ? "hsla(200,70%,70%,0.6)" : "hsla(220,30%,40%,0.25)",
                    color: isActive ? "hsla(0,0%,100%,0.95)" : "hsla(0,0%,100%,0.5)",
                  }}
                >
                  {l.card}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {active.metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-lg p-3 border border-border/30"
                style={{ background: "hsla(240,20%,10%,0.6)" }}
              >
                <div className="text-[8px] uppercase tracking-[0.15em] text-muted-foreground/55 mb-1.5">
                  {m.label}
                </div>
                <div className="text-[13px] font-mono font-semibold text-foreground/85 tabular-nums">
                  {m.value}
                  {m.unit && <span className="text-[7px] text-muted-foreground/45 ml-1 font-normal">{m.unit}</span>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[8px] tracking-[0.2em] uppercase text-muted-foreground/40 mt-2 text-center">
            {active.question} · read-only · {active.title}
          </p>
        </HudPanel>
      </div>
    </div>
  );
};

export default Universal;
