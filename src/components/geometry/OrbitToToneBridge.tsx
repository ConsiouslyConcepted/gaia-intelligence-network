import { useMemo } from "react";
import { ArrowRight, Orbit, Waves, Music2 } from "lucide-react";
import { PLANET_NOTES, NOTE_INDEX } from "@/lib/geometry/planetNoteMap";
import { ResonancePairDiagram } from "@/components/hgs/ResonancePairDiagram";
import type { Interval } from "@/lib/geometry/musicGeometry";

interface Props {
  selectedPlanet: string | null;
  interval: Interval;
}

/**
 * Bridges the abstract chromatic wheel to the actual Keplerian orbit
 * that produces each tone. Shows the Cousto "Cosmic Octave" derivation
 * — orbital period → fundamental → octave-scaled → audible note —
 * and, when an interval partner exists, the real orbital rose pattern
 * those two bodies trace together.
 */
export const OrbitToToneBridge = ({ selectedPlanet, interval }: Props) => {
  const planet = useMemo(
    () => PLANET_NOTES.find((p) => p.id === selectedPlanet) ?? null,
    [selectedPlanet],
  );

  const partner = useMemo(() => {
    if (!planet) return null;
    const target = (NOTE_INDEX[planet.note] + interval.semitones) % 12;
    return (
      PLANET_NOTES.find(
        (p) => p.id !== planet.id && NOTE_INDEX[p.note] === target,
      ) ?? null
    );
  }, [planet, interval]);

  const panelStyle = {
    background:
      "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
    border: "1px solid hsla(220,30%,55%,0.35)",
    boxShadow:
      "inset 0 1px 0 hsla(0,0%,100%,0.12), inset 0 -1px 0 hsla(0,0%,0%,0.4), 0 0 0 1px hsla(220,30%,30%,0.25), 0 0 24px hsla(210,75%,62%,0.18), 0 8px 28px rgba(0,0,0,0.45)",
  } as const;

  if (!planet) {
    return (
      <div
        className="relative w-full max-w-[760px] rounded-xl backdrop-blur-2xl overflow-hidden"
        style={panelStyle}
      >
        <div className="absolute -top-px left-4 right-4 h-px pointer-events-none bg-gradient-to-r from-transparent via-foreground/40 to-transparent" />
        <div className="relative flex items-center gap-2 px-3.5 pt-2.5 pb-2 border-b border-border/20">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-foreground/[0.06] border border-foreground/10">
            <Orbit className="w-2.5 h-2.5 text-foreground/70" strokeWidth={2} />
          </div>
          <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/90">
            Orbit → Tone
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-foreground/15 to-transparent" />
          <span className="text-[9px] text-foreground/55 italic tracking-wide normal-case">
            Cousto Cosmic Octave
          </span>
        </div>
        <div className="relative px-3.5 py-3 text-[10px] tracking-[0.18em] uppercase text-foreground/45 text-center">
          Select a planet to see how its orbit becomes a tone
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full max-w-[760px] rounded-xl backdrop-blur-2xl overflow-hidden"
      style={panelStyle}
    >
      <div className="absolute -top-px left-4 right-4 h-px pointer-events-none bg-gradient-to-r from-transparent via-foreground/40 to-transparent" />

      {/* Header */}
      <div className="relative flex items-center gap-2 px-3.5 pt-2.5 pb-2 border-b border-border/20">
        <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-foreground/[0.05] via-foreground/[0.015] to-transparent pointer-events-none" />
        <div className="relative w-5 h-5 rounded-md flex items-center justify-center bg-foreground/[0.06] border border-foreground/10">
          <Orbit className="w-2.5 h-2.5 text-foreground/70" strokeWidth={2} />
        </div>
        <h3 className="relative text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/90">
          Orbit → Tone
        </h3>
        <div className="relative flex-1 h-px bg-gradient-to-r from-foreground/15 to-transparent" />
        <span className="relative text-[9px] text-foreground/55 italic tracking-wide normal-case">
          Cousto Cosmic Octave
        </span>
      </div>

      {/* Body */}
      <div className="relative flex items-stretch gap-3 px-3.5 py-2.5">
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
            <span className="font-bold tracking-wider" style={{ color: planet.color }}>
              {planet.name}
            </span>
            <span className="text-foreground/45">{planet.source === "orbit" ? "orbit" : "day"}</span>

            <span className="px-1.5 py-0.5 rounded bg-foreground/[0.05] border border-foreground/10 font-mono text-foreground/85">
              {planet.period}
            </span>

            <ArrowRight className="w-3 h-3 text-foreground/35" strokeWidth={2} />

            <span className="text-foreground/45">×2</span>
            <span className="font-mono text-foreground/70">^{planet.octaves}</span>

            <ArrowRight className="w-3 h-3 text-foreground/35" strokeWidth={2} />

            <Waves className="w-3 h-3 text-foreground/55" strokeWidth={2} />
            <span className="px-1.5 py-0.5 rounded bg-foreground/[0.05] border border-foreground/10 font-mono text-foreground/85">
              {planet.freq}
            </span>

            <ArrowRight className="w-3 h-3 text-foreground/35" strokeWidth={2} />

            <Music2 className="w-3 h-3 text-foreground/55" strokeWidth={2} />
            <span className="font-bold text-foreground/95">{planet.note}</span>
          </div>

          {partner ? (
            <div className="flex items-center gap-1.5 text-[10px] text-foreground/55 leading-snug flex-wrap">
              <span className="text-foreground/45 uppercase tracking-[0.18em]">Pair</span>
              <span className="font-semibold" style={{ color: planet.color }}>
                {planet.name}
              </span>
              <span className="text-foreground/35">×</span>
              <span className="font-semibold" style={{ color: partner.color }}>
                {partner.name}
              </span>
              <span className="text-foreground/35">·</span>
              <span className="font-mono text-foreground/70">{interval.ratio}</span>
              <span className="text-foreground/35">·</span>
              <span className="italic">
                {interval.short} — their orbits trace the rose →
              </span>
            </div>
          ) : (
            <div className="text-[10px] text-foreground/45 italic">
              No planet sits a {interval.short} above {planet.name} in this scale.
            </div>
          )}
        </div>

        {partner && (
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <ResonancePairDiagram
              label={`${planet.name}-${partner.name}`}
              color1={planet.color}
              color2={partner.color}
              ratioA={Number(interval.ratio.split("/")[0]) || 1}
              ratioB={Number(interval.ratio.split("/")[1]) || 1}
              size={84}
            />
            <span className="text-[8px] tracking-[0.18em] uppercase text-foreground/45 mt-0.5">
              {interval.ratio} rose
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
