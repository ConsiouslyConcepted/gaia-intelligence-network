import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Square } from "lucide-react";
import { CommonsIcon } from "@/components/CommonsIcon";
import { NightSkyBackground } from "@/components/NightSkyBackground";
import { CosmicAddress3D } from "@/components/universal/CosmicAddress3D";
import { SphericalHarmonics3D } from "@/components/universal/SphericalHarmonics3D";
import { useChordPlayer } from "@/hooks/useChordPlayer";
import { useNOAASolarCycle } from "@/hooks/usePlanetaryData";

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
  "min-w-[120px] text-center px-4 py-2.5 rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05] hover:text-foreground/70";

const ACTIVE_BTN_STYLE: React.CSSProperties = {
  background: "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
  color: "hsla(0,0%,100%,0.95)",
  border: "1.5px solid hsla(220,35%,60%,0.55)",
  boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 32px hsla(210,75%,62%,0.28), 0 0 64px hsla(210,70%,55%,0.18), 0 12px 40px rgba(0,0,0,0.55)",
};

type UniversalLayer = "address" | "cycles" | "ratios" | "wave" | "harmonics";

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
  {
    key: "harmonics",
    card: "Spherical Harmonics",
    title: "Yₗᵐ — Modes of the Sphere",
    question: "What are the resonant modes of a 3D sphere?",
    metrics: [
      { label: "Family", value: "Yₗᵐ(θ,φ)", unit: "" },
      { label: "Degree ℓ", value: "0 → ∞", unit: "" },
      { label: "Order m", value: "−ℓ → +ℓ", unit: "" },
      { label: "Multiplicity", value: "2ℓ + 1", unit: "modes" },
    ],
  },
];

// ───────── Cosmic Address (3D) ─────────
const AddressView = () => <CosmicAddress3D />;

// ───────── Harmonic Cycles (Dewey table) ─────────
const DEWEY_ROWS: { years: number[]; emphasis?: boolean }[] = [
  { years: [142.0, 213.9, 319.5, 479.3] },
  { years: [71.0, 106.5, 159.8] },
  { years: [35.5, 53.3] },
  { years: [17.75], emphasis: true },
  { years: [5.92, 8.88] },
  { years: [1.97, 2.96, 4.44] },
  { years: [0.66, 0.99, 1.48, 2.22] },
  { years: [0.22, 0.33, 0.49, 0.74, 1.11] },
];

