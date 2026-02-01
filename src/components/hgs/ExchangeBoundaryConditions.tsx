import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle } from "lucide-react";

const boundaryConditions = [
  { id: "liquidity", name: "Liquidity Stress", value: 0.18, threshold: 0.3, status: "stable" },
  { id: "timing", name: "Timing Windows", value: "Open", threshold: null, status: "active" },
  { id: "sensitivity", name: "Conversion Sensitivity", value: 0.42, threshold: 0.5, status: "moderate" },
  { id: "coordination", name: "Coordination Load", value: 67, threshold: 80, status: "nominal" },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case "stable":
    case "active":
    case "nominal":
      return "bg-coherence-high/20 text-coherence-high border-coherence-high/30";
    case "moderate":
      return "bg-coherence-medium/20 text-coherence-medium border-coherence-medium/30";
    case "critical":
      return "bg-coherence-low/20 text-coherence-low border-coherence-low/30";
    default:
      return "bg-muted/20 text-muted-foreground border-muted/30";
  }
};

export const ExchangeBoundaryConditions = () => {
  return (
    <Card className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Exchange Boundary Conditions</h2>
          <p className="text-sm text-muted-foreground">Advisory parameters (read-only)</p>
        </div>
        <Badge variant="outline" className="bg-muted/20 text-muted-foreground border-muted/30">
          Advisory
        </Badge>
      </div>

      {/* Explicit disclaimer */}
      <div className="p-3 rounded-lg bg-muted/10 border border-border/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-coherence-medium flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          These parameters bound exchange behavior. They do not execute trades.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {boundaryConditions.map((condition) => (
          <TooltipProvider key={condition.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-3 cursor-help">
                  <div className="text-xs text-muted-foreground">{condition.name}</div>
                  <div className="text-lg font-bold text-foreground">
                    {typeof condition.value === "number" 
                      ? condition.value < 1 
                        ? (condition.value * 100).toFixed(0) + "%" 
                        : condition.value + "%"
                      : condition.value}
                  </div>
                  <Badge variant="outline" className={`text-xs ${getStatusStyle(condition.status)}`}>
                    {condition.status}
                  </Badge>
                  {condition.threshold && (
                    <div className="text-xs text-muted-foreground">
                      Threshold: {condition.threshold < 1 
                        ? (condition.threshold * 100).toFixed(0) + "%" 
                        : condition.threshold + "%"}
                    </div>
                  )}
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
    </Card>
  );
};
