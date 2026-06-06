import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Volume2, Music2, Orbit } from "lucide-react";
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
import { ChromaticWheel } from "@/components/geometry/ChromaticWheel";
import { PairOrbitDiagram } from "@/components/geometry/PairOrbitDiagram";
import { IntervalsSidebar } from "@/components/geometry/IntervalsSidebar";
import { PairsPanel } from "@/components/geometry/PairsPanel";
import { PlanetNoteLegend } from "@/components/geometry/PlanetNoteLegend";
import { GeometryGuide } from "@/components/geometry/GeometryGuide";
import { IntervalLegend } from "@/components/geometry/IntervalLegend";
import { OrbitToToneBridge } from "@/components/geometry/OrbitToToneBridge";
import { NightSkyBackground } from "@/components/NightSkyBackground";
import { INTERVALS, MIRROR_PAIRS, ADJACENT_PAIRS } from "@/lib/geometry/musicGeometry";


type UniverseMode = "harmonics" | "transits" | "geometry";

const HudPanel = ({ children, className = "", topBar = false }: { children: React.ReactNode; className?: string; glow?: string; topBar?: boolean }) => (
  <div
    className={`relative rounded-xl backdrop-blur-2xl ${className}`}
    style={{
      background:
        "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
      border: "1px solid hsla(220,30%,55%,0.35)",
      boxShadow:
        "inset 0 1px 0 hsla(0,0%,100%,0.12), inset 0 -1px 0 hsla(0,0%,0%,0.4), 0 0 0 1px hsla(220,30%,30%,0.25), 0 0 32px hsla(210,75%,62%,0.28), 0 0 64px hsla(210,70%,55%,0.18), 0 12px 40px rgba(0,0,0,0.55)",
    }}
  >
    {/* Top rim — bright on panels, muted on the menu bar to match the rest of the outline */}
    <div
      className="absolute -top-px left-4 right-4 h-px pointer-events-none"
      style={{
        background: topBar
          ? "hsla(220,30%,55%,0.35)"
          : "linear-gradient(90deg, transparent 0%, hsla(200,60%,78%,0.55) 25%, hsla(200,60%,85%,0.75) 50%, hsla(200,60%,78%,0.55) 75%, transparent 100%)",
      }}
    />
    {/* Outer edge glow (inset to frame the panel) */}
    <div
      className="absolute inset-0 rounded-xl pointer-events-none"
      style={{
        boxShadow:
          "inset 0 0 18px hsla(210,50%,60%,0.06), inset 0 0 4px hsla(210,50%,60%,0.12)",
      }}
    />
    {/* Bottom subtle accent line */}
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
  const { play, stop, playing, getFrequencyData } = usePlanetAudio();

  // Ensure no tone is playing when the dashboard mounts/unmounts.
  useEffect(() => {
    stop();
    return () => stop();
  }, [stop]);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [mode, setMode] = useState<UniverseMode>("harmonics");
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [astroSelected, setAstroSelected] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const [selectedIntervalId, setSelectedIntervalId] = useState<string>("P5");
  const [selectedPairId, setSelectedPairId] = useState<string>("jup-mars");

  const selectedInterval = useMemo(
    () => INTERVALS.find((i) => i.id === selectedIntervalId) ?? INTERVALS[1],
    [selectedIntervalId],
  );
  const selectedPair = useMemo(
    () =>
      [...MIRROR_PAIRS, ...ADJACENT_PAIRS].find((p) => p.id === selectedPairId) ??
      MIRROR_PAIRS[0],
    [selectedPairId],
  );
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
    // Selecting an orbit stops any playing tone so the views don't collide.
    if (playing) play(playing);
    setSelectedPlanet(selectedPlanet === planetId ? null : planetId);
  };

  const handleTonePlay = (planetId: string) => {
    // Playing a tone clears any isolated-orbit selection.
    if (selectedPlanet) setSelectedPlanet(null);
    play(planetId);
  };

  const selectedData = selectedPlanet
    ? SOLAR_PLANETS.find((p) => p.id === selectedPlanet)
    : null;

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <NightSkyBackground />



      {/* Full-screen visualization */}
      <div className={`absolute inset-x-0 top-[92px] bottom-0 z-0 ${mode === "harmonics" ? "-translate-y-10" : mode === "transits" ? "translate-y-6" : ""}`}>
        {mode === "harmonics" ? (
          playing ? (
            <div className="w-full h-full flex items-center justify-center px-[300px]">
              {(() => {
                const tonePlanet = SOLAR_PLANETS.find((p) => p.id === playing);
                if (!tonePlanet) return null;
                return (
                  <div className="flex flex-col items-center gap-5">
                    <LiveCymaticPattern
                      planetColor={tonePlanet.color}
                      planetId={tonePlanet.id}
                      isPlaying={true}
                      getFrequencyData={getFrequencyData}
                      size={520}
                    />
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] tracking-[0.3em] uppercase text-foreground/50">
                        Cymatic Resonance
                      </span>
                      <span className="text-[15px] font-semibold tracking-wide text-foreground/90">
                        {tonePlanet.name}
                        {PLANET_TONES[tonePlanet.id] && (
                          <span className="ml-2 text-foreground/55 font-normal">
                            · {PLANET_TONES[tonePlanet.id].note} · {PLANET_TONES[tonePlanet.id].freq}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <OrbitalResonanceField
              selectedPlanet={selectedPlanet}
              onPlanetClick={(id) => handlePlanetClick(id)}
            />
          )
        ) : mode === "transits" ? (
          <div className="w-full h-full flex items-start justify-center pt-4 pb-12 px-[300px]">
            <AstrologyChart
              positions={positions}
              aspects={aspects}
              selectedSign={selectedSign}
              selectedPlanet={astroSelected}
              onSignClick={(id) => setSelectedSign(selectedSign === id ? null : id)}
              onPlanetClick={(id) => setAstroSelected(astroSelected === id ? null : id)}
              onPlanetContext={() => { /* tone playback disabled */ }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-start gap-3 overflow-y-auto pb-48 pt-20 px-4 sm:px-8 lg:px-[290px]">
            <div className="text-center">
              <h2 className="text-base font-bold text-white/85 tracking-[0.32em]">GEOMETRY OF PLANETARY HARMONICS</h2>
              <p className="text-[10px] text-white/45 tracking-[0.32em] mt-1">12-TONE CHROMATIC WHEEL · KEPLERIAN HARMONICS</p>
            </div>
            <div className="w-full max-w-5xl flex flex-col items-center gap-10">
              {/* Side-by-side panels at top */}
              <div className="w-full flex flex-col sm:flex-row gap-3">
                <GeometryGuide interval={selectedInterval} selectedPlanet={selectedPlanet} />
                <OrbitToToneBridge interval={selectedInterval} selectedPlanet={selectedPlanet} />
              </div>
              <ChromaticWheel
                interval={selectedInterval}
                size={620}
                onSelectInterval={setSelectedIntervalId}
                onPlanetClick={(id) => handlePlanetClick(id)}
                onPlanetContext={(id) => handleTonePlay(id)}
                highlightedPlanet={selectedPlanet}
              />
              <IntervalLegend selected={selectedIntervalId} onSelect={setSelectedIntervalId} />
              <PlanetNoteLegend selectedPlanet={selectedPlanet} onSelect={handlePlanetClick} onPlay={handleTonePlay} />
            </div>

          </div>
        )}
      </div>


      {/* ─── TOP BAR ─── */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none px-4 pt-6">
        <HudPanel className="pointer-events-auto px-4 py-4 flex items-center justify-between" glow="#d4a56a" topBar>
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
                className="text-[11px] uppercase tracking-[0.18em] transition-all duration-300 px-6 py-2.5 rounded-xl font-semibold"
                style={{
                  background: "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
                  color: "hsla(0,0%,100%,0.95)",
                  border: "1.5px solid hsla(220,35%,60%,0.55)",
                  boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 24px hsla(210,70%,60%,0.25), 0 0 48px hsla(210,70%,55%,0.15), 0 12px 32px rgba(0,0,0,0.5)",
                }}
              >
                Show All
              </button>
            )}
            <div
              className="flex gap-1.5 rounded-2xl p-1.5"
              style={{
                background: "hsla(228,40%,5%,0.6)",
                border: "1px solid hsla(220,40%,65%,0.5)",
                boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.08), inset 0 -1px 0 rgba(0,0,0,0.4), 0 0 24px hsla(210,70%,60%,0.28), 0 0 48px hsla(210,70%,55%,0.18), 0 12px 32px rgba(0,0,0,0.5)",
                backdropFilter: "blur(12px)",
              }}
            >
              <button
                onClick={onSwitchView}
                className="min-w-[140px] text-center px-5 py-2.5 rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05] hover:text-foreground/70"
                style={{ color: "hsla(0,0%,100%,0.4)" }}
              >
                Planetary
              </button>
              <button

                className="min-w-[140px] text-center px-5 py-2.5 rounded-xl text-[11px] font-semibold tracking-[0.18em] uppercase transition-all duration-300"
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
                onClick={() => navigate("/galactic")}
                className="min-w-[140px] text-center px-5 py-2.5 rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05] hover:text-foreground/70"
                style={{ color: "hsla(0,0%,100%,0.4)" }}
              >
                Galactic
              </button>
              <button
                onClick={() => navigate("/cosmological")}
                className="min-w-[140px] text-center px-5 py-2.5 rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05] hover:text-foreground/70"
                style={{ color: "hsla(0,0%,100%,0.4)" }}
              >
                Cosmological
              </button>
            </div>

            {/* Commons Data icon — tucked next to the toggle */}
            <button
              onClick={() => navigate("/commons")}
              className="flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300"
              style={{
                color: "hsla(0,0%,100%,0.85)",
                background: "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
                border: "1.5px solid hsla(220,35%,60%,0.55)",
                boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 24px hsla(210,70%,60%,0.25), 0 0 48px hsla(210,70%,55%,0.15), 0 12px 32px rgba(0,0,0,0.5)",
              }}
              title="Planetary Commons Data"
            >
              <CommonsIcon size={20} />
            </button>
          </div>
        </HudPanel>
      </div>

      {/* ─── FLOATING SUB-MODE TOGGLE (bottom-center) ─── */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      >


        <div
          className="pointer-events-auto flex gap-1 rounded-2xl p-1.5"
          style={{
            background: "hsla(228,40%,5%,0.6)",
            border: "1px solid hsla(220,40%,65%,0.5)",
            boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.08), inset 0 -1px 0 rgba(0,0,0,0.4), 0 0 24px hsla(210,70%,60%,0.28), 0 0 48px hsla(210,70%,55%,0.18), 0 12px 32px rgba(0,0,0,0.5)",
            backdropFilter: "blur(12px)",
          }}
        >
          {[
            { id: "harmonics" as const, label: "Orbits" },
            { id: "geometry" as const, label: "Intervals" },
            { id: "transits" as const, label: "Transits" },
          ].map(({ id, label }) => {
            const active = mode === id;
            return (
              <button
                key={id}
                onClick={() => setMode(id)}
                className="min-w-[170px] text-center px-5 py-2 rounded-xl text-[10px] font-semibold tracking-[0.2em] uppercase transition-all duration-300"
                style={
                  active
                    ? {
                        background: "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
                        color: "hsla(0,0%,100%,0.95)",
                        border: "1px solid hsla(220,35%,60%,0.55)",
                        boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 22px hsla(210,75%,62%,0.25)",
                      }
                    : {
                        color: "hsla(0,0%,100%,0.45)",
                        border: "1px solid transparent",
                      }
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── LEFT SIDEBAR ─── */}
      {mode === "transits" ? (
        <div className="absolute left-4 top-1/2 -translate-y-[38%] z-10 pointer-events-none w-[250px] h-[620px]">
          <HudPanel className="pointer-events-auto h-full flex flex-col" glow="#d4a56a">
            <ZodiacSidebar
              positions={positions}
              selectedSign={selectedSign}
              onSelect={setSelectedSign}
            />
          </HudPanel>
        </div>
      ) : mode === "geometry" ? (
        <div className="absolute left-4 top-1/2 -translate-y-[38%] z-10 pointer-events-none w-[250px] h-[620px]">
          <HudPanel className="pointer-events-auto h-full flex flex-col" glow="#d4a56a">
            <IntervalsSidebar
              selected={selectedIntervalId}
              onSelect={setSelectedIntervalId}
            />
          </HudPanel>
        </div>
      ) : (
        <div className="absolute left-4 top-1/2 -translate-y-[38%] z-10 pointer-events-none w-[250px] h-[620px]">
          <HudPanel className="pointer-events-auto h-full flex flex-col" glow="#d4a56a">
            <div className="flex-1 overflow-y-auto flex flex-col">
              {/* Header */}
              <div className="relative px-3.5 pt-3 pb-2.5 border-b border-border/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.05] via-foreground/[0.015] to-transparent pointer-events-none" />
                <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent" />
                <div className="relative flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center bg-foreground/[0.06] border border-foreground/10">
                    <Music2 className="w-2.5 h-2.5 text-foreground/70" strokeWidth={2} />
                  </div>
                  <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/90">Planetary Tones</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-foreground/15 to-transparent" />
                </div>
                <p className="relative text-[9px] text-muted-foreground/55 leading-snug pl-7">
                  Tap a planet to hear its orbital tone.
                </p>
              </div>

              {/* Planet tone list */}
              <div className="flex-1 px-2 py-2 space-y-1">
                {SOLAR_PLANETS.map((p) => {
                  const tone = PLANET_TONES[p.id];
                  const isPlaying = playing === p.id;
                  const isSelected = selectedPlanet === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleTonePlay(p.id)}
                      onContextMenu={(e) => { e.preventDefault(); handlePlanetClick(p.id); }}
                      className={`w-full flex items-center gap-2.5 px-2.5 rounded-lg transition-all duration-200 text-left ${
                        isSelected ? "bg-foreground/[0.06]" : "hover:bg-foreground/[0.04]"
                      }`}
                      style={{
                        height: "52px",
                        border: `1px solid ${isPlaying ? "hsla(210,70%,65%,0.45)" : "hsla(0,0%,100%,0.05)"}`,
                        boxShadow: isPlaying ? "0 0 16px hsla(210,70%,60%,0.25)" : "none",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${p.color}cc, ${p.color}33)`,
                          boxShadow: isPlaying ? `0 0 12px ${p.color}aa` : `0 0 6px ${p.color}55`,
                        }}
                      >
                        <Volume2
                          className={`w-4 h-4 ${isPlaying ? "animate-pulse" : ""}`}
                          style={{ color: isPlaying ? "#fff" : "hsla(0,0%,100%,0.6)" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-foreground/85 tracking-wide">{p.name}</span>
                          {tone && (
                            <span className="text-[10px] font-bold tracking-wide" style={{ color: p.color }}>{tone.note}</span>
                          )}
                        </div>
                        {tone && (
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-[8px] text-muted-foreground/45 tracking-wider uppercase">
                              {isPlaying ? "Playing" : "Orbital Tone"}
                            </span>
                            <span className="text-[9px] text-foreground/55 font-medium">{tone.freq}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="px-3 py-2 border-t border-border/15">
                <p className="text-[8px] text-muted-foreground/35 tracking-wider text-center leading-relaxed">
                  Left-click to hear · Right-click to isolate resonance
                </p>
              </div>
            </div>
          </HudPanel>
        </div>
      )}


      {/* ─── RIGHT SIDEBAR ─── */}
      <div className="absolute right-4 top-1/2 -translate-y-[38%] z-10 pointer-events-none w-[250px] h-[620px]">
        <HudPanel className="pointer-events-auto h-full flex flex-col" glow={selectedData ? selectedData.color : "#d4a56a"}>
          {mode === "transits" ? (
            <TransitsPanel
              positions={positions}
              selectedSign={selectedSign}
              selectedPlanet={astroSelected}
              onPlanetClick={(id) => setAstroSelected(astroSelected === id ? null : id)}
              timestamp={now}
            />
          ) : mode === "geometry" ? (
            <PairsPanel
              selectedPairId={selectedPairId}
              onSelect={setSelectedPairId}
              onPlanetContext={(id) => handleTonePlay(id)}
            />
          ) : (
            <div className="flex-1 overflow-y-auto flex flex-col">
              {/* Header */}
              <div className="relative px-3.5 pt-3 pb-2.5 border-b border-border/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.05] via-foreground/[0.015] to-transparent pointer-events-none" />
                <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent" />
                <div className="relative flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center bg-foreground/[0.06] border border-foreground/10">
                    <Orbit className="w-2.5 h-2.5 text-foreground/70" strokeWidth={2} />
                  </div>
                  <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/90">Planetary Orbits</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-foreground/15 to-transparent" />
                </div>
                <p className="relative text-[9px] text-muted-foreground/55 leading-snug pl-7">
                  Resonance between adjacent orbits.
                </p>
              </div>

              {/* Resonance pairs list */}
              <div className="flex-1 px-2 py-2 space-y-1">
                {PLANET_RESONANCE_PAIRS.map((pair) => {
                  const p1 = SOLAR_PLANETS[pair.i];
                  return (
                    <button
                      key={pair.label}
                      onClick={() => handlePlanetClick(p1.id)}
                      className="w-full text-left rounded-lg hover:bg-foreground/[0.04] transition-all duration-200 cursor-pointer flex items-center"
                      style={{ height: "52px", border: "1px solid hsla(0,0%,100%,0.05)" }}
                    >
                      <ResonancePairDiagram label={pair.label} color1={pair.c1} color2={pair.c2} ratioA={pair.a} ratioB={pair.b} size={44} />
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
