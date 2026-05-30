import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Volume2 } from "lucide-react";
import { CommonsIcon } from "@/components/CommonsIcon";
import { OrbitalResonanceField } from "@/components/hgs/OrbitalResonanceField";
import { ResonancePairDiagram } from "@/components/hgs/ResonancePairDiagram";
import { LiveCymaticPattern } from "@/components/hgs/LiveCymaticPattern";
import { SOLAR_PLANETS, PLANET_RESONANCE_PAIRS } from "@/types/solarPlanets";
import { usePlanetAudio } from "@/hooks/usePlanetAudio";
import { AstrologyChart } from "@/components/astrology/AstrologyChart";
import { ZodiacSidebar } from "@/components/astrology/ZodiacSidebar";
import { TransitsPanel } from "@/components/astrology/TransitsPanel";
import { computeAspects, computePositions } from "@/lib/astrology/ephemeris";

type UniverseMode = "harmonics" | "transits";

const HudPanel = ({ children, className = "" }: { children: React.ReactNode; className?: string; glow?: string }) => (
  <div
    className={`relative rounded-xl backdrop-blur-2xl ${className}`}
    style={{
      background:
        "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
      border: "1.5px solid hsla(220,35%,60%,0.55)",
      boxShadow:
        "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 32px hsla(210,75%,62%,0.28), 0 0 64px hsla(210,70%,55%,0.18), 0 12px 40px rgba(0,0,0,0.55)",
    }}
  >
    <div
      className="absolute -top-px left-4 right-4 h-px pointer-events-none"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, hsla(200,60%,78%,0.55) 25%, hsla(200,60%,85%,0.75) 50%, hsla(200,60%,78%,0.55) 75%, transparent 100%)",
      }}
    />
    <div
      className="absolute bottom-0 left-6 right-6 h-px pointer-events-none"
      style={{
        background:
          "linear-gradient(90deg, transparent, hsla(210,40%,50%,0.15), transparent)",
      }}
    />
    {children}
  </div>
);

// Musical tones mapped to each planet's orbital frequency (scaled to audible range)
const PLANET_TONES: Record<string, { note: string; freq: string; octave: string }> = {
  mercury: { note: "C#", freq: "141.27 Hz", octave: "3rd" },
  venus: { note: "A", freq: "221.23 Hz", octave: "3rd" },
  earth: { note: "C#", freq: "136.10 Hz", octave: "3rd" },
  mars: { note: "D", freq: "144.72 Hz", octave: "3rd" },
  jupiter: { note: "F#", freq: "183.58 Hz", octave: "3rd" },
  saturn: { note: "D", freq: "147.85 Hz", octave: "3rd" },
  uranus: { note: "G#", freq: "207.36 Hz", octave: "3rd" },
  neptune: { note: "G#", freq: "211.44 Hz", octave: "3rd" },
  pluto: { note: "C#", freq: "140.25 Hz", octave: "3rd" },
};