const CyclesView = ({ tick }: { tick: number }) => {
  const W = 2.0;
  return (
    <svg viewBox={`${-W / 2 - 0.08} -1 ${W + 0.16} 2`} className="w-full h-full">
      {/* Central anchor period */}
      <line x1={-W / 2} y1="0" x2={W / 2} y2="0" stroke="hsla(220,30%,50%,0.15)" strokeWidth={0.004} strokeDasharray="0.02 0.015" />
      {DEWEY_ROWS.map((row, i) => {
        const y = -0.85 + (i / (DEWEY_ROWS.length - 1)) * 1.7;
        return (
          <g key={i}>
            {row.years.map((yr, k) => {
              const x = -0.85 + (k / 5) * 1.7;
              const pulse = row.emphasis ? 1 + Math.sin(tick * 1.5) * 0.15 : 1;
              const size = 0.035 + Math.min(yr, 100) * 0.0008;
              return (
                <g key={k}>
                  <circle
                    cx={x} cy={y} r={size * pulse}
                    fill={row.emphasis ? "hsla(45,90%,75%,0.85)" : "hsla(200,65%,70%,0.55)"}
                    stroke="hsla(200,50%,80%,0.4)"
                    strokeWidth={0.002}
                  />
                  <text x={x} y={y + 0.075} fontSize="0.038" textAnchor="middle"
                    fill={row.emphasis ? "hsla(45,90%,85%,0.95)" : "hsla(0,0%,100%,0.7)"}
                    style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>
                    {yr < 1 ? yr.toFixed(2) : yr.toFixed(yr < 10 ? 2 : 1)}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
      <text x="0" y="-0.93" fontSize="0.04" fill="hsla(0,0%,100%,0.55)" textAnchor="middle" style={{ letterSpacing: "0.18em" }}>
        DEWEY · COMMON CYCLE PERIODS (years)
      </text>
      <text x="0" y="0.97" fontSize="0.034" fill="hsla(45,70%,75%,0.65)" textAnchor="middle" style={{ letterSpacing: "0.15em" }}>
        Foundation 17.75 yr · ratios ×2 ×3 ×5 ×7
      </text>
    </svg>
  );
};

// ───────── Musical Ratios ─────────
const RATIOS = [
  { label: "Unison", ratio: "1:1", value: 1 },
  { label: "Octave", ratio: "2:1", value: 2 },
  { label: "Fifth", ratio: "3:2", value: 1.5 },
  { label: "Fourth", ratio: "4:3", value: 1.333 },
  { label: "Maj 3rd", ratio: "5:4", value: 1.25 },
  { label: "Min 3rd", ratio: "6:5", value: 1.2 },
  { label: "Harm 7th", ratio: "7:4", value: 1.75 },
];

const RatiosView = ({ tick }: { tick: number }) => {
  const W = 2.0;
  return (
    <svg viewBox={`${-W / 2 - 0.08} -1 ${W + 0.16} 2`} className="w-full h-full">
      {/* string vibrations */}
      {RATIOS.map((r, i) => {
        const y = -0.75 + i * 0.22;
        const freq = r.value * 4;
        const pts: string[] = [];
        const N = 120;
        for (let k = 0; k <= N; k++) {
          const x = k / N;
          const px = -0.85 + x * 1.7;
          const amp = 0.07 * Math.sin(x * Math.PI);
          const py = y + Math.sin(x * Math.PI * freq + tick * 1.8) * amp;
          pts.push(`${k === 0 ? "M" : "L"} ${px.toFixed(4)} ${py.toFixed(4)}`);
        }
        return (
          <g key={r.label}>
            <line x1={-0.88} y1={y} x2={0.88} y2={y} stroke="hsla(220,30%,40%,0.2)" strokeWidth={0.0025} />
            <path d={pts.join(" ")} fill="none" stroke={`hsla(${45 + i * 4},80%,75%,0.85)`} strokeWidth={0.005} />
            <text x={-0.93} y={y + 0.015} fontSize="0.038" textAnchor="end" fill="hsla(0,0%,100%,0.75)" style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {r.label}
            </text>
            <text x={0.93} y={y + 0.015} fontSize="0.038" textAnchor="start" fill="hsla(45,80%,80%,0.8)" style={{ fontFamily: "monospace" }}>
              {r.ratio}
            </text>
          </g>
        );
      })}
      <text x="0" y="-0.93" fontSize="0.04" fill="hsla(0,0%,100%,0.55)" textAnchor="middle" style={{ letterSpacing: "0.18em" }}>
        PYTHAGOREAN · GALILEI · TOMES INTERVAL SET
      </text>
    </svg>
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

// ───────── Spherical Harmonics Yₗᵐ ─────────
function legendreP(l: number, m: number, x: number): number {
  const am = Math.abs(m);
  let pmm = 1;
  if (am > 0) {
    const somx2 = Math.sqrt(Math.max(0, (1 - x) * (1 + x)));
    let fact = 1;
    for (let i = 1; i <= am; i++) { pmm *= -fact * somx2; fact += 2; }
  }
  if (l === am) return pmm;
  let pmmp1 = x * (2 * am + 1) * pmm;
  if (l === am + 1) return pmmp1;
  let pll = 0;
  for (let ll = am + 2; ll <= l; ll++) {
    pll = ((2 * ll - 1) * x * pmmp1 - (ll + am - 1) * pmm) / (ll - am);
    pmm = pmmp1;
    pmmp1 = pll;
  }
  return pll;
}
function Ylm(l: number, m: number, theta: number, phi: number): number {
  const p = legendreP(l, Math.abs(m), Math.cos(theta));
  if (m === 0) return p;
  if (m > 0) return p * Math.cos(m * phi);
  return p * Math.sin(-m * phi);
}

const SphHarmView = ({ tick, l, m }: { tick: number; l: number; m: number }) => {
  const spin = tick * 0.35;
  const NMer = 36; // meridians (phi)
  const NPar = 24; // parallels (theta)

  // Precompute max |Y| over a coarse grid for normalization
  let maxAbs = 1e-6;
  const SAMP = 40;
  for (let i = 0; i <= SAMP; i++) {
    const th = (i / SAMP) * Math.PI;
    for (let j = 0; j < SAMP; j++) {
      const ph = (j / SAMP) * 2 * Math.PI;
      const v = Math.abs(Ylm(l, m, th, ph));
      if (v > maxAbs) maxAbs = v;
    }
  }

  const project = (theta: number, phi: number) => {
    const y = Ylm(l, m, theta, phi);
    const r = 0.78 * (Math.abs(y) / maxAbs);
    const sx = Math.sin(theta) * Math.cos(phi);
    const sy = Math.cos(theta);
    const sz = Math.sin(theta) * Math.sin(phi);
    const rx = sx * Math.cos(spin) + sz * Math.sin(spin);
    const rz = -sx * Math.sin(spin) + sz * Math.cos(spin);
    return { x: r * rx, y: r * sy, z: rz, sign: y >= 0 ? 1 : -1, mag: Math.abs(y) / maxAbs };
  };

  // Build meridian paths (constant phi)
  const meridians: { d: string; sign: number; depth: number }[] = [];
  for (let j = 0; j < NMer; j++) {
    const phi = (j / NMer) * 2 * Math.PI;
    const pts: string[] = [];
    let signSum = 0;
    let depthSum = 0;
    let count = 0;
    for (let i = 0; i <= NPar; i++) {
      const theta = (i / NPar) * Math.PI;
      const p = project(theta, phi);
      pts.push(`${i === 0 ? "M" : "L"} ${p.x.toFixed(4)} ${(-p.y).toFixed(4)}`);
      signSum += p.sign * p.mag;
      depthSum += p.z;
      count++;
    }
    meridians.push({ d: pts.join(" "), sign: signSum / count, depth: depthSum / count });
  }

  // Build parallel paths (constant theta)
  const parallels: { d: string; sign: number; depth: number }[] = [];
  for (let i = 1; i < NPar; i++) {
    const theta = (i / NPar) * Math.PI;
    const pts: string[] = [];
    let signSum = 0;
    let depthSum = 0;
    let count = 0;
    for (let j = 0; j <= NMer; j++) {
      const phi = (j / NMer) * 2 * Math.PI;
      const p = project(theta, phi);
      pts.push(`${j === 0 ? "M" : "L"} ${p.x.toFixed(4)} ${(-p.y).toFixed(4)}`);
      signSum += p.sign * p.mag;
      depthSum += p.z;
      count++;
    }
    parallels.push({ d: pts.join(" "), sign: signSum / count, depth: depthSum / count });
  }

  const colorFor = (sign: number, depth: number) => {
    // sign: +1 warm (cream), -1 cool (blue); depth: -1 back .. +1 front
    const alpha = 0.25 + 0.55 * ((depth + 1) / 2);
    if (sign >= 0) return `hsla(45,80%,78%,${alpha.toFixed(3)})`;
    return `hsla(205,75%,72%,${alpha.toFixed(3)})`;
  };

  // Sort back-to-front for proper layering
  const all = [
    ...meridians.map((x) => ({ ...x, w: 0.0035 })),
    ...parallels.map((x) => ({ ...x, w: 0.0028 })),
  ].sort((a, b) => a.depth - b.depth);

  return (
    <svg viewBox="-1.1 -1.1 2.2 2.2" className="w-full h-full">
      {/* Subtle reference sphere */}
      <circle cx="0" cy="0" r="0.82" fill="none" stroke="hsla(220,30%,55%,0.08)" strokeWidth="0.002" strokeDasharray="0.01 0.012" />
      {all.map((p, idx) => (
        <path key={idx} d={p.d} fill="none" stroke={colorFor(p.sign, p.depth)} strokeWidth={p.w} strokeLinecap="round" />
      ))}
      <text x="0" y="-0.95" fontSize="0.045" fill="hsla(0,0%,100%,0.6)" textAnchor="middle" style={{ letterSpacing: "0.2em" }}>
        Y{<tspan baselineShift="sub" fontSize="0.028">ℓ={l}</tspan>}{<tspan baselineShift="super" fontSize="0.028">m={m}</tspan>}(θ,φ)
      </text>
      <text x="0" y="0.98" fontSize="0.032" fill="hsla(0,0%,100%,0.45)" textAnchor="middle" style={{ letterSpacing: "0.15em" }}>
        STANDING WAVES ON THE SPHERE · 2ℓ+1 = {2 * l + 1} MODES
      </text>
    </svg>
  );
};

const LayerStage = ({ layer, tick, sphL, sphM }: { layer: UniversalLayer; tick: number; sphL: number; sphM: number }) => {
  if (layer === "address") return <AddressView tick={tick} />;
  if (layer === "cycles") return <CyclesView tick={tick} />;
  if (layer === "ratios") return <RatiosView tick={tick} />;
  if (layer === "harmonics") return <SphHarmView tick={tick} l={sphL} m={sphM} />;
  return <WaveView tick={tick} />;
};

const Universal = () => {
  const navigate = useNavigate();
  const [layer, setLayer] = useState<UniversalLayer>("address");
  const [sphL, setSphL] = useState(3);
  const [sphM, setSphM] = useState(2);
  const setL = (v: number) => {
    const nl = Math.max(0, Math.min(6, v));
    setSphL(nl);
    if (Math.abs(sphM) > nl) setSphM(nl);
  };
  const setM = (v: number) => setSphM(Math.max(-sphL, Math.min(sphL, v)));
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
              className="flex gap-1.5 rounded-2xl p-1.5"
              style={{
                background: "hsla(228,40%,5%,0.6)",
                border: "1px solid hsla(220,40%,65%,0.5)",
                boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.08), inset 0 -1px 0 rgba(0,0,0,0.4), 0 0 24px hsla(210,70%,60%,0.28), 0 0 48px hsla(210,70%,55%,0.18), 0 12px 32px rgba(0,0,0,0.5)",
                backdropFilter: "blur(12px)",
              }}
            >
              <button onClick={() => navigate("/")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Planetary</button>
              <button onClick={() => navigate("/?view=hgs")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Solar</button>
              <button className="min-w-[120px] text-center px-4 py-2.5 rounded-xl text-[11px] font-semibold tracking-[0.18em] uppercase" style={ACTIVE_BTN_STYLE}>Universal</button>
              <button onClick={() => navigate("/galactic")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Galactic</button>
              <button onClick={() => navigate("/cosmological")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Cosmological</button>
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
          <div className="mt-auto pt-3 px-1">
            <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/45 mb-1.5">Premise</div>
            <p className="text-[9px] leading-relaxed text-muted-foreground/65">
              The universe has a wave structure, and each wave develops harmonically related waves — each of those does the same.
            </p>
          </div>
        </HudPanel>
      </div>

      {/* Center stage */}
      <div className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none pt-24 pb-32 lg:pl-[260px] lg:pr-4 px-4">
        <div className="pointer-events-auto relative aspect-square w-full max-w-[880px] lg:w-[min(880px,calc(100vh-180px),100%)]"
          style={{ filter: "drop-shadow(0 0 30px hsla(210,70%,55%,0.18))" }}>
          <LayerStage layer={layer} tick={tick} sphL={sphL} sphM={sphM} />
          {layer === "harmonics" && (
            <div className="absolute top-3 left-3 flex flex-col gap-2 rounded-lg p-2.5 border"
              style={{ background: "hsla(228,40%,5%,0.7)", borderColor: "hsla(220,30%,55%,0.35)", backdropFilter: "blur(8px)" }}>
              <div className="flex items-center gap-2">
                <span className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground/60 w-10">ℓ</span>
                <button onClick={() => setL(sphL - 1)} className="w-6 h-6 rounded text-[11px] text-foreground/80 border border-foreground/15 hover:bg-foreground/10">−</button>
                <span className="text-[11px] font-mono text-foreground/90 w-6 text-center tabular-nums">{sphL}</span>
                <button onClick={() => setL(sphL + 1)} className="w-6 h-6 rounded text-[11px] text-foreground/80 border border-foreground/15 hover:bg-foreground/10">+</button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground/60 w-10">m</span>
                <button onClick={() => setM(sphM - 1)} className="w-6 h-6 rounded text-[11px] text-foreground/80 border border-foreground/15 hover:bg-foreground/10">−</button>
                <span className="text-[11px] font-mono text-foreground/90 w-6 text-center tabular-nums">{sphM}</span>
                <button onClick={() => setM(sphM + 1)} className="w-6 h-6 rounded text-[11px] text-foreground/80 border border-foreground/15 hover:bg-foreground/10">+</button>
              </div>
              <div className="text-[8px] text-muted-foreground/45 tracking-wider">|m| ≤ ℓ ≤ 6</div>
            </div>
          )}
        </div>
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
