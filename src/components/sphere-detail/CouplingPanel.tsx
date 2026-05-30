import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Sphere, SPHERE_ARRAY, SphereId } from "@/types/spheres";
import { GitBranch, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ExternalLink, Activity } from "lucide-react";
import { useSphereCouplings } from "@/hooks/useSphereCouplings";
import { CouplingDirection, CouplingResult } from "@/lib/sphereCoupling";

interface Props {
  sphere: Sphere;
  accent: string;
}

// Qualitative mechanism strings — kept as the human-readable "why" beneath the live numbers.
const MECHANISMS: Partial<Record<SphereId, Partial<Record<SphereId, string>>>> = {
  geosphere: {
    biosphere: "Soil formation, mineral nutrients, volcanic fertilization",
    magnetosphere: "Core dynamo generates the planetary magnetic field",
    ionosphere: "Seismic-ionospheric coupling via acoustic-gravity waves",
    crystalsphere: "Piezoelectric transduction in crustal mineral lattices",
    noosphere: "Resource extraction, land use, geohazard impact on infrastructure",
    hydrosphere: "Erosion, sediment transport, hydrothermal circulation",
    cryosphere: "Glacial erosion, isostatic rebound, permafrost stability",
  },
  hydrosphere: {
    biosphere: "Marine ecosystems, freshwater habitats, nutrient delivery",
    cryosphere: "Phase exchange — ice melt, ocean freezing, salinity coupling",
    geosphere: "Erosion, sediment transport, hydrothermal circulation",
    ionosphere: "Evaporation drives atmospheric water vapor and convection",
    noosphere: "Water resources, fisheries, shipping, coastal infrastructure",
    magnetosphere: "Ocean current ions interact with the geomagnetic field",
    crystalsphere: "Hydrological pressure modulates crustal resonance",
  },
  cryosphere: {
    hydrosphere: "Ice melt freshens oceans and modulates thermohaline circulation",
    biosphere: "Polar and alpine ecosystems, permafrost carbon stocks",
    geosphere: "Glacial erosion, isostatic rebound, permafrost ground stability",
    ionosphere: "Ice-albedo feedback regulates surface energy budget",
    noosphere: "Sea level rise, water security, polar shipping routes",
    magnetosphere: "Polar ice cover modulates auroral surface absorption",
    crystalsphere: "Cryogenic lattices act as long-memory resonance stores",
  },
  biosphere: {
    geosphere: "Weathering, soil generation, organic sedimentation",
    ionosphere: "Biogenic gas emissions alter atmospheric chemistry",
    noosphere: "Ecosystem services, agriculture, biodiversity pressure",
    magnetosphere: "Field variations affect navigation and migration",
    crystalsphere: "Schumann resonance correlation with biological rhythms",
    hydrosphere: "Marine and freshwater biomass exchanges with water cycle",
    cryosphere: "Polar and alpine biomes track cryosphere extent",
  },
  magnetosphere: {
    ionosphere: "Particle precipitation, field-aligned currents, electrojets",
    biosphere: "Cosmic ray modulation, UV shielding via atmospheric retention",
    crystalsphere: "Field harmonics shape resonance cavity modes",
    geosphere: "Core convection dynamo drives field generation",
    noosphere: "Geomagnetic storms disrupt grids and satellite systems",
    hydrosphere: "Magnetic coupling with ocean ion currents",
    cryosphere: "Polar field geometry shapes cryospheric energy balance",
  },
  ionosphere: {
    magnetosphere: "Ionospheric conductivity modulates magnetospheric currents",
    geosphere: "TEC anomalies observed before major seismic events",
    crystalsphere: "Earth-ionosphere waveguide sustains Schumann resonances",
    noosphere: "GPS, radio propagation, satellite drag",
    biosphere: "UV filtering variations affect surface biology",
    hydrosphere: "Atmospheric water vapor modulates ionospheric layers",
    cryosphere: "Polar ionospheric activity links to cryospheric albedo",
  },
  noosphere: {
    geosphere: "Mining, drilling, construction alter crustal stress",
    biosphere: "Deforestation, pollution, urbanization, conservation",
    ionosphere: "RF emissions, launches, atmospheric chemical injection",
    magnetosphere: "Observation networks monitor space weather",
    crystalsphere: "EM pollution alters natural resonance background",
    hydrosphere: "Water management, fisheries, coastal engineering",
    cryosphere: "Climate forcing reshapes ice extent and sea level",
  },
  crystalsphere: {
    ionosphere: "Resonance cavity boundaries shape EM mode structure",
    magnetosphere: "Harmonic coupling between field and cavity modes",
    geosphere: "Piezoelectric stress-EM conversion in crystalline structures",
    biosphere: "Schumann frequencies correlate with biological timing",
    noosphere: "Subtle field coherence patterns in collective activity",
    hydrosphere: "Water mass distribution shifts resonance loading",
    cryosphere: "Cryogenic lattices anchor long-term phase memory",
  },
};

