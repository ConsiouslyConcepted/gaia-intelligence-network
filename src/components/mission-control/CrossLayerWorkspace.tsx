import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Network as NetworkIcon, Zap } from "lucide-react";

import { HudPanel } from "./MissionShell";
import { SUGGESTED_PAIRINGS, type Evidence } from "@/lib/harmonics/crossLayer";
import { getDataset } from "@/lib/harmonics/datasets";

// Five intelligence layers laid out around a circle.
const LAYERS = [
  { key: "Planetary",    label: "Planetary",    hue: 150 },
  { key: "Solar",        label: "Solar",        hue: 45  },
  { key: "Stellar",      label: "Stellar",      hue: 280 },
  { key: "Galactic",     label: "Galactic",     hue: 200 },
  { key: "Cosmological", label: "Cosmological", hue: 15  },
] as const;

type LayerKey = (typeof LAYERS)[number]["key"];
const layerColor = (h: number, a = 0.95) => `hsla(${h},75%,72%,${a})`;

const GROUP_TO_LAYERS: Record<string, [LayerKey, LayerKey]> = {
  "Planetary ↔ Solar":       ["Planetary", "Solar"],
  "Solar ↔ Stellar":         ["Solar", "Stellar"],
  "Stellar ↔ Galactic":      ["Stellar", "Galactic"],
  "Galactic ↔ Cosmological": ["Galactic", "Cosmological"],
  "Harmonic & Mathematical": ["Planetary", "Cosmological"],
};

const EVIDENCE_STYLE: Record<Evidence, { hue: number; width: number; label: string; dur: number }> = {
  measured:    { hue: 150, width: 2.6, label: "Measured",    dur: 3.2 },
  statistical: { hue: 200, width: 1.9, label: "Statistical", dur: 4.6 },
  exploratory: { hue: 280, width: 1.2, label: "Exploratory", dur: 6.8 },
};

const W = 760;
const H = 520;
const CX = W / 2;
const CY = H / 2 + 8;
const R = 195;

const nodePos = (i: number) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / LAYERS.length;
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
};
const NODE_POS: Record<LayerKey, { x: number; y: number }> = LAYERS.reduce(
  (acc, l, i) => ({ ...acc, [l.key]: nodePos(i) }),
  {} as Record<LayerKey, { x: number; y: number }>,
);

