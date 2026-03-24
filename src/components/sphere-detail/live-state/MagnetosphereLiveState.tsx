import { Card } from "@/components/ui/card";
import { useNOAAKpIndex, useNOAASolarWind, useNOAAMagField } from "@/hooks/usePlanetaryData";
import { Loader2 } from "lucide-react";

export function MagnetosphereLiveState({ accent }: { accent: string }) {
  const { data: kpData, isLoading: kpLoading } = useNOAAKpIndex();
  const { data: solarWind, isLoading: swLoading } = useNOAASolarWind();
  const { data: magField, isLoading: magLoading } = useNOAAMagField();

  const latestKp = kpData?.[kpData.length - 1];
  const latestSW = solarWind?.[solarWind.length - 1];
  const latestMag = magField?.[magField.length - 1];
  const isLoading = kpLoading || swLoading || magLoading;

  return (
    <div className="space-y-4">
      {/* Key Variables - Live Values */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { label: "Kp Index", value: latestKp?.kp?.toFixed(1) || "—", unit: "", loading: kpLoading },
          { label: "Solar Wind Speed", value: latestSW?.speed?.toFixed(0) || "—", unit: "km/s", loading: swLoading },
          { label: "Solar Wind Density", value: latestSW?.density?.toFixed(1) || "—", unit: "p/cm³", loading: swLoading },
          { label: "IMF Bt", value: latestMag?.bt?.toFixed(1) || "—", unit: "nT", loading: magLoading },
        ].map((v, i) => (
          <Card key={i} className="glass-panel rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40">{v.label}</span>
              {v.loading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground/30" />}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono" style={{ color: accent }}>{v.value}</span>
              <span className="text-[10px] text-muted-foreground/40 uppercase">{v.unit}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Kp Index History */}
      <Card className="glass-panel rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Kp Index — 24h History (NOAA)</h3>
          <span className="text-[9px] text-muted-foreground/30 font-mono">
            {kpData ? `${kpData.length} readings` : "loading..."}
          </span>
        </div>
        {kpData && (
          <div className="h-24 flex items-end gap-1">
            {kpData.map((d, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all"
                style={{
                  height: `${Math.max(8, (d.kp / 9) * 100)}%`,
                  backgroundColor: `${accent}${d.kp > 5 ? 'cc' : d.kp > 3 ? '70' : '30'}`,
                }}
                title={`Kp: ${d.kp} at ${d.time}`}
              />
            ))}
          </div>
        )}
      </Card>

      {/* IMF Components */}
      <Card className="glass-panel rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold">Magnetic Field Vectors (NOAA)</h3>
        {magField && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Bx (GSM)", value: latestMag?.bx?.toFixed(2) },
              { label: "By (GSM)", value: latestMag?.by?.toFixed(2) },
              { label: "Bz (GSM)", value: latestMag?.bz?.toFixed(2) },
            ].map((comp, i) => (
              <div key={i} className="px-3 py-2 rounded-lg bg-muted/5 border border-border/10">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40">{comp.label}</span>
                <div className="text-lg font-bold font-mono mt-1" style={{ color: accent }}>{comp.value} <span className="text-[10px] text-muted-foreground/40">nT</span></div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Solar Wind Timeline */}
      <Card className="glass-panel rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold">Solar Wind Plasma — Recent (NOAA)</h3>
        {solarWind && (
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
            {solarWind.slice(-12).reverse().map((d, i) => (
              <div key={i} className="px-3 py-2 rounded-lg bg-muted/5 border border-border/10 flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground/30 font-mono">{d.time}</span>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-muted-foreground/50">
                    <span className="font-mono" style={{ color: accent }}>{d.speed.toFixed(0)}</span> km/s
                  </span>
                  <span className="text-[10px] text-muted-foreground/50">
                    <span className="font-mono" style={{ color: accent }}>{d.density.toFixed(1)}</span> p/cm³
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="glass-panel rounded-xl p-4">
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/30">Sources</span>
          <span className="text-[9px] text-muted-foreground/40 font-mono">NOAA SWPC · SuperMAG · ACE/DSCOVR Satellite</span>
        </div>
      </Card>
    </div>
  );
}
