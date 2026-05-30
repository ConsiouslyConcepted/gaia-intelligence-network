import { PLANET_GLYPHS, SIGNS } from "@/lib/astrology/constants";
import type { PlanetPosition } from "@/lib/astrology/ephemeris";

interface Props {
  positions: PlanetPosition[];
  selectedSign: string | null;
  selectedPlanet: string | null;
  onPlanetClick: (id: string) => void;
  timestamp: Date;
}

export function TransitsPanel({ positions, selectedSign, selectedPlanet, onPlanetClick, timestamp }: Props) {
  const visible = selectedSign
    ? positions.filter((p) => p.signId === selectedSign)
    : positions;

  const signMeta = selectedSign ? SIGNS.find((s) => s.id === selectedSign) : null;

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      <div className="px-3 pt-2.5 pb-1.5 border-b border-border/15">
        <h2 className="text-[10px] font-bold tracking-[0.15em] uppercase text-foreground/85 mb-0.5">
          {signMeta ? `${signMeta.name} Transits` : "Live Transits"}
        </h2>
        <p className="text-[9px] text-muted-foreground/50 leading-snug">
          {timestamp.toUTCString().replace("GMT", "UTC")}
        </p>
      </div>

      <div className="flex-1 px-2 py-2 space-y-0.5">
        {visible.length === 0 && (
          <div className="text-[10px] text-muted-foreground/45 px-2 py-3">
            No planets currently in this sign.
          </div>
        )}
        {visible.map((p) => {
          const meta = PLANET_GLYPHS[p.id];
          if (!meta) return null;
          const isActive = selectedPlanet === p.id;
          const deg = Math.floor(p.degInSign);
          const min = Math.floor((p.degInSign - deg) * 60);
          return (
            <button
              key={p.id}
              onClick={() => onPlanetClick(p.id)}
              className="w-full text-left rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2.5 px-2 py-1.5"
              style={{
                background: isActive ? "hsla(40, 60%, 60%, 0.08)" : "transparent",
                border: `1px solid ${isActive ? "hsla(40, 60%, 65%, 0.3)" : "transparent"}`,
              }}
            >
              <span
                className="w-7 h-7 rounded-md flex items-center justify-center text-[14px]"
                style={{
                  color: meta.color,
                  background: "hsla(228, 40%, 8%, 0.7)",
                  border: `1px solid ${meta.color.replace(")", ", 0.25)").replace("hsl", "hsla")}`,
                  fontFamily: "serif",
                }}
              >
                {meta.glyph}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] tracking-wider uppercase font-medium text-foreground/85 flex items-center gap-1">
                  {meta.name}
                  {p.retrograde && (
                    <span className="text-[8px] text-muted-foreground/60 font-bold">℞</span>
                  )}
                </div>
                <div className="text-[9px] text-muted-foreground/50 tracking-wider">
                  {deg}° {min.toString().padStart(2, "0")}′ {p.signGlyph} {p.signName}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
