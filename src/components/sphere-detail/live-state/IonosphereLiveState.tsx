import { Card } from "@/components/ui/card";
import { useNOAAXRayFlux, useNOAAAlerts, useNOAADst } from "@/hooks/usePlanetaryData";
import { Loader2 } from "lucide-react";

export function IonosphereLiveState({ accent }: { accent: string }) {
  const { data: xray, isLoading: xrayLoading } = useNOAAXRayFlux();
  const { data: alerts, isLoading: alertsLoading } = useNOAAAlerts();
  const { data: dst, isLoading: dstLoading } = useNOAADst();

  const latestDst = dst?.[dst.length - 1];
  const isLoading = xrayLoading || alertsLoading || dstLoading;

  return (
    <div className="space-y-4">
      {/* Key Variables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "Dst Index", value: latestDst?.dst?.toFixed(0) || "—", unit: "nT", loading: dstLoading },
          { label: "Recent Flares", value: xray?.length?.toString() || "—", unit: "events", loading: xrayLoading },
          { label: "Active Alerts", value: alerts?.length?.toString() || "—", unit: "active", loading: alertsLoading },
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

      {/* Dst History */}
      {dst && (
        <Card className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Dst Index — 24h History (NOAA/Kyoto)</h3>
            <span className="text-[9px] text-muted-foreground/30 font-mono">{dst.length} readings</span>
          </div>
          <div className="h-24 flex items-end gap-1">
            {dst.map((d, i) => {
              const absDst = Math.abs(d.dst);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all"
                  style={{
                    height: `${Math.max(8, Math.min(100, (absDst / 100) * 100))}%`,
                    backgroundColor: `${accent}${absDst > 50 ? 'cc' : absDst > 20 ? '70' : '30'}`,
                  }}
                  title={`Dst: ${d.dst} nT at ${d.time}`}
                />
              );
            })}
          </div>
        </Card>
      )}

      {/* X-Ray Flares */}
      <Card className="glass-panel rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">X-Ray Solar Flares (NOAA/GOES)</h3>
          <span className="text-[9px] text-muted-foreground/30 font-mono">
            {xray ? `${xray.length} flares` : "loading..."}
          </span>
        </div>
        {xray && (
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
            {xray.map((f: any, i: number) => (
              <div key={i} className="px-3 py-2 rounded-lg bg-muted/5 border border-border/10 flex items-center gap-3">
                <div
                  className="w-10 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0"
                  style={{ backgroundColor: `${accent}15`, color: accent }}
                >
                  {f.classType}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground/40 font-mono">
                      begin: {f.beginTime ? new Date(f.beginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                    </span>
                    <span className="text-[9px] text-muted-foreground/40 font-mono">
                      max: {f.maxTime ? new Date(f.maxTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="glass-panel rounded-xl p-4">
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/30">Sources</span>
          <span className="text-[9px] text-muted-foreground/40 font-mono">NOAA SWPC · GOES X-Ray · Kyoto Dst · EISCAT</span>
        </div>
      </Card>
    </div>
  );
}
