import { useState } from "react";
import { Info, Volume2, Eye } from "lucide-react";
import { OrbitalResonanceField } from "@/components/hgs/OrbitalResonanceField";
import { ResonancePairDiagram } from "@/components/hgs/ResonancePairDiagram";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SOLAR_PLANETS, PLANET_RESONANCE_PAIRS } from "@/types/solarPlanets";
import { usePlanetAudio } from "@/hooks/usePlanetAudio";

export const HGSDashboard = () => {
  const { play, playing } = usePlanetAudio();
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  const handlePlanetClick = (planetId: string) => {
    // Toggle selection
    setSelectedPlanet((prev) => (prev === planetId ? null : planetId));
  };

  const handleAudioClick = (e: React.MouseEvent, planetId: string) => {
    e.stopPropagation();
    play(planetId);
  };

  // Filter sidebar pairs when a planet is selected
  const visiblePairs = selectedPlanet
    ? PLANET_RESONANCE_PAIRS.filter((pair) => {
        const p1 = SOLAR_PLANETS[pair.i];
        const p2 = SOLAR_PLANETS[pair.j];
        return p1.id === selectedPlanet || p2.id === selectedPlanet;
      })
    : PLANET_RESONANCE_PAIRS;

  const selectedName = selectedPlanet
    ? SOLAR_PLANETS.find((p) => p.id === selectedPlanet)?.name
    : null;

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Header */}
      <header className="px-4 pt-2 pb-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground/90">
          Musica Universalis
        </h1>
        <p className="text-xs text-muted-foreground">
          Harmonic ratios between planetary orbits — celestial mechanics &amp; the music of the spheres
        </p>
      </header>

      {/* Main content: orbital field + sidebar */}
      <div className="flex-1 px-4 pt-2 pb-1 flex gap-4 min-h-0">
        {/* Orbital Resonance Field */}
        <div className="flex-1 glass-panel rounded-xl overflow-hidden relative">
          <OrbitalResonanceField selectedPlanet={selectedPlanet} />

          {/* Floating planet legend */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="glass-panel rounded-lg px-4 py-3.5 border border-border/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-muted-foreground/50" />
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-medium">
                    Click to isolate · Right-click for audio
                  </span>
                </div>
                {selectedPlanet && (
                  <button
                    onClick={() => setSelectedPlanet(null)}
                    className="text-[9px] uppercase tracking-wider text-primary/70 hover:text-primary transition-colors px-2 py-0.5 rounded border border-primary/20 hover:border-primary/40"
                  >
                    Show All
                  </button>
                )}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {SOLAR_PLANETS.map((p) => {
                  const isSelected = selectedPlanet === p.id;
                  const isDimmed = selectedPlanet && !isSelected;

                  return (
                    <button
                      key={p.id}
                      onClick={() => handlePlanetClick(p.id)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        handleAudioClick(e, p.id);
                      }}
                      className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-300 ${
                        isSelected
                          ? "bg-primary/15 border border-primary/30 shadow-[0_0_12px_rgba(var(--primary),0.15)]"
                          : isDimmed
                          ? "opacity-40 border border-transparent hover:opacity-70"
                          : "hover:bg-muted/20 border border-transparent hover:border-border/30"
                      }`}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className={`rounded-full object-cover transition-all duration-300 ${
                          isSelected ? "w-6 h-6" : "w-5 h-5"
                        }`}
                        style={{
                          boxShadow: isSelected
                            ? `0 0 6px 2px ${p.color}90, 0 0 14px 4px ${p.color}30`
                            : `0 0 4px 1px ${p.color}40`,
                        }}
                      />
                      <span className={`text-[10px] font-medium transition-colors duration-300 ${
                        isSelected
                          ? "text-foreground/90"
                          : isDimmed
                          ? "text-muted-foreground/50"
                          : "text-muted-foreground group-hover:text-foreground/70"
                      }`}>
                        {p.name}
                      </span>
                      {playing === p.id && (
                        <Volume2 className="w-3 h-3 text-primary animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="absolute top-3 right-3">
            <Badge
              variant="outline"
              className="bg-background/40 backdrop-blur-sm border-primary/30 text-primary text-xs"
            >
              {selectedName
                ? `${selectedName} · Resonance Patterns`
                : "Orbital Resonance Field"}
            </Badge>
          </div>

        </div>

        {/* Right sidebar: Pair-wise resonance diagrams */}
        <Card className="glass-panel p-4 w-[280px] flex-shrink-0 overflow-y-auto space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground/90">
              {selectedName
                ? `${selectedName} Harmonics`
                : "Planetary Harmonics"}
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {selectedName
                ? `Resonance pairs involving ${selectedName}`
                : "Pair-wise orbital resonance ratios"}
            </p>
          </div>

          <div className="space-y-3">
            {visiblePairs.map((pair) => (
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
      <footer className="px-4 py-2">
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
