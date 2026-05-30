import type { PlanetPair } from "@/lib/geometry/musicGeometry";
import { EPOGDOON, INTERVALS } from "@/lib/geometry/musicGeometry";

interface Props {
  pair: PlanetPair;
  size?: number;
  onPlanetContext?: (planetId: string) => void;
}

/**
 * Two concentric SVG orbits for the focused pair. Labels show `a`, `b`,
 * `(b/a)^(2/3)`, the matching musical interval, and its accuracy vs the
 * target ratio (typically 9/8 for mirror pairs).
 */
export const PairOrbitDiagram = ({ pair, size = 320, onPlanetContext }: Props) => {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const innerR = maxR * (pair.inner.au / pair.outer.au);
  const interval = INTERVALS.find((i) => i.id === pair.intervalId)!;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Sun */}
      <circle cx={cx} cy={cy} r={size * 0.018} fill="hsla(45,90%,75%,0.95)" />
      <circle cx={cx} cy={cy} r={size * 0.04} fill="none" stroke="hsla(45,90%,75%,0.25)" strokeWidth={0.8} />

      {/* Asteroid belt mirror line (only for mirror pairs) */}
      {pair.kind === "mirror" && (
        <circle cx={cx} cy={cy} r={(innerR + maxR) / 2}
          fill="none" stroke="hsla(40,30%,80%,0.18)" strokeWidth={0.8} strokeDasharray="2 3" />
      )}

      {/* Inner orbit */}
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="hsla(220,30%,55%,0.35)" strokeWidth={1} />
      {/* Outer orbit */}
      <circle cx={cx} cy={cy} r={maxR} fill="none" stroke="hsla(220,30%,55%,0.35)" strokeWidth={1} />

      {/* Planet markers (positioned on a diagonal for legibility) */}
      <g
        onContextMenu={(e) => { e.preventDefault(); onPlanetContext?.(pair.inner.id); }}
        style={{ cursor: "context-menu" }}
      >
        <circle cx={cx + innerR * Math.cos(-Math.PI / 4)} cy={cy + innerR * Math.sin(-Math.PI / 4)}
          r={5} fill={pair.inner.color}
          style={{ filter: `drop-shadow(0 0 6px ${pair.inner.color})` }} />
        <text x={cx + innerR * Math.cos(-Math.PI / 4) + 8} y={cy + innerR * Math.sin(-Math.PI / 4) - 6}
          fontSize={10} fontWeight={600} fill={pair.inner.color}
          style={{ fontFamily: "ui-sans-serif, system-ui", letterSpacing: "0.1em" }}>
          {pair.inner.name.toUpperCase()}
        </text>
        <text x={cx + innerR * Math.cos(-Math.PI / 4) + 8} y={cy + innerR * Math.sin(-Math.PI / 4) + 6}
          fontSize={9} fill="hsla(0,0%,100%,0.55)"
          style={{ fontFamily: "ui-sans-serif, system-ui" }}>
          a = {pair.inner.au.toFixed(3)} AU
        </text>
      </g>

      <g
        onContextMenu={(e) => { e.preventDefault(); onPlanetContext?.(pair.outer.id); }}
        style={{ cursor: "context-menu" }}
      >
        <circle cx={cx + maxR * Math.cos(Math.PI * 0.85)} cy={cy + maxR * Math.sin(Math.PI * 0.85)}
          r={6} fill={pair.outer.color}
          style={{ filter: `drop-shadow(0 0 8px ${pair.outer.color})` }} />
        <text x={cx + maxR * Math.cos(Math.PI * 0.85) - 8} y={cy + maxR * Math.sin(Math.PI * 0.85) - 6}
          textAnchor="end"
          fontSize={10} fontWeight={600} fill={pair.outer.color}
          style={{ fontFamily: "ui-sans-serif, system-ui", letterSpacing: "0.1em" }}>
          {pair.outer.name.toUpperCase()}
        </text>
        <text x={cx + maxR * Math.cos(Math.PI * 0.85) - 8} y={cy + maxR * Math.sin(Math.PI * 0.85) + 6}
          textAnchor="end"
          fontSize={9} fill="hsla(0,0%,100%,0.55)"
          style={{ fontFamily: "ui-sans-serif, system-ui" }}>
          b = {pair.outer.au.toFixed(3)} AU
        </text>
      </g>

      {/* Ratio readout */}
      <g transform={`translate(${cx}, ${size - 60})`}>
        <text textAnchor="middle" fontSize={10} fill="hsla(0,0%,100%,0.55)"
          style={{ fontFamily: "ui-sans-serif, system-ui", letterSpacing: "0.22em" }}>
          (b / a)^(2/3)
        </text>
        <text y={18} textAnchor="middle" fontSize={18} fontWeight={700}
          fill="hsla(45,80%,80%,0.95)"
          style={{ fontFamily: "ui-sans-serif, system-ui", letterSpacing: "0.05em" }}>
          {pair.value.toFixed(4)}
        </text>
        <text y={36} textAnchor="middle" fontSize={9} fill="hsla(0,0%,100%,0.5)"
          style={{ fontFamily: "ui-sans-serif, system-ui", letterSpacing: "0.18em" }}>
          ≈ {interval.short} ({interval.ratio} = {interval.value.toFixed(4)}) ·
          {" "}acc {pair.accuracy.toFixed(2)}%
        </text>
        {pair.kind === "mirror" && (
          <text y={50} textAnchor="middle" fontSize={8} fill="hsla(0,0%,100%,0.35)"
            style={{ fontFamily: "ui-sans-serif, system-ui", letterSpacing: "0.2em" }}>
            target 9/8 = {EPOGDOON.toFixed(4)} · epogdoon
          </text>
        )}
      </g>
    </svg>
  );
};
