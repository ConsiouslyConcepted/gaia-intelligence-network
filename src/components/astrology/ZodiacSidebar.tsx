import { SIGNS } from "@/lib/astrology/constants";
import type { PlanetPosition } from "@/lib/astrology/ephemeris";

interface Props {
  positions: PlanetPosition[];
  selectedSign: string | null;
  onSelect: (id: string | null) => void;
}

export function ZodiacSidebar({ positions, selectedSign, onSelect }: Props) {
  const transitsBySign = positions.reduce<Record<string, PlanetPosition[]>>((acc, p) => {
    (acc[p.signId] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      <div className="px-3 pt-2.5 pb-1.5 border-b border-border/15">
        <h2 className="text-[10px] font-bold tracking-[0.15em] uppercase text-foreground/85 mb-0.5">
          Zodiac Signs
        </h2>
        <p className="text-[9px] text-muted-foreground/50 leading-snug">
          Tap a sign to focus the wheel and see which planets currently transit it.
        </p>
      </div>

      <div className="flex-1 px-2 py-2 space-y-0.5">
        {SIGNS.map((s) => {
          const isActive = selectedSign === s.id;
          const transits = transitsBySign[s.id] || [];
          return (
            <button
              key={s.id}
              onClick={() => onSelect(isActive ? null : s.id)}
              className="w-full text-left rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-2.5 px-2 py-1.5"
              style={{
                background: isActive ? "hsla(40, 60%, 60%, 0.10)" : "transparent",
                border: `1px solid ${isActive ? "hsla(40, 60%, 65%, 0.35)" : "transparent"}`,
              }}
            >
              <span
                className="w-7 h-7 rounded-md flex items-center justify-center text-[15px]"
                style={{
                  color: s.tint,
                  background: "hsla(228, 40%, 8%, 0.7)",
                  border: "1px solid hsla(40, 30%, 60%, 0.18)",
                  fontFamily: '"Times New Roman", "DejaVu Serif", "Noto Serif", serif',
                  fontVariantEmoji: "text",
                } as React.CSSProperties}
              >
                {`${s.glyph}\uFE0E`}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] tracking-wider uppercase font-medium text-foreground/85">
                  {s.name}
                </div>
                <div className="text-[8px] text-muted-foreground/45 tracking-wider uppercase">
                  {s.element} · {s.modality} · {s.ruler}
                </div>
              </div>
              {transits.length > 0 && (
                <div className="flex gap-0.5">
                  {transits.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: s.tint }}
                      title={t.id}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
