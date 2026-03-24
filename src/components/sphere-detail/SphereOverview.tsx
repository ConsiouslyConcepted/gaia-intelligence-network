import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sphere } from "@/types/spheres";
import { Activity, TrendingUp, TrendingDown, Minus, AlertTriangle, ArrowRight, Zap, Signal, BarChart3 } from "lucide-react";

interface KPI {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  unit?: string;
  sparkline?: number[];
}

const mockKPIs: Record<string, KPI[]> = {
  magnetosphere: [
    { label: "Kp Index", value: "3.2", change: 0.8, trend: "up", sparkline: [30, 45, 38, 52, 48, 65, 72, 68, 55, 62, 70, 78] },
    { label: "Dst Index", value: "-15", unit: "nT", change: -5, trend: "down", sparkline: [60, 55, 48, 42, 38, 35, 40, 32, 28, 25, 30, 22] },
    { label: "Solar Wind Speed", value: "420", unit: "km/s", change: 15, trend: "up", sparkline: [40, 42, 45, 50, 48, 55, 60, 58, 65, 70, 68, 75] },
    { label: "IMF Strength", value: "5.8", unit: "nT", change: 1.2, trend: "up", sparkline: [35, 40, 38, 45, 50, 48, 55, 52, 58, 60, 55, 62] },
    { label: "Auroral Power", value: "28", unit: "GW", change: 8, trend: "up", sparkline: [20, 25, 30, 35, 40, 38, 45, 50, 55, 52, 60, 65] },
  ],
  default: [
    { label: "Coherence Score", value: "78", unit: "%", change: 5, trend: "up", sparkline: [60, 62, 65, 68, 70, 72, 75, 73, 76, 78, 77, 78] },
    { label: "Data Quality", value: "95", unit: "%", change: 0, trend: "stable", sparkline: [92, 93, 94, 95, 94, 95, 95, 94, 95, 95, 95, 95] },
    { label: "Active Sensors", value: "247", change: -3, trend: "down", sparkline: [255, 252, 250, 248, 250, 249, 247, 248, 246, 247, 247, 247] },
    { label: "Update Rate", value: "5.2", unit: "Hz", change: 0.3, trend: "up", sparkline: [4.5, 4.6, 4.8, 4.9, 5.0, 4.9, 5.1, 5.0, 5.2, 5.1, 5.2, 5.2] },
  ],
};

interface Alert {
  severity: "info" | "warning" | "critical";
  message: string;
  time: string;
}

const mockAlerts: Alert[] = [
  { severity: "warning", message: "Elevated geomagnetic activity detected — Kp trending above threshold", time: "12 min ago" },
  { severity: "info", message: "Data stream reconnected: Ground magnetometer network (48 stations)", time: "1 hour ago" },
  { severity: "critical", message: "CME impact window approaching — estimated arrival in 18 hours", time: "3 hours ago" },
];

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up": return <TrendingUp className="w-3.5 h-3.5 text-coherence-high" />;
    case "down": return <TrendingDown className="w-3.5 h-3.5 text-coherence-low" />;
    default: return <Minus className="w-3.5 h-3.5 text-muted-foreground/40" />;
  }
};

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case "critical": return { bg: "border-coherence-low/20 bg-coherence-low/5", dot: "bg-coherence-low" };
    case "warning": return { bg: "border-yellow-500/20 bg-yellow-500/5", dot: "bg-yellow-500" };
    default: return { bg: "border-coherence-medium/20 bg-coherence-medium/5", dot: "bg-coherence-medium" };
  }
};

export function SphereOverview({ sphere }: { sphere: Sphere }) {
  const kpis = mockKPIs[sphere.id] || mockKPIs.default;

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${sphere.color}12` }}>
            <Activity className="w-6 h-6" style={{ color: sphere.color }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold tracking-wide">Sphere Status Overview</h2>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mt-0.5">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40">Status</div>
            <Badge 
              variant="outline" 
              className="text-xs px-2 py-0.5 mt-0.5 border-coherence-high/20 bg-coherence-high/8 text-coherence-high"
            >
              Active
            </Badge>
          </div>
        </div>
      </Card>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="glass-panel rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 font-medium">{kpi.label}</span>
              {getTrendIcon(kpi.trend)}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono" style={{ color: sphere.color }}>{kpi.value}</span>
              {kpi.unit && <span className="text-[10px] text-muted-foreground/40 uppercase">{kpi.unit}</span>}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-mono ${kpi.change > 0 ? "text-coherence-high" : kpi.change < 0 ? "text-coherence-low" : "text-muted-foreground/40"}`}>
                {kpi.change > 0 ? "+" : ""}{kpi.change}{kpi.unit ? ` ${kpi.unit}` : ""}
              </span>
              <span className="text-[9px] text-muted-foreground/30 font-mono">24h</span>
            </div>
            {/* Mini sparkline */}
            {kpi.sparkline && (
              <div className="h-6 flex items-end gap-[2px]">
                {kpi.sparkline.map((v, i) => {
                  const max = Math.max(...kpi.sparkline!);
                  const min = Math.min(...kpi.sparkline!);
                  const pct = max === min ? 50 : ((v - min) / (max - min)) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${Math.max(15, pct)}%`,
                        backgroundColor: i >= kpi.sparkline!.length - 3 ? `${sphere.color}60` : `${sphere.color}25`,
                      }}
                    />
                  );
                })}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Two-column: Signal Watchlist + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Signal Watchlist */}
        <Card className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" style={{ color: sphere.color }} />
            <h3 className="text-sm font-semibold">Signal Watchlist</h3>
          </div>
          <div className="space-y-2">
            {mockAlerts.map((alert, idx) => {
              const styles = getSeverityStyles(alert.severity);
              return (
                <div
                  key={idx}
                  className={`px-3 py-2.5 rounded-lg border ${styles.bg}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                    <span className="text-xs font-medium capitalize">{alert.severity}</span>
                    <span className="text-[9px] text-muted-foreground/30 ml-auto font-mono">{alert.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 leading-relaxed">{alert.message}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* System Health */}
        <Card className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4" style={{ color: sphere.color }} />
            <h3 className="text-sm font-semibold">System Health</h3>
          </div>
          <div className="space-y-3">
            {[
              { name: "Sensor Network", value: 94 },
              { name: "Data Pipeline", value: 98 },
              { name: "Model Sync", value: 87 },
              { name: "Cross-Sphere Link", value: 76 },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground/70">{item.name}</span>
                  <span className="text-xs font-bold font-mono" style={{ color: sphere.color }}>{item.value}%</span>
                </div>
                <div className="h-[3px] rounded-full bg-border/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${item.value}%`,
                      background: `linear-gradient(90deg, ${sphere.color}40, ${sphere.color}cc)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button size="sm" className="gap-1.5 text-xs h-8 rounded-lg" style={{ backgroundColor: `${sphere.color}cc`, color: '#fff' }}>
          <Zap className="w-3 h-3" />
          Open Map
          <ArrowRight className="w-3 h-3" />
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 rounded-lg border-border/20 text-muted-foreground">
          <BarChart3 className="w-3 h-3" />
          Add to Correlations
        </Button>
      </div>
    </div>
  );
}
