import { Card } from "@/components/ui/card";
import {
  useNOAAKpIndex,
  useNOAASolarWind,
  useNOAAMagField,
  useNOAAXRayFlux,
  useNOAASolarCycle,
} from "@/hooks/usePlanetaryData";
import { Loader2, Sun, Wind, Zap, Activity, ArrowDown } from "lucide-react";

const DOWNSTREAM = [
  { label: "Magnetosphere", note: "IMF Bz drives reconnection · storms compress dayside" },
  { label: "Atmosphere",    note: "EUV/UV heats and ionizes upper layers · flare SIDs" },
  { label: "Hydrosphere",   note: "TSI modulation forces ocean heat content over cycles" },
  { label: "Biosphere",     note: "UV-B stress · cosmic-ray modulation of cloud nucleation" },
];

export function HeliosphereLiveState({ accent }: { accent: string }) {
  const { data: kpData, isLoading: kpLoading } = useNOAAKpIndex();
  const { data: solarWind, isLoading: swLoading } = useNOAASolarWind();
  const { data: magField, isLoading: magLoading } = useNOAAMagField();
  const { data: xray, isLoading: xrayLoading } = useNOAAXRayFlux();
  const { data: cycle, isLoading: cycleLoading } = useNOAASolarCycle();

  const latestKp = kpData?.[kpData.length - 1];
  const latestSW = solarWind?.[solarWind.length - 1];
  const latestMag = magField?.[magField.length - 1];
  const latestXray = xray?.[0];
  const latestCycle = cycle?.[cycle.length - 1];

  return (
    <div className="space-y-4">
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Sunspot Number", value: latestCycle?.ssn?.toFixed(0) ?? "—", unit: "SSN", loading: cycleLoading, Icon: Sun },
          { label: "Solar Wind Speed", value: latestSW?.speed?.toFixed(0) ?? "—", unit: "km/s", loading: swLoading, Icon: Wind },
          { label: "X-Ray Flux", value: latestXray?.currentFlux ? Number(latestXray.currentFlux).toExponential(1) : "—", unit: latestXray?.classType ?? "W/m²", loading: xrayLoading, Icon: Zap },
          { label: "IMF Bt", value: latestMag?.bt?.toFixed(1) ?? "—", unit: "nT", loading: magLoading, Icon: Activity },
        ].map((v, i) => (
          <Card key={i} className="glass-panel rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 flex items-center gap-1.5">
                <v.Icon className="w-3 h-3" style={{ color: accent }} />
                {v.label}
              </span>
              {v.loading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground/30" />}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono" style={{ color: accent }}>{v.value}</span>
              <span className="text-[10px] text-muted-foreground/40 uppercase">{v.unit}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Solar cycle progression */}
      <Card className="glass-panel rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Solar Cycle Progression — 36-month SSN (NOAA)</h3>
          <span className="text-[9px] text-muted-foreground/30 font-mono">
            {cycle ? `${cycle.length} months` : "loading..."}
          </span>
        </div>
        {cycle && (
          <div className="h-28 flex items-end gap-1">
            {cycle.map((d, i) => {
              const max = Math.max(...cycle.map((c) => c.ssn || 0), 1);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all"
                  style={{
                    height: `${Math.max(6, ((d.ssn || 0) / max) * 100)}%`,
                    backgroundColor: `${accent}${d.ssn > 150 ? "cc" : d.ssn > 80 ? "80" : "40"}`,
                  }}
                  title={`${d.time}: SSN ${d.ssn}`}
                />
              );
            })}
          </div>
        )}
      </Card>

      {/* IMF + Kp summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="glass-panel rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold">Interplanetary Magnetic Field</h3>
          {magField && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Bx", value: latestMag?.bx?.toFixed(2) },
                { label: "By", value: latestMag?.by?.toFixed(2) },
                { label: "Bz", value: latestMag?.bz?.toFixed(2) },
              ].map((c, i) => (
                <div key={i} className="px-2 py-1.5 rounded-md bg-muted/5 border border-border/10">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40">{c.label}</span>
                  <div className="text-base font-bold font-mono mt-0.5" style={{ color: accent }}>
                    {c.value} <span className="text-[9px] text-muted-foreground/40">nT</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="glass-panel rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Geomagnetic Response · Kp Index</h3>
            {kpLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground/30" />}
          </div>
          {kpData && (
            <div className="h-16 flex items-end gap-0.5">
              {kpData.slice(-24).map((d, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${Math.max(8, (d.kp / 9) * 100)}%`,
                    backgroundColor: `${accent}${d.kp > 5 ? "cc" : d.kp > 3 ? "70" : "30"}`,
                  }}
                  title={`Kp ${d.kp} · ${d.time}`}
                />
              ))}
            </div>
          )}
          <div className="text-[10px] text-muted-foreground/50">
            Current Kp: <span className="font-mono" style={{ color: accent }}>{latestKp?.kp?.toFixed(1) ?? "—"}</span>
          </div>
        </Card>
      </div>

      {/* Downstream transmission pathways */}
      <Card className="glass-panel rounded-xl p-5 space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Downstream Influence Pathways</h3>
          <p className="text-[10px] text-muted-foreground/50 mt-0.5">
            Solar activity propagates inward through the planetary system
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {DOWNSTREAM.map((d) => (
            <div
              key={d.label}
              className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-muted/5 border border-border/10"
            >
              <ArrowDown className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: accent }} />
              <div className="min-w-0">
                <div className="text-xs font-semibold" style={{ color: accent }}>{d.label}</div>
                <div className="text-[10px] text-muted-foreground/55 leading-snug mt-0.5">{d.note}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="glass-panel rounded-xl p-4">
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/30">Sources</span>
          <span className="text-[9px] text-muted-foreground/40 font-mono">
            NOAA SWPC · GOES X-Ray · ACE/DSCOVR · NASA SDO
          </span>
        </div>
      </Card>
    </div>
  );
}
