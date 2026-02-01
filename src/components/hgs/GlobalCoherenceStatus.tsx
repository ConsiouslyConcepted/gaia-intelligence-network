import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

export const GlobalCoherenceStatus = () => {
  const [rotation, setRotation] = useState(0);
  const coherenceValue = 82.6;
  const status = "Stable";

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="glass-panel p-4 space-y-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Global Coherence Status</h3>
        <div className="flex gap-1">
          <div className="w-1.5 h-3 bg-primary/60 rounded-sm" />
          <div className="w-1.5 h-3 bg-primary/40 rounded-sm" />
          <div className="w-1.5 h-3 bg-primary/20 rounded-sm" />
        </div>
      </div>

      {/* Circular gauge */}
      <div className="relative flex items-center justify-center py-4">
        <svg viewBox="0 0 120 120" className="w-40 h-40">
          {/* Outer decorative ring */}
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            opacity="0.3"
          />

          {/* Rotating orbital ring */}
          <g transform={`rotate(${rotation} 60 60)`}>
            <ellipse
              cx="60"
              cy="60"
              rx="50"
              ry="20"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              opacity="0.4"
            />
            <circle cx="110" cy="60" r="3" fill="hsl(var(--primary))" opacity="0.8" />
          </g>

          {/* Second orbital */}
          <g transform={`rotate(${-rotation * 0.7 + 90} 60 60)`}>
            <ellipse
              cx="60"
              cy="60"
              rx="45"
              ry="18"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="1"
              opacity="0.3"
            />
          </g>

          {/* Progress arc */}
          <circle
            cx="60"
            cy="60"
            r="42"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="4"
            opacity="0.2"
          />
          <circle
            cx="60"
            cy="60"
            r="42"
            fill="none"
            stroke="url(#coherenceGradient)"
            strokeWidth="4"
            strokeDasharray={`${(coherenceValue / 100) * 264} 264`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="coherenceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="50%" stopColor="hsl(var(--secondary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>

          {/* Center glow */}
          <circle cx="60" cy="60" r="30" fill="hsl(var(--primary))" opacity="0.1" />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{status}</span>
          <span className="text-3xl font-bold text-primary">{coherenceValue}</span>
        </div>
      </div>

      {/* System Readiness bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">System Readiness</span>
        </div>
        <div className="flex gap-1 h-3">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm ${
                i < 8
                  ? i < 4
                    ? "bg-coherence-high"
                    : i < 7
                    ? "bg-coherence-medium"
                    : "bg-coherence-low"
                  : "bg-muted/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-border/30">
        <div className="space-y-1">
          <span className="text-lg font-bold text-primary">6</span>
          <span className="text-muted-foreground"> hrs</span>
          <div className="text-muted-foreground">Viable Exchange</div>
        </div>
        <div className="text-center space-y-1">
          <span className="text-sm font-medium">8x</span>
          <div className="text-muted-foreground">Rech percentage</div>
        </div>
        <div className="text-right space-y-1">
          <span className="text-sm font-medium">7</span>
          <div className="text-muted-foreground">Sensitivity</div>
        </div>
      </div>
    </Card>
  );
};
