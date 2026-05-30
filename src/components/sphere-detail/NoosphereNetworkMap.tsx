import { useEffect, useMemo, useState } from "react";
import { useWikipediaTopPages } from "@/hooks/usePlanetaryData";

/**
 * Noosphere — Global Information Network Map.
 *
 * Replaces the 3D Earth on the Noosphere "Live Dynamics" tab.
 * Renders an equirectangular world silhouette with information hubs
 * (major data exchange / coordination centers) and animated flows
 * whose intensity scales with live Wikipedia attention.
 *
 * Strictly read-only — no interaction beyond visual.
 */

interface Hub {
  id: string;
  name: string;
  /** Equirectangular x (0–1, lng -180→180) */
  x: number;
  /** Equirectangular y (0–1, lat 90→-90) */
  y: number;
  weight: number; // baseline weight 0–1
}

// Major info exchange hubs — internet, finance, governance, research.
const HUBS: Hub[] = [
  { id: "ny", name: "New York", x: 0.279, y: 0.273, weight: 0.95 },
  { id: "sf", name: "San Francisco", x: 0.171, y: 0.295, weight: 0.92 },
  { id: "ldn", name: "London", x: 0.499, y: 0.222, weight: 0.94 },
  { id: "ams", name: "Amsterdam", x: 0.514, y: 0.225, weight: 0.78 },
  { id: "fra", name: "Frankfurt", x: 0.524, y: 0.241, weight: 0.82 },
  { id: "par", name: "Paris", x: 0.507, y: 0.236, weight: 0.78 },
  { id: "mos", name: "Moscow", x: 0.604, y: 0.222, weight: 0.7 },
  { id: "dxb", name: "Dubai", x: 0.642, y: 0.323, weight: 0.74 },
  { id: "mum", name: "Mumbai", x: 0.703, y: 0.357, weight: 0.78 },
  { id: "sgp", name: "Singapore", x: 0.787, y: 0.43, weight: 0.86 },
  { id: "hk", name: "Hong Kong", x: 0.819, y: 0.357, weight: 0.84 },
  { id: "tok", name: "Tokyo", x: 0.886, y: 0.299, weight: 0.9 },
  { id: "syd", name: "Sydney", x: 0.92, y: 0.625, weight: 0.7 },
  { id: "sao", name: "São Paulo", x: 0.371, y: 0.652, weight: 0.7 },
  { id: "jhb", name: "Johannesburg", x: 0.578, y: 0.652, weight: 0.6 },
  { id: "lax", name: "Los Angeles", x: 0.18, y: 0.32, weight: 0.84 },
  { id: "sea", name: "Seattle", x: 0.176, y: 0.255, weight: 0.7 },
];

