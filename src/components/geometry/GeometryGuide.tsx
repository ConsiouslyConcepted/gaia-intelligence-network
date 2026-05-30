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
    <div className="w-full max-w-[760px] flex flex-col gap-2 px-3 py-2.5 rounded-lg border border-foreground/10 bg-foreground/[0.025] backdrop-blur-sm">
      {/* Top line: what the user is seeing */}
      <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase">
        <Music2 className="w-3 h-3 text-foreground/55" strokeWidth={2} />
        <span className="text-foreground/55">Active Interval</span>
        <span className="font-bold text-foreground/90">{interval.short}</span>
        <span className="text-foreground/35">·</span>
        <span className="text-foreground/70 font-mono">{interval.ratio}</span>
        <span className="text-foreground/35">·</span>
        <span className="text-foreground/55 normal-case tracking-normal">{interval.desc}</span>
      </div>

      {/* Bottom line: contextual narrative */}
      {planet ? (
        <div className="flex items-center gap-2 text-[11px] leading-snug">
          <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: planet.color }} strokeWidth={2} />
          <span style={{ color: planet.color }} className="font-bold tracking-wider">
            {planet.name}
          </span>
          <span className="text-foreground/55">resonates at</span>
          <span className="text-foreground/90 font-bold">{planet.note}</span>
          <span className="text-foreground/55">·</span>
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
        <div className="flex items-center gap-2 text-[11px] text-foreground/55 leading-snug">
          <MousePointerClick className="w-3 h-3 flex-shrink-0 text-foreground/45" strokeWidth={2} />
          <span>
            Each <span className="text-foreground/85 font-semibold">chord polygon</span> connects notes separated by the
            active interval. Planets sit at the notes their orbital frequency tunes to —
            <span className="text-foreground/85 font-semibold"> click any planet glyph</span> to trace its harmonic neighbours,
            or <span className="text-foreground/85 font-semibold">right-click</span> to hear its tone.
          </span>
        </div>
      )}
    </div>
  );
};
