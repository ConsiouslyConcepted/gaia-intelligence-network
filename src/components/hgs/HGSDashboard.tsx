import { useState } from "react";
import { Volume2, Radar, Signal, Activity } from "lucide-react";
import harmonicsIcon from "@/assets/harmonics-icon.png";
import { OrbitalResonanceField } from "@/components/hgs/OrbitalResonanceField";
import { ResonancePairDiagram } from "@/components/hgs/ResonancePairDiagram";
import { SOLAR_PLANETS, PLANET_RESONANCE_PAIRS } from "@/types/solarPlanets";
import { usePlanetAudio } from "@/hooks/usePlanetAudio";

type SidebarMode = "patterns" | "cymatics";

const HudPanel = ({ children, className = "", glow }: { children: React.ReactNode; className?: string; glow?: string }) => (
  <div
    className={`relative rounded-xl border-[1.5px] backdrop-blur-2xl ${className}`}
    style={{
      background: "linear-gradient(145deg, hsla(240,20%,13%,0.92) 0%, hsla(240,25%,9%,0.88) 50%, hsla(240,22%,7%,0.92) 100%)",
      borderColor: "hsla(38,50%,50%,0.2)",
      boxShadow: `0 0 25px hsla(38,50%,45%,0.08), 0 0 50px hsla(38,50%,45%,0.04), inset 0 1px 0 hsla(38,50%,60%,0.1), inset 0 -1px 0 rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)`,
    }}
  >
    {/* Top highlight edge */}
    <div className="absolute top-0 left-4 right-4 h-px" style={{ background: "linear-gradient(90deg, transparent, hsla(38,50%,55%,0.35), transparent)" }} />
    {/* Bottom subtle edge */}
    <div className="absolute bottom-0 left-6 right-6 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)" }} />
    {children}
  </div>
);

export const HGSDashboard = ({ onSwitchView }: { onSwitchView?: () => void }) => {
  const { play, playing } = usePlanetAudio();
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  



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
                className="text-[10px] uppercase tracking-wider transition-all duration-300 px-4 py-2 rounded-lg font-medium"
                style={{
                  color: "#5ce0d2",
                  background: "hsla(174,60%,50%,0.08)",
                  border: "1px solid hsla(174,60%,50%,0.25)",
                  boxShadow: "0 0 12px hsla(174,60%,50%,0.08), inset 0 1px 0 hsla(174,60%,70%,0.08)",
                }}
              >
                Show All
              </button>
            )}
            <div className="flex gap-1.5 rounded-xl p-1" style={{ background: "hsla(240,20%,12%,0.6)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)" }}>
              <button onClick={onSwitchView} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[11px] font-medium tracking-wider uppercase text-muted-foreground/40 hover:text-foreground/60 transition-all duration-300 hover:bg-foreground/[0.04]">
                <Signal className="w-3.5 h-3.5" style={{ color: "#5ce0d2" }} />Planetary
              </button>
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[11px] font-semibold tracking-wider uppercase transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, hsla(38,60%,50%,0.3) 0%, hsla(38,70%,40%,0.2) 100%)",
                  color: "#e8b960",
                  border: "1px solid hsla(38,60%,55%,0.45)",
                  boxShadow: "0 0 20px hsla(38,65%,50%,0.2), inset 0 1px 0 hsla(38,60%,70%,0.15), 0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                <Activity className="w-3.5 h-3.5" />HGS
              </button>
            </div>
          </div>
        </HudPanel>
      </div>

      {/* ─── RIGHT SIDEBAR ─── */}
      <div className="absolute right-4 top-[96px] bottom-4 z-10 pointer-events-none w-[260px]">
        <HudPanel className="pointer-events-auto h-full flex flex-col" glow={selectedData ? selectedData.color : "#d4a56a"}>
          {selectedData ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-3">
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
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto flex flex-col">
              {/* Header */}
              <div className="px-4 pt-4 pb-3 border-b border-border/15">
                <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-foreground/85 mb-1">Planetary Harmonics</h2>
                <p className="text-[9px] text-muted-foreground/50 leading-relaxed">
                  Tap to see planetary resonance patterns and sounds unique to each planet.
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
