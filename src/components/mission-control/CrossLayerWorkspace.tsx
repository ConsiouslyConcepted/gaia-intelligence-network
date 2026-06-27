import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Activity, AlertTriangle, Layers } from "lucide-react";

import { HudPanel } from "./MissionShell";
import {
  computeCouplings,
  TIMEFRAMES,
  couplingColorHue,
  anomalyColorHue,
  type CouplingMetric,
  type Timeframe,
} from "@/lib/harmonics/liveCouplings";
import type { Evidence } from "@/lib/harmonics/crossLayer";

// Five intelligence layers as NESTED SHELLS — inner = smallest scale (Planetary),
// outer = largest scale (Cosmological). The order encodes the hierarchy.
const LAYERS = [
  { key: "Planetary",    label: "Planetary",    hue: 150, route: "/planetary",           scale: "10⁷ m" },
  { key: "Solar",        label: "Solar",        hue: 45,  route: "/planetary?view=hgs",  scale: "10¹³ m" },
  { key: "Stellar",      label: "Stellar",      hue: 280, route: "/stellar",             scale: "10¹⁷ m" },
  { key: "Galactic",     label: "Galactic",     hue: 200, route: "/galactic",            scale: "10²¹ m" },
  { key: "Cosmological", label: "Cosmological", hue: 15,  route: "/cosmological",        scale: "10²⁶ m" },
] as const;
type LayerKey = (typeof LAYERS)[number]["key"];
const LAYER_INDEX: Record<LayerKey, number> = LAYERS.reduce(
  (acc, l, i) => ({ ...acc, [l.key]: i }), {} as Record<LayerKey, number>,
);

const GROUP_TO_LAYERS: Record<string, [LayerKey, LayerKey]> = {
  "Planetary ↔ Solar":       ["Planetary", "Solar"],
  "Solar ↔ Stellar":         ["Solar", "Stellar"],
  "Stellar ↔ Galactic":      ["Stellar", "Galactic"],
  "Galactic ↔ Cosmological": ["Galactic", "Cosmological"],
  "Harmonic & Mathematical": ["Planetary", "Cosmological"],
};

const layerColor = (h: number, a = 0.95) => `hsla(${h},75%,72%,${a})`;
const tierLabel = (e: Evidence) =>
  e === "measured" ? "Measured" : e === "statistical" ? "Statistical" : "Exploratory";

// ───── Geometry: nested shells ─────
const W = 760;
const H = 620;
const CX = W / 2;
const CY = H / 2;
// Non-linear radii — wider gap outward emphasizes order-of-magnitude jumps.
const SHELL_R: Record<LayerKey, number> = {
  Planetary:    54,
  Solar:        102,
  Stellar:      158,
  Galactic:     220,
  Cosmological: 286,
};

interface Edge {
  i: number;
  metric: CouplingMetric;
  la: LayerKey;
  lb: LayerKey;
  angle: number;        // radians, where the chord sits around the wheel
  pa: { x: number; y: number };
  pb: { x: number; y: number };
  d: string;
  mid: { x: number; y: number };
}

