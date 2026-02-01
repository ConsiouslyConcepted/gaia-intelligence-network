import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const valueFlowDomains = [
  { id: "strategic", name: "Strategic", continuity: 85, bottleneck: false, distortion: 0.12 },
  { id: "intelligence", name: "Intelligence", continuity: 78, bottleneck: false, distortion: 0.18 },
  { id: "communication", name: "Communication", continuity: 92, bottleneck: false, distortion: 0.08 },
  { id: "relational", name: "Relational", continuity: 71, bottleneck: true, distortion: 0.24 },
  { id: "operational", name: "Operational", continuity: 88, bottleneck: false, distortion: 0.11 },
  { id: "creative", name: "Creative", continuity: 67, bottleneck: true, distortion: 0.29 },
  { id: "material", name: "Material", continuity: 81, bottleneck: false, distortion: 0.15 },
];

const circulationSignals = [
  { id: "circulation", name: "Circulation Signals", value: 72, status: "flowing" },
  { id: "participation", name: "Participation Density", value: 84, status: "active" },
  { id: "readiness", name: "Readiness Signals", value: 68, status: "moderate" },
  { id: "pacing", name: "Pacing Indicators", value: 91, status: "aligned" },
];

const getFlowColor = (continuity: number) => {
  if (continuity >= 80) return "bg-coherence-high";
  if (continuity >= 60) return "bg-coherence-medium";
  return "bg-coherence-low";
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "flowing":
    case "active":
    case "aligned":
      return "bg-coherence-high/20 text-coherence-high border-coherence-high/30";
    case "moderate":
      return "bg-coherence-medium/20 text-coherence-medium border-coherence-medium/30";
    default:
      return "bg-muted/20 text-muted-foreground border-muted/30";
  }
};

export const ValueFlowSignals = () => {
  return (
    <Card className="glass-panel p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Coordination & Circulation Signals</h2>
          <p className="text-sm text-muted-foreground">Value flow state & participation indicators</p>
        </div>
        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
          Read-Only
        </Badge>
      </div>

      {/* Value Flow State */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Value Flow State
        </h3>
        <div className="space-y-2">
          {valueFlowDomains.map((domain) => (
            <TooltipProvider key={domain.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-1 cursor-help">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{domain.name}</span>
                        {domain.bottleneck && (
                          <Badge variant="outline" className="text-xs bg-coherence-low/20 text-coherence-low border-coherence-low/30">
                            Bottleneck
                          </Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground">{domain.continuity}%</span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${getFlowColor(domain.continuity)}`}
                        style={{ 
                          width: `${domain.continuity}%`,
                          animation: domain.bottleneck ? 'none' : 'pulse 2s ease-in-out infinite'
                        }}
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{domain.name} Domain</p>
                  <p className="text-xs">Flow continuity: {domain.continuity}%</p>
                  <p className="text-xs">Phase distortion: {(domain.distortion * 100).toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground italic mt-1">
                    Indicative signal only. Does not authorize action.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {/* Circulation Signals */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Coordination Signals
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {circulationSignals.map((signal) => (
            <TooltipProvider key={signal.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-2 cursor-help">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{signal.name}</span>
                    </div>
                    <div className="text-xl font-bold text-primary">{signal.value}%</div>
                    <Badge variant="outline" className={`text-xs ${getStatusBadge(signal.status)}`}>
                      {signal.status}
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs text-muted-foreground italic">
                    Indicative signal only. Does not authorize action.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </Card>
  );
};
