import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  STATIONS,
  getSeasonalPhase,
  getDayLength,
  getSunDeclination,
  getEarthOrbitalPosition,
  getPhenologyPhase,
  formatDegMin,
  type Hemisphere,
} from "@/lib/astrology/seasons";

interface Props {
  accent: string;
}

const PHASE_LABEL: Record<string, string> = {
  dormant: "Dormant",
  emerging: "Emerging",
  growing: "Growing",
  peak: "Peak",
  senescing: "Senescing",
};

export function SeasonalResponseCard({ accent }: Props) {
  const [now, setNow] = useState(() => new Date());
  const [hemi, setHemi] = useState<Hemisphere>("N");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const phase = useMemo(() => getSeasonalPhase(now, hemi), [now, hemi]);
  const phen = useMemo(() => getPhenologyPhase(now, hemi), [now, hemi]);
  const decl = useMemo(() => getSunDeclination(now), [now]);
  const orbit = useMemo(() => getEarthOrbitalPosition(now), [now]);
  const dayN = useMemo(() => getDayLength(now, 45), [now]);
  const dayS = useMemo(() => getDayLength(now, -45), [now]);

  const fluxLabel = phen.carbonFlux === "drawdown"
    ? "Carbon Drawdown"
    : phen.carbonFlux === "release"
    ? "Carbon Release"
    : "Neutral";

  return (
    <Card className="glass-panel rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Seasonal Response</h3>
          <p className="text-[10px] text-muted-foreground/55 mt-0.5">
            Solar geometry → insolation → phenology phase
          </p>
        </div>
        <div className="flex rounded-md overflow-hidden border border-border/20 text-[10px] uppercase tracking-wider">
          {(["N", "S"] as Hemisphere[]).map((h) => (
            <button
              key={h}
              onClick={() => setHemi(h)}
              className="px-2.5 py-1 transition-colors"
              style={{
                background: hemi === h ? `${accent}25` : "transparent",
                color: hemi === h ? accent : "hsla(220, 10%, 70%, 0.7)",
              }}
            >
              {h === "N" ? "Northern" : "Southern"}
            </button>
          ))}
        </div>
      </div>

      {/* Wheel-of-year linear strip */}
      <div className="space-y-1.5">
        <div className="relative h-7 rounded-md bg-muted/10 border border-border/15 overflow-hidden">
          {/* progress fill */}
          <div
            className="absolute inset-y-0 left-0"
            style={{
              width: `${(phase.solarLongitude / 360) * 100}%`,
              background: `linear-gradient(90deg, ${accent}10, ${accent}30)`,
            }}
          />
          {/* station ticks */}
          {STATIONS.map((s) => (
            <div
              key={s.id}
              className="absolute top-0 bottom-0 flex flex-col items-center"
              style={{ left: `${(s.longitude / 360) * 100}%`, transform: "translateX(-50%)" }}
              title={`${s.astroName} · ${s.traditionalName}`}
            >
              <div
                className="w-px h-full"
                style={{
                  background:
                    s.type === "solstice"
                      ? "hsla(40, 60%, 70%, 0.55)"
                      : s.type === "equinox"
                      ? "hsla(220, 15%, 80%, 0.45)"
                      : "hsla(220, 15%, 80%, 0.20)",
                }}
              />
            </div>
          ))}
          {/* current marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5"
            style={{
              left: `${(phase.solarLongitude / 360) * 100}%`,
              background: accent,
              boxShadow: `0 0 6px ${accent}`,
            }}
          />
        </div>
        <div className="flex justify-between text-[8.5px] uppercase tracking-wider text-muted-foreground/45">
          <span>Mar Eq</span>
          <span>Jun Sol</span>
          <span>Sep Eq</span>
          <span>Dec Sol</span>
        </div>
      </div>

      {/* Current segment */}
      <div className="flex items-center justify-between gap-3 text-[11px]">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground/50">From</div>
          <div className="font-mono text-foreground/85">{phase.previousStation.astroName}</div>
          <div className="text-[9px] text-muted-foreground/45">{phase.previousStation.traditionalName} · {phase.daysSincePrev.toFixed(1)}d ago</div>
        </div>
        <div className="text-center">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground/50">Season</div>
          <div className="font-semibold uppercase tracking-wider" style={{ color: accent }}>{phase.season}</div>
          <div className="text-[9px] text-muted-foreground/45">{hemi === "N" ? "Northern" : "Southern"} Hemisphere</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground/50">To</div>
          <div className="font-mono text-foreground/85">{phase.nextStation.astroName}</div>
          <div className="text-[9px] text-muted-foreground/45">{phase.nextStation.traditionalName} · {phase.daysUntilNext.toFixed(1)}d</div>
        </div>
      </div>

      {/* Biological response chips */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border/15 bg-muted/5 px-3 py-2">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground/50">NDVI Phase (proxy)</div>
          <div className="text-base font-semibold" style={{ color: accent }}>{PHASE_LABEL[phen.ndviPhase]}</div>
        </div>
        <div className="rounded-lg border border-border/15 bg-muted/5 px-3 py-2">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground/50">Carbon Flux (sign)</div>
          <div className="text-base font-semibold" style={{ color: accent }}>{fluxLabel}</div>
        </div>
      </div>

      {/* Geometry readout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
        <div className="rounded-md border border-border/10 px-2.5 py-1.5">
          <div className="text-[8.5px] uppercase tracking-wider text-muted-foreground/45">Solar λ</div>
          <div className="font-mono text-foreground/85">{formatDegMin(phase.solarLongitude)}</div>
        </div>
        <div className="rounded-md border border-border/10 px-2.5 py-1.5">
          <div className="text-[8.5px] uppercase tracking-wider text-muted-foreground/45">Sun δ</div>
          <div className="font-mono text-foreground/85">{decl >= 0 ? "+" : ""}{decl.toFixed(2)}°</div>
        </div>
        <div className="rounded-md border border-border/10 px-2.5 py-1.5">
          <div className="text-[8.5px] uppercase tracking-wider text-muted-foreground/45">Day @ 45°N</div>
          <div className="font-mono text-foreground/85">{dayN.toFixed(2)} h</div>
        </div>
        <div className="rounded-md border border-border/10 px-2.5 py-1.5">
          <div className="text-[8.5px] uppercase tracking-wider text-muted-foreground/45">Day @ 45°S</div>
          <div className="font-mono text-foreground/85">{dayS.toFixed(2)} h</div>
        </div>
        <div className="rounded-md border border-border/10 px-2.5 py-1.5 col-span-2">
          <div className="text-[8.5px] uppercase tracking-wider text-muted-foreground/45">Earth–Sun distance</div>
          <div className="font-mono text-foreground/85">{orbit.distanceAU.toFixed(5)} AU</div>
        </div>
        <div className="rounded-md border border-border/10 px-2.5 py-1.5 col-span-2">
          <div className="text-[8.5px] uppercase tracking-wider text-muted-foreground/45">Orbital phase</div>
          <div className="font-mono text-foreground/85">{(orbit.orbitalPhase * 100).toFixed(1)}% from perihelion</div>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/45 leading-relaxed">
        Axial tilt + orbital position → insolation → photosynthesis phase. NDVI phase and carbon-flux
        sign are derived from solar geometry (phase proxies), not measured remote-sensing values.
        Stations computed live from <span className="font-mono">astronomy-engine</span>.
      </p>
    </Card>
  );
}
