import { useEffect, useRef, useState } from "react";

export type GalacticLayer = "position" | "environment" | "dynamics" | "structure";

interface Props {
  layer: GalacticLayer;
}

const SUN_R = 0.62;
const DISK_R = 0.92;
const ORION_PHASE = Math.PI * 0.35;
const PITCH = 0.22;

const ARMS = [
  { name: "Perseus", phase: 0 },
  { name: "Sagittarius", phase: Math.PI / 2 },
  { name: "Scutum-Centaurus", phase: Math.PI },
  { name: "Norma", phase: (3 * Math.PI) / 2 },
];

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

const rand = (s: number) => {
  let t = (s + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (((t ^ (t >>> 14)) >>> 0) / 0xffffffff) * 2 - 1;
};

export const MilkyWayMap = ({ layer }: Props) => {
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

  // Sun position — slow visual sweep for orbital motion
  const orbitalAngle = ORION_PHASE + tick * 0.04;
  const sunX = Math.cos(orbitalAngle) * SUN_R;
  const sunY = Math.sin(orbitalAngle) * SUN_R;

  const VB = 2.2;


  return (
    <svg
      viewBox={`${-VB} ${-VB} ${VB * 2} ${VB * 2}`}
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 0 24px hsla(210,70%,55%,0.18))" }}
    >
      <defs>
        <radialGradient id="g-bulge" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsla(40,80%,82%,0.95)" />
          <stop offset="35%" stopColor="hsla(35,70%,70%,0.55)" />
          <stop offset="100%" stopColor="hsla(30,60%,55%,0)" />
        </radialGradient>
        <radialGradient id="g-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsla(220,60%,40%,0.18)" />
          <stop offset="60%" stopColor="hsla(220,55%,30%,0.08)" />
          <stop offset="100%" stopColor="hsla(220,50%,20%,0)" />
        </radialGradient>
        <radialGradient id="g-bubble" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsla(180,70%,70%,0.0)" />
          <stop offset="70%" stopColor="hsla(180,70%,70%,0.22)" />
          <stop offset="100%" stopColor="hsla(180,70%,70%,0)" />
        </radialGradient>
        <radialGradient id="g-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsla(45,100%,85%,1)" />
          <stop offset="60%" stopColor="hsla(40,95%,70%,0.7)" />
          <stop offset="100%" stopColor="hsla(40,95%,60%,0)" />
        </radialGradient>
      </defs>

      {/* Halo & background stars */}
      <circle cx="0" cy="0" r={VB} fill="url(#g-halo)" />
      {bgStars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="hsla(0,0%,100%,0.4)" />
      ))}

      {/* Galactic disk faint glow */}
      <circle cx="0" cy="0" r={DISK_R * 1.05} fill="hsla(220,40%,30%,0.05)" />

      {/* Spiral arms — always shown but brightness varies by layer */}
      <g>
        {ARMS.map((arm, i) => (
          <path
            key={i}
            d={spiralPath(arm.phase)}
            fill="none"
            stroke="hsla(210,70%,72%,0.85)"
            strokeWidth={layer === "structure" ? 0.024 : 0.018}
            strokeLinecap="round"
            opacity={layer === "structure" ? 0.85 : 0.55}
          />
        ))}
        {/* Orion Spur */}
        <path
          d={spiralPath(ORION_PHASE, 0.45, 0.78, 80)}
          fill="none"
          stroke={layer === "position" ? "hsla(45,100%,75%,0.95)" : "hsla(210,80%,80%,0.5)"}
          strokeWidth={layer === "position" ? 0.022 : 0.012}
          strokeDasharray="0.04 0.025"
        />
      </g>

      {/* ─────────── POSITION layer ─────────── */}
      {layer === "position" && (
        <g>
          {/* heliocentric vector to galactic center */}
          <line
            x1="0" y1="0" x2={sunX} y2={sunY}
            stroke="hsla(45,100%,80%,0.7)"
            strokeWidth={0.005}
            strokeDasharray="0.025 0.018"
          />
          {/* longitude ticks around sun */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={sunX + Math.cos(a) * 0.11}
                y1={sunY + Math.sin(a) * 0.11}
                x2={sunX + Math.cos(a) * 0.14}
                y2={sunY + Math.sin(a) * 0.14}
                stroke="hsla(200,60%,75%,0.55)"
                strokeWidth={0.0035}
              />
            );
          })}
          <text x={sunX} y={sunY - 0.18} fontSize="0.045" textAnchor="middle"
            fill="hsla(45,100%,85%,0.95)" style={{ letterSpacing: "0.1em" }}>
            SOL · ℓ 0° · b 0°
          </text>
          <text x={sunX * 0.5} y={sunY * 0.5 - 0.04} fontSize="0.04" textAnchor="middle"
            fill="hsla(0,0%,100%,0.55)" style={{ letterSpacing: "0.1em" }}>
            26.7 kly
          </text>
        </g>
      )}

      {/* ─────────── ENVIRONMENT layer ─────────── */}
      {layer === "environment" && (
        <g>
          {/* Cosmic ray streams */}
          {Array.from({ length: 22 }).map((_, i) => {
            const a = ((i * 137.5 + tick * 25) % 360) * Math.PI / 180;
            const len = 0.5 + ((i * 17) % 40) / 100;
            const progress = ((tick * 0.35 + i * 0.13) % 1);
            const x1 = sunX + Math.cos(a) * len;
            const y1 = sunY + Math.sin(a) * len;
            const x2 = sunX + Math.cos(a) * len * (1 - progress);
            const y2 = sunY + Math.sin(a) * len * (1 - progress);
            return (
              <line key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="hsla(190,90%,75%,0.7)"
                strokeWidth={0.0045}
                strokeLinecap="round"
              />
            );
          })}
          {/* Local Bubble */}
          <circle cx={sunX} cy={sunY} r={0.105} fill="url(#g-bubble)" />
          <circle cx={sunX} cy={sunY} r={0.105} fill="none"
            stroke="hsla(180,85%,75%,0.85)" strokeWidth={0.005}
            strokeDasharray="0.018 0.014" />
          {/* Local Interstellar Cloud — smaller inner shell */}
          <circle cx={sunX + 0.012} cy={sunY - 0.008} r={0.035}
            fill="none" stroke="hsla(160,70%,75%,0.8)" strokeWidth={0.004} />
          <text x={sunX} y={sunY - 0.16} fontSize="0.042" textAnchor="middle"
            fill="hsla(180,80%,85%,0.95)" style={{ letterSpacing: "0.1em" }}>
            LOCAL BUBBLE · LIC
          </text>
        </g>
      )}

      {/* ─────────── DYNAMICS layer ─────────── */}
      {layer === "dynamics" && (
        <g>
          {/* Solar orbit ring */}
          <circle cx="0" cy="0" r={SUN_R} fill="none"
            stroke="hsla(200,70%,75%,0.75)" strokeWidth={0.008}
            strokeDasharray="0.022 0.018" />
          {/* moving tick marks along orbit */}
          {Array.from({ length: 32 }).map((_, i) => {
            const a = (i / 32) * Math.PI * 2 + tick * 0.04;
            return (
              <circle key={i}
                cx={Math.cos(a) * SUN_R}
                cy={Math.sin(a) * SUN_R}
                r={0.007}
                fill="hsla(200,80%,80%,0.7)" />
            );
          })}
          {/* Velocity arrow at Sun */}
          {(() => {
            const tx = -Math.sin(orbitalAngle);
            const ty = Math.cos(orbitalAngle);
            const tipX = sunX + tx * 0.18;
            const tipY = sunY + ty * 0.18;
            return (
              <>
                <line x1={sunX} y1={sunY} x2={tipX} y2={tipY}
                  stroke="hsla(45,100%,80%,0.95)" strokeWidth={0.006} />
                <circle cx={tipX} cy={tipY} r={0.012}
                  fill="hsla(45,100%,80%,0.95)" />
                <text x={tipX + 0.04} y={tipY + 0.02} fontSize="0.04"
                  fill="hsla(45,100%,85%,0.85)" style={{ letterSpacing: "0.1em" }}>
                  220 km/s
                </text>
              </>
            );
          })()}
          {/* Spiral arm crossing markers along orbit */}
          {[0.6, 1.7, 2.9, 4.1, 5.3].map((a, i) => (
            <circle key={i}
              cx={Math.cos(a) * SUN_R}
              cy={Math.sin(a) * SUN_R}
              r={0.018}
              fill="none"
              stroke="hsla(45,100%,80%,0.7)"
              strokeWidth={0.004} />
          ))}
          <text x="0" y={-SUN_R - 0.07} fontSize="0.04" textAnchor="middle"
            fill="hsla(0,0%,100%,0.6)" style={{ letterSpacing: "0.1em" }}>
            GALACTIC YEAR · 225 Myr
          </text>
        </g>
      )}

      {/* ─────────── STRUCTURE layer ─────────── */}
      {layer === "structure" && (
        <g>
          {/* Magnetic field — concentric arcs around disk */}
          {[0.35, 0.55, 0.78, 1.0].map((r, i) => {
            const dash = `${0.02 + i * 0.005} ${0.04}`;
            return (
              <circle key={i}
                cx="0" cy="0" r={r}
                fill="none"
                stroke="hsla(280,55%,75%,0.35)"
                strokeWidth={0.0035}
                strokeDasharray={dash}
                transform={`rotate(${tick * 4})`} />
            );
          })}
          {/* Stellar streams — sweeping arcs */}
          {Array.from({ length: 4 }).map((_, i) => {
            const baseA = i * Math.PI / 2 + 0.3;
            const pts: string[] = [];
            for (let k = 0; k <= 30; k++) {
              const t = k / 30;
              const r = 1.05 + Math.sin(t * Math.PI) * 0.4;
              const a = baseA + t * 0.9;
              pts.push(`${k === 0 ? "M" : "L"} ${(Math.cos(a) * r).toFixed(3)} ${(Math.sin(a) * r).toFixed(3)}`);
            }
            return (
              <path key={i} d={pts.join(" ")}
                fill="none"
                stroke="hsla(45,80%,80%,0.45)"
                strokeWidth={0.005}
                strokeDasharray="0.012 0.018" />
            );
          })}
          {/* Galactic center activity — pulsing accretion */}
          <circle cx="0" cy="0" r={0.28} fill="url(#g-bulge)" />
          <circle cx="0" cy="0"
            r={0.05 + (tick % 2) * 0.15}
            fill="none"
            stroke="hsla(45,100%,80%,0.6)"
            strokeWidth={0.004}
            opacity={1 - ((tick % 2) / 2)} />
          <circle cx="0" cy="0"
            r={0.05 + ((tick + 1) % 2) * 0.15}
            fill="none"
            stroke="hsla(45,100%,80%,0.4)"
            strokeWidth={0.003}
            opacity={1 - (((tick + 1) % 2) / 2)} />
          <text x="0" y="-1.15" fontSize="0.045" textAnchor="middle"
            fill="hsla(280,60%,82%,0.85)" style={{ letterSpacing: "0.15em" }}>
            MAGNETIC FIELD · STELLAR STREAMS
          </text>
        </g>
      )}

      {/* Galactic center bulge — always */}
      <g>
        <circle cx="0" cy="0" r={0.28} fill="url(#g-bulge)" />
        <circle cx="0" cy="0" r={0.04} fill="hsla(45,100%,90%,1)" />
      </g>

      {/* Sun — always */}
      <g>
        <circle cx={sunX} cy={sunY} r={0.055} fill="url(#g-sun)" />
        <circle cx={sunX} cy={sunY} r={0.013} fill="hsla(50,100%,90%,1)" />
      </g>

      {/* Scale bar */}
      <g opacity="0.4" transform={`translate(${-VB + 0.18}, ${VB - 0.18})`}>
        <line x1="0" y1="0" x2="0.3" y2="0" stroke="hsla(0,0%,100%,0.5)" strokeWidth={0.005} />
        <text x="0.15" y="-0.04" fontSize="0.04" textAnchor="middle"
          fill="hsla(0,0%,100%,0.6)" style={{ letterSpacing: "0.1em" }}>
          ~15 kly
        </text>
      </g>
    </svg>
  );
};
