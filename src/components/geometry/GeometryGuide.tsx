import { useMemo } from "react";
import { Sparkles, MousePointerClick, Music2 } from "lucide-react";
import { PLANET_NOTES, NOTE_INDEX } from "@/lib/geometry/planetNoteMap";
import type { Interval } from "@/lib/geometry/musicGeometry";

interface Props {
  interval: Interval;
  selectedPlanet: string | null;
}

/**
 * Narrative banner above the chromatic wheel.
 * Translates the abstract geometry into plain language that updates with selection.
 */
export const GeometryGuide = ({ interval, selectedPlanet }: Props) => {
  const planet = useMemo(
    () => PLANET_NOTES.find((p) => p.id === selectedPlanet) ?? null,
    [selectedPlanet],
  );

  // Find sibling planets that sit `interval.semitones` away from the selected one.
  const harmonicLinks = useMemo(() => {
    if (!planet) return [];
    const baseIdx = NOTE_INDEX[planet.note];
    const target = (baseIdx + interval.semitones) % 12;
    return PLANET_NOTES.filter(
      (p) => p.id !== planet.id && NOTE_INDEX[p.note] === target,
    );
  }, [planet, interval]);

  return (
    <div
      className="relative w-full max-w-[480px] rounded-xl backdrop-blur-xl"
      style={{
        background:
          "linear-gradient(145deg, hsla(220,30%,16%,0.85) 0%, hsla(225,35%,10%,0.85) 100%)",
        border: "1px solid hsla(220,40%,65%,0.55)",
        boxShadow:
          "inset 0 1px 0 hsla(0,0%,100%,0.15), 0 0 0 1px hsla(220,30%,30%,0.35), 0 0 32px hsla(210,75%,62%,0.22), 0 8px 28px rgba(0,0,0,0.5)",
      }}
    >
      <div className="absolute -top-px left-4 right-4 h-px pointer-events-none bg-gradient-to-r from-transparent via-foreground/50 to-transparent" />


      {/* Header strip */}
      <div className="relative flex items-center gap-2 px-3.5 pt-2.5 pb-2 border-b border-border/20">
        <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-foreground/[0.05] via-foreground/[0.015] to-transparent pointer-events-none" />
        <div className="relative w-5 h-5 rounded-md flex items-center justify-center bg-foreground/[0.06] border border-foreground/10">
          <Music2 className="w-2.5 h-2.5 text-foreground/70" strokeWidth={2} />
        </div>
        <h3 className="relative text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/90">
          Active Interval
        </h3>
        <span className="relative font-bold text-foreground/95 text-[11px]">{interval.short}</span>
        <span className="relative text-foreground/35 text-[10px]">·</span>
        <span className="relative text-foreground/75 font-mono text-[10px]">{interval.ratio}</span>
        <div className="relative flex-1 h-px bg-gradient-to-r from-foreground/15 to-transparent" />
        <span className="relative text-[9px] text-foreground/55 tracking-wide normal-case">
          {interval.desc}
        </span>
      </div>

      {/* Body */}
      <div className="relative px-3.5 py-2.5">
        {planet ? (
          <div className="flex items-center gap-2 text-[11px] leading-snug flex-wrap">
            <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: planet.color }} strokeWidth={2} />
            <span style={{ color: planet.color }} className="font-bold tracking-wider">
              {planet.name}
            </span>
            <span className="text-foreground/55">resonates at</span>
            <span className="text-foreground/90 font-bold">{planet.note}</span>
            <span className="text-foreground/35">·</span>
            <span className="text-foreground/55 italic">{planet.trait}</span>
            {harmonicLinks.length > 0 && (
              <>
                <span className="text-foreground/35 mx-1">→</span>
                <span className="text-foreground/55">a {interval.short} above lands on</span>
                {harmonicLinks.map((h) => (
                  <span key={h.id} className="font-bold tracking-wider" style={{ color: h.color }}>
                    {h.name}
                  </span>
                ))}
              </>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-2 text-[11px] text-foreground/55 leading-snug">
            <MousePointerClick className="w-3 h-3 flex-shrink-0 mt-0.5 text-foreground/45" strokeWidth={2} />
            <span>
              Each <span className="text-foreground/85 font-semibold">chord polygon</span> connects notes separated by the
              active interval. Planets sit at the notes their orbital frequency tunes to —
              <span className="text-foreground/85 font-semibold"> click any planet glyph</span> to trace its harmonic neighbours,
              or <span className="text-foreground/85 font-semibold">right-click</span> to hear its tone.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
