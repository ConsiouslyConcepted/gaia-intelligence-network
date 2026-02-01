import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export const CymaticPatternView = () => {
  const [phase, setPhase] = useState(0);
  const coherence = 76; // This would come from state/props

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 0.02) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Generate cymatic-style pattern points
  const generatePattern = () => {
    const points: { x: number; y: number; opacity: number }[] = [];
    const centerX = 150;
    const centerY = 75;
    const baseRadius = 50;

    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const harmonicOffset = Math.sin(angle * 6 + phase) * 10 * (coherence / 100);
      const radius = baseRadius + harmonicOffset;
      
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        opacity: 0.3 + (Math.sin(angle * 3 + phase) + 1) * 0.35,
      });
    }
    return points;
  };

  const patternPoints = generatePattern();

  return (
    <Card className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Resonance Pattern</h2>
          <p className="text-sm text-muted-foreground">Cymatic coherence visualization</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
          Live
        </Badge>
      </div>

      <div className="relative h-40 flex items-center justify-center bg-muted/10 rounded-lg overflow-hidden">
        <svg viewBox="0 0 300 150" className="w-full h-full">
          {/* Background glow */}
          <defs>
            <radialGradient id="cymaticGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="150" cy="75" r="60" fill="url(#cymaticGlow)" />

          {/* Cymatic pattern */}
          <polygon
            points={patternPoints.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            opacity="0.8"
          />

          {/* Inner pattern */}
          <polygon
            points={patternPoints.map((p) => {
              const dx = p.x - 150;
              const dy = p.y - 75;
              return `${150 + dx * 0.6},${75 + dy * 0.6}`;
            }).join(" ")}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="1.5"
            opacity="0.6"
          />

          {/* Core */}
          <circle
            cx="150"
            cy="75"
            r={8 + Math.sin(phase * 2) * 2}
            fill="hsl(var(--primary))"
            opacity="0.8"
          />

          {/* Nodal points */}
          {patternPoints.filter((_, i) => i % 6 === 0).map((point, idx) => (
            <circle
              key={idx}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="hsl(var(--accent))"
              opacity={point.opacity}
            />
          ))}
        </svg>

        {/* Coherence indicator */}
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          Coherence: {coherence}%
        </div>
      </div>
    </Card>
  );
};
