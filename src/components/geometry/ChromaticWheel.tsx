import { useMemo, useState } from "react";
import { INTERVALS, NOTE_NAMES, type Interval } from "@/lib/geometry/musicGeometry";

interface Props {
  interval: Interval;
  size?: number;
}

/**
 * Renders a 12-tone chromatic clock and the chord-polygon formed by walking
 * around the wheel in `interval.semitones` jumps until returning to the start.
 * For intervals coprime with 12 this gives a 12-point star (e.g. P5).
 * For others (M3, m3, M2) it produces multiple smaller polygons.
 */
export const ChromaticWheel = ({ interval, size = 360 }: Props) => {
  const [hover, setHover] = useState<number | null>(null);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const nodeR = size * 0.045;

  const nodes = useMemo(() => {
    return NOTE_NAMES.map((n, i) => {
      const a = (-Math.PI / 2) + (i / 12) * Math.PI * 2;
      return { name: n, idx: i, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
    });
  }, [cx, cy, r]);

  /** All edges of the chord polygon(s) */
  const edges = useMemo(() => {
    const s = interval.semitones;
    const visited = new Set<number>();
    const segs: { a: number; b: number }[] = [];
    for (let start = 0; start < 12; start++) {
      if (visited.has(start)) continue;
      let cur = start;
      do {
        const nxt = (cur + s) % 12;
        segs.push({ a: cur, b: nxt });
        visited.add(cur);
        cur = nxt;
      } while (cur !== start);
    }
    return segs;
  }, [interval.semitones]);

  const highlightEdges = (i: number) =>
    edges.filter((e) => e.a === i || e.b === i);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsla(220,30%,55%,0.18)" strokeWidth={1} />

      {/* Chord polygon edges */}
      {edges.map((e, idx) => {
        const isHot = hover !== null && (e.a === hover || e.b === hover);
        return (
          <line
            key={idx}
            x1={nodes[e.a].x}
            y1={nodes[e.a].y}
            x2={nodes[e.b].x}
            y2={nodes[e.b].y}
            stroke={isHot ? "hsla(45,80%,75%,0.95)" : "hsla(40,30%,88%,0.55)"}
            strokeWidth={isHot ? 1.6 : 1.1}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((n) => {
        const isHover = hover === n.idx;
        return (
          <g
            key={n.idx}
            onMouseEnter={() => setHover(n.idx)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "pointer" }}
          >
            <circle
              cx={n.x}
              cy={n.y}
              r={nodeR}
              fill={isHover ? "hsla(45,70%,70%,0.25)" : "hsla(228,40%,8%,0.9)"}
              stroke={isHover ? "hsla(45,80%,75%,0.95)" : "hsla(220,30%,60%,0.55)"}
              strokeWidth={1}
            />
            <text
              x={n.x}
              y={n.y + 3}
              textAnchor="middle"
              fontSize={size * 0.032}
              fontWeight={600}
              fill="hsla(0,0%,100%,0.85)"
              style={{ pointerEvents: "none", fontFamily: "ui-sans-serif, system-ui" }}
            >
              {n.name}
            </text>
          </g>
        );
      })}

      {/* Center label */}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={size * 0.06} fontWeight={700}
        fill="hsla(0,0%,100%,0.92)" style={{ fontFamily: "ui-sans-serif, system-ui", letterSpacing: "0.1em" }}>
        {interval.short}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={size * 0.034}
        fill="hsla(0,0%,100%,0.55)" style={{ fontFamily: "ui-sans-serif, system-ui", letterSpacing: "0.18em" }}>
        {interval.ratio}
      </text>
      {hover !== null && (
        <text x={cx} y={cy + 30} textAnchor="middle" fontSize={size * 0.03}
          fill="hsla(45,80%,75%,0.95)" style={{ fontFamily: "ui-sans-serif, system-ui", letterSpacing: "0.16em" }}>
          {NOTE_NAMES[hover]} → {NOTE_NAMES[(hover + interval.semitones) % 12]}
        </text>
      )}
    </svg>
  );
};

export const ALL_INTERVALS = INTERVALS;
