import { useEffect, useMemo, useRef, useState } from "react";

export type GalacticLayer = "position" | "environment" | "dynamics" | "structure";

interface Props {
  layer: GalacticLayer;
}

/* ─────────────────────────────────────────────────────────────
   Scientific constants (rendered in normalized units where the
   stellar disk radius ≈ 1.0 corresponds to ~50,000 ly).
   ───────────────────────────────────────────────────────────── */
const DISK_R = 1.0;            // stellar disk edge (~50 kly)
const HALO_R = 1.55;           // dark-matter / halo extent
const BAR_LEN = 0.32;          // galactic bar half-length (~14 kly)
const BAR_TILT = 27;           // bar tilt vs. Sun–GC line, degrees
const SUN_R = 0.534;           // Sun at 26.7 kly from GC → 26.7/50
const PITCH = (12.5 * Math.PI) / 180; // arm pitch angle ~12.5°

/* Four major arms + Local (Orion) spur — phase offsets approximate
   the modern (Reid+2019 / Vallée) arm anchor longitudes. */
const ARMS = [
  { id: "perseus",     name: "PERSEUS",          phase: 0.00, mag: 1.0,  hue: 212 },
  { id: "sagittarius", name: "SAGITTARIUS–CARINA", phase: 1.55, mag: 1.0,  hue: 208 },
  { id: "scutum",      name: "SCUTUM–CENTAURUS",  phase: 3.10, mag: 1.05, hue: 210 },
  { id: "norma",       name: "NORMA / OUTER",     phase: 4.65, mag: 0.85, hue: 215 },
];
const ORION_SPUR_PHASE = 0.78;

/* ─── helpers ─── */
const polar = (r: number, th: number) => [Math.cos(th) * r, Math.sin(th) * r] as const;

