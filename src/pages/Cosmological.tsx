import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommonsIcon } from "@/components/CommonsIcon";
import { CosmoStage, CosmoLayer } from "@/components/cosmological/CosmoStage";
import { NightSkyBackground } from "@/components/NightSkyBackground";


const HudPanel = ({ children, className = "", topBar = false }: { children: React.ReactNode; className?: string; glow?: string; topBar?: boolean }) => (
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
      style={{
        background: "linear-gradient(90deg, transparent, hsla(210,40%,50%,0.15), transparent)",
      }}
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

interface LayerSpec {
  key: CosmoLayer;
  card: string;
  title: string;
  question: string;
  metrics: { label: string; value: string; unit?: string }[];
}

const LAYERS: LayerSpec[] = [
  {
    key: "cmb",
    card: "Cosmic Background",
    title: "Cosmic Microwave Background",
    question: "What was the original pattern from which later structures emerged?",
    metrics: [
      { label: "Universe Age", value: "13.787", unit: "Gyr" },
      { label: "CMB Temperature", value: "2.7255", unit: "K" },
      { label: "ΔT / T", value: "10⁻⁵", unit: "" },
      { label: "Acoustic Peaks", value: "5", unit: "modes" },
    ],
  },
  {
    key: "constants",
    card: "Cosmic Laws",
    title: "Fundamental Constants",
    question: "What underlying rules make complex structures possible?",
    metrics: [
      { label: "Speed of Light", value: "2.998×10⁸", unit: "m/s" },
      { label: "Gravitational G", value: "6.674×10⁻¹¹", unit: "" },
      { label: "Planck ℎ", value: "6.626×10⁻³⁴", unit: "J·s" },
      { label: "Fine Structure α", value: "1/137.036", unit: "" },
    ],
  },
  {
    key: "spacetime",
    card: "Cosmic Web",
    title: "Large-Scale Structure",
    question: "What geometric architecture supports cosmic evolution?",
    metrics: [
      { label: "Hubble Constant", value: "67.4", unit: "km/s/Mpc" },
      { label: "Expansion Rate", value: "+0.7", unit: "%/Gyr" },
      { label: "Observable Universe", value: "93", unit: "Gly" },
      { label: "Ω_total", value: "1.000", unit: "flat" },
    ],
  },
  {
    key: "harmonics",
    card: "Acoustic Oscillations",
    title: "Baryon Acoustic Oscillations",
    question: "What original resonant modes shaped large-scale organization?",
    metrics: [
      { label: "BAO Scale", value: "150", unit: "Mpc" },
      { label: "Harmonic Modes", value: "5", unit: "peaks" },
      { label: "1st Peak ℓ", value: "220", unit: "" },
      { label: "Power Spectrum", value: "ΛCDM", unit: "" },
    ],
  },
];

interface LayerInfo {
  seeing: string;
  why: string[];
  interact: string[];
}

const LAYER_INFO: Record<CosmoLayer, LayerInfo> = {
  cmb: {
    seeing: "The Cosmic Microwave Background — light released 380,000 years after the Big Bang. Tiny temperature variations (ΔT/T ≈ 10⁻⁵) mark the seeds of every later structure.",
    why: [
      "The CMB power spectrum is a literal Yₗᵐ decomposition of the early universe.",
      "Its acoustic peaks are standing-wave modes frozen into the plasma — the universe's first chord.",
      "Every later harmonic — galactic, solar, planetary — inherits this initial pattern.",
    ],
    interact: [
      "Patches show the dipole and small-scale anisotropies.",
      "Acoustic Peaks metric counts the resonant modes detected.",
      "Compare with Acoustic Oscillations to see the same peaks at galaxy scale.",
    ],
  },
  constants: {
    seeing: "The fixed numerical values — c, G, ℎ, α — that set the strength of every interaction.",
    why: [
      "Constants set which harmonic ratios are stable enough to form atoms, stars, and planets.",
      "Small shifts in α or G would erase the resonances that life depends on.",
      "They define the tuning of the universal instrument before any note is played.",
    ],
    interact: [
      "Values listed in the metric rail are the current measured constants.",
      "Each constant gates one class of structure (atomic, gravitational, electromagnetic).",
      "Compare with Cosmic Web to see what these constants build.",
    ],
  },
  spacetime: {
    seeing: "The cosmic web — filaments, walls, and voids of galaxy clusters spanning hundreds of millions of light-years.",
    why: [
      "The web is the largest standing-wave pattern in the observable universe.",
      "Its geometry is set by the BAO scale and dark-matter dynamics.",
      "Every galaxy sits on a node of this resonant scaffold.",
    ],
    interact: [
      "Filament strands trace the densest regions.",
      "Hubble Constant and Observable Universe metrics anchor the scale.",
      "Cross-reference with Acoustic Oscillations — the web inherits the BAO peak.",
    ],
  },
  harmonics: {
    seeing: "Baryon Acoustic Oscillations — the same acoustic peaks visible in the CMB, frozen into the present-day distribution of galaxies at a characteristic ~150 Mpc scale.",
    why: [
      "BAO is the direct fossil of the early universe's standing-wave modes.",
      "It links the CMB's Yₗᵐ peaks to the geometry of the cosmic web.",
      "Confirms that the universe carries its harmonic signature forward at every epoch.",
    ],
    interact: [
      "Concentric rings show the BAO standard ruler.",
      "BAO Scale and 1st Peak ℓ in the metric rail.",
      "Compare with Cosmic Background — same peaks, different epoch.",
    ],
  },
};



const Cosmological = () => {
  const navigate = useNavigate();
  const [layer, setLayer] = useState<CosmoLayer>("cmb");
  const active = LAYERS.find((l) => l.key === layer)!;

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <NightSkyBackground />



      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none px-4 pt-6">
        <HudPanel className="pointer-events-auto px-4 py-4 flex items-center justify-between" topBar>
          <div>
            <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-foreground/90">Cosmological Intelligence</h1>
            <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/50 mt-0.5">
              ΛCDM Framework · Initial Conditions of the Observable Universe
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
              <button onClick={() => navigate("/planetary")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Planetary</button>
              <button onClick={() => navigate("/?view=hgs")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Solar</button>
              <button onClick={() => navigate("/stellar")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Stellar</button>
              <button onClick={() => navigate("/galactic")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Galactic</button>
              <button onClick={() => navigate("/universal")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Universal</button>
              <button className="min-w-[120px] text-center px-4 py-2.5 rounded-xl text-[11px] font-semibold tracking-[0.18em] uppercase" style={ACTIVE_BTN_STYLE}>Cosmological</button>

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
            Cosmological Layers
          </div>
          {LAYERS.map((l) => {
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
                  {String(LAYERS.indexOf(l) + 1).padStart(2, "0")}
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
      <div className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none pt-28 pb-44 lg:pl-[260px] lg:pr-[300px] px-4">
        <div className="pointer-events-auto w-full max-w-[820px] aspect-square relative">
          <CosmoStage layer={layer} />
        </div>
      </div>

      {/* Right rail — context */}
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
          {/* Mobile layer pills */}
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
            Foundational architecture · read-only · {active.title}
          </p>
        </HudPanel>
      </div>
    </div>
  );
};

export default Cosmological;
