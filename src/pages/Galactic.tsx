import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommonsIcon } from "@/components/CommonsIcon";
import { MilkyWayMap, GalacticLayer } from "@/components/galactic/MilkyWayMap";
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

interface LayerSpec {
  key: GalacticLayer;
  card: string;
  title: string;
  question: string;
  metrics: { label: string; value: string; unit?: string }[];
}

const LAYERS: LayerSpec[] = [
  {
    key: "position",
    card: "Galactic Position",
    title: "Solar System in the Milky Way",
    question: "Where does the Solar System sit within the galaxy?",
    metrics: [
      { label: "Distance to Sgr A*", value: "26.7", unit: "kly" },
      { label: "Galactic Longitude ℓ", value: "0", unit: "°" },
      { label: "Galactic Latitude b", value: "+0.0", unit: "°" },
      { label: "Position", value: "Orion Spur", unit: "" },
    ],
  },
  {
    key: "environment",
    card: "Galactic Environment",
    title: "Local Interstellar Medium",
    question: "What galactic conditions surround the Solar System?",
    metrics: [
      { label: "Cosmic Ray Flux", value: "1.42", unit: "p/cm²·s" },
      { label: "Local Bubble", value: "~300", unit: "ly" },
      { label: "Local Interstellar Cloud", value: "G-Cloud", unit: "" },
      { label: "ISM Density", value: "0.005", unit: "atoms/cm³" },
    ],
  },
  {
    key: "dynamics",
    card: "Galactic Dynamics",
    title: "Solar Orbit & Stellar Motion",
    question: "How is the Solar System moving through the galaxy?",
    metrics: [
      { label: "Orbital Velocity", value: "220", unit: "km/s" },
      { label: "Galactic Year", value: "225", unit: "Myr" },
      { label: "Arm Crossings", value: "~4", unit: "/orbit" },
      { label: "Local Stellar Density", value: "0.14", unit: "stars/pc³" },
    ],
  },
  {
    key: "structure",
    card: "Galactic Structure",
    title: "Milky Way Architecture",
    question: "What is the larger architecture of the galaxy itself?",
    metrics: [
      { label: "Sgr A* Mass", value: "4.15×10⁶", unit: "M☉" },
      { label: "Spiral Arms", value: "4", unit: "major" },
      { label: "Stellar Streams", value: "60+", unit: "tracked" },
      { label: "Magnetic Field", value: "~5", unit: "μG" },
    ],
  },
];

interface LayerInfo {
  seeing: string;
  why: string[];
  interact: string[];
}

const LAYER_INFO: Record<GalacticLayer, LayerInfo> = {
  position: {
    seeing: "The Sun's location in the Milky Way: ~26,700 light-years from Sagittarius A*, on the inner edge of the Orion Spur between the Sagittarius and Perseus arms.",
    why: [
      "Distance from the galactic center sets the local gravitational potential — the lowest harmonic the Solar System sits inside.",
      "Position between arms keeps the Sun in a lower-density region, which stabilizes long-term planetary cycles.",
      "Galactic coordinates anchor every smaller-scale resonance to a single reference frame.",
    ],
    interact: [
      "Highlight marks the Sun's position on the spiral map.",
      "Cross-reference Distance to Sgr A* in the metric rail.",
      "Switch to Dynamics to see how this position moves.",
    ],
  },
  environment: {
    seeing: "The Local Bubble — a ~300 ly cavity of hot, low-density gas carved by past supernovae — with the Sun currently inside the smaller G-Cloud.",
    why: [
      "Low ambient density lets cosmic-ray and magnetic flux reach the heliosphere with minimal scattering.",
      "Cloud transitions modulate the heliosphere's size, which shifts cosmic-ray flux at Earth.",
      "The local medium is the boundary condition for every solar and planetary field.",
    ],
    interact: [
      "Bubble outline shows the cavity around the Sun.",
      "Cosmic Ray Flux and ISM Density in the metric rail track the current state.",
      "Compare with Position to see scale relative to the spiral arms.",
    ],
  },
  dynamics: {
    seeing: "The Sun's orbit around the galactic center at ~220 km/s, completing one Galactic Year every ~225 million years.",
    why: [
      "Orbital period is the longest harmonic in the planetary stack — every shorter cycle nests inside it.",
      "Arm crossings (~4 per orbit) correlate with episodes of increased star formation and climate shifts.",
      "Vertical oscillation through the disk modulates cosmic-ray exposure on a ~30 Myr cycle.",
    ],
    interact: [
      "Orbit ring shows the Sun's path around Sgr A*.",
      "Galactic Year metric anchors the timescale.",
      "Compare with Structure to see what the Sun is orbiting.",
    ],
  },
  structure: {
    seeing: "The full Milky Way: four major spiral arms, a central bar, the supermassive black hole Sgr A*, and the large-scale magnetic field threading the disk.",
    why: [
      "The bar and arms set the dominant density waves — galactic-scale standing modes.",
      "Sgr A* anchors the gravitational potential that every star orbits.",
      "Stellar streams trace past mergers and the galaxy's resonant scaffolding.",
    ],
    interact: [
      "Spiral arms and Sgr A* are marked on the map.",
      "Metric rail lists structural counts and the disk magnetic field.",
      "Zoom out conceptually — this is the largest scale the dashboard tracks before Cosmological.",
    ],
  },
};



const Galactic = () => {
  const navigate = useNavigate();
  const [layer, setLayer] = useState<GalacticLayer>("position");
  const active = LAYERS.find((l) => l.key === layer)!;

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <NightSkyBackground />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none px-4 pt-6">
        <HudPanel className="pointer-events-auto px-4 py-4 flex items-center justify-between" topBar>
          <div>
            <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-foreground/90">Galactic Intelligence</h1>
            <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/50 mt-0.5">
              Solar System Galactic Coordinates · Local Stellar Neighborhood &amp; Orion Arm
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
              <button onClick={() => navigate("/stellar")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Stellar</button>
              <button className="text-center px-2.5 py-2 xl:px-4 xl:py-2.5 xl:min-w-[120px] whitespace-nowrap rounded-xl text-[11px] font-semibold tracking-[0.18em] uppercase" style={ACTIVE_BTN_STYLE}>Galactic</button>
              <button onClick={() => navigate("/universal")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Universal</button>
              <button onClick={() => navigate("/cosmological")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Cosmological</button>
              <button onClick={() => navigate("/harmonics")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(45,100%,75%,0.7)" }}>Engine</button>



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
            Galactic Layers
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
      <div className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none pt-24 pb-32 lg:pl-[260px] lg:pr-[300px] px-4">
        <div className="pointer-events-auto relative aspect-square w-full max-w-[880px] lg:w-[min(880px,calc(100vh-180px),100%)]">
          <MilkyWayMap layer={layer} />
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
            Milky Way context · read-only · {active.title}
          </p>
        </HudPanel>
      </div>
    </div>
  );
};

export default Galactic;
