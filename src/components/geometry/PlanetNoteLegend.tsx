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
    <div className="w-full max-w-[760px] flex flex-wrap items-stretch justify-center gap-1 px-2">
      {PLANET_NOTES.map((p) => {
        const isSel = selectedPlanet === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            onContextMenu={(e) => { e.preventDefault(); onPlay(p.id); }}
            className={`group flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200 border ${
              isSel ? "bg-foreground/[0.08] border-foreground/30" : "bg-foreground/[0.025] border-foreground/[0.06] hover:bg-foreground/[0.05]"
            }`}
            style={{ boxShadow: isSel ? `0 0 12px ${p.color}55` : undefined }}
            title={`${p.name} · ${p.note} · rules ${p.rules.join(", ")}`}
          >
            <span className="text-sm leading-none" style={{ color: p.color, textShadow: `0 0 6px ${p.color}66` }}>
              {GLYPH[p.id]}
            </span>
            <span className="text-[9px] tracking-[0.16em] uppercase font-bold text-foreground/85">{p.name}</span>
            <span className="text-[10px] font-bold tracking-wider" style={{ color: p.color }}>{p.note}</span>
          </button>
        );
      })}
    </div>
  );
};
