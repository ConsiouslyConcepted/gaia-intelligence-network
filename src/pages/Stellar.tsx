import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CommonsIcon } from "@/components/CommonsIcon";
import { NightSkyBackground } from "@/components/NightSkyBackground";


const HudPanel = ({ children, className = "", topBar = false }: { children: React.ReactNode; className?: string; topBar?: boolean }) => (
  <div
    className={`relative rounded-xl backdrop-blur-2xl ${className}`}
    style={{
      background:
        "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
      border: "1.5px solid hsla(220,35%,60%,0.55)",
      boxShadow:
        "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 32px hsla(210,75%,62%,0.28), 0 0 64px hsla(210,70%,55%,0.18), 0 12px 40px rgba(0,0,0,0.55)",
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

type StellarLayer = "neighborhood" | "classification" | "lifecycle" | "exoplanets";

interface LayerSpec {
  key: StellarLayer;
  card: string;
  title: string;
  question: string;
  metrics: { label: string; value: string; unit?: string }[];
}

const LAYERS: LayerSpec[] = [
  {
    key: "neighborhood",
    card: "Local Neighborhood",
    title: "Stars Within 10 Parsecs",
    question: "What stars surround the Sun within 33 light-years?",
    metrics: [
      { label: "Nearest Star", value: "Proxima Centauri", unit: "" },
      { label: "Distance", value: "4.24", unit: "ly" },
      { label: "Stars Within 10 pc", value: "~370", unit: "" },
      { label: "Mean Separation", value: "~4", unit: "ly" },
    ],
  },
  {
    key: "classification",
    card: "Stellar Classification",
    title: "Spectral Types · OBAFGKM",
    question: "How are stars categorized by temperature and luminosity?",
    metrics: [
      { label: "Sun Spectral Class", value: "G2V", unit: "" },
      { label: "Sun Surface Temp", value: "5,778", unit: "K" },
      { label: "Most Common Class", value: "M", unit: "dwarf" },
      { label: "Local M-Dwarf Share", value: "~75", unit: "%" },
    ],
  },
  {
    key: "lifecycle",
    card: "Stellar Lifecycle",
    title: "Birth · Main Sequence · Death",
    question: "How do stars evolve from nebula to remnant?",
    metrics: [
      { label: "Sun Age", value: "4.6", unit: "Gyr" },
      { label: "Main Sequence Left", value: "~5", unit: "Gyr" },
      { label: "Sun End State", value: "White Dwarf", unit: "" },
      { label: "Massive Star End", value: "Supernova", unit: "" },
    ],
  },
  {
    key: "exoplanets",
    card: "Exoplanetary Systems",
    title: "Planets Beyond the Sun",
    question: "How common are planets around nearby stars?",
    metrics: [
      { label: "Confirmed Exoplanets", value: "5,800+", unit: "" },
      { label: "Systems", value: "4,300+", unit: "" },
      { label: "Habitable-Zone Candidates", value: "~60", unit: "" },
      { label: "Nearest Exoplanet", value: "Proxima b", unit: "4.24 ly" },
    ],
  },
];

interface LayerInfo {
  seeing: string;
  why: string[];
  interact: string[];
}

const LAYER_INFO: Record<StellarLayer, LayerInfo> = {
  neighborhood: {
    seeing: "The Sun sits in a sparse cluster of ~370 stars within 10 parsecs. Proxima Centauri is the nearest at 4.24 ly; most neighbors are faint red dwarfs.",
    why: [
      "Nearby stars set the local gravitational and radiation environment around the Solar System.",
      "Close-passage stars perturb the Oort Cloud and modulate long-period comet flux.",
      "This is the first scale above the Solar System where external stellar dynamics become a factor.",
    ],
    interact: [
      "Reference the metric rail for nearest-star distance and local star density.",
      "Switch to Classification to see what types these neighbors are.",
      "Use Exoplanets to see which neighbors host known planetary systems.",
    ],
  },
  classification: {
    seeing: "The OBAFGKM spectral sequence orders stars by surface temperature, from hot blue O-class to cool red M-class. The Sun is a G2V main-sequence dwarf.",
    why: [
      "Spectral class fixes a star's luminosity, lifetime, and habitable-zone distance.",
      "Stellar mass and class determine the long-term frequency spectrum a star emits.",
      "Most nearby stars are M-dwarfs — long-lived, low-luminosity, and the dominant class by count.",
    ],
    interact: [
      "Metric rail shows the Sun's class and surface temperature.",
      "Compare against M-dwarf prevalence to see how typical the Sun is.",
      "Switch to Lifecycle to see how class governs evolution.",
    ],
  },
  lifecycle: {
    seeing: "Stars form from molecular clouds, fuse hydrogen for most of their lives, then leave the main sequence as red giants, white dwarfs, neutron stars, or black holes.",
    why: [
      "Stellar lifecycles seed the galaxy with heavier elements — the input material for planets and life.",
      "Mass dictates lifespan: M-dwarfs last trillions of years, O-stars only millions.",
      "End-states (supernovae, neutron mergers) drive the largest-scale energy and metal injection in the galaxy.",
    ],
    interact: [
      "Metric rail shows the Sun's age and remaining main-sequence time.",
      "Compare Sun end-state with massive-star end-state to see mass dependence.",
      "Cross-reference Classification to map class to lifecycle path.",
    ],
  },
  exoplanets: {
    seeing: "Over 5,800 confirmed exoplanets across 4,300+ systems. Most stars host at least one planet; many systems include small worlds in or near the habitable zone.",
    why: [
      "Planet occurrence shows the Solar System is one realization of a common pattern, not a unique case.",
      "Orbital architectures of other systems test how robust the Solar System's resonances are.",
      "Habitable-zone candidates frame the search for biosignatures and external biospheres.",
    ],
    interact: [
      "Metric rail tracks confirmed counts and the nearest known exoplanet.",
      "Switch to Neighborhood to see which nearby stars host these systems.",
      "Use Classification to see which spectral types dominate the host list.",
    ],
  },
};

const Stellar = () => {
  const navigate = useNavigate();
  const [layer, setLayer] = useState<StellarLayer>("neighborhood");
  const active = LAYERS.find((l) => l.key === layer)!;

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <NightSkyBackground />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none px-4 pt-6">
        <HudPanel className="pointer-events-auto px-4 py-4 flex items-center justify-between" topBar>
          <div>
            <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-foreground/90">Stellar Intelligence</h1>
            <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/50 mt-0.5">
              Local Stellar Neighborhood · Spectral Classes · Exoplanetary Systems
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
              <button onClick={() => navigate("/planetary")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Planetary</button>
              <button onClick={() => navigate("/planetary?view=hgs")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Solar</button>
              <button className="text-center px-2.5 py-2 xl:px-4 xl:py-2.5 xl:min-w-[120px] whitespace-nowrap rounded-xl text-[11px] font-semibold tracking-[0.18em] uppercase" style={ACTIVE_BTN_STYLE}>Stellar</button>
              <button onClick={() => navigate("/galactic")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Galactic</button>
              <button onClick={() => navigate("/universal")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Universal</button>
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

      {/* Left rail */}
      <div className="absolute left-4 top-32 bottom-44 z-10 pointer-events-none w-[240px] hidden lg:flex flex-col">
        <HudPanel className="pointer-events-auto p-3 flex-1 flex flex-col gap-2">
          <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 px-2 pt-1 pb-2">
            Stellar Layers
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

      {/* Center stage — simple stellar neighborhood diagram */}
      <div className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none pt-24 pb-32 lg:pl-[260px] lg:pr-[300px] px-4">
        <div className={cn(
          "pointer-events-auto relative w-full max-w-[760px] h-auto max-h-[calc(100vh-224px)]",
          layer === "neighborhood" && "aspect-square lg:w-[min(760px,calc(100vh-240px),100%)]"
        )}>
          <StellarStage layer={layer} />
        </div>
      </div>

      {/* Right rail */}
      <div className="absolute right-4 top-32 bottom-44 z-10 pointer-events-auto w-[280px] hidden lg:flex flex-col">
        <HudPanel className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">
          {(() => {
            const info = LAYER_INFO[layer];
            return (
              <>
                <div>
                  <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1">What you're seeing</div>
                  <div className="text-[12px] font-semibold tracking-[0.08em] uppercase text-foreground/90">{active.card}</div>
                  <p className="text-[10px] leading-relaxed text-muted-foreground/75 mt-2">{info.seeing}</p>
                </div>
                <div className="border-t border-border/30 pt-3">
                  <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1.5">Why it matters for cosmic harmonics</div>
                  <ul className="text-[10px] leading-relaxed text-muted-foreground/70 space-y-1.5 list-disc list-inside marker:text-foreground/40">
                    {info.why.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
                <div className="border-t border-border/30 pt-3">
                  <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1.5">How to interact</div>
                  <ul className="text-[10px] leading-relaxed text-muted-foreground/70 space-y-1 list-disc list-inside marker:text-foreground/40">
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
              <div key={m.label} className="rounded-lg p-3 border border-border/30" style={{ background: "hsla(240,20%,10%,0.6)" }}>
                <div className="text-[8px] uppercase tracking-[0.15em] text-muted-foreground/55 mb-1.5">{m.label}</div>
                <div className="text-[13px] font-mono font-semibold text-foreground/85 tabular-nums">
                  {m.value}
                  {m.unit && <span className="text-[7px] text-muted-foreground/45 ml-1 font-normal">{m.unit}</span>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[8px] tracking-[0.2em] uppercase text-muted-foreground/40 mt-2 text-center">
            Local stellar context · read-only · {active.title}
          </p>
        </HudPanel>
      </div>
    </div>
  );
};

// ---------- Stage visualizations ----------

const NEAR_STARS = [
  { name: "Proxima Centauri", ly: 4.24, color: "#cc5533", mag: 11 },
  { name: "α Cen A", ly: 4.37, color: "#ffe6a8", mag: 0 },
  { name: "α Cen B", ly: 4.37, color: "#ffba6b", mag: 1.3 },
  { name: "Barnard's Star", ly: 5.96, color: "#cc4422", mag: 9.5 },
  { name: "Wolf 359", ly: 7.86, color: "#aa3322", mag: 13 },
  { name: "Lalande 21185", ly: 8.31, color: "#cc5533", mag: 7.5 },
  { name: "Sirius A", ly: 8.6, color: "#cfe6ff", mag: -1.46 },
  { name: "Sirius B", ly: 8.6, color: "#e0e0ff", mag: 8.4 },
  { name: "Luyten 726-8", ly: 8.73, color: "#aa3322", mag: 12 },
  { name: "Ross 154", ly: 9.7, color: "#cc4422", mag: 10.4 },
  { name: "Ross 248", ly: 10.3, color: "#aa3322", mag: 12 },
  { name: "ε Eridani", ly: 10.5, color: "#ffba6b", mag: 3.7 },
  { name: "Lacaille 9352", ly: 10.7, color: "#cc5533", mag: 7.3 },
  { name: "Ross 128", ly: 11.0, color: "#cc4422", mag: 11.1 },
];

const SPECTRAL = [
  { cls: "O", color: "#9bb5ff", temp: "≥30,000 K", note: "Massive · blue · short-lived" },
  { cls: "B", color: "#aabfff", temp: "10,000–30,000 K", note: "Blue-white" },
  { cls: "A", color: "#cad7ff", temp: "7,500–10,000 K", note: "White (Sirius, Vega)" },
  { cls: "F", color: "#f8f7ff", temp: "6,000–7,500 K", note: "Yellow-white" },
  { cls: "G", color: "#fff4ea", temp: "5,200–6,000 K", note: "Yellow · the Sun" },
  { cls: "K", color: "#ffd2a1", temp: "3,700–5,200 K", note: "Orange" },
  { cls: "M", color: "#ffcc6f", temp: "2,400–3,700 K", note: "Red dwarf · most common" },
];

const LIFECYCLE_STAGES = [
  { name: "Nebula", desc: "Collapsing molecular cloud" },
  { name: "Protostar", desc: "Gravitational contraction" },
  { name: "Main Sequence", desc: "Hydrogen fusion · stable" },
  { name: "Red Giant", desc: "Hydrogen shell burning" },
  { name: "End State", desc: "White dwarf · neutron star · black hole" },
];

function StellarStage({ layer }: { layer: StellarLayer }) {
  if (layer === "neighborhood") {
    const size = 760;
    const cx = size / 2;
    const cy = size / 2;
    const rMax = size * 0.42;
    const lyMax = 12;
    return (
      <div className="w-full h-full">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
          {[2, 5, 8, 10].map((ly) => (
            <g key={ly}>
              <circle cx={cx} cy={cy} r={(ly / lyMax) * rMax} fill="none" stroke="hsla(200,40%,70%,0.18)" strokeDasharray="3 4" />
              <text x={cx + (ly / lyMax) * rMax + 4} y={cy - 4} fill="hsla(200,40%,75%,0.5)" fontSize="9" fontFamily="ui-monospace, monospace">{ly} ly</text>
            </g>
          ))}
          {/* Sun */}
          <circle cx={cx} cy={cy} r="6" fill="#ffe87a" />
          <text x={cx + 10} y={cy + 4} fill="hsla(0,0%,100%,0.85)" fontSize="10" fontFamily="ui-monospace, monospace">Sun</text>

          {NEAR_STARS.map((s, i) => {
            const angle = (i / NEAR_STARS.length) * Math.PI * 2 + 0.3;
            const r = (s.ly / lyMax) * rMax;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            const dotR = s.mag < 3 ? 4.5 : s.mag < 8 ? 3 : 2;
            return (
              <g key={s.name}>
                <line x1={cx} y1={cy} x2={x} y2={y} stroke="hsla(200,40%,70%,0.08)" />
                <circle cx={x} cy={y} r={dotR} fill={s.color} />
                <text x={x + 6} y={y + 3} fill="hsla(0,0%,100%,0.7)" fontSize="8" fontFamily="ui-monospace, monospace">{s.name}</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  if (layer === "classification") {
    return (
      <div className="w-full h-full flex flex-col justify-start gap-2 px-2 py-2 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 text-center mb-2">
          OBAFGKM Spectral Sequence — hot ⟶ cool
        </div>
        {SPECTRAL.map((s) => (
          <div key={s.cls} className="flex items-center gap-4 rounded-lg p-2 border border-border/25" style={{ background: "hsla(240,20%,10%,0.6)" }}>
            <div
              className="flex items-center justify-center rounded-full font-bold font-mono text-foreground/90"
              style={{ width: 56, height: 56, background: s.color, color: "#101428", boxShadow: `0 0 24px ${s.color}88` }}
            >
              {s.cls}
            </div>
            <div className="flex-1">
              <div className="text-[12px] font-semibold tracking-[0.1em] uppercase text-foreground/85">Class {s.cls}{s.cls === "G" && " · Sun"}</div>
              <div className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">{s.temp}</div>
              <div className="text-[10px] text-muted-foreground/60 mt-0.5">{s.note}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (layer === "lifecycle") {
    return (
      <div className="w-full h-full flex flex-col justify-start gap-3 px-2 py-2 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 text-center mb-2">
          Stellar Lifecycle — Sun-mass track
        </div>
        {LIFECYCLE_STAGES.map((s, i) => (
          <div key={s.name} className="flex items-center gap-4 rounded-lg p-3 border border-border/25" style={{ background: "hsla(240,20%,10%,0.6)" }}>
            <div className="text-[10px] font-mono text-muted-foreground/55 w-6 text-right">{String(i + 1).padStart(2, "0")}</div>
            <div className="flex-1">
              <div className="text-[12px] font-semibold tracking-[0.1em] uppercase text-foreground/85">{s.name}</div>
              <div className="text-[10px] text-muted-foreground/65 mt-0.5">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // exoplanets
  return (
    <div className="w-full h-full flex flex-col justify-start gap-4 px-2 py-2 overflow-y-auto">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 text-center">
        Exoplanetary Systems — confirmed detections (NASA Exoplanet Archive)
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Confirmed planets", value: "5,800+" },
          { label: "Planetary systems", value: "4,300+" },
          { label: "Multi-planet systems", value: "1,000+" },
          { label: "Habitable-zone candidates", value: "~60" },
          { label: "Transit method", value: "~75%" },
          { label: "Radial-velocity", value: "~19%" },
        ].map((c) => (
          <div key={c.label} className="rounded-lg p-4 border border-border/25" style={{ background: "hsla(240,20%,10%,0.6)" }}>
            <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/60 mb-1.5">{c.label}</div>
            <div className="text-[20px] font-mono font-semibold text-foreground/90">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg p-4 border border-border/25" style={{ background: "hsla(240,20%,10%,0.6)" }}>
        <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/60 mb-1.5">Nearest known exoplanet</div>
        <div className="text-[13px] font-semibold tracking-[0.08em] uppercase text-foreground/85">Proxima Centauri b</div>
        <div className="text-[10px] text-muted-foreground/70 mt-1">Terrestrial-mass planet · 4.24 ly · orbits in the M-dwarf habitable zone (~11.2-day period).</div>
      </div>
    </div>
  );
}

export default Stellar;
