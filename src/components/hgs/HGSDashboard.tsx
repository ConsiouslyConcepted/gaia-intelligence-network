import { useState } from "react";
import { Volume2, Orbit, Waves, Radar, Signal, Activity } from "lucide-react";
import harmonicsIcon from "@/assets/harmonics-icon.png";
import { OrbitalResonanceField } from "@/components/hgs/OrbitalResonanceField";
import { ResonancePairDiagram } from "@/components/hgs/ResonancePairDiagram";
import { SOLAR_PLANETS, PLANET_RESONANCE_PAIRS } from "@/types/solarPlanets";
import { usePlanetAudio } from "@/hooks/usePlanetAudio";

type SidebarMode = "patterns" | "cymatics";

const HudPanel = ({ children, className = "", glow }: { children: React.ReactNode; className?: string; glow?: string }) => (
  <div
    className={`relative rounded-lg border border-border/20 backdrop-blur-xl ${className}`}
    style={{
      background: "linear-gradient(135deg, hsla(240,20%,10%,0.85) 0%, hsla(240,25%,8%,0.75) 100%)",
      boxShadow: glow
        ? `0 0 30px ${glow}10, inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 20px rgba(0,0,0,0.5)`
        : "inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 20px rgba(0,0,0,0.5)",
    }}
  >
    <div className="absolute top-0 left-3 right-3 h-px" style={{ background: glow ? `linear-gradient(90deg, transparent, ${glow}40, transparent)` : "linear-gradient(90deg, transparent, hsl(var(--border) / 0.3), transparent)" }} />
    {children}
  </div>
);

