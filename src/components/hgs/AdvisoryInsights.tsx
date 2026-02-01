import { Card } from "@/components/ui/card";
import { AlertTriangle, List, Activity, Bell, Info } from "lucide-react";

export const AdvisoryInsights = () => {
  return (
    <Card className="glass-panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-coherence-medium" />
          <span className="text-sm font-semibold">Advisory Insights</span>
        </div>
        <div className="flex gap-2">
          <button className="p-1 rounded hover:bg-muted/30 transition-colors">
            <Activity className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-1 rounded hover:bg-muted/30 transition-colors">
            <List className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Current circulation approaching relational saturation. Exchange activity remains viable within reduced pacing bounds. A recovery window is likely within the next end.
      </p>

      <div className="flex gap-3 pt-2 border-t border-border/30">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xs">
            <div className="text-muted-foreground">Close</div>
            <div className="font-medium">&lt;5.00pns</div>
            <div className="text-muted-foreground">Assurance: <span className="text-secondary">Structural</span></div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-full bg-coherence-low/20 flex items-center justify-center">
            <Bell className="w-4 h-4 text-coherence-low" />
          </div>
          <div className="text-xs">
            <div className="text-muted-foreground">&lt;6.0Hrs</div>
            <div className="font-medium">Deep:</div>
            <div className="text-muted-foreground">All Corresp. Awaits</div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/10 border border-border/30">
        <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground">
          This dashboard provides interpretive intelligence only. Exothermic informa. creation & oomi.m connection.
        </p>
      </div>
    </Card>
  );
};
