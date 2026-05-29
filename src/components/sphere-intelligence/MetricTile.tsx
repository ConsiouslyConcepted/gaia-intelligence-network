import { MetricReading, formatMetric } from "@/lib/sphereIntelligence";
import { Sparkline } from "./Sparkline";

interface Props {
  reading: MetricReading;
  accent: string;
}

export function MetricTile({ reading, accent }: Props) {
  const { spec, deltaPct, isAnomaly, series } = reading;
  const sign = deltaPct >= 0 ? "+" : "";
  return (
    <div
      className="rounded-lg px-3 py-2.5 border"
      style={{
        background: "hsla(240,25%,8%,0.55)",
        borderColor: isAnomaly ? `${accent}55` : "hsla(0,0%,100%,0.06)",
      }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[8px] uppercase tracking-[0.14em] text-foreground/70 truncate">
          {spec.label}
        </span>
        {isAnomaly && (
          <span
            className="text-[7px] uppercase tracking-[0.18em] font-medium"
            style={{ color: accent }}
          >
            Anomaly
          </span>
        )}
      </div>
      <div className="flex items-baseline justify-between mt-1">
        <span
          className="text-[14px] font-mono font-semibold tabular-nums"
          style={{ color: `${accent}dd` }}
        >
          {formatMetric(reading)}
          {spec.unit && (
            <span className="text-[8px] text-muted-foreground/35 ml-1 font-normal">{spec.unit}</span>
          )}
        </span>
        <span className="text-[9px] font-mono text-muted-foreground/40 tabular-nums">
          {sign}
          {deltaPct.toFixed(1)}%
        </span>
      </div>
      <div className="mt-1.5 h-5">
        <Sparkline data={series} color={accent} />
      </div>
    </div>
  );
}
