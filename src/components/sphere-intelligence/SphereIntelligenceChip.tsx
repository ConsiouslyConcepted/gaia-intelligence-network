import { useSphereIntelligence } from "@/hooks/useSphereIntelligence";
import { SphereId } from "@/types/spheres";
import { Sparkline } from "./Sparkline";

interface Props {
  sphereId: SphereId;
  accent: string;
}

export function SphereIntelligenceChip({ sphereId, accent }: Props) {
  const intel = useSphereIntelligence(sphereId);
  const arrow = intel.trend > 0.5 ? "▲" : intel.trend < -0.5 ? "▼" : "·";
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-3">
        <Sparkline data={intel.scoreSeries} color={accent} height={12} />
      </div>
      <span
        className="text-[9px] font-mono font-semibold tabular-nums leading-none"
        style={{ color: `${accent}cc` }}
      >
        {intel.score}
        <span className="ml-0.5 text-[8px] text-muted-foreground/40">{arrow}</span>
      </span>
      <span
        className="text-[7px] uppercase tracking-[0.14em] leading-none"
        style={{ color: `${accent}66` }}
      >
        {intel.scoreLabel}
      </span>
    </div>
  );
}