export const HGSDashboard = ({ onSwitchView }: { onSwitchView?: () => void }) => {
  const navigate = useNavigate();
  const { play, playing, getFrequencyData } = usePlanetAudio();
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [mode, setMode] = useState<UniverseMode>("harmonics");
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [astroSelected, setAstroSelected] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  // Recompute live transits every 10 minutes
  useEffect(() => {
    if (mode !== "transits") return;
    const t = setInterval(() => setNow(new Date()), 10 * 60 * 1000);
    return () => clearInterval(t);
  }, [mode]);

  const positions = useMemo(
    () => (mode === "transits" ? computePositions(now) : []),
    [mode, now],
  );
  const aspects = useMemo(
    () => (mode === "transits" ? computeAspects(positions) : []),
    [mode, positions],
  );

  const handlePlanetClick = (planetId: string) => {
    setSelectedPlanet(selectedPlanet === planetId ? null : planetId);
  };

  const selectedData = selectedPlanet
    ? SOLAR_PLANETS.find((p) => p.id === selectedPlanet)
    : null;

  return (
    <div className="h-screen w-full relative overflow-hidden bg-background">
      {/* Full-screen visualization */}
      <div className="absolute inset-x-0 top-[92px] bottom-0 z-0">
        {mode === "harmonics" ? (
          <OrbitalResonanceField
            selectedPlanet={selectedPlanet}
            onPlanetClick={(id) => setSelectedPlanet(id)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center px-[300px]">
            <AstrologyChart
              positions={positions}
              aspects={aspects}
              selectedSign={selectedSign}
              selectedPlanet={astroSelected}
              onSignClick={(id) => setSelectedSign(selectedSign === id ? null : id)}
              onPlanetClick={(id) => setAstroSelected(astroSelected === id ? null : id)}
              onPlanetContext={(id) => play(id)}
            />
          </div>
        )}
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
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none px-4 pt-6">
        <HudPanel className="pointer-events-auto px-4 py-4 flex items-center justify-between" glow="#d4a56a">
          {/* Left: Title */}
          <div className="flex items-center gap-5">
            <div>
              <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-foreground/90">
                Universal Intelligence
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
                  color: "hsla(0,0%,100%,0.6)",
                  background: "hsla(0,0%,100%,0.04)",
                  border: "1px solid hsla(0,0%,100%,0.1)",
                  boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.06)",
                }}
              >
                Show All
              </button>
            )}
            <div
              className="flex gap-1.5 rounded-2xl p-1.5"
              style={{
                background: "hsla(228,40%,5%,0.4)", border: "1px solid hsla(220,30%,55%,0.35)", boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.05), inset 0 -1px 0 rgba(0,0,0,0.4)",
              }}
            >
              <button
                onClick={onSwitchView}
                className="min-w-[170px] text-center px-6 py-2.5 rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05] hover:text-foreground/70"
                style={{ color: "hsla(0,0%,100%,0.4)" }}
              >
                Planetary
              </button>
              <button

                className="min-w-[170px] text-center px-6 py-2.5 rounded-xl text-[11px] font-semibold tracking-[0.18em] uppercase transition-all duration-300"
                style={{
                  background: "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
                  color: "hsla(0,0%,100%,0.95)",
                  border: "1.5px solid hsla(220,35%,60%,0.55)",
                  boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 32px hsla(210,75%,62%,0.28), 0 0 64px hsla(210,70%,55%,0.18), 0 12px 40px rgba(0,0,0,0.55)",
                }}
              >
                Universal
              </button>
              <button
                onClick={() => navigate("/cosmological")}
                className="min-w-[170px] text-center px-6 py-2.5 rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05] hover:text-foreground/70"
                style={{ color: "hsla(0,0%,100%,0.4)" }}
              >
                Cosmological
              </button>
            </div>

            {/* Commons Data icon — tucked next to the toggle */}
            <button
              onClick={() => navigate("/commons")}
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 hover:bg-foreground/[0.06]"
              style={{ color: "hsla(0,0%,100%,0.75)", border: "1px solid hsla(220,30%,55%,0.35)", background: "hsla(240,25%,8%,0.5)", boxShadow: "inset 0 1px 0 hsla(200,60%,78%,0.18), inset 0 0 6px hsla(210,50%,60%,0.08), 0 0 14px -4px hsla(210,60%,65%,0.2)" }}
              title="Planetary Commons Data"
            >
              <CommonsIcon size={20} />
            </button>
          </div>
        </HudPanel>
      </div>

      {/* ─── LEFT SIDEBAR (transits mode only) ─── */}
      {mode === "transits" && (
        <div className="absolute left-4 top-[128px] bottom-4 z-10 pointer-events-none w-[260px]">
          <HudPanel className="pointer-events-auto h-full flex flex-col" glow="#d4a56a">
            <ZodiacSidebar
              positions={positions}
              selectedSign={selectedSign}
              onSelect={setSelectedSign}
            />
          </HudPanel>
        </div>
      )}

      {/* ─── RIGHT SIDEBAR ─── */}
      <div className="absolute right-4 top-[128px] bottom-4 z-10 pointer-events-none w-[260px]">
        <HudPanel className="pointer-events-auto h-full flex flex-col" glow={selectedData ? selectedData.color : "#d4a56a"}>
          {mode === "transits" ? (
            <TransitsPanel
              positions={positions}
              selectedSign={selectedSign}
              selectedPlanet={astroSelected}
              onPlanetClick={(id) => setAstroSelected(astroSelected === id ? null : id)}
              timestamp={now}
            />
          ) : selectedData ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="flex flex-col items-center gap-4">
                  <h2 className="text-[11px] font-semibold text-foreground/80 tracking-wide uppercase self-start">{selectedData.name} Frequency</h2>
                  <p className="text-[8px] text-muted-foreground/35 self-start -mt-3 tracking-wider">Cymatic pattern of {selectedData.name}'s orbital tone</p>

                  <div className="relative">
                    <LiveCymaticPattern
                      planetColor={selectedData.color}
                      planetId={selectedData.id}
                      isPlaying={playing === selectedData.id}
                      getFrequencyData={getFrequencyData}
                      size={176}
                    />
                    {playing === selectedData.id && (
                      <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-pulse" />
                    )}
                  </div>

                  {/* Musical tone info */}
                  {PLANET_TONES[selectedData.id] && (
                    <div className="w-full rounded-lg px-3 py-2" style={{ background: "hsla(240,20%,15%,0.6)", border: "1px solid hsla(38,40%,50%,0.12)" }}>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-muted-foreground/50 tracking-wider uppercase">Musical Tone</span>
                        <span className="text-[13px] font-bold tracking-wide" style={{ color: selectedData.color }}>{PLANET_TONES[selectedData.id].note}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[8px] text-muted-foreground/40 tracking-wider">Frequency</span>
                        <span className="text-[10px] text-foreground/60 font-medium">{PLANET_TONES[selectedData.id].freq}</span>
                      </div>
                    </div>
                  )}

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

                  <div className="text-[8px] text-muted-foreground/30 text-center mt-1 tracking-wider">
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
              <div className="px-3 pt-2.5 pb-1.5 border-b border-border/15">
                <h2 className="text-[10px] font-bold tracking-[0.15em] uppercase text-foreground/85 mb-0.5">Planetary Harmonics</h2>
                <p className="text-[9px] text-muted-foreground/50 leading-snug">
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
        "bottom-3 left-3 border-l border-b rounded-bl",
        "bottom-3 right-3 border-r border-b rounded-br",
      ].map((pos) => (
        <div key={pos} className={`absolute ${pos} w-5 h-5 border-border/15 z-10 pointer-events-none`} />
      ))}
    </div>
  );
};
