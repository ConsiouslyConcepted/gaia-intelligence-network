import { Card } from "@/components/ui/card";
import { Sphere } from "@/types/spheres";
import { Clock } from "lucide-react";

interface Props {
  sphere: Sphere;
  accent: string;
}

export function TemporalPanel({ sphere, accent }: Props) {
  return (
    <div className="space-y-4">
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}12` }}>
            <Clock className="w-6 h-6" style={{ color: accent }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold tracking-wide">Temporal Dynamics — {sphere.name}</h2>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mt-0.5">
              Time-series analysis · Anomaly detection · Trend evolution
            </p>
          </div>
        </div>
      </Card>

      <Card className="glass-panel rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold">Time-Series View</h3>
        <div className="h-64 rounded-lg bg-muted/5 border border-border/10 flex items-center justify-center">
          <div className="text-center space-y-2">
            <Clock className="w-10 h-10 mx-auto" style={{ color: `${accent}30` }} />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/30">
              Multi-parameter temporal analysis
            </p>
            <p className="text-[9px] text-muted-foreground/20">
              Connects to Live State data feeds
            </p>
          </div>
        </div>
      </Card>

      <Card className="glass-panel rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold">Detected Anomalies</h3>
        <p className="text-[11px] text-muted-foreground/50">
          Anomaly detection runs on incoming temporal streams. Deviations from baseline patterns are flagged automatically.
        </p>
        <div className="h-32 rounded-lg bg-muted/5 border border-border/10 flex items-center justify-center">
          <p className="text-[10px] text-muted-foreground/30 uppercase tracking-wider">Awaiting temporal data</p>
        </div>
      </Card>
    </div>
  );
}
