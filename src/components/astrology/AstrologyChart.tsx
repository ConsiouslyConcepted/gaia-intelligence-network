import { useMemo } from "react";
import { SIGNS, PLANET_GLYPHS, longitudeToSign } from "@/lib/astrology/constants";
import type { PlanetPosition, AspectLink } from "@/lib/astrology/ephemeris";

interface Props {
  positions: PlanetPosition[];
  aspects: AspectLink[];
  selectedSign: string | null;
  selectedPlanet: string | null;
  onSignClick: (id: string) => void;
  onPlanetClick: (id: string) => void;
  onPlanetContext?: (id: string) => void;
}

const SIZE = 720;
const C = SIZE / 2;

// Concentric radii (outer → inner)
const R_OUTER = 350;       // outer constellation ring outer edge
const R_CONST_IN = 310;    // outer constellation ring inner edge
const R_SIGN_OUT = 305;    // sign band outer
const R_SIGN_IN = 255;     // sign band inner
const R_DEG_OUT = 252;     // degree tick outer
const R_DEG_IN = 240;      // degree tick inner (1°)
const R_DEG_IN_5 = 232;    // 5° tick
const R_PLANET = 200;      // planet glyph ring
const R_ASPECT = 175;      // inner disc where aspect lines live

function polar(cx: number, cy: number, r: number, deg: number) {
  // 0° at left (Aries on the AC/east in traditional charts), increasing counter-clockwise
  // For simpler visual: Aries at the top, increasing clockwise → match common starcharts
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, rOuter: number, rInner: number, startDeg: number, endDeg: number) {
  const p1 = polar(cx, cy, rOuter, startDeg);
  const p2 = polar(cx, cy, rOuter, endDeg);
  const p3 = polar(cx, cy, rInner, endDeg);
  const p4 = polar(cx, cy, rInner, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${large} 0 ${p4.x} ${p4.y} Z`;
}

// Simple star-dot constellations (procedural) per sign so we don't ship real star data
function constellationDots(seed: number): { x: number; y: number; r: number }[] {
  const dots: { x: number; y: number; r: number }[] = [];
  let s = seed * 9301 + 49297;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const n = 5 + Math.floor(rnd() * 4);
  for (let i = 0; i < n; i++) {
    dots.push({
      x: (rnd() - 0.5) * 36,
      y: (rnd() - 0.5) * 18,
      r: 0.8 + rnd() * 1.4,
    });
  }
  return dots;
}

export function AstrologyChart({ positions, aspects, selectedSign, selectedPlanet, onSignClick, onPlanetClick, onPlanetContext }: Props) {
  const segments = useMemo(() => SIGNS.map((s) => ({
    sign: s,
    start: s.startDeg,
    end: s.startDeg + 30,
    mid: s.startDeg + 15,
    dots: constellationDots(SIGNS.indexOf(s) + 1),
  })), []);

  // Spread overlapping planets slightly along the ring so glyphs don't stack
  const placed = useMemo(() => {
    const sorted = [...positions].sort((a, b) => a.longitude - b.longitude);
    const adjusted: { id: string; angle: number; radius: number }[] = [];
    let lastAngle = -999;
    let stack = 0;
    for (const p of sorted) {
      const angle = p.longitude;
      if (angle - lastAngle < 6) {
        stack += 1;
      } else {
        stack = 0;
      }
      lastAngle = angle;
      adjusted.push({ id: p.id, angle, radius: R_PLANET - stack * 22 });
    }
    return new Map(adjusted.map((a) => [a.id, a]));
  }, [positions]);

  return (
    <svg viewBox={`-70 -70 ${SIZE + 140} ${SIZE + 140}`} className="w-full h-full max-w-[min(72vh,720px)] max-h-[72vh] mx-auto">
      <defs>
        <radialGradient id="discGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="hsla(210, 60%, 30%, 0.18)" />
          <stop offset="60%" stopColor="hsla(228, 40%, 8%, 0.0)" />
          <stop offset="100%" stopColor="hsla(228, 40%, 5%, 0.0)" />
        </radialGradient>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <filter id="constellationGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <radialGradient id="starHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="hsla(210, 60%, 98%, 0.95)" />
          <stop offset="35%" stopColor="hsla(210, 60%, 95%, 0.35)" />
          <stop offset="100%" stopColor="hsla(210, 60%, 95%, 0)" />
        </radialGradient>
      </defs>

      {/* inner disc soft glow */}
      <circle cx={C} cy={C} r={R_OUTER + 8} fill="url(#discGlow)" />

      {/* Outer ring outline */}
      <circle cx={C} cy={C} r={R_OUTER} fill="none" stroke="hsla(220, 15%, 75%, 0.18)" strokeWidth="0.8" />
      <circle cx={C} cy={C} r={R_CONST_IN} fill="none" stroke="hsla(220, 15%, 75%, 0.10)" strokeWidth="0.5" />

      {/* Sign band background (cream/gold accent — wayfinding hue exception) */}
      <circle cx={C} cy={C} r={R_SIGN_OUT} fill="hsla(220, 15%, 80%, 0.05)" />
      <circle cx={C} cy={C} r={R_SIGN_IN} fill="hsla(228, 40%, 6%, 0.85)" />

      {/* 12 sign segments + dividers + glyphs */}
      {segments.map(({ sign, start, end, mid, dots }) => {
        const isActive = selectedSign === sign.id;
        const fill = isActive
          ? "hsla(220, 20%, 85%, 0.15)"
          : "hsla(220, 15%, 80%, 0.0)";
        const div = polar(C, C, R_SIGN_OUT, start);
        const divIn = polar(C, C, R_SIGN_IN, start);
        const labelPos = polar(C, C, (R_SIGN_OUT + R_SIGN_IN) / 2, mid);
        const constPos = polar(C, C, (R_OUTER + R_CONST_IN) / 2, mid);
        const constLabel = polar(C, C, R_OUTER + 18, mid);

        return (
          <g key={sign.id}>
            {/* clickable wedge */}
            <path
              d={arcPath(C, C, R_SIGN_OUT, R_SIGN_IN, start, end)}
              fill={fill}
              stroke="transparent"
              className="cursor-pointer transition-all duration-300"
              onClick={() => onSignClick(sign.id)}
            />
            {/* divider */}
            <line x1={div.x} y1={div.y} x2={divIn.x} y2={divIn.y} stroke="hsla(220, 15%, 75%, 0.22)" strokeWidth="0.6" />
            {/* sign glyph (force text presentation, not emoji) */}
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="28"
              fill={isActive ? "hsla(220, 15%, 96%, 0.98)" : "hsla(220, 10%, 85%, 0.82)"}
              style={{
                fontFamily: '"Times New Roman", "DejaVu Serif", "Noto Serif", serif',
                fontVariantEmoji: "text",
              } as React.CSSProperties}
              className="select-none pointer-events-none"
            >
              {`${sign.glyph}\uFE0E`}
            </text>

            {/* constellation — bright pin-point stars with sparkle spikes, thin hairline links */}
            <g transform={`translate(${constPos.x} ${constPos.y}) rotate(${mid}) scale(1.8)`} className="pointer-events-none">
              {/* hairline connecting lines */}
              {dots.slice(0, dots.length - 1).map((d, i) => (
                <line
                  key={`l${i}`}
                  x1={d.x}
                  y1={d.y}
                  x2={dots[i + 1].x}
                  y2={dots[i + 1].y}
                  stroke="hsla(210, 40%, 95%, 0.55)"
                  strokeWidth="0.28"
                  strokeLinecap="round"
                  shapeRendering="geometricPrecision"
                />
              ))}
              {/* stars: soft halo + cross sparkle + bright pin core */}
              {dots.map((d, i) => {
                const spike = d.r * 5;
                const halo = d.r * 3.2;
                return (
                  <g key={i}>
                    <circle cx={d.x} cy={d.y} r={halo} fill="url(#starHalo)" />
                    <g filter="url(#constellationGlow)" opacity="0.85">
                      <line x1={d.x - spike} y1={d.y} x2={d.x + spike} y2={d.y} stroke="hsl(0, 0%, 100%)" strokeWidth="0.22" strokeLinecap="round" />
                      <line x1={d.x} y1={d.y - spike} x2={d.x} y2={d.y + spike} stroke="hsl(0, 0%, 100%)" strokeWidth="0.22" strokeLinecap="round" />
                    </g>
                    <line x1={d.x - spike * 0.85} y1={d.y} x2={d.x + spike * 0.85} y2={d.y} stroke="hsl(0, 0%, 100%)" strokeWidth="0.35" strokeLinecap="round" shapeRendering="geometricPrecision" />
                    <line x1={d.x} y1={d.y - spike * 0.85} x2={d.x} y2={d.y + spike * 0.85} stroke="hsl(0, 0%, 100%)" strokeWidth="0.35" strokeLinecap="round" shapeRendering="geometricPrecision" />
                    <circle cx={d.x} cy={d.y} r={d.r * 0.7} fill="hsl(0, 0%, 100%)" shapeRendering="geometricPrecision" />
                  </g>
                );
              })}
            </g>

            {/* constellation name */}
            <text
              x={constLabel.x}
              y={constLabel.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="13"
              letterSpacing="0.22em"
              fontWeight={500}
              fill={isActive ? "hsla(220, 15%, 96%, 0.98)" : "hsla(220, 10%, 82%, 0.8)"}
              transform={`rotate(${mid} ${constLabel.x} ${constLabel.y})`}
              className="uppercase select-none pointer-events-none"
              style={{ fontFamily: "ui-sans-serif, system-ui" }}
            >
              {sign.name}
            </text>
          </g>
        );
      })}

      {/* Degree ticks: 1° and 5° */}
      {Array.from({ length: 360 }, (_, d) => {
        const isFive = d % 5 === 0;
        const isThirty = d % 30 === 0;
        const rIn = isThirty ? R_DEG_IN_5 - 4 : isFive ? R_DEG_IN_5 : R_DEG_IN;
        const p1 = polar(C, C, R_DEG_OUT, d);
        const p2 = polar(C, C, rIn, d);
        return (
          <line
            key={d}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="hsla(220, 12%, 70%, 0.28)"
            strokeWidth={isThirty ? 0.7 : isFive ? 0.45 : 0.25}
          />
        );
      })}

      {/* Aspect lines */}
      <g opacity={selectedPlanet ? 0.25 : 0.55}>
        {aspects.map((asp, i) => {
          const a = placed.get(asp.a);
          const b = placed.get(asp.b);
          if (!a || !b) return null;
          const pa = polar(C, C, R_ASPECT, a.angle);
          const pb = polar(C, C, R_ASPECT, b.angle);
          const highlight = selectedPlanet === asp.a || selectedPlanet === asp.b;
          return (
            <line
              key={i}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke={asp.color}
              strokeWidth={highlight ? 1.4 : 0.7}
              strokeOpacity={highlight ? 0.9 : 0.55}
              strokeDasharray={asp.name === "square" || asp.name === "opposition" ? "3 3" : undefined}
            />
          );
        })}
      </g>

      {/* Inner disc rim */}
      <circle cx={C} cy={C} r={R_ASPECT + 5} fill="none" stroke="hsla(220, 12%, 70%, 0.15)" strokeWidth="0.5" />
      <circle cx={C} cy={C} r={R_PLANET + 10} fill="none" stroke="hsla(220, 12%, 70%, 0.12)" strokeWidth="0.5" />

      {/* Planet glyphs */}
      {positions.map((p) => {
        const meta = PLANET_GLYPHS[p.id];
        if (!meta) return null;
        const a = placed.get(p.id);
        if (!a) return null;
        const pos = polar(C, C, a.radius, a.angle);
        const tick = polar(C, C, R_SIGN_IN - 3, a.angle);
        const isActive = selectedPlanet === p.id;
        return (
          <g key={p.id}>
            {/* tick from sign band to planet position */}
            <line
              x1={tick.x}
              y1={tick.y}
              x2={polar(C, C, a.radius + 12, a.angle).x}
              y2={polar(C, C, a.radius + 12, a.angle).y}
              stroke={meta.color}
              strokeOpacity={isActive ? 0.9 : 0.4}
              strokeWidth={isActive ? 1.2 : 0.6}
            />
            <circle
              cx={pos.x}
              cy={pos.y}
              r={isActive ? 16 : 13}
              fill="hsla(228, 40%, 6%, 0.9)"
              stroke={meta.color}
              strokeOpacity={isActive ? 0.95 : 0.55}
              strokeWidth={isActive ? 1.4 : 0.8}
              className="cursor-pointer"
              onClick={() => onPlanetClick(p.id)}
              onContextMenu={(e) => { e.preventDefault(); onPlanetContext?.(p.id); }}
            />
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="16"
              fill={meta.color}
              fillOpacity={isActive ? 1 : 0.85}
              className="select-none pointer-events-none"
              style={{
                fontFamily: '"Times New Roman", "DejaVu Serif", "Noto Serif", serif',
                fontVariantEmoji: "text",
              } as React.CSSProperties}
            >
              {`${meta.glyph}\uFE0E`}
            </text>
            {p.retrograde && (
              <text
                x={pos.x + 11}
                y={pos.y + 11}
                fontSize="7"
                fill={meta.color}
                fillOpacity={0.85}
                className="select-none pointer-events-none"
              >R</text>
            )}
          </g>
        );
      })}

      {/* Center marker */}
      <circle cx={C} cy={C} r={2} fill="hsla(220, 12%, 80%, 0.55)" />
    </svg>
  );
}
