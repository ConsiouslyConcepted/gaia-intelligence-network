import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity, Map as MapIcon, Satellite, Network, Brain } from "lucide-react";
import { SPHERES, SphereId } from "@/types/spheres";
import { SphereOverview } from "@/components/sphere-detail/SphereOverview";
import { SphereMetrics } from "@/components/sphere-detail/SphereMetrics";
import { SphereMap } from "@/components/sphere-detail/SphereMap";
import { SphereStellar } from "@/components/sphere-detail/SphereStellar";
import { SphereCorrelations } from "@/components/sphere-detail/SphereCorrelations";
import { SphereAIMReport } from "@/components/sphere-detail/SphereAIMReport";

export default function SphereDetail() {
  const { sphereId } = useParams<{ sphereId: SphereId }>();
  const navigate = useNavigate();
  
  const sphere = sphereId ? SPHERES[sphereId] : null;

  if (!sphere) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sphere Not Found</h1>
          <Button onClick={() => navigate("/")}>Return to Overview</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <header className="glass-panel p-4 border-b border-border/30">
        <div className="flex items-center justify-between max-w-[2000px] mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: sphere.color, boxShadow: `0 0 10px ${sphere.color}` }}
              />
              <div>
                <h1 className="text-2xl font-bold" style={{ color: sphere.color }}>
                  {sphere.name}
                </h1>
                <p className="text-sm text-muted-foreground">{sphere.description}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Coherence Level</div>
              <div className="text-xl font-bold text-primary">78%</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[2000px] mx-auto p-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="glass-panel w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-2">
              <Network className="w-4 h-4" />
              Metrics
            </TabsTrigger>
            {sphere.hasMapLayers && (
              <TabsTrigger value="map" className="gap-2">
                <MapIcon className="w-4 h-4" />
                Map
              </TabsTrigger>
            )}
            {sphere.hasStellarLayers && (
              <TabsTrigger value="stellar" className="gap-2">
                <Satellite className="w-4 h-4" />
                Stellar/Space
              </TabsTrigger>
            )}
            <TabsTrigger value="correlations" className="gap-2">
              <Network className="w-4 h-4" />
              Correlations
            </TabsTrigger>
            <TabsTrigger value="aim" className="gap-2">
              <Brain className="w-4 h-4" />
              AIM Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SphereOverview sphere={sphere} />
          </TabsContent>

          <TabsContent value="metrics">
            <SphereMetrics sphere={sphere} />
          </TabsContent>

          {sphere.hasMapLayers && (
            <TabsContent value="map">
              <SphereMap sphere={sphere} />
            </TabsContent>
          )}

          {sphere.hasStellarLayers && (
            <TabsContent value="stellar">
              <SphereStellar sphere={sphere} />
            </TabsContent>
          )}

          <TabsContent value="correlations">
            <SphereCorrelations sphere={sphere} />
          </TabsContent>

          <TabsContent value="aim">
            <SphereAIMReport sphere={sphere} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
