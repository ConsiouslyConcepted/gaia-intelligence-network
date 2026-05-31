import { useEffect, useRef, useState } from "react";

export type CosmoLayer = "cmb" | "constants" | "spacetime" | "harmonics";

interface Props {
  layer: CosmoLayer;
}

// Deterministic pseudo-random
const rand = (s: number) => {
  let t = (s + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (((t ^ (t >>> 14)) >>> 0) / 0xffffffff) * 2 - 1;
};

// ────────────────────────── CMB ──────────────────────────
const CMBView = ({ tick }: { tick: number }) => {
  // Build a hex-grid heat map of primordial fluctuations.
  const cells: { x: number; y: number; v: number }[] = [];
  const COLS = 42;
  const ROWS = 24;
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const x = (i / (COLS - 1)) * 2 - 1;
      const y = (j / (ROWS - 1)) * 2 - 1;
      if (x * x + (y * 0.6) ** 2 > 1.05) continue;
      // multi-octave noise
      const v =
        rand(i * 13 + j * 71) * 0.6 +
        rand(Math.floor(i / 3) * 17 + Math.floor(j / 3) * 29) * 0.4 +
        Math.sin(i * 0.4 + j * 0.3 + tick * 0.2) * 0.08;
      cells.push({ x, y: y * 0.6, v: Math.max(-1, Math.min(1, v)) });
    }
  }
  const colorFor = (v: number) => {
    // map -1..1 → cool→warm CMB palette (blue→white→amber)
    if (v < 0) {
      const t = -v;
      return `hsla(${220 - t * 20}, ${60 + t * 20}%, ${30 + (1 - t) * 50}%, 0.95)`;
    }
    const t = v;
    return `hsla(${40 - t * 10}, ${50 + t * 40}%, ${50 + t * 30}%, 0.95)`;
  };

  return (
    <svg viewBox="-1.15 -0.75 2.3 1.5" className="w-full h-full">
      <defs>
        <clipPath id="cmb-clip">
          <ellipse cx="0" cy="0" rx="1.05" ry="0.62" />
        </clipPath>
      </defs>
      <g clipPath="url(#cmb-clip)">
        {cells.map((c, i) => (
          <rect
            key={i}
            x={c.x - 0.027}
            y={c.y - 0.027}
            width={0.054}
            height={0.054}
            fill={colorFor(c.v)}
          />
        ))}
      </g>
      <ellipse
        cx="0" cy="0" rx="1.05" ry="0.62"
        fill="none"
        stroke="hsla(220,30%,55%,0.55)"
        strokeWidth={0.006}
      />
      {/* labels */}
      <text x="-1.05" y="-0.68" fontSize="0.045" fill="hsla(0,0%,100%,0.55)" style={{ letterSpacing: "0.15em" }}>
        T ≈ 2.725 K · ΔT/T ~ 10⁻⁵
      </text>
      <text x="0.45" y="0.71" fontSize="0.04" fill="hsla(0,0%,100%,0.4)" style={{ letterSpacing: "0.15em" }}>
        ALL-SKY MOLLWEIDE · 380,000 yr
      </text>
    </svg>
  );
};

// ────────────────────────── Constants ──────────────────────────
const CONSTANTS = [
  { id: "c", sym: "c", name: "Speed of Light", val: "2.998×10⁸ m/s" },
  { id: "G", sym: "G", name: "Gravitational Constant", val: "6.674×10⁻¹¹" },
  { id: "h", sym: "ℎ", name: "Planck Constant", val: "6.626×10⁻³⁴ J·s" },
  { id: "α", sym: "α", name: "Fine Structure", val: "1/137.036" },
  { id: "kB", sym: "k_B", name: "Boltzmann", val: "1.381×10⁻²³" },
  { id: "Λ", sym: "Λ", name: "Cosmological Constant", val: "1.1×10⁻⁵²" },
];

