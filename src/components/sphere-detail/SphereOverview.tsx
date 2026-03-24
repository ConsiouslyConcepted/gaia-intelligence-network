import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sphere } from "@/types/spheres";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";

interface KPI {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  unit?: string;
}

const mockKPIs: Record<string, KPI[]> = {
  magnetosphere: [
    { label: "Kp Index", value: "3.2", change: 0.8, trend: "up", unit: "" },
    { label: "Dst Index", value: "-15", change: -5, trend: "down", unit: "nT" },
    { label: "Solar Wind Speed", value: "420", change: 15, trend: "up", unit: "km/s" },
    { label: "IMF Strength", value: "5.8", change: 1.2, trend: "up", unit: "nT" },
    { label: "Auroral Power", value: "28", change: 8, trend: "up", unit: "GW" },
  ],
  default: [
    { label: "Coherence Score", value: "78", change: 5, trend: "up", unit: "%" },
    { label: "Data Quality", value: "95", change: 0, trend: "stable", unit: "%" },
    { label: "Active Sensors", value: "247", change: -3, trend: "down", unit: "" },
    { label: "Update Rate", value: "5.2", change: 0.3, trend: "up", unit: "Hz" },
  ],
};

interface Alert {
  severity: "info" | "warning" | "critical";
  message: string;
  time: string;
}

const mockAlerts: Alert[] = [
  { severity: "warning", message: "Elevated geomagnetic activity detected", time: "12 min ago" },
  { severity: "info", message: "Data stream reconnected: Ground magnetometer network", time: "1 hour ago" },
];

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up": return <TrendingUp className="w-4 h-4 text-coherence-high" />;
    case "down": return <TrendingDown className="w-4 h-4 text-coherence-low" />;
    default: return <Minus className="w-4 h-4 text-coherence-medium" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical": return "bg-coherence-low/20 text-coherence-low border-coherence-low/30";
    case "warning": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    default: return "bg-coherence-medium/20 text-coherence-medium border-coherence-medium/30";
  }
};

export function SphereOverview({ sphere }: { sphere: Sphere }) {
  const kpis = mockKPIs[sphere.id] || mockKPIs.default;

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="glass-panel p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
              {getTrendIcon(kpi.trend)}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold" style={{ color: sphere.color }}>{kpi.value}</span>
              {kpi.unit && <span className="text-sm text-muted-foreground">{kpi.unit}</span>}
            </div>
            <div className="text-xs">
              <span className={kpi.change > 0 ? "text-coherence-high" : kpi.change < 0 ? "text-coherence-low" : "text-coherence-medium"}>
                {kpi.change > 0 ? "+" : ""}{kpi.change} {kpi.unit}
              </span>
              <span className="text-muted-foreground ml-1">24h</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Signal Watchlist */}
      <Card className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" style={{ color: sphere.color }} />
            Signal Watchlist
          </h3>
          <Button variant="outline" size="sm">Configure Alerts</Button>
        </div>
        <div className="space-y-3">
          {mockAlerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border flex items-start justify-between gap-4 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex-1">
                <Badge variant="outline" className="mb-2 capitalize">
                  {alert.severity}
                </Badge>
                <p className="text-sm">{alert.message}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{alert.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button className="gap-2" style={{ backgroundColor: sphere.color, color: '#fff' }}>
          Open Map with Preset Layers
        </Button>
        <Button variant="outline" className="gap-2">
          Add to Correlations
        </Button>
        <Button variant="outline" className="gap-2">
          Export Current State
        </Button>
      </div>
    </div>
  );
}
