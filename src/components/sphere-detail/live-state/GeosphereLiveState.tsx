import { Card } from "@/components/ui/card";
import { useUSGSEarthquakes } from "@/hooks/usePlanetaryData";
import { Loader2 } from "lucide-react";

export function GeosphereLiveState({ accent }: { accent: string }) {
  const { data: quakes, isLoading, error } = useUSGSEarthquakes("day", 2.5);

  return (
    <div className="space-y-4">
      {/* Key Variables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "Stress Accumulation", desc: "Seismic energy buildup" },
          { label: "Displacement Vectors", desc: "GNSS plate motion" },
          { label: "Energy Release", desc: "Magnitude · Depth" },
        ].map((v, i) => (
          <Card key={i} className="glass-panel rounded-xl p-4 space-y-1">
            <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40">{v.label}</span>
            <p className="text-[11px] text-muted-foreground/50">{v.desc}</p>
          </Card>
        ))}
      </div>

      {/* Live Earthquake Feed */}
      <Card className="glass-panel rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Seismic Events — Last 24h (USGS)</h3>
          <div className="flex items-center gap-1.5">
            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground/40" />}
            <span className="text-[9px] text-muted-foreground/30 font-mono">
              {quakes ? `${quakes.length} events` : "loading..."}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-[11px] text-muted-foreground/50">Unable to fetch USGS data. Retrying...</p>
        )}

        {quakes && (
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
            {quakes.map((q: any) => (
              <div key={q.id} className="px-3 py-2 rounded-lg bg-muted/5 border border-border/10 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0"
                  style={{ backgroundColor: `${accent}15`, color: accent }}
                >
                  {q.magnitude.toFixed(1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground/80 truncate">{q.place}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-muted-foreground/40 font-mono">
                      depth: {q.depth.toFixed(1)} km
                    </span>
                    {q.tsunami && (
                      <span className="text-[9px] font-mono" style={{ color: accent }}>tsunami alert</span>
                    )}
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground/30 font-mono shrink-0">
                  {new Date(q.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Data Sources */}
      <Card className="glass-panel rounded-xl p-4">
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/30">Sources</span>
          <span className="text-[9px] text-muted-foreground/40 font-mono">USGS Earthquake Hazards · Satellite InSAR · GNSS Networks</span>
        </div>
      </Card>
    </div>
  );
}
