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

  if (!planet) {
    return (
      <div className="w-full max-w-[760px] px-3 py-2 rounded-lg border border-foreground/10 bg-foreground/[0.02] text-[10px] tracking-[0.18em] uppercase text-foreground/45 text-center">
        Select a planet to see how its orbit becomes a tone
      </div>
    );
  }

  return (
    <div className="w-full max-w-[760px] flex items-stretch gap-3 px-3 py-2.5 rounded-lg border border-foreground/10 bg-foreground/[0.025] backdrop-blur-sm">
      {/* Derivation chain */}
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-[9px] tracking-[0.22em] uppercase text-foreground/50">
          <Orbit className="w-3 h-3" strokeWidth={2} />
          <span>Orbit → Tone</span>
          <span className="text-foreground/30">·</span>
          <span className="text-foreground/70 normal-case tracking-normal italic">
            Cousto Cosmic Octave
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
          <span className="font-bold tracking-wider" style={{ color: planet.color }}>
            {planet.name}
          </span>
          <span className="text-foreground/45">{planet.source === "orbit" ? "orbit" : "day"}</span>

          <span className="px-1.5 py-0.5 rounded bg-foreground/[0.05] font-mono text-foreground/85">
            {planet.period}
          </span>

          <ArrowRight className="w-3 h-3 text-foreground/35" strokeWidth={2} />

          <span className="text-foreground/45">×2</span>
          <span className="font-mono text-foreground/70">^{planet.octaves}</span>

          <ArrowRight className="w-3 h-3 text-foreground/35" strokeWidth={2} />

          <Waves className="w-3 h-3 text-foreground/55" strokeWidth={2} />
          <span className="px-1.5 py-0.5 rounded bg-foreground/[0.05] font-mono text-foreground/85">
            {planet.freq}
          </span>

          <ArrowRight className="w-3 h-3 text-foreground/35" strokeWidth={2} />

          <Music2 className="w-3 h-3 text-foreground/55" strokeWidth={2} />
          <span className="font-bold text-foreground/95">{planet.note}</span>
        </div>

        {partner ? (
          <div className="flex items-center gap-1.5 text-[10px] text-foreground/55 leading-snug">
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

      {/* Live orbit rose for the pair */}
      {partner && (
        <div className="flex-shrink-0 flex flex-col items-center justify-center">
          <ResonancePairDiagram
            label={`${planet.name}-${partner.name}`}
            color1={planet.color}
            color2={partner.color}
            ratioA={Number(interval.ratio.split(":")[0]) || 1}
            ratioB={Number(interval.ratio.split(":")[1]) || 1}
            size={84}
          />
          <span className="text-[8px] tracking-[0.18em] uppercase text-foreground/45 mt-0.5">
            {interval.ratio} rose
          </span>
        </div>
      )}
    </div>
  );
};
