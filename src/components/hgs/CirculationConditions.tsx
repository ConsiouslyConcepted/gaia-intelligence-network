import { Card } from "@/components/ui/card";
import { Droplets } from "lucide-react";

const conditions = [
  { value: "70", unit: "%", label: "Exchange Readiness", color: "from-coherence-high to-secondary", arcPercent: 70 },
  { value: "Moderate", unit: "", label: "Pacing Sensitivity", color: "from-coherence-medium to-accent", arcPercent: 55 },
  { value: "Low Risk", unit: "", label: "Liquidity Stress", color: "from-coherence-low to-destructive", arcPercent: 25 },
  { value: "6", unit: " hrs", label: "Timing Constraints", color: "from-primary to-secondary", arcPercent: 80 },
];

const GaugeArc = ({ percent, colorClass }: { percent: number; colorClass: string }) => {
  const radius = 32;
  const circumference = Math.PI * radius; // Half circle
  const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;

  return (
    <svg viewBox="0 0 80 50" className="w-full h-12">
      <defs>
        <linearGradient id={`gauge-${colorClass}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" className={`${colorClass.split(" ")[0].replace("from-", "stop-")}`} stopColor="currentColor" />
          <stop offset="100%" className={`${colorClass.split(" ")[1]?.replace("to-", "stop-")}`} stopColor="currentColor" />
        </linearGradient>
      </defs>

      {/* Background arc */}
      <path
        d="M 8 45 A 32 32 0 0 1 72 45"
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth="6"
        opacity="0.3"
      />

      {/* Value arc */}
      <path
        d="M 8 45 A 32 32 0 0 1 72 45"
        fill="none"
        stroke={`url(#gauge-${colorClass})`}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={strokeDasharray}
        className={`bg-gradient-to-r ${colorClass}`}
        style={{ stroke: `hsl(var(--${colorClass.includes("high") ? "coherence-high" : colorClass.includes("medium") ? "coherence-medium" : colorClass.includes("low") ? "coherence-low" : "primary"}))` }}
      />
    </svg>
  );
};

export const CirculationConditions = () => {
  return (
    <Card className="glass-panel p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Droplets className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Circulation Conditions</span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {conditions.map((cond, idx) => (
          <div key={idx} className="text-center space-y-1">
            <GaugeArc percent={cond.arcPercent} colorClass={cond.color} />
            <div className="text-lg font-bold text-foreground">
              {cond.value}
              <span className="text-xs text-muted-foreground">{cond.unit}</span>
            </div>
            <div className="text-[10px] text-muted-foreground leading-tight">{cond.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};
