import { Info } from "lucide-react";
import { OrbitalResonanceField } from "@/components/hgs/OrbitalResonanceField";
import { ResonancePairDiagram } from "@/components/hgs/ResonancePairDiagram";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SOLAR_PLANETS, PLANET_RESONANCE_PAIRS } from "@/types/solarPlanets";

export const HGSDashboard = () => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Header */}
      <header className="p-4 pb-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground/90">
          Musica Universalis
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Harmonic ratios between planetary orbits — celestial mechanics &amp; the music of the spheres
        </p>
      </header>

      {/* Main content: orbital field + sidebar */}
      <div className="flex-1 p-4 flex gap-4 min-h-0">
        {/* Orbital Resonance Field */}
        <div className="flex-1 glass-panel rounded-xl overflow-hidden relative">
          <OrbitalResonanceField />

          {/* Floating planet legend */}
          <div className="absolute bottom-3 left-3 flex gap-3 flex-wrap">
            {SOLAR_PLANETS.map((p) => (
              <div key={p.id} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: p.color,
                    boxShadow: `0 0 6px ${p.color}`,
                  }}
                />
                <span className="text-[10px] text-muted-foreground">{p.name}</span>
              </div>
            ))}
          </div>

          {/* Badge */}
          <div className="absolute top-3 right-3">
            <Badge
              variant="outline"
              className="bg-background/40 backdrop-blur-sm border-primary/30 text-primary text-xs"
            >
              Orbital Resonance Field
            </Badge>
          </div>
        </div>

        {/* Right sidebar: Pair-wise resonance diagrams */}
        <Card className="glass-panel p-4 w-[280px] flex-shrink-0 overflow-y-auto space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground/90">
              Planetary Harmonics
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Pair-wise orbital resonance ratios
            </p>
          </div>

          <div className="space-y-3">
            {PLANET_RESONANCE_PAIRS.map((pair) => (
              <ResonancePairDiagram
                key={pair.label}
                label={pair.label}
                color1={pair.c1}
                color2={pair.c2}
                ratioA={pair.a}
                ratioB={pair.b}
                size={80}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Footer disclaimer */}
      <footer className="p-3">
        <div className="glass-panel p-2 rounded-lg flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <Info className="w-3 h-3 flex-shrink-0" />
          <span>
            This dashboard provides interpretive intelligence only. It does not authorize, execute, or govern action.
          </span>
        </div>
      </footer>
    </div>
  );
};
