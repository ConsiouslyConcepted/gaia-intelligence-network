import { useState } from "react";
import { Info, Volume2, Eye } from "lucide-react";
import { OrbitalResonanceField } from "@/components/hgs/OrbitalResonanceField";
import { ResonancePairDiagram } from "@/components/hgs/ResonancePairDiagram";
import { ResonanceIcon } from "@/components/hgs/ResonanceIcon";
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
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-4 py-2 flex items-center gap-4">
        <h1 className="text-lg font-semibold tracking-wide text-foreground/90 leading-none" style={{ fontVariant: 'small-caps', letterSpacing: '0.08em' }}>
          Musica Universalis
        </h1>
        <div className="h-4 w-px bg-border/30 self-center" />
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium leading-none">
          Harmonic ratios between planetary orbits — celestial mechanics &amp; the music of the spheres
        </p>
      </header>

      {/* Main content: orbital field + sidebar */}
      <div className="flex-1 px-3 flex gap-3 min-h-0">
        {/* Orbital Resonance Field */}
        <div className="flex-1 flex flex-col min-h-0 gap-2">
          <div className="flex-1 glass-panel rounded-xl overflow-hidden relative min-h-0">
            <OrbitalResonanceField selectedPlanet={selectedPlanet} />

            {/* Badge */}
            <div className="absolute top-2 right-2">
              <Badge
                variant="outline"
                className="bg-background/40 backdrop-blur-sm border-primary/30 text-primary text-[10px]"
              >
                {selectedName
                  ? `${selectedName} · Resonance Patterns`
                  : "Orbital Resonance Field"}
              </Badge>
            </div>
          </div>

          {/* Planet legend — below canvas */}
          <Card className="glass-panel px-4 py-3 flex-shrink-0">
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
            <div className="flex gap-2 flex-wrap">
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
                    <ResonanceIcon
                      planetId={p.id}
                      size={isSelected ? 32 : 28}
                    />
                    <span className={`text-[11px] font-medium transition-colors duration-300 ${
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
          </Card>
        </div>

        {/* Right sidebar: Pair-wise resonance diagrams */}
        <Card className="glass-panel p-4 w-[260px] flex-shrink-0 overflow-y-auto space-y-4">
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


    </div>
  );
};
