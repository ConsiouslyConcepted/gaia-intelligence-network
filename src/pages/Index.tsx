import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { EarthVisualization } from "@/components/EarthVisualization";
import { SPHERE_ARRAY } from "@/types/spheres";
import { useNavigate } from "react-router-dom";
import { HGSDashboard } from "@/components/hgs/HGSDashboard";
import { Activity, Signal, ArrowRight, Sparkles, Clock, Waves, Orbit, Radio, Sun } from "lucide-react";
import { CommonsIcon } from "@/components/CommonsIcon";
import { WireframeSphereIcon } from "@/components/WireframeSphereIcon";
import { SphereIntelligenceChip } from "@/components/sphere-intelligence/SphereIntelligenceChip";
import { SphereSignalRow } from "@/components/sphere-intelligence/SphereSignalRow";
import { SpherePanelBackdrop } from "@/components/SpherePanelBackdrop";

const HudPanel = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`relative rounded-xl backdrop-blur-2xl ${className}`}
    style={{
      background:
        "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
      border: "1px solid hsla(220,30%,55%,0.35)",
      boxShadow:
        "inset 0 1px 0 hsla(0,0%,100%,0.12), inset 0 -1px 0 hsla(0,0%,0%,0.4), 0 0 0 1px hsla(220,30%,30%,0.25), 0 0 32px hsla(210,75%,62%,0.28), 0 0 64px hsla(210,70%,55%,0.18), 0 12px 40px rgba(0,0,0,0.55)",
    }}
  >
    {/* Bright top rim light */}
    <div
      className="absolute -top-px left-4 right-4 h-px"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, hsla(200,60%,78%,0.55) 25%, hsla(200,60%,85%,0.75) 50%, hsla(200,60%,78%,0.55) 75%, transparent 100%)",
      }}
    />
    {/* Outer edge glow (inset to frame the panel) */}
    <div
      className="absolute inset-0 rounded-xl pointer-events-none"
      style={{
        boxShadow:
          "inset 0 0 18px hsla(210,50%,60%,0.06), inset 0 0 4px hsla(210,50%,60%,0.12)",
      }}
    />
    {/* Bottom subtle accent line */}
    <div
      className="absolute bottom-0 left-6 right-6 h-px"
      style={{
        background:
          "linear-gradient(90deg, transparent, hsla(210,40%,50%,0.15), transparent)",
      }}
    />
    {children}
  </div>
);

const MiniGraph = ({ color, data }: { color: string; data: number[] }) => (
  <svg viewBox="0 0 60 20" className="w-full h-5">
    <polyline
      fill="none"
      stroke={`${color}60`}
      strokeWidth="1"
      points={data.map((v, i) => `${(i / (data.length - 1)) * 60},${20 - v * 20}`).join(" ")}
    />
    <polyline
      fill={`${color}08`}
      stroke="none"
      points={`0,20 ${data.map((v, i) => `${(i / (data.length - 1)) * 60},${20 - v * 20}`).join(" ")} 60,20`}
    />
  </svg>
);

