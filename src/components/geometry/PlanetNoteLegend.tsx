import { PLANET_NOTES } from "@/lib/geometry/planetNoteMap";
import { Volume2 } from "lucide-react";

interface Props {
  selectedPlanet: string | null;
  onSelect: (id: string) => void;
  onPlay: (id: string) => void;
  playingPlanet?: string | null;
}

const GLYPH: Record<string, string> = {
  mercury: "☿", venus: "♀", earth: "⊕", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
};

/**
 * Legend strip: planet → chromatic note → ruled zodiac signs.
 * Left-click the row selects (highlights on wheel).
 * Click the speaker icon (or right-click the row) plays/stops the orbital tone.
 */
export const PlanetNoteLegend = ({ selectedPlanet, onSelect, onPlay, playingPlanet }: Props) => {
  return (
    <div className="w-full max-w-[760px] flex flex-col items-center gap-2 px-2">
      <div className="text-[9px] tracking-[0.28em] uppercase text-foreground/55 flex items-center gap-2">
        <Volume2 className="w-3 h-3" />
        <span>Tap the speaker to hear each planet's orbital tone</span>
      </div>
      <div className="w-full flex flex-wrap items-stretch justify-center gap-1">
        {PLANET_NOTES.map((p) => {
          const isSel = selectedPlanet === p.id;
          const isPlaying = playingPlanet === p.id;
          return (
            <div
              key={p.id}
              className={`group flex items-center gap-1.5 px-1.5 py-1 rounded-md transition-all duration-200 border ${
                isSel ? "bg-foreground/[0.08] border-foreground/30" : "bg-foreground/[0.025] border-foreground/[0.06] hover:bg-foreground/[0.05]"
              }`}
              style={{ boxShadow: isSel ? `0 0 12px ${p.color}55` : isPlaying ? `0 0 12px ${p.color}99` : undefined }}
              title={`${p.name} · ${p.note} · rules ${p.rules.join(", ")}`}
            >
              <button
                onClick={() => onSelect(p.id)}
                onContextMenu={(e) => { e.preventDefault(); onPlay(p.id); }}
                className="flex items-center gap-1.5"
              >
                <span className="text-sm leading-none" style={{ color: p.color, textShadow: `0 0 6px ${p.color}66` }}>
                  {GLYPH[p.id]}
                </span>
                <span className="text-[9px] tracking-[0.16em] uppercase font-bold text-foreground/85">{p.name}</span>
                <span className="text-[10px] font-bold tracking-wider" style={{ color: p.color }}>{p.note}</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onPlay(p.id); }}
                aria-label={`${isPlaying ? "Stop" : "Play"} ${p.name} orbital tone`}
                className="ml-0.5 w-5 h-5 rounded-full flex items-center justify-center border transition-all"
                style={{
                  background: isPlaying ? `${p.color}33` : "hsla(0,0%,100%,0.04)",
                  borderColor: isPlaying ? `${p.color}aa` : "hsla(0,0%,100%,0.12)",
                }}
              >
                <Volume2
                  className={`w-2.5 h-2.5 ${isPlaying ? "animate-pulse" : ""}`}
                  style={{ color: isPlaying ? p.color : "hsla(0,0%,100%,0.7)" }}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
