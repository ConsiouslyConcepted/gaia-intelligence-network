import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sphere } from "@/types/spheres";
import { BarChart3, Pin, TrendingUp, TrendingDown, Download } from "lucide-react";
import { useState } from "react";

interface Metric {
  name: string;
  value: string;
  unit: string;
  category: string;
  trend: number;
  health: number;
}

const mockMetrics: Record<string, Metric[]> = {
  magnetosphere: [
    { name: "Kp Index", value: "3.2", unit: "", category: "Geomagnetic", trend: 0.8, health: 72 },
    { name: "Dst Index", value: "-15", unit: "nT", category: "Storm", trend: -5, health: 58 },
    { name: "AE Index", value: "245", unit: "nT", category: "Auroral", trend: 45, health: 65 },
    { name: "Solar Wind Density", value: "8.5", unit: "p/cm³", category: "Solar", trend: 1.2, health: 81 },
    { name: "IMF Bz", value: "-2.3", unit: "nT", category: "IMF", trend: -0.8, health: 54 },
    { name: "Magnetopause Distance", value: "9.8", unit: "Re", category: "Boundary", trend: -0.3, health: 90 },
    { name: "Plasma Beta", value: "1.45", unit: "", category: "Plasma", trend: 0.15, health: 77 },
    { name: "Schumann Resonance", value: "7.85", unit: "Hz", category: "Resonance", trend: 0.05, health: 95 },
  ],
  default: [
    { name: "Coherence Index", value: "78", unit: "%", category: "Core", trend: 5, health: 78 },
    { name: "Data Throughput", value: "1.2", unit: "GB/s", category: "System", trend: 0.3, health: 85 },
    { name: "Sensor Coverage", value: "87", unit: "%", category: "Network", trend: 2, health: 87 },
    { name: "Latency", value: "42", unit: "ms", category: "Performance", trend: -5, health: 92 },
    { name: "Signal Strength", value: "94", unit: "dBm", category: "Signal", trend: 1.5, health: 94 },
    { name: "Harmonic Index", value: "6.2", unit: "", category: "Resonance", trend: 0.4, health: 68 },
  ],
};

export function SphereMetrics({ sphere }: { sphere: Sphere }) {
  const metrics = mockMetrics[sphere.id] || mockMetrics.default;
  const [activeFilter, setActiveFilter] = useState("All");
  const categories = ["All", ...Array.from(new Set(metrics.map(m => m.category)))];
  const filtered = activeFilter === "All" ? metrics : metrics.filter(m => m.category === activeFilter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${"#5ce0d2"}12` }}>
            <BarChart3 className="w-6 h-6" style={{ color: "#5ce0d2" }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold tracking-wide">Metrics Explorer</h2>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mt-0.5">
              {metrics.length} parameters tracked · {categories.length - 1} categories
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 rounded-lg border-border/20 text-muted-foreground">
            <Download className="w-3 h-3" />
            Export
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map(cat => (
          <Badge
            key={cat}
            variant="outline"
            onClick={() => setActiveFilter(cat)}
            className={`cursor-pointer text-[10px] px-2.5 py-0.5 rounded-lg transition-all ${
              activeFilter === cat
                ? "border-border/40 bg-muted/20 text-foreground"
                : "border-border/15 hover:border-border/30 hover:bg-muted/10 text-muted-foreground/60"
            }`}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((metric, idx) => (
          <Card key={idx} className="glass-panel rounded-xl p-4 space-y-3 group hover:border-border/30 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 font-medium">{metric.category}</div>
                <h4 className="font-medium text-sm mt-0.5 text-foreground/85">{metric.name}</h4>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
              >
                <Pin className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono" style={{ color: "#5ce0d2" }}>{metric.value}</span>
              <span className="text-[10px] text-muted-foreground/40 uppercase">{metric.unit}</span>
            </div>

            <div className="h-[3px] rounded-full bg-border/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${metric.health}%`,
                  background: `linear-gradient(90deg, ${"#5ce0d2"}40, ${"#5ce0d2"}cc)`,
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {metric.trend > 0 
                  ? <TrendingUp className="w-3 h-3" style={{ color: "#5ce0d2" }} />
                  : <TrendingDown className="w-3 h-3" style={{ color: "#5ce0d2", opacity: 0.6 }} />
                }
                <span className="text-[10px] font-mono" style={{ color: `${"#5ce0d2"}aa` }}>
                  {metric.trend > 0 ? "+" : ""}{metric.trend}{metric.unit ? ` ${metric.unit}` : ""}
                </span>
              </div>
              <span className="text-[9px] text-muted-foreground/30 font-mono">24h</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