const DIR_LABEL: Record<CouplingDirection, string> = {
  outgoing: "Leads",
  incoming: "Follows",
  bidirectional: "Locked",
};

function DirIcon({ d, className }: { d: CouplingDirection; className?: string }) {
  if (d === "outgoing") return <ArrowUpRight className={className} />;
  if (d === "incoming") return <ArrowDownLeft className={className} />;
  return <ArrowLeftRight className={className} />;
}

function sphereTone(id: SphereId): string {
  // Monochrome with subtle hue separation — stays inside the project aesthetic.
  const tones: Record<SphereId, string> = {
    geosphere: "hsl(20 12% 72%)",
    hydrosphere: "hsl(200 14% 76%)",
    cryosphere: "hsl(210 10% 84%)",
    biosphere: "hsl(140 10% 74%)",
    magnetosphere: "hsl(230 12% 76%)",
    ionosphere: "hsl(220 10% 78%)",
    noosphere: "hsl(280 10% 76%)",
    crystalsphere: "hsl(40 12% 78%)",
  };
  return tones[id];
}

// Mini dual-sparkline overlay used in the evidence drawer
function DualSpark({ a, b, colorA, colorB, lag }: { a: number[]; b: number[]; colorA: string; colorB: string; lag: number }) {
  const W = 320, H = 64, P = 4;
  const all = [...a, ...b];
  const min = Math.min(...all), max = Math.max(...all);
  const range = Math.max(0.01, max - min);
  const path = (s: number[], shift = 0) =>
    s.map((v, i) => {
      const x = P + ((i + shift) / (s.length - 1)) * (W - 2 * P);
      const y = H - P - ((v - min) / range) * (H - 2 * P);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16">
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={P} x2={W - P} y1={P + (H - 2 * P) * f} y2={P + (H - 2 * P) * f} stroke="hsla(0,0%,100%,0.04)" strokeWidth="0.5" />
      ))}
      <path d={path(b)} fill="none" stroke={colorB} strokeWidth="1.2" opacity="0.55" />
      <path d={path(a, lag * 0.1)} fill="none" stroke={colorA} strokeWidth="1.4" />
    </svg>
  );
}

