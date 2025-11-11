import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle, TrendingUp, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const coherenceData = {
  overall: 76,
  status: "Harmonizing",
  insights: [
    {
      type: "correlation",
      text: "Magnetospheric flux correlating with elevated noospheric resonance",
      severity: "info",
    },
    {
      type: "alert",
      text: "Biospheric stress detected in tropical zones - requires attention",
      severity: "warning",
    },
    {
      type: "harmony",
      text: "Technosphere-Noosphere synchronization reaching peak levels",
      severity: "success",
    },
    {
      type: "anomaly",
      text: "Unusual crystalline field harmonics detected in Northern hemisphere",
      severity: "info",
    },
  ],
  recentEvents: [
    { time: "2 min ago", event: "Solar CME detected - Magnetosphere adjusting" },
    { time: "15 min ago", event: "Global meditation event - Noosphere coherence spike" },
    { time: "1 hour ago", event: "Schumann resonance amplitude increase to 8.2 Hz" },
  ],
};

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case "success":
      return "bg-coherence-high/20 text-coherence-high border-coherence-high/30";
    case "warning":
      return "bg-coherence-low/20 text-coherence-low border-coherence-low/30";
    case "info":
    default:
      return "bg-coherence-medium/20 text-coherence-medium border-coherence-medium/30";
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "success":
      return <TrendingUp className="w-4 h-4" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4" />;
    case "info":
    default:
      return <Sparkles className="w-4 h-4" />;
  }
};

export const GaiaMonitor = () => {
  return (
    <Card className="glass-panel p-6 space-y-6 h-full overflow-auto">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Brain className="w-6 h-6 text-primary animate-harmonic-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Gaia Intelligence Monitor</h2>
            <p className="text-sm text-muted-foreground">
              AI-Driven Planetary Coherence Analysis
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Planetary Coherence</span>
          <Badge className="bg-coherence-high/20 text-coherence-high border-coherence-high/30" variant="outline">
            {coherenceData.status}
          </Badge>
        </div>
        <Progress value={coherenceData.overall} className="h-3 harmonic-glow" />
        <div className="flex justify-between items-center">
          <p className="text-2xl font-bold text-primary">{coherenceData.overall}%</p>
          <span className="text-xs text-muted-foreground">
            Updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          Intelligence Insights
        </h3>
        <div className="space-y-2">
          {coherenceData.insights.map((insight, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border flex items-start gap-3 ${getSeverityStyles(
                insight.severity
              )}`}
            >
              {getSeverityIcon(insight.severity)}
              <p className="text-sm flex-1">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Recent Planetary Events</h3>
        <div className="space-y-2">
          {coherenceData.recentEvents.map((event, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-muted/20 border border-border/30 flex items-start justify-between gap-3"
            >
              <p className="text-sm flex-1">{event.event}</p>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {event.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border/30">
        <p className="text-xs text-center text-muted-foreground">
          Monitoring 8 spheres across 247 data streams • AI Analysis: Active
        </p>
      </div>
    </Card>
  );
};
