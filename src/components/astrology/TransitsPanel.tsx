import { useMemo, useState } from "react";
import { PLANET_GLYPHS, SIGNS } from "@/lib/astrology/constants";
import type { PlanetPosition, AspectLink } from "@/lib/astrology/ephemeris";
import { scoreHarmonicField } from "@/lib/astrology/harmonics";
import { getSeasonalPhase, getDayLength, formatDegMin, type Hemisphere } from "@/lib/astrology/seasons";

interface Props {
  positions: PlanetPosition[];
  aspects: AspectLink[];
  selectedSign: string | null;
  selectedPlanet: string | null;
  onPlanetClick: (id: string) => void;
  timestamp: Date;
  showPolygons: boolean;
  onTogglePolygons: () => void;
}

export function TransitsPanel({ positions, aspects, selectedSign, selectedPlanet, onPlanetClick, timestamp, showPolygons, onTogglePolygons }: Props) {
  const visible = selectedSign
    ? positions.filter((p) => p.signId === selectedSign)
    : positions;

  const signMeta = selectedSign ? SIGNS.find((s) => s.id === selectedSign) : null;
  const [hemi, setHemi] = useState<Hemisphere>("N");
  const phase = useMemo(() => getSeasonalPhase(timestamp, hemi), [timestamp, hemi]);
  const dayLen = useMemo(() => getDayLength(timestamp, hemi === "N" ? 45 : -45), [timestamp, hemi]);

  // Aspects relevant to the current selection (planet > sign > all).
  const visibleAspects = useMemo(() => {
    let list = aspects;
    if (selectedPlanet) {
      list = list.filter((x) => x.a === selectedPlanet || x.b === selectedPlanet);
    } else if (selectedSign) {
      const signPlanets = new Set(positions.filter((p) => p.signId === selectedSign).map((p) => p.id));
      list = list.filter((x) => signPlanets.has(x.a) || signPlanets.has(x.b));
    }
    return [...list].sort((a, b) => a.orb - b.orb);
  }, [aspects, selectedPlanet, selectedSign, positions]);

  const field = useMemo(() => scoreHarmonicField(aspects), [aspects]);

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

      {/* Harmonic Field — aggregate Keplerian consonance */}
      <div className="px-3 py-2.5 border-b border-border/15 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-foreground/70">Harmonic Field</span>
          <button
            onClick={onTogglePolygons}
            className="text-[8.5px] uppercase tracking-wider px-1.5 py-0.5 rounded border transition-colors"
            style={{
              background: showPolygons ? "hsla(40, 60%, 70%, 0.18)" : "transparent",
              borderColor: "hsla(220, 15%, 60%, 0.25)",
              color: showPolygons ? "hsl(40, 60%, 80%)" : "hsla(220, 10%, 70%, 0.75)",
            }}
            title="Toggle generating polygons on the wheel"
          >
            ▲ Polygons
          </button>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-muted-foreground/45 uppercase tracking-wider text-[9px]">Consonance</div>
            <div className="font-mono text-base leading-none text-foreground/90">{field.score}<span className="text-[10px] text-muted-foreground/55">/100</span></div>
          </div>
          <div className="text-right text-[9px] space-y-0.5">
            {field.mostConsonant && (
              <div className="text-foreground/75">▲ {field.mostConsonant.name}</div>
            )}
            {field.mostDissonant && field.mostDissonant.name !== field.mostConsonant?.name && (
              <div className="text-muted-foreground/55">▼ {field.mostDissonant.name}</div>
            )}
            <div className="text-muted-foreground/45 font-mono">{field.count} active</div>
          </div>
        </div>
        {/* Consonance bar */}
        <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "hsla(220, 15%, 30%, 0.4)" }}>
          <div
            className="h-full transition-all"
            style={{
              width: `${field.score}%`,
              background: "linear-gradient(90deg, hsla(220, 15%, 70%, 0.7), hsla(40, 60%, 75%, 0.85))",
            }}
          />
        </div>
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

      {/* Planets */}
      <div className="px-2 py-2 space-y-0.5 border-b border-border/15">
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

      {/* Aspects — Keplerian configurations as musical intervals */}
      <div className="px-3 py-2 flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-foreground/70">
            {selectedPlanet ? "Selected Aspects" : selectedSign ? "Sign Aspects" : "Active Aspects"}
          </span>
          <span className="text-[8.5px] text-muted-foreground/45 font-mono">{visibleAspects.length}</span>
        </div>
        {visibleAspects.length === 0 && (
          <div className="text-[10px] text-muted-foreground/45 px-1 py-2">
            No aspects within orb.
          </div>
        )}
        <div className="space-y-0.5">
          {visibleAspects.slice(0, 18).map((x, i) => {
            const aMeta = PLANET_GLYPHS[x.a];
            const bMeta = PLANET_GLYPHS[x.b];
            if (!aMeta || !bMeta) return null;
            const orbDeg = Math.floor(x.orb);
            const orbMin = Math.floor((x.orb - orbDeg) * 60);
            return (
              <div
                key={i}
                className="flex items-center gap-2 px-1.5 py-1 rounded text-[9px]"
                style={{ background: x.tier === "major" ? "hsla(220, 15%, 50%, 0.05)" : "transparent" }}
              >
                <span style={{ color: x.color, fontSize: "11px", width: 10, textAlign: "center" }}>{x.polygonGlyph}</span>
                <span style={{ color: aMeta.color, fontFamily: "serif", fontSize: "12px" }}>{aMeta.glyph}</span>
                <span style={{ color: bMeta.color, fontFamily: "serif", fontSize: "12px" }}>{bMeta.glyph}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-foreground/80 uppercase tracking-wider truncate" style={{ fontSize: "9px" }}>
                    {x.name}
                  </div>
                  <div className="text-muted-foreground/55 font-mono truncate" style={{ fontSize: "8.5px" }}>
                    {x.intervalLabel}
                  </div>
                </div>
                <div className="text-right font-mono text-muted-foreground/55" style={{ fontSize: "8.5px" }}>
                  <div>{orbDeg}°{orbMin.toString().padStart(2, "0")}′</div>
                  <div style={{ color: x.applying ? "hsla(140, 40%, 65%, 0.85)" : "hsla(220, 10%, 55%, 0.7)" }}>
                    {x.applying ? "↗ apply" : "↘ sep"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