const Index = () => {
  const [searchParams] = useSearchParams();
  const [activeView, setActiveView] = useState<"planetary" | "hgs">(
    searchParams.get("view") === "hgs" ? "hgs" : "planetary"
  );
  const navigate = useNavigate();

  useEffect(() => {
    const v = searchParams.get("view");
    setActiveView(v === "hgs" ? "hgs" : "planetary");
  }, [searchParams]);
  const [time, setTime] = useState(new Date());
  const [tick, setTick] = useState(0);



  useEffect(() => {
    const iv = setInterval(() => {
      setTime(new Date());
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const coherenceValues = [78, 82, 72, 76, 65, 88];
  const globalCoherence = Math.round(coherenceValues.reduce((a, b) => a + b, 0) / coherenceValues.length);

  // One featured signal per sphere — pulled live from useSphereIntelligence
  // inside SphereSignalRow. Neutral mono styling per design system.
  const SIGNAL_FEED: Array<{ sphereId: import("@/types/spheres").SphereId; metricKey: string; label: string }> = [
    { sphereId: "geosphere",     metricKey: "seismic",   label: "Seismic Energy" },
    { sphereId: "hydrosphere",   metricKey: "ohc",       label: "Ocean Heat" },
    { sphereId: "cryosphere",    metricKey: "arctic",    label: "Arctic Sea Ice" },
    { sphereId: "atmosphere",    metricKey: "co2",       label: "CO₂ Concentration" },
    { sphereId: "biosphere",     metricKey: "ndvi",      label: "Global NDVI" },
    { sphereId: "magnetosphere", metricKey: "kp",        label: "Kp Index" },
    { sphereId: "ionosphere",    metricKey: "grid",      label: "Grid Load" },
    { sphereId: "noosphere",     metricKey: "flow",      label: "Information Flow" },
    { sphereId: "crystalsphere", metricKey: "lattice",   label: "Lattice Symmetry" },
    { sphereId: "heliosphere",   metricKey: "sunspots",  label: "Sunspot Number" },
  ];

  if (activeView === "hgs") {
    return <HGSDashboard onSwitchView={() => setActiveView("planetary")} />;
  }

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, hsla(225,50%,8%,1) 0%, hsla(228,55%,5%,1) 55%, hsla(230,60%,3%,1) 100%)",
        }}
      />
      <div
        className="absolute inset-0 z-0 pointer-events-none mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at 50% 58%, hsla(190,60%,75%,0.07) 0%, hsla(190,60%,75%,0.02) 22%, transparent 38%)",
        }}
      />
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 26%, hsla(240,30%,3%,0.55) 72%, hsla(240,30%,3%,0.96) 100%)",
        }}
      />
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground) / 0.08) 2px, hsl(var(--foreground) / 0.08) 4px)",
        }}
      />
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05] mix-blend-overlay">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="0.75" />
        </svg>
      </div>

      <div className="absolute inset-0 z-[1] translate-y-[2%]">
        <EarthVisualization />
      </div>



      {/* ─── TOP BAR ─── */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none px-4 pt-6">
        <div
          className="pointer-events-auto px-4 py-4 flex items-center justify-between relative rounded-xl backdrop-blur-2xl"
          style={{
            background:
              "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
            border: "1.5px solid hsla(220,35%,60%,0.55)",
            boxShadow:
              "inset 0 1px 0 hsla(0,0%,100%,0.12), inset 0 -1px 0 hsla(0,0%,0%,0.4), 0 0 0 1px hsla(220,30%,30%,0.25), 0 0 32px hsla(210,75%,62%,0.28), 0 0 64px hsla(210,70%,55%,0.18), 0 12px 40px rgba(0,0,0,0.55)",
          }}
        >
          {/* Top rim — matches panel outline color */}
          <div
            className="absolute -top-px left-4 right-4 h-px pointer-events-none"
            style={{
              background: "hsla(220,30%,55%,0.35)",
            }}
          />



          {/* Left: Title */}
          <div>
            <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-foreground/90">
              Planetary Intelligence
            </h1>
            <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/50 mt-0.5">
              Earth Systems · Live Telemetry
            </p>
          </div>


          {/* Right: View toggle + Commons icon */}
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
              <button
                onClick={() => navigate("/")}
                className="text-center px-2.5 py-2 xl:px-4 xl:py-2.5 xl:min-w-[120px] whitespace-nowrap rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05] hover:text-foreground/70"
                style={{ color: "hsla(0,0%,100%,0.4)" }}
              >
                Home
              </button>
              <button
                className="text-center px-2.5 py-2 xl:px-4 xl:py-2.5 xl:min-w-[120px] whitespace-nowrap rounded-xl text-[11px] font-semibold tracking-[0.18em] uppercase transition-all duration-300"
                style={{
                  background: "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
                  color: "hsla(0,0%,100%,0.95)",
                  border: "1.5px solid hsla(220,35%,60%,0.55)",
                  boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 28px hsla(210,70%,60%,0.18), 0 0 56px hsla(210,70%,55%,0.12), 0 12px 40px rgba(0,0,0,0.55)",
                }}
              >
                Planetary
              </button>
              <button
                onClick={() => setActiveView("hgs")}
                className="text-center px-2.5 py-2 xl:px-4 xl:py-2.5 xl:min-w-[120px] whitespace-nowrap rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05] hover:text-foreground/70"
                style={{ color: "hsla(0,0%,100%,0.4)" }}
              >
                Solar
              </button>
              <button
                onClick={() => navigate("/stellar")}
                className="text-center px-2.5 py-2 xl:px-4 xl:py-2.5 xl:min-w-[120px] whitespace-nowrap rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05] hover:text-foreground/70"
                style={{ color: "hsla(0,0%,100%,0.4)" }}
              >
                Stellar
              </button>
              <button
                onClick={() => navigate("/galactic")}
                className="text-center px-2.5 py-2 xl:px-4 xl:py-2.5 xl:min-w-[120px] whitespace-nowrap rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05] hover:text-foreground/70"
                style={{ color: "hsla(0,0%,100%,0.4)" }}
              >
                Galactic
              </button>
              <button
                onClick={() => navigate("/cosmological")}
                className="text-center px-2.5 py-2 xl:px-4 xl:py-2.5 xl:min-w-[120px] whitespace-nowrap rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05] hover:text-foreground/70"
                style={{ color: "hsla(0,0%,100%,0.4)" }}
              >
                Cosmological
              </button>
              <button
                onClick={() => navigate("/universal")}
                className="text-center px-2.5 py-2 xl:px-4 xl:py-2.5 xl:min-w-[120px] whitespace-nowrap rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05] hover:text-foreground/70"
                style={{ color: "hsla(0,0%,100%,0.4)" }}
              >
                Universal
              </button>
              <button
                onClick={() => navigate("/harmonics")}
                className="text-center px-2.5 py-2 xl:px-4 xl:py-2.5 xl:min-w-[120px] whitespace-nowrap rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05]"
                style={{ color: "hsla(45,100%,75%,0.7)" }}
              >
                Analysis
              </button>


            </div>



            {/* Commons Data icon — tucked next to the toggle */}
            <button
              onClick={() => navigate("/commons")}
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 hover:bg-foreground/[0.06]"
              style={{ color: "hsla(0,0%,100%,0.75)", border: "1px solid hsla(220,30%,55%,0.35)", background: "hsla(240,25%,8%,0.5)", boxShadow: "inset 0 1px 0 hsla(200,60%,78%,0.18), inset 0 0 6px hsla(210,50%,60%,0.08), 0 0 14px -4px hsla(210,60%,65%,0.2)" }}
              title="Planetary Commons Data"
            >
              <CommonsIcon size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── LEFT HUD: All Spheres ─── */}
      <div className="absolute left-4 top-1/2 -translate-y-[41%] z-10 flex flex-col pointer-events-none w-[250px]">
        <HudPanel className="pointer-events-auto p-4 pb-5 h-[620px] w-full flex flex-col">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40 font-medium">Sphere Systems</span>
            <span className="text-[8px] font-mono text-muted-foreground/25">01–{String(SPHERE_ARRAY.length).padStart(2, "0")}</span>
          </div>
          <div className="space-y-2 overflow-y-auto pr-1 -mr-1 flex-1 scrollbar-thin">
            {SPHERE_ARRAY.map((sphere, i) => {
              return (
                <button
                  key={sphere.id}
                  onClick={() => navigate(`/sphere/${sphere.id}`)}
                  className="relative overflow-hidden w-full flex items-center gap-3 px-2.5 py-3 rounded-lg transition-all duration-300 cursor-pointer group"
                >


                  <SpherePanelBackdrop accent={sphere.color} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <SpherePanelBackdrop accent={sphere.color} active />
                  </div>
                  <WireframeSphereIcon color={sphere.color} size={32} segments={12} className="relative z-10 transition-transform duration-500 group-hover:scale-110 shrink-0 -ml-0.5" />
                  <div className="relative z-10 min-w-0 text-left flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-foreground/85 group-hover:text-foreground tracking-wide uppercase">{sphere.name}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground/25 group-hover:text-foreground/50 transition-all group-hover:translate-x-0.5" />
                    </div>
                    <SphereIntelligenceChip sphereId={sphere.id} accent={sphere.color} />
                  </div>
                </button>
              );
            })}
          </div>
        </HudPanel>
      </div>

      {/* ─── RIGHT HUD: Sphere Signals ─── */}
      <div className="absolute right-4 top-1/2 -translate-y-[41%] z-10 flex flex-col pointer-events-none w-[250px]">
        <HudPanel className="pointer-events-auto p-4 pb-5 h-[620px] w-full flex flex-col">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40 font-medium">Sphere Signals</span>
            <span className="text-[8px] font-mono text-muted-foreground/25">Live</span>
          </div>
          <div className="space-y-2 overflow-y-auto pr-1 -mr-1 flex-1 scrollbar-thin">
            {SIGNAL_FEED.map((s) => (
              <SphereSignalRow
                key={s.sphereId + s.metricKey}
                sphereId={s.sphereId}
                metricKey={s.metricKey}
                label={s.label}
              />
            ))}
          </div>
        </HudPanel>
      </div>
      {/* Corner brackets removed */}


      {/* ─── BOTTOM TELEMETRY CHROME ─── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div
          className="relative flex items-stretch gap-0 pl-6 pr-6 py-3 rounded-full backdrop-blur-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
            border: "1px solid hsla(220,30%,55%,0.35)",
            boxShadow:
              "inset 0 1px 0 hsla(0,0%,100%,0.12), inset 0 -1px 0 hsla(0,0%,0%,0.4), 0 0 0 1px hsla(220,30%,30%,0.25), 0 0 32px hsla(210,75%,62%,0.28), 0 0 64px hsla(210,70%,55%,0.18), 0 12px 40px rgba(0,0,0,0.55)",
          }}
        >
          {/* Top rim highlight */}
          <div
            className="absolute top-0 left-12 right-12 h-px pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, hsla(200,60%,80%,0.45) 50%, transparent 100%)",
            }}
          />

          {/* UTC */}
          <div className="flex items-center gap-2.5 px-5">
            <Clock className="w-3.5 h-3.5 text-foreground/40" strokeWidth={1.5} />
            <div className="flex flex-col">
              <span className="text-[7px] tracking-[0.32em] uppercase text-muted-foreground/50 font-semibold">UTC</span>
              <span className="text-[11px] font-mono text-foreground/90 tabular-nums leading-tight tracking-wider">
                {time.toISOString().slice(11, 19)}
              </span>
            </div>
          </div>

          <div className="w-px self-stretch my-1 bg-gradient-to-b from-transparent via-foreground/15 to-transparent" />

          {/* Coherence with sparkline */}
          <div className="flex items-center gap-2.5 px-5">
            <Waves className="w-3.5 h-3.5 text-foreground/40" strokeWidth={1.5} />
            <div className="flex flex-col">
              <span className="text-[7px] tracking-[0.32em] uppercase text-muted-foreground/50 font-semibold">Coherence</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] font-mono text-foreground/90 tabular-nums leading-tight tracking-wider">
                  {globalCoherence.toString().padStart(2, "0")}.{(tick % 100).toString().padStart(2, "0")}
                </span>
                <span className="text-[8px] font-mono text-muted-foreground/40 uppercase">φ</span>
              </div>
            </div>
            <svg viewBox="0 0 40 14" className="w-10 h-3.5 -ml-0.5">
              <polyline
                fill="none"
                stroke="hsla(150,70%,60%,0.6)"
                strokeWidth="1"
                strokeLinecap="round"
                points={coherenceValues.map((v, i) => `${(i / (coherenceValues.length - 1)) * 40},${14 - (v / 100) * 12}`).join(" ")}
              />
            </svg>
          </div>

          <div className="w-px self-stretch my-1 bg-gradient-to-b from-transparent via-foreground/15 to-transparent" />

          {/* Orbital Velocity */}
          <div className="flex items-center gap-2.5 px-5">
            <Orbit className="w-3.5 h-3.5 text-foreground/40" strokeWidth={1.5} />
            <div className="flex flex-col">
              <span className="text-[7px] tracking-[0.32em] uppercase text-muted-foreground/50 font-semibold">Orbital V</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[11px] font-mono text-foreground/90 tabular-nums leading-tight tracking-wider">29.78</span>
                <span className="text-[8px] font-mono text-muted-foreground/40 uppercase">km/s</span>
              </div>
            </div>
          </div>

          <div className="w-px self-stretch my-1 bg-gradient-to-b from-transparent via-foreground/15 to-transparent" />

          {/* Schumann Resonance */}
          <div className="flex items-center gap-2.5 px-5">
            <Radio className="w-3.5 h-3.5 text-foreground/40" strokeWidth={1.5} />
            <div className="flex flex-col">
              <span className="text-[7px] tracking-[0.32em] uppercase text-muted-foreground/50 font-semibold">Schumann</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[11px] font-mono text-foreground/90 tabular-nums leading-tight tracking-wider">
                  {(7.83 + Math.sin(tick / 30) * 0.04).toFixed(2)}
                </span>
                <span className="text-[8px] font-mono text-muted-foreground/40 uppercase">Hz</span>
              </div>
            </div>
          </div>

          <div className="w-px self-stretch my-1 bg-gradient-to-b from-transparent via-foreground/15 to-transparent" />

          {/* Solar Wind */}
          <div className="flex items-center gap-2.5 px-5">
            <Sun className="w-3.5 h-3.5 text-foreground/40" strokeWidth={1.5} />
            <div className="flex flex-col">
              <span className="text-[7px] tracking-[0.32em] uppercase text-muted-foreground/50 font-semibold">Solar Wind</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[11px] font-mono text-foreground/90 tabular-nums leading-tight tracking-wider">412</span>
                <span className="text-[8px] font-mono text-muted-foreground/40 uppercase">km/s</span>
              </div>
            </div>
          </div>

          <div className="w-px self-stretch my-1 bg-gradient-to-b from-transparent via-foreground/15 to-transparent" />

          {/* Status */}
          <div className="flex items-center gap-2 px-5">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/50 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_hsla(150,80%,55%,0.8)]" />
            </span>
            <div className="flex flex-col">
              <span className="text-[7px] tracking-[0.32em] uppercase text-muted-foreground/50 font-semibold">Status</span>
              <span className="text-[11px] tracking-[0.22em] uppercase text-emerald-300/90 font-semibold leading-tight">Nominal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
