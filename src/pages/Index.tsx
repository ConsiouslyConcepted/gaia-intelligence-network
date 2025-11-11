import { useState } from "react";
import { EarthVisualization } from "@/components/EarthVisualization";
import { SphereDashboard } from "@/components/SphereDashboard";
import { GaiaMonitor } from "@/components/GaiaMonitor";
import { LayerToggle } from "@/components/LayerToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [selectedSphere, setSelectedSphere] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<"inner" | "outer">("inner");

  return (
    <div className="min-h-screen w-full p-4 space-y-4">
      {/* Header */}
      <header className="glass-panel p-6 rounded-xl space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Cosmocentric Planetary Intelligence Dashboard
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-240px)]">
        {/* Earth Visualization */}
        <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden">
          <Tabs defaultValue="holographic" className="h-full">
            <div className="p-4 border-b border-border/30">
              <TabsList className="glass-panel">
                <TabsTrigger value="holographic">Holographic View</TabsTrigger>
                <TabsTrigger value="data">Data Matrix</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="holographic" className="h-[calc(100%-60px)] mt-0">
              <EarthVisualization onSphereSelect={setSelectedSphere} />
            </TabsContent>
            <TabsContent value="data" className="h-[calc(100%-60px)] mt-0 p-4 overflow-auto">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Multi-Sphere Data Matrix</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Geosphere",
                    "Hydrosphere",
                    "Atmosphere",
                    "Biosphere",
                    "Noosphere",
                    "Technosphere",
                    "Magnetosphere",
                    "Crystalsphere",
                  ].map((sphere) => (
                    <button
                      key={sphere}
                      onClick={() => setSelectedSphere(sphere)}
                      className="glass-panel p-4 rounded-lg hover:border-primary/50 transition-all text-left"
                    >
                      <div className="font-semibold">{sphere}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Click to view dashboard
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - Monitors */}
        <div className="space-y-4 h-full overflow-hidden">
          <div className="h-1/2">
            <GaiaMonitor />
          </div>
          <div className="h-1/2">
            <SphereDashboard sphereName={selectedSphere} />
          </div>
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
  );
};

export default Index;
