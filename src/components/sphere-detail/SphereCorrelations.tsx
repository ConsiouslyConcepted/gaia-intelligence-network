import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sphere } from "@/types/spheres";
import { Plus, X, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectedMetric {
  id: string;
  sphere: string;
  name: string;
  color: string;
}

export function SphereCorrelations({ sphere }: { sphere: Sphere }) {
  const [selectedMetrics, setSelectedMetrics] = useState<SelectedMetric[]>([
    { id: "1", sphere: sphere.name, name: "Kp Index", color: sphere.color },
  ]);

  const addMetric = () => {
    if (selectedMetrics.length < 4) {
      setSelectedMetrics(prev => [
        ...prev,
        { id: `${Date.now()}`, sphere: "Select Sphere", name: "Select Metric", color: "#888888" }
      ]);
    }
  };

  const removeMetric = (id: string) => {
    setSelectedMetrics(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Metric Selection */}
      <Card className="glass-panel rounded-xl p-5 space-y-3">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {selectedMetrics.map((metric) => (
            <div key={metric.id} className="rounded-lg bg-muted/8 border border-border/10 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: metric.color }} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-50 hover:opacity-100"
                  onClick={() => removeMetric(metric.id)}
                >
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
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Time Series Comparison</h3>
          <div className="flex gap-1">
            {["24h", "7d", "30d"].map(period => (
              <Button key={period} variant="outline" size="sm" className="text-[10px] h-6 px-2 rounded-md border-border/15">
                {period}
              </Button>
            ))}
          </div>
        </div>
        <div className="h-48 rounded-lg bg-muted/5 border border-border/10 flex items-center justify-center">
          <div className="text-center space-y-1.5">
            <TrendingUp className="w-8 h-8 mx-auto" style={{ color: `${sphere.color}40` }} />
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/30">
              {selectedMetrics.length} metric{selectedMetrics.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>
      </Card>

      {/* Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="glass-panel rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold">Correlation Matrix</h3>
          <div className="space-y-1.5">
            {selectedMetrics.map((metric, i) => (
              <div key={metric.id} className="flex items-center gap-2">
                <div className="w-20 text-[10px] text-muted-foreground/50 truncate">{metric.name}</div>
                <div className="flex-1 flex gap-1">
                  {selectedMetrics.map((_, j) => {
                    const corr = i === j ? 1 : Math.random() * 2 - 1;
                    return (
                      <div
                        key={j}
                        className="flex-1 h-7 rounded-md flex items-center justify-center text-[9px] font-mono"
                        style={{
                          backgroundColor: `rgba(${corr > 0 ? '0,255,100' : '255,0,100'}, ${Math.abs(corr) * 0.15})`,
                          color: `rgba(${corr > 0 ? '0,255,100' : '255,100,100'}, 0.7)`,
                        }}
                      >
                        {corr.toFixed(2)}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-panel rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold">Lag Analysis</h3>
          <div className="space-y-2">
            <div className="px-3 py-2.5 rounded-lg bg-muted/5 border border-border/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground/70">Peak Correlation</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-coherence-high/10 text-coherence-high border-coherence-high/15">
                  0.78
                </Badge>
              </div>
              <div className="text-[10px] text-muted-foreground/40">Kp Index ↔ Solar Wind Speed</div>
              <div className="text-[9px] text-muted-foreground/30 mt-0.5 font-mono">lag: +3h</div>
            </div>
            <div className="px-3 py-2.5 rounded-lg bg-muted/5 border border-border/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground/70">Secondary</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-coherence-medium/10 text-coherence-medium border-coherence-medium/15">
                  0.54
                </Badge>
              </div>
              <div className="text-[10px] text-muted-foreground/40">Dst Index ↔ Kp Index</div>
              <div className="text-[9px] text-muted-foreground/30 mt-0.5 font-mono">lag: -1h</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" className="text-xs h-8 rounded-lg" style={{ backgroundColor: `${sphere.color}cc`, color: '#fff' }}>
          Save as Insight
        </Button>
        <Button variant="outline" size="sm" className="text-xs h-8 rounded-lg border-border/20 text-muted-foreground">
          Export Analysis
        </Button>
      </div>
    </div>
  );
}
