import { useMemo } from "react";
import { TECHNO_ZONES, TechnoZoneId } from "@/lib/technosphereZones";

interface Props {
  selectedId: TechnoZoneId;
  onSelect: (id: TechnoZoneId) => void;
  height?: number;
}

/**
 * Earth-centric SVG showing concentric layers of human infrastructure:
 * grid → data centers → undersea cables → satellite constellations.
 * Click a ring to isolate that zone. The Earth disc maps to "global".
 */
export function TechnoInfrastructureMap({ selectedId, onSelect, height = 340 }: Props) {
  const cx = 200;
  const cy = 200;
  const R = 180;

  const arcs = useMemo(() => {
    return TECHNO_ZONES.filter((z) => z.id !== "global").map((z) => {
      const r = z.ring * R;
      const [a0, a1] = z.arc;
      const sweep = (a1 - a0 + 360) % 360 || 360;
      const rad = (deg: number) => (deg * Math.PI) / 180;
      const p0 = { x: cx + r * Math.cos(-rad(a0)), y: cy + r * Math.sin(-rad(a0)) };
      const p1 = { x: cx + r * Math.cos(-rad(a0 + sweep)), y: cy + r * Math.sin(-rad(a0 + sweep)) };
      const largeArc = sweep > 180 ? 1 : 0;
      const d = `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${largeArc} 0 ${p1.x} ${p1.y}`;
      const midAngle = a0 + sweep / 2;
      return { id: z.id, d, tint: z.tint, name: z.name, short: z.short, r, midAngle };
    });
  }, []);

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          <radialGradient id="techno-bg" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="hsl(var(--background))" stopOpacity="0" />
            <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.4" />
          </radialGradient>
          <radialGradient id="techno-earth" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7ec9c7" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#4a8aa8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1a3a4a" stopOpacity="0.1" />
          </radialGradient>
          <radialGradient id="techno-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9bd1ff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#9bd1ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* outer field */}
        <circle cx={cx} cy={cy} r={R + 8} fill="url(#techno-bg)" />

        {/* faint reference rings */}
        {[0.42, 0.6, 0.78, 0.95].map((f, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={f * R}
            fill="none"
            stroke="hsl(var(--border) / 0.22)"
            strokeWidth={0.6}
            strokeDasharray="2 5"
          />
        ))}

        {/* atmospheric/connectivity glow */}
        <circle cx={cx} cy={cy} r={56} fill="url(#techno-glow)" />

        {/* clickable infrastructure arcs */}
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

        {/* Earth disc (global selector) */}
        <g className="cursor-pointer" onClick={() => onSelect("global")}>
          <circle cx={cx} cy={cy} r={38} fill="url(#techno-earth)" />
          <circle
            cx={cx}
            cy={cy}
            r={26}
            fill="#7ec9c7"
            opacity={selectedId === "global" ? 0.85 : 0.55}
            style={{ transition: "opacity 250ms" }}
          />
          {/* faint landmass strokes */}
          <path
            d="M186 196 Q192 188 200 192 T214 198 M188 208 Q198 212 210 206"
            stroke="hsl(var(--background) / 0.5)"
            strokeWidth={1}
            fill="none"
          />
          <title>Technosphere — Global</title>
        </g>

        {/* labels along arcs */}
        {arcs.map((a) => {
          const rad = (a.midAngle * Math.PI) / 180;
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
