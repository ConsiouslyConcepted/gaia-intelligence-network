import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EarthVisualization } from "@/components/EarthVisualization";
import { GaiaMonitor } from "@/components/GaiaMonitor";
import { LayerToggle } from "@/components/LayerToggle";
import { SPHERE_ARRAY } from "@/types/spheres";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
                  <div className="space-y-1">
                    {SPHERE_ARRAY.map((sphere) => (
                      <button
                        key={sphere.id}
                        onClick={() => navigate(`/sphere/${sphere.id}`)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/15 transition-all duration-200 cursor-pointer group"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex-shrink-0 border border-white/10"
                          style={{
                            background: `radial-gradient(circle at 35% 35%, ${sphere.color}80, ${sphere.color}20)`,
                            boxShadow: `0 0 10px 2px ${sphere.color}30`,
                          }}
                        />
                        <div className="min-w-0 text-left">
                          <div className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                            {sphere.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground/60 truncate">
                            {sphere.description.split("—")[0].trim()}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Coherence summary */}
                <div className="mt-3 px-1 pt-2 border-t border-border/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">Planetary Coherence</span>
                    <span className="text-xs font-semibold text-primary">76%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted/20 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary" style={{ width: "76%" }} />
                  </div>
                  <p className="text-[9px] text-muted-foreground/50 mt-2 text-center">
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
