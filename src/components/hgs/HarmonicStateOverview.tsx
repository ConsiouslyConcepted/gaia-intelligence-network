import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity, Waves, Zap, Target } from "lucide-react";

const metrics = [
  {
    id: "coherence",
    name: "Coherence Index",
    value: 76,
    unit: "%",
    trend: "+2.3",
    description: "Phase alignment score across domains",
    icon: Target,
    status: "nominal",
  },
  {
    id: "entropy",
    name: "Entropy Gradient",
    value: 0.23,
    unit: "",
    trend: "-0.04",
    description: "Fragmentation / dissipation indicator",
    icon: Activity,
    status: "nominal",
  },
  {
    id: "syntropic",
    name: "Syntropic Capacity",
    value: 84,
    unit: "%",
    trend: "+1.1",
    description: "Regenerative headroom",
    icon: Zap,
    status: "elevated",
  },
  {
    id: "phase",
    name: "Phase Stability",
    value: 0.89,
    unit: "",
    trend: "+0.02",
    description: "Drift vs lock-in",
    icon: Waves,
    status: "nominal",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "nominal": return "bg-coherence-high/20 text-coherence-high border-coherence-high/30";
    case "elevated": return "bg-coherence-medium/20 text-coherence-medium border-coherence-medium/30";
    case "critical": return "bg-coherence-low/20 text-coherence-low border-coherence-low/30";
    default: return "bg-muted/20 text-muted-foreground border-muted/30";
  }
};

const getThresholdColor = (value: number, isPercentage: boolean) => {
  const threshold = isPercentage ? value : value * 100;
  if (threshold >= 75) return "text-coherence-high";
  if (threshold >= 50) return "text-coherence-medium";
  return "text-coherence-low";
};

export const HarmonicStateOverview = () => {
  return (
    <Card className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">System Harmonic State</h2>
          <p className="text-sm text-muted-foreground">Core thermodynamic diagnostics</p>
        </div>
        <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
          Diagnostic
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <TooltipProvider key={metric.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-3 cursor-help">
                  <div className="flex items-center justify-between">
                    <metric.icon className="w-5 h-5 text-primary" />
                    <Badge variant="outline" className={`text-xs ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{metric.name}</div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-bold ${getThresholdColor(metric.value, metric.unit === "%")}`}>
                        {metric.value}
                      </span>
                      <span className="text-sm text-muted-foreground">{metric.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Trend</span>
                    <span className={metric.trend.startsWith("+") ? "text-coherence-high" : "text-coherence-low"}>
                      {metric.trend}
                    </span>
                  </div>

                  {/* Mini sparkline placeholder */}
                  <div className="h-8 flex items-end gap-0.5">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary/40 rounded-t"
                        style={{ height: `${30 + Math.random() * 70}%` }}
                      />
                    ))}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-1">{metric.name}</p>
                <p className="text-sm mb-2">{metric.description}</p>
                <p className="text-xs text-muted-foreground italic">
                  Indicative signal only. Does not authorize action.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </Card>
  );
};
