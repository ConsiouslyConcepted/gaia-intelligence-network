import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sphere } from "@/types/spheres";
import { Network, Plus, X, TrendingUp, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectedMetric {
  id: string;
  sphere: string;
  name: string;
  color: string;
}

interface CorrelationResult {
  pairA: string;
  pairB: string;
  correlation: number;
  lag: string;
}

const mockResults: CorrelationResult[] = [
  { pairA: "Kp Index", pairB: "Solar Wind Speed", correlation: 0.78, lag: "+3h" },
  { pairA: "Dst Index", pairB: "Kp Index", correlation: -0.65, lag: "-1h" },
  { pairA: "IMF Bz", pairB: "Auroral Power", correlation: 0.54, lag: "+2h" },
  { pairA: "Solar Wind", pairB: "Dst Index", correlation: -0.42, lag: "+6h" },
];

export function SphereCorrelations({ sphere }: { sphere: Sphere }) {
  const [selectedMetrics, setSelectedMetrics] = useState<SelectedMetric[]>([
    { id: "1", sphere: sphere.name, name: "Kp Index", color: sphere.color },
  ]);

  const addMetric = () => {
    if (selectedMetrics.length < 4) {
      setSelectedMetrics(prev => [
        ...prev,
        { id: `${Date.now()}`, sphere: "Select Sphere", name: "Select Metric", color: sphere.color }
      ]);
    }
  };

  const removeMetric = (id: string) => {
    setSelectedMetrics(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${sphere.color}12` }}>
            <Network className="w-6 h-6" style={{ color: sphere.color }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold tracking-wide">Cross-Sphere Correlations</h2>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mt-0.5">
              Multi-parameter analysis · {selectedMetrics.length} metrics selected
            </p>
          </div>
          <div className="flex gap-1.5">
            {["24h", "7d", "30d"].map(period => (
              <Button key={period} variant="outline" size="sm" className="text-[10px] h-7 px-2.5 rounded-lg border-border/15 text-muted-foreground/60">
                {period}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Metric Selection */}
      <Card className="glass-panel rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Selected Metrics</h3>
          <Button
            onClick={addMetric}
            disabled={selectedMetrics.length >= 4}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-7 rounded-lg border-border/20"
          >
            <Plus className="w-3 h-3" />
            Add ({selectedMetrics.length}/4)
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {selectedMetrics.map((metric) => (
            <div key={metric.id} className="rounded-lg bg-muted/5 border border-border/10 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `${sphere.color}80` }} />
                <Button variant="ghost" size="icon" className="h-5 w-5 opacity-50 hover:opacity-100" onClick={() => removeMetric(metric.id)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-1.5">
                <Select defaultValue={metric.sphere}>
                  <SelectTrigger className="h-7 text-xs rounded-lg bg-background/30 border-border/15">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Magnetosphere">Magnetosphere</SelectItem>
                    <SelectItem value="Ionosphere">Ionosphere</SelectItem>
                    <SelectItem value="Geosphere">Geosphere</SelectItem>
                    <SelectItem value="Biosphere">Biosphere</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue={metric.name}>
                  <SelectTrigger className="h-7 text-xs rounded-lg bg-background/30 border-border/15">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kp Index">Kp Index</SelectItem>
                    <SelectItem value="Dst Index">Dst Index</SelectItem>
                    <SelectItem value="Solar Wind">Solar Wind Speed</SelectItem>
                    <SelectItem value="TEC">Total Electron Content</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Time Series */}
      <Card className="glass-panel rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold">Time Series Comparison</h3>
        <div className="h-48 rounded-lg bg-muted/5 border border-border/10 flex items-center justify-center">
          <div className="text-center space-y-1.5">
            <TrendingUp className="w-8 h-8 mx-auto" style={{ color: `${sphere.color}40` }} />
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/30">
              {selectedMetrics.length} metric{selectedMetrics.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>
      </Card>

      {/* Correlation Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-panel rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold">Correlation Results</h3>
          <div className="space-y-2">
            {mockResults.map((result, idx) => (
              <div key={idx} className="px-3 py-2.5 rounded-lg bg-muted/5 border border-border/10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-foreground/80">{result.pairA} ↔ {result.pairB}</span>
                  <span className="text-xs font-bold font-mono" style={{ color: sphere.color }}>
                    {result.correlation.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-[3px] rounded-full bg-border/10 overflow-hidden flex-1">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.abs(result.correlation) * 100}%`,
                        background: `linear-gradient(90deg, ${sphere.color}40, ${sphere.color}cc)`,
                      }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground/30 font-mono shrink-0">lag: {result.lag}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-panel rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold">Lag Analysis</h3>
          <div className="space-y-2">
            {mockResults.slice(0, 3).map((result, idx) => (
              <div key={idx} className="px-3 py-2.5 rounded-lg bg-muted/5 border border-border/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground/70">
                    {idx === 0 ? "Peak Correlation" : idx === 1 ? "Secondary" : "Tertiary"}
                  </span>
                  <span className="text-xs font-bold font-mono" style={{ color: sphere.color }}>
                    {Math.abs(result.correlation).toFixed(2)}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground/50">{result.pairA} ↔ {result.pairB}</div>
                <div className="text-[9px] text-muted-foreground/30 mt-0.5 font-mono">lag: {result.lag}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" className="gap-1.5 text-xs h-8 rounded-lg" style={{ backgroundColor: `${sphere.color}cc`, color: '#fff' }}>
          <Download className="w-3 h-3" />
          Save as Insight
        </Button>
        <Button variant="outline" size="sm" className="text-xs h-8 rounded-lg border-border/20 text-muted-foreground">
          Export Analysis
        </Button>
      </div>
    </div>
  );
}
