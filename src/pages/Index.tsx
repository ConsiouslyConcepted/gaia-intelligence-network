import { useState, useEffect, useMemo } from "react";
import { EarthVisualization } from "@/components/EarthVisualization";
import { SPHERE_ARRAY } from "@/types/spheres";
import { useNavigate } from "react-router-dom";
import { HGSDashboard } from "@/components/hgs/HGSDashboard";
import { Activity, Radar, Signal, Zap, ArrowRight } from "lucide-react";
import { WireframeSphereIcon } from "@/components/WireframeSphereIcon";

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

  const liveReadouts = useMemo(() => ({
    left: [
      { label: "Seismic Index", value: (3.2 + Math.sin(tick * 0.3) * 0.4).toFixed(1), unit: "Mw", color: "#cc5533", trend: Array.from({ length: 12 }, (_, i) => 0.4 + Math.sin((tick + i) * 0.3) * 0.3) },
      { label: "Solar Flux", value: Math.round(142 + Math.sin(tick * 0.15) * 12).toString(), unit: "SFU", color: "#e8c86a", trend: Array.from({ length: 12 }, (_, i) => 0.5 + Math.sin((tick + i) * 0.15) * 0.3) },
      { label: "Kp Index", value: (4.3 + Math.sin(tick * 0.2) * 0.8).toFixed(1), unit: "", color: "#4466dd", trend: Array.from({ length: 12 }, (_, i) => 0.45 + Math.sin((tick + i) * 0.2) * 0.35) },
    ],
    right: [
      { label: "TEC Global", value: (28.4 + Math.cos(tick * 0.12) * 3.2).toFixed(1), unit: "TECU", color: "#4488cc", trend: Array.from({ length: 12 }, (_, i) => 0.5 + Math.cos((tick + i) * 0.12) * 0.3) },
      { label: "Schumann Res", value: (7.83 + Math.sin(tick * 0.08) * 0.15).toFixed(2), unit: "Hz", color: "#d4a56a", trend: Array.from({ length: 12 }, (_, i) => 0.5 + Math.sin((tick + i) * 0.08) * 0.2) },
      { label: "B-Field Str", value: (48.2 + Math.cos(tick * 0.1) * 2.1).toFixed(1), unit: "μT", color: "#7ecbcb", trend: Array.from({ length: 12 }, (_, i) => 0.5 + Math.cos((tick + i) * 0.1) * 0.25) },
    ],
  }), [tick]);

  if (activeView === "hgs") {
    return <HGSDashboard onSwitchView={() => setActiveView("planetary")} />;
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-background">
      {/* Full-screen globe */}
      <div className="absolute inset-0 z-0">
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
        <HudPanel className="pointer-events-auto px-4 py-2.5 flex items-center justify-between" glow="#d4a56a">
          {/* Left: Title */}
          <div className="flex items-center gap-3">
            <Radar className="w-4 h-4 text-primary/60" />
            <div>
              <h1 className="text-[11px] font-bold tracking-[0.25em] uppercase text-foreground/80">
                Planetary Intelligence
              </h1>
              <p className="text-[7px] tracking-[0.25em] uppercase text-muted-foreground/30 mt-0.5">
                Gaia Holonic Observatory · Digital Twin
              </p>
            </div>
          </div>

          {/* Center: Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400/40 animate-ping" />
              </div>
              <span className="text-[8px] tracking-[0.15em] uppercase text-emerald-400/60 font-mono font-medium">Active</span>
            </div>
            <div className="h-3 w-px bg-border/15" />
            <span className="text-[9px] font-mono text-muted-foreground/35 tabular-nums">
              {time.toISOString().replace("T", " ").slice(0, 19)} UTC
            </span>
            <div className="h-3 w-px bg-border/15" />
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-1 h-1 rounded-full transition-colors duration-500" style={{ backgroundColor: `${SPHERE_ARRAY[i].color}${coherenceValues[i] > 70 ? "aa" : "40"}` }} />
              ))}
            </div>
          </div>

          {/* Right: View toggle */}
          <div className="flex gap-1.5 rounded-xl p-1" style={{ background: "hsla(240,20%,12%,0.6)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)" }}>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[11px] font-semibold tracking-wider uppercase transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, hsla(174,60%,50%,0.15) 0%, hsla(174,60%,40%,0.1) 100%)",
                color: "#5ce0d2",
                border: "1px solid hsla(174,60%,50%,0.3)",
                boxShadow: "0 0 16px hsla(174,60%,50%,0.1), inset 0 1px 0 hsla(174,60%,70%,0.1), 0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              <Signal className="w-3.5 h-3.5" />Planetary
            </button>
            <button
              onClick={() => setActiveView("hgs")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[11px] font-medium tracking-wider uppercase transition-all duration-300 hover:bg-foreground/[0.04]"
              style={{ color: "hsla(38,60%,60%,0.7)" }}
            >
              <Activity className="w-3.5 h-3.5" style={{ color: "#e8b960" }} />HGS
            </button>
          </div>
        </HudPanel>
      </div>

      {/* ─── LEFT HUD ─── */}
      <div className="absolute left-4 top-[72px] bottom-14 z-10 flex flex-col gap-3 pointer-events-none w-[220px]">
        {/* Sphere navigation */}
        <HudPanel className="pointer-events-auto p-3" glow="#cc5533">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[8px] tracking-[0.2em] uppercase text-muted-foreground/40 font-medium">Sphere Systems</span>
            <span className="text-[7px] font-mono text-muted-foreground/25">01–03</span>
          </div>
          <div className="space-y-0.5">
            {SPHERE_ARRAY.slice(0, 3).map((sphere, i) => {
              const coherence = coherenceValues[i];
              return (
                <button
                  key={sphere.id}
                  onClick={() => navigate(`/sphere/${sphere.id}`)}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md transition-all duration-300 cursor-pointer group hover:bg-foreground/[0.03]"
                >
                  <div className="relative">
                    <WireframeSphereIcon color={sphere.color} size={26} segments={12} className="transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background/50" style={{ backgroundColor: coherence > 75 ? "#4ade80" : coherence > 60 ? "#fbbf24" : "#ef4444", opacity: 0.8 }} />
                  </div>
                  <div className="min-w-0 text-left flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-foreground/70 group-hover:text-foreground tracking-wide uppercase">{sphere.name}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-muted-foreground/20 group-hover:text-foreground/40 transition-all group-hover:translate-x-0.5" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 h-[2px] rounded-full overflow-hidden" style={{ backgroundColor: `${sphere.color}10` }}>
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${coherence}%`, background: `linear-gradient(90deg, ${sphere.color}50, ${sphere.color})` }} />
                      </div>
                      <span className="text-[9px] font-mono tabular-nums w-7 text-right" style={{ color: `${sphere.color}aa` }}>{coherence}%</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </HudPanel>

        {/* Live data feeds */}
        <HudPanel className="pointer-events-auto p-3 mt-auto" glow="#4488cc">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Zap className="w-3 h-3 text-accent/50" />
            <span className="text-[8px] tracking-[0.2em] uppercase text-muted-foreground/40 font-medium">Live Feeds</span>
          </div>
          <div className="space-y-2.5">
            {liveReadouts.left.map((d) => (
              <div key={d.label}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[8px] uppercase tracking-[0.12em] text-muted-foreground/35">{d.label}</span>
                  <span className="text-[12px] font-mono font-semibold tabular-nums" style={{ color: `${d.color}cc` }}>
                    {d.value}<span className="text-[8px] text-muted-foreground/25 ml-0.5 font-normal">{d.unit}</span>
                  </span>
                </div>
                <MiniGraph color={d.color} data={d.trend} />
              </div>
            ))}
          </div>
        </HudPanel>
      </div>

      {/* ─── RIGHT HUD ─── */}
      <div className="absolute right-4 top-[72px] bottom-14 z-10 flex flex-col gap-3 pointer-events-none w-[220px]">
        {/* Sphere navigation continued */}
        <HudPanel className="pointer-events-auto p-3" glow="#4466dd">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[8px] tracking-[0.2em] uppercase text-muted-foreground/40 font-medium">Sphere Systems</span>
            <span className="text-[7px] font-mono text-muted-foreground/25">04–06</span>
          </div>
          <div className="space-y-0.5">
            {SPHERE_ARRAY.slice(3).map((sphere, i) => {
              const coherence = coherenceValues[i + 3];
              return (
                <button
                  key={sphere.id}
                  onClick={() => navigate(`/sphere/${sphere.id}`)}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md transition-all duration-300 cursor-pointer group hover:bg-foreground/[0.03]"
                >
                  <div className="min-w-0 text-right flex-1">
                    <div className="flex items-center justify-between">
                      <ArrowRight className="w-2.5 h-2.5 text-muted-foreground/20 group-hover:text-foreground/40 transition-all group-hover:-translate-x-0.5 rotate-180" />
                      <span className="text-[10px] font-medium text-foreground/70 group-hover:text-foreground tracking-wide uppercase">{sphere.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] font-mono tabular-nums w-7 text-left" style={{ color: `${sphere.color}aa` }}>{coherence}%</span>
                      <div className="flex-1 h-[2px] rounded-full overflow-hidden" style={{ backgroundColor: `${sphere.color}10` }}>
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${coherence}%`, background: `linear-gradient(90deg, ${sphere.color}50, ${sphere.color})` }} />
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <WireframeSphereIcon color={sphere.color} size={26} segments={12} className="transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 rounded-full border border-background/50" style={{ backgroundColor: coherence > 75 ? "#4ade80" : coherence > 60 ? "#fbbf24" : "#ef4444", opacity: 0.8 }} />
                  </div>
                </button>
              );
            })}
          </div>
        </HudPanel>

        {/* Right data feeds */}
        <HudPanel className="pointer-events-auto p-3 mt-auto" glow="#7ecbcb">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Zap className="w-3 h-3 text-accent/50" />
            <span className="text-[8px] tracking-[0.2em] uppercase text-muted-foreground/40 font-medium">Field Metrics</span>
          </div>
          <div className="space-y-2.5">
            {liveReadouts.right.map((d) => (
              <div key={d.label}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[8px] uppercase tracking-[0.12em] text-muted-foreground/35">{d.label}</span>
                  <span className="text-[12px] font-mono font-semibold tabular-nums" style={{ color: `${d.color}cc` }}>
                    {d.value}<span className="text-[8px] text-muted-foreground/25 ml-0.5 font-normal">{d.unit}</span>
                  </span>
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
