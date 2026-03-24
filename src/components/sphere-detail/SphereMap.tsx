import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sphere } from "@/types/spheres";
import { Layers, Globe2, Download } from "lucide-react";
import { useState } from "react";

interface MapLayer {
  id: string;
  name: string;
  enabled: boolean;
  opacity: number;
  color: string;
}

const mockLayers: Record<string, MapLayer[]> = {
  magnetosphere: [
    { id: "kp", name: "Kp Index Tiles", enabled: true, opacity: 0.7, color: "#ff00ff" },
    { id: "auroral", name: "Auroral Oval", enabled: true, opacity: 0.6, color: "#00ff88" },
    { id: "ground", name: "Ground Magnetometers", enabled: true, opacity: 1, color: "#ffaa00" },
    { id: "schumann", name: "Schumann Stations", enabled: false, opacity: 0.8, color: "#88ccff" },
  ],
  geosphere: [
    { id: "seismic", name: "Seismicity Heatmap", enabled: true, opacity: 0.7, color: "#ff4400" },
    { id: "tectonic", name: "Tectonic Plates", enabled: true, opacity: 0.5, color: "#8844ff" },
    { id: "volcano", name: "Volcanic Activity", enabled: true, opacity: 0.8, color: "#ff8800" },
  ],
  default: [
    { id: "heatmap", name: "Data Density Heatmap", enabled: true, opacity: 0.7, color: "#00ffff" },
    { id: "nodes", name: "Sensor Nodes", enabled: true, opacity: 1, color: "#ffdd00" },
  ],
};

export function SphereMap({ sphere }: { sphere: Sphere }) {
  const [layers, setLayers] = useState(mockLayers[sphere.id] || mockLayers.default);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l));
  };

  const updateOpacity = (id: string, opacity: number) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, opacity: opacity / 100 } : l));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-[calc(100vh-180px)]">
      {/* Layers Panel */}
      <Card className="glass-panel rounded-xl p-4 space-y-3 overflow-auto lg:col-span-1">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4" style={{ color: sphere.color }} />
          <h3 className="text-sm font-semibold">Layers</h3>
        </div>

        <div className="space-y-2">
          {layers.map(layer => (
            <div key={layer.id} className="rounded-lg bg-muted/5 border border-border/10 p-2.5 space-y-2">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  checked={layer.enabled}
                  onCheckedChange={() => toggleLayer(layer.id)}
                  className="h-3.5 w-3.5"
                />
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: layer.color }} />
                  <span className="text-[11px] font-medium truncate">{layer.name}</span>
                </div>
              </div>
              
              {layer.enabled && (
                <div className="ml-6 space-y-1">
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground/40">
                    <span>Opacity</span>
                    <span className="font-mono">{Math.round(layer.opacity * 100)}%</span>
                  </div>
                  <Slider
                    value={[layer.opacity * 100]}
                    onValueChange={([val]) => updateOpacity(layer.id, val)}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border/10 space-y-1.5">
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-[10px] h-7 rounded-lg border-border/15">
            <Download className="w-3 h-3" />
            Export PNG
          </Button>
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-[10px] h-7 rounded-lg border-border/15">
            <Download className="w-3 h-3" />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Map View */}
      <Card className="glass-panel rounded-xl lg:col-span-3 relative overflow-hidden">
        <div className="absolute top-3 right-3 z-10 flex gap-1">
          {(["2d", "3d"] as const).map(mode => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode(mode)}
              className="text-[10px] h-6 px-2.5 rounded-md uppercase"
            >
              {mode}
            </Button>
          ))}
        </div>

        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-background/50 to-transparent">
          <div className="text-center space-y-3">
            <Globe2 className="w-12 h-12 mx-auto" style={{ color: `${sphere.color}30` }} />
            <div>
              <h3 className="text-sm font-semibold mb-1">
                {sphere.name} · {viewMode.toUpperCase()}
              </h3>
              <p className="text-[10px] text-muted-foreground/30 max-w-xs mx-auto">
                {layers.filter(l => l.enabled).length} active layers
              </p>
            </div>
            <div className="flex gap-1.5 justify-center flex-wrap">
              {layers.filter(l => l.enabled).map(layer => (
                <div
                  key={layer.id}
                  className="px-2 py-0.5 rounded-md text-[9px] flex items-center gap-1.5 bg-muted/8 border border-border/10"
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: layer.color }} />
                  {layer.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
