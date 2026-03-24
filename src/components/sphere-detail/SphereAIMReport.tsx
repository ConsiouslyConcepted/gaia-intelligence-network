import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sphere } from "@/types/spheres";
import { Brain, AlertTriangle, TrendingUp, Sparkles, Download } from "lucide-react";

interface CoherenceComponent {
  name: string;
  score: number;
  weight: number;
}

const mockCoherenceData: CoherenceComponent[] = [
  { name: "Data Quality", score: 92, weight: 0.25 },
  { name: "Temporal Consistency", score: 88, weight: 0.20 },
  { name: "Spatial Coverage", score: 76, weight: 0.20 },
  { name: "Cross-Parameter Agreement", score: 71, weight: 0.15 },
  { name: "Physical Plausibility", score: 85, weight: 0.20 },
];

interface Anomaly {
  type: string;
  severity: "low" | "medium" | "high";
  description: string;
  confidence: number;
  timestamp: string;
}

const mockAnomalies: Anomaly[] = [
  {
    type: "Sudden Spike",
    severity: "high",
    description: "Kp index increased by 2.5 units in 30 minutes",
    confidence: 0.89,
    timestamp: "2h ago"
  },
  {
    type: "Pattern Deviation",
    severity: "medium",
    description: "IMF Bz orientation shows atypical persistence",
    confidence: 0.73,
    timestamp: "4h ago"
  },
  {
    type: "Cross-Sphere Correlation",
    severity: "low",
    description: "Weak expected correlation between solar wind and Dst",
    confidence: 0.65,
    timestamp: "8h ago"
  },
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high": return "border-coherence-low/20 bg-coherence-low/5";
    case "medium": return "border-yellow-500/20 bg-yellow-500/5";
    default: return "border-coherence-medium/20 bg-coherence-medium/5";
  }
};

const getSeverityDot = (severity: string) => {
  switch (severity) {
    case "high": return "bg-coherence-low";
    case "medium": return "bg-yellow-500";
    default: return "bg-coherence-medium";
  }
};

export function SphereAIMReport({ sphere }: { sphere: Sphere }) {
  const overallScore = Math.round(
    mockCoherenceData.reduce((sum, c) => sum + c.score * c.weight, 0)
  );

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${sphere.color}12` }}>
            <Brain className="w-6 h-6" style={{ color: sphere.color }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold tracking-wide">AI Coherence Report</h2>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mt-0.5">
              Generated: {new Date().toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40">Score</div>
            <div className="text-3xl font-bold font-mono" style={{ color: sphere.color }}>{overallScore}%</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Score Breakdown */}
        <Card className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: sphere.color }} />
            <h3 className="text-sm font-semibold">Score Breakdown</h3>
          </div>
          <div className="space-y-3">
            {mockCoherenceData.map((component, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground/70">{component.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground/30 font-mono">
                      w:{(component.weight * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs font-bold font-mono w-8 text-right" style={{ color: sphere.color }}>
                      {component.score}
                    </span>
                  </div>
                </div>
                <div className="h-[3px] rounded-full bg-border/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${component.score}%`,
                      background: `linear-gradient(90deg, ${sphere.color}40, ${sphere.color}cc)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Anomalies */}
        <Card className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" style={{ color: sphere.color }} />
            <h3 className="text-sm font-semibold">Detected Anomalies</h3>
          </div>
          <div className="space-y-2">
            {mockAnomalies.map((anomaly, idx) => (
              <div
                key={idx}
                className={`px-3 py-2.5 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${getSeverityDot(anomaly.severity)}`} />
                  <span className="text-xs font-medium">{anomaly.type}</span>
                  <span className="text-[9px] text-muted-foreground/30 ml-auto font-mono">{anomaly.timestamp}</span>
                </div>
                <p className="text-[11px] text-muted-foreground/60 leading-relaxed">{anomaly.description}</p>
                <div className="text-[9px] text-muted-foreground/30 mt-1 font-mono">
                  confidence: {(anomaly.confidence * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Narrative */}
      <Card className="glass-panel rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: sphere.color }} />
          <h3 className="text-sm font-semibold">AI Narrative Summary</h3>
        </div>
        <div className="space-y-2.5">
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            The {sphere.name} is currently showing <span className="text-foreground/90 font-medium">elevated activity levels</span> with 
            an overall coherence score of {overallScore}%. Analysis indicates a significant correlation 
            between rising geomagnetic flux and solar wind parameters.
          </p>
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            Cross-sphere correlation analysis reveals <span className="text-foreground/90 font-medium">synchronization patterns</span> between 
            magnetospheric dynamics and noospheric indicators, suggesting collective response 
            to geomagnetic variations may be present in the data.
          </p>
        </div>
      </Card>

      {/* Watch Points */}
      <Card className="glass-panel rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold">Watch Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "Monitor Kp index for sustained elevation above 4",
            "Track IMF Bz orientation for prolonged southward turning",
            "Observe auroral power indices for storm intensification",
            "Watch for secondary effects in ionospheric TEC maps",
          ].map((point, idx) => (
            <div key={idx} className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-muted/8 border border-border/10">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold mt-0.5 shrink-0"
                style={{ backgroundColor: `${sphere.color}15`, color: sphere.color }}
              >
                {idx + 1}
              </div>
              <p className="text-[11px] text-muted-foreground/60 leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" className="gap-1.5 text-xs h-8 rounded-lg" style={{ backgroundColor: `${sphere.color}cc`, color: '#fff' }}>
          <Download className="w-3 h-3" />
          Export PDF
        </Button>
        <Button variant="outline" size="sm" className="text-xs h-8 rounded-lg border-border/20 text-muted-foreground">
          Create Alert Rule
        </Button>
        <Button variant="outline" size="sm" className="text-xs h-8 rounded-lg border-border/20 text-muted-foreground">
          Schedule Report
        </Button>
      </div>
    </div>
  );
}