const CrossLayerWorkspace = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<Timeframe>("90d");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0);
  const [filterLayer, setFilterLayer] = useState<LayerKey | "all">("all");
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);

  const metrics = useMemo(() => computeCouplings(timeframe), [timeframe]);

  // Distribute pairings around the wheel, but reserve the top arc (around 12 o'clock,
  // ±18°) for the shell labels so chords don't collide with the labels column.
  const edges: Edge[] = useMemo(() => {
    const n = metrics.length;
    const startDeg = 18;          // skip top label band
    const endDeg = 342;           // back to just left of top
    const span = endDeg - startDeg;
    return metrics.map((metric, i) => {
      const deg = startDeg + (span * (i + 0.5)) / n;
      const angle = ((deg - 90) * Math.PI) / 180; // -90° so 0° points up
      const [la, lb] = GROUP_TO_LAYERS[metric.pairing.group] ?? ["Planetary", "Solar"];
      const ra = SHELL_R[la];
      const rb = SHELL_R[lb];
      const pa = { x: CX + ra * Math.cos(angle), y: CY + ra * Math.sin(angle) };
      const pb = { x: CX + rb * Math.cos(angle), y: CY + rb * Math.sin(angle) };
      // Gentle tangential bend so co-located radial chords aren't a hard straight line.
      const midR = (ra + rb) / 2;
      const tangentialOffset = 4; // degrees of side-arc bend
      const bendAngle = angle + (tangentialOffset * Math.PI) / 180;
      const mid = { x: CX + midR * Math.cos(bendAngle), y: CY + midR * Math.sin(bendAngle) };
      const d = `M ${pa.x} ${pa.y} Q ${mid.x} ${mid.y} ${pb.x} ${pb.y}`;
      return { i, metric, la, lb, angle, pa, pb, d, mid };
    });
  }, [metrics]);

  const visibleEdges = useMemo(() => {
    return edges.filter((e) => {
      if (filterLayer !== "all" && e.la !== filterLayer && e.lb !== filterLayer) return false;
      if (showAnomaliesOnly && e.metric.anomaly === "normal") return false;
      return true;
    });
  }, [edges, filterLayer, showAnomaliesOnly]);

  const couplingsPerLayer = useMemo(() => {
    const d: Record<string, number> = {};
    visibleEdges.forEach((e) => {
      d[e.la] = (d[e.la] ?? 0) + 1;
      d[e.lb] = (d[e.lb] ?? 0) + 1;
    });
    return d;
  }, [visibleEdges]);

  const anomalyCounts = useMemo(() => {
    const c = { normal: 0, weak: 0, strong: 0, "sign-flip": 0, missing: 0 };
    metrics.forEach((m) => { c[m.anomaly]++; });
    return c;
  }, [metrics]);
  const totalAnomalies = anomalyCounts.weak + anomalyCounts.strong + anomalyCounts["sign-flip"];

  const active = selectedIdx != null
    ? edges.find((e) => e.i === selectedIdx)?.metric ?? metrics[0]
    : null;
  const hovered = hoverIdx != null ? edges.find((e) => e.i === hoverIdx) : null;

  const openInEngine = () => {
    if (!active) return;
    const params = new URLSearchParams({
      mode: "cross",
      a: active.pairing.a,
      b: active.pairing.b,
    });
    navigate(`/harmonics?${params.toString()}`);
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-[1400px] mx-auto pb-4">
        {/* ───── Header ───── */}
        <HudPanel className="p-5 mb-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/55">
                Workspace 03
              </div>
              <h2 className="text-[15px] font-bold tracking-[0.15em] uppercase text-foreground/95 mt-1">
                Cross-Layer Intelligence
              </h2>
              <p className="text-[11px] text-muted-foreground/75 mt-1.5 max-w-2xl leading-relaxed">
                Each ring is a layer of the nested cosmos — Planetary at the core, Cosmological at the
                rim. Chords cross between rings to show measurable harmonic couplings, weighted by live
                correlation strength.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/55 mr-1">
                  Window
                </span>
                {TIMEFRAMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTimeframe(t.id)}
                    className="px-2.5 py-1 rounded-full text-[8px] tracking-[0.18em] uppercase font-semibold transition-all"
                    style={{
                      background: timeframe === t.id ? "hsla(210,50%,18%,0.7)" : "transparent",
                      border: `1px solid ${timeframe === t.id ? "hsla(200,60%,65%,0.45)" : "hsla(220,20%,35%,0.4)"}`,
                      color: timeframe === t.id ? "hsla(0,0%,98%,0.95)" : "hsla(220,15%,70%,0.8)",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAnomaliesOnly((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] tracking-[0.18em] uppercase font-semibold transition-all"
                style={{
                  background: showAnomaliesOnly ? "hsla(30,60%,20%,0.55)" : "transparent",
                  border: `1px solid ${showAnomaliesOnly ? "hsla(35,80%,60%,0.55)" : "hsla(220,20%,35%,0.4)"}`,
                  color: showAnomaliesOnly ? "hsla(35,85%,75%,0.95)" : "hsla(220,15%,70%,0.8)",
                }}
              >
                <AlertTriangle size={9} />
                Anomalies only · {totalAnomalies}
              </button>
            </div>
          </div>
        </HudPanel>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
          {/* ───── Nested-shell canvas ───── */}
          <HudPanel className="p-4">
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="text-[8px] uppercase tracking-[0.22em] text-muted-foreground/55 flex items-center gap-2">
                <Layers size={11} />
                Nested Cosmos · Harmonic Couplings
              </div>
              <div className="flex items-center gap-3 text-[8px] tracking-[0.16em] uppercase">
                <span className="flex items-center gap-1.5 text-muted-foreground/75">
                  <span className="inline-block rounded-full" style={{ width: 14, height: 2.6, background: layerColor(150, 0.9) }} />
                  Strong<span className="font-mono text-muted-foreground/55 ml-0.5">·{metrics.filter(m => m.liveTier === "measured").length}</span>
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground/75">
                  <span className="inline-block rounded-full" style={{ width: 14, height: 1.8, background: layerColor(200, 0.9) }} />
                  Moderate<span className="font-mono text-muted-foreground/55 ml-0.5">·{metrics.filter(m => m.liveTier === "statistical").length}</span>
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground/75">
                  <span className="inline-block rounded-full" style={{ width: 14, height: 1.2, background: layerColor(280, 0.9) }} />
                  Weak<span className="font-mono text-muted-foreground/55 ml-0.5">·{metrics.filter(m => m.liveTier === "exploratory").length}</span>
                </span>
              </div>
            </div>

            <div className="relative">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
                <defs>
                  <radialGradient id="bgGlow" cx="50%" cy="50%" r="65%">
                    <stop offset="0%" stopColor="hsla(220,45%,12%,0.55)" />
                    <stop offset="100%" stopColor="hsla(228,55%,4%,0)" />
                  </radialGradient>
                  {LAYERS.map((l) => (
                    <radialGradient key={l.key} id={`shell-${l.key}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={`hsla(${l.hue},75%,55%,0)`} />
                      <stop offset="92%" stopColor={`hsla(${l.hue},75%,55%,0)`} />
                      <stop offset="98%" stopColor={`hsla(${l.hue},80%,65%,0.18)`} />
                      <stop offset="100%" stopColor={`hsla(${l.hue},80%,65%,0)`} />
                    </radialGradient>
                  ))}
                </defs>

                <rect x="0" y="0" width={W} height={H} fill="url(#bgGlow)" />

                {/* ── Shells (outer-to-inner so labels of inner shells aren't covered) ── */}
                {[...LAYERS].reverse().map((l) => {
                  const r = SHELL_R[l.key];
                  const isFiltered = filterLayer === l.key;
                  const isDimmed = filterLayer !== "all" && !isFiltered;
                  const opacity = isDimmed ? 0.35 : 1;
                  const count = couplingsPerLayer[l.key] ?? 0;
                  // Label sits at 12 o'clock just outside the ring (between this shell
                  // and the next one outward). For the outermost, push slightly outside.
                  const labelY = CY - r - 8;
                  return (
                    <g key={l.key} style={{ cursor: "pointer", opacity, transition: "opacity 250ms" }}
                      onClick={() => setFilterLayer((v) => (v === l.key ? "all" : l.key))}>
                      <title>{`Focus ${l.label} couplings`}</title>

                      {/* halo wash that fades inward — the "shell" feel */}
                      <circle cx={CX} cy={CY} r={r + 6} fill={`url(#shell-${l.key})`} />

                      {/* ring border */}
                      <circle
                        cx={CX} cy={CY} r={r}
                        fill="none"
                        stroke={layerColor(l.hue, isFiltered ? 0.95 : 0.55)}
                        strokeWidth={isFiltered ? 1.6 : 1}
                        strokeDasharray={isFiltered ? undefined : "2 5"}
                        style={{ filter: `drop-shadow(0 0 8px ${layerColor(l.hue, 0.35)})` }}
                      />

                      {/* tick marks every 30° */}
                      {Array.from({ length: 12 }).map((_, i) => {
                        const a = (i * Math.PI) / 6;
                        const x1 = CX + (r - 2) * Math.cos(a);
                        const y1 = CY + (r - 2) * Math.sin(a);
                        const x2 = CX + (r + 2) * Math.cos(a);
                        const y2 = CY + (r + 2) * Math.sin(a);
                        return (
                          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke={layerColor(l.hue, 0.35)} strokeWidth="0.6" />
                        );
                      })}

                      {/* label chip at 12 o'clock */}
                      <g transform={`translate(${CX}, ${labelY})`}>
                        <rect x={-58} y={-9} width="116" height="18" rx="9"
                          fill="hsla(225,55%,6%,0.92)"
                          stroke={layerColor(l.hue, isFiltered ? 1 : 0.65)}
                          strokeWidth={isFiltered ? 1.4 : 0.9}
                        />
                        <text x={0} y={-1} textAnchor="middle" fontSize="8.5" fontWeight="700"
                          fill="hsla(0,0%,98%,0.95)" letterSpacing="0.16em"
                          style={{ textTransform: "uppercase" }}>
                          {l.label}
                        </text>
                        <text x={0} y={7.5} textAnchor="middle" fontSize="6.5" fontFamily="monospace"
                          fill={layerColor(l.hue, 0.8)} letterSpacing="0.12em">
                          {l.scale} · {count} active
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* ── Center: Earth / core marker ── */}
                <g>
                  <circle cx={CX} cy={CY} r={18} fill="hsla(225,55%,7%,0.85)" stroke="hsla(150,70%,55%,0.45)" strokeWidth="0.8" />
                  <circle cx={CX} cy={CY} r={4} fill="hsla(150,70%,65%,0.95)">
                    <animate attributeName="r" values="3;5;3" dur="3.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="3.4s" repeatCount="indefinite" />
                  </circle>
                  <text x={CX} y={CY + 14} textAnchor="middle" fontSize="6.5" fontFamily="monospace"
                    fill="hsla(150,40%,75%,0.7)" letterSpacing="0.18em">
                    OBSERVER
                  </text>
                </g>

                {/* ── Coupling chords (radial, crossing nested shells) ── */}
                {visibleEdges.map((e) => {
                  const m = e.metric;
                  const isHover = hoverIdx === e.i;
                  const isSel = selectedIdx === e.i;
                  const dim = (hoverIdx != null && !isHover) || (selectedIdx != null && !isSel && hoverIdx == null);
                  const tierHue = couplingColorHue(m.liveTier);
                  const anomHue = anomalyColorHue(m.anomaly);
                  // width by |r|
                  const w = (0.8 + m.absR * 3.2) * (isSel ? 1.4 : isHover ? 1.2 : 1);
                  const strokeColor = anomHue != null
                    ? `hsla(${anomHue},85%,68%,0.95)`
                    : `hsla(${tierHue},78%,72%,0.92)`;
                  const dashed = m.anomaly === "sign-flip" || m.anomaly === "missing";
                  const dur = 3 + (1 - m.absR) * 5;
                  // # of shells the chord traverses — visual evidence of nesting depth
                  const span = Math.abs(LAYER_INDEX[e.la] - LAYER_INDEX[e.lb]);
                  return (
                    <g key={e.i} style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoverIdx(e.i)}
                      onMouseLeave={() => setHoverIdx((v) => (v === e.i ? null : v))}
                      onClick={() => setSelectedIdx(e.i)}>
                      {(isSel || isHover) && (
                        <path d={e.d} fill="none" stroke={strokeColor}
                          strokeWidth={w + 6} opacity={0.32}
                          style={{ filter: "blur(4px)" }} />
                      )}
                      <path
                        d={e.d}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={w}
                        strokeDasharray={dashed ? "4 4" : undefined}
                        opacity={dim ? 0.18 : isSel ? 1 : isHover ? 0.95 : 0.78}
                        style={{ transition: "opacity 200ms" }}
                      />
                      {/* endpoint pucks on the rings */}
                      <circle cx={e.pa.x} cy={e.pa.y} r={isSel ? 3.4 : 2.4} fill={strokeColor}
                        opacity={dim ? 0.25 : 1}
                        style={{ filter: `drop-shadow(0 0 4px ${strokeColor})` }} />
                      <circle cx={e.pb.x} cy={e.pb.y} r={isSel ? 3.4 : 2.4} fill={strokeColor}
                        opacity={dim ? 0.25 : 1}
                        style={{ filter: `drop-shadow(0 0 4px ${strokeColor})` }} />
                      {/* flow particle */}
                      {m.absR > 0.15 && (
                        <circle r={isSel ? 2.6 : 1.8} fill={strokeColor}
                          opacity={dim ? 0.2 : 0.95}
                          style={{ filter: `drop-shadow(0 0 4px ${strokeColor})` }}>
                          <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={e.d} />
                        </circle>
                      )}
                      {/* anomaly marker */}
                      {m.anomaly !== "normal" && (
                        <g transform={`translate(${e.mid.x}, ${e.mid.y})`} pointerEvents="none">
                          <circle r="6.5" fill="hsla(225,50%,7%,0.95)" stroke={strokeColor} strokeWidth="1.2" />
                          <text textAnchor="middle" y="2.2" fontSize="7" fontWeight="700" fill={strokeColor}>!</text>
                        </g>
                      )}
                      {/* invisible hit area */}
                      <path d={e.d} fill="none" stroke="transparent" strokeWidth={18} />
                      {/* "spans N shells" badge on hover/select for cross-scale chords */}
                      {(isHover || isSel) && span >= 2 && (
                        <g transform={`translate(${e.mid.x}, ${e.mid.y - 14})`} pointerEvents="none">
                          <rect x={-26} y={-7} width="52" height="14" rx="7"
                            fill="hsla(225,55%,6%,0.92)" stroke={strokeColor} strokeWidth="0.8" />
                          <text textAnchor="middle" y="3" fontSize="7" fontFamily="monospace"
                            fill={strokeColor} letterSpacing="0.12em">
                            SPANS {span}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* hover tooltip */}
                {hovered && (() => {
                  const m = hovered.metric;
                  const text = `${m.pairing.label} · r=${Number.isFinite(m.r) ? m.r.toFixed(2) : "—"}`;
                  const w = Math.min(340, text.length * 5.6 + 24);
                  // Position outside the outermost ring along the chord angle.
                  const r = SHELL_R.Cosmological + 28;
                  const tx = CX + r * Math.cos(hovered.angle);
                  const ty = CY + r * Math.sin(hovered.angle);
                  return (
                    <g transform={`translate(${tx - w / 2}, ${ty - 11})`} pointerEvents="none">
                      <rect x="0" y="0" width={w} height="22" rx="4"
                        fill="hsla(225,50%,7%,0.95)"
                        stroke={`hsla(${couplingColorHue(m.liveTier)},75%,70%,0.6)`} strokeWidth="1" />
                      <text x={w / 2} y="14" textAnchor="middle" fontSize="9"
                        fill="hsla(0,0%,98%,0.95)" letterSpacing="0.05em">
                        {text}
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            <div className="px-2 pt-3 flex items-center justify-between text-[9px] tracking-[0.15em] uppercase text-muted-foreground/60">
              <span className="flex items-center gap-1.5">
                <Activity size={10} className="text-foreground/60" />
                {visibleEdges.length} of {edges.length} couplings shown
              </span>
              <span>click a ring to focus a layer · click a chord to inspect · ! marks anomaly</span>
            </div>
          </HudPanel>

          {/* ───── Detail rail ───── */}
          <HudPanel className="p-5 flex flex-col gap-4">
            {filterLayer !== "all" && (() => {
              const layer = LAYERS.find((l) => l.key === filterLayer)!;
              return (
                <div className="rounded-lg p-3 border"
                  style={{ background: `hsla(${layer.hue},40%,10%,0.45)`, borderColor: layerColor(layer.hue, 0.45) }}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[8px] uppercase tracking-[0.22em] text-muted-foreground/65">
                        Focused Layer
                      </div>
                      <div className="text-[13px] font-bold tracking-[0.12em] uppercase mt-0.5"
                        style={{ color: layerColor(layer.hue, 1) }}>
                        {layer.label}
                      </div>
                      <div className="text-[8px] tracking-[0.16em] uppercase text-muted-foreground/65 mt-0.5 font-mono">
                        {layer.scale} · shell {LAYER_INDEX[layer.key] + 1} / {LAYERS.length}
                      </div>
                    </div>
                    <button
                      onClick={() => setFilterLayer("all")}
                      className="text-[8px] tracking-[0.18em] uppercase text-muted-foreground/70 hover:text-foreground/90 px-2 py-1 rounded border border-border/40"
                    >
                      Clear
                    </button>
                  </div>
                  <button
                    onClick={() => navigate(layer.route)}
                    className="mt-3 flex items-center justify-between w-full px-3 py-2 rounded-md border transition-all hover:bg-foreground/[0.05]"
                    style={{ background: "hsla(240,25%,8%,0.5)", borderColor: layerColor(layer.hue, 0.4) }}
                  >
                    <span className="text-[9px] tracking-[0.18em] uppercase font-semibold text-foreground/90">
                      Open {layer.label} Dashboard
                    </span>
                    <ArrowRight size={12} className="text-foreground/75" />
                  </button>
                </div>
              );
            })()}

            <div className="text-[8px] uppercase tracking-[0.22em] text-muted-foreground/55">
              Selected Coupling
            </div>

            {active ? (
              <>
                <div>
                  <div className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground/65">
                    {active.pairing.group}
                  </div>
                  <h3 className="text-[15px] font-bold tracking-[0.06em] text-foreground/95 mt-1 leading-tight">
                    {active.pairing.label}
                  </h3>
                </div>

                {/* Live metric block */}
                <div className="rounded-lg p-3 border border-border/40"
                  style={{ background: "hsla(225,35%,9%,0.55)" }}>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/65">
                        Live correlation · {TIMEFRAMES.find((t) => t.id === timeframe)?.label} window
                      </div>
                      <div className="text-[24px] font-bold font-mono mt-1 leading-none"
                        style={{ color: `hsla(${couplingColorHue(active.liveTier)},80%,75%,1)` }}>
                        {Number.isFinite(active.r) ? `${active.r >= 0 ? "+" : ""}${active.r.toFixed(2)}` : "—"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/65">Lag</div>
                      <div className="text-[12px] font-mono text-foreground/90 mt-0.5">
                        {active.lag} <span className="text-muted-foreground/55 text-[9px]">samp</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full mt-3 overflow-hidden"
                    style={{ background: "hsla(225,30%,15%,0.7)" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(2, active.absR * 100)}%`,
                        background: `hsla(${couplingColorHue(active.liveTier)},80%,65%,0.95)`,
                        boxShadow: `0 0 8px hsla(${couplingColorHue(active.liveTier)},80%,65%,0.6)`,
                      }} />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[8px] uppercase tracking-[0.18em]">
                    <span className="text-muted-foreground/60">
                      Expected: <span className="text-foreground/80">{tierLabel(active.pairing.expected)}</span>
                    </span>
                    <span className="text-muted-foreground/60">
                      Live: <span style={{ color: `hsla(${couplingColorHue(active.liveTier)},80%,75%,1)` }}>{tierLabel(active.liveTier)}</span>
                    </span>
                  </div>
                </div>

                {/* Anomaly */}
                {active.anomaly !== "normal" && (() => {
                  const hue = anomalyColorHue(active.anomaly) ?? 30;
                  const label = active.anomaly === "sign-flip" ? "Sign Flip"
                    : active.anomaly === "weak" ? "Below Expected"
                    : active.anomaly === "strong" ? "Above Expected"
                    : "Missing Data";
                  return (
                    <div className="rounded-md p-2.5 border flex items-start gap-2"
                      style={{ background: `hsla(${hue},60%,12%,0.55)`, borderColor: `hsla(${hue},80%,60%,0.55)` }}>
                      <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" style={{ color: `hsla(${hue},85%,72%,1)` }} />
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.18em] font-semibold" style={{ color: `hsla(${hue},85%,80%,1)` }}>
                          Anomaly · {label}
                        </div>
                        <div className="text-[10px] text-muted-foreground/85 mt-0.5 leading-relaxed">
                          {active.anomalyNote}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <p className="text-[11px] leading-relaxed text-muted-foreground/85">
                  {active.pairing.note}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md p-2.5 border border-border/30" style={{ background: "hsla(240,20%,10%,0.5)" }}>
                    <div className="text-[7px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1">Inner / Dataset A</div>
                    <div className="text-[11px] font-semibold text-foreground/90 leading-tight">{active.a?.label ?? active.pairing.a}</div>
                    <div className="text-[8px] tracking-[0.15em] uppercase text-muted-foreground/55 mt-1">{active.a?.scope}</div>
                  </div>
                  <div className="rounded-md p-2.5 border border-border/30" style={{ background: "hsla(240,20%,10%,0.5)" }}>
                    <div className="text-[7px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1">Outer / Dataset B</div>
                    <div className="text-[11px] font-semibold text-foreground/90 leading-tight">{active.b?.label ?? active.pairing.b}</div>
                    <div className="text-[8px] tracking-[0.15em] uppercase text-muted-foreground/55 mt-1">{active.b?.scope}</div>
                  </div>
                </div>

                <button
                  onClick={openInEngine}
                  className="mt-auto flex items-center justify-between w-full px-4 py-2.5 rounded-lg border transition-all duration-300 hover:bg-foreground/[0.04]"
                  style={{
                    background: "hsla(240,25%,8%,0.5)",
                    borderColor: "hsla(220,30%,55%,0.4)",
                    boxShadow: "0 0 18px hsla(210,70%,60%,0.12)",
                  }}>
                  <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-foreground/90">
                    Inspect in Harmonics Engine
                  </span>
                  <ArrowRight size={14} className="text-foreground/75" />
                </button>
              </>
            ) : (
              <p className="text-[11px] text-muted-foreground/65">
                Select a chord to inspect a coupling.
              </p>
            )}
          </HudPanel>
        </div>
      </div>
    </div>
  );
};

export default CrossLayerWorkspace;