const CrossLayerWorkspace = () => {
  const navigate = useNavigate();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0);
  const [filterEvidence, setFilterEvidence] = useState<Evidence | "all">("all");
  const [filterLayer, setFilterLayer] = useState<LayerKey | "all">("all");

  const edges = useMemo(() => {
    return SUGGESTED_PAIRINGS.map((p, i) => {
      const [la, lb] = GROUP_TO_LAYERS[p.group] ?? ["Planetary", "Solar"];
      const pa = NODE_POS[la];
      const pb = NODE_POS[lb];
      const mx = (pa.x + pb.x) / 2;
      const my = (pa.y + pb.y) / 2;
      const dx = mx - CX;
      const dy = my - CY;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const curveX = mx + (dx / len) * 36;
      const curveY = my + (dy / len) * 36;
      const d = `M ${pa.x} ${pa.y} Q ${curveX} ${curveY} ${pb.x} ${pb.y}`;
      return { ...p, i, la, lb, pa, pb, d };
    }).filter((e) => {
      if (filterEvidence !== "all" && e.expected !== filterEvidence) return false;
      if (filterLayer !== "all" && e.la !== filterLayer && e.lb !== filterLayer) return false;
      return true;
    });
  }, [filterEvidence, filterLayer]);

  const degree = useMemo(() => {
    const d: Record<string, number> = {};
    edges.forEach((e) => {
      d[e.la] = (d[e.la] ?? 0) + 1;
      d[e.lb] = (d[e.lb] ?? 0) + 1;
    });
    return d;
  }, [edges]);

  const evidenceCounts = useMemo(() => {
    const c: Record<Evidence, number> = { measured: 0, statistical: 0, exploratory: 0 };
    edges.forEach((e) => { c[e.expected]++; });
    return c;
  }, [edges]);

  const active = selectedIdx != null ? SUGGESTED_PAIRINGS[selectedIdx] : null;
  const activeA = active ? getDataset(active.a) : null;
  const activeB = active ? getDataset(active.b) : null;
  const hovered = hoverIdx != null ? edges.find((e) => e.i === hoverIdx) : null;

  const openInEngine = () => {
    if (!active) return;
    navigate(`/harmonics?mode=cross`);
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-[1400px] mx-auto pb-4">
        <HudPanel className="p-5 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/55">
                Workspace 03
              </div>
              <h2 className="text-[15px] font-bold tracking-[0.15em] uppercase text-foreground/95 mt-1">
                Cross-Layer Intelligence
              </h2>
              <p className="text-[11px] text-muted-foreground/75 mt-1.5 max-w-2xl leading-relaxed">
                The living network of relationships between intelligence layers. Each edge is a measurable
                or statistical coupling — click to inspect or open it in the Harmonics Engine.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(["all", "measured", "statistical", "exploratory"] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => setFilterEvidence(e)}
                  className="px-2.5 py-1 rounded-full text-[8px] tracking-[0.18em] uppercase font-semibold transition-all"
                  style={{
                    background: filterEvidence === e ? "hsla(210,50%,18%,0.7)" : "transparent",
                    border: `1px solid ${filterEvidence === e ? "hsla(200,60%,65%,0.45)" : "hsla(220,20%,35%,0.4)"}`,
                    color: filterEvidence === e ? "hsla(0,0%,98%,0.95)" : "hsla(220,15%,70%,0.8)",
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </HudPanel>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
          {/* Network canvas */}
          <HudPanel className="p-4">
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="text-[8px] uppercase tracking-[0.22em] text-muted-foreground/55 flex items-center gap-2">
                <NetworkIcon size={11} />
                Resonance Network
              </div>
              <div className="flex items-center gap-4 text-[8px] tracking-[0.16em] uppercase">
                {(["measured", "statistical", "exploratory"] as Evidence[]).map((e) => {
                  const s = EVIDENCE_STYLE[e];
                  return (
                    <span key={e} className="flex items-center gap-1.5 text-muted-foreground/75">
                      <span
                        className="inline-block rounded-full"
                        style={{
                          width: 14, height: s.width,
                          background: layerColor(s.hue, 0.9),
                          boxShadow: `0 0 6px ${layerColor(s.hue, 0.6)}`,
                        }}
                      />
                      {s.label}
                      <span className="font-mono text-muted-foreground/55 ml-0.5">·{evidenceCounts[e]}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
                <defs>
                  {/* radial node glow */}
                  <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="hsla(210,90%,75%,0.55)" />
                    <stop offset="60%" stopColor="hsla(210,80%,65%,0.18)" />
                    <stop offset="100%" stopColor="hsla(210,80%,70%,0)" />
                  </radialGradient>
                  {/* radial backdrop */}
                  <radialGradient id="bgGlow" cx="50%" cy="50%" r="65%">
                    <stop offset="0%" stopColor="hsla(220,45%,12%,0.55)" />
                    <stop offset="100%" stopColor="hsla(228,55%,4%,0)" />
                  </radialGradient>
                  {/* edge gradients per evidence */}
                  {(["measured", "statistical", "exploratory"] as Evidence[]).map((e) => {
                    const s = EVIDENCE_STYLE[e];
                    return (
                      <linearGradient key={e} id={`edge-${e}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%"  stopColor={layerColor(s.hue, 0.15)} />
                        <stop offset="50%" stopColor={layerColor(s.hue, 0.95)} />
                        <stop offset="100%" stopColor={layerColor(s.hue, 0.15)} />
                      </linearGradient>
                    );
                  })}
                  {/* layer node fill gradient */}
                  {LAYERS.map((l) => (
                    <radialGradient key={l.key} id={`node-${l.key}`} cx="50%" cy="40%" r="60%">
                      <stop offset="0%"  stopColor={`hsla(${l.hue},70%,32%,0.95)`} />
                      <stop offset="100%" stopColor="hsla(225,55%,5%,0.98)" />
                    </radialGradient>
                  ))}
                  {/* scanning sweep */}
                  <linearGradient id="sweep" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"  stopColor="hsla(200,80%,70%,0)" />
                    <stop offset="50%" stopColor="hsla(200,80%,75%,0.2)" />
                    <stop offset="100%" stopColor="hsla(200,80%,70%,0)" />
                  </linearGradient>
                </defs>

                {/* backdrop */}
                <rect x="0" y="0" width={W} height={H} fill="url(#bgGlow)" />

                {/* concentric rotating guides */}
                <g style={{ transformOrigin: `${CX}px ${CY}px` }}>
                  <circle cx={CX} cy={CY} r={R + 56} fill="none" stroke="hsla(220,30%,55%,0.07)" strokeWidth="1" />
                  <circle cx={CX} cy={CY} r={R + 30} fill="none" stroke="hsla(220,30%,55%,0.12)" strokeWidth="1" strokeDasharray="2 6" />
                  <circle cx={CX} cy={CY} r={R - 28} fill="none" stroke="hsla(220,30%,55%,0.08)" strokeWidth="1" strokeDasharray="1 4" />
                  <circle cx={CX} cy={CY} r={R - 70} fill="none" stroke="hsla(220,30%,55%,0.05)" />
                  {/* rotating tick marks ring */}
                  <g>
                    {Array.from({ length: 36 }).map((_, i) => {
                      const a = (i * Math.PI * 2) / 36;
                      const x1 = CX + (R + 48) * Math.cos(a);
                      const y1 = CY + (R + 48) * Math.sin(a);
                      const x2 = CX + (R + 56) * Math.cos(a);
                      const y2 = CY + (R + 56) * Math.sin(a);
                      return (
                        <line
                          key={i}
                          x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke={i % 9 === 0 ? "hsla(200,70%,80%,0.5)" : "hsla(220,30%,55%,0.18)"}
                          strokeWidth={i % 9 === 0 ? 1.2 : 0.6}
                        />
                      );
                    })}
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from={`0 ${CX} ${CY}`}
                      to={`360 ${CX} ${CY}`}
                      dur="120s"
                      repeatCount="indefinite"
                    />
                  </g>
                </g>

                {/* center node */}
                <g>
                  <circle cx={CX} cy={CY} r={42} fill="hsla(225,55%,7%,0.9)" stroke="hsla(220,40%,60%,0.4)" strokeWidth="1" />
                  <circle cx={CX} cy={CY} r={4} fill="hsla(200,90%,80%,0.9)">
                    <animate attributeName="r" values="3;6;3" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <text x={CX} y={CY + 22} textAnchor="middle" fontSize="7" fontFamily="monospace"
                    fill="hsla(220,15%,70%,0.7)" letterSpacing="0.18em">
                    NEXUS
                  </text>
                </g>

                {/* Edges */}
                {edges.map((e) => {
                  const s = EVIDENCE_STYLE[e.expected];
                  const isHover = hoverIdx === e.i;
                  const isSel = selectedIdx === e.i;
                  const dim = (hoverIdx != null && !isHover) || (selectedIdx != null && !isSel && hoverIdx == null);
                  const w = isSel ? s.width + 1.4 : isHover ? s.width + 0.8 : s.width;
                  return (
                    <g key={e.i} style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoverIdx(e.i)}
                      onMouseLeave={() => setHoverIdx((v) => (v === e.i ? null : v))}
                      onClick={() => setSelectedIdx(e.i)}>
                      {/* halo */}
                      {(isSel || isHover) && (
                        <path d={e.d} fill="none" stroke={layerColor(s.hue, 0.35)}
                          strokeWidth={w + 6} opacity={0.45}
                          style={{ filter: `blur(4px)` }} />
                      )}
                      {/* main edge with gradient */}
                      <path
                        d={e.d}
                        fill="none"
                        stroke={`url(#edge-${e.expected})`}
                        strokeWidth={w}
                        opacity={dim ? 0.25 : isSel ? 1 : isHover ? 0.95 : 0.7}
                        style={{ transition: "opacity 200ms" }}
                      />
                      {/* flowing particle */}
                      <circle r={isSel ? 3.2 : 2.2} fill={layerColor(s.hue, 1)}
                        opacity={dim ? 0.2 : 0.95}
                        style={{ filter: `drop-shadow(0 0 4px ${layerColor(s.hue, 0.9)})` }}>
                        <animateMotion dur={`${s.dur}s`} repeatCount="indefinite" path={e.d} />
                      </circle>
                      {/* secondary lagging particle for measured/statistical */}
                      {e.expected !== "exploratory" && (
                        <circle r={1.4} fill={layerColor(s.hue, 0.7)} opacity={dim ? 0.15 : 0.7}>
                          <animateMotion dur={`${s.dur}s`} repeatCount="indefinite" path={e.d} begin={`${s.dur / 2}s`} />
                        </circle>
                      )}
                      {/* invisible hit area */}
                      <path d={e.d} fill="none" stroke="transparent" strokeWidth={18} />
                    </g>
                  );
                })}

                {/* Nodes */}
                {LAYERS.map((l) => {
                  const p = NODE_POS[l.key];
                  const deg = degree[l.key] ?? 0;
                  const maxDeg = Math.max(1, ...Object.values(degree));
                  const rNode = 26 + Math.min(14, (deg / maxDeg) * 14);
                  const isFiltered = filterLayer === l.key;
                  const isDimmed = filterLayer !== "all" && !isFiltered;
                  return (
                    <g key={l.key} style={{ cursor: "pointer", opacity: isDimmed ? 0.35 : 1, transition: "opacity 250ms" }}
                      onClick={() => setFilterLayer((v) => (v === l.key ? "all" : l.key))}>
                      {/* outer glow halo */}
                      <circle cx={p.x} cy={p.y} r={rNode + 22} fill="url(#nodeGlow)" opacity={isFiltered ? 0.95 : 0.45} />
                      {/* pulse ring */}
                      <circle cx={p.x} cy={p.y} r={rNode} fill="none" stroke={layerColor(l.hue, 0.7)} strokeWidth="1">
                        <animate attributeName="r" values={`${rNode};${rNode + 14};${rNode}`} dur="4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.7;0;0.7" dur="4s" repeatCount="indefinite" />
                      </circle>
                      {/* node fill */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={rNode}
                        fill={`url(#node-${l.key})`}
                        stroke={layerColor(l.hue, isFiltered ? 1 : 0.85)}
                        strokeWidth={isFiltered ? 2.4 : 1.6}
                        style={{ filter: `drop-shadow(0 0 12px ${layerColor(l.hue, 0.55)})` }}
                      />
                      {/* inner ring */}
                      <circle cx={p.x} cy={p.y} r={rNode - 6} fill="none" stroke={layerColor(l.hue, 0.3)} strokeWidth="0.8" />
                      <text x={p.x} y={p.y - 2} textAnchor="middle" fontSize="10" fontWeight="700"
                        fill="hsla(0,0%,98%,0.97)"
                        style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        {l.label}
                      </text>
                      <text x={p.x} y={p.y + 12} textAnchor="middle" fontSize="8" fontFamily="monospace"
                        fill={layerColor(l.hue, 0.85)} letterSpacing="0.1em">
                        {deg} EDGES
                      </text>
                    </g>
                  );
                })}

                {/* hover tooltip */}
                {hovered && (
                  <g pointerEvents="none">
                    {(() => {
                      const mx = (hovered.pa.x + hovered.pb.x) / 2;
                      const my = (hovered.pa.y + hovered.pb.y) / 2;
                      const dx = mx - CX;
                      const dy = my - CY;
                      const len = Math.sqrt(dx * dx + dy * dy) || 1;
                      const tx = mx + (dx / len) * 56;
                      const ty = my + (dy / len) * 56;
                      const text = hovered.label;
                      const w = Math.min(260, text.length * 6 + 24);
                      return (
                        <g transform={`translate(${tx - w / 2}, ${ty - 14})`}>
                          <rect x="0" y="0" width={w} height="22" rx="4"
                            fill="hsla(225,50%,7%,0.95)" stroke={layerColor(EVIDENCE_STYLE[hovered.expected].hue, 0.6)} strokeWidth="1" />
                          <text x={w / 2} y="14" textAnchor="middle" fontSize="9"
                            fill="hsla(0,0%,98%,0.95)" letterSpacing="0.05em">
                            {text}
                          </text>
                        </g>
                      );
                    })()}
                  </g>
                )}
              </svg>
            </div>

            <div className="px-2 pt-3 flex items-center justify-between text-[9px] tracking-[0.15em] uppercase text-muted-foreground/60">
              <span className="flex items-center gap-1.5">
                <Zap size={10} className="text-foreground/60" />
                {edges.length} active couplings
              </span>
              <span>click any edge to inspect · click a node to filter</span>
            </div>
          </HudPanel>

          {/* Detail */}
          <HudPanel className="p-5 flex flex-col gap-4">
            <div className="text-[8px] uppercase tracking-[0.22em] text-muted-foreground/55">
              Selected Coupling
            </div>
            {active ? (
              <>
                <div>
                  <div className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground/65">
                    {active.group}
                  </div>
                  <h3 className="text-[15px] font-bold tracking-[0.06em] text-foreground/95 mt-1 leading-tight">
                    {active.label}
                  </h3>
                </div>

                <div
                  className="px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 self-start text-[8px] tracking-[0.18em] uppercase font-semibold"
                  style={{
                    background: layerColor(EVIDENCE_STYLE[active.expected].hue, 0.14),
                    border: `1px solid ${layerColor(EVIDENCE_STYLE[active.expected].hue, 0.6)}`,
                    color: layerColor(EVIDENCE_STYLE[active.expected].hue, 1),
                  }}
                >
                  Expected: {EVIDENCE_STYLE[active.expected].label}
                </div>

                <p className="text-[11px] leading-relaxed text-muted-foreground/85">
                  {active.note}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md p-2.5 border border-border/30"
                    style={{ background: "hsla(240,20%,10%,0.5)" }}>
                    <div className="text-[7px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1">
                      Dataset A
                    </div>
                    <div className="text-[11px] font-semibold text-foreground/90 leading-tight">
                      {activeA?.label ?? active.a}
                    </div>
                    <div className="text-[8px] tracking-[0.15em] uppercase text-muted-foreground/55 mt-1">
                      {activeA?.scope}
                    </div>
                  </div>
                  <div className="rounded-md p-2.5 border border-border/30"
                    style={{ background: "hsla(240,20%,10%,0.5)" }}>
                    <div className="text-[7px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1">
                      Dataset B
                    </div>
                    <div className="text-[11px] font-semibold text-foreground/90 leading-tight">
                      {activeB?.label ?? active.b}
                    </div>
                    <div className="text-[8px] tracking-[0.15em] uppercase text-muted-foreground/55 mt-1">
                      {activeB?.scope}
                    </div>
                  </div>
                </div>

                <button
                  onClick={openInEngine}
                  className="mt-auto flex items-center justify-between w-full px-4 py-2.5 rounded-lg border transition-all duration-300 hover:bg-foreground/[0.04]"
                  style={{
                    background: "hsla(240,25%,8%,0.5)",
                    borderColor: "hsla(220,30%,55%,0.4)",
                    boxShadow: "0 0 18px hsla(210,70%,60%,0.12)",
                  }}
                >
                  <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-foreground/90">
                    Open in Harmonics Engine
                  </span>
                  <ArrowRight size={14} className="text-foreground/75" />
                </button>
              </>
            ) : (
              <p className="text-[11px] text-muted-foreground/65">
                Select an edge to inspect a coupling.
              </p>
            )}
          </HudPanel>
        </div>
      </div>
    </div>
  );
};

export default CrossLayerWorkspace;
