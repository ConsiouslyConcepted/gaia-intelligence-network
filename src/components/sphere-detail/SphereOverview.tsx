import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sphere } from "@/types/spheres";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, ArrowRight } from "lucide-react";

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

const getTrendIcon = (trend: string, color: string) => {
  switch (trend) {
    case "up": return <TrendingUp className="w-3.5 h-3.5 text-coherence-high" />;
    case "down": return <TrendingDown className="w-3.5 h-3.5 text-coherence-low" />;
    default: return <Minus className="w-3.5 h-3.5 text-coherence-medium" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical": return "bg-coherence-low/10 text-coherence-low border-coherence-low/20";
    case "warning": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    default: return "bg-coherence-medium/10 text-coherence-medium border-coherence-medium/20";
  }
};

export function SphereOverview({ sphere }: { sphere: Sphere }) {
  const kpis = mockKPIs[sphere.id] || mockKPIs.default;

  return (
    <div className="space-y-4">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="glass-panel rounded-xl p-4 space-y-3 group hover:border-border/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/50 font-medium">{kpi.label}</span>
              {getTrendIcon(kpi.trend, sphere.color)}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono" style={{ color: sphere.color }}>{kpi.value}</span>
              {kpi.unit && <span className="text-[10px] text-muted-foreground/40 uppercase">{kpi.unit}</span>}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-mono ${kpi.change > 0 ? "text-coherence-high" : kpi.change < 0 ? "text-coherence-low" : "text-coherence-medium"}`}>
                {kpi.change > 0 ? "+" : ""}{kpi.change}
              </span>
              <span className="text-[9px] text-muted-foreground/30">24h</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Signal Watchlist */}
      <Card className="glass-panel rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" style={{ color: sphere.color }} />
            <h3 className="text-sm font-semibold tracking-wide">Signal Watchlist</h3>
          </div>
          <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-wider text-muted-foreground/50 h-7 px-2">
            Configure
          </Button>
        </div>
        <div className="space-y-2">
          {mockAlerts.map((alert, idx) => (
            <div
              key={idx}
              className={`px-3 py-2.5 rounded-lg border flex items-center justify-between gap-3 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Badge variant="outline" className="capitalize text-[9px] px-1.5 py-0 h-4 border-current/20 shrink-0">
                  {alert.severity}
                </Badge>
                <p className="text-xs truncate">{alert.message}</p>
              </div>
              <span className="text-[9px] text-muted-foreground/40 whitespace-nowrap shrink-0">{alert.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button size="sm" className="gap-1.5 text-xs h-8 rounded-lg" style={{ backgroundColor: `${sphere.color}cc`, color: '#fff' }}>
          Open Map
          <ArrowRight className="w-3 h-3" />
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 rounded-lg border-border/20 text-muted-foreground hover:text-foreground">
          Add to Correlations
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 rounded-lg border-border/20 text-muted-foreground hover:text-foreground">
          Export
        </Button>
      </div>
    </div>
  );
}
