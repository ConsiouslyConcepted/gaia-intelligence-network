import { useNOAASolarCycle } from "@/hooks/usePlanetaryData";

export const SolarCyclePanel = () => {
  const { data } = useNOAASolarCycle();
  const points = data ?? [];
  const max = Math.max(1, ...points.map((p: any) => p.smoothedSSN || p.ssn || 0));
  const current = points[points.length - 1];
  const phase = !current
    ? ""
    : current.smoothedSSN > 100
    ? "Solar Maximum"
    : current.smoothedSSN > 50
    ? "Ascending / Descending"
    : "Solar Minimum";

  const w = 180, h = 36;
  const path = points
    .map((p: any, i: number) => {
      const x = (i / Math.max(1, points.length - 1)) * w;
      const y = h - ((p.smoothedSSN || p.ssn || 0) / max) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div
      className="absolute top-[108px] left-4 z-10 pointer-events-auto rounded-xl backdrop-blur-2xl px-4 py-3"
      style={{
        background:
          "linear-gradient(145deg, hsla(240,20%,13%,0.92) 0%, hsla(240,25%,9%,0.88) 100%)",
        border: "1px solid hsla(0,0%,100%,0.08)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        width: 220,
      }}
    >
      <div className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/55 mb-1">Solar Cycle</div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[18px] font-bold text-foreground/90">
          {current ? Math.round(current.smoothedSSN || current.ssn || 0) : "—"}
        </span>
        <span className="text-[9px] tracking-wider uppercase text-foreground/55">{phase}</span>
      </div>
      <svg width={w} height={h} className="overflow-visible">
        <path d={path} stroke="hsla(38,60%,65%,0.9)" strokeWidth={1.2} fill="none" />
      </svg>
      <div className="text-[8px] tracking-wider uppercase text-muted-foreground/40 mt-1">SSN · 36mo</div>
    </div>
  );
};