export function CouplingPanel({ sphere, accent }: Props) {
  const navigate = useNavigate();
  const couplings = useSphereCouplings(sphere.id);
  const [selected, setSelected] = useState<SphereId | null>(null);

  const meanStrength = useMemo(
    () => (couplings.length ? Math.round((couplings.reduce((s, c) => s + c.strength, 0) / couplings.length) * 100) : 0),
    [couplings]
  );
  const strongest = useMemo(() => [...couplings].sort((a, b) => b.strength - a.strength)[0], [couplings]);
  const strongestTarget = strongest ? SPHERE_ARRAY.find((s) => s.id === strongest.target) : null;
  const leading = useMemo(() => couplings.filter((c) => c.direction === "outgoing").length, [couplings]);
  const following = useMemo(() => couplings.filter((c) => c.direction === "incoming").length, [couplings]);

  // FIXED radial layout — canonical sphere order, nodes never swap positions.
  const CX = 250, CY = 250, R = 175;
  const orderedTargets = useMemo(
    () => SPHERE_ARRAY.map((s) => s.id).filter((id) => id !== sphere.id),
    [sphere.id]
  );
  const positions = useMemo(
    () =>
      orderedTargets.map((targetId, i) => {
        const angle = -Math.PI / 2 + (i / Math.max(1, orderedTargets.length)) * Math.PI * 2;
        const link = couplings.find((c) => c.target === targetId);
        return { targetId, link, x: CX + Math.cos(angle) * R, y: CY + Math.sin(angle) * R, angle };
      }),
    [orderedTargets, couplings]
  );

  const stableList = useMemo(
    () => orderedTargets.map((id) => couplings.find((link) => link.target === id)).filter(Boolean) as CouplingResult[],
    [orderedTargets, couplings]
  );

  useEffect(() => {
    if (!couplings.length) return;
    setSelected((current) => (current && couplings.some((link) => link.target === current) ? current : couplings[0].target));
  }, [couplings]);

  const selectedLink = couplings.find((c) => c.target === selected) ?? couplings[0] ?? null;
  const selectedTarget = selectedLink ? SPHERE_ARRAY.find((s) => s.id === selectedLink.target) : null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}12` }}>
            <GitBranch className="w-6 h-6" style={{ color: accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold tracking-wide">Coupling — {sphere.name}</h2>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/45 mt-0.5">
              Live cross-sphere correlation · Lagged Pearson on Intelligence Score · 48-tick window
            </p>
          </div>
          <div className="flex items-stretch gap-2 ml-auto">
            <Stat label="Mean |r|" value={`${meanStrength}%`} accent={accent} />
            <Stat label="Strongest" value={strongestTarget?.name ?? "—"} accent={accent} />
            <Stat label="Leading / Following" value={`${leading} / ${following}`} accent={accent} />
          </div>
        </div>
      </Card>

      {/* Network */}
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold">Live Coupling Network</h3>
            <p className="text-[10px] text-muted-foreground/45 mt-0.5">
              Select one sphere to lock focus · Open its dashboard from the inspector below
            </p>
          </div>
          <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.14em] text-muted-foreground/50">
            <span className="flex items-center gap-1.5"><ArrowUpRight className="w-3 h-3" /> Leads</span>
            <span className="flex items-center gap-1.5"><ArrowLeftRight className="w-3 h-3" /> Locked</span>
            <span className="flex items-center gap-1.5"><ArrowDownLeft className="w-3 h-3" /> Follows</span>
          </div>
        </div>

        {/* How to read */}
        <div className="mb-4 rounded-lg border border-border/15 bg-background/30 p-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] text-muted-foreground/65 leading-relaxed">
          <div>
            <div className="text-[9px] uppercase tracking-[0.14em] text-foreground/70 mb-1">1 · Select a link</div>
            Pick any outer sphere. The highlighted edge becomes the one relationship you are reading right now.
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.14em] text-foreground/70 mb-1">2 · Read strength + lag</div>
            Thickness shows coupling strength. Positive Δt means {sphere.name} <span className="text-foreground/80">leads</span>; negative means it <span className="text-foreground/80">follows</span>.
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.14em] text-foreground/70 mb-1">3 · Check the evidence</div>
            The inspector keeps the two score traces pinned so the view does not move while the live window updates.
          </div>
        </div>


        <div className="relative aspect-square w-full max-w-[600px] mx-auto">
          <svg viewBox="0 0 500 500" className="w-full h-full">
            <defs>
              <radialGradient id="couplingCenterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
                <stop offset="60%" stopColor={accent} stopOpacity="0.06" />
                <stop offset="100%" stopColor={accent} stopOpacity="0" />
              </radialGradient>
              <filter id="couplingGlow">
                <feGaussianBlur stdDeviation="2.5" />
              </filter>
            </defs>

            {[0.33, 0.66, 1].map((f, i) => (
              <circle
                key={i}
                cx={CX}
                cy={CY}
                r={R * f}
                fill="none"
                stroke="hsla(0,0%,100%,0.05)"
                strokeWidth="0.5"
                strokeDasharray="2 4"
              />
            ))}
            {/* Correlation reference labels on outer ring */}
            {[0.33, 0.66, 1].map((f, i) => (
              <text key={`l${i}`} x={CX + R * f + 4} y={CY + 3} fill="hsla(0,0%,100%,0.25)" fontSize="6" fontFamily="ui-monospace, monospace">
                r={f.toFixed(2)}
              </text>
            ))}

            <circle cx={CX} cy={CY} r={95} fill="url(#couplingCenterGlow)" />

            {/* Edges */}
            {positions.map(({ targetId, link, x, y }) => {
              if (!link) return null;
              const color = sphereTone(targetId);
              const isActive = selectedLink?.target === targetId;
              const isDim = selectedLink && !isActive;
              const baseOpacity = 0.16 + link.strength * 0.58;
              const opacity = isActive ? 0.95 : isDim ? 0.12 : baseOpacity;
              const strokeW = 0.6 + link.strength * 2.6;
              const midX = (CX + x) / 2;
              const midY = (CY + y) / 2;

              return (
                <g key={targetId}>
                  {isActive && (
                    <line x1={CX} y1={CY} x2={x} y2={y} stroke={color} strokeWidth={strokeW + 2.5} opacity={0.3} filter="url(#couplingGlow)" />
                  )}
                  <line
                    x1={CX}
                    y1={CY}
                    x2={x}
                    y2={y}
                    stroke={color}
                    strokeWidth={strokeW}
                    opacity={opacity}
                    strokeDasharray={link.direction === "bidirectional" ? "0" : "5 4"}
                    strokeLinecap="round"
                    style={{ transition: "opacity 300ms, stroke-width 300ms" }}
                  />
                  {/* Edge chip — |r| as percent */}
                  <g opacity={isDim ? 0.3 : 1} style={{ transition: "opacity 300ms" }}>
                    <rect
                      x={midX - 16} y={midY - 9} width={32} height={16} rx={8}
                      fill="hsla(240,25%,7%,0.9)"
                      stroke={color} strokeOpacity={0.45} strokeWidth={0.6}
                    />
                    <text x={midX} y={midY + 3} textAnchor="middle" fill={color} fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="600">
                      {Math.round(link.strength * 100)}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Center */}
            <circle cx={CX} cy={CY} r={44} fill="hsla(240,30%,8%,0.95)" stroke={accent} strokeWidth="1.5" />
            <circle
              cx={CX} cy={CY} r={44}
              fill="none" stroke={accent} strokeWidth="1"
              opacity={0.35}
              filter="url(#couplingGlow)"
            />
            <text x={CX} y={CY - 3} textAnchor="middle" fill={accent} fontSize="10" fontWeight="700" letterSpacing="1">
              {sphere.name.toUpperCase()}
            </text>
            <text x={CX} y={CY + 11} textAnchor="middle" fill="hsla(0,0%,100%,0.35)" fontSize="6.5" letterSpacing="2">
              SOURCE
            </text>

            {/* Nodes — fixed radius so layout never reflows */}
            {positions.map(({ targetId, link, x, y }) => {
              const color = sphereTone(targetId);
              const target = SPHERE_ARRAY.find((s) => s.id === targetId);
              const isActive = selectedLink?.target === targetId;
              const isDim = selectedLink && !isActive;
              const NODE_R = 28;
              const pct = link ? Math.round(link.strength * 100) : 0;

              return (
                <g
                  key={targetId}
                  role="button"
                  tabIndex={0}
                  aria-label={`Focus ${target?.name} coupling`}
                  style={{ cursor: "pointer", transition: "opacity 200ms" }}
                  opacity={isDim ? 0.32 : 1}
                  onClick={() => setSelected(targetId)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelected(targetId);
                    }
                  }}
                >
                  {isActive && <circle cx={x} cy={y} r={NODE_R + 9} fill={color} opacity={0.2} filter="url(#couplingGlow)" />}
                  <circle cx={x} cy={y} r={NODE_R} fill="hsla(240,30%,8%,0.92)" stroke={color} strokeWidth={isActive ? "1.8" : "1.3"} />
                  <text x={x} y={y - 4} textAnchor="middle" fill={color} fontSize="9" fontWeight="600">
                    {target?.name}
                  </text>
                  <text x={x} y={y + 7} textAnchor="middle" fill="hsla(0,0%,100%,0.5)" fontSize="6.5" fontFamily="ui-monospace, monospace">
                    {link ? (link.r >= 0 ? "+" : "−") : ""}{pct}%
                  </text>
                  <text x={x} y={y + 16} textAnchor="middle" fill="hsla(0,0%,100%,0.3)" fontSize="6" fontFamily="ui-monospace, monospace">
                    Δt {link && link.lag >= 0 ? "+" : ""}{link?.lag ?? 0}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Evidence strip — stays pinned to the selected relationship */}
        {selectedLink && selectedTarget && (
          <EvidenceStrip
            sourceName={sphere.name}
            targetName={selectedTarget.name}
            link={selectedLink}
            sourceColor={accent}
            targetColor={sphereTone(selectedLink.target)}
            mechanism={
              MECHANISMS[sphere.id]?.[selectedLink.target] ??
              "Cross-sphere relationship inferred from live score correlation."
            }
            onOpen={() => navigate(`/sphere/${selectedLink.target}`)}
          />
        )}
      </Card>

      {/* List */}
      <div className="space-y-2">
        {stableList.map((link) => {
          const color = sphereTone(link.target);
          const target = SPHERE_ARRAY.find((s) => s.id === link.target);
          const pct = Math.round(link.strength * 100);
          const isSelected = selectedLink?.target === link.target;
          const mechanism =
            MECHANISMS[sphere.id]?.[link.target] ??
            "Cross-sphere relationship inferred from live score correlation.";

          return (
            <Card
              key={link.target}
              className="glass-panel rounded-xl p-4 transition-all duration-200 cursor-pointer group"
              style={{
                borderColor: isSelected ? `${color}55` : undefined,
                boxShadow: isSelected ? `0 0 0 1px ${color}33, 0 8px 24px ${color}15` : undefined,
              }}
              onClick={() => setSelected(link.target)}
            >
              <div className="flex items-center gap-4">
                {/* Dial */}
                <div className="relative w-14 h-14 shrink-0">
                  <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                    <circle cx="28" cy="28" r="22" fill="none" stroke="hsla(0,0%,100%,0.06)" strokeWidth="3" />
                    <circle
                      cx="28" cy="28" r="22"
                      fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 22}
                      strokeDashoffset={2 * Math.PI * 22 * (1 - link.strength)}
                      style={{ transition: "stroke-dashoffset 800ms" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                    <span className="text-[11px] font-mono font-bold" style={{ color }}>{pct}</span>
                    <span className="text-[6px] uppercase tracking-[0.1em] text-muted-foreground/40 mt-0.5">|r|</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-semibold text-foreground/80">{sphere.name}</span>
                    <DirIcon d={link.direction} className="w-3 h-3 text-muted-foreground/50" />
                    <span className="text-xs font-semibold" style={{ color }}>{target?.name}</span>
                    <span
                      className="text-[8px] uppercase tracking-[0.14em] px-1.5 py-0.5 rounded border"
                      style={{ color: `${color}cc`, borderColor: `${color}33`, background: `${color}10` }}
                    >
                      {DIR_LABEL[link.direction]}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground/40">
                      r = {link.r >= 0 ? "+" : ""}{link.r.toFixed(2)} · Δt {link.lag >= 0 ? "+" : ""}{link.lag}
                    </span>
                    <button
                      className="ml-auto inline-flex items-center gap-1 rounded-md border border-border/20 bg-background/40 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-muted-foreground/60 transition-colors hover:text-foreground/80"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/sphere/${link.target}`);
                      }}
                    >
                      Open
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground/55 leading-relaxed">{mechanism}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="px-3 py-2 rounded-lg border border-border/15 bg-background/30">
      <div className="text-[8px] uppercase tracking-[0.15em] text-muted-foreground/40">{label}</div>
      <div className="text-sm font-mono font-semibold mt-0.5" style={{ color: accent }}>{value}</div>
    </div>
  );
}

