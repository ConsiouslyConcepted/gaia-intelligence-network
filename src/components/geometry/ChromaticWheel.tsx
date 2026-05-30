import { useMemo, useState } from "react";
import { INTERVALS, NOTE_NAMES, type Interval } from "@/lib/geometry/musicGeometry";
import { PLANET_NOTES, NOTE_INDEX } from "@/lib/geometry/planetNoteMap";

interface Props {
  interval: Interval;
  size?: number;
  onSelectInterval?: (id: string) => void;
  onPlanetClick?: (id: string) => void;
  onPlanetContext?: (id: string) => void;
  highlightedPlanet?: string | null;
}

const PLANET_GLYPHS: Record<string, string> = {
  mercury: "☿", venus: "♀", earth: "⊕", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
};


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

export const ChromaticWheel = ({
  interval,
  size = 520,
  onSelectInterval,
  onPlanetClick,
  onPlanetContext,
  highlightedPlanet,
}: Props) => {
  const [hover, setHover] = useState<number | null>(null);
  const viewBoxPadding = size * 0.16;
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
    <svg
      width={size}
      height={size}
      viewBox={`${-viewBoxPadding} ${-viewBoxPadding} ${size + viewBoxPadding * 2} ${size + viewBoxPadding * 2}`}
      className="overflow-visible drop-shadow-[0_0_24px_hsla(220,40%,40%,0.35)]"
    >
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

      {/* ─── Planet-to-planet harmonic links (when a planet is selected) ─── */}
      {highlightedPlanet && (() => {
        const sel = PLANET_NOTES.find((p) => p.id === highlightedPlanet);
        if (!sel) return null;
        const selIdx = NOTE_INDEX[sel.note];
        if (selIdx === undefined) return null;
        const targetIdx = (selIdx + interval.semitones) % 12;
        const reverseIdx = (selIdx - interval.semitones + 12) % 12;
        const partners = PLANET_NOTES.filter(
          (p) => p.id !== sel.id && (NOTE_INDEX[p.note] === targetIdx || NOTE_INDEX[p.note] === reverseIdx),
        );
        if (partners.length === 0) return null;
        const a0 = -Math.PI / 2 + (selIdx / 12) * Math.PI * 2;
        const x0 = cx + Math.cos(a0) * r;
        const y0 = cy + Math.sin(a0) * r;
        return (
          <g filter="url(#cw-glow)">
            {partners.map((p) => {
              const pIdx = NOTE_INDEX[p.note];
              const a = -Math.PI / 2 + (pIdx / 12) * Math.PI * 2;
              const x = cx + Math.cos(a) * r;
              const y = cy + Math.sin(a) * r;
              return (
                <line key={p.id} x1={x0} y1={y0} x2={x} y2={y}
                  stroke={sel.color} strokeWidth={2.8}
                  strokeDasharray="6 4" opacity={0.9} />
              );
            })}
          </g>
        );
      })()}

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


      {/* ─── Planet markers — outer ring at note positions ─── */}
      {(() => {
        const stacks: Record<number, number> = {};
        const ringBase = r * 1.18;
        const step = size * 0.052;
        return PLANET_NOTES.map((p) => {
          const idx = NOTE_INDEX[p.note];
          if (idx === undefined) return null;
          const slot = stacks[idx] ?? 0;
          stacks[idx] = slot + 1;
          const radius = ringBase + slot * step;
          const a = -Math.PI / 2 + (idx / 12) * Math.PI * 2;
          const x = cx + Math.cos(a) * radius;
          const y = cy + Math.sin(a) * radius;
          const isHi = highlightedPlanet === p.id;
          return (
            <g key={p.id}
              onClick={() => onPlanetClick?.(p.id)}
              onContextMenu={(e) => { e.preventDefault(); onPlanetContext?.(p.id); }}
              style={{ cursor: "pointer" }}>
              <circle cx={x} cy={y} r={size * 0.026}
                fill={`${p.color}${isHi ? "ee" : "aa"}`}
                stroke={isHi ? "hsla(0,0%,100%,0.95)" : `${p.color}`}
                strokeWidth={isHi ? 1.6 : 1}
                style={{ filter: isHi ? "drop-shadow(0 0 8px " + p.color + ")" : `drop-shadow(0 0 4px ${p.color}88)` }}
              />
              <text x={x} y={y + 3} textAnchor="middle"
                fontSize={size * 0.028} fontWeight={600}
                fill="hsla(240,40%,8%,0.95)"
                style={{ pointerEvents: "none", fontFamily: "ui-sans-serif, system-ui" }}>
                {PLANET_GLYPHS[p.id]}
              </text>
            </g>
          );
        });
      })()}

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
