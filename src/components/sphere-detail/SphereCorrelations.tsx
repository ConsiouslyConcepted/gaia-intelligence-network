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
        { 
          id: `${Date.now()}`, 
          sphere: "Select Sphere", 
          name: "Select Metric", 
          color: "#888888" 
        }
      ]);
    }
  };

  const removeMetric = (id: string) => {
    setSelectedMetrics(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Metric Selection */}
      <Card className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Selected Metrics</h3>
          <Button
            onClick={addMetric}
            disabled={selectedMetrics.length >= 4}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Metric ({selectedMetrics.length}/4)
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedMetrics.map((metric) => (
            <Card key={metric.id} className="glass-panel p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div
                  className="w-4 h-4 rounded-full mt-1"
                  style={{ backgroundColor: metric.color }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeMetric(metric.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Select defaultValue={metric.sphere}>
                  <SelectTrigger>
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
                  <SelectTrigger>
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
            </Card>
          ))}
        </div>
      </Card>

      {/* Visualization */}
      <Card className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Time Series Comparison</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">24h</Button>
            <Button variant="outline" size="sm">7d</Button>
            <Button variant="outline" size="sm">30d</Button>
          </div>
        </div>
        <div className="h-64 bg-gradient-to-b from-space-deep/50 to-transparent rounded-lg border border-border/30 flex items-center justify-center">
          <div className="text-center space-y-2">
            <TrendingUp className="w-12 h-12 mx-auto text-primary/50" />
            <p className="text-muted-foreground">
              Multi-metric time series visualization
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedMetrics.length} metric{selectedMetrics.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>
      </Card>

      {/* Correlation Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-semibold">Correlation Matrix</h3>
          <div className="space-y-2">
            {selectedMetrics.map((metric, i) => (
              <div key={metric.id} className="flex items-center gap-2">
                <div className="w-24 text-sm truncate">{metric.name}</div>
                <div className="flex-1 flex gap-1">
                  {selectedMetrics.map((_, j) => {
                    const corr = i === j ? 1 : Math.random() * 2 - 1;
                    return (
                      <div
                        key={j}
                        className="flex-1 h-8 rounded flex items-center justify-center text-xs font-medium"
                        style={{
                          backgroundColor: `rgba(${corr > 0 ? '0,255,100' : '255,0,100'}, ${Math.abs(corr) * 0.5})`,
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

        <Card className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-semibold">Lag Analysis</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Peak Correlation</span>
                <Badge variant="outline" className="bg-coherence-high/20 text-coherence-high">
                  0.78
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Kp Index ↔ Solar Wind Speed
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Optimal lag: +3 hours
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Secondary Correlation</span>
                <Badge variant="outline" className="bg-coherence-medium/20 text-coherence-medium">
                  0.54
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Dst Index ↔ Kp Index
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Optimal lag: -1 hour
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button className="gap-2">Save as Insight</Button>
        <Button variant="outline" className="gap-2">Export Analysis</Button>
        <Button variant="outline" className="gap-2">Schedule Report</Button>
      </div>
    </div>
  );
}
