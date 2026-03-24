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
import { WireframeSphereIcon } from "@/components/WireframeSphereIcon";

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
    <div className="min-h-screen w-full flex flex-col">
      {/* Header */}
      <header className="mx-3 mt-3 glass-panel rounded-xl px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="h-8 w-8 hover:bg-muted/20 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="h-4 w-px bg-border/20" />
          <div className="w-9 h-9 rounded-full bg-background/40 border border-border/20 flex items-center justify-center shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)]">
            <WireframeSphereIcon color={sphere.color} size={30} segments={16} />
          </div>
          <div>
            <h1
              className="text-base font-semibold tracking-wide leading-none"
              style={{ color: sphere.color, fontVariant: "small-caps", letterSpacing: "0.06em" }}
            >
              {sphere.name}
            </h1>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/50 mt-0.5 leading-none">
              {sphere.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-panel rounded-lg px-3 py-1.5 border border-border/15">
            <div className="text-[8px] uppercase tracking-[0.15em] text-muted-foreground/40 font-medium">Coherence</div>
            <div className="text-lg font-bold font-mono leading-none mt-0.5" style={{ color: sphere.color }}>78%</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-3 py-3">
        <Tabs defaultValue="overview" className="h-full flex flex-col gap-3">
          <TabsList className="glass-panel rounded-xl w-full justify-start overflow-x-auto px-1 py-1 h-auto gap-0.5">
            {[
              { value: "overview", icon: Activity, label: "Overview" },
              { value: "metrics", icon: Network, label: "Metrics" },
              ...(sphere.hasMapLayers ? [{ value: "map", icon: MapIcon, label: "Map" }] : []),
              ...(sphere.hasStellarLayers ? [{ value: "stellar", icon: Satellite, label: "Stellar" }] : []),
              { value: "correlations", icon: Network, label: "Correlations" },
              { value: "aim", icon: Brain, label: "AIM Report" },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-1.5 text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-muted/20 data-[state=active]:shadow-none"
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="overview" className="mt-0">
              <SphereOverview sphere={sphere} />
            </TabsContent>
            <TabsContent value="metrics" className="mt-0">
              <SphereMetrics sphere={sphere} />
            </TabsContent>
            {sphere.hasMapLayers && (
              <TabsContent value="map" className="mt-0">
                <SphereMap sphere={sphere} />
              </TabsContent>
            )}
            {sphere.hasStellarLayers && (
              <TabsContent value="stellar" className="mt-0">
                <SphereStellar sphere={sphere} />
              </TabsContent>
            )}
            <TabsContent value="correlations" className="mt-0">
              <SphereCorrelations sphere={sphere} />
            </TabsContent>
            <TabsContent value="aim" className="mt-0">
              <SphereAIMReport sphere={sphere} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