function logSpiralPath(phase: number, rMin: number, rMax: number, steps = 220) {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = rMin * Math.pow(rMax / rMin, t);
    const theta = Math.log(r / rMin) / Math.tan(PITCH) + phase;
    const [x, y] = polar(r, theta);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(4)},${y.toFixed(4)}`);
  }
  return pts.join(" ");
}

/* Deterministic pseudo-random — used to scatter stars/HII regions */
const seeded = (seed: number) => {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) / 0xffffffff);
  };
};

/* Sample stars across the four arms with gaussian spread perpendicular to each arm */
function buildArmStars(count = 1400) {
  const rng = seeded(7);
  const stars: { x: number; y: number; r: number; o: number; hue: number }[] = [];
  for (let i = 0; i < count; i++) {
    const arm = ARMS[i % ARMS.length];
    const t = Math.pow(rng(), 0.6); // bias toward inner-mid
    const rBase = 0.18 + t * (DISK_R - 0.18);
    const thetaBase = Math.log(rBase / 0.18) / Math.tan(PITCH) + arm.phase;
    // Gaussian-ish offset perpendicular to spiral
    const spread = (rng() + rng() + rng() - 1.5) * 0.045 * (1 + t * 0.6);
    const nx = -Math.sin(thetaBase);
    const ny = Math.cos(thetaBase);
    const [bx, by] = polar(rBase, thetaBase);
    const x = bx + nx * spread;
    const y = by + ny * spread;
    const r = 0.0025 + rng() * 0.0055;
    const o = 0.35 + rng() * 0.55;
    stars.push({ x, y, r, o, hue: arm.hue + (rng() - 0.5) * 18 });
  }
  return stars;
}

/* Diffuse halo / inter-arm field stars */
function buildHaloStars(count = 600) {
  const rng = seeded(91);
  const out: { x: number; y: number; r: number; o: number }[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt(rng()) * HALO_R;
    const a = rng() * Math.PI * 2;
    out.push({
      x: Math.cos(a) * r,
      y: Math.sin(a) * r,
      r: 0.0018 + rng() * 0.003,
      o: 0.15 + rng() * 0.35,
    });
  }
  return out;
}

/* HII regions / star-forming complexes — bright glowing knots on arms */
function buildHII(count = 38) {
  const rng = seeded(311);
  const out: { x: number; y: number; r: number; hue: number }[] = [];
  for (let i = 0; i < count; i++) {
    const arm = ARMS[i % ARMS.length];
    const t = 0.2 + rng() * 0.8;
    const rBase = 0.22 + t * (DISK_R - 0.22);
    const theta = Math.log(rBase / 0.22) / Math.tan(PITCH) + arm.phase + (rng() - 0.5) * 0.08;
    const [x, y] = polar(rBase, theta);
    out.push({ x, y, r: 0.012 + rng() * 0.016, hue: 200 + rng() * 40 });
  }
  return out;
}

/* Globular clusters scattered in halo */
function buildGlobulars(count = 22) {
  const rng = seeded(53);
  const out: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < count; i++) {
    const r = 0.25 + Math.pow(rng(), 0.4) * (HALO_R * 0.85);
    const a = rng() * Math.PI * 2;
    out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, r: 0.0055 + rng() * 0.004 });
  }
  return out;
}

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

  const armStars   = useMemo(() => buildArmStars(),   []);
  const haloStars  = useMemo(() => buildHaloStars(),  []);
  const hiiRegions = useMemo(() => buildHII(),        []);
  const globulars  = useMemo(() => buildGlobulars(),  []);

  /* Sun: clockwise galactic rotation (visual sweep) */
  const orbitalAngle = -Math.PI / 2 + tick * 0.035;
  const [sunX, sunY] = polar(SUN_R, orbitalAngle);

  const VB = 1.85;

  /* Per-layer disk opacity emphasis */
  const armOpacity = {
    position:    0.55,
    environment: 0.40,
    dynamics:    0.65,
    structure:   0.95,
  }[layer];

  return (
    <svg
      viewBox={`${-VB} ${-VB} ${VB * 2} ${VB * 2}`}
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 0 32px hsla(212,75%,55%,0.22))" }}
    >
      <defs>
        {/* Bulge: yellow-orange old stellar population */}
        <radialGradient id="g-bulge" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="hsla(48,95%,90%,1)" />
          <stop offset="22%" stopColor="hsla(42,85%,76%,0.92)" />
          <stop offset="55%" stopColor="hsla(34,70%,58%,0.45)" />
          <stop offset="100%" stopColor="hsla(28,65%,45%,0)" />
        </radialGradient>
        {/* Bar — elongated, slightly redder */}
        <radialGradient id="g-bar" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="hsla(38,80%,70%,0.85)" />
          <stop offset="60%" stopColor="hsla(30,70%,55%,0.30)" />
          <stop offset="100%" stopColor="hsla(28,60%,45%,0)" />
        </radialGradient>
        {/* Diffuse stellar disk glow */}
        <radialGradient id="g-disk" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="hsla(45,70%,75%,0.18)" />
          <stop offset="35%"  stopColor="hsla(220,60%,55%,0.10)" />
          <stop offset="75%"  stopColor="hsla(225,55%,40%,0.05)" />
          <stop offset="100%" stopColor="hsla(225,50%,25%,0)" />
        </radialGradient>
        {/* Dark-matter / stellar halo */}
        <radialGradient id="g-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="hsla(220,55%,40%,0.10)" />
          <stop offset="70%"  stopColor="hsla(220,50%,30%,0.04)" />
          <stop offset="100%" stopColor="hsla(220,45%,20%,0)" />
        </radialGradient>
        {/* Sun */}
        <radialGradient id="g-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="hsla(50,100%,92%,1)" />
          <stop offset="55%" stopColor="hsla(45,100%,75%,0.85)" />
          <stop offset="100%" stopColor="hsla(40,95%,60%,0)" />
        </radialGradient>
        {/* HII region — pinkish nebula */}
        <radialGradient id="g-hii" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="hsla(330,90%,82%,0.95)" />
          <stop offset="55%" stopColor="hsla(290,75%,70%,0.45)" />
          <stop offset="100%" stopColor="hsla(260,70%,60%,0)" />
        </radialGradient>
        {/* Local Bubble */}
        <radialGradient id="g-bubble" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="hsla(180,80%,75%,0)" />
          <stop offset="65%"  stopColor="hsla(180,80%,70%,0.18)" />
          <stop offset="100%" stopColor="hsla(180,75%,65%,0)" />
        </radialGradient>
        {/* Dust lane mask — dark patches along arms */}
        <radialGradient id="g-dust" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="hsla(20,40%,8%,0.55)" />
          <stop offset="100%" stopColor="hsla(20,40%,8%,0)" />
        </radialGradient>
      </defs>

      {/* ── Halo / disk diffuse glow ── */}
      <circle cx={0} cy={0} r={HALO_R} fill="url(#g-halo)" />
      <circle cx={0} cy={0} r={DISK_R * 1.08} fill="url(#g-disk)" />

      {/* ── Diffuse field / halo stars (always visible, very subtle) ── */}
      <g>
        {haloStars.map((s, i) => (
          <circle key={`h${i}`} cx={s.x} cy={s.y} r={s.r}
            fill="hsla(220,40%,90%,1)" opacity={s.o} />
        ))}
      </g>

      {/* ── Spiral arms: wide soft band + dust lane + crisp ridge ── */}
      <g opacity={armOpacity}>
        {ARMS.map((arm) => (
          <g key={arm.id}>
            {/* outer soft band */}
            <path
              d={logSpiralPath(arm.phase, 0.18, DISK_R)}
              fill="none"
              stroke={`hsla(${arm.hue},65%,70%,0.32)`}
              strokeWidth={0.055}
              strokeLinecap="round"
            />
            {/* dust lane (slightly offset inward) */}
            <path
              d={logSpiralPath(arm.phase - 0.05, 0.20, DISK_R * 0.98)}
              fill="none"
              stroke="hsla(18,45%,10%,0.55)"
              strokeWidth={0.018}
              strokeLinecap="round"
            />
            {/* crisp ridge */}
            <path
              d={logSpiralPath(arm.phase, 0.20, DISK_R)}
              fill="none"
              stroke={`hsla(${arm.hue},75%,82%,${0.55 * arm.mag})`}
              strokeWidth={0.012}
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Orion (Local) Spur — short minor arm crossing Sun */}
        <path
          d={logSpiralPath(ORION_SPUR_PHASE, 0.45, 0.78, 120)}
          fill="none"
          stroke={layer === "position" ? "hsla(48,100%,78%,0.95)" : "hsla(48,90%,78%,0.55)"}
          strokeWidth={layer === "position" ? 0.018 : 0.010}
          strokeDasharray="0.05 0.03"
        />
      </g>

      {/* ── Star scatter along arms ── */}
      <g opacity={Math.min(1, armOpacity + 0.25)}>
        {armStars.map((s, i) => (
          <circle key={`s${i}`} cx={s.x} cy={s.y} r={s.r}
            fill={`hsla(${s.hue},65%,88%,1)`} opacity={s.o} />
        ))}
      </g>

      {/* ── Central galactic bar (barred spiral) ── */}
      <g transform={`rotate(${BAR_TILT})`}>
        <ellipse cx={0} cy={0} rx={BAR_LEN} ry={BAR_LEN * 0.32} fill="url(#g-bar)" />
      </g>

      {/* ── Bulge ── */}
      <g>
        <ellipse cx={0} cy={0} rx={0.22} ry={0.20} fill="url(#g-bulge)" />
        <circle cx={0} cy={0} r={0.022} fill="hsla(50,100%,95%,1)" />
        {/* Sgr A* pulse */}
        <circle cx={0} cy={0}
          r={0.025 + ((tick * 0.5) % 1) * 0.12}
          fill="none"
          stroke="hsla(48,100%,85%,0.7)"
          strokeWidth={0.0035}
          opacity={1 - ((tick * 0.5) % 1)} />
      </g>

      {/* ── HII regions (always present, brighter in environment) ── */}
      <g opacity={layer === "environment" ? 1 : 0.55}>
        {hiiRegions.map((h, i) => (
          <circle key={`hii${i}`} cx={h.x} cy={h.y} r={h.r} fill="url(#g-hii)" />
        ))}
      </g>

      {/* ─────────── POSITION layer ─────────── */}
      {layer === "position" && (
        <g>
          {/* Galactic coordinate grid — concentric distance rings */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((r) => (
            <circle key={r} cx={0} cy={0} r={r}
              fill="none" stroke="hsla(210,40%,70%,0.10)"
              strokeWidth={0.003} strokeDasharray="0.02 0.025" />
          ))}
          {/* Longitude radial spokes around Sun */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const [x1, y1] = [sunX + Math.cos(a) * 0.11, sunY + Math.sin(a) * 0.11];
            const [x2, y2] = [sunX + Math.cos(a) * 0.16, sunY + Math.sin(a) * 0.16];
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="hsla(48,90%,80%,0.55)" strokeWidth={0.0035} />
                {i % 3 === 0 && (
                  <text x={sunX + Math.cos(a) * 0.19} y={sunY + Math.sin(a) * 0.19}
                    fontSize="0.025" textAnchor="middle" dominantBaseline="middle"
                    fill="hsla(48,80%,85%,0.6)" style={{ letterSpacing: "0.1em" }}>
                    {i * 30}°
                  </text>
                )}
              </g>
            );
          })}
          {/* Sun → GC vector */}
          <line x1={0} y1={0} x2={sunX} y2={sunY}
            stroke="hsla(48,95%,82%,0.7)" strokeWidth={0.005}
            strokeDasharray="0.028 0.02" />
          {/* SOL label */}
          <text x={sunX} y={sunY + 0.085} fontSize="0.038" textAnchor="middle"
            fill="hsla(48,100%,90%,0.95)" style={{ letterSpacing: "0.18em" }}>
            SOL · ℓ 0° · b 0°
          </text>
          <text x={sunX * 0.5 + 0.04} y={sunY * 0.5} fontSize="0.032" textAnchor="middle"
            fill="hsla(0,0%,100%,0.55)" style={{ letterSpacing: "0.15em" }}>
            26.7 kly → Sgr A*
          </text>
          {/* Arm labels */}
          {ARMS.map((arm) => {
            const r = DISK_R * 0.78;
            const theta = Math.log(r / 0.20) / Math.tan(PITCH) + arm.phase;
            const [x, y] = polar(r * 1.05, theta);
            return (
              <text key={arm.id} x={x} y={y} fontSize="0.028" textAnchor="middle"
                fill={`hsla(${arm.hue},70%,82%,0.75)`}
                style={{ letterSpacing: "0.18em" }}>
                {arm.name}
              </text>
            );
          })}
        </g>
      )}

      {/* ─────────── ENVIRONMENT layer ─────────── */}
      {layer === "environment" && (
        <g>
          {/* Local Bubble shell */}
          <circle cx={sunX} cy={sunY} r={0.12} fill="url(#g-bubble)" />
          <circle cx={sunX} cy={sunY} r={0.12} fill="none"
            stroke="hsla(180,85%,78%,0.85)" strokeWidth={0.005}
            strokeDasharray="0.02 0.016" />
          {/* Local Interstellar Cloud */}
          <circle cx={sunX + 0.014} cy={sunY - 0.01} r={0.038}
            fill="hsla(160,70%,60%,0.10)"
            stroke="hsla(160,75%,78%,0.8)" strokeWidth={0.004} />
          {/* Cosmic ray streamers */}
          {Array.from({ length: 26 }).map((_, i) => {
            const a = ((i * 137.5 + tick * 22) % 360) * Math.PI / 180;
            const len = 0.55 + ((i * 13) % 35) / 100;
            const prog = ((tick * 0.32 + i * 0.13) % 1);
            const x1 = sunX + Math.cos(a) * len;
            const y1 = sunY + Math.sin(a) * len;
            const x2 = sunX + Math.cos(a) * len * (1 - prog);
            const y2 = sunY + Math.sin(a) * len * (1 - prog);
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="hsla(195,90%,78%,0.6)" strokeWidth={0.0042}
                strokeLinecap="round" />
            );
          })}
          {/* Nearby star markers (visible to naked eye / within 30 ly) */}
          {[
            { dx: 0.022, dy: 0.014, name: "α Cen" },
            { dx: -0.018, dy: 0.026, name: "Sirius" },
            { dx: 0.030, dy: -0.020, name: "Procyon" },
            { dx: -0.028, dy: -0.018, name: "Vega" },
          ].map((p, i) => (
            <g key={i}>
              <circle cx={sunX + p.dx} cy={sunY + p.dy} r={0.005}
                fill="hsla(200,90%,90%,1)" />
              <text x={sunX + p.dx + 0.012} y={sunY + p.dy + 0.005}
                fontSize="0.022" fill="hsla(200,70%,85%,0.7)"
                style={{ letterSpacing: "0.1em" }}>{p.name}</text>
            </g>
          ))}
          <text x={sunX} y={sunY - 0.16} fontSize="0.035" textAnchor="middle"
            fill="hsla(180,85%,88%,0.95)" style={{ letterSpacing: "0.18em" }}>
            LOCAL BUBBLE · G-CLOUD
          </text>
        </g>
      )}

      {/* ─────────── DYNAMICS layer ─────────── */}
      {layer === "dynamics" && (
        <g>
          {/* Sun's orbital ring */}
          <circle cx={0} cy={0} r={SUN_R} fill="none"
            stroke="hsla(200,75%,78%,0.6)" strokeWidth={0.006}
            strokeDasharray="0.025 0.02" />
          {/* Co-moving tick marks */}
          {Array.from({ length: 48 }).map((_, i) => {
            const a = (i / 48) * Math.PI * 2 + tick * 0.035;
            return (
              <circle key={i}
                cx={Math.cos(a) * SUN_R}
                cy={Math.sin(a) * SUN_R}
                r={0.006}
                fill="hsla(200,85%,82%,0.7)" />
            );
          })}
          {/* Velocity vector */}
          {(() => {
            const tx = -Math.sin(orbitalAngle);
            const ty = Math.cos(orbitalAngle);
            const tipX = sunX + tx * 0.22;
            const tipY = sunY + ty * 0.22;
            return (
              <>
                <line x1={sunX} y1={sunY} x2={tipX} y2={tipY}
                  stroke="hsla(48,100%,82%,0.95)" strokeWidth={0.006} />
                <polygon
                  points={`${tipX},${tipY} ${tipX - tx * 0.025 + ty * 0.012},${tipY - ty * 0.025 - tx * 0.012} ${tipX - tx * 0.025 - ty * 0.012},${tipY - ty * 0.025 + tx * 0.012}`}
                  fill="hsla(48,100%,82%,0.95)" />
                <text x={tipX + tx * 0.045} y={tipY + ty * 0.045} fontSize="0.034"
                  textAnchor="middle"
                  fill="hsla(48,100%,88%,0.95)" style={{ letterSpacing: "0.15em" }}>
                  220 km/s
                </text>
              </>
            );
          })()}
          {/* Apex of solar motion (Solar Apex toward Hercules) */}
          <text x={0} y={-SUN_R - 0.06} fontSize="0.032" textAnchor="middle"
            fill="hsla(0,0%,100%,0.6)" style={{ letterSpacing: "0.18em" }}>
            GALACTIC YEAR · 225 Myr · ⟲ CW
          </text>
        </g>
      )}

      {/* ─────────── STRUCTURE layer ─────────── */}
      {layer === "structure" && (
        <g>
          {/* Magnetic field — rotating concentric arcs */}
          {[0.40, 0.62, 0.85, 1.08, 1.32].map((r, i) => (
            <circle key={i}
              cx={0} cy={0} r={r}
              fill="none"
              stroke="hsla(285,55%,78%,0.32)"
              strokeWidth={0.0035}
              strokeDasharray={`${0.022 + i * 0.006} ${0.045}`}
              transform={`rotate(${tick * 3 + i * 7})`} />
          ))}
          {/* Stellar streams — sweeping arcs in halo */}
          {Array.from({ length: 5 }).map((_, i) => {
            const baseA = i * (Math.PI * 2) / 5 + 0.4;
            const pts: string[] = [];
            for (let k = 0; k <= 40; k++) {
              const t = k / 40;
              const r = 1.1 + Math.sin(t * Math.PI) * 0.35;
              const a = baseA + t * 1.1;
              pts.push(`${k === 0 ? "M" : "L"}${(Math.cos(a) * r).toFixed(3)},${(Math.sin(a) * r).toFixed(3)}`);
            }
            return (
              <path key={i} d={pts.join(" ")}
                fill="none"
                stroke="hsla(45,85%,82%,0.45)"
                strokeWidth={0.005}
                strokeDasharray="0.014 0.022" />
            );
          })}
          {/* Globular clusters */}
          {globulars.map((g, i) => (
            <g key={i}>
              <circle cx={g.x} cy={g.y} r={g.r * 2.4}
                fill="hsla(45,85%,80%,0.18)" />
              <circle cx={g.x} cy={g.y} r={g.r}
                fill="hsla(45,90%,90%,0.95)" />
            </g>
          ))}
          {/* Galactic center — Sgr A* dual pulse */}
          <circle cx={0} cy={0}
            r={0.04 + (tick % 2) * 0.18}
            fill="none"
            stroke="hsla(48,100%,82%,0.7)"
            strokeWidth={0.004}
            opacity={1 - ((tick % 2) / 2)} />
          <circle cx={0} cy={0}
            r={0.04 + ((tick + 1) % 2) * 0.18}
            fill="none"
            stroke="hsla(48,100%,82%,0.5)"
            strokeWidth={0.003}
            opacity={1 - (((tick + 1) % 2) / 2)} />
          <text x={0} y={-HALO_R + 0.06} fontSize="0.036" textAnchor="middle"
            fill="hsla(285,65%,84%,0.85)" style={{ letterSpacing: "0.2em" }}>
            MAGNETIC FIELD · STELLAR STREAMS · GLOBULARS
          </text>
        </g>
      )}

      {/* ── Sun (always) ── */}
      <g>
        <circle cx={sunX} cy={sunY} r={0.06} fill="url(#g-sun)" />
        <circle cx={sunX} cy={sunY} r={0.014} fill="hsla(50,100%,95%,1)" />
        <circle cx={sunX} cy={sunY} r={0.026} fill="none"
          stroke="hsla(48,100%,85%,0.55)" strokeWidth={0.003} />
      </g>

      {/* ── Scale bar ── */}
      <g opacity={0.5} transform={`translate(${-VB + 0.18}, ${VB - 0.18})`}>
        <line x1={0} y1={0} x2={0.4} y2={0} stroke="hsla(0,0%,100%,0.6)" strokeWidth={0.005} />
        <line x1={0} y1={-0.012} x2={0} y2={0.012} stroke="hsla(0,0%,100%,0.6)" strokeWidth={0.005} />
        <line x1={0.4} y1={-0.012} x2={0.4} y2={0.012} stroke="hsla(0,0%,100%,0.6)" strokeWidth={0.005} />
        <text x={0.2} y={-0.035} fontSize="0.034" textAnchor="middle"
          fill="hsla(0,0%,100%,0.65)" style={{ letterSpacing: "0.15em" }}>
          20,000 ly
        </text>
      </g>

      {/* ── Compass / galactic north ── */}
      <g opacity={0.45} transform={`translate(${VB - 0.22}, ${-VB + 0.22})`}>
        <circle cx={0} cy={0} r={0.085} fill="none"
          stroke="hsla(0,0%,100%,0.4)" strokeWidth={0.003} />
        <line x1={0} y1={0} x2={0} y2={-0.07} stroke="hsla(0,0%,100%,0.7)" strokeWidth={0.004} />
        <text x={0} y={-0.085} fontSize="0.03" textAnchor="middle"
          fill="hsla(0,0%,100%,0.75)" style={{ letterSpacing: "0.2em" }}>NGP</text>
      </g>
    </svg>
  );
};
