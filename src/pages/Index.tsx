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
        <div className="p-4 space-y-4">
          {/* Header */}
          <header className="glass-panel p-6 rounded-xl space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Planetary Intelligence Dashboard
            </h1>
            <p className="text-muted-foreground">
              Real-time holonic map of Gaia's nested spheres of consciousness
            </p>
          </header>

          {/* Layer Toggle */}
          <div className="flex justify-center">
            <LayerToggle activeLayer={activeLayer} onToggle={setActiveLayer} />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-240px)]">
            {/* Sphere List */}
            <Card className="glass-panel p-4 space-y-3 overflow-auto">
              <h3 className="font-semibold text-lg mb-3">Planetary Spheres</h3>
              <div className="space-y-2">
                {SPHERE_ARRAY.map((sphere) => (
                  <button
                    key={sphere.id}
                    onClick={() => navigate(`/sphere/${sphere.id}`)}
                    className="w-full glass-panel p-3 rounded-lg hover:border-primary/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: sphere.color, boxShadow: `0 0 8px ${sphere.color}` }}
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{sphere.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Coherence: {Math.floor(70 + Math.random() * 25)}%
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs bg-coherence-high/20 text-coherence-high border-coherence-high/30">
                        Active
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Earth Visualization */}
            <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden">
              <Tabs defaultValue="holographic" className="h-full">
                <div className="p-4 border-b border-border/30">
                  <TabsList className="glass-panel">
                    <TabsTrigger value="holographic">Holographic View</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="holographic" className="h-[calc(100%-60px)] mt-0">
                  <EarthVisualization />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Sidebar - Global Monitor */}
            <div className="h-full overflow-hidden">
              <GaiaMonitor />
            </div>
          </div>

          {/* Footer */}
          <footer className="glass-panel p-4 rounded-xl text-center text-sm text-muted-foreground">
            <p>
              Gaia Intelligence Network • Monitoring planetary coherence across all spheres •{" "}
              <span className="text-primary">Online</span>
            </p>
          </footer>
        </div>
      )}
    </div>
  );
};

export default Index;
