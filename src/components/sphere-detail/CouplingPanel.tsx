import { Card } from "@/components/ui/card";
import { Sphere, SPHERE_ARRAY } from "@/types/spheres";
import { GitBranch } from "lucide-react";

interface Props {
  sphere: Sphere;
  accent: string;
}

const COUPLING_MAP: Record<string, { affects: string[]; affectedBy: string[]; examples: string[] }> = {
  geosphere: {
    affects: ["Biosphere", "Atmosphere"],
    affectedBy: ["Noosphere (human activity)"],
    examples: [
      "Volcanic eruption → atmospheric chemistry → vegetation shifts",
      "Tectonic stress → tsunami → coastal ecosystem disruption",
      "Mineral deposits → electromagnetic field anomalies",
    ],
  },
  biosphere: {
    affects: ["Atmosphere", "Ionosphere", "Geosphere"],
    affectedBy: ["Geosphere", "Magnetosphere", "Noosphere"],
    examples: [
      "Forest emissions → atmospheric chemistry → ionization changes",
      "Geomagnetic storms → animal navigation disruption",
      "Deforestation → carbon cycle → climate feedback",
    ],
  },
  magnetosphere: {
    affects: ["Ionosphere", "Biosphere", "Crystalsphere"],
    affectedBy: ["Solar wind", "Geosphere (core dynamo)"],
    examples: [
      "Solar flare → geomagnetic storm → power grid disruption",
      "CME impact → radiation belt enhancement → satellite damage",
      "Field compression → auroral intensification → ionospheric disturbance",
    ],
  },
  ionosphere: {
    affects: ["Magnetosphere", "Biosphere"],
    affectedBy: ["Magnetosphere", "Solar radiation"],
    examples: [
      "TEC variations → GPS signal degradation",
      "Ionospheric storms → radio blackouts",
      "Auroral precipitation → atmospheric heating",
    ],
  },
  noosphere: {
    affects: ["Biosphere", "Geosphere"],
    affectedBy: ["All spheres (feedback)"],
    examples: [
      "Industrial emissions → atmospheric composition change",
      "Mining activity → geosphere stress redistribution",
      "Urbanization → biodiversity pressure",
    ],
  },
  crystalsphere: {
    affects: ["All (resonance overlay)"],
    affectedBy: ["Magnetosphere", "Geosphere"],
    examples: [
      "Schumann resonance modulation → biosphere timing",
      "Piezoelectric signals → seismic precursors",
      "EM field harmonics → mineral lattice response",
    ],
  },
};

export function CouplingPanel({ sphere, accent }: Props) {
  const coupling = COUPLING_MAP[sphere.id] || COUPLING_MAP.geosphere;

  return (
    <div className="space-y-4">
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}12` }}>
            <GitBranch className="w-6 h-6" style={{ color: accent }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold tracking-wide">Inter-Sphere Coupling — {sphere.name}</h2>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mt-0.5">
              Bidirectional relationships · Causal pathways · Cross-domain correlations
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* What this sphere affects */}
        <Card className="glass-panel rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold">Outgoing Influence</h3>
          <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">What {sphere.name} affects</p>
          <div className="space-y-2">
            {coupling.affects.map((target, idx) => (
              <div key={idx} className="px-3 py-2 rounded-lg bg-muted/5 border border-border/10 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                <span className="text-xs text-foreground/70">{sphere.name}</span>
                <span className="text-[9px] text-muted-foreground/30 font-mono">→</span>
                <span className="text-xs font-medium" style={{ color: accent }}>{target}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* What affects this sphere */}
        <Card className="glass-panel rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold">Incoming Drivers</h3>
          <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">What drives {sphere.name}</p>
          <div className="space-y-2">
            {coupling.affectedBy.map((source, idx) => (
              <div key={idx} className="px-3 py-2 rounded-lg bg-muted/5 border border-border/10 flex items-center gap-3">
                <span className="text-xs font-medium" style={{ color: accent }}>{source}</span>
                <span className="text-[9px] text-muted-foreground/30 font-mono">→</span>
                <span className="text-xs text-foreground/70">{sphere.name}</span>
                <div className="w-1.5 h-1.5 rounded-full ml-auto" style={{ backgroundColor: accent }} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Coupling Examples */}
      <Card className="glass-panel rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold">Causal Pathways</h3>
        <div className="space-y-2">
          {coupling.examples.map((example, idx) => (
            <div key={idx} className="px-3 py-2.5 rounded-lg bg-muted/5 border border-border/10 flex items-start gap-2.5">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold mt-0.5 shrink-0"
                style={{ backgroundColor: `${accent}15`, color: accent }}
              >
                {idx + 1}
              </div>
              <p className="text-[11px] text-muted-foreground/60 leading-relaxed">{example}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Correlation placeholder */}
      <Card className="glass-panel rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold">Correlation Matrix</h3>
        <p className="text-[10px] text-muted-foreground/40">
          Dynamic relationship graph computed from lagged cross-correlations and causal inference models.
        </p>
        <div className="h-48 rounded-lg bg-muted/5 border border-border/10 flex items-center justify-center">
          <div className="text-center space-y-1.5">
            <GitBranch className="w-8 h-8 mx-auto" style={{ color: `${accent}30` }} />
            <p className="text-[10px] text-muted-foreground/30 uppercase tracking-wider">
              Cross-domain correlation engine
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
