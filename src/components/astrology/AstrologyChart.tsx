import { useMemo } from "react";
import { SIGNS, PLANET_GLYPHS, longitudeToSign } from "@/lib/astrology/constants";
import type { PlanetPosition, AspectLink } from "@/lib/astrology/ephemeris";
import { polygonAngles } from "@/lib/astrology/harmonics";
import { STATIONS } from "@/lib/astrology/seasons";

interface Props {
  positions: PlanetPosition[];
  aspects: AspectLink[];
  selectedSign: string | null;
  selectedPlanet: string | null;
  onSignClick: (id: string) => void;
  onPlanetClick: (id: string) => void;
  onPlanetContext?: (id: string) => void;
  /** When true, draws the regular/star polygon that generates each active aspect. */
  showPolygons?: boolean;
  /** Key from TransitsPanel.aspectKey — isolates that one aspect on the wheel. */
  selectedAspectKey?: string | null;
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
const R_PLANET = 178;      // planet glyph ring (moved inward to make room for inner moon+tide rings)
const R_ASPECT = 152;      // inner disc where aspect lines live


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

// Procedural star-dot pattern per sign (seeded so each sign is stable)
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

export function AstrologyChart({ positions, aspects, selectedSign, selectedPlanet, onSignClick, onPlanetClick, onPlanetContext, showPolygons = false, selectedAspectKey = null }: Props) {
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
    <svg viewBox={`-110 -110 ${SIZE + 220} ${SIZE + 220}`} className="w-full h-full max-w-[min(72vh,720px)] max-h-[72vh] mx-auto">
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

            {/* constellation — bright dots with hairline links */}
            <g transform={`translate(${constPos.x} ${constPos.y}) rotate(${mid}) scale(1.8)`} className="pointer-events-none">
              {dots.slice(0, dots.length - 1).map((d, i) => (
                <line
                  key={`l${i}`}
                  x1={d.x}
                  y1={d.y}
                  x2={dots[i + 1].x}
                  y2={dots[i + 1].y}
                  stroke="hsla(210, 40%, 95%, 0.6)"
                  strokeWidth="0.3"
                  strokeLinecap="round"
                  shapeRendering="geometricPrecision"
                />
              ))}
              {dots.map((d, i) => (
                <g key={i}>
                  <circle cx={d.x} cy={d.y} r={d.r * 2.2} fill="url(#starHalo)" opacity="0.6" />
                  <circle cx={d.x} cy={d.y} r={d.r * 1.1} fill="hsl(0, 0%, 100%)" shapeRendering="geometricPrecision" />
                </g>
              ))}
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

      {/* Wheel-of-the-Year ring — 8 station ticks at solar longitudes */}
      {(() => {
        const R_STATION_IN = R_OUTER + 22;
        const R_STATION_OUT = R_OUTER + 36;
        const sunPos = positions.find((p) => p.id === "sun");
        return (
          <g>
            <circle cx={C} cy={C} r={R_STATION_IN} fill="none" stroke="hsla(220, 15%, 75%, 0.08)" strokeWidth="0.4" />
            <circle cx={C} cy={C} r={R_STATION_OUT} fill="none" stroke="hsla(220, 15%, 75%, 0.10)" strokeWidth="0.4" />
            {STATIONS.map((s) => {
              const isCardinal = s.type === "equinox" || s.type === "solstice";
              const p1 = polar(C, C, R_STATION_IN, s.longitude);
              const p2 = polar(C, C, R_STATION_OUT, s.longitude);
              const dotPos = polar(C, C, (R_STATION_IN + R_STATION_OUT) / 2, s.longitude);
              return (
                <g key={s.id}>
                  <title>{`${s.astroName} · ${s.traditionalName}`}</title>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={isCardinal ? "hsla(40, 60%, 75%, 0.55)" : "hsla(220, 15%, 80%, 0.30)"}
                    strokeWidth={isCardinal ? 1.2 : 0.7}
                  />
                  {isCardinal && (
                    <circle cx={dotPos.x} cy={dotPos.y} r={2.2} fill="hsla(40, 60%, 80%, 0.85)" />
                  )}
                </g>
              );
            })}
            {sunPos && (() => {
              const m = polar(C, C, (R_STATION_IN + R_STATION_OUT) / 2, sunPos.longitude);
              return (
                <g>
                  <title>Sun · current position</title>
                  <circle cx={m.x} cy={m.y} r={5} fill="hsla(45, 90%, 65%, 0.18)" />
                  <circle cx={m.x} cy={m.y} r={2.6} fill="hsl(45, 90%, 70%)" />
                </g>
              );
            })()}
          </g>
        );
      })()}

      {/* Inner Tide ring + Moon-phase ring — sit inside the wheel, just under the degree ticks */}
      {(() => {
        const sun = positions.find((p) => p.id === "sun");
        const moon = positions.find((p) => p.id === "moon");
        if (!sun || !moon) return null;
        const phase = ((moon.longitude - sun.longitude) + 360) % 360;

        // Tide band — outer of the two inner rings, just inside the degree ticks
        const R_TIDE_OUT = 236;
        const R_TIDE_IN = 220;
        const R_TIDE_MID = (R_TIDE_IN + R_TIDE_OUT) / 2;

        // Moon band — inside the tide band
        const R_MOON_OUT = 217;
        const R_MOON_IN = 200;
        const R_MOON = (R_MOON_IN + R_MOON_OUT) / 2;
        const moonR = 5.5;
        const COUNT = 28;


        const moonPath = (cx: number, cy: number, r: number, p: number) => {
          const cosP = Math.cos((p * Math.PI) / 180);
          const rx = Math.max(0.001, Math.abs(r * cosP));
          const litRight = p < 180;
          const top = `${cx} ${cy - r}`;
          const bot = `${cx} ${cy + r}`;
          const outerSweep = litRight ? 1 : 0;
          const innerSweep = cosP >= 0 ? (litRight ? 0 : 1) : (litRight ? 1 : 0);
          return `M ${top} A ${r} ${r} 0 0 ${outerSweep} ${bot} A ${rx} ${r} 0 0 ${innerSweep} ${top} Z`;
        };

        const tideArc = (centerPhase: number, span: number) => {
          const startLon = sun.longitude + centerPhase - span / 2;
          const endLon = sun.longitude + centerPhase + span / 2;
          return arcPath(C, C, R_TIDE_OUT, R_TIDE_IN, startLon, endLon);
        };
        const labelArcId = (key: string) => `tide-arc-${key}`;
        const labelArcPath = (centerPhase: number) => {
          const startLon = sun.longitude + centerPhase - 26;
          const endLon = sun.longitude + centerPhase + 26;
          const R_LABEL = R_TIDE_OUT - 2; // baseline near outer edge; glyphs extend inward into band center
          const p1 = polar(C, C, R_LABEL, startLon);
          const p2 = polar(C, C, R_LABEL, endLon);
          return `M ${p1.x} ${p1.y} A ${R_LABEL} ${R_LABEL} 0 0 1 ${p2.x} ${p2.y}`;
        };

        return (
          <g>
            <defs>
              <radialGradient id="tideSpringGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsla(210, 70%, 80%, 0.32)" />
                <stop offset="100%" stopColor="hsla(210, 60%, 70%, 0.08)" />
              </radialGradient>
              <radialGradient id="tideNeapGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsla(220, 18%, 78%, 0.16)" />
                <stop offset="100%" stopColor="hsla(220, 15%, 65%, 0.04)" />
              </radialGradient>
              <path id={labelArcId("spring-new")} d={labelArcPath(0)} />
              <path id={labelArcId("neap-1q")} d={labelArcPath(90)} />
              <path id={labelArcId("spring-full")} d={labelArcPath(180)} />
              <path id={labelArcId("neap-3q")} d={labelArcPath(270)} />
            </defs>

            {/* Moon band rails (no opaque fill — keeps inner wheel visible) */}
            <circle cx={C} cy={C} r={R_MOON_IN} fill="none" stroke="hsla(220,15%,80%,0.32)" strokeWidth="0.6" />
            <circle cx={C} cy={C} r={R_MOON_OUT} fill="none" stroke="hsla(220,15%,80%,0.32)" strokeWidth="0.6" />
            <circle cx={C} cy={C} r={R_MOON} fill="none" stroke="hsla(220,15%,80%,0.08)" strokeWidth="0.3" strokeDasharray="1 3" />


            {/* 28 daily moon phases */}
            {Array.from({ length: COUNT }, (_, i) => {
              const dayPhase = (i / COUNT) * 360;
              const lon = sun.longitude + dayPhase;
              const pos = polar(C, C, R_MOON, lon);
              const isCurrent = Math.abs(((dayPhase - phase + 540) % 360) - 180) > 180 - (360 / COUNT) / 2;
              return (
                <g key={`m${i}`} transform={`translate(${pos.x} ${pos.y})`}>
                  <circle cx={0} cy={0} r={moonR} fill="hsla(228, 50%, 4%, 1)" stroke="hsla(220,15%,85%,0.55)" strokeWidth="0.6" />
                  <path d={moonPath(0, 0, moonR - 0.4, dayPhase)} fill="hsla(45, 30%, 96%, 0.98)" />
                  {isCurrent && (
                    <circle cx={0} cy={0} r={moonR + 3} fill="none" stroke="hsla(45, 90%, 75%, 0.95)" strokeWidth="1" />
                  )}
                </g>
              );
            })}

            {/* Tide band rails */}
            <circle cx={C} cy={C} r={R_TIDE_IN} fill="none" stroke="hsla(220,15%,80%,0.28)" strokeWidth="0.6" />
            <circle cx={C} cy={C} r={R_TIDE_OUT} fill="none" stroke="hsla(220,15%,80%,0.28)" strokeWidth="0.6" />
            <circle cx={C} cy={C} r={R_TIDE_MID} fill="none" stroke="hsla(220,15%,80%,0.06)" strokeWidth="0.3" strokeDasharray="1 3" />

            {/* Tide arcs */}
            {[0, 180].map((cp) => (
              <path key={`spring-${cp}`} d={tideArc(cp, 56)} fill="url(#tideSpringGrad)" stroke="hsla(210,65%,85%,0.55)" strokeWidth="0.7" />
            ))}
            {[90, 270].map((cp) => (
              <path key={`neap-${cp}`} d={tideArc(cp, 56)} fill="url(#tideNeapGrad)" stroke="hsla(220,15%,80%,0.32)" strokeWidth="0.5" />
            ))}

            {/* Decorative endpoint nodes between arcs */}
            {[45, 135, 225, 315].map((cp) => {
              const pt = polar(C, C, R_TIDE_MID, sun.longitude + cp);
              return <circle key={`node-${cp}`} cx={pt.x} cy={pt.y} r={1.6} fill="hsla(220,15%,90%,0.55)" />;
            })}

            <text fontSize="9" letterSpacing="0.4em" fill="hsla(210,55%,92%,0.95)" fontWeight={500} dominantBaseline="central" className="uppercase select-none pointer-events-none" style={{ fontFamily: "ui-sans-serif, system-ui" }}>
              <textPath href={`#${labelArcId("spring-new")}`} startOffset="50%" textAnchor="middle">Spring Tide</textPath>
            </text>
            <text fontSize="9" letterSpacing="0.4em" fill="hsla(220,15%,85%,0.85)" fontWeight={500} dominantBaseline="central" className="uppercase select-none pointer-events-none" style={{ fontFamily: "ui-sans-serif, system-ui" }}>
              <textPath href={`#${labelArcId("neap-1q")}`} startOffset="50%" textAnchor="middle">Neap Tide</textPath>
            </text>
            <text fontSize="9" letterSpacing="0.4em" fill="hsla(210,55%,92%,0.95)" fontWeight={500} dominantBaseline="central" className="uppercase select-none pointer-events-none" style={{ fontFamily: "ui-sans-serif, system-ui" }}>
              <textPath href={`#${labelArcId("spring-full")}`} startOffset="50%" textAnchor="middle">Spring Tide</textPath>
            </text>
            <text fontSize="9" letterSpacing="0.4em" fill="hsla(220,15%,85%,0.85)" fontWeight={500} dominantBaseline="central" className="uppercase select-none pointer-events-none" style={{ fontFamily: "ui-sans-serif, system-ui" }}>
              <textPath href={`#${labelArcId("neap-3q")}`} startOffset="50%" textAnchor="middle">Neap Tide</textPath>
            </text>

            {/* Current tide marker at Moon's longitude */}
            {(() => {
              const isSpring = phase < 25 || phase > 335 || (phase > 155 && phase < 205);
              const isNeap = (phase > 65 && phase < 115) || (phase > 245 && phase < 295);
              const tideLabel = isSpring ? "Spring Tide" : isNeap ? "Neap Tide" : phase < 180 ? "Tide Flooding" : "Tide Ebbing";
              const mkIn = polar(C, C, R_TIDE_IN - 2, moon.longitude);
              const mkMid = polar(C, C, R_TIDE_MID, moon.longitude);
              const mkOut = polar(C, C, R_TIDE_OUT + 8, moon.longitude);
              return (
                <g>
                  <title>{`Current: ${tideLabel} · lunar phase ${phase.toFixed(0)}°`}</title>
                  <line x1={mkIn.x} y1={mkIn.y} x2={mkOut.x} y2={mkOut.y} stroke="hsla(210,70%,92%,0.7)" strokeWidth="0.7" />
                  <circle cx={mkMid.x} cy={mkMid.y} r={4.5} fill="hsla(210,70%,92%,0.18)" />
                  <circle cx={mkMid.x} cy={mkMid.y} r={2.4} fill="hsla(210,80%,96%,0.98)" />
                </g>
              );
            })()}
          </g>
        );
      })()}





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

      {/* Keplerian polygon overlay — generating polygon for each active aspect */}
      {showPolygons && (
        <g opacity={0.55}>
          {aspects.map((asp, i) => {
            if (asp.polygonSides < 2) return null;
            const a = placed.get(asp.a);
            if (!a) return null;
            const angles = polygonAngles(a.angle, asp.angle);
            if (angles.length < 2) return null;
            const pts = angles.map((deg) => polar(C, C, R_ASPECT, deg));
            const d = pts.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
            const key = `${asp.a}-${asp.b}-${asp.name}`;
            const isSel = selectedAspectKey === key;
            const dimmed = selectedAspectKey && !isSel;
            const highlight = isSel || selectedPlanet === asp.a || selectedPlanet === asp.b;
            const exactness = Math.max(0, 1 - asp.orb / 8);
            return (
              <path
                key={`poly-${i}`}
                d={d}
                fill="none"
                stroke={asp.color}
                strokeWidth={isSel ? 1.6 : highlight ? 1.1 : 0.55}
                strokeOpacity={dimmed ? 0.05 : isSel ? 1 : highlight ? 0.85 : 0.18 + 0.22 * exactness}
                strokeLinejoin="round"
                strokeDasharray={asp.tier === "minor" ? "2 3" : undefined}
              />
            );
          })}
        </g>
      )}

      {/* Aspect lines */}
      <g opacity={selectedPlanet || selectedAspectKey ? 0.25 : 0.55}>
        {aspects.map((asp, i) => {
          const a = placed.get(asp.a);
          const b = placed.get(asp.b);
          if (!a || !b) return null;
          const pa = polar(C, C, R_ASPECT, a.angle);
          const pb = polar(C, C, R_ASPECT, b.angle);
          const key = `${asp.a}-${asp.b}-${asp.name}`;
          const isSel = selectedAspectKey === key;
          const dimmed = selectedAspectKey && !isSel;
          const highlight = isSel || selectedPlanet === asp.a || selectedPlanet === asp.b;
          return (
            <line
              key={i}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke={asp.color}
              strokeWidth={isSel ? 1.8 : highlight ? 1.4 : 0.7}
              strokeOpacity={dimmed ? 0.08 : isSel ? 1 : highlight ? 0.9 : 0.55}
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