export const HGSDashboard = ({ onSwitchView }: { onSwitchView?: () => void }) => {
  const { play, playing } = usePlanetAudio();
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("patterns");



  const handlePlanetClick = (planetId: string) => {
    setSelectedPlanet(selectedPlanet === planetId ? null : planetId);
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
    <div className="h-screen w-full relative overflow-hidden bg-background">
      {/* Full-screen orbital field */}
      <div className="absolute inset-x-0 top-[92px] bottom-0 z-0">
        <OrbitalResonanceField
          selectedPlanet={selectedPlanet}
          onPlanetClick={(id) => setSelectedPlanet(id)}
        />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 30%, hsla(240,30%,3%,0.6) 80%, hsla(240,30%,3%,0.9) 100%)"
      }} />

      {/* Scanlines */}
      <div className="absolute inset-0 z-[2] pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground) / 0.08) 2px, hsl(var(--foreground) / 0.08) 4px)" }}
      />

      {/* ─── TOP BAR ─── */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none px-4 pt-3">
        <HudPanel className="pointer-events-auto px-4 py-2.5 flex items-center justify-between" glow="#d4a56a">
          {/* Left: Title */}
          <div className="flex items-center gap-3">
            <Radar className="w-5 h-5 text-primary/70" />
            <div>
              <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-foreground/90">
                Musica Universalis
              </h1>
              <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/50 mt-0.5">
                Harmonic Guidance System · Celestial Mechanics
              </p>
            </div>
          </div>

          {/* Right: View toggle + controls */}
          <div className="flex items-center gap-3">
            {selectedPlanet && (
              <button
                onClick={() => setSelectedPlanet(null)}
                className="text-[10px] uppercase tracking-wider text-primary/80 hover:text-primary transition-all px-3 py-1.5 rounded border border-primary/20 hover:border-primary/40 bg-primary/5"
              >
                Show All
              </button>
            )}
            <div className="flex gap-1 rounded-lg bg-background/30 p-1">
              <button onClick={onSwitchView} className="flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-medium tracking-wider uppercase text-muted-foreground/50 hover:text-foreground/70 transition-all">
                <Signal className="w-3.5 h-3.5" />Planetary
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-semibold tracking-wider uppercase bg-primary/15 text-primary border border-primary/20 transition-all">
                <Activity className="w-3.5 h-3.5" />HGS
              </button>
            </div>
          </div>
        </HudPanel>
      </div>

      {/* ─── RIGHT SIDEBAR ─── */}
      <div className="absolute right-4 top-[80px] bottom-4 z-10 pointer-events-none w-[260px]">
        <HudPanel className="pointer-events-auto h-full flex flex-col" glow={selectedData ? selectedData.color : "#d4a56a"}>
          {selectedData ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Mode tabs */}
              <div className="flex border-b border-border/20">
                <button
                  onClick={() => setSidebarMode("patterns")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-[9px] uppercase tracking-[0.15em] font-medium transition-all ${
                    sidebarMode === "patterns"
                      ? "text-primary border-b border-primary bg-primary/5"
                      : "text-muted-foreground/40 hover:text-muted-foreground/70"
                  }`}
                >
                  <Orbit className="w-3 h-3" />Patterns
                </button>
                <button
                  onClick={() => setSidebarMode("cymatics")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-[9px] uppercase tracking-[0.15em] font-medium transition-all ${
                    sidebarMode === "cymatics"
                      ? "text-primary border-b border-primary bg-primary/5"
                      : "text-muted-foreground/40 hover:text-muted-foreground/70"
                  }`}
                >
                  <Waves className="w-3 h-3" />Cymatics
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-3">
                {sidebarMode === "patterns" ? (
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-[11px] font-semibold text-foreground/80 tracking-wide uppercase">{selectedData.name} Harmonics</h2>
                      <p className="text-[8px] text-muted-foreground/35 mt-0.5 tracking-wider">Resonance pairs involving {selectedData.name}</p>
                    </div>
                    {visiblePairs.map((pair) => (
                      <ResonancePairDiagram key={pair.label} label={pair.label} color1={pair.c1} color2={pair.c2} ratioA={pair.a} ratioB={pair.b} size={80} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <h2 className="text-[11px] font-semibold text-foreground/80 tracking-wide uppercase self-start">{selectedData.name} Frequency</h2>
                    <p className="text-[8px] text-muted-foreground/35 self-start -mt-3 tracking-wider">Cymatic pattern of {selectedData.name}'s orbital tone</p>

                    <div className="relative">
                      <img
                        src={selectedData.cymaticImage}
                        alt={`${selectedData.name} cymatic frequency pattern`}
                        className="w-44 h-44 rounded-full object-cover"
                        style={{ boxShadow: `0 0 20px 6px ${selectedData.color}50, 0 0 40px 12px ${selectedData.color}20` }}
                      />
                      {playing === selectedData.id && (
                        <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-pulse" />
                      )}
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); play(selectedData.id); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 border ${
                        playing === selectedData.id
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "bg-background/30 border-border/20 text-muted-foreground/60 hover:text-foreground/70"
                      }`}
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${playing === selectedData.id ? "animate-pulse" : ""}`} />
                      <span className="text-[10px] font-medium tracking-wider">
                        {playing === selectedData.id ? "Playing..." : `Play ${selectedData.name} Tone`}
                      </span>
                    </button>

                    <div className="text-[8px] text-muted-foreground/30 text-center mt-2 tracking-wider">
                      {selectedData.id === "jupiter" || selectedData.id === "mars"
                        ? "NASA/JPL electromagnetic recording (public domain)"
                        : "Orbital frequency tone based on Keplerian ratios"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto flex flex-col">
              {/* Header */}
              <div className="px-4 pt-4 pb-3 border-b border-border/15">
                <div className="flex flex-col items-center gap-3 mb-3">
                  <img src={harmonicsIcon} alt="Harmonics" className="w-28 h-28 rounded-xl object-cover" loading="lazy" width={512} height={512} style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.15)" }} />
                  <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-foreground/85">Planetary Harmonics</h2>
                </div>
                <p className="text-[9px] text-muted-foreground/50 leading-relaxed text-center">
                  Tap a resonance pair to isolate its orbital pattern and hear its planetary tone
                </p>
              </div>

              {/* Resonance pairs list */}
              <div className="flex-1 px-2 py-2 space-y-0.5">
                {PLANET_RESONANCE_PAIRS.map((pair) => {
                  const p1 = SOLAR_PLANETS[pair.i];
                  return (
                    <button
                      key={pair.label}
                      onClick={() => handlePlanetClick(p1.id)}
                      className="w-full text-left rounded-lg hover:bg-foreground/[0.04] transition-all duration-200 cursor-pointer py-0.5"
                    >
                      <ResonancePairDiagram label={pair.label} color1={pair.c1} color2={pair.c2} ratioA={pair.a} ratioB={pair.b} size={56} />
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-border/10">
                <p className="text-[7px] text-muted-foreground/25 tracking-wider leading-relaxed">
                  Jupiter &amp; Mars: NASA/JPL recordings (public domain)<br />
                  Others: Orbital frequency tones based on Keplerian ratios
                </p>
              </div>
            </div>
          )}
        </HudPanel>
      </div>




      {/* Corner brackets */}
      {[
        "top-3 left-3 border-l border-t rounded-tl",
        "top-3 right-3 border-r border-t rounded-tr",
        "bottom-3 left-3 border-l border-b rounded-bl",
        "bottom-3 right-3 border-r border-b rounded-br",
      ].map((pos) => (
        <div key={pos} className={`absolute ${pos} w-5 h-5 border-border/15 z-10 pointer-events-none`} />
      ))}
    </div>
  );
};
