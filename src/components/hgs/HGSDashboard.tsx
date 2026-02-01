import { Orbit, Info } from "lucide-react";
import { CoherenceField } from "@/components/hgs/CoherenceField";
import { GlobalCoherenceStatus } from "@/components/hgs/GlobalCoherenceStatus";
import { ValueFlowHarmonics } from "@/components/hgs/ValueFlowHarmonics";
import { ResonanceLoadMap } from "@/components/hgs/ResonanceLoadMap";
import { ScenarioPhaseDrift } from "@/components/hgs/ScenarioPhaseDrift";
import { CirculationConditions } from "@/components/hgs/CirculationConditions";
import { AdvisoryInsights } from "@/components/hgs/AdvisoryInsights";

export const HGSDashboard = () => {
  return (
    <div className="min-h-screen w-full p-4 space-y-4 bg-gradient-to-b from-background via-background to-background/90">
      {/* Header */}
      <header className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Orbit className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Harmonic Guidance System</h1>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Coherence Field - spans 3 columns */}
        <div className="lg:col-span-3">
          <CoherenceField />
        </div>

        {/* Global Coherence Status - right sidebar */}
        <div className="lg:col-span-1">
          <GlobalCoherenceStatus />
        </div>
      </div>

      {/* Middle Row - 3 equal panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ValueFlowHarmonics />
        <ResonanceLoadMap />
        <ScenarioPhaseDrift />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Circulation Conditions - spans 2 columns */}
        <div className="lg:col-span-2">
          <CirculationConditions />
        </div>

        {/* Advisory Insights */}
        <div className="lg:col-span-1">
          <AdvisoryInsights />
        </div>
      </div>

      {/* Footer Disclaimer */}
      <footer className="glass-panel p-3 rounded-lg text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Info className="w-4 h-4" />
          <span>
            This dashboard provides interpretive intelligence only. It does not authorize, execute, or govern economic action.
          </span>
        </div>
      </footer>
    </div>
  );
};
