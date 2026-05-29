import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useSphereIntelligence } from "@/hooks/useSphereIntelligence";
import { SphereId } from "@/types/spheres";
import { MetricTile } from "./MetricTile";
import { Sparkline } from "./Sparkline";

interface Props {
  sphereId: SphereId;
  accent: string;
}

export function SphereIntelligenceCard({ sphereId, accent }: Props) {
  const intel = useSphereIntelligence(sphereId);
  const TrendIcon = intel.trend > 0.5 ? ArrowUp : intel.trend < -0.5 ? ArrowDown : Minus;
  const trendSign = intel.trend > 0 ? "+" : "";

  return (
    <div
      className="rounded-xl p-5 border"
      style={{
        background:
          "linear-gradient(145deg, hsla(240,20%,13%,0.92) 0%, hsla(240,25%,9%,0.88) 50%, hsla(240,22%,7%,0.92) 100%)",
        borderColor: "hsla(0,0%,100%,0.08)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.45)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-medium">
            Intelligence Card
          </div>
          <p className="text-[11px] text-foreground/70 mt-1 leading-snug">{intel.purpose}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-baseline justify-end gap-1">
            <span
              className="text-[40px] font-mono font-semibold leading-none tabular-nums"
              style={{ color: `${accent}ee` }}
            >
              {intel.score}
            </span>
            <span className="text-[10px] text-muted-foreground/40">/100</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-1">
            <span className="text-[9px] uppercase tracking-[0.18em] text-foreground/60">
              {intel.scoreLabel}
            </span>
            <span
              className="inline-flex items-center gap-0.5 text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded"
              style={{
                background: "hsla(240,25%,8%,0.6)",
                color: `${accent}cc`,
              }}
            >
              <TrendIcon className="w-2.5 h-2.5" />
              {trendSign}
              {intel.trend.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Score series */}
      <div className="mb-4 h-10">
        <Sparkline data={intel.scoreSeries} color={accent} height={40} strokeWidth={1.2} />
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {intel.metrics.map((m) => (
          <MetricTile key={m.spec.key} reading={m} accent={accent} />
        ))}
      </div>

      {/* Anomalies */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/40 mr-1">
          Active Anomalies
        </span>
        {intel.anomalies.length === 0 ? (
          <span className="text-[9px] text-muted-foreground/40">None — all metrics within ±2σ</span>
        ) : (
          intel.anomalies.map((a) => (
            <span
              key={a.spec.key}
              className="text-[8px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border"
              style={{
                color: accent,
                borderColor: `${accent}55`,
                background: `${accent}10`,
              }}
            >
              {a.spec.label} · {a.z >= 0 ? "+" : ""}
              {a.z.toFixed(1)}σ
            </span>
          ))
        )}
      </div>
    </div>
  );
}
