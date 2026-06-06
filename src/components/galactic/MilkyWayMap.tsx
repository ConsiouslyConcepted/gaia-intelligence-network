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

  const VB = 2.1;

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

      {/* ─────────── ENVIRONMENT layer ───────────
          Galactic-scale ISM features + a circular magnifier centered on the Sun
          showing the Local Bubble at proper scale (~600 ly → mag radius). */}
      {layer === "environment" && (() => {
        const MAG_R = 0.68;                  // larger inset radius for readable local structures
        const MAG_CX = -1.24;                // lower-left negative space beside galaxy
        const MAG_CY = 0.28;
        // Log distance mapping so 4 ly → inner, 300 ly → outer edge
        const LY_MIN = 3, LY_MAX = 320;
        const lyToMag = (ly: number) => {
          const clamped = Math.max(LY_MIN, Math.min(LY_MAX, Math.abs(ly)));
          const t = Math.log(clamped / LY_MIN) / Math.log(LY_MAX / LY_MIN);
          return t * (MAG_R - 0.04) * Math.sign(ly || 1);
        };
        const lyToMagR = (ly: number) => Math.abs(lyToMag(ly));

        // Real-ish bearings (galactic longitude ℓ) and distances of bright nearby stars
        const NEARBY = [
          { name: "α Cen",       ly: 4.4,   ell: 316, hue: 45,  mag: 1.0 },
          { name: "Barnard's",   ly: 6.0,   ell: 31,  hue: 18,  mag: 0.5 },
          { name: "Sirius",      ly: 8.6,   ell: 227, hue: 210, mag: 1.4 },
          { name: "Procyon",     ly: 11.4,  ell: 213, hue: 50,  mag: 0.9 },
          { name: "Altair",      ly: 16.7,  ell: 47,  hue: 200, mag: 0.8 },
          { name: "Vega",        ly: 25.0,  ell: 67,  hue: 210, mag: 1.1 },
          { name: "Fomalhaut",   ly: 25.1,  ell: 20,  hue: 200, mag: 0.9 },
          { name: "Pollux",      ly: 33.7,  ell: 192, hue: 25,  mag: 0.9 },
          { name: "Arcturus",    ly: 36.7,  ell: 15,  hue: 30,  mag: 1.0 },
          { name: "Aldebaran",   ly: 65.0,  ell: 181, hue: 18,  mag: 1.0 },
          { name: "Regulus",     ly: 79.0,  ell: 226, hue: 215, mag: 1.0 },
          { name: "Spica",       ly: 250.0, ell: 316, hue: 220, mag: 1.2 },
        ];

        // Polar helper: (galactic longitude °, distance ly) → (x, y) in mag frame
        const polarLy = (ell: number, ly: number): [number, number] => {
          const a = ((90 - ell) * Math.PI) / 180;
          const r = lyToMagR(ly);
          return [Math.cos(a) * r, -Math.sin(a) * r];
        };

        // Irregular Local Bubble outline (cavity ~300 ly across, asymmetric)
        const bubblePts = Array.from({ length: 48 }).map((_, i) => {
          const a = (i / 48) * Math.PI * 2;
          const wob = 1
            + Math.sin(a * 3 + 0.6) * 0.18
            + Math.sin(a * 5 - 1.2) * 0.10
            + Math.cos(a * 2 + 2.1) * 0.12;
          const r = lyToMagR(150 * wob);
          return `${i === 0 ? "M" : "L"}${(Math.cos(a) * r).toFixed(3)},${(Math.sin(a) * r).toFixed(3)}`;
        }).join(" ") + " Z";

        return (
          <g>
            {/* ─── Galactic-scale ISM context ─── */}
            {/* Gould Belt (ring of nearby OB associations, tilted) */}
            <g opacity={0.6} transform={`translate(${sunX},${sunY}) rotate(18)`}>
              <ellipse cx={0} cy={0} rx={0.13} ry={0.07} fill="none"
                stroke="hsla(195,80%,80%,0.55)" strokeWidth={0.0035}
                strokeDasharray="0.015 0.012" />
              <text x={0} y={-0.085} fontSize="0.022" textAnchor="middle"
                fill="hsla(195,70%,85%,0.7)" style={{ letterSpacing: "0.18em" }}>
                GOULD BELT
              </text>
            </g>
            {/* Nearby giant molecular clouds (Aquila Rift, Taurus, Orion) */}
            {[
              { dx:  0.10, dy:  0.05, rx: 0.05, ry: 0.025, rot: -25, name: "AQUILA RIFT" },
              { dx: -0.13, dy: -0.02, rx: 0.04, ry: 0.018, rot:  18, name: "TAURUS MC" },
              { dx: -0.06, dy:  0.13, rx: 0.045, ry: 0.022, rot: -10, name: "ORION MC" },
            ].map((c, i) => (
              <g key={i} transform={`translate(${sunX + c.dx},${sunY + c.dy}) rotate(${c.rot})`}>
                <ellipse cx={0} cy={0} rx={c.rx} ry={c.ry}
                  fill="hsla(18,55%,18%,0.55)"
                  stroke="hsla(18,50%,40%,0.5)" strokeWidth={0.0025} />
                <text x={0} y={c.ry + 0.02} fontSize="0.018" textAnchor="middle"
                  fill="hsla(20,55%,70%,0.7)" style={{ letterSpacing: "0.18em" }}>
                  {c.name}
                </text>
              </g>
            ))}
            {/* Interstellar magnetic field — flowing arcs across the local region */}
            {Array.from({ length: 7 }).map((_, i) => {
              const off = (i - 3) * 0.07;
              const pts: string[] = [];
              for (let k = 0; k <= 30; k++) {
                const t = k / 30;
                const x = sunX - 0.35 + t * 0.7;
                const y = sunY + off + Math.sin(t * Math.PI * 2 + tick * 0.4 + i) * 0.012;
                pts.push(`${k === 0 ? "M" : "L"}${x.toFixed(3)},${y.toFixed(3)}`);
              }
              return (
                <path key={i} d={pts.join(" ")}
                  fill="none"
                  stroke="hsla(280,60%,75%,0.30)"
                  strokeWidth={0.0028}
                  strokeDasharray="0.012 0.018" />
              );
            })}
            {/* Cosmic ray streamers from nearby supernova remnants */}
            {Array.from({ length: 18 }).map((_, i) => {
              const a = ((i * 137.5 + tick * 18) % 360) * Math.PI / 180;
              const len = 0.42 + ((i * 11) % 30) / 100;
              const prog = ((tick * 0.28 + i * 0.13) % 1);
              const x1 = sunX + Math.cos(a) * len;
              const y1 = sunY + Math.sin(a) * len;
              const x2 = sunX + Math.cos(a) * len * (1 - prog);
              const y2 = sunY + Math.sin(a) * len * (1 - prog);
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="hsla(195,85%,78%,0.45)" strokeWidth={0.0035}
                  strokeLinecap="round" />
              );
            })}
            {/* Loop I superbubble (adjacent to Local Bubble, Sco-Cen origin) */}
            <circle cx={sunX - 0.085} cy={sunY + 0.04} r={0.075}
              fill="hsla(265,55%,55%,0.10)"
              stroke="hsla(265,65%,80%,0.45)" strokeWidth={0.003}
              strokeDasharray="0.012 0.014" />
            <text x={sunX - 0.085} y={sunY + 0.13} fontSize="0.020" textAnchor="middle"
              fill="hsla(265,60%,82%,0.75)" style={{ letterSpacing: "0.18em" }}>
              LOOP I
            </text>
            {/* Sun marker indicator on galactic view */}
            <line
              x1={sunX} y1={sunY}
              x2={MAG_CX + MAG_R * 0.74} y2={MAG_CY - MAG_R * 0.48}
              stroke="hsla(180,85%,78%,0.4)" strokeWidth={0.004}
              strokeDasharray="0.016 0.014" />

            {/* ─── MAGNIFIER: zoomed Local Bubble inset ─── */}
            <g>
              {/* outer ring + scale */}
                <circle cx={MAG_CX} cy={MAG_CY} r={MAG_R}
                  fill="hsla(224,48%,8%,0.97)"
                  stroke="hsla(180,78%,78%,0.58)" strokeWidth={0.008} />
              <circle cx={MAG_CX} cy={MAG_CY} r={MAG_R + 0.02}
                fill="none" stroke="hsla(180,70%,70%,0.18)" strokeWidth={0.003} />
              {/* clip everything inside the magnifier */}
              <defs>
                <clipPath id="mag-clip">
                  <circle cx={MAG_CX} cy={MAG_CY} r={MAG_R - 0.005} />
                </clipPath>
              </defs>

              <g clipPath="url(#mag-clip)" transform={`translate(${MAG_CX},${MAG_CY})`}>
                {/* faint backdrop field */}
                <circle cx={0} cy={0} r={MAG_R} fill="url(#g-disk)" opacity={0.72} />

                {/* distance rings — log-spaced (10, 30, 100, 300 ly) */}
                {[10, 30, 100, 300].map((d) => (
                  <g key={d}>
                      <circle cx={0} cy={0} r={lyToMagR(d)} fill="none"
                        stroke="hsla(200,60%,76%,0.34)" strokeWidth={0.0045}
                      strokeDasharray="0.010 0.012" />
                      <text x={lyToMagR(d) + 0.02} y={0.026} fontSize="0.045"
                        fill="hsla(200,72%,88%,0.9)" style={{ letterSpacing: "0.08em" }}>
                      {d} ly
                    </text>
                  </g>
                ))}

                {/* galactic longitude radial ticks */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const ell = i * 30;
                  const a = ((90 - ell) * Math.PI) / 180;
                  const r1 = MAG_R - 0.038;
                  const r2 = MAG_R - 0.020;
                  return (
                    <g key={i}>
                      <line
                        x1={Math.cos(a) * r1} y1={-Math.sin(a) * r1}
                        x2={Math.cos(a) * r2} y2={-Math.sin(a) * r2}
                        stroke="hsla(180,65%,80%,0.58)" strokeWidth={0.004} />
                      <text
                        x={Math.cos(a) * (MAG_R - 0.058)}
                        y={-Math.sin(a) * (MAG_R - 0.058)}
                        fontSize="0.038" textAnchor="middle" dominantBaseline="middle"
                        fill="hsla(180,72%,88%,0.88)"
                        style={{ letterSpacing: "0.04em" }}>
                        ℓ{ell}°
                      </text>
                    </g>
                  );
                })}

                {/* Local Bubble — irregular cavity (~150 ly radius) */}
                <path d={bubblePts} fill="hsla(180,70%,55%,0.12)"
                  stroke="hsla(180,88%,84%,0.92)" strokeWidth={0.007}
                  strokeDasharray="0.018 0.014" />

                {/* Loop I superbubble — center ℓ≈329°, ~130 pc (425 ly) */}
                {(() => {
                  const [lx, ly] = polarLy(329, 220);
                  const rr = lyToMagR(180);
                  return (
                    <g>
                      <circle cx={lx} cy={ly} r={rr}
                        fill="hsla(265,60%,55%,0.1)"
                        stroke="hsla(265,72%,84%,0.75)" strokeWidth={0.005}
                        strokeDasharray="0.014 0.014" />
                      <text x={lx} y={ly - rr - 0.022}
                        fontSize="0.042" textAnchor="middle"
                        fill="hsla(265,72%,88%,0.94)" style={{ letterSpacing: "0.06em" }}>
                        LOOP I
                      </text>
                    </g>
                  );
                })()}

                {/* G-Cloud — symbolic shell around Sun (~15 ly extent) */}
                <ellipse cx={0} cy={0}
                  rx={lyToMagR(15)} ry={lyToMagR(11)}
                  fill="hsla(155,60%,55%,0.18)"
                  stroke="hsla(155,78%,82%,0.82)" strokeWidth={0.0045}
                  strokeDasharray="0.008 0.010" />
                {/* LIC — Local Interstellar Cloud (~7 ly, touching Sun) */}
                <ellipse cx={lyToMagR(3.5)} cy={lyToMagR(2)}
                  rx={lyToMagR(8)} ry={lyToMagR(5)}
                  fill="hsla(190,60%,55%,0.2)"
                  stroke="hsla(190,82%,84%,0.9)" strokeWidth={0.0045} />
                <text x={0} y={-0.055} fontSize="0.048" textAnchor="middle"
                  fill="hsla(50,96%,90%,0.96)" style={{ letterSpacing: "0.06em" }}>
                  SUN
                </text>
                <text x={0} y={0.082} fontSize="0.04" textAnchor="middle"
                  fill="hsla(155,78%,84%,0.9)" style={{ letterSpacing: "0.04em" }}>
                  G-CLOUD
                </text>
                <text x={lyToMagR(3.5)} y={lyToMagR(2) + 0.072} fontSize="0.036" textAnchor="middle"
                  fill="hsla(190,82%,86%,0.92)" style={{ letterSpacing: "0.04em" }}>
                  LIC
                </text>

                {/* Nearby star scatter — accurate longitude, log distance */}
                {NEARBY.map((s, i) => {
                  const [x, y] = polarLy(s.ell, s.ly);
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r={0.022 * s.mag}
                        fill={`hsla(${s.hue},85%,88%,0.58)`} />
                      <circle cx={x} cy={y} r={0.009}
                        fill={`hsla(${s.hue},90%,92%,1)`} />
                      <text x={x + 0.016} y={y - 0.009}
                        fontSize="0.046"
                        fill={`hsla(${s.hue},70%,90%,0.95)`}
                        style={{ letterSpacing: "0.04em" }}>
                        {s.name}
                      </text>
                      <text x={x + 0.016} y={y + 0.018}
                        fontSize="0.032"
                        fill="hsla(0,0%,100%,0.78)"
                        style={{ letterSpacing: "0.04em" }}>
                        {s.ly} ly
                      </text>
                    </g>
                  );
                })}

                {/* Sun — center of magnifier */}
                <circle cx={0} cy={0} r={0.028} fill="url(#g-sun)" />
                <circle cx={0} cy={0} r={0.01} fill="hsla(50,100%,95%,1)" />

                {/* → Galactic Center direction (ℓ=0° = right in our frame) */}
                <g>
                  <line x1={0.03} y1={0} x2={MAG_R - 0.08} y2={0}
                    stroke="hsla(48,95%,82%,0.55)" strokeWidth={0.003}
                    strokeDasharray="0.012 0.010" />
                  <polygon
                    points={`${MAG_R - 0.08},0 ${MAG_R - 0.105},-0.010 ${MAG_R - 0.105},0.010`}
                    fill="hsla(48,95%,82%,0.7)" />
                </g>
              </g>

              {/* Magnifier title */}
              <text x={MAG_CX} y={MAG_CY - MAG_R - 0.04}
                fontSize="0.04" textAnchor="middle"
                fill="hsla(180,85%,88%,0.95)" style={{ letterSpacing: "0.22em" }}>
                LOCAL BUBBLE · SOLAR NEIGHBORHOOD
              </text>
              <text x={MAG_CX} y={MAG_CY + MAG_R + 0.055}
                fontSize="0.028" textAnchor="middle"
                fill="hsla(0,0%,100%,0.64)" style={{ letterSpacing: "0.2em" }}>
                ZOOM ×{Math.round((DISK_R / lyToMag(50_000)))}  ·  Sun in G-Cloud / LIC interface
              </text>
            </g>
          </g>
        );
      })()}

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
