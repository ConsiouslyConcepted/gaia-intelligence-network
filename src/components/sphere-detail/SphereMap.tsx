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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-300px)]">
      {/* Left Sidebar - Layers */}
      <Card className="glass-panel p-4 space-y-4 overflow-auto lg:col-span-1">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Map Layers</h3>
        </div>

        <div className="space-y-4">
          {layers.map(layer => (
            <div key={layer.id} className="space-y-2 p-3 rounded-lg bg-muted/20">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={layer.enabled}
                  onCheckedChange={() => toggleLayer(layer.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: layer.color }}
                    />
                    <span className="text-sm font-medium">{layer.name}</span>
                  </div>
                </div>
              </div>
              
              {layer.enabled && (
                <div className="ml-7 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Opacity</span>
                    <span>{Math.round(layer.opacity * 100)}%</span>
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

        <div className="pt-4 border-t border-border/30 space-y-2">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Download className="w-4 h-4" />
            Export Map (PNG)
          </Button>
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Download className="w-4 h-4" />
            Export Data (CSV)
          </Button>
        </div>
      </Card>

      {/* Center - Map View */}
      <Card className="glass-panel lg:col-span-3 relative overflow-hidden">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant={viewMode === "2d" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("2d")}
          >
            2D
          </Button>
          <Button
            variant={viewMode === "3d" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("3d")}
          >
            3D
          </Button>
        </div>

        {/* Map Placeholder */}
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-space-deep via-space-medium to-space-light">
          <div className="text-center space-y-4">
            <Globe2 className="w-16 h-16 mx-auto text-primary/50 animate-orbital-rotation" />
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {sphere.name} Map View ({viewMode.toUpperCase()})
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Interactive map with {layers.filter(l => l.enabled).length} active layers.
                Implement with Mapbox, Cesium, or deck.gl for production.
              </p>
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              {layers.filter(l => l.enabled).map(layer => (
                <div
                  key={layer.id}
                  className="px-3 py-1 rounded-full text-xs flex items-center gap-2 glass-panel"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }} />
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
