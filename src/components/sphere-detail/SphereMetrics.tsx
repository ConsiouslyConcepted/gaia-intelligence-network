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
    <div className="space-y-6">
      {/* Filters */}
      <Card className="glass-panel p-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-primary/20">All Categories</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary/20">Geomagnetic</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary/20">Solar</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary/20">Plasma</Badge>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="glass-panel p-4 space-y-3 hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">{metric.category}</div>
                <h4 className="font-semibold text-sm">{metric.name}</h4>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-primary/20"
                title="Pin to correlations"
              >
                <Pin className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">{metric.value}</span>
              <span className="text-sm text-muted-foreground">{metric.unit}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <TrendingUp className={`w-3 h-3 ${metric.trend > 0 ? "text-coherence-high" : "text-coherence-low rotate-180"}`} />
              <span className={metric.trend > 0 ? "text-coherence-high" : "text-coherence-low"}>
                {metric.trend > 0 ? "+" : ""}{metric.trend} {metric.unit}
              </span>
              <span className="text-muted-foreground">24h</span>
            </div>

            {/* Mini sparkline placeholder */}
            <div className="h-12 bg-muted/20 rounded-lg flex items-end gap-1 px-2 pb-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/40 rounded-sm"
                  style={{ height: `${Math.random() * 100}%` }}
                />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