const ConstantsView = ({ tick }: { tick: number }) => {
  const R = 0.72;
  const nodes = CONSTANTS.map((c, i) => {
    const a = (i / CONSTANTS.length) * Math.PI * 2 - Math.PI / 2;
    return { ...c, x: Math.cos(a) * R, y: Math.sin(a) * R };
  });
  return (
    <svg viewBox="-1.1 -1.1 2.2 2.2" className="w-full h-full">
      {/* central core */}
      <circle cx="0" cy="0" r={0.04 + Math.sin(tick * 1.4) * 0.005} fill="hsla(45,90%,80%,0.95)" />
      <circle cx="0" cy="0" r={0.18} fill="none" stroke="hsla(45,70%,70%,0.18)" strokeWidth={0.004} />
      {/* edges — all-to-all faint */}
      {nodes.map((n, i) =>
        nodes.slice(i + 1).map((m, j) => (
          <line
            key={`${i}-${j}`}
            x1={n.x} y1={n.y} x2={m.x} y2={m.y}
            stroke="hsla(200,40%,60%,0.12)"
            strokeWidth={0.002}
          />
        ))
      )}
      {/* spokes to core */}
      {nodes.map((n, i) => (
        <line
          key={`sp-${i}`}
          x1="0" y1="0" x2={n.x} y2={n.y}
          stroke="hsla(200,50%,70%,0.25)"
          strokeWidth={0.003}
          strokeDasharray="0.015 0.012"
        />
      ))}
      {/* nodes */}
      {nodes.map((n, i) => (
        <g key={n.id}>
          <circle
            cx={n.x} cy={n.y} r={0.085}
            fill="hsla(228,45%,9%,0.95)"
            stroke="hsla(200,60%,70%,0.55)"
            strokeWidth={0.004}
          />
          <text
            x={n.x} y={n.y + 0.015}
            fontSize="0.075"
            textAnchor="middle"
            fill="hsla(45,90%,82%,0.95)"
            fontStyle="italic"
            style={{ fontFamily: "serif" }}
          >
            {n.sym}
          </text>
          <text
            x={n.x} y={n.y + 0.14}
            fontSize="0.038"
            textAnchor="middle"
            fill="hsla(0,0%,100%,0.7)"
            style={{ letterSpacing: "0.1em" }}
          >
            {n.name.toUpperCase()}
          </text>
          <text
            x={n.x} y={n.y + 0.185}
            fontSize="0.032"
            textAnchor="middle"
            fill="hsla(200,50%,75%,0.6)"
            style={{ fontFamily: "monospace" }}
          >
            {n.val}
          </text>
        </g>
      ))}
    </svg>
  );
};

// ────────────────────────── Spacetime ──────────────────────────
const SpacetimeView = ({ tick }: { tick: number }) => {
  // Expanding universe: nested shells + cosmic web filaments
  const filaments: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < 26; i++) {
    const a1 = rand(i * 7) * Math.PI;
    const r1 = 0.2 + Math.abs(rand(i * 11)) * 0.7;
    const a2 = a1 + rand(i * 13) * 0.6;
    const r2 = r1 + rand(i * 17) * 0.25;
    filaments.push({
      x1: Math.cos(a1) * r1, y1: Math.sin(a1) * r1,
      x2: Math.cos(a2) * r2, y2: Math.sin(a2) * r2,
    });
  }
  const nodes = Array.from({ length: 60 }, (_, i) => {
    const a = rand(i * 23) * Math.PI;
    const r = 0.15 + Math.abs(rand(i * 31)) * 0.78;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, s: 0.006 + Math.abs(rand(i * 41)) * 0.012 };
  });
  const shells = [0.28, 0.5, 0.72, 0.92];

  return (
    <svg viewBox="-1.1 -1.1 2.2 2.2" className="w-full h-full">
      {/* expansion shells */}
      {shells.map((r, i) => {
        const breathe = 1 + Math.sin(tick * 0.6 + i * 0.5) * 0.015;
        return (
          <circle
            key={i}
            cx="0" cy="0"
            r={r * breathe}
            fill="none"
            stroke={`hsla(220,55%,${65 - i * 8}%,${0.35 - i * 0.06})`}
            strokeWidth={0.004}
            strokeDasharray="0.02 0.015"
          />
        );
      })}
      {/* filaments */}
      {filaments.map((f, i) => (
        <line
          key={i}
          x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2}
          stroke="hsla(200,50%,65%,0.35)"
          strokeWidth={0.0035}
        />
      ))}
      {/* nodes / galaxy clusters */}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x} cy={n.y} r={n.s}
          fill="hsla(45,80%,80%,0.85)"
        />
      ))}
      {/* center marker */}
      <circle cx="0" cy="0" r={0.018} fill="hsla(0,0%,100%,0.9)" />
      <text x="-1.05" y="-1.02" fontSize="0.045" fill="hsla(0,0%,100%,0.55)" style={{ letterSpacing: "0.15em" }}>
        H₀ ≈ 67.4 km/s/Mpc · Ω_total ≈ 1.00
      </text>
      <text x="0.18" y="1.05" fontSize="0.04" fill="hsla(0,0%,100%,0.4)" style={{ letterSpacing: "0.15em" }}>
        OBSERVABLE UNIVERSE · 93 Gly
      </text>
    </svg>
  );
};

