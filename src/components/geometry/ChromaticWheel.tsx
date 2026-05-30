import { useMemo, useState } from "react";
import { INTERVALS, NOTE_NAMES, type Interval } from "@/lib/geometry/musicGeometry";

interface Props {
  interval: Interval;
  size?: number;
  onSelectInterval?: (id: string) => void;
}

/** Distinct hue per interval — echoes the "Geometry of Music" reference. */
const INTERVAL_COLORS: Record<string, string> = {
  P8: "hsla(  0, 85%, 62%, 0.85)", // octave  – red
  P5: "hsla( 30, 90%, 60%, 0.80)", // fifth   – orange
  P4: "hsla( 50, 90%, 60%, 0.78)", // fourth  – amber
  M3: "hsla(140, 70%, 55%, 0.75)", // maj3    – green
  m3: "hsla(180, 70%, 58%, 0.75)", // min3    – cyan
  M6: "hsla(210, 80%, 65%, 0.72)", // maj6    – sky
  m6: "hsla(265, 70%, 68%, 0.70)", // min6    – violet
  M2: "hsla(320, 75%, 68%, 0.85)", // epogdoon– magenta (fundamental)
};

/** Walk the wheel in `step` semitones, return all edges of resulting polygon(s). */
const buildEdges = (step: number) => {
  const visited = new Set<number>();
  const segs: { a: number; b: number }[] = [];
  for (let start = 0; start < 12; start++) {
    if (visited.has(start)) continue;
    let cur = start;
    do {
      const nxt = (cur + step) % 12;
      segs.push({ a: cur, b: nxt });
      visited.add(cur);
      cur = nxt;
    } while (cur !== start);
  }
  return segs;
};

export const ChromaticWheel = ({ interval, size = 520, onSelectInterval }: Props) => {
  const [hover, setHover] = useState<number | null>(null);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.40;
  const nodeR = size * 0.038;

  const nodes = useMemo(
    () =>
      NOTE_NAMES.map((n, i) => {
        const a = -Math.PI / 2 + (i / 12) * Math.PI * 2;
        return { name: n, idx: i, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
      }),
    [cx, cy, r],
  );

  /** Pre-build edges per interval. */
  const edgesByInterval = useMemo(
    () => Object.fromEntries(INTERVALS.map((iv) => [iv.id, buildEdges(iv.semitones)])),
    [],
  );

  const selectedEdges = edgesByInterval[interval.id] ?? [];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-[0_0_24px_hsla(220,40%,40%,0.35)]">
      <defs>
        <radialGradient id="cw-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsla(45,90%,85%,0.85)" />
          <stop offset="22%" stopColor="hsla(45,70%,65%,0.45)" />
          <stop offset="55%" stopColor="hsla(260,50%,30%,0.35)" />
          <stop offset="100%" stopColor="hsla(240,40%,8%,0)" />
        </radialGradient>
        <radialGradient id="cw-bg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="hsla(240,40%,10%,0.55)" />
          <stop offset="100%" stopColor="hsla(240,40%,4%,0.85)" />
        </radialGradient>
        <filter id="cw-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      {/* Cosmic backdrop disc */}
      <circle cx={cx} cy={cy} r={r * 1.18} fill="url(#cw-bg)" />

      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r * 1.08} fill="none" stroke="hsla(220,30%,55%,0.18)" strokeWidth={1} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsla(220,30%,55%,0.28)" strokeWidth={1} />

      {/* ─── All interval chord webs (background layer) ─── */}
      {INTERVALS.filter((iv) => iv.id !== interval.id && iv.id !== "P8").map((iv) => {
        const color = INTERVAL_COLORS[iv.id];
        return (
          <g key={iv.id} opacity={0.35} style={{ cursor: onSelectInterval ? "pointer" : "default" }}
             onClick={() => onSelectInterval?.(iv.id)}>
            {edgesByInterval[iv.id].map((e, i) => (
              <line key={i}
                x1={nodes[e.a].x} y1={nodes[e.a].y}
                x2={nodes[e.b].x} y2={nodes[e.b].y}
                stroke={color} strokeWidth={0.7} />
            ))}
          </g>
        );
      })}

      {/* ─── Selected interval polygon — highlighted in front ─── */}
      <g filter="url(#cw-glow)">
        {selectedEdges.map((e, i) => {
          const isHot = hover !== null && (e.a === hover || e.b === hover);
          return (
            <line key={i}
              x1={nodes[e.a].x} y1={nodes[e.a].y}
              x2={nodes[e.b].x} y2={nodes[e.b].y}
              stroke={INTERVAL_COLORS[interval.id] ?? "hsla(45,80%,75%,0.95)"}
              strokeWidth={isHot ? 2.6 : 2}
              opacity={0.95}
            />
          );
        })}
      </g>

      {/* Central luminous core */}
      <circle cx={cx} cy={cy} r={r * 0.32} fill="url(#cw-core)" />
      <circle cx={cx} cy={cy} r={r * 0.08} fill="hsla(45,95%,90%,0.9)" filter="url(#cw-glow)" />

      {/* Nodes */}
      {nodes.map((n) => {
        const isHover = hover === n.idx;
        return (
          <g key={n.idx}
            onMouseEnter={() => setHover(n.idx)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "pointer" }}>
            <circle cx={n.x} cy={n.y} r={nodeR}
              fill={isHover ? "hsla(45,70%,70%,0.3)" : "hsla(228,40%,8%,0.92)"}
              stroke={isHover ? "hsla(45,90%,80%,0.95)" : "hsla(220,30%,65%,0.6)"}
              strokeWidth={1.2} />
            <text x={n.x} y={n.y + 3} textAnchor="middle"
              fontSize={size * 0.026} fontWeight={600}
              fill="hsla(0,0%,100%,0.9)"
              style={{ pointerEvents: "none", fontFamily: "ui-sans-serif, system-ui" }}>
              {n.name}
            </text>
          </g>
        );
      })}

      {/* Title labels */}
      <text x={cx} y={size * 0.06} textAnchor="middle"
        fontSize={size * 0.028} fontWeight={700}
        fill="hsla(0,0%,100%,0.85)"
        style={{ fontFamily: "ui-sans-serif, system-ui", letterSpacing: "0.32em" }}>
        GEOMETRY OF MUSIC
      </text>
      <text x={cx} y={size * 0.095} textAnchor="middle"
        fontSize={size * 0.016}
        fill="hsla(0,0%,100%,0.45)"
        style={{ fontFamily: "ui-sans-serif, system-ui", letterSpacing: "0.32em" }}>
        12-TONE CHROMATIC WHEEL · KEPLERIAN HARMONICS
      </text>

      {hover !== null && (
        <text x={cx} y={cy + r * 0.55} textAnchor="middle"
          fontSize={size * 0.022}
          fill="hsla(45,80%,80%,0.9)"
          style={{ fontFamily: "ui-sans-serif, system-ui", letterSpacing: "0.18em" }}>
          {NOTE_NAMES[hover]} → {NOTE_NAMES[(hover + interval.semitones) % 12]}
        </text>
      )}
    </svg>
  );
};

export const ALL_INTERVALS = INTERVALS;
