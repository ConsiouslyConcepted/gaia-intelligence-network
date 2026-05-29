import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Sphere, SPHERE_ARRAY, SphereId } from "@/types/spheres";
import { GitBranch, ArrowRight } from "lucide-react";

interface Props {
  sphere: Sphere;
  accent: string;
}

interface CouplingLink {
  target: SphereId;
  strength: number; // 0-1
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
  biosphere: "#4caf50",
  magnetosphere: "#4466dd",
  ionosphere: "#4488cc",
  noosphere: "#ab47bc",
  crystalsphere: "#d4a56a",
};

export function CouplingPanel({ sphere, accent }: Props) {
  const links = COUPLING_DATA[sphere.id] || COUPLING_DATA.geosphere;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(iv);
  }, []);

  // Sort by strength
  const sorted = useMemo(() => [...links].sort((a, b) => b.strength - a.strength), [links]);

  // Relationship network SVG
  const centerSphere = sphere.id;
  const connectedSpheres = sorted.map(l => l.target);

  return (
    <div className="space-y-4">
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}12` }}>
            <GitBranch className="w-6 h-6" style={{ color: accent }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold tracking-wide">Coupling — {sphere.name}</h2>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mt-0.5">
              Inter-sphere relationships · Coupling strength · Causal mechanisms
            </p>
          </div>
        </div>
      </Card>

      {/* Relationship Diagram */}
      <Card className="glass-panel rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Coupling Network</h3>
        <div className="relative aspect-[2/1] min-h-[220px]">
          <svg viewBox="0 0 500 250" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Center node */}
            <circle cx="250" cy="125" r="28" fill={`${accent}18`} stroke={accent} strokeWidth="1.5" />
            <text x="250" y="121" textAnchor="middle" fill={accent} fontSize="8" fontWeight="600" className="uppercase">
              {sphere.name.length > 10 ? sphere.name.slice(0, 9) + "…" : sphere.name}
            </text>
            <text x="250" y="133" textAnchor="middle" fill="hsla(0,0%,100%,0.3)" fontSize="6">
              CENTER
            </text>

            {/* Connected nodes in arc */}
            {connectedSpheres.map((targetId, i) => {
              const link = sorted[i];
              const angle = -Math.PI / 2 + ((i + 0.5) / connectedSpheres.length) * Math.PI;
              const radiusX = 180;
              const radiusY = 90;
              const x = 250 + Math.cos(angle) * radiusX;
              const y = 125 + Math.sin(angle) * radiusY;
              const color = SPHERE_COLORS[targetId] || "#888";
              const opacity = 0.3 + link.strength * 0.7;
              const strokeW = 0.5 + link.strength * 2;
              const targetSphere = SPHERE_ARRAY.find(s => s.id === targetId);

              // Animated dash offset
              const dashOffset = link.direction === "incoming" ? tick * 3 : -(tick * 3);

              return (
                <g key={targetId}>
                  {/* Connection line */}
                  <line
                    x1={250} y1={125} x2={x} y2={y}
                    stroke={color}
                    strokeWidth={strokeW}
                    opacity={opacity * 0.5}
                    strokeDasharray="4 3"
                    strokeDashoffset={dashOffset}
                  />
                  {/* Strength label on line */}
                  <text
                    x={(250 + x) / 2 + (i % 2 === 0 ? 8 : -8)}
                    y={(125 + y) / 2 + (i % 2 === 0 ? -4 : 8)}
                    textAnchor="middle"
                    fill="hsla(0,0%,100%,0.25)"
                    fontSize="7"
                    fontFamily="monospace"
                  >
                    {(link.strength * 100).toFixed(0)}%
                  </text>
                  {/* Target node */}
                  <circle cx={x} cy={y} r="20" fill={`${color}15`} stroke={color} strokeWidth="1" opacity={0.8} />
                  <text x={x} y={y - 2} textAnchor="middle" fill={color} fontSize="7" fontWeight="500">
                    {targetSphere?.name.length! > 9 ? targetSphere?.name.slice(0, 8) + "…" : targetSphere?.name}
                  </text>
                  <text x={x} y={y + 8} textAnchor="middle" fill="hsla(0,0%,100%,0.2)" fontSize="5">
                    {link.direction === "bidirectional" ? "⇄" : link.direction === "outgoing" ? "→" : "←"}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </Card>

      {/* Coupling Details */}
      <div className="space-y-3">
        {sorted.map((link) => {
          const color = SPHERE_COLORS[link.target];
          const targetSphere = SPHERE_ARRAY.find(s => s.id === link.target);
          const strengthPct = Math.round(link.strength * 100);

          return (
            <Card key={link.target} className="glass-panel rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}12` }}>
                  <span className="text-sm font-mono font-bold" style={{ color }}>{strengthPct}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground/80">{sphere.name}</span>
                    <span className="text-[9px] font-mono text-muted-foreground/30">
                      {link.direction === "bidirectional" ? "⇄" : link.direction === "outgoing" ? "→" : "←"}
                    </span>
                    <span className="text-xs font-semibold" style={{ color }}>{targetSphere?.name}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/50 leading-relaxed">{link.mechanism}</p>
                  {/* Strength bar */}
                  <div className="mt-2 h-1 rounded-full bg-muted/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${strengthPct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
