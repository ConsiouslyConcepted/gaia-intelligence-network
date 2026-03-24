import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sphere } from "@/types/spheres";
import { Brain, AlertTriangle, TrendingUp, Sparkles, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
    description: "Kp index increased by 2.5 units in 30 minutes - unusual rate of change",
    confidence: 0.89,
    timestamp: "2h ago"
  },
  {
    type: "Pattern Deviation",
    severity: "medium",
    description: "IMF Bz orientation shows atypical persistence in negative direction",
    confidence: 0.73,
    timestamp: "4h ago"
  },
  {
    type: "Cross-Sphere Correlation",
    severity: "low",
    description: "Weak expected correlation between solar wind and Dst index",
    confidence: 0.65,
    timestamp: "8h ago"
  },
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high": return "bg-coherence-low/20 text-coherence-low border-coherence-low/30";
    case "medium": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    default: return "bg-coherence-medium/20 text-coherence-medium border-coherence-medium/30";
  }
};

export function SphereAIMReport({ sphere }: { sphere: Sphere }) {
  const overallScore = Math.round(
    mockCoherenceData.reduce((sum, c) => sum + c.score * c.weight, 0)
  );

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="glass-panel p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: `${sphere.color}15` }}>
            <Brain className="w-8 h-8 animate-harmonic-pulse" style={{ color: sphere.color }} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">AI Coherence Report</h2>
            <p className="text-sm text-muted-foreground">
              Generated: {new Date().toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">Overall Score</div>
            <div className="text-4xl font-bold" style={{ color: sphere.color }}>{overallScore}%</div>
          </div>
        </div>
      </Card>

      {/* Score Breakdown */}
      <Card className="glass-panel p-6 space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5" style={{ color: sphere.color }} />
          Coherence Score Breakdown
        </h3>
        <div className="space-y-4">
          {mockCoherenceData.map((component, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{component.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    Weight: {(component.weight * 100).toFixed(0)}%
                  </span>
                  <span className="text-sm font-bold w-12 text-right" style={{ color: sphere.color }}>
                    {component.score}%
                  </span>
                </div>
              </div>
              <Progress value={component.score} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Anomalies */}
      <Card className="glass-panel p-6 space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" style={{ color: sphere.color }} />
          Detected Anomalies
        </h3>
        <div className="space-y-3">
          {mockAnomalies.map((anomaly, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border flex items-start gap-4 ${getSeverityColor(anomaly.severity)}`}
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {anomaly.severity}
                  </Badge>
                  <span className="text-sm font-semibold">{anomaly.type}</span>
                </div>
                <p className="text-sm">{anomaly.description}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">
                    Confidence: {(anomaly.confidence * 100).toFixed(0)}%
                  </span>
                  <span className="text-muted-foreground">{anomaly.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Narrative Insights */}
      <Card className="glass-panel p-6 space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          AI Narrative Summary
        </h3>
        <div className="prose prose-invert max-w-none">
          <p className="text-sm leading-relaxed">
            The {sphere.name} is currently showing <strong>elevated activity levels</strong> with 
            an overall coherence score of {overallScore}%. Analysis indicates a significant correlation 
            between rising geomagnetic flux and solar wind parameters, with a lag time of approximately 
            3 hours.
          </p>
          <p className="text-sm leading-relaxed mt-3">
            Recent anomalies suggest an <strong>incoming geomagnetic disturbance</strong>, likely 
            resulting from a coronal mass ejection detected 48 hours ago. Magnetopause compression 
            is expected within the next 12-24 hours, with potential impacts on ionospheric TEC 
            and ground magnetometer readings.
          </p>
          <p className="text-sm leading-relaxed mt-3">
            Cross-sphere correlation analysis reveals <strong>synchronization patterns</strong> between 
            magnetospheric dynamics and noospheric indicators, suggesting collective human response 
            to geomagnetic variations may be present in the data.
          </p>
        </div>
      </Card>

      {/* Watch Points */}
      <Card className="glass-panel p-6 space-y-4">
        <h3 className="text-lg font-semibold">Recommended Watch Points</h3>
        <div className="space-y-2">
          {[
            "Monitor Kp index for sustained elevation above 4",
            "Track IMF Bz orientation for prolonged southward turning",
            "Observe auroral power indices for storm intensification",
            "Watch for secondary effects in ionospheric TEC maps",
          ].map((point, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </div>
              <p className="text-sm flex-1">{point}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Export PDF Report
        </Button>
        <Button variant="outline" className="gap-2">
          Create Alert Rule
        </Button>
        <Button variant="outline" className="gap-2">
          Schedule Weekly Report
        </Button>
      </div>
    </div>
  );
}
