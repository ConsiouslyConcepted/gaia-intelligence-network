import { useEffect, useRef, useState } from "react";

export type GalacticFocus =
  | "galactic-center"
  | "solar-position"
  | "cosmic-rays"
  | "lism"
  | "orbital-cycle"
  | null;

interface Props {
  focus: GalacticFocus;
  onSelect: (id: Exclude<GalacticFocus, null>) => void;
}

// Milky Way top-down schematic. R in normalized units (0..1) from galactic center.
// Sun is at ~26.7 kly which we represent at r = 0.62 of the disk radius.
const SUN_R = 0.62;
const DISK_R = 0.92;

// Four-arm logarithmic spiral parameters (Norma, Scutum-Centaurus, Sagittarius, Perseus)
const ARMS = [
  { name: "Perseus", phase: 0, color: "hsla(210,70%,72%,0.85)" },
  { name: "Sagittarius", phase: Math.PI / 2, color: "hsla(200,65%,68%,0.85)" },
  { name: "Scutum-Centaurus", phase: Math.PI, color: "hsla(220,60%,70%,0.85)" },
  { name: "Norma", phase: (3 * Math.PI) / 2, color: "hsla(195,60%,66%,0.85)" },
];

// Orion Spur — minor arm where the Sun sits
const ORION_PHASE = Math.PI * 0.35;

const PITCH = 0.22; // pitch angle (rad) for log spirals

