import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const sphereData = [
  { name: "Magnetosphere", phase: 0.78, coherence: 82, load: "nominal" },
  { name: "Biosphere", phase: 0.65, coherence: 71, load: "moderate" },
  { name: "Technosphere", phase: 0.89, coherence: 88, load: "elevated" },
  { name: "Noosphere", phase: 0.72, coherence: 76, load: "nominal" },
];

const getLoadColor = (load: string) => {
  switch (load) {
    case "nominal": return "bg-coherence-high/20 text-coherence-high border-coherence-high/30";
    case "moderate": return "bg-coherence-medium/20 text-coherence-medium border-coherence-medium/30";
    case "elevated": return "bg-coherence-low/20 text-coherence-low border-coherence-low/30";
    default: return "bg-muted/20 text-muted-foreground border-muted/30";
  }
};

export const GaiaSphereFieldView = () => {
  return (
    <Card className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">GaiaSphere Field View</h2>
          <p className="text-sm text-muted-foreground">Planetary + system conditions</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
          Live Field
        </Badge>
      </div>

      {/* Concentric Sphere Visualization */}
      <div className="relative h-64 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Outer rings representing spheres */}
          {sphereData.map((sphere, idx) => (
            <TooltipProvider key={sphere.name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="absolute rounded-full border-2 animate-pulse"
                    style={{
                      width: `${(idx + 1) * 60}px`,
                      height: `${(idx + 1) * 60}px`,
                      borderColor: `hsl(${180 + idx * 30} 80% ${50 + sphere.coherence * 0.2}%)`,
                      opacity: 0.3 + sphere.phase * 0.5,
                      animationDuration: `${3 + idx}s`,
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{sphere.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Indicative signal only. Does not authorize action.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          
          {/* Center core */}
          <div className="w-8 h-8 rounded-full bg-primary/60 animate-pulse harmonic-glow" />
        </div>

        {/* Orbital paths */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <ellipse
            cx="50%"
            cy="50%"
            rx="100"
            ry="40"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            className="animate-spin"
            style={{ animationDuration: "20s" }}
          />
        </svg>
      </div>

      {/* Sphere Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sphereData.map((sphere) => (
          <TooltipProvider key={sphere.name}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{sphere.name}</span>
                    <Badge variant="outline" className={`text-xs ${getLoadColor(sphere.load)}`}>
                      {sphere.load}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Phase</span>
                      <span>{(sphere.phase * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${sphere.phase * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Coherence</span>
                      <span>{sphere.coherence}%</span>
                    </div>
                    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary rounded-full transition-all"
                        style={{ width: `${sphere.coherence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs text-muted-foreground">
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
