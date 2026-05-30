import { useMemo } from "react";
import { HELIO_ZONES, HelioZoneId } from "@/lib/heliosphereZones";

interface Props {
  selectedId: HelioZoneId;
  onSelect: (id: HelioZoneId) => void;
  height?: number;
}

/**
 * Sun-centric SVG showing concentric "zones" of solar/space-weather activity.
 * Click a ring to isolate that zone. The center disc maps to "global".
 */
export function HelioActivityMap({ selectedId, onSelect, height = 340 }: Props) {
  const cx = 200;
  const cy = 200;
  const R = 180;

  // pre-compute arc paths
  const arcs = useMemo(() => {
    return HELIO_ZONES.filter((z) => z.id !== "global").map((z) => {
      const r = z.ring * R;
      const [a0, a1] = z.arc;
      // sweep handles wrap-around (e.g. 330 → 30)
      const sweep = (a1 - a0 + 360) % 360 || 360;
      const rad = (deg: number) => (deg * Math.PI) / 180;
      const p0 = { x: cx + r * Math.cos(-rad(a0)), y: cy + r * Math.sin(-rad(a0)) };
      const p1 = { x: cx + r * Math.cos(-rad(a0 + sweep)), y: cy + r * Math.sin(-rad(a0 + sweep)) };
      const largeArc = sweep > 180 ? 1 : 0;
      // arc drawn with sweep-flag=0 because we negated angles (SVG y-down)
      const d = `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${largeArc} 0 ${p1.x} ${p1.y}`;
      return { id: z.id, d, tint: z.tint, name: z.name, short: z.short, r };
    });
  }, []);

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          <radialGradient id="helio-bg" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="hsl(var(--background))" stopOpacity="0" />
            <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.4" />
          </radialGradient>
          <radialGradient id="helio-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff4d6" stopOpacity="1" />
            <stop offset="55%" stopColor="#f6c177" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#e8775d" stopOpacity="0.0" />
          </radialGradient>
          <radialGradient id="helio-corona" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f6c177" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f6c177" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* outer field */}
        <circle cx={cx} cy={cy} r={R + 8} fill="url(#helio-bg)" />

        {/* faint orbital rings */}
        {[0.45, 0.65, 0.82, 0.95].map((f, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={f * R}
            fill="none"
            stroke="hsl(var(--border) / 0.25)"
            strokeWidth={0.6}
            strokeDasharray="2 4"
          />
        ))}

        {/* corona glow */}
        <circle cx={cx} cy={cy} r={68} fill="url(#helio-corona)" />

        {/* clickable arcs */}
        {arcs.map((a) => {
          const isSel = selectedId === a.id;
          const isDim = selectedId !== "global" && !isSel;
          return (
            <g key={a.id} className="cursor-pointer">
              <path
                d={a.d}
                fill="none"
                stroke={a.tint}
                strokeWidth={isSel ? 8 : 4.5}
                strokeLinecap="round"
                opacity={isDim ? 0.18 : isSel ? 1 : 0.75}
                style={{ transition: "stroke-width 250ms, opacity 250ms" }}
              />
              {/* wide invisible hit-target */}
              <path
                d={a.d}
                fill="none"
                stroke="transparent"
                strokeWidth={22}
                strokeLinecap="round"
                onClick={() => onSelect(isSel ? "global" : a.id)}
                style={{ pointerEvents: "stroke" }}
              >
                <title>{a.name}</title>
              </path>
              {isSel && (
                <path
                  d={a.d}
                  fill="none"
                  stroke={a.tint}
                  strokeWidth={16}
                  strokeLinecap="round"
                  opacity={0.18}
                  style={{ filter: "blur(6px)" }}
                />
              )}
            </g>
          );
        })}

        {/* sun (global selector) */}
        <g className="cursor-pointer" onClick={() => onSelect("global")}>
          <circle cx={cx} cy={cy} r={40} fill="url(#helio-sun)" />
          <circle
            cx={cx}
            cy={cy}
            r={28}
            fill="#fff4d6"
            opacity={selectedId === "global" ? 0.95 : 0.7}
            style={{ transition: "opacity 250ms" }}
          />
          <title>Heliosphere — Global</title>
        </g>

        {/* labels along arcs */}
        {arcs.map((a) => {
          const mid = (a.id === "magnetopause") ? 0 : ((HELIO_ZONES.find((z) => z.id === a.id)!.arc[0] + (((HELIO_ZONES.find((z) => z.id === a.id)!.arc[1] - HELIO_ZONES.find((z) => z.id === a.id)!.arc[0] + 360) % 360) || 360) / 2));
          const rad = (mid * Math.PI) / 180;
          const lx = cx + (a.r + 14) * Math.cos(-rad);
          const ly = cy + (a.r + 14) * Math.sin(-rad);
          const isSel = selectedId === a.id;
          return (
            <text
              key={`${a.id}-label`}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={8}
              fontFamily="monospace"
              letterSpacing="0.12em"
              fill={isSel ? a.tint : "hsl(var(--muted-foreground) / 0.55)"}
              style={{ transition: "fill 250ms", pointerEvents: "none" }}
            >
              {a.short}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
