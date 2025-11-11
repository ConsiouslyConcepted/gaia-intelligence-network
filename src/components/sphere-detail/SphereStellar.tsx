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
    case "critical": return "bg-coherence-low/20 text-coherence-low border-coherence-low/30";
    case "elevated": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    default: return "bg-coherence-high/20 text-coherence-high border-coherence-high/30";
  }
};

export function SphereStellar({ sphere }: { sphere: Sphere }) {
  return (
    <div className="space-y-6">
      <Card className="glass-panel p-6 space-y-4">
        <h3 className="text-xl font-semibold">Solar & Space Weather Conditions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockStellarData.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <Card key={idx} className="glass-panel p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">{metric.value}</span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>
                <Badge variant="outline" className={getStatusColor(metric.status)}>
                  {metric.status}
                </Badge>
              </Card>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-semibold">Auroral Oval Position</h3>
          <div className="h-64 bg-gradient-to-b from-space-deep to-space-medium rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Auroral oval visualization</p>
          </div>
        </Card>

        <Card className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-semibold">IMF Orientation</h3>
          <div className="h-64 bg-gradient-to-b from-space-deep to-space-medium rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">IMF vector diagram</p>
          </div>
        </Card>
      </div>

      <Card className="glass-panel p-6 space-y-4">
        <h3 className="text-lg font-semibold">Recent Space Weather Events</h3>
        <div className="space-y-3">
          {[
            { time: "2 hours ago", event: "Solar CME detected - arrival expected in 36-48 hours", severity: "warning" },
            { time: "6 hours ago", event: "Kp index spike to 5 - minor geomagnetic storm", severity: "elevated" },
            { time: "12 hours ago", event: "Solar radio burst (Type III) detected", severity: "normal" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border border-border/30 bg-muted/20 flex items-start justify-between"
            >
              <div className="flex-1">
              <Badge variant="outline" className={getStatusColor(item.severity)}>
                  {item.severity}
                </Badge>
                <p className="text-sm mt-2">{item.event}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
