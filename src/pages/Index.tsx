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

const HudPanel = ({ children, className = "", glow }: { children: React.ReactNode; className?: string; glow?: string }) => (
  <div
    className={`relative rounded-xl border border-border/30 backdrop-blur-2xl ${className}`}
    style={{
      background: "linear-gradient(145deg, hsla(240,20%,13%,0.92) 0%, hsla(240,25%,9%,0.88) 50%, hsla(240,22%,7%,0.92) 100%)",
      boxShadow: glow
        ? `0 0 40px ${glow}15, inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)`
        : "inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
    }}
  >
    <div className="absolute top-0 left-4 right-4 h-px" style={{ background: glow ? `linear-gradient(90deg, transparent, ${glow}50, transparent)` : "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }} />
    <div className="absolute bottom-0 left-6 right-6 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)" }} />
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
      {/* Full-screen globe */}
      <div className="absolute inset-0 z-0 translate-y-[8%]">
        <EarthVisualization />
      </div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 30%, hsla(240,30%,3%,0.6) 80%, hsla(240,30%,3%,0.9) 100%)"
      }} />

      {/* Scanline overlay */}
      <div className="absolute inset-0 z-[2] pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground) / 0.08) 2px, hsl(var(--foreground) / 0.08) 4px)" }}
      />

      {/* ─── TOP BAR ─── */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none px-4 pt-3">
        <div
          className="pointer-events-auto px-4 py-2.5 flex items-center justify-between relative rounded-xl backdrop-blur-2xl"
          style={{
            background:
              "linear-gradient(180deg, hsla(240,22%,18%,0.95) 0%, hsla(240,25%,11%,0.95) 45%, hsla(240,30%,6%,0.96) 100%)",
            border: "1px solid hsla(0,0%,100%,0.08)",
            boxShadow:
              "inset 0 1px 0 hsla(0,0%,100%,0.14), inset 0 -1px 0 hsla(0,0%,0%,0.6), inset 0 -10px 24px -10px hsla(0,0%,0%,0.5), 0 12px 28px -6px rgba(0,0,0,0.75), 0 24px 60px -20px rgba(0,0,0,0.9), 0 0 0 1px hsla(0,0%,0%,0.4)",
          }}
        >
          {/* Glossy top highlight */}
          <div className="pointer-events-none absolute top-0 left-6 right-6 h-px" style={{ background: "linear-gradient(90deg, transparent, hsla(0,0%,100%,0.35), transparent)" }} />
          {/* Subtle bottom edge shadow */}
          <div className="pointer-events-none absolute -bottom-3 left-8 right-8 h-3 rounded-full blur-md" style={{ background: "hsla(0,0%,0%,0.55)" }} />

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
            <div className="flex gap-1.5 rounded-2xl p-1.5" style={{ background: "hsla(240,25%,8%,0.7)", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.03)", border: "1px solid hsla(0,0%,100%,0.06)" }}>
              <button
                className="min-w-[170px] text-center px-6 py-2.5 rounded-xl text-[11px] font-semibold tracking-[0.18em] uppercase transition-all duration-300"
                style={{
                  background: "linear-gradient(180deg, hsla(0,0%,100%,0.10) 0%, hsla(0,0%,100%,0.04) 100%)",
                  color: "hsla(0,0%,100%,0.95)",
                  border: "1px solid hsla(0,0%,100%,0.14)",
                  boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.12), 0 4px 14px rgba(0,0,0,0.45), 0 0 20px hsla(38,40%,60%,0.08)",
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
              style={{ color: "hsla(174,60%,60%,0.7)", border: "1px solid hsla(0,0%,100%,0.06)", background: "hsla(240,25%,8%,0.5)" }}
              title="Planetary Commons Data"
            >
              <CommonsIcon size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── LEFT HUD: All Spheres ─── */}
      <div className="absolute left-4 top-[58%] -translate-y-1/2 z-10 flex flex-col pointer-events-none w-[250px]">
        <HudPanel className="pointer-events-auto p-4 pb-5 h-[620px]" glow="#5ce0d2">
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
      <div className="absolute right-4 top-[58%] -translate-y-1/2 z-10 flex flex-col pointer-events-none w-[250px]">
        <HudPanel className="pointer-events-auto p-4 pb-5 h-[620px]" glow="#4488cc">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40 font-medium">Sphere Signals</span>
            <span className="text-[8px] font-mono text-muted-foreground/25">Live</span>
          </div>
          <div className="space-y-2.5">
            {liveReadouts.map((d) => (
              <div key={d.label}>
                <div className="flex items-baseline justify-between mb-0.5">
                  <span className="text-[8px] uppercase tracking-[0.12em] text-foreground/80">{d.label}</span>
                  <span className="text-[12px] font-mono font-semibold tabular-nums" style={{ color: `${d.color}cc` }}>
                    {d.value}<span className="text-[8px] text-muted-foreground/25 ml-0.5 font-normal">{d.unit}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[7px] tracking-[0.1em] uppercase" style={{ color: `${d.color}50` }}>{d.sphere}</span>
                </div>
                <MiniGraph color={d.color} data={d.trend} />
              </div>
            ))}
          </div>
        </HudPanel>
      </div>
      {/* Corner brackets */}
      {[
        "top-3 left-3 border-l border-t rounded-tl",
        "top-3 right-3 border-r border-t rounded-tr",
        "bottom-3 left-3 border-l border-b rounded-bl",
        "bottom-3 right-3 border-r border-b rounded-br",
      ].map((pos) => (
        <div key={pos} className={`absolute ${pos} w-5 h-5 border-border/15 z-10 pointer-events-none`} />
      ))}
    </div>
  );
};

export default Index;
