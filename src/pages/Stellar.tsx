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
    seeing: "Stars are resonant cavities. Acoustic (p-mode) and gravity (g-mode) oscillations make their surfaces pulsate at micro-magnitude amplitudes. The Sun's dominant p-mode sits near 3.1 mHz (~5 min period).",
    why: [
      "Asteroseismology — the same field that studies variable stars — uses these oscillations to read a star's interior structure, rotation, and composition, exactly as seismology does for Earth.",
      "p-mode frequencies scale as √(M/R³); g-mode periods scale with the buoyancy (Brunt–Väisälä) frequency.",
      "Mode spectra have been resolved in tens of thousands of stars by Kepler, TESS, and ground-based surveys — covering both low-amplitude solar-like oscillators and high-amplitude classical variables.",
    ],
    interact: [
      "Metric rail lists the Sun's dominant frequency and detected mode count.",
      "Open the Stellar Resonance Explorer below to inspect or sonify measured oscillation data.",
      "Cross-reference Variables — the same asteroseismic physics, just at much larger amplitude.",
    ],
  },
  variables: {
    seeing: "Variable stars pulsate or eclipse on hours-to-years timescales. Cepheids and RR Lyrae follow strict period–luminosity relations used to measure cosmic distance.",
    why: [
      "Variables and solar-like oscillators are two ends of one asteroseismic spectrum — both are standing waves in a stellar cavity, differing mainly in mode and amplitude.",
      "Cepheid pulsation is a clean fundamental-mode oscillation — period directly encodes luminosity, anchoring the cosmic distance ladder.",
      "Eclipsing binaries give the most precise direct measurements of stellar masses and radii.",
    ],
    interact: [
      "Metric rail shows catalog size and Cepheid period range.",
      "Cross-reference Oscillations to see the low-amplitude solar-like counterpart of these high-amplitude pulsators.",
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

// ─────────────────────────────────────────────────────────────
// Variable Stars — interactive panel
// ─────────────────────────────────────────────────────────────
type VarClass = {
  id: string;
  name: string;
  color: string;
  periodLabel: string;
  use: string;
  exemplar: { name: string; note: string };
  // Period–Luminosity coordinates: log10(period in days), absolute magnitude (M_V)
  logP: number;
  absMag: number;
  // Folded light curve generator: phase 0..1 -> normalized magnitude (0 dim, 1 bright)
  curve: (phase: number) => number;
  datasetId?: string; // Harmonics Engine dataset id, if available
};

const VAR_CLASSES: VarClass[] = [
  {
    id: "cepheid",
    name: "Cepheid",
    color: "#ffe87a",
    periodLabel: "1–100 days",
    use: "Distance ladder · period–luminosity relation",
    exemplar: { name: "δ Cephei", note: "5.37 d · prototype" },
    logP: 0.9,
    absMag: -4.0,
    curve: (p) => (p < 0.25 ? p / 0.25 : 1 - (p - 0.25) / 0.75),
    datasetId: "variable-cepheid",
  },
  {
    id: "rrlyrae",
    name: "RR Lyrae",
    color: "#ffba6b",
    periodLabel: "0.2–1 day",
    use: "Halo distances · old population II tracers",
    exemplar: { name: "RR Lyrae", note: "0.567 d · prototype" },
    logP: -0.3,
    absMag: 0.6,
    curve: (p) => (p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8),
  },
  {
    id: "mira",
    name: "Mira",
    color: "#ff7d5e",
    periodLabel: "~1 year",
    use: "Late-stage AGB pulsators",
    exemplar: { name: "ο Ceti (Mira)", note: "332 d · ΔV ≈ 8 mag" },
    logP: 2.5,
    absMag: -1.5,
    curve: (p) => 0.5 + 0.5 * Math.sin(2 * Math.PI * p - Math.PI / 2),
  },
  {
    id: "eclipsing",
    name: "Eclipsing Binary",
    color: "#9ec5ff",
    periodLabel: "hours–years",
    use: "Direct stellar masses and radii",
    exemplar: { name: "Algol (β Persei)", note: "2.87 d · detached" },
    logP: 0.46,
    absMag: -0.2,
    curve: (p) => {
      const d1 = Math.exp(-Math.pow((p - 0.25) / 0.04, 2));
      const d2 = 0.5 * Math.exp(-Math.pow((p - 0.75) / 0.05, 2));
      return Math.max(0, 1 - d1 - d2);
    },
  },
  {
    id: "dscuti",
    name: "δ Scuti",
    color: "#cfd9ff",
    periodLabel: "0.5–8 hours",
    use: "Asteroseismology of A/F stars",
    exemplar: { name: "δ Scuti", note: "0.194 d · multi-mode" },
    logP: -0.7,
    absMag: 1.5,
    curve: (p) =>
      0.5 +
      0.3 * Math.sin(2 * Math.PI * p) +
      0.15 * Math.sin(2 * Math.PI * 2.3 * p + 0.7),
  },
  {
    id: "cataclysmic",
    name: "Cataclysmic",
    color: "#cc5533",
    periodLabel: "minutes–days",
    use: "Accreting binaries · novae",
    exemplar: { name: "SS Cygni", note: "Dwarf nova · ~50 d outbursts" },
    logP: 1.7,
    absMag: 4.5,
    curve: (p) => {
      const spike = Math.exp(-Math.pow((p - 0.35) / 0.03, 2));
      const decay = p > 0.35 ? Math.exp(-(p - 0.35) * 6) * 0.7 : 0;
      return Math.min(1, 0.08 + spike + decay);
    },
  },
];

function FoldedLightCurve({ c, animate = true }: { c: VarClass; animate?: boolean }) {
  const W = 320;
  const H = 96;
  const pad = { l: 28, r: 8, t: 8, b: 20 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const N = 140;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const phase = i / N;
    const y = c.curve(phase);
    const px = pad.l + phase * innerW;
    const py = pad.t + (1 - y) * innerH;
    pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  const d = "M" + pts.join(" L");
  return (
    <svg width={W} height={H} className="block">
      <defs>
        <linearGradient id={`lc-${c.id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={c.color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={c.color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* axes */}
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b} stroke="hsla(220,30%,60%,0.25)" />
      <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} stroke="hsla(220,30%,60%,0.25)" />
      <text x={4} y={pad.t + 8} fill="hsla(220,20%,75%,0.7)" fontSize="9" fontFamily="monospace">bright</text>
      <text x={4} y={H - pad.b - 2} fill="hsla(220,20%,75%,0.7)" fontSize="9" fontFamily="monospace">dim</text>
      <text x={pad.l} y={H - 4} fill="hsla(220,20%,75%,0.7)" fontSize="9" fontFamily="monospace">phase 0</text>
      <text x={W - pad.r - 28} y={H - 4} fill="hsla(220,20%,75%,0.7)" fontSize="9" fontFamily="monospace">1.0</text>
      <path d={`${d} L ${W - pad.r},${H - pad.b} L ${pad.l},${H - pad.b} Z`} fill={`url(#lc-${c.id})`} opacity="0.35" />
      <path d={d} fill="none" stroke={c.color} strokeWidth="1.6" style={{ filter: `drop-shadow(0 0 4px ${c.color})` }} />
      {animate && (
        <circle r="3.2" fill={c.color} style={{ filter: `drop-shadow(0 0 6px ${c.color})` }}>
          <animateMotion dur="5s" repeatCount="indefinite" path={d} />
        </circle>
      )}
    </svg>
  );
}

function PLDiagram({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) {
  const W = 680;
  const H = 360;
  const pad = { l: 56, r: 24, t: 24, b: 44 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const xMin = -1.2;
  const xMax = 3.0;
  const yMin = -6; // brightest (top)
  const yMax = 6;  // dimmest (bottom)
  const x = (lp: number) => pad.l + ((lp - xMin) / (xMax - xMin)) * innerW;
  const y = (m: number) => pad.t + ((m - yMin) / (yMax - yMin)) * innerH;
  // Leavitt law for classical Cepheids: M_V ≈ -2.78 logP - 1.35
  const lawPts: string[] = [];
  for (let i = 0; i <= 20; i++) {
    const lp = 0.4 + (i / 20) * 1.8;
    const m = -2.78 * lp - 1.35;
    lawPts.push(`${x(lp).toFixed(1)},${y(m).toFixed(1)}`);
  }
  const gridX = [-1, 0, 1, 2, 3];
  const gridY = [-6, -3, 0, 3, 6];
  return (
    <svg width={W} height={H} className="max-w-full">
      {/* grid */}
      {gridX.map((g) => (
        <g key={`gx-${g}`}>
          <line x1={x(g)} y1={pad.t} x2={x(g)} y2={H - pad.b} stroke="hsla(220,30%,55%,0.12)" />
          <text x={x(g)} y={H - pad.b + 14} fill="hsla(220,20%,75%,0.7)" fontSize="10" fontFamily="monospace" textAnchor="middle">{`10^${g}`}</text>
        </g>
      ))}
      {gridY.map((g) => (
        <g key={`gy-${g}`}>
          <line x1={pad.l} y1={y(g)} x2={W - pad.r} y2={y(g)} stroke="hsla(220,30%,55%,0.12)" />
          <text x={pad.l - 8} y={y(g) + 3} fill="hsla(220,20%,75%,0.7)" fontSize="10" fontFamily="monospace" textAnchor="end">{g > 0 ? `+${g}` : g}</text>
        </g>
      ))}
      {/* axes */}
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b} stroke="hsla(220,30%,60%,0.4)" />
      <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} stroke="hsla(220,30%,60%,0.4)" />
      <text x={W / 2} y={H - 8} fill="hsla(220,20%,80%,0.8)" fontSize="11" fontFamily="monospace" textAnchor="middle">period (days, log)</text>
      <text x={14} y={H / 2} fill="hsla(220,20%,80%,0.8)" fontSize="11" fontFamily="monospace" textAnchor="middle" transform={`rotate(-90 14 ${H / 2})`}>absolute magnitude M_V</text>
      {/* Leavitt law line */}
      <polyline points={lawPts.join(" ")} fill="none" stroke="hsla(48,90%,70%,0.55)" strokeWidth="1.5" strokeDasharray="4 4" />
      <text x={x(2.2) + 6} y={y(-2.78 * 2.2 - 1.35) - 4} fill="hsla(48,90%,80%,0.8)" fontSize="10" fontFamily="monospace">Leavitt law (Cepheid P–L)</text>
      {/* class points */}
      {VAR_CLASSES.map((c) => {
        const active = selectedId === c.id;
        return (
          <g key={c.id} onClick={() => onSelect(c.id)} style={{ cursor: "pointer" }}>
            <circle cx={x(c.logP)} cy={y(c.absMag)} r={active ? 8 : 6} fill={c.color}
              style={{ filter: `drop-shadow(0 0 ${active ? 12 : 6}px ${c.color})` }}
              stroke={active ? "white" : "transparent"} strokeWidth={active ? 1.2 : 0} />
            <text x={x(c.logP) + 12} y={y(c.absMag) + 3} fill="hsla(0,0%,100%,0.85)" fontSize="11" fontFamily="monospace">{c.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

function VariableStarsPanel() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>("cepheid");
  const [view, setView] = useState<"cards" | "pl">("cards");
  const selected = VAR_CLASSES.find((c) => c.id === selectedId) ?? VAR_CLASSES[0];

  const openInEngine = (c: VarClass) => {
    const params = new URLSearchParams({
      mode: "single",
      method: c.id === "dscuti" || c.id === "rrlyrae" ? "spectrum" : "timeSeries",
      scope: "stellar",
    });
    if (c.datasetId) params.set("dataset", c.datasetId);
    navigate(`/harmonics?${params.toString()}`);
  };

  return (
    <div className="w-full h-full flex flex-col gap-3 px-4 py-2 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="text-[12px] uppercase tracking-[0.25em] text-muted-foreground/70">Variable star classes</div>
        <div className="flex gap-1 p-1 rounded-lg border border-border/30" style={{ background: "hsla(240,20%,8%,0.5)" }}>
          {(["cards", "pl"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={cn("px-3 py-1 text-[10px] uppercase tracking-[0.15em] rounded-md transition-colors",
                view === v ? "bg-foreground/10 text-foreground" : "text-muted-foreground/70 hover:text-foreground/80")}>
              {v === "cards" ? "Classes" : "P–L Diagram"}
            </button>
          ))}
        </div>
      </div>

      {view === "cards" ? (
        <div className="grid grid-cols-2 gap-3">
          {VAR_CLASSES.map((c) => {
            const active = c.id === selectedId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "text-left rounded-xl p-3 border transition-all duration-200",
                  active ? "border-foreground/40" : "border-border/30 hover:border-border/50"
                )}
                style={{
                  background: active
                    ? "linear-gradient(145deg, hsla(225,45%,14%,0.95), hsla(225,50%,8%,0.92))"
                    : "hsla(240,20%,10%,0.6)",
                  boxShadow: active ? `0 0 24px ${c.color}33, inset 0 1px 0 hsla(0,0%,100%,0.06)` : "none",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color, boxShadow: `0 0 10px ${c.color}` }} />
                  <div className="text-[13px] font-semibold tracking-[0.1em] uppercase text-foreground/95">{c.name}</div>
                </div>
                <div className="text-[11px] font-mono text-muted-foreground/75">{c.periodLabel}</div>
                <div className="text-[12px] text-muted-foreground/80 mt-0.5">{c.use}</div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex justify-center">
          <PLDiagram selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      )}

      {/* Detail row */}
      <div className="rounded-xl border border-border/30 p-3 flex flex-col sm:flex-row gap-3"
        style={{ background: "linear-gradient(145deg, hsla(225,45%,12%,0.9), hsla(225,50%,6%,0.92))" }}>
        <div className="shrink-0">
          <FoldedLightCurve c={selected} />
          <div className="text-[9px] font-mono text-muted-foreground/60 text-center mt-0.5">Folded light curve · phase 0–1</div>
        </div>
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: selected.color, boxShadow: `0 0 8px ${selected.color}` }} />
            <div className="text-[12px] font-semibold tracking-[0.1em] uppercase text-foreground/95">{selected.name}</div>
            <div className="text-[10px] font-mono text-muted-foreground/60">log P = {selected.logP.toFixed(2)} · M_V = {selected.absMag.toFixed(1)}</div>
          </div>
          <div className="text-[11px] text-muted-foreground/85">
            <span className="text-foreground/80">Exemplar:</span> {selected.exemplar.name}
            <span className="text-muted-foreground/60"> — {selected.exemplar.note}</span>
          </div>
          <div className="text-[11px] text-muted-foreground/70">{selected.use}</div>
          <button
            onClick={() => openInEngine(selected)}
            className="self-start mt-1 px-3 py-1.5 rounded-md text-[10px] uppercase tracking-[0.18em] font-medium border border-border/40 hover:border-foreground/40 transition-colors"
            style={{ background: "hsla(240,20%,12%,0.7)", color: "hsla(0,0%,95%,0.9)" }}
          >
            Analyze in Harmonics Engine →
          </button>
        </div>
      </div>
    </div>
  );
}


function StellarStage({ layer }: { layer: StellarLayer }) {
  const navigate = useNavigate();
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
    // Upgraded asteroseismic schematic: glowing waves + power spectrum sidebar
    const W = 920;
    const H = 360;
    const labelGutter = 168;
    const waveStart = labelGutter + 16;
    const specStart = 660;
    const waveEnd = specStart - 28;
    const waveWidth = waveEnd - waveStart;
    const rowGap = 66;
    const baseY = 104;
    const rows = [
      { freq: 2,   color: "#9ec5ff", glow: "#5b8cff", label: "Low-ℓ p-mode",            sub: "ℓ = 0 · deep cavity",    amp: 22, mHz: 1.8, power: 0.55 },
      { freq: 3.5, color: "#ffe87a", glow: "#f5c542", label: "Solar 5-min mode",        sub: "ν ≈ 3.1 mHz · ℓ = 1",    amp: 18, mHz: 3.1, power: 1.0  },
      { freq: 5.5, color: "#ff9d6e", glow: "#e8632c", label: "High-ℓ p-mode",           sub: "ℓ ≥ 3 · near-surface",   amp: 12, mHz: 4.4, power: 0.42 },
    ];
    const path = (freq: number, y: number, amp: number, phase = 0) => {
      const pts: string[] = [];
      for (let x = 0; x <= waveWidth; x += 2) {
        const t = x / waveWidth;
        const env = Math.sin(Math.PI * t); // amplitude envelope
        const yy = y + Math.sin(t * Math.PI * 2 * freq + phase) * amp * (0.55 + 0.45 * env);
        pts.push(`${x === 0 ? "M" : "L"}${waveStart + x},${yy}`);
      }
      return pts.join(" ");
    };

    // power spectrum bars
    const specW = W - specStart - 16;
    const specH = 180;
    const specBaseY = baseY + 30;
    const bars = Array.from({ length: 28 }, (_, i) => {
      const f = (i / 28) * 5; // 0..5 mHz
      // sum of lorentzians around each row peak
      let p = 0;
      for (const r of rows) {
        const d = f - r.mHz;
        p += r.power / (1 + (d * 3.2) ** 2);
      }
      return { f, p: Math.min(1, p), color: f < 2.5 ? "#9ec5ff" : f < 4 ? "#ffe87a" : "#ff9d6e" };
    });

    return (
      <div className="w-full h-full flex flex-col justify-center gap-3 px-2 py-2">
        <div className="flex items-center justify-between px-3">
          <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70 font-mono">
            Asteroseismic p-modes · live schematic
          </div>
          <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.18em] font-mono text-muted-foreground/55">
            <span className="flex items-center gap-1.5"><span className="w-2 h-px bg-[#9ec5ff]" />Low-ℓ</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-px bg-[#ffe87a]" />5-min</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-px bg-[#ff9d6e]" />High-ℓ</span>
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-h-[300px]">
          <defs>
            <clipPath id="stellar-wave-lane-clip">
              <rect x={waveStart} y={baseY - 42} width={waveEnd - waveStart} height={rowGap * 3 + 42} rx={8} />
            </clipPath>
            {rows.map((r, i) => (
              <filter key={i} id={`glow-${i}`} x="-10%" y="-50%" width="120%" height="200%">
                <feGaussianBlur stdDeviation="2.4" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            ))}
            <linearGradient id="rail-fade" x1="0" x2="1">
              <stop offset="0" stopColor="hsla(0,0%,100%,0)" />
              <stop offset="0.5" stopColor="hsla(0,0%,100%,0.18)" />
              <stop offset="1" stopColor="hsla(0,0%,100%,0)" />
            </linearGradient>
            <linearGradient id="spec-bg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="hsla(220,40%,60%,0.05)" />
              <stop offset="1" stopColor="hsla(220,40%,60%,0)" />
            </linearGradient>
          </defs>

          {/* WAVES BLOCK */}
          <g>
            {/* container frame — starts after labels to avoid overlap */}
            <rect x={waveStart - 10} y={baseY - 26} width={waveEnd - waveStart + 16} height={rowGap * 3 + 8}
                  rx={10} fill="hsla(220,40%,12%,0.35)" stroke="hsla(220,40%,80%,0.08)" />
            <text x={waveStart - 6} y={baseY - 32} fill="hsla(0,0%,100%,0.45)" fontSize={9}
                  fontFamily="ui-monospace, monospace" letterSpacing="2">TIME DOMAIN →</text>

            {rows.map((r, i) => {
              const y = baseY + i * rowGap;
              return (
                <g key={i}>
                  <line x1={waveStart} y1={y} x2={waveEnd} y2={y} stroke="url(#rail-fade)" strokeDasharray="1 4" />
                  {/* label block */}
                  <text x={labelGutter} y={y - 4} textAnchor="end" fill="hsla(0,0%,100%,0.92)" fontSize={11.5}
                        fontFamily="ui-monospace, monospace" fontWeight={600}>{r.label}</text>
                  <text x={labelGutter} y={y + 10} textAnchor="end" fill={r.color} opacity={0.75} fontSize={9}
                        fontFamily="ui-monospace, monospace" letterSpacing="1">{r.sub}</text>
                  <g clipPath="url(#stellar-wave-lane-clip)">
                    {/* glow underlay */}
                    <path d={path(r.freq, y, r.amp)} stroke={r.glow} strokeWidth={5} fill="none" opacity={0.28}
                          filter={`url(#glow-${i})`} strokeLinecap="round">
                      <animateTransform attributeName="transform" type="translate"
                                        from="0 0" to={`${-waveWidth / r.freq} 0`}
                                        dur={`${6 + i * 1.5}s`} repeatCount="indefinite" />
                    </path>
                    {/* main wave */}
                    <path d={path(r.freq, y, r.amp)} stroke={r.color} strokeWidth={1.8} fill="none"
                          strokeLinecap="round">
                      <animateTransform attributeName="transform" type="translate"
                                        from="0 0" to={`${-waveWidth / r.freq} 0`}
                                        dur={`${6 + i * 1.5}s`} repeatCount="indefinite" />
                    </path>
                    {/* node markers */}
                    <circle cx={waveStart} cy={y} r={2.5} fill={r.color} />
                    <circle cx={waveEnd} cy={y} r={2.5} fill={r.color} opacity={0.5} />
                  </g>
                </g>
              );
            })}
          </g>

          {/* POWER SPECTRUM RIGHT BLOCK */}
          <g>
            <rect x={specStart - 6} y={baseY - 26} width={W - specStart + 2} height={rowGap * 3 + 8}
                  rx={10} fill="url(#spec-bg)" stroke="hsla(220,40%,80%,0.08)" />
            <text x={specStart} y={baseY - 32} fill="hsla(0,0%,100%,0.45)" fontSize={9}
                  fontFamily="ui-monospace, monospace" letterSpacing="2">POWER SPECTRUM</text>

            {/* horizontal gridlines */}
            {[0.25, 0.5, 0.75].map((g, i) => (
              <line key={i} x1={specStart} x2={W - 16}
                    y1={specBaseY + specH - g * specH} y2={specBaseY + specH - g * specH}
                    stroke="hsla(0,0%,100%,0.05)" strokeDasharray="1 3" />
            ))}

            {/* bars */}
            {bars.map((b, i) => {
              const bw = (specW / bars.length) - 2;
              const x = specStart + i * (specW / bars.length);
              const hh = b.p * specH;
              return (
                <g key={i}>
                  <rect x={x} y={specBaseY + specH - hh} width={bw} height={hh}
                        fill={b.color} opacity={0.85} rx={1} />
                  <rect x={x} y={specBaseY + specH - hh} width={bw} height={Math.min(hh, 6)}
                        fill={b.color} opacity={1} rx={1} />
                </g>
              );
            })}

            {/* axis */}
            <line x1={specStart} y1={specBaseY + specH} x2={W - 16} y2={specBaseY + specH}
                  stroke="hsla(0,0%,100%,0.18)" />
            {[0, 1, 2, 3, 4, 5].map((v) => {
              const x = specStart + (v / 5) * specW;
              return (
                <g key={v}>
                  <line x1={x} y1={specBaseY + specH} x2={x} y2={specBaseY + specH + 3}
                        stroke="hsla(0,0%,100%,0.3)" />
                  <text x={x} y={specBaseY + specH + 14} textAnchor="middle"
                        fill="hsla(0,0%,100%,0.45)" fontSize={9} fontFamily="ui-monospace, monospace">{v}</text>
                </g>
              );
            })}
            <text x={(specStart + W - 16) / 2} y={specBaseY + specH + 26} textAnchor="middle"
                  fill="hsla(0,0%,100%,0.4)" fontSize={9} fontFamily="ui-monospace, monospace"
                  letterSpacing="1.5">FREQUENCY (mHz)</text>

            {/* highlight 3.1 mHz peak */}
            {(() => {
              const x = specStart + (3.1 / 5) * specW;
              return (
                <g>
                  <line x1={x} y1={specBaseY} x2={x} y2={specBaseY + specH}
                        stroke="#ffe87a" strokeDasharray="2 3" opacity={0.55} />
                  <text x={x + 4} y={specBaseY + 10} fill="#ffe87a" fontSize={9}
                        fontFamily="ui-monospace, monospace" opacity={0.85}>ν☉ 3.1 mHz</text>
                </g>
              );
            })()}
          </g>
        </svg>

        <div className="text-[10px] text-muted-foreground/70 px-4 text-center max-w-3xl mx-auto leading-relaxed">
          The stellar interior acts as a resonant cavity. Surface oscillations interfere into a discrete forest of p-modes whose frequencies encode interior density, rotation, and composition — letting helioseismology probe the Sun's structure to within ~1%.
        </div>

        <button
          onClick={() => navigate("/harmonics?mode=single&method=spectrum&scope=stellar&dataset=g-star-pmodes")}
          className="group mx-3 mt-1 rounded-xl border border-border/30 bg-gradient-to-r from-white/[0.04] via-white/[0.06] to-white/[0.03] hover:from-white/[0.07] hover:via-white/[0.10] hover:to-white/[0.05] transition px-4 py-3 flex items-center justify-between gap-3 text-left"
          aria-label="Open Stellar Resonance Explorer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg border border-border/30 bg-white/[0.04] flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-[#ffe87a]">
                <path d="M3 12h2l2-7 4 14 3-10 2 6 2-3h3" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.24em] text-foreground/90 font-semibold">Stellar Resonance Explorer</div>
              <div className="text-[10.5px] text-muted-foreground/75 mt-0.5 leading-snug">
                Inspect and sonify measured asteroseismic mode spectra — pitch maps to mode frequency, not literal stellar sound.
              </div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-foreground/70 shrink-0 group-hover:translate-x-0.5 transition-transform">OPEN →</div>
        </button>
      </div>
    );
  }


  if (layer === "variables") {
    return <VariableStarsPanel />;
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