function spiralPath(phaseOffset: number, rMin = 0.06, rMax = DISK_R, steps = 160) {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = rMin + (rMax - rMin) * t;
    const theta = Math.log(r / rMin) / Math.tan(PITCH) + phaseOffset;
    const x = Math.cos(theta) * r;
    const y = Math.sin(theta) * r;
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(4)} ${y.toFixed(4)}`);
  }
  return pts.join(" ");
}

export const MilkyWayMap = ({ focus, onSelect }: Props) => {
  const [tick, setTick] = useState(0);
  const raf = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const loop = (now: number) => {
      setTick((now - start) / 1000);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  // Sun position — rotates slowly around galactic center (orbital cycle)
  // 225 Myr → here we just animate a slow visual sweep
  const orbitalAngle = ORION_PHASE + tick * 0.04;
  const sunX = Math.cos(orbitalAngle) * SUN_R;
  const sunY = Math.sin(orbitalAngle) * SUN_R;

  const dim = (id: GalacticFocus) => (focus && focus !== id ? 0.22 : 1);

  const VB = 2.2; // viewBox half-size

  return (
    <svg
      viewBox={`${-VB} ${-VB} ${VB * 2} ${VB * 2}`}
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 0 24px hsla(210,70%,55%,0.18))" }}
    >
      <defs>
        <radialGradient id="bulge" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsla(40,80%,82%,0.95)" />
          <stop offset="35%" stopColor="hsla(35,70%,70%,0.55)" />
          <stop offset="100%" stopColor="hsla(30,60%,55%,0)" />
        </radialGradient>
        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsla(220,60%,40%,0.18)" />
          <stop offset="60%" stopColor="hsla(220,55%,30%,0.08)" />
          <stop offset="100%" stopColor="hsla(220,50%,20%,0)" />
        </radialGradient>
        <radialGradient id="bubble" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsla(180,70%,70%,0.0)" />
          <stop offset="70%" stopColor="hsla(180,70%,70%,0.18)" />
          <stop offset="100%" stopColor="hsla(180,70%,70%,0)" />
        </radialGradient>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsla(45,100%,85%,1)" />
          <stop offset="60%" stopColor="hsla(40,95%,70%,0.7)" />
          <stop offset="100%" stopColor="hsla(40,95%,60%,0)" />
        </radialGradient>
      </defs>

      {/* Halo */}
      <circle cx="0" cy="0" r={VB} fill="url(#halo)" />

      {/* Galactic disk faint glow */}
      <circle cx="0" cy="0" r={DISK_R * 1.05} fill="hsla(220,40%,30%,0.05)" />

      {/* Spiral arms */}
      <g style={{ opacity: dim(null) }}>
        {ARMS.map((arm, i) => (
          <path
            key={i}
            d={spiralPath(arm.phase)}
            fill="none"
            stroke={arm.color}
            strokeWidth={focus === "solar-position" ? 0.012 : 0.018}
            strokeLinecap="round"
            opacity={focus && focus !== "solar-position" ? 0.25 : 0.65}
          />
        ))}
        {/* Orion Spur — highlighted when Solar Position focused */}
        <path
          d={spiralPath(ORION_PHASE, 0.45, 0.78, 80)}
          fill="none"
          stroke={focus === "solar-position" ? "hsla(45,100%,75%,0.95)" : "hsla(210,80%,80%,0.55)"}
          strokeWidth={focus === "solar-position" ? 0.022 : 0.012}
          strokeDasharray="0.04 0.025"
          opacity={dim("solar-position")}
        />
      </g>

      {/* Orbital cycle ring (Sun's path) */}
      <g
        style={{ cursor: "pointer", opacity: dim("orbital-cycle") }}
        onClick={() => onSelect("orbital-cycle")}
      >
        <circle
          cx="0" cy="0" r={SUN_R}
          fill="none"
          stroke="hsla(200,70%,75%,0.55)"
          strokeWidth={focus === "orbital-cycle" ? 0.012 : 0.005}
          strokeDasharray="0.02 0.02"
        />
        {/* moving tick marks */}
        {focus === "orbital-cycle" && Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2 + tick * 0.04;
          return (
            <circle
              key={i}
              cx={Math.cos(a) * SUN_R}
              cy={Math.sin(a) * SUN_R}
              r={0.008}
              fill="hsla(200,80%,80%,0.85)"
            />
          );
        })}
      </g>

      {/* Cosmic ray vectors — inbound to Sun from random galactic directions */}
      <g style={{ opacity: dim("cosmic-rays") }}>
        {Array.from({ length: 18 }).map((_, i) => {
          const seed = i * 137.5;
          const a = (seed + tick * 30) % 360 * Math.PI / 180;
          const len = 0.55 + ((i * 17) % 40) / 100;
          const progress = ((tick * 0.3 + i * 0.13) % 1);
          const x1 = sunX + Math.cos(a) * len;
          const y1 = sunY + Math.sin(a) * len;
          const x2 = sunX + Math.cos(a) * len * (1 - progress);
          const y2 = sunY + Math.sin(a) * len * (1 - progress);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={focus === "cosmic-rays" ? "hsla(190,90%,75%,0.85)" : "hsla(200,70%,70%,0.25)"}
              strokeWidth={focus === "cosmic-rays" ? 0.006 : 0.003}
              strokeLinecap="round"
            />
          );
        })}
      </g>

      {/* Local Bubble around Sun */}
      <g
        style={{ cursor: "pointer", opacity: dim("lism") }}
        onClick={() => onSelect("lism")}
      >
        <circle
          cx={sunX} cy={sunY} r={0.085}
          fill="url(#bubble)"
        />
        <circle
          cx={sunX} cy={sunY} r={0.085}
          fill="none"
          stroke={focus === "lism" ? "hsla(180,85%,75%,0.9)" : "hsla(180,70%,70%,0.45)"}
          strokeWidth={focus === "lism" ? 0.006 : 0.003}
          strokeDasharray="0.015 0.012"
        />
        {focus === "lism" && (
          <text
            x={sunX} y={sunY - 0.11}
            fontSize="0.045"
            textAnchor="middle"
            fill="hsla(180,80%,85%,0.95)"
            style={{ letterSpacing: "0.08em" }}
          >
            LOCAL BUBBLE
          </text>
        )}
      </g>

      {/* Galactic center bulge */}
      <g
        style={{ cursor: "pointer", opacity: dim("galactic-center") }}
        onClick={() => onSelect("galactic-center")}
      >
        <circle cx="0" cy="0" r={0.28} fill="url(#bulge)" />
        <circle
          cx="0" cy="0" r={0.04}
          fill="hsla(45,100%,90%,1)"
          style={{
            filter: focus === "galactic-center"
              ? "drop-shadow(0 0 0.05px hsla(45,100%,80%,1)) drop-shadow(0 0 0.12px hsla(45,100%,70%,0.9))"
              : "drop-shadow(0 0 0.04px hsla(45,100%,80%,0.7))",
          }}
        />
        {focus === "galactic-center" && (
          <>
            <circle
              cx="0" cy="0" r={0.04 + (tick % 2) * 0.12}
              fill="none"
              stroke="hsla(45,100%,80%,0.5)"
              strokeWidth={0.003}
              opacity={1 - ((tick % 2) / 2)}
            />
            <text
              x="0" y="-0.35"
              fontSize="0.05"
              textAnchor="middle"
              fill="hsla(45,100%,85%,0.95)"
              style={{ letterSpacing: "0.1em" }}
            >
              SAGITTARIUS A*
            </text>
          </>
        )}
      </g>

      {/* Sun marker */}
      <g
        style={{ cursor: "pointer", opacity: dim("solar-position") }}
        onClick={() => onSelect("solar-position")}
      >
        <circle cx={sunX} cy={sunY} r={0.055} fill="url(#sun)" />
        <circle cx={sunX} cy={sunY} r={0.013} fill="hsla(50,100%,90%,1)" />
        {focus === "solar-position" && (
          <>
            <line
              x1="0" y1="0" x2={sunX} y2={sunY}
              stroke="hsla(45,100%,80%,0.6)"
              strokeWidth={0.004}
              strokeDasharray="0.02 0.015"
            />
            <text
              x={sunX} y={sunY + 0.1}
              fontSize="0.045"
              textAnchor="middle"
              fill="hsla(45,100%,85%,0.95)"
              style={{ letterSpacing: "0.08em" }}
            >
              SOL · 26.7 kly
            </text>
          </>
        )}
      </g>

      {/* Compass / scale */}
      <g opacity="0.4" transform={`translate(${-VB + 0.18}, ${VB - 0.18})`}>
        <line x1="0" y1="0" x2="0.3" y2="0" stroke="hsla(0,0%,100%,0.5)" strokeWidth={0.005} />
        <text x="0.15" y="-0.04" fontSize="0.04" textAnchor="middle" fill="hsla(0,0%,100%,0.6)" style={{ letterSpacing: "0.1em" }}>
          ~15 kly
        </text>
      </g>
    </svg>
  );
};
