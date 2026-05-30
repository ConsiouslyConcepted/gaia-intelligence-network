import { useState, useEffect, useMemo } from "react";
import { EarthVisualization } from "@/components/EarthVisualization";
import { SPHERE_ARRAY } from "@/types/spheres";
import { useNavigate } from "react-router-dom";
import { HGSDashboard } from "@/components/hgs/HGSDashboard";
import { Activity, Signal, ArrowRight, Sparkles } from "lucide-react";
import { CommonsIcon } from "@/components/CommonsIcon";
import { WireframeSphereIcon } from "@/components/WireframeSphereIcon";
import { SphereIntelligenceChip } from "@/components/sphere-intelligence/SphereIntelligenceChip";
import { SphereSignalRow } from "@/components/sphere-intelligence/SphereSignalRow";

const HudPanel = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`relative rounded-xl backdrop-blur-2xl ${className}`}
    style={{
      background:
        "linear-gradient(145deg, hsla(240,20%,14%,0.92) 0%, hsla(240,25%,9%,0.88) 50%, hsla(240,22%,7%,0.92) 100%)",
      border: "1px solid hsla(220,30%,55%,0.35)",
      boxShadow:
        "inset 0 1px 0 hsla(0,0%,100%,0.12), inset 0 -1px 0 hsla(0,0%,0%,0.4), 0 0 0 1px hsla(220,30%,30%,0.25), 0 0 24px hsla(220,40%,50%,0.08), 0 12px 40px rgba(0,0,0,0.55)",
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
  const [activeView, setActiveView] = useState<"planetary" | "hgs">("planetary");
  const navigate = useNavigate();
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
  ];

  if (activeView === "hgs") {
    return <HGSDashboard onSwitchView={() => setActiveView("planetary")} />;
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-background">
      {/* Aurora / nebula glow behind globe */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        background:
          "radial-gradient(ellipse 65% 55% at 50% 58%, hsla(200,80%,40%,0.12) 0%, hsla(260,55%,30%,0.06) 42%, transparent 78%)",
      }} />

      {/* Full-screen globe */}
      <div className="absolute inset-0 z-[1] translate-y-[2%]">
        <EarthVisualization />
      </div>

      {/* Volumetric halo around the planet */}
      <div className="absolute inset-0 z-[2] pointer-events-none mix-blend-screen" style={{
        background:
          "radial-gradient(circle at 50% 58%, hsla(190,60%,75%,0.07) 0%, hsla(190,60%,75%,0.02) 22%, transparent 38%)",
      }} />

      {/* Vignette overlay */}
      <div className="absolute inset-0 z-[3] pointer-events-none" style={{
        background:
          "radial-gradient(ellipse at center, transparent 26%, hsla(240,30%,3%,0.55) 72%, hsla(240,30%,3%,0.96) 100%)",
      }} />

      {/* Scanline overlay */}
      <div className="absolute inset-0 z-[4] pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground) / 0.08) 2px, hsl(var(--foreground) / 0.08) 4px)" }}
      />

      {/* Film grain */}
      <div className="absolute inset-0 z-[4] pointer-events-none opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.75'/></svg>\")" }}
      />


      {/* ─── TOP BAR ─── */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none px-4 pt-3">
        <div
          className="pointer-events-auto px-4 py-2.5 flex items-center justify-between relative rounded-xl backdrop-blur-2xl"
          style={{
            background:
              "linear-gradient(180deg, hsla(240,22%,18%,0.95) 0%, hsla(240,25%,11%,0.95) 45%, hsla(240,30%,6%,0.96) 100%)",
            border: "1px solid hsla(210,40%,82%,0.65)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
          }}
        >

          {/* Left: Title */}
          <div>
            <h1 className="text-[11px] font-bold tracking-[0.25em] uppercase text-foreground/80">
              Planetary Intelligence
            </h1>
            <p className="text-[7px] tracking-[0.25em] uppercase text-muted-foreground/30 mt-0.5">
              Gaia Holonic Observatory · Digital Twin
            </p>
          </div>


          {/* Right: View toggle + Commons icon */}
            <div className="flex items-center gap-3">
            <div
              className="flex gap-1.5 rounded-2xl p-1.5"
              style={{
                background: "hsla(240,25%,8%,0.7)",
                border: "1px solid hsla(220,30%,55%,0.25)",
                boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.03)",
              }}
            >
              <button
                className="min-w-[170px] text-center px-6 py-2.5 rounded-xl text-[11px] font-semibold tracking-[0.18em] uppercase transition-all duration-300"
                style={{
                  background: "linear-gradient(180deg, hsla(240,22%,18%,0.95) 0%, hsla(240,28%,9%,0.96) 100%)",
                  color: "hsla(0,0%,100%,0.95)",
                  border: "1px solid hsla(220,40%,65%,0.5)",
                  boxShadow: "inset 0 1px 0 hsla(200,60%,78%,0.22), inset 0 0 10px hsla(210,50%,60%,0.08), 0 4px 14px rgba(0,0,0,0.5), 0 0 18px -4px hsla(210,60%,65%,0.25)",
                }}
              >
                Planetary
              </button>
              <button
                onClick={() => setActiveView("hgs")}
                className="min-w-[170px] text-center px-6 py-2.5 rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05] hover:text-foreground/70"
                style={{ color: "hsla(0,0%,100%,0.4)" }}
              >
                Universal
              </button>
              <button
                onClick={() => navigate("/cosmological")}
                className="min-w-[170px] text-center px-6 py-2.5 rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05] hover:text-foreground/70"
                style={{ color: "hsla(0,0%,100%,0.4)" }}
              >
                Cosmological
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
      <div className="absolute left-4 top-1/2 -translate-y-[44%] z-10 flex flex-col pointer-events-none w-[250px]">
        <HudPanel className="pointer-events-auto p-4 pb-5 h-[620px] w-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40 font-medium">Sphere Systems</span>
            <span className="text-[8px] font-mono text-muted-foreground/25">01–{String(SPHERE_ARRAY.length).padStart(2, "0")}</span>
          </div>
          <div className="space-y-1">
            {SPHERE_ARRAY.map((sphere, i) => {
              return (
                <button
                  key={sphere.id}
                  onClick={() => navigate(`/sphere/${sphere.id}`)}
                  className="w-full flex items-center gap-3 px-1 py-2 rounded-lg transition-all duration-300 cursor-pointer group hover:bg-foreground/[0.03]"
                >
                  <WireframeSphereIcon color={sphere.color} size={28} segments={12} className="transition-transform duration-500 group-hover:scale-110 shrink-0 -ml-0.5" />
                  <div className="min-w-0 text-left flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-foreground/70 group-hover:text-foreground tracking-wide uppercase">{sphere.name}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground/20 group-hover:text-foreground/40 transition-all group-hover:translate-x-0.5" />
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
      <div className="absolute right-4 top-1/2 -translate-y-[44%] z-10 flex flex-col pointer-events-none w-[250px]">
        <HudPanel className="pointer-events-auto p-4 pb-5 h-[620px] w-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40 font-medium">Sphere Signals</span>
            <span className="text-[8px] font-mono text-muted-foreground/25">Live</span>
          </div>
          <div className="space-y-2.5">
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
      {/* Corner brackets — sharper, longer */}
      {[
        "bottom-3 left-3 border-l border-b",
        "bottom-3 right-3 border-r border-b",
      ].map((pos) => (
        <div key={pos} className={`absolute ${pos} w-8 h-8 border-foreground/20 z-10 pointer-events-none`} />
      ))}

      {/* ─── BOTTOM TELEMETRY CHROME ─── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div
          className="flex items-center gap-10 px-10 py-2 rounded-full backdrop-blur-2xl"
          style={{
            background: "linear-gradient(180deg, hsla(240,22%,14%,0.85) 0%, hsla(240,28%,7%,0.92) 100%)",
            border: "1px solid hsla(0,0%,100%,0.07)",
            boxShadow:
              "inset 0 1px 0 hsla(0,0%,100%,0.10), 0 10px 28px rgba(0,0,0,0.65), 0 0 36px hsla(190,60%,50%,0.05)",
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-[7px] tracking-[0.32em] uppercase text-muted-foreground/40 font-medium">UTC</span>
            <span className="text-[10px] font-mono text-foreground/80 tabular-nums">
              {time.toISOString().slice(11, 19)}
            </span>
          </div>
          <div className="w-px h-5 bg-foreground/10" />
          <div className="flex flex-col items-center">
            <span className="text-[7px] tracking-[0.32em] uppercase text-muted-foreground/40 font-medium">Coherence</span>
            <span className="text-[10px] font-mono text-foreground/80 tabular-nums">
              {globalCoherence.toString().padStart(2, "0")}.{(tick % 100).toString().padStart(2, "0")}
            </span>
          </div>
          <div className="w-px h-5 bg-foreground/10" />
          <div className="flex flex-col items-center">
            <span className="text-[7px] tracking-[0.32em] uppercase text-muted-foreground/40 font-medium">Orbital V</span>
            <span className="text-[10px] font-mono text-foreground/80 tabular-nums">29.78 km/s</span>
          </div>
          <div className="w-px h-5 bg-foreground/10" />
          <div className="flex items-center gap-1.5">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/60 animate-ping" />
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400/90" />
            </span>
            <span className="text-[9px] tracking-[0.28em] uppercase text-foreground/70 font-semibold">Nominal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
