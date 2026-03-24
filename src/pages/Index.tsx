import { useState, useEffect } from "react";
import { EarthVisualization } from "@/components/EarthVisualization";
import { SPHERE_ARRAY } from "@/types/spheres";
import { useNavigate } from "react-router-dom";
import { HGSDashboard } from "@/components/hgs/HGSDashboard";
import { Activity } from "lucide-react";
import { WireframeSphereIcon } from "@/components/WireframeSphereIcon";

const Index = () => {
  const [activeView, setActiveView] = useState<"planetary" | "hgs">("planetary");
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const coherenceValues = [78, 82, 72, 76, 65, 88];
  const globalCoherence = Math.round(coherenceValues.reduce((a, b) => a + b, 0) / coherenceValues.length);

  if (activeView === "hgs") {
    return (
      <div className="min-h-screen w-full relative">
        <div className="fixed top-4 right-4 z-50 flex gap-1 glass-panel rounded-lg p-1">
          <button onClick={() => setActiveView("planetary")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-all">
            Planetary
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary/20 text-primary transition-all">
            <Activity className="w-3.5 h-3.5" />HGS
          </button>
        </div>
        <HGSDashboard />
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-background">
      {/* Full-screen globe */}
      <div className="absolute inset-0 z-0">
        <EarthVisualization />
      </div>

      {/* Scanline overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground) / 0.1) 2px, hsl(var(--foreground) / 0.1) 4px)" }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex items-center justify-between px-5 py-3">
          {/* Top-left: Title */}
          <div className="pointer-events-auto">
            <h1 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-foreground/70" style={{ fontVariant: "small-caps" }}>
              Planetary Intelligence
            </h1>
            <p className="text-[8px] tracking-[0.25em] uppercase text-muted-foreground/40 mt-0.5">
              Gaia Holonic Observatory
            </p>
          </div>

          {/* Top-center: Status */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/80 animate-pulse" />
              <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground/50 font-mono">Systems Online</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/40">
              {time.toISOString().replace("T", " · ").slice(0, 21)} UTC
            </span>
          </div>

          {/* Top-right: View toggle */}
          <div className="pointer-events-auto flex gap-1 glass-panel rounded-lg p-1">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary/20 text-primary transition-all">
              Planetary
            </button>
            <button onClick={() => setActiveView("hgs")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-all">
              <Activity className="w-3.5 h-3.5" />HGS
            </button>
          </div>
        </div>
      </div>

      {/* Left HUD panels */}
      <div className="absolute left-4 top-16 bottom-16 z-10 flex flex-col justify-between pointer-events-none w-[200px]">
        {/* Sphere list */}
        <div className="pointer-events-auto space-y-1">
          {SPHERE_ARRAY.slice(0, 3).map((sphere, i) => {
            const coherence = coherenceValues[i];
            return (
              <button
                key={sphere.id}
                onClick={() => navigate(`/sphere/${sphere.id}`)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-300 cursor-pointer group border border-transparent hover:border-border/30 hover:bg-background/30 backdrop-blur-sm"
              >
                <WireframeSphereIcon color={sphere.color} size={28} segments={12} className="transition-transform duration-500 group-hover:scale-110 flex-shrink-0" />
                <div className="min-w-0 text-left flex-1">
                  <div className="text-[10px] font-medium text-foreground/70 group-hover:text-foreground tracking-wide uppercase">{sphere.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="flex-1 h-[1.5px] rounded-full bg-border/15 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${coherence}%`, background: `linear-gradient(90deg, ${sphere.color}40, ${sphere.color}cc)` }} />
                    </div>
                    <span className="text-[8px] font-mono text-muted-foreground/40 w-6 text-right">{coherence}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Left bottom data readouts */}
        <div className="pointer-events-auto space-y-2">
          {[
            { label: "Seismic Index", value: "3.2", unit: "Mw" },
            { label: "Solar Flux", value: "142", unit: "SFU" },
            { label: "Kp Index", value: "4.3", unit: "" },
          ].map((d) => (
            <div key={d.label} className="flex items-baseline justify-between px-2 py-1 rounded border border-border/10 bg-background/20 backdrop-blur-sm">
              <span className="text-[8px] uppercase tracking-[0.1em] text-muted-foreground/40">{d.label}</span>
              <span className="text-[11px] font-mono text-foreground/70">{d.value}<span className="text-[8px] text-muted-foreground/30 ml-0.5">{d.unit}</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* Right HUD panels */}
      <div className="absolute right-4 top-16 bottom-16 z-10 flex flex-col justify-between pointer-events-none w-[200px]">
        {/* Sphere list continued */}
        <div className="pointer-events-auto space-y-1">
          {SPHERE_ARRAY.slice(3).map((sphere, i) => {
            const coherence = coherenceValues[i + 3];
            return (
              <button
                key={sphere.id}
                onClick={() => navigate(`/sphere/${sphere.id}`)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-300 cursor-pointer group border border-transparent hover:border-border/30 hover:bg-background/30 backdrop-blur-sm"
              >
                <div className="min-w-0 text-right flex-1">
                  <div className="text-[10px] font-medium text-foreground/70 group-hover:text-foreground tracking-wide uppercase">{sphere.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[8px] font-mono text-muted-foreground/40 w-6 text-left">{coherence}%</span>
                    <div className="flex-1 h-[1.5px] rounded-full bg-border/15 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${coherence}%`, background: `linear-gradient(90deg, ${sphere.color}40, ${sphere.color}cc)` }} />
                    </div>
                  </div>
                </div>
                <WireframeSphereIcon color={sphere.color} size={28} segments={12} className="transition-transform duration-500 group-hover:scale-110 flex-shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Right bottom data readouts */}
        <div className="pointer-events-auto space-y-2">
          {[
            { label: "TEC Global", value: "28.4", unit: "TECU" },
            { label: "Schumann", value: "7.83", unit: "Hz" },
            { label: "Field Str", value: "48.2", unit: "μT" },
          ].map((d) => (
            <div key={d.label} className="flex items-baseline justify-between px-2 py-1 rounded border border-border/10 bg-background/20 backdrop-blur-sm">
              <span className="text-[8px] uppercase tracking-[0.1em] text-muted-foreground/40">{d.label}</span>
              <span className="text-[11px] font-mono text-foreground/70">{d.value}<span className="text-[8px] text-muted-foreground/30 ml-0.5">{d.unit}</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom HUD bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex items-end justify-between px-5 pb-4">
          {/* Bottom-left: sector readouts */}
          <div className="flex gap-3 pointer-events-auto">
            {SPHERE_ARRAY.slice(0, 3).map((s, i) => (
              <div key={s.id} className="text-center">
                <div className="text-[8px] uppercase tracking-widest text-muted-foreground/30">{s.name.slice(0, 4)}</div>
                <div className="text-sm font-mono font-semibold" style={{ color: `${s.color}aa` }}>{coherenceValues[i]}</div>
              </div>
            ))}
          </div>

          {/* Bottom-center: global coherence */}
          <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
            <div className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/40">Planetary Coherence</div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-[2px] rounded-full bg-border/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary/40 to-primary/80 transition-all" style={{ width: `${globalCoherence}%` }} />
              </div>
              <span className="text-sm font-mono font-semibold text-primary/80">{globalCoherence}%</span>
            </div>
            <p className="text-[7px] text-muted-foreground/25 tracking-[0.15em] uppercase">
              Monitoring 6 spheres · Gaia Intelligence Network
            </p>
          </div>

          {/* Bottom-right: sector readouts */}
          <div className="flex gap-3 pointer-events-auto">
            {SPHERE_ARRAY.slice(3).map((s, i) => (
              <div key={s.id} className="text-center">
                <div className="text-[8px] uppercase tracking-widest text-muted-foreground/30">{s.name.slice(0, 4)}</div>
                <div className="text-sm font-mono font-semibold" style={{ color: `${s.color}aa` }}>{coherenceValues[i + 3]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Corner bracket accents */}
      <div className="absolute top-2 left-2 w-6 h-6 border-l border-t border-border/20 rounded-tl z-10 pointer-events-none" />
      <div className="absolute top-2 right-2 w-6 h-6 border-r border-t border-border/20 rounded-tr z-10 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-6 h-6 border-l border-b border-border/20 rounded-bl z-10 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-6 h-6 border-r border-b border-border/20 rounded-br z-10 pointer-events-none" />
    </div>
  );
};

export default Index;
