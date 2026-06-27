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

type StellarLayer = "neighborhood" | "classification" | "lifecycle" | "oscillations" | "variables" | "magnetic" | "exoplanets";

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
    card: "Light & Spectra",
    title: "Spectrum · Luminosity · Color · Temperature",
    question: "What does each star's light reveal about it?",
    metrics: [
      { label: "Sun Spectral Class", value: "G2V", unit: "" },
      { label: "Sun Surface Temp", value: "5,778", unit: "K" },
      { label: "Sun Peak Emission", value: "~500", unit: "nm" },
      { label: "Local M-Dwarf Share", value: "~75", unit: "%" },
    ],
  },
  {
    key: "lifecycle",
    card: "Evolution & Element Formation",
    title: "Stellar lifecycle · stellar nucleosynthesis",
    question: "How do stars evolve and forge the elements?",
    metrics: [
      { label: "Sun Age", value: "4.6", unit: "Gyr" },
      { label: "Main Sequence Left", value: "~5", unit: "Gyr" },
      { label: "Sun End State", value: "White Dwarf", unit: "" },
      { label: "Heavy Elements From", value: "Supernovae", unit: "" },
    ],
  },
  {
    key: "oscillations",
    card: "Stellar Oscillations",
    title: "Asteroseismology · p-mode pulsations",
    question: "How do stars vibrate and what do their modes reveal?",
    metrics: [
      { label: "Sun 5-min Mode", value: "3.1", unit: "mHz" },
      { label: "Detected Solar Modes", value: "~10,000", unit: "" },
      { label: "Kepler Oscillators", value: "~16,000", unit: "stars" },
      { label: "Method", value: "Helioseismology", unit: "" },
    ],
  },
  {
    key: "variables",
    card: "Variable Stars",
    title: "Cepheids · RR Lyrae · Eclipsing Binaries",
    question: "Which stars change brightness, and how do we use them?",
    metrics: [
      { label: "Cataloged Variables", value: "~500,000", unit: "" },
      { label: "Cepheid Period Range", value: "1–100", unit: "days" },
      { label: "Use", value: "Standard Candles", unit: "" },
      { label: "Nearest Cepheid", value: "Polaris", unit: "~433 ly" },
    ],
  },
  {
    key: "magnetic",
    card: "Magnetism & Stellar Winds",
    title: "Dynamos · Starspots · Flares · Winds",
    question: "How do stellar fields and winds shape planetary environments?",
    metrics: [
      { label: "Sun Mean Field", value: "1–2", unit: "G" },
      { label: "Sunspot Peak Field", value: "~3,000", unit: "G" },
      { label: "Solar Wind Speed", value: "300–800", unit: "km/s" },
      { label: "Magnetar Field", value: "10¹⁴", unit: "G" },
    ],
  },
  {
    key: "exoplanets",
    card: "Exoplanetary Systems",
    title: "Architecture · Habitable Zone · Resonance",
    question: "How are planetary systems arranged around other stars?",
    metrics: [
      { label: "Confirmed Exoplanets", value: "5,800+", unit: "" },
      { label: "Systems", value: "4,300+", unit: "" },
      { label: "Habitable-Zone Candidates", value: "~60", unit: "" },
      { label: "Resonant Chain Example", value: "TRAPPIST-1", unit: "" },
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
    seeing: "The Sun sits in a sparse cluster of ~370 stars within 10 parsecs, dominated by faint M-dwarfs. Proxima Centauri is the nearest at 4.24 ly.",
    why: [
      "Each nearby star is an independent oscillator — its mass and class set a distinct frequency band that couples weakly into the Solar System.",
      "Close stellar passages perturb the Oort Cloud and inject low-frequency modulation into long-period comet flux.",
      "Local star density sets the noise floor against which the Sun's own harmonic signal is read.",
    ],
    interact: [
      "Metric rail shows nearest-star distance and local density — the spacing of neighboring oscillators.",
      "Switch to Classification to see what frequency bands these neighbors emit.",
      "Cross-reference Magnetic to see which neighbors broadcast strongest in the radio band.",
    ],
  },
  classification: {
    seeing: "Every star emits a unique spectrum. The OBAFGKM sequence orders stars by surface temperature, color, and luminosity. The Sun is a G2V star peaking near 500 nm.",
    why: [
      "Light is the primary observable expression of a star — spectra encode temperature, composition, motion, and age.",
      "Peak emission wavelength follows Wien's law: hotter stars emit bluer light, cooler stars redder light.",
      "Absorption lines in a spectrum reveal which elements are present in the star's outer layers.",
    ],
    interact: [
      "Metric rail shows the Sun's class, surface temperature, and peak emission wavelength.",
      "Cross-reference Oscillations — spectral class predicts the dominant p-mode frequency band.",
      "Compare against the M-dwarf share to see which stellar type dominates the local neighborhood.",
    ],
  },
  lifecycle: {
    seeing: "Stars form from molecular clouds, fuse hydrogen on the main sequence, then evolve through red-giant, white-dwarf, neutron-star, or black-hole end states. Along the way, fusion forges the elements heavier than hydrogen.",
    why: [
      "Stellar nucleosynthesis builds the elements: H → He on the main sequence, then He → C → O → … → Fe in later stages.",
      "Elements heavier than iron form during supernovae and neutron-star mergers.",
      "The matter that makes up planets, oceans, and biology was produced by earlier generations of stars.",
    ],
    interact: [
      "Metric rail tracks the Sun's age, remaining main-sequence time, and end state.",
      "The element-formation chain below shows where each element is produced.",
      "Cross-reference Oscillations to see how a star's pulsation spectrum shifts as it evolves.",
    ],
  },
  oscillations: {
    seeing: "Stars ring like bells. Acoustic (p-mode) and gravity (g-mode) oscillations make their surfaces pulsate. The Sun's dominant p-mode sits near 3.1 mHz (~5 min period).",
    why: [
      "Asteroseismology measures these oscillations to read a star's interior structure, rotation, and composition — just as seismology does for Earth.",
      "p-mode frequencies scale as √(M/R³); g-mode periods scale with buoyancy frequency.",
      "Mode spectra have now been resolved in tens of thousands of stars by Kepler, TESS, and ground-based surveys.",
    ],
    interact: [
      "Metric rail lists the Sun's dominant frequency and detected mode count.",
      "Cross-reference Magnetism — magnetic activity modulates p-mode amplitudes.",
      "Use Light & Spectra to predict where each spectral type peaks in mode frequency.",
    ],
  },
  variables: {
    seeing: "Variable stars pulsate or eclipse on hours-to-years timescales. Cepheids and RR Lyrae follow strict period–luminosity relations.",
    why: [
      "Cepheid pulsation is a clean fundamental-mode oscillation — period directly encodes luminosity, anchoring the cosmic distance ladder.",
      "Eclipsing binaries give the most precise direct measurements of stellar masses and radii.",
      "Variable-star pulsations follow the same physics as solar p-modes, just at much larger amplitude.",
    ],
    interact: [
      "Metric rail shows catalog size and Cepheid period range.",
      "Cross-reference Oscillations — variables are the strongest standing-wave emitters.",
      "Use Light & Spectra to see which spectral bands host each variable class.",
    ],
  },
  magnetic: {
    seeing: "Stars generate magnetic fields through convective dynamo action and drive plasma outflows called stellar winds. The Sun runs at 1–2 G average, 3,000 G in sunspots, and emits a wind at 300–800 km/s.",
    why: [
      "Magnetic fields drive starspots, flares, coronal mass ejections, and long-term activity cycles like the Sun's 22-year Hale cycle.",
      "Stellar winds carry mass, angular momentum, and energy away from the star, shaping the heliosphere or astrosphere around it.",
      "Magnetic activity and wind pressure directly influence the atmospheres and habitability of orbiting planets.",
    ],
    interact: [
      "Metric rail compares field strengths from the Sun up to magnetars, plus solar wind speed.",
      "Cross-reference Exoplanets to see which stellar environments host habitable-zone candidates.",
      "Use Evolution to see how dynamo activity and wind loss change as stars age.",
    ],
  },
  exoplanets: {
    seeing: "Over 5,800 confirmed exoplanets across 4,300+ systems. Architectures range from compact multi-planet systems to wide-orbit giants, with about 60 candidates in their star's habitable zone.",
    why: [
      "The habitable zone is the orbital range where liquid water can exist on a rocky planet's surface — its location depends on the host star's luminosity.",
      "System architecture (planet count, spacing, mass ordering) records how the system formed and evolved.",
      "Mean-motion orbital resonances (e.g. TRAPPIST-1's 8:5:3:2 chain) stabilize tightly-packed systems through integer-ratio period locks.",
    ],
    interact: [
      "Metric rail tracks confirmed counts, habitable-zone candidates, and a benchmark resonant system.",
      "Cross-reference Light & Spectra — the host star's class sets where its habitable zone falls.",
      "Cross-reference Local Neighborhood to see which nearby stars host known planets.",
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
              Light · Oscillation · Magnetism · Element Formation
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
              <button onClick={() => navigate("/cosmological")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Cosmological</button>
              <button onClick={() => navigate("/universal")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Universal</button>

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
      <div className="absolute left-4 top-32 bottom-44 z-10 pointer-events-none w-[260px] hidden lg:flex flex-col">
        <HudPanel className="pointer-events-auto flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-white/5">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/55">
              Stellar Layers
            </div>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsla(200,70%,65%,0.6)" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/10" />
            </div>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {LAYERS.map((l, idx) => {
              const isActive = l.key === layer;
              return (
                <button
                  key={l.key}
                  onClick={() => setLayer(l.key)}
                  className="group relative w-full text-left p-3 rounded-lg border transition-all duration-300"
                  style={{
                    background: isActive ? "hsla(240,20%,10%,0.4)" : "transparent",
                    borderColor: isActive ? "hsla(200,70%,65%,0.35)" : "transparent",
                    boxShadow: isActive ? "0 0 20px -5px hsla(200,70%,60%,0.25)" : undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "hsla(240,20%,10%,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full"
                      style={{
                        background: "hsla(200,80%,70%,0.95)",
                        boxShadow: "0 0 8px hsla(200,80%,70%,0.8)",
                      }}
                    />
                  )}
                  <div
                    className={`flex flex-col gap-1 transition-opacity ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}
                  >
                    <span
                      className="text-[10px] font-bold mb-0.5 tabular-nums"
                      style={{
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        color: isActive ? "hsla(200,80%,75%,0.85)" : "hsla(0,0%,100%,0.35)",
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3
                      className="text-[13px] font-bold tracking-[0.08em] uppercase leading-tight"
                      style={{ color: isActive ? "hsla(0,0%,100%,0.95)" : "hsla(0,0%,100%,0.78)" }}
                    >
                      {l.card}
                    </h3>
                    <p
                      className="text-[10px] font-medium leading-snug"
                      style={{ color: isActive ? "hsla(0,0%,100%,0.55)" : "hsla(0,0%,100%,0.4)" }}
                    >
                      {l.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between" style={{ background: "hsla(240,30%,5%,0.4)" }}>
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-foreground/40"
              style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
            >
              Layer {String(LAYERS.findIndex((l) => l.key === layer) + 1).padStart(2, "0")} / {String(LAYERS.length).padStart(2, "0")}
            </span>
            <div className="h-1 w-12 rounded-full overflow-hidden" style={{ background: "hsla(240,20%,15%,0.8)" }}>
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${((LAYERS.findIndex((l) => l.key === layer) + 1) / LAYERS.length) * 100}%`,
                  background: "hsla(200,75%,65%,0.55)",
                }}
              />
            </div>
          </div>
        </HudPanel>
      </div>


      {/* Center stage — simple stellar neighborhood diagram */}
      <div className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none pt-24 pb-32 lg:pl-[260px] lg:pr-[300px] px-4">
        <div className={cn(
          "pointer-events-auto relative w-full max-w-[760px]",
          layer === "neighborhood"
            ? "aspect-square lg:w-[min(760px,calc(100vh-240px),100%)] h-auto max-h-[calc(100vh-224px)]"
            : "h-[calc(100vh-224px)]"
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
                  <div className="text-[13px] font-semibold tracking-[0.08em] uppercase text-foreground/90">{active.card}</div>
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
      <div className="w-full h-full flex flex-col justify-center gap-1 px-1 py-1 overflow-y-auto">
        <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 text-center mb-1">
          Light &amp; Spectra — OBAFGKM sequence (hot ⟶ cool)
        </div>
        {SPECTRAL.map((s) => (
          <div key={s.cls} className="flex items-center gap-3 rounded-lg px-2.5 py-1.5 border border-border/25" style={{ background: "hsla(240,20%,10%,0.6)" }}>
            <div
              className="flex shrink-0 items-center justify-center rounded-full font-bold font-mono text-foreground/90"
              style={{ width: 34, height: 34, fontSize: 13, background: s.color, color: "#101428", boxShadow: `0 0 14px ${s.color}88` }}
            >
              {s.cls}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-foreground/85">Class {s.cls}{s.cls === "G" && " · Sun"}</div>
              <div className="text-[9px] text-muted-foreground/70 font-mono mt-0">{s.temp}</div>
              <div className="text-[9px] text-muted-foreground/60 mt-0">{s.note}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (layer === "lifecycle") {
    const chain = [
      { el: "H", site: "Main sequence" },
      { el: "He", site: "Core fusion" },
      { el: "C", site: "Red giant" },
      { el: "O", site: "Late burning" },
      { el: "Fe", site: "Massive cores" },
      { el: "SN", site: "Supernova" },
      { el: "Au+", site: "Heavy elements" },
    ];
    return (
      <div className="w-full h-full flex flex-col justify-center gap-2 px-2 py-1 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 text-center mb-1">
          Stellar lifecycle — Sun-mass track
        </div>
        {LIFECYCLE_STAGES.map((s, i) => (
          <div key={s.name} className="flex items-center gap-3 rounded-lg p-2 border border-border/25" style={{ background: "hsla(240,20%,10%,0.6)" }}>
            <div className="text-[10px] font-mono text-muted-foreground/55 w-6 text-right">{String(i + 1).padStart(2, "0")}</div>
            <div className="flex-1">
              <div className="text-[12px] font-semibold tracking-[0.1em] uppercase text-foreground/85">{s.name}</div>
              <div className="text-[10px] text-muted-foreground/65 mt-0">{s.desc}</div>
            </div>
          </div>
        ))}
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 text-center mt-2">
          Element formation chain
        </div>
        <div className="flex items-center justify-between gap-1 px-1">
          {chain.map((c, i) => (
            <div key={c.el} className="flex items-center gap-1 flex-1">
              <div className="flex-1 rounded-lg p-1.5 border border-border/25 text-center" style={{ background: "hsla(240,20%,10%,0.6)" }}>
                <div className="text-[12px] font-mono font-semibold text-foreground/90">{c.el}</div>
                <div className="text-[8px] text-muted-foreground/65 leading-tight mt-0.5">{c.site}</div>
              </div>
              {i < chain.length - 1 && (
                <div className="text-foreground/40 text-[10px] font-mono">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layer === "oscillations") {
    // schematic stacked sine waves at different frequencies (p-modes)
    const size = 760;
    const h = 240;
    const labelGutter = 200;
    const waveStart = labelGutter + 12;
    const waveWidth = size - waveStart - 12;
    const amp = 18;
    const rowGap = 64;
    const rows = [
      { freq: 2, color: "#9ec5ff", label: "Low-ℓ p-mode" },
      { freq: 3.5, color: "#ffe87a", label: "Solar 5-min mode (3.1 mHz)" },
      { freq: 5, color: "#ff9d6e", label: "High-ℓ p-mode" },
    ];
    const rowY = (i: number) => h / 2 + (i - 1) * rowGap;
    const path = (freq: number, y: number) => {
      const pts: string[] = [];
      for (let x = 0; x <= waveWidth; x += 3) {
        const yy = y + Math.sin((x / waveWidth) * Math.PI * 2 * freq) * amp;
        pts.push(`${x === 0 ? "M" : "L"}${waveStart + x},${yy}`);
      }
      return pts.join(" ");
    };
    return (
      <div className="w-full h-full flex flex-col justify-center gap-2 px-2 py-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 text-center mb-1">
          Asteroseismic p-modes — schematic
        </div>
        <svg viewBox={`0 0 ${size} ${h}`} className="w-full max-h-[220px]">
          {rows.map((l, i) => {
            const y = rowY(i);
            return (
              <g key={i}>
                <line x1={waveStart} y1={y} x2={size - 12} y2={y} stroke="hsla(0,0%,100%,0.06)" strokeDasharray="2 4" />
                <text x={labelGutter} y={y + 4} textAnchor="end" fill="hsla(0,0%,100%,0.78)" fontSize={11} fontFamily="ui-monospace, monospace">{l.label}</text>
                <path d={path(l.freq, y)} stroke={l.color} strokeWidth={1.6} fill="none" opacity={0.9} />
              </g>
            );
          })}
        </svg>
        <div className="text-[10px] text-muted-foreground/70 px-3 text-center">
          Solar surface oscillations interfere into a forest of discrete modes. Their frequencies depend on interior density, rotation, and composition, letting helioseismology probe the Sun's structure to within ~1%.
        </div>
      </div>
    );
  }

  if (layer === "variables") {
    const cards = [
      { name: "Cepheid", period: "1–100 days", use: "Distance ladder · period–luminosity relation", color: "#ffe87a" },
      { name: "RR Lyrae", period: "0.2–1 day", use: "Distances within the Milky Way halo", color: "#ffba6b" },
      { name: "Mira", period: "~1 year", use: "Late-stage AGB pulsators", color: "#ff7d5e" },
      { name: "Eclipsing Binary", period: "hours–years", use: "Precise stellar masses and radii", color: "#9ec5ff" },
      { name: "δ Scuti", period: "0.5–8 hours", use: "Asteroseismology of A/F stars", color: "#cfd9ff" },
      { name: "Cataclysmic", period: "minutes–days", use: "Accreting binaries · novae", color: "#cc5533" },
    ];
    return (
      <div className="w-full h-full flex flex-col justify-center gap-2 px-2 py-1 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 text-center">
          Variable star classes
        </div>
        <div className="grid grid-cols-2 gap-2">
          {cards.map((c) => (
            <div key={c.name} className="rounded-lg p-2 border border-border/25" style={{ background: "hsla(240,20%,10%,0.6)" }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
                <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-foreground/90">{c.name}</div>
              </div>
              <div className="text-[9px] font-mono text-muted-foreground/65">{c.period}</div>
              <div className="text-[10px] text-muted-foreground/70 mt-0.5">{c.use}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layer === "magnetic") {
    const rows = [
      { name: "Sun (mean)", val: 1.5, color: "#ffe87a", note: "Quiet photosphere" },
      { name: "Sunspot", val: 3000, color: "#ffba6b", note: "Concentrated flux tubes" },
      { name: "M-dwarf", val: 3000, color: "#cc5533", note: "Strong global dynamo" },
      { name: "White Dwarf", val: 1e6, color: "#cfe6ff", note: "Compressed remnant field" },
      { name: "Neutron Star", val: 1e12, color: "#9ec5ff", note: "Pulsar magnetosphere" },
      { name: "Magnetar", val: 1e14, color: "#7aa8ff", note: "Most magnetic objects known" },
    ];
    const max = Math.log10(1e14);
    const windRows = [
      { name: "Slow solar wind", val: 400, color: "#ffe87a", note: "From streamer belts · ~400 km/s" },
      { name: "Fast solar wind", val: 750, color: "#ffba6b", note: "From coronal holes · up to ~800 km/s" },
      { name: "M-dwarf wind", val: 600, color: "#cc5533", note: "Strong magnetic loading · variable" },
    ];
    return (
      <div className="w-full h-full flex flex-col justify-center gap-2 px-2 py-1 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 text-center">
          Magnetic field strength · log scale (Gauss)
        </div>
        <div className="flex flex-col gap-1.5">
          {rows.map((r) => {
            const w = (Math.log10(r.val) / max) * 100;
            return (
              <div key={r.name} className="rounded-lg p-2 border border-border/25" style={{ background: "hsla(240,20%,10%,0.6)" }}>
                <div className="flex items-baseline justify-between mb-1">
                  <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-foreground/90">{r.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground/75">
                    {r.val >= 1e6 ? `10^${Math.round(Math.log10(r.val))}` : r.val.toLocaleString()} G
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsla(240,20%,18%,0.8)" }}>
                  <div className="h-full rounded-full" style={{ width: `${w}%`, background: r.color, boxShadow: `0 0 10px ${r.color}` }} />
                </div>
                <div className="text-[9px] text-muted-foreground/65 mt-0.5">{r.note}</div>
              </div>
            );
          })}
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 text-center mt-2">
          Stellar winds · outflow speed (km/s)
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {windRows.map((w) => (
            <div key={w.name} className="rounded-lg p-2 border border-border/25" style={{ background: "hsla(240,20%,10%,0.6)" }}>
              <div className="text-[10px] font-semibold tracking-[0.08em] uppercase text-foreground/90">{w.name}</div>
              <div className="text-[11px] font-mono text-foreground/85 mt-0.5">{w.val} <span className="text-[8px] text-muted-foreground/60">km/s</span></div>
              <div className="text-[9px] text-muted-foreground/65 mt-0.5 leading-tight">{w.note}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // exoplanets
  return (
    <div className="w-full h-full flex flex-col justify-center gap-2 px-2 py-1 overflow-y-auto">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 text-center">
        Exoplanetary systems — NASA Exoplanet Archive
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: "Confirmed planets", value: "5,800+" },
          { label: "Planetary systems", value: "4,300+" },
          { label: "Multi-planet systems", value: "1,000+" },
          { label: "Habitable-zone candidates", value: "~60" },
          { label: "Transit method", value: "~75%" },
          { label: "Radial-velocity", value: "~19%" },
        ].map((c) => (
          <div key={c.label} className="rounded-lg p-2 border border-border/25" style={{ background: "hsla(240,20%,10%,0.6)" }}>
            <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/60 mb-1">{c.label}</div>
            <div className="text-[13px] font-mono font-semibold text-foreground/90">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
        <div className="rounded-lg p-2.5 border border-border/25" style={{ background: "hsla(240,20%,10%,0.6)" }}>
          <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/60 mb-1">Habitable zone</div>
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-foreground/90">Liquid-water orbits</div>
          <div className="text-[10px] text-muted-foreground/70 mt-1 leading-snug">
            Sun: ~0.95–1.37 AU · M-dwarf (Proxima): ~0.04–0.08 AU. Zone location scales with stellar luminosity.
          </div>
        </div>
        <div className="rounded-lg p-2.5 border border-border/25" style={{ background: "hsla(240,20%,10%,0.6)" }}>
          <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/60 mb-1">System architecture</div>
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-foreground/90">Compact · spaced · hierarchical</div>
          <div className="text-[10px] text-muted-foreground/70 mt-1 leading-snug">
            Planet count, spacing, and mass ordering record formation and migration history.
          </div>
        </div>
      </div>

      <div className="rounded-lg p-2.5 border border-border/25" style={{ background: "hsla(240,20%,10%,0.6)" }}>
        <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/60 mb-1">Orbital resonance · TRAPPIST-1</div>
        <div className="text-[10px] text-muted-foreground/75 leading-snug">
          Seven planets locked in a near-perfect mean-motion chain (period ratios ≈ 8:5:3:2:3:4:3). Integer-ratio resonances stabilize tightly-packed systems and are observed in many multi-planet architectures.
        </div>
      </div>

      <div className="rounded-lg p-2 border border-border/25" style={{ background: "hsla(240,20%,10%,0.6)" }}>
        <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/60 mb-1">Nearest known exoplanet</div>
        <div className="text-[12px] font-semibold tracking-[0.08em] uppercase text-foreground/85">Proxima Centauri b</div>
        <div className="text-[10px] text-muted-foreground/70 mt-0.5">Terrestrial-mass · 4.24 ly · orbits in the M-dwarf habitable zone (~11.2-day period).</div>
      </div>
    </div>
  );
}

export default Stellar;
