import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Network as NetworkIcon } from "lucide-react";

import { HudPanel } from "./MissionShell";
import { SUGGESTED_PAIRINGS, type Evidence } from "@/lib/harmonics/crossLayer";
import { getDataset } from "@/lib/harmonics/datasets";

// Five intelligence layers laid out around a circle.
const LAYERS = [
  { key: "Planetary",    label: "Planetary",    color: "hsla(150,70%,70%,0.95)" },
  { key: "Solar",        label: "Solar",        color: "hsla(45,90%,75%,0.95)"  },
  { key: "Stellar",      label: "Stellar",      color: "hsla(280,70%,80%,0.95)" },
  { key: "Galactic",     label: "Galactic",     color: "hsla(200,80%,75%,0.95)" },
  { key: "Cosmological", label: "Cosmological", color: "hsla(15,80%,75%,0.95)"  },
] as const;

type LayerKey = (typeof LAYERS)[number]["key"];

const GROUP_TO_LAYERS: Record<string, [LayerKey, LayerKey]> = {
  "Planetary ↔ Solar":       ["Planetary", "Solar"],
  "Solar ↔ Stellar":         ["Solar", "Stellar"],
  "Stellar ↔ Galactic":      ["Stellar", "Galactic"],
  "Galactic ↔ Cosmological": ["Galactic", "Cosmological"],
  "Harmonic & Mathematical": ["Planetary", "Cosmological"], // visual: bridge across full span
};

const EVIDENCE_STYLE: Record<Evidence, { stroke: string; width: number; label: string }> = {
  measured:     { stroke: "hsla(150,80%,75%,0.85)", width: 2.4, label: "Measured" },
  statistical:  { stroke: "hsla(200,80%,75%,0.75)", width: 1.7, label: "Statistical" },
  exploratory:  { stroke: "hsla(280,55%,75%,0.55)", width: 1.1, label: "Exploratory" },
};

const W = 720;
const H = 460;
const CX = W / 2;
const CY = H / 2 + 10;
const R = 175;

const nodePos = (i: number) => {
  // start at top, go clockwise
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
      return { ...p, i, la, lb, pa: NODE_POS[la], pb: NODE_POS[lb] };
    }).filter((e) => {
      if (filterEvidence !== "all" && e.expected !== filterEvidence) return false;
      if (filterLayer !== "all" && e.la !== filterLayer && e.lb !== filterLayer) return false;
      return true;
    });
  }, [filterEvidence, filterLayer]);

  // Degree per node (within current filter)
  const degree = useMemo(() => {
    const d: Record<string, number> = {};
    edges.forEach((e) => {
      d[e.la] = (d[e.la] ?? 0) + 1;
      d[e.lb] = (d[e.lb] ?? 0) + 1;
    });
    return d;
  }, [edges]);

  const active = selectedIdx != null ? SUGGESTED_PAIRINGS[selectedIdx] : null;
  const activeA = active ? getDataset(active.a) : null;
  const activeB = active ? getDataset(active.b) : null;

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
                or statistical coupling — click to inspect the pairing or open it in the Harmonics Engine.
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
              <div className="flex items-center gap-3 text-[8px] tracking-[0.16em] uppercase">
                {(["measured", "statistical", "exploratory"] as Evidence[]).map((e) => (
                  <span key={e} className="flex items-center gap-1.5 text-muted-foreground/70">
                    <span
                      className="inline-block w-4 h-px"
                      style={{ background: EVIDENCE_STYLE[e].stroke, height: EVIDENCE_STYLE[e].width }}
                    />
                    {EVIDENCE_STYLE[e].label}
                  </span>
                ))}
              </div>
            </div>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
              <defs>
                <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="hsla(210,80%,70%,0.5)" />
                  <stop offset="100%" stopColor="hsla(210,80%,70%,0)" />
                </radialGradient>
              </defs>

              {/* Background circle */}
              <circle cx={CX} cy={CY} r={R + 30} fill="none" stroke="hsla(220,30%,40%,0.08)" />
              <circle cx={CX} cy={CY} r={R - 30} fill="none" stroke="hsla(220,30%,40%,0.06)" />

              {/* Edges */}
              {edges.map((e) => {
                const s = EVIDENCE_STYLE[e.expected];
                const isHover = hoverIdx === e.i;
                const isSel = selectedIdx === e.i;
                const mx = (e.pa.x + e.pb.x) / 2;
                const my = (e.pa.y + e.pb.y) / 2;
                // curve outward from center
                const dx = mx - CX;
                const dy = my - CY;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const curveX = mx + (dx / len) * 30;
                const curveY = my + (dy / len) * 30;
                return (
                  <g key={e.i} style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoverIdx(e.i)}
                    onMouseLeave={() => setHoverIdx((v) => (v === e.i ? null : v))}
                    onClick={() => setSelectedIdx(e.i)}>
                    <path
                      d={`M ${e.pa.x} ${e.pa.y} Q ${curveX} ${curveY} ${e.pb.x} ${e.pb.y}`}
                      fill="none"
                      stroke={s.stroke}
                      strokeWidth={isSel ? s.width + 1.2 : isHover ? s.width + 0.6 : s.width}
                      opacity={isSel ? 1 : isHover ? 0.95 : 0.7}
                      style={{
                        filter: isSel || isHover ? `drop-shadow(0 0 6px ${s.stroke})` : undefined,
                        transition: "all 200ms",
                      }}
                    />
                    {/* invisible wider hit area */}
                    <path
                      d={`M ${e.pa.x} ${e.pa.y} Q ${curveX} ${curveY} ${e.pb.x} ${e.pb.y}`}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={14}
                    />
                  </g>
                );
              })}

              {/* Nodes */}
              {LAYERS.map((l) => {
                const p = NODE_POS[l.key];
                const deg = degree[l.key] ?? 0;
                const rNode = 22 + Math.min(10, deg * 1.2);
                const isFiltered = filterLayer === l.key;
                return (
                  <g key={l.key} style={{ cursor: "pointer" }}
                    onClick={() => setFilterLayer((v) => (v === l.key ? "all" : l.key))}>
                    <circle cx={p.x} cy={p.y} r={rNode + 14} fill="url(#nodeGlow)" opacity={isFiltered ? 0.9 : 0.35} />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={rNode}
                      fill="hsla(225,45%,9%,0.95)"
                      stroke={l.color}
                      strokeWidth={isFiltered ? 2.2 : 1.4}
                      style={{ filter: `drop-shadow(0 0 10px ${l.color.replace("0.95", "0.4")})` }}
                    />
                    <text
                      x={p.x}
                      y={p.y - 2}
                      textAnchor="middle"
                      fontSize={10}
                      fontWeight={700}
                      fill="hsla(0,0%,98%,0.95)"
                      style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
                    >
                      {l.label}
                    </text>
                    <text
                      x={p.x}
                      y={p.y + 12}
                      textAnchor="middle"
                      fontSize={9}
                      fontFamily="monospace"
                      fill="hsla(220,15%,70%,0.8)"
                    >
                      {deg} edges
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="px-2 pt-2 text-[9px] tracking-[0.15em] uppercase text-muted-foreground/55 text-center">
              {edges.length} active couplings · click any edge to inspect · click a node to filter
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
                    background: `${EVIDENCE_STYLE[active.expected].stroke.replace("0.85", "0.18").replace("0.75", "0.18").replace("0.55", "0.18")}`,
                    border: `1px solid ${EVIDENCE_STYLE[active.expected].stroke}`,
                    color: EVIDENCE_STYLE[active.expected].stroke,
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
