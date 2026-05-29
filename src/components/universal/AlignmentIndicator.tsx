import { useMemo } from "react";
import { detectAlignment, PlanetState } from "@/lib/orbitalMechanics";
import { SOLAR_PLANETS } from "@/types/solarPlanets";

export const AlignmentIndicator = ({ states }: { states: PlanetState[] }) => {
  const result = useMemo(() => detectAlignment(states, 3, 15), [states]);
  const planets = result.planets
    .map((id) => SOLAR_PLANETS.find((p) => p.id === id))
    .filter(Boolean);

  return (
    <div
      className="absolute bottom-6 left-4 z-10 pointer-events-auto rounded-xl backdrop-blur-2xl px-4 py-3"
      style={{
        background:
          "linear-gradient(145deg, hsla(240,20%,13%,0.92) 0%, hsla(240,25%,9%,0.88) 100%)",
        border: `1px solid ${result.aligned ? "hsla(38,80%,60%,0.4)" : "hsla(0,0%,100%,0.08)"}`,
        boxShadow: result.aligned
          ? "0 0 30px hsla(38,60%,60%,0.18), 0 8px 24px rgba(0,0,0,0.6)"
          : "0 8px 24px rgba(0,0,0,0.6)",
        width: 220,
      }}
    >
      <div className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/55 mb-1">Alignment</div>
      <div className="text-[12px] font-semibold text-foreground/85 mb-2">
        {result.aligned ? `${planets.length} planets · ${result.spread.toFixed(1)}°` : "No conjunction"}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {planets.length > 0
          ? planets.map((p: any) => (
              <span
                key={p.id}
                className="text-[8px] tracking-wider uppercase px-1.5 py-0.5 rounded"
                style={{
                  color: p.color,
                  background: `${p.color}1a`,
                  border: `1px solid ${p.color}33`,
                }}
              >
                {p.name}
              </span>
            ))
          : (
            <span className="text-[8px] tracking-wider uppercase text-muted-foreground/40">
              Threshold · 15° · 3+
            </span>
          )}
      </div>
    </div>
  );
};
