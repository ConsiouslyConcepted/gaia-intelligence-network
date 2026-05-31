import { SphereId, SPHERES } from "@/types/spheres";
import { useSphereIntelligence } from "@/hooks/useSphereIntelligence";
import { SpherePanelBackdrop } from "@/components/SpherePanelBackdrop";

interface Props {
  sphereId: SphereId;
  metricKey: string;
  label: string;
}

/**
 * One row in the right HUD "Sphere Signals" panel.
 * Pulls a live metric from `useSphereIntelligence` (single source of truth)
 * and renders it over a sphere-tinted glass backdrop matching the left rail.
 */
export function SphereSignalRow({ sphereId, metricKey, label }: Props) {
  const intel = useSphereIntelligence(sphereId, 3000);
  const metric = intel.metrics.find((m) => m.spec.key === metricKey);
  const sphere = SPHERES[sphereId];

  if (!metric) return null;

  const series = metric.series ?? [];
  const minV = Math.min(...series);
  const maxV = Math.max(...series);
  const range = Math.max(1e-6, maxV - minV);
  const points = series
    .map((v, i) => {
      const x = (i / Math.max(1, series.length - 1)) * 60;
      const y = 20 - ((v - minV) / range) * 18 - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const valueStr = metric.value.toFixed(metric.spec.precision ?? 2);
  const accent = sphere.color;

  return (
    <div className="relative overflow-hidden rounded-lg px-2.5 py-2 group">
      <SpherePanelBackdrop accent={accent} />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <SpherePanelBackdrop accent={accent} active />
      </div>
      <div className="relative z-10">
        <div className="flex items-baseline justify-between mb-0.5">
          <span className="text-[8px] uppercase tracking-[0.12em] text-foreground/80">{label}</span>
          <span
            className="text-[12px] font-mono font-semibold tabular-nums"
            style={{ color: metric.isAnomaly ? "#f59e0b" : "hsl(var(--foreground) / 0.9)" }}
          >
            {valueStr}
            {metric.spec.unit && (
              <span className="text-[8px] text-muted-foreground/40 ml-0.5 font-normal">
                {metric.spec.unit}
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-[7px] tracking-[0.1em] uppercase"
            style={{ color: `${accent}99` }}
          >
            {sphere.name}
          </span>
        </div>
        <svg viewBox="0 0 60 20" className="w-full h-5">
          <polyline fill="none" stroke={`${accent}cc`} strokeWidth="1" points={points} />
          <polyline fill={`${accent}1f`} stroke="none" points={`0,20 ${points} 60,20`} />
        </svg>
      </div>
    </div>
  );
}

