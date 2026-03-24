import { Card } from "@/components/ui/card";
import { Sphere } from "@/types/spheres";
import { Sun, Wind, Radio, Activity, Satellite } from "lucide-react";

interface StellarMetric {
  icon: any;
  label: string;
  value: string;
  unit: string;
  health: number;
}

const mockStellarData: StellarMetric[] = [
  { icon: Sun, label: "Solar Wind Speed", value: "420", unit: "km/s", health: 85 },
  { icon: Wind, label: "Solar Wind Density", value: "8.5", unit: "p/cm³", health: 78 },
  { icon: Radio, label: "Solar Radio Flux", value: "142", unit: "sfu", health: 91 },
  { icon: Activity, label: "Proton Flux", value: "2.3", unit: "pfu", health: 58 },
];

export function SphereStellar({ sphere }: { sphere: Sphere }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${sphere.color}12` }}>
            <Satellite className="w-6 h-6" style={{ color: sphere.color }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold tracking-wide">Stellar Conditions</h2>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mt-0.5">
              Solar wind & space weather parameters
            </p>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40">Conditions</div>
            <span className="text-sm font-semibold font-mono" style={{ color: sphere.color }}>Elevated</span>
          </div>
        </div>
      </Card>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {mockStellarData.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx} className="glass-panel rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" style={{ color: sphere.color }} />
                <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40">{metric.label}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono" style={{ color: sphere.color }}>{metric.value}</span>
                <span className="text-[10px] text-muted-foreground/40 uppercase">{metric.unit}</span>
              </div>
              <div className="h-[3px] rounded-full bg-border/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${metric.health}%`,
                    background: `linear-gradient(90deg, ${sphere.color}40, ${sphere.color}cc)`,
                  }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-panel rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold">Auroral Oval Position</h3>
          <div className="h-48 rounded-lg bg-muted/5 border border-border/10 flex items-center justify-center">
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/30">Auroral oval visualization</p>
          </div>
        </Card>
        <Card className="glass-panel rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold">IMF Orientation</h3>
          <div className="h-48 rounded-lg bg-muted/5 border border-border/10 flex items-center justify-center">
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/30">IMF vector diagram</p>
          </div>
        </Card>
      </div>

      {/* Events */}
      <Card className="glass-panel rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold">Recent Space Weather Events</h3>
        <div className="space-y-2">
          {[
            { time: "2 hours ago", event: "Solar CME detected — arrival expected in 36-48 hours" },
            { time: "6 hours ago", event: "Kp index spike to 5 — minor geomagnetic storm conditions" },
            { time: "12 hours ago", event: "Solar radio burst (Type III) detected from active region" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="px-3 py-2.5 rounded-lg border border-border/15 bg-muted/5"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sphere.color }} />
                <span className="text-[9px] text-muted-foreground/30 ml-auto font-mono">{item.time}</span>
              </div>
              <p className="text-[11px] text-muted-foreground/60 leading-relaxed">{item.event}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
