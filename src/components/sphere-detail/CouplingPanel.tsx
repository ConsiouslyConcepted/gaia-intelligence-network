import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Sphere, SPHERE_ARRAY, SphereId } from "@/types/spheres";
import { GitBranch, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from "lucide-react";

interface Props {
  sphere: Sphere;
  accent: string;
}

interface CouplingLink {
  target: SphereId;
  strength: number;
  mechanism: string;
  direction: "outgoing" | "incoming" | "bidirectional";
}

const COUPLING_DATA: Record<SphereId, CouplingLink[]> = {
  geosphere: [
    { target: "biosphere", strength: 0.72, mechanism: "Soil formation, mineral nutrients, volcanic fertilization", direction: "outgoing" },
    { target: "magnetosphere", strength: 0.88, mechanism: "Core dynamo generates the planetary magnetic field", direction: "outgoing" },
    { target: "ionosphere", strength: 0.45, mechanism: "Seismic-ionospheric coupling via acoustic-gravity waves", direction: "outgoing" },
    { target: "crystalsphere", strength: 0.65, mechanism: "Piezoelectric transduction in crustal mineral lattices", direction: "bidirectional" },
    { target: "noosphere", strength: 0.58, mechanism: "Resource extraction, land use, geohazard impact on infrastructure", direction: "incoming" },
  ],
  biosphere: [
    { target: "geosphere", strength: 0.55, mechanism: "Weathering, soil generation, organic sedimentation", direction: "outgoing" },
    { target: "ionosphere", strength: 0.32, mechanism: "Biogenic gas emissions alter atmospheric chemistry", direction: "outgoing" },
    { target: "noosphere", strength: 0.78, mechanism: "Ecosystem services, agriculture, biodiversity under anthropogenic pressure", direction: "bidirectional" },
    { target: "magnetosphere", strength: 0.28, mechanism: "Magnetic field variations affect animal navigation and migration", direction: "incoming" },
    { target: "crystalsphere", strength: 0.42, mechanism: "Schumann resonance correlation with biological rhythms", direction: "incoming" },
  ],
  magnetosphere: [
    { target: "ionosphere", strength: 0.92, mechanism: "Particle precipitation, field-aligned currents, auroral electrojets", direction: "outgoing" },
    { target: "biosphere", strength: 0.35, mechanism: "Cosmological ray modulation, UV shielding via atmospheric retention", direction: "outgoing" },
    { target: "crystalsphere", strength: 0.70, mechanism: "Field harmonic structure shapes resonance cavity modes", direction: "bidirectional" },
    { target: "geosphere", strength: 0.88, mechanism: "Core convection dynamo drives field generation", direction: "incoming" },
    { target: "noosphere", strength: 0.52, mechanism: "Geomagnetic storms disrupt power grids and satellite systems", direction: "outgoing" },
  ],
  ionosphere: [
    { target: "magnetosphere", strength: 0.85, mechanism: "Ionospheric conductivity modulates magnetospheric currents", direction: "bidirectional" },
    { target: "geosphere", strength: 0.40, mechanism: "TEC anomalies observed before major seismic events", direction: "incoming" },
    { target: "crystalsphere", strength: 0.75, mechanism: "Earth-ionosphere waveguide sustains Schumann resonances", direction: "bidirectional" },
    { target: "noosphere", strength: 0.60, mechanism: "GPS degradation, radio propagation, satellite drag", direction: "outgoing" },
    { target: "biosphere", strength: 0.30, mechanism: "UV filtering variations affect surface biological activity", direction: "outgoing" },
  ],
  noosphere: [
    { target: "geosphere", strength: 0.68, mechanism: "Mining, drilling, construction alter crustal stress and surface morphology", direction: "outgoing" },
    { target: "biosphere", strength: 0.82, mechanism: "Deforestation, pollution, urbanization, conservation", direction: "outgoing" },
    { target: "ionosphere", strength: 0.38, mechanism: "RF emissions, rocket launches, atmospheric chemical injection", direction: "outgoing" },
    { target: "magnetosphere", strength: 0.25, mechanism: "Observation networks monitor space weather for mitigation", direction: "outgoing" },
    { target: "crystalsphere", strength: 0.30, mechanism: "EM pollution alters natural resonance background", direction: "outgoing" },
  ],
  hydrosphere: [
    { target: "biosphere", strength: 0.85, mechanism: "Marine ecosystems, freshwater habitats, nutrient delivery", direction: "bidirectional" },
    { target: "cryosphere", strength: 0.88, mechanism: "Phase exchange — ice melt, ocean freezing, salinity coupling", direction: "bidirectional" },
    { target: "geosphere", strength: 0.55, mechanism: "Erosion, sediment transport, hydrothermal circulation", direction: "bidirectional" },
    { target: "ionosphere", strength: 0.35, mechanism: "Evaporation drives atmospheric water vapor and convection", direction: "outgoing" },
    { target: "noosphere", strength: 0.70, mechanism: "Water resources, fisheries, shipping, coastal infrastructure", direction: "bidirectional" },
  ],
  cryosphere: [
    { target: "hydrosphere", strength: 0.88, mechanism: "Ice melt freshens oceans and modulates thermohaline circulation", direction: "bidirectional" },
    { target: "biosphere", strength: 0.62, mechanism: "Polar and alpine ecosystems, permafrost carbon stocks", direction: "bidirectional" },
    { target: "geosphere", strength: 0.45, mechanism: "Glacial erosion, isostatic rebound, permafrost ground stability", direction: "bidirectional" },
    { target: "ionosphere", strength: 0.42, mechanism: "Ice-albedo feedback regulates surface energy budget", direction: "outgoing" },
    { target: "noosphere", strength: 0.55, mechanism: "Sea level rise, water security, polar shipping routes", direction: "outgoing" },
  ],
  crystalsphere: [
    { target: "ionosphere", strength: 0.75, mechanism: "Resonance cavity boundary conditions shape EM mode structure", direction: "bidirectional" },
    { target: "magnetosphere", strength: 0.70, mechanism: "Harmonic coupling between field oscillations and cavity modes", direction: "bidirectional" },
    { target: "geosphere", strength: 0.65, mechanism: "Piezoelectric stress-EM conversion in crystalline structures", direction: "bidirectional" },
    { target: "biosphere", strength: 0.48, mechanism: "Schumann resonance frequencies correlate with biological timing", direction: "outgoing" },
    { target: "noosphere", strength: 0.22, mechanism: "Subtle field coherence patterns in collective activity data", direction: "outgoing" },
  ],
};

const SPHERE_COLORS: Record<SphereId, string> = {
  geosphere: "#cc5533",
  hydrosphere: "#2d7fb8",
  cryosphere: "#bcdfe8",
  biosphere: "#4caf50",
  magnetosphere: "#4466dd",
  ionosphere: "#4488cc",
  noosphere: "#ab47bc",
  crystalsphere: "#d4a56a",
};

const DIR_LABEL: Record<CouplingLink["direction"], string> = {
  outgoing: "Outflow",
  incoming: "Inflow",
  bidirectional: "Bidirectional",
};

function DirIcon({ d, className }: { d: CouplingLink["direction"]; className?: string }) {
  if (d === "outgoing") return <ArrowUpRight className={className} />;
  if (d === "incoming") return <ArrowDownLeft className={className} />;
  return <ArrowLeftRight className={className} />;
}

export function CouplingPanel({ sphere, accent }: Props) {
  const links = COUPLING_DATA[sphere.id] || COUPLING_DATA.geosphere;
  const [tick, setTick] = useState(0);
  const [hovered, setHovered] = useState<SphereId | null>(null);

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 80);
    return () => clearInterval(iv);
  }, []);

  const sorted = useMemo(() => [...links].sort((a, b) => b.strength - a.strength), [links]);
  const avgStrength = useMemo(
    () => Math.round((sorted.reduce((s, l) => s + l.strength, 0) / sorted.length) * 100),
    [sorted]
  );
  const strongest = sorted[0];
  const strongestTarget = SPHERE_ARRAY.find((s) => s.id === strongest.target);

  // Radial layout — full circle for breathing room
  const CX = 250;
  const CY = 250;
  const R = 165;
  const positions = useMemo(() => {
    return sorted.map((link, i) => {
      const angle = -Math.PI / 2 + (i / sorted.length) * Math.PI * 2;
      return {
        link,
        x: CX + Math.cos(angle) * R,
        y: CY + Math.sin(angle) * R,
        angle,
      };
    });
  }, [sorted]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${accent}12` }}
          >
            <GitBranch className="w-6 h-6" style={{ color: accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold tracking-wide">Coupling — {sphere.name}</h2>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mt-0.5">
              Inter-sphere relationships · Coupling strength · Causal mechanisms
            </p>
          </div>
          <div className="hidden md:flex items-stretch gap-2">
            <div className="px-3 py-2 rounded-lg border border-border/15 bg-background/30">
              <div className="text-[8px] uppercase tracking-[0.15em] text-muted-foreground/40">Mean Coupling</div>
              <div className="text-sm font-mono font-semibold mt-0.5" style={{ color: accent }}>
                {avgStrength}%
              </div>
            </div>
            <div className="px-3 py-2 rounded-lg border border-border/15 bg-background/30">
              <div className="text-[8px] uppercase tracking-[0.15em] text-muted-foreground/40">Strongest Link</div>
              <div
                className="text-sm font-mono font-semibold mt-0.5"
                style={{ color: SPHERE_COLORS[strongest.target] }}
              >
                {strongestTarget?.name}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Network diagram */}
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Coupling Network</h3>
          <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.14em] text-muted-foreground/50">
            <span className="flex items-center gap-1.5">
              <ArrowLeftRight className="w-3 h-3" /> Bidirectional
            </span>
            <span className="flex items-center gap-1.5">
              <ArrowUpRight className="w-3 h-3" /> Outflow
            </span>
            <span className="flex items-center gap-1.5">
              <ArrowDownLeft className="w-3 h-3" /> Inflow
            </span>
          </div>
        </div>

        <div className="relative aspect-square w-full max-w-[560px] mx-auto">
          <svg viewBox="0 0 500 500" className="w-full h-full">
            <defs>
              <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
                <stop offset="60%" stopColor={accent} stopOpacity="0.08" />
                <stop offset="100%" stopColor={accent} stopOpacity="0" />
              </radialGradient>
              <filter id="softGlow">
                <feGaussianBlur stdDeviation="2.5" />
              </filter>
            </defs>

            {/* Concentric coupling rings */}
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

            {/* Center halo */}
            <circle cx={CX} cy={CY} r={90} fill="url(#centerGlow)" />

            {/* Edges */}
            {positions.map(({ link, x, y }) => {
              const color = SPHERE_COLORS[link.target];
              const isHover = hovered === link.target;
              const isDim = hovered && !isHover;
              const baseOpacity = 0.25 + link.strength * 0.55;
              const opacity = isHover ? 1 : isDim ? 0.1 : baseOpacity;
              const strokeW = 0.8 + link.strength * 2.2;
              const dashSpeed =
                link.direction === "incoming" ? tick * 0.6 : link.direction === "outgoing" ? -tick * 0.6 : 0;
              const midX = (CX + x) / 2;
              const midY = (CY + y) / 2;

              return (
                <g key={link.target}>
                  <line
                    x1={CX}
                    y1={CY}
                    x2={x}
                    y2={y}
                    stroke={color}
                    strokeWidth={strokeW + 1.5}
                    opacity={isHover ? 0.25 : 0}
                    filter="url(#softGlow)"
                  />
                  <line
                    x1={CX}
                    y1={CY}
                    x2={x}
                    y2={y}
                    stroke={color}
                    strokeWidth={strokeW}
                    opacity={opacity}
                    strokeDasharray={link.direction === "bidirectional" ? "0" : "5 4"}
                    strokeDashoffset={dashSpeed}
                    strokeLinecap="round"
                  />
                  {/* Strength chip on edge */}
                  <g opacity={isDim ? 0.3 : 1}>
                    <rect
                      x={midX - 14}
                      y={midY - 8}
                      width={28}
                      height={14}
                      rx={7}
                      fill="hsla(240,25%,7%,0.85)"
                      stroke={color}
                      strokeOpacity={0.45}
                      strokeWidth={0.6}
                    />
                    <text
                      x={midX}
                      y={midY + 2}
                      textAnchor="middle"
                      fill={color}
                      fontSize="8"
                      fontFamily="ui-monospace, monospace"
                      fontWeight="600"
                    >
                      {Math.round(link.strength * 100)}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Center node */}
            <circle cx={CX} cy={CY} r={42} fill="hsla(240,30%,8%,0.95)" stroke={accent} strokeWidth="1.5" />
            <circle
              cx={CX}
              cy={CY}
              r={42}
              fill="none"
              stroke={accent}
              strokeWidth="1"
              opacity={0.3 + Math.sin(tick * 0.05) * 0.2}
              filter="url(#softGlow)"
            />
            <text
              x={CX}
              y={CY - 2}
              textAnchor="middle"
              fill={accent}
              fontSize="10"
              fontWeight="700"
              letterSpacing="1"
            >
              {sphere.name.toUpperCase()}
            </text>
            <text
              x={CX}
              y={CY + 11}
              textAnchor="middle"
              fill="hsla(0,0%,100%,0.35)"
              fontSize="6.5"
              letterSpacing="2"
            >
              CENTER
            </text>

            {/* Target nodes */}
            {positions.map(({ link, x, y }) => {
              const color = SPHERE_COLORS[link.target];
              const target = SPHERE_ARRAY.find((s) => s.id === link.target);
              const isHover = hovered === link.target;
              const isDim = hovered && !isHover;
              const r = 26 + link.strength * 6;

              return (
                <g
                  key={link.target}
                  style={{ cursor: "pointer", transition: "opacity 200ms" }}
                  opacity={isDim ? 0.35 : 1}
                  onMouseEnter={() => setHovered(link.target)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {isHover && (
                    <circle cx={x} cy={y} r={r + 8} fill={color} opacity={0.18} filter="url(#softGlow)" />
                  )}
                  <circle cx={x} cy={y} r={r} fill="hsla(240,30%,8%,0.92)" stroke={color} strokeWidth="1.2" />
                  <text x={x} y={y - 1} textAnchor="middle" fill={color} fontSize="9" fontWeight="600">
                    {target?.name}
                  </text>
                  <text
                    x={x}
                    y={y + 11}
                    textAnchor="middle"
                    fill="hsla(0,0%,100%,0.35)"
                    fontSize="7"
                    fontFamily="ui-monospace, monospace"
                  >
                    {Math.round(link.strength * 100)}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </Card>

      {/* Coupling list — refined */}
      <div className="space-y-2">
        {sorted.map((link) => {
          const color = SPHERE_COLORS[link.target];
          const target = SPHERE_ARRAY.find((s) => s.id === link.target);
          const pct = Math.round(link.strength * 100);
          const isHover = hovered === link.target;

          return (
            <Card
              key={link.target}
              className="glass-panel rounded-xl p-4 transition-all duration-200 cursor-pointer"
              style={{
                borderColor: isHover ? `${color}55` : undefined,
                boxShadow: isHover ? `0 0 0 1px ${color}33, 0 8px 24px ${color}15` : undefined,
              }}
              onMouseEnter={() => setHovered(link.target)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex items-center gap-4">
                {/* Strength dial */}
                <div className="relative w-14 h-14 shrink-0">
                  <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                    <circle cx="28" cy="28" r="22" fill="none" stroke="hsla(0,0%,100%,0.06)" strokeWidth="3" />
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      fill="none"
                      stroke={color}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 22}
                      strokeDashoffset={2 * Math.PI * 22 * (1 - link.strength)}
                      style={{ transition: "stroke-dashoffset 600ms" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] font-mono font-bold" style={{ color }}>
                      {pct}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-semibold text-foreground/80">{sphere.name}</span>
                    <DirIcon d={link.direction} className="w-3 h-3 text-muted-foreground/50" />
                    <span className="text-xs font-semibold" style={{ color }}>
                      {target?.name}
                    </span>
                    <span
                      className="ml-auto text-[8px] uppercase tracking-[0.14em] px-1.5 py-0.5 rounded border"
                      style={{
                        color: `${color}cc`,
                        borderColor: `${color}33`,
                        background: `${color}10`,
                      }}
                    >
                      {DIR_LABEL[link.direction]}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/55 leading-relaxed">{link.mechanism}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