// Backbone fibre links (subset of real undersea + terrestrial routes).
const LINKS: Array<[string, string]> = [
  ["ny", "ldn"], ["ny", "sf"], ["ny", "sao"], ["ny", "fra"],
  ["sf", "tok"], ["sf", "sgp"], ["sf", "sea"],
  ["ldn", "fra"], ["ldn", "ams"], ["ldn", "par"], ["ldn", "mos"], ["ldn", "dxb"],
  ["fra", "mos"], ["fra", "mum"],
  ["dxb", "mum"], ["dxb", "sgp"],
  ["mum", "sgp"],
  ["sgp", "hk"], ["sgp", "syd"],
  ["hk", "tok"],
  ["tok", "syd"],
  ["sao", "jhb"],
  ["jhb", "dxb"],
  ["lax", "sf"], ["lax", "tok"], ["lax", "syd"],
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function NoosphereNetworkMap({
  height = 340,
  accent = "#d4a56a",
}: {
  height?: number;
  accent?: string;
}) {
  const { data: topPages } = useWikipediaTopPages();
  const [t, setT] = useState(0);

  useEffect(() => {
    let raf = 0;
    let start = performance.now();
    const loop = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Live intensity from Wikipedia pageviews (0.4–1.2 typical).
  const intensity = useMemo(() => {
    const total = topPages?.reduce((s: number, p: any) => s + p.views, 0) ?? 0;
    if (!total) return 0.7;
    // Normalize: ~50M total = 1.0
    return Math.min(1.25, Math.max(0.4, total / 50_000_000));
  }, [topPages]);

  const W = 1000;
  const H = 500;

  const hubsById = useMemo(() => {
    const m: Record<string, Hub> = {};
    HUBS.forEach((h) => (m[h.id] = h));
    return m;
  }, []);

  return (
    <div
      style={{ height }}
      className="w-full rounded-xl overflow-hidden relative bg-[hsl(var(--background))]"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        <defs>
          <radialGradient id="noo-bg" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.05" />
            <stop offset="70%" stopColor={accent} stopOpacity="0.01" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="noo-hub" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="1" />
            <stop offset="60%" stopColor={accent} stopOpacity="0.4" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="noo-link" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={accent} stopOpacity="0.05" />
            <stop offset="50%" stopColor={accent} stopOpacity="0.5" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Background wash */}
        <rect width={W} height={H} fill="url(#noo-bg)" />

        {/* Lat/Lng graticule */}
        <g stroke={accent} strokeOpacity="0.06" strokeWidth="0.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`v${i}`} x1={(i + 1) * (W / 13)} y1="0" x2={(i + 1) * (W / 13)} y2={H} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={(i + 1) * (H / 7)} x2={W} y2={(i + 1) * (H / 7)} />
          ))}
        </g>

        {/* Equator */}
        <line
          x1="0"
          y1={H / 2}
          x2={W}
          y2={H / 2}
          stroke={accent}
          strokeOpacity="0.18"
          strokeWidth="0.8"
          strokeDasharray="3 6"
        />

        {/* Backbone links + flow packets */}
        <g>
          {LINKS.map(([a, b], i) => {
            const A = hubsById[a];
            const B = hubsById[b];
            if (!A || !B) return null;
            // Handle antimeridian crossing for cleaner arcs.
            let bx = B.x;
            if (Math.abs(B.x - A.x) > 0.5) {
              bx = B.x + (A.x > B.x ? 1 : -1);
            }
            const x1 = A.x * W;
            const y1 = A.y * H;
            const x2 = bx * W;
            const y2 = B.y * H;
            // Quadratic curve via midpoint pulled toward poles for great-circle feel.
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.18;

            // Packet position along curve (0–1).
            const speed = 0.13 + ((i * 7) % 11) * 0.012;
            const pT = ((t * speed) + i * 0.07) % 1;
            // Quadratic bezier point
            const u = 1 - pT;
            const px = u * u * x1 + 2 * u * pT * mx + pT * pT * x2;
            const py = u * u * y1 + 2 * u * pT * my + pT * pT * y2;

            const pulse = 0.6 + Math.sin(t * 1.4 + i) * 0.4;
            const linkOpacity = 0.25 + intensity * 0.35 * pulse;

            return (
              <g key={`link-${i}`}>
                <path
                  d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                  fill="none"
                  stroke={accent}
                  strokeOpacity={linkOpacity}
                  strokeWidth="0.7"
                />
                {/* Wrap-around twin if crossed antimeridian */}
                {bx !== B.x && (
                  <path
                    d={`M ${(A.x + (bx > 1 ? -1 : 1)) * W} ${y1} Q ${mx + (bx > 1 ? -W : W)} ${my} ${B.x * W} ${y2}`}
                    fill="none"
                    stroke={accent}
                    strokeOpacity={linkOpacity}
                    strokeWidth="0.7"
                  />
                )}
                {/* Flow packet */}
                <circle
                  cx={px}
                  cy={py}
                  r={1.6 + intensity * 1.2}
                  fill={accent}
                  opacity={0.75}
                />
              </g>
            );
          })}
        </g>

        {/* Hubs */}
        <g>
          {HUBS.map((h, i) => {
            const cx = h.x * W;
            const cy = h.y * H;
            const breath = 0.8 + Math.sin(t * 1.1 + i * 0.5) * 0.2;
            const r = 3 + h.weight * 3 * intensity;
            const haloR = r * (2.8 + breath * 1.4);
            return (
              <g key={h.id}>
                <circle cx={cx} cy={cy} r={haloR} fill="url(#noo-hub)" opacity={0.55 * h.weight} />
                <circle cx={cx} cy={cy} r={r} fill={accent} opacity="0.9" />
                <circle cx={cx} cy={cy} r={r * 0.4} fill="#fff" opacity="0.85" />
                <text
                  x={cx + r + 4}
                  y={cy + 3}
                  fill={accent}
                  opacity="0.75"
                  fontSize="9"
                  fontFamily="ui-monospace, SFMono-Regular, monospace"
                  style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                >
                  {h.name}
                </text>
              </g>
            );
          })}
        </g>

        {/* Corner readout */}
        <g opacity="0.55">
          <text
            x="12"
            y="20"
            fill={accent}
            fontSize="9"
            fontFamily="ui-monospace, SFMono-Regular, monospace"
            style={{ textTransform: "uppercase", letterSpacing: "0.14em" }}
          >
            global info backbone · {HUBS.length} hubs · {LINKS.length} links
          </text>
          <text
            x="12"
            y={H - 12}
            fill="hsl(var(--muted-foreground))"
            fontSize="8"
            fontFamily="ui-monospace, SFMono-Regular, monospace"
            opacity="0.6"
            style={{ textTransform: "uppercase", letterSpacing: "0.12em" }}
          >
            flow intensity · {(intensity * 100).toFixed(0)}% · live wikimedia attention
          </text>
        </g>
      </svg>
    </div>
  );
}
