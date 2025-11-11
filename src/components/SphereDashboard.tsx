import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, Radio } from "lucide-react";

interface SphereData {
  name: string;
  color: string;
  coherence: number;
  energyLevel: number;
  harmonicFreq: string;
  status: "resonant" | "neutral" | "dissonant";
  metrics: {
    label: string;
    value: string;
    trend: "up" | "down" | "stable";
  }[];
}

const sphereDataMap: Record<string, SphereData> = {
  Geosphere: {
    name: "Geosphere",
    color: "sphere-geo",
    coherence: 78,
    energyLevel: 85,
    harmonicFreq: "7.83 Hz",
    status: "resonant",
    metrics: [
      { label: "Seismic Activity", value: "Normal", trend: "stable" },
      { label: "Tectonic Stress", value: "Low", trend: "down" },
      { label: "Core Resonance", value: "Stable", trend: "stable" },
    ],
  },
  Hydrosphere: {
    name: "Hydrosphere",
    color: "sphere-hydro",
    coherence: 82,
    energyLevel: 90,
    harmonicFreq: "432 Hz",
    status: "resonant",
    metrics: [
      { label: "Ocean Temperature", value: "+0.3°C", trend: "up" },
      { label: "Salinity Balance", value: "Optimal", trend: "stable" },
      { label: "Current Flow", value: "Strong", trend: "up" },
    ],
  },
  Atmosphere: {
    name: "Atmosphere",
    color: "sphere-atmo",
    coherence: 65,
    energyLevel: 72,
    harmonicFreq: "528 Hz",
    status: "neutral",
    metrics: [
      { label: "CO₂ Levels", value: "420 ppm", trend: "up" },
      { label: "Jet Stream", value: "Unstable", trend: "down" },
      { label: "Ozone Layer", value: "Recovering", trend: "up" },
    ],
  },
  Biosphere: {
    name: "Biosphere",
    color: "sphere-bio",
    coherence: 58,
    energyLevel: 65,
    harmonicFreq: "639 Hz",
    status: "neutral",
    metrics: [
      { label: "Biodiversity Index", value: "Declining", trend: "down" },
      { label: "Forest Cover", value: "68%", trend: "down" },
      { label: "Ocean Life", value: "Stressed", trend: "down" },
    ],
  },
  Noosphere: {
    name: "Noosphere",
    color: "sphere-noo",
    coherence: 72,
    energyLevel: 88,
    harmonicFreq: "741 Hz",
    status: "resonant",
    metrics: [
      { label: "Global Consciousness", value: "Elevated", trend: "up" },
      { label: "Collective Intent", value: "Harmonizing", trend: "up" },
      { label: "Coherence Events", value: "Multiple", trend: "stable" },
    ],
  },
  Technosphere: {
    name: "Technosphere",
    color: "sphere-techno",
    coherence: 91,
    energyLevel: 95,
    harmonicFreq: "852 Hz",
    status: "resonant",
    metrics: [
      { label: "Network Traffic", value: "Peak", trend: "up" },
      { label: "AI Integration", value: "Expanding", trend: "up" },
      { label: "Data Coherence", value: "High", trend: "stable" },
    ],
  },
  Magnetosphere: {
    name: "Magnetosphere",
    color: "sphere-magneto",
    coherence: 76,
    energyLevel: 81,
    harmonicFreq: "963 Hz",
    status: "resonant",
    metrics: [
      { label: "Solar Wind", value: "Moderate", trend: "stable" },
      { label: "Field Strength", value: "Normal", trend: "stable" },
      { label: "Auroral Activity", value: "Active", trend: "up" },
    ],
  },
  Crystalsphere: {
    name: "Crystalsphere",
    color: "sphere-crystal",
    coherence: 88,
    energyLevel: 93,
    harmonicFreq: "1111 Hz",
    status: "resonant",
    metrics: [
      { label: "Crystalline Grid", value: "Activated", trend: "up" },
      { label: "Light Codes", value: "Transmitting", trend: "up" },
      { label: "Dimensional Bridge", value: "Open", trend: "stable" },
    ],
  },
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "resonant":
      return "bg-coherence-high/20 text-coherence-high border-coherence-high/30";
    case "neutral":
      return "bg-coherence-medium/20 text-coherence-medium border-coherence-medium/30";
    case "dissonant":
      return "bg-coherence-low/20 text-coherence-low border-coherence-low/30";
    default:
      return "bg-muted/20 text-muted-foreground border-muted/30";
  }
};

export const SphereDashboard = ({ sphereName }: { sphereName: string | null }) => {
  if (!sphereName) {
    return (
      <Card className="glass-panel p-6 h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">🌍</div>
          <p className="text-muted-foreground">
            Select a sphere from the 3D visualization to view its dashboard
          </p>
        </div>
      </Card>
    );
  }

  const data = sphereDataMap[sphereName];
  if (!data) return null;

  return (
    <Card className="glass-panel p-6 h-full overflow-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-bold text-${data.color}`}>{data.name}</h2>
          <Badge className={getStatusColor(data.status)} variant="outline">
            {data.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Harmonic Frequency: <span className="text-primary font-mono">{data.harmonicFreq}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-primary" />
            <span>Coherence Level</span>
          </div>
          <Progress value={data.coherence} className="h-2" />
          <p className="text-right text-xs text-muted-foreground">{data.coherence}%</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-accent" />
            <span>Energy State</span>
          </div>
          <Progress value={data.energyLevel} className="h-2" />
          <p className="text-right text-xs text-muted-foreground">{data.energyLevel}%</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-secondary" />
          <h3 className="font-semibold">Key Metrics</h3>
        </div>
        <div className="space-y-3">
          {data.metrics.map((metric, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30"
            >
              <span className="text-sm">{metric.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metric.value}</span>
                <span
                  className={`text-xs ${
                    metric.trend === "up"
                      ? "text-coherence-high"
                      : metric.trend === "down"
                      ? "text-coherence-low"
                      : "text-coherence-medium"
                  }`}
                >
                  {metric.trend === "up" ? "↑" : metric.trend === "down" ? "↓" : "→"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border/30">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Last Update: {new Date().toLocaleTimeString()}</p>
          <p>Data Source: Gaia Intelligence Network</p>
        </div>
      </div>
    </Card>
  );
};