// ────────────────────────── Harmonics ──────────────────────────
const HarmonicsView = ({ tick }: { tick: number }) => {
  // Power spectrum with characteristic acoustic peaks
  const W = 2.0; const H = 1.0;
  const peaks = [0.16, 0.32, 0.48, 0.62, 0.74];
  const amps = [1.0, 0.55, 0.7, 0.4, 0.5];
  const pts: string[] = [];
  const N = 200;
  for (let i = 0; i <= N; i++) {
    const x = i / N;
    let y = 0.15;
    peaks.forEach((p, k) => {
      const sigma = 0.04 + k * 0.005;
      y += amps[k] * Math.exp(-((x - p) ** 2) / (2 * sigma * sigma));
    });
    y += Math.sin(x * 60 + tick * 1.5) * 0.015;
    y += rand(Math.floor(i / 3)) * 0.02;
    const px = -W / 2 + x * W;
    const py = H / 2 - y * 0.7;
    pts.push(`${i === 0 ? "M" : "L"} ${px.toFixed(4)} ${py.toFixed(4)}`);
  }
  const areaPts = `${pts.join(" ")} L ${W / 2} ${H / 2} L ${-W / 2} ${H / 2} Z`;

  // Standing wave overlay (sinusoid)
  const wavePts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const x = i / N;
    const px = -W / 2 + x * W;
    const py = -0.55 + Math.sin(x * Math.PI * 6 - tick * 2) * 0.08 *
      Math.exp(-((x - 0.5) ** 2) / 0.12);
    wavePts.push(`${i === 0 ? "M" : "L"} ${px.toFixed(4)} ${py.toFixed(4)}`);
  }

  return (
    <svg viewBox={`${-W / 2 - 0.08} -0.85 ${W + 0.16} 1.7`} className="w-full h-full">
      {/* baseline grid */}
      {[0.1, 0.3, 0.5, 0.7].map((y, i) => (
        <line key={i}
          x1={-W / 2} y1={H / 2 - y * 0.7}
          x2={W / 2} y2={H / 2 - y * 0.7}
          stroke="hsla(220,30%,55%,0.12)" strokeWidth={0.0025}
        />
      ))}
      {/* standing wave */}
      <path d={wavePts.join(" ")} fill="none" stroke="hsla(200,70%,75%,0.55)" strokeWidth={0.005} />
      <text x={-W / 2} y={-0.7} fontSize="0.045" fill="hsla(200,60%,80%,0.7)" style={{ letterSpacing: "0.15em" }}>
        STANDING WAVE MODE
      </text>

      {/* power spectrum area + line */}
      <path d={areaPts} fill="hsla(45,80%,70%,0.12)" />
      <path d={pts.join(" ")} fill="none" stroke="hsla(45,90%,80%,0.9)" strokeWidth={0.005} />

      {/* peak markers */}
      {peaks.map((p, k) => {
        const px = -W / 2 + p * W;
        return (
          <g key={k}>
            <line x1={px} y1={H / 2 - amps[k] * 0.7 - 0.04} x2={px} y2={H / 2 + 0.02}
              stroke="hsla(200,60%,75%,0.4)" strokeWidth={0.0025} strokeDasharray="0.012 0.01" />
            <text x={px} y={H / 2 + 0.06} fontSize="0.038" textAnchor="middle"
              fill="hsla(0,0%,100%,0.7)" style={{ letterSpacing: "0.1em" }}>
              {k + 1}
            </text>
          </g>
        );
      })}
      <text x={-W / 2} y={H / 2 + 0.14} fontSize="0.04" fill="hsla(0,0%,100%,0.5)" style={{ letterSpacing: "0.15em" }}>
        MULTIPOLE  ℓ  →
      </text>
      <text x={W / 2 - 0.5} y={H / 2 + 0.14} fontSize="0.04" fill="hsla(0,0%,100%,0.5)" style={{ letterSpacing: "0.15em" }}>
        BAO ≈ 150 Mpc
      </text>
    </svg>
  );
};

// ────────────────────────── Stage ──────────────────────────
export const CosmoStage = ({ layer }: Props) => {
  const [tick, setTick] = useState(0);
  const raf = useRef<number>();
  const starSeeds = Array.from({ length: 220 }, (_, i) => ({
    x: rand(i * 19),
    y: rand(i * 31),
    size: 0.003 + Math.abs(rand(i * 47)) * 0.007,
    alpha: 0.15 + Math.abs(rand(i * 61)) * 0.55,
    drift: 0.03 + Math.abs(rand(i * 73)) * 0.06,
  }));
  useEffect(() => {
    const start = performance.now();
    const loop = (now: number) => {
      setTick((now - start) / 1000);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ filter: "drop-shadow(0 0 30px hsla(210,70%,55%,0.18))" }}>
      <svg viewBox="-1.1 -1.1 2.2 2.2" className="absolute inset-0 w-full h-full pointer-events-none">
        {starSeeds.map((star, i) => {
          const x = star.x * 1.95;
          const baseY = star.y * 1.95;
          const y = ((baseY + tick * star.drift + 2.2) % 4.4) - 2.2;
          const alpha = star.alpha * (0.72 + Math.sin(tick * 2 + i * 0.5) * 0.28);
          return <circle key={i} cx={x} cy={y} r={star.size} fill={`hsla(0,0%,100%,${alpha})`} />;
        })}
      </svg>
      {layer === "cmb" && <CMBView tick={tick} />}
      {layer === "constants" && <ConstantsView tick={tick} />}
      {layer === "spacetime" && <SpacetimeView tick={tick} />}
      {layer === "harmonics" && <HarmonicsView tick={tick} />}
    </div>
  );
};
