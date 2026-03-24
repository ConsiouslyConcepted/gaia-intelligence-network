import { useState } from "react";
import { EarthVisualization } from "@/components/EarthVisualization";
import { SPHERE_ARRAY } from "@/types/spheres";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { HGSDashboard } from "@/components/hgs/HGSDashboard";
import { Globe, Activity } from "lucide-react";
import { WireframeSphereIcon } from "@/components/WireframeSphereIcon";

const Index = () => {
  const [activeLayer, setActiveLayer] = useState<"inner" | "outer">("inner");
  const [activeView, setActiveView] = useState<"planetary" | "hgs">("planetary");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full relative">
      {/* View toggle */}
      <div className="fixed top-4 right-4 z-50 flex gap-1 glass-panel rounded-lg p-1">
        <button
          onClick={() => setActiveView("planetary")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeView === "planetary"
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Planetary
        </button>
        <button
          onClick={() => setActiveView("hgs")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeView === "hgs"
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          HGS
        </button>
      </div>

      {activeView === "hgs" ? (
        <HGSDashboard />
      ) : (
        <div className="h-screen w-full flex flex-col overflow-hidden">
          {/* Header */}
          <header className="mx-3 mt-3 mb-0 glass-panel rounded-xl px-4 py-2.5 flex items-center gap-4">
            <h1
              className="text-lg font-semibold tracking-wide text-foreground/90 leading-none"
              style={{ fontVariant: "small-caps", letterSpacing: "0.08em" }}
            >
              Planetary Intelligence
            </h1>
            <div className="h-4 w-px bg-border/30 self-center" />
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium leading-none">
              Real-time holonic map of Gaia's nested spheres of consciousness
            </p>
          </header>

          {/* Main content */}
          <div className="flex-1 px-3 py-3 flex gap-3 min-h-0">
            {/* Earth Visualization */}
            <div className="flex-1 glass-panel rounded-xl overflow-hidden relative min-h-0">
              <EarthVisualization />
              <div className="absolute top-3 right-3">
                <div className="glass-panel backdrop-blur-md rounded-lg px-3 py-1.5 border border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.1)]">
                  <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-primary/90">
                    Holographic Field
                  </span>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <Card className="glass-panel w-[280px] flex-shrink-0 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-3 flex flex-col justify-between">
                <div>
                  <div className="pb-3 border-b border-border/20 mb-2">
                    <h2 className="text-sm font-semibold text-foreground/90">
                      Spheres of Intelligence
                    </h2>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      Tap a sphere to explore its metrics &amp; coherence
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    {SPHERE_ARRAY.map((sphere, i) => {
                      const coherence = [78, 82, 72, 76, 65, 88][i] || 75;
                      return (
                        <button
                          key={sphere.id}
                          onClick={() => navigate(`/sphere/${sphere.id}`)}
                          className="w-full flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-muted/10 transition-all duration-300 cursor-pointer group border border-transparent hover:border-border/20"
                        >
                          {/* Wireframe sphere icon */}
                          <div className="w-11 h-11 flex-shrink-0 relative flex items-center justify-center">
                            <svg viewBox="0 0 44 44" className="w-11 h-11 transition-all duration-500 group-hover:scale-110">
                              <defs>
                                <radialGradient id={`glow-${sphere.id}`} cx="50%" cy="50%" r="50%">
                                  <stop offset="0%" stopColor={sphere.color} stopOpacity="0.12" />
                                  <stop offset="100%" stopColor={sphere.color} stopOpacity="0" />
                                </radialGradient>
                              </defs>
                              <circle cx="22" cy="22" r="17" fill={`url(#glow-${sphere.id})`} />
                              {/* Outer circle */}
                              <circle cx="22" cy="22" r="16" fill="none" stroke={sphere.color} strokeWidth="0.5" opacity="0.35" />
                              {/* Latitude lines */}
                              {[-12, -6, 0, 6, 12].map(offset => (
                                <ellipse key={`lat-${offset}`} cx="22" cy={22 + offset * 0.15} rx={Math.sqrt(Math.max(0, 16*16 - offset*offset*0.7))} ry={Math.max(1, Math.abs(16 - Math.abs(offset)) * 0.35)} fill="none" stroke={sphere.color} strokeWidth="0.3" opacity="0.15" />
                              ))}
                              {/* Longitude lines */}
                              {[0, 30, 60, 90, 120, 150].map(angle => (
                                <ellipse key={`lon-${angle}`} cx="22" cy="22" rx={16 * Math.abs(Math.cos(angle * Math.PI / 180))} ry="16" fill="none" stroke={sphere.color} strokeWidth="0.3" opacity={angle === 0 || angle === 90 ? 0.2 : 0.12} transform={angle !== 0 && angle !== 90 ? undefined : undefined} />
                              ))}
                              {/* Cross meridians for density */}
                              <ellipse cx="22" cy="22" rx="16" ry="5" fill="none" stroke={sphere.color} strokeWidth="0.3" opacity="0.18" />
                              <ellipse cx="22" cy="22" rx="5" ry="16" fill="none" stroke={sphere.color} strokeWidth="0.3" opacity="0.18" />
                              <ellipse cx="22" cy="22" rx="16" ry="10" fill="none" stroke={sphere.color} strokeWidth="0.25" opacity="0.12" transform="rotate(45 22 22)" />
                              <ellipse cx="22" cy="22" rx="16" ry="10" fill="none" stroke={sphere.color} strokeWidth="0.25" opacity="0.12" transform="rotate(-45 22 22)" />
                              <ellipse cx="22" cy="22" rx="16" ry="13" fill="none" stroke={sphere.color} strokeWidth="0.25" opacity="0.1" transform="rotate(30 22 22)" />
                              <ellipse cx="22" cy="22" rx="16" ry="13" fill="none" stroke={sphere.color} strokeWidth="0.25" opacity="0.1" transform="rotate(-30 22 22)" />
                              <ellipse cx="22" cy="22" rx="16" ry="8" fill="none" stroke={sphere.color} strokeWidth="0.25" opacity="0.1" transform="rotate(70 22 22)" />
                              <ellipse cx="22" cy="22" rx="16" ry="8" fill="none" stroke={sphere.color} strokeWidth="0.25" opacity="0.1" transform="rotate(-70 22 22)" />
                              {/* Inner latitude bands */}
                              <ellipse cx="22" cy="22" rx="12" ry="3.5" fill="none" stroke={sphere.color} strokeWidth="0.25" opacity="0.12" />
                              <ellipse cx="22" cy="22" rx="8" ry="2" fill="none" stroke={sphere.color} strokeWidth="0.2" opacity="0.1" />
                              {/* Core */}
                              <circle cx="22" cy="22" r="1.5" fill={sphere.color} opacity="0.4" />
                            </svg>
                          </div>
                          <div className="min-w-0 text-left flex-1">
                            <div className="text-sm font-medium text-foreground/85 group-hover:text-foreground transition-colors">
                              {sphere.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-[2px] rounded-full bg-border/15 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{
                                    width: `${coherence}%`,
                                    background: `linear-gradient(90deg, ${sphere.color}40, ${sphere.color}cc)`,
                                  }}
                                />
                              </div>
                              <span className="text-[9px] font-mono text-muted-foreground/40 w-7 text-right">
                                {coherence}%
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-3 pt-2 border-t border-border/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40 font-medium">
                      Planetary Coherence
                    </span>
                    <span className="text-[11px] font-semibold text-primary/80 font-mono">76%</span>
                  </div>
                  <div className="w-full h-[2px] rounded-full bg-border/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/40 to-primary/80"
                      style={{ width: "76%" }}
                    />
                  </div>
                  <p className="text-[8px] text-muted-foreground/30 mt-2 text-center tracking-wider">
                    Monitoring 6 spheres · Gaia Intelligence Network
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
