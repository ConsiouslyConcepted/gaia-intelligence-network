import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sphere } from "@/types/spheres";
import { Sun, Wind, Radio, Activity } from "lucide-react";

interface StellarMetric {
  icon: any;
  label: string;
  value: string;
  unit: string;
  status: "normal" | "elevated" | "critical";
}

const mockStellarData: StellarMetric[] = [
  { icon: Sun, label: "Solar Wind Speed", value: "420", unit: "km/s", status: "normal" },
  { icon: Wind, label: "Solar Wind Density", value: "8.5", unit: "p/cm³", status: "normal" },
  { icon: Radio, label: "Solar Radio Flux", value: "142", unit: "sfu", status: "normal" },
  { icon: Activity, label: "Proton Flux", value: "2.3", unit: "pfu", status: "elevated" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "critical": return "bg-coherence-low/10 text-coherence-low border-coherence-low/15";
    case "elevated": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/15";
    default: return "bg-coherence-high/10 text-coherence-high border-coherence-high/15";
  }
};

export function SphereStellar({ sphere }: { sphere: Sphere }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {mockStellarData.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx} className="glass-panel rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: sphere.color }} />
                  <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/50">{metric.label}</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono" style={{ color: sphere.color }}>{metric.value}</span>
                <span className="text-[10px] text-muted-foreground/40 uppercase">{metric.unit}</span>
              </div>
              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${getStatusColor(metric.status)}`}>
                {metric.status}
              </Badge>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="glass-panel rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold">Auroral Oval Position</h3>
          <div className="h-48 rounded-lg bg-muted/8 border border-border/10 flex items-center justify-center">
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/30">Auroral oval visualization</p>
          </div>
        </Card>

        <Card className="glass-panel rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold">IMF Orientation</h3>
          <div className="h-48 rounded-lg bg-muted/8 border border-border/10 flex items-center justify-center">
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/30">IMF vector diagram</p>
          </div>
        </Card>
      </div>

      <Card className="glass-panel rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold">Recent Space Weather Events</h3>
        <div className="space-y-2">
          {[
            { time: "2 hours ago", event: "Solar CME detected - arrival expected in 36-48 hours", severity: "warning" },
            { time: "6 hours ago", event: "Kp index spike to 5 - minor geomagnetic storm", severity: "elevated" },
            { time: "12 hours ago", event: "Solar radio burst (Type III) detected", severity: "normal" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="px-3 py-2.5 rounded-lg border border-border/10 bg-muted/5 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 shrink-0 ${getStatusColor(item.severity)}`}>
                  {item.severity}
                </Badge>
                <p className="text-xs text-muted-foreground/60 truncate">{item.event}</p>
              </div>
              <span className="text-[9px] text-muted-foreground/30 whitespace-nowrap shrink-0 font-mono">{item.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
