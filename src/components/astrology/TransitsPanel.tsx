import { useMemo, useState } from "react";
import { PLANET_GLYPHS, SIGNS } from "@/lib/astrology/constants";
import type { PlanetPosition } from "@/lib/astrology/ephemeris";
import { getSeasonalPhase, getDayLength, formatDegMin, type Hemisphere } from "@/lib/astrology/seasons";

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
  const [hemi, setHemi] = useState<Hemisphere>("N");
  const phase = useMemo(() => getSeasonalPhase(timestamp, hemi), [timestamp, hemi]);
  const dayLen = useMemo(() => getDayLength(timestamp, hemi === "N" ? 45 : -45), [timestamp, hemi]);

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

      {/* Wheel of the Year — seasonal context */}
      <div className="px-3 py-2.5 border-b border-border/15 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-foreground/70">Wheel of the Year</span>
          <div className="flex rounded overflow-hidden border border-border/20 text-[8.5px] uppercase tracking-wider">
            {(["N","S"] as Hemisphere[]).map(h => (
              <button key={h} onClick={() => setHemi(h)} className="px-1.5 py-0.5 transition-colors"
                style={{ background: hemi===h ? "hsla(40, 60%, 70%, 0.18)" : "transparent",
                  color: hemi===h ? "hsl(40, 60%, 80%)" : "hsla(220, 10%, 65%, 0.7)" }}>
                {h}H
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-[9px]">
          <div>
            <div className="text-muted-foreground/45 uppercase tracking-wider">Season</div>
            <div className="font-semibold uppercase tracking-wider text-foreground/85">{phase.season}</div>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground/45 uppercase tracking-wider">Next</div>
            <div className="font-mono text-foreground/85" title={phase.nextStation.traditionalName}>
              {phase.nextStation.astroName.replace(/(Cross-Quarter|Equinox|Solstice)/, m => m === "Cross-Quarter" ? "Cross-Q" : m)}
            </div>
            <div className="text-muted-foreground/45 font-mono">in {phase.daysUntilNext.toFixed(1)}d</div>
          </div>
        </div>
        <div className="flex justify-between text-[8.5px] text-muted-foreground/50 font-mono pt-1 border-t border-border/10">
          <span>λ {formatDegMin(phase.solarLongitude)}</span>
          <span>Day {dayLen.toFixed(2)}h @ {hemi === "N" ? "45°N" : "45°S"}</span>
        </div>
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
                className="w-9 h-9 rounded-md flex items-center justify-center text-[17px]"
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
                  {deg}° {min.toString().padStart(2, "0")}′ {p.signName}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
