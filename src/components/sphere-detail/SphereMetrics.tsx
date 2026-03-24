import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sphere } from "@/types/spheres";
import { Pin, TrendingUp } from "lucide-react";

interface Metric {
  name: string;
  value: string;
  unit: string;
  category: string;
  trend: number;
}

const mockMetrics: Record<string, Metric[]> = {
  magnetosphere: [
    { name: "Kp Index", value: "3.2", unit: "", category: "Geomagnetic", trend: 0.8 },
    { name: "Dst Index", value: "-15", unit: "nT", category: "Storm", trend: -5 },
    { name: "AE Index", value: "245", unit: "nT", category: "Auroral", trend: 45 },
    { name: "Solar Wind Density", value: "8.5", unit: "p/cm³", category: "Solar", trend: 1.2 },
    { name: "IMF Bz", value: "-2.3", unit: "nT", category: "IMF", trend: -0.8 },
    { name: "Magnetopause Distance", value: "9.8", unit: "Re", category: "Boundary", trend: -0.3 },
    { name: "Plasma Beta", value: "1.45", unit: "", category: "Plasma", trend: 0.15 },
    { name: "Schumann Resonance", value: "7.85", unit: "Hz", category: "Resonance", trend: 0.05 },
  ],
  default: [
    { name: "Coherence Index", value: "78", unit: "%", category: "Core", trend: 5 },
    { name: "Data Throughput", value: "1.2", unit: "GB/s", category: "System", trend: 0.3 },
    { name: "Sensor Coverage", value: "87", unit: "%", category: "Network", trend: 2 },
    { name: "Latency", value: "42", unit: "ms", category: "Performance", trend: -5 },
  ],
};

export function SphereMetrics({ sphere }: { sphere: Sphere }) {
  const metrics = mockMetrics[sphere.id] || mockMetrics.default;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {["All", "Geomagnetic", "Solar", "Plasma"].map(cat => (
          <Badge
            key={cat}
            variant="outline"
            className="cursor-pointer text-[10px] px-2.5 py-0.5 rounded-lg border-border/20 hover:border-border/40 hover:bg-muted/15 transition-all"
          >
            {cat}
          </Badge>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="glass-panel rounded-xl p-4 space-y-3 hover:border-border/30 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 font-medium">{metric.category}</div>
                <h4 className="font-medium text-sm mt-0.5 text-foreground/85">{metric.name}</h4>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                title="Pin to correlations"
              >
                <Pin className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono" style={{ color: sphere.color }}>{metric.value}</span>
              <span className="text-[10px] text-muted-foreground/40 uppercase">{metric.unit}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <TrendingUp className={`w-3 h-3 ${metric.trend > 0 ? "text-coherence-high" : "text-coherence-low rotate-180"}`} />
              <span className={`text-[10px] font-mono ${metric.trend > 0 ? "text-coherence-high" : "text-coherence-low"}`}>
                {metric.trend > 0 ? "+" : ""}{metric.trend} {metric.unit}
              </span>
              <span className="text-[9px] text-muted-foreground/30">24h</span>
            </div>

            {/* Mini sparkline */}
            <div className="h-8 flex items-end gap-[2px] px-0.5">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all"
                  style={{
                    height: `${20 + Math.random() * 80}%`,
                    backgroundColor: `${sphere.color}${i > 18 ? '50' : '25'}`,
                  }}
                />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
