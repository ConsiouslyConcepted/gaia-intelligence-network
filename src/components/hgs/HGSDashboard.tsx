import { Info, Volume2 } from "lucide-react";
import { OrbitalResonanceField } from "@/components/hgs/OrbitalResonanceField";
import { ResonancePairDiagram } from "@/components/hgs/ResonancePairDiagram";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SOLAR_PLANETS, PLANET_RESONANCE_PAIRS } from "@/types/solarPlanets";
import { usePlanetAudio } from "@/hooks/usePlanetAudio";

export const HGSDashboard = () => {
  const { play, playing } = usePlanetAudio();

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

          {/* Floating planet legend with click-to-play */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="glass-panel rounded-lg px-3 py-2.5 border border-border/20">
              <div className="flex items-center gap-1 mb-2">
                <Volume2 className="w-3 h-3 text-muted-foreground/50" />
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-medium">
                  Click to hear · Planetary Frequencies
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {SOLAR_PLANETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => play(p.id)}
                    className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-300 ${
                      playing === p.id
                        ? "bg-primary/15 border border-primary/30 shadow-[0_0_12px_rgba(var(--primary),0.15)]"
                        : "hover:bg-muted/20 border border-transparent hover:border-border/30"
                    }`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: p.color,
                        boxShadow: playing === p.id
                          ? `0 0 10px ${p.color}, 0 0 20px ${p.color}40`
                          : `0 0 4px ${p.color}60`,
                      }}
                    />
                    <span className={`text-[10px] font-medium transition-colors duration-300 ${
                      playing === p.id ? "text-foreground/90" : "text-muted-foreground group-hover:text-foreground/70"
                    }`}>
                      {p.name}
                    </span>
                    {playing === p.id && (
                      <Volume2 className="w-3 h-3 text-primary animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>
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

          {/* Audio source credits */}
          <div className="text-[9px] text-muted-foreground/50 pt-2 border-t border-border/20">
            <p>Jupiter & Mars: NASA/JPL recordings (public domain)</p>
            <p>Others: Orbital frequency tones based on Keplerian ratios</p>
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
