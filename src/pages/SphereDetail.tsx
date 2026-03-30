import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Scan, Activity, GitBranch } from "lucide-react";
import { CommonsIcon } from "@/components/CommonsIcon";
import { SPHERES, SphereId } from "@/types/spheres";
import { WireframeSphereIcon } from "@/components/WireframeSphereIcon";
import { AnatomyPanel } from "@/components/sphere-detail/AnatomyPanel";
import { LiveDynamicsPanel } from "@/components/sphere-detail/LiveDynamicsPanel";
import { DataPanel } from "@/components/sphere-detail/DataPanel";
import { CouplingPanel } from "@/components/sphere-detail/CouplingPanel";

const ACCENT = "#5ce0d2";

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
            <WireframeSphereIcon color={ACCENT} size={30} segments={16} />
          </div>
          <div>
            <h1
              className="text-base font-semibold tracking-wide leading-none text-foreground/90"
              style={{ fontVariant: "small-caps", letterSpacing: "0.06em" }}
            >
              {sphere.name}
            </h1>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/50 mt-0.5 leading-none">
              {sphere.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/commons")}
            className="hover:opacity-80 transition-opacity"
            title="Planetary Commons Data"
          >
            <CommonsIcon size={56} />
          </button>
          <div className="glass-panel rounded-lg px-3 py-1.5 border border-border/15">
            <div className="text-[8px] uppercase tracking-[0.15em] text-muted-foreground/40 font-medium">Domain</div>
            <div className="text-xs font-semibold font-mono leading-none mt-0.5 text-foreground/80">
              {sphere.id === "geosphere" ? "Solid Earth" :
               sphere.id === "biosphere" ? "Living Systems" :
               sphere.id === "magnetosphere" ? "Field Shield" :
               sphere.id === "ionosphere" ? "Plasma Layer" :
               sphere.id === "noosphere" ? "Collective" :
               "Resonance"}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-3 py-3">
        <Tabs defaultValue="anatomy" className="h-full flex flex-col gap-3">
          <TabsList className="glass-panel rounded-xl w-full justify-start overflow-x-auto px-1 py-1 h-auto gap-0.5">
            {[
              { value: "anatomy", icon: Scan, label: "Anatomy", isCustom: false },
              { value: "live-dynamics", icon: Activity, label: "Live Dynamics", isCustom: false },
              { value: "data", icon: null, label: "Data", isCustom: true },
              { value: "coupling", icon: GitBranch, label: "Coupling", isCustom: false },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-1.5 text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-muted/20 data-[state=active]:shadow-none"
              >
                {tab.isCustom ? <CommonsIcon size={14} /> : tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="anatomy" className="mt-0">
              <AnatomyPanel sphere={sphere} accent={ACCENT} />
            </TabsContent>
            <TabsContent value="live-dynamics" className="mt-0">
              <LiveDynamicsPanel sphere={sphere} accent={ACCENT} />
            </TabsContent>
            <TabsContent value="data" className="mt-0">
              <DataPanel sphere={sphere} accent={ACCENT} />
            </TabsContent>
            <TabsContent value="coupling" className="mt-0">
              <CouplingPanel sphere={sphere} accent={ACCENT} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
