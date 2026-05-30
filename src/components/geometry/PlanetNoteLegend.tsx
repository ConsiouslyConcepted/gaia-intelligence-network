import { PLANET_NOTES } from "@/lib/geometry/planetNoteMap";

interface Props {
  selectedPlanet: string | null;
  onSelect: (id: string) => void;
  onPlay: (id: string) => void;
}

const GLYPH: Record<string, string> = {
  mercury: "☿", venus: "♀", earth: "⊕", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
};

/**
 * Legend strip: planet → chromatic note → ruled zodiac signs.
 * Left-click selects (highlights on wheel). Right-click plays tone.
 */
export const PlanetNoteLegend = ({ selectedPlanet, onSelect, onPlay }: Props) => {
  return (
    <div className="w-full max-w-[760px] grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5 px-2">
      {PLANET_NOTES.map((p) => {
        const isSel = selectedPlanet === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            onContextMenu={(e) => { e.preventDefault(); onPlay(p.id); }}
            className={`group relative flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-md transition-all duration-200 border ${
              isSel ? "bg-foreground/[0.08] border-foreground/30" : "bg-foreground/[0.025] border-foreground/[0.06] hover:bg-foreground/[0.05]"
            }`}
            style={{ boxShadow: isSel ? `0 0 14px ${p.color}55` : undefined }}
          >
            <span className="text-base leading-none" style={{ color: p.color, textShadow: `0 0 6px ${p.color}66` }}>
              {GLYPH[p.id]}
            </span>
            <span className="text-[8px] tracking-[0.18em] uppercase font-bold text-foreground/85">{p.name}</span>
            <span className="text-[10px] font-bold tracking-wider" style={{ color: p.color }}>{p.note}</span>
            <span className="text-[7px] tracking-[0.1em] text-muted-foreground/55 leading-tight text-center">
              {p.rules.join(" · ")}
            </span>
          </button>
        );
      })}
    </div>
  );
};
