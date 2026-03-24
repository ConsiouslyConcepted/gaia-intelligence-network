import { useState } from "react";
import { EarthVisualization } from "@/components/EarthVisualization";
import { SPHERE_ARRAY } from "@/types/spheres";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { HGSDashboard } from "@/components/hgs/HGSDashboard";
import { Globe, Activity } from "lucide-react";

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
              <div className="flex-1 overflow-y-auto p-2 flex flex-col justify-between">
                <div>
                  <div className="px-1 pb-2">
                    <h2 className="text-sm font-semibold text-foreground/90">
                      Spheres of Intelligence
                    </h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
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
                          className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/15 transition-all duration-300 cursor-pointer group"
                        >
                          {/* Canvas-style orb with animated ring */}
                          <div className="w-[48px] h-[48px] flex-shrink-0 rounded-full relative flex items-center justify-center">
                            <div
                              className="absolute inset-0 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                              style={{
                                border: `1px solid ${sphere.color}50`,
                                boxShadow: `0 0 8px 1px ${sphere.color}12`,
                              }}
                            />
                            <div
                              className="w-6 h-6 rounded-full transition-transform duration-300 group-hover:scale-110"
                              style={{
                                background: `radial-gradient(circle at 30% 30%, ${sphere.color}dd, ${sphere.color}40 65%, transparent)`,
                                boxShadow: `0 0 8px 2px ${sphere.color}20`,
                              }}
                            />
                          </div>
                          <div className="min-w-0 text-left flex-1">
                            <div className="text-[13px] font-medium text-foreground/85 group-hover:text-foreground transition-colors leading-tight">
                              {sphere.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-[3px] rounded-full bg-muted/20 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${coherence}%`,
                                    background: `linear-gradient(90deg, ${sphere.color}60, ${sphere.color})`,
                                  }}
                                />
                              </div>
                              <span className="text-[9px] font-mono text-muted-foreground/50 w-7 text-right">
                                {coherence}%
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Coherence summary */}
                <div className="mt-2 mx-1 pt-2 border-t border-border/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium">
                      Planetary Coherence
                    </span>
                    <span className="text-[11px] font-semibold text-primary font-mono">76%</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-muted/15 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/50 to-primary"
                      style={{ width: "76%" }}
                    />
                  </div>
                  <p className="text-[8px] text-muted-foreground/40 mt-1.5 text-center tracking-wide">
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
