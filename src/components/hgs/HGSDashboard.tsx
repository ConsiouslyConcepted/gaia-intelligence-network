import { useState } from "react";
import { Volume2, Orbit, Waves } from "lucide-react";
import { OrbitalResonanceField } from "@/components/hgs/OrbitalResonanceField";
import { ResonancePairDiagram } from "@/components/hgs/ResonancePairDiagram";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SOLAR_PLANETS, PLANET_RESONANCE_PAIRS } from "@/types/solarPlanets";
import { usePlanetAudio } from "@/hooks/usePlanetAudio";

type SidebarMode = "patterns" | "cymatics";

export const HGSDashboard = () => {
  const { play, playing } = usePlanetAudio();
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("patterns");

  const handlePlanetClick = (planetId: string) => {
    if (selectedPlanet === planetId) {
      setSelectedPlanet(null);
    } else {
      setSelectedPlanet(planetId);
    }
  };

  const selectedData = selectedPlanet
    ? SOLAR_PLANETS.find((p) => p.id === selectedPlanet)
    : null;

  const visiblePairs = selectedPlanet
    ? PLANET_RESONANCE_PAIRS.filter((pair) => {
        const p1 = SOLAR_PLANETS[pair.i];
        const p2 = SOLAR_PLANETS[pair.j];
        return p1.id === selectedPlanet || p2.id === selectedPlanet;
      })
    : PLANET_RESONANCE_PAIRS;

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-4 py-2 flex items-center gap-4">
        <h1
          className="text-lg font-semibold tracking-wide text-foreground/90 leading-none"
          style={{ fontVariant: "small-caps", letterSpacing: "0.08em" }}
        >
          Musica Universalis
        </h1>
        <div className="h-4 w-px bg-border/30 self-center" />
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium leading-none">
          Harmonic ratios between planetary orbits — celestial mechanics &amp;
          the music of the spheres
        </p>
      </header>

      {/* Main content */}
      <div className="flex-1 px-3 pb-3 flex gap-3 min-h-0">
        {/* Orbital Resonance Field */}
        <div className="flex-1 glass-panel rounded-xl overflow-hidden relative min-h-0">
          <OrbitalResonanceField
            selectedPlanet={selectedPlanet}
            onPlanetClick={(id) => setSelectedPlanet(id)}
          />

          <div className="absolute top-2 right-2 flex items-center gap-2">
            {selectedPlanet && (
              <button
                onClick={() => setSelectedPlanet(null)}
                className="text-[9px] uppercase tracking-wider bg-background/40 backdrop-blur-sm text-primary/70 hover:text-primary transition-colors px-2.5 py-1 rounded-full border border-primary/20 hover:border-primary/40"
              >
                Show All
              </button>
            )}
            <Badge
              variant="outline"
              className="bg-background/40 backdrop-blur-sm border-primary/30 text-primary text-[10px]"
            >
              {selectedData
                ? `${selectedData.name} · Resonance Patterns`
                : "Orbital Resonance Field"}
            </Badge>
          </div>
        </div>

        {/* Right sidebar */}
        <Card className="glass-panel w-[280px] flex-shrink-0 flex flex-col min-h-0 mt-8">
          {/* Selected planet detail area */}
          {selectedData ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Mode tabs */}
              <div className="flex border-b border-border/20">
                <button
                  onClick={() => setSidebarMode("patterns")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-wider font-medium transition-all ${
                    sidebarMode === "patterns"
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-muted-foreground/60 hover:text-muted-foreground"
                  }`}
                >
                  <Orbit className="w-3 h-3" />
                  Patterns
                </button>
                <button
                  onClick={() => setSidebarMode("cymatics")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-wider font-medium transition-all ${
                    sidebarMode === "cymatics"
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-muted-foreground/60 hover:text-muted-foreground"
                  }`}
                >
                  <Waves className="w-3 h-3" />
                  Cymatics
                </button>
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-y-auto p-3">
                {sidebarMode === "patterns" ? (
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-sm font-semibold text-foreground/90">
                        {selectedData.name} Harmonics
                      </h2>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Resonance pairs involving {selectedData.name}
                      </p>
                    </div>
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
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <h2 className="text-sm font-semibold text-foreground/90 self-start">
                      {selectedData.name} Frequency
                    </h2>
                    <p className="text-[10px] text-muted-foreground self-start -mt-3">
                      Cymatic pattern of {selectedData.name}'s orbital tone
                    </p>

                    {/* Cymatic image */}
                    <div className="relative">
                      <img
                        src={selectedData.cymaticImage}
                        alt={`${selectedData.name} cymatic frequency pattern`}
                        className="w-48 h-48 rounded-full object-cover"
                        style={{
                          boxShadow: `0 0 20px 6px ${selectedData.color}50, 0 0 40px 12px ${selectedData.color}20`,
                        }}
                      />
                      {playing === selectedData.id && (
                        <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-pulse" />
                      )}
                    </div>

                    {/* Play button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        play(selectedData.id);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                        playing === selectedData.id
                          ? "bg-primary/20 border border-primary/40 text-primary"
                          : "bg-muted/20 border border-border/30 text-muted-foreground hover:bg-muted/30 hover:text-foreground/80"
                      }`}
                    >
                      <Volume2
                        className={`w-4 h-4 ${
                          playing === selectedData.id ? "animate-pulse" : ""
                        }`}
                      />
                      <span className="text-xs font-medium">
                        {playing === selectedData.id
                          ? "Playing..."
                          : `Play ${selectedData.name} Tone`}
                      </span>
                    </button>

                    {/* Info */}
                    <div className="text-[9px] text-muted-foreground/50 text-center mt-2">
                      {selectedData.id === "jupiter" || selectedData.id === "mars"
                        ? "NASA/JPL electromagnetic recording (public domain)"
                        : "Orbital frequency tone based on Keplerian ratios"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Default: clickable resonance pairs */
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="px-1">
                <h2 className="text-xs font-semibold text-foreground/90">
                  Planetary Harmonics
                </h2>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Click a pair to explore
                </p>
              </div>
              {PLANET_RESONANCE_PAIRS.map((pair) => {
                const p1 = SOLAR_PLANETS[pair.i];
                return (
                  <button
                    key={pair.label}
                    onClick={() => handlePlanetClick(p1.id)}
                    className="w-full text-left rounded-md hover:bg-muted/15 transition-all duration-200 cursor-pointer py-0.5"
                  >
                    <ResonancePairDiagram
                      label={pair.label}
                      color1={pair.c1}
                      color2={pair.c2}
                      ratioA={pair.a}
                      ratioB={pair.b}
                      size={56}
                    />
                  </button>
                );
              })}
              <div className="text-[9px] text-muted-foreground/50 pt-2 border-t border-border/20">
                <p>Jupiter &amp; Mars: NASA/JPL recordings (public domain)</p>
                <p>Others: Orbital frequency tones based on Keplerian ratios</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