function EvidenceStrip({
  sourceName, targetName, link, sourceColor, targetColor, mechanism, onOpen,
}: {
  sourceName: string;
  targetName: string;
  link: CouplingResult;
  sourceColor: string;
  targetColor: string;
  mechanism: string;
  onOpen: () => void;
}) {
  return (
    <div
      className="mt-4 rounded-lg border p-3 animate-fade-in"
      style={{ borderColor: `${targetColor}33`, background: `linear-gradient(180deg, hsla(240,25%,9%,0.6), hsla(240,30%,6%,0.6))` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60">
          <Activity className="w-3 h-3" />
          Score Co-evolution · 48 ticks
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span style={{ color: sourceColor }}>● {sourceName}</span>
          <span style={{ color: targetColor }}>● {targetName}</span>
          <span className="text-muted-foreground/60">
            r = {link.r >= 0 ? "+" : ""}{link.r.toFixed(2)} · best lag Δt {link.lag >= 0 ? "+" : ""}{link.lag}
          </span>
          <button
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-border/20 bg-background/40 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-muted-foreground/60 transition-colors hover:text-foreground/80"
            onClick={onOpen}
          >
            Open sphere
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
      <DualSpark a={link.sourceSeries} b={link.targetSeries} colorA={sourceColor} colorB={targetColor} lag={link.lag} />
      <p className="text-[10px] text-muted-foreground/50 mt-1.5 leading-relaxed">
        {link.direction === "outgoing" && `${sourceName} leads ${targetName} by ${Math.abs(link.lag)} ticks — its shifts arrive in the target score later.`}
        {link.direction === "incoming" && `${sourceName} follows ${targetName} by ${Math.abs(link.lag)} ticks — the target moves first.`}
        {link.direction === "bidirectional" && `${sourceName} and ${targetName} move in phase — no clear leader at this window.`}
      </p>
      <p className="text-[10px] text-muted-foreground/45 mt-2 leading-relaxed">{mechanism}</p>
    </div>
  );
}
