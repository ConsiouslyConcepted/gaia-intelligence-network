import { Card } from "@/components/ui/card";
import { useNASACloseApproach, useNOAASolarCycle } from "@/hooks/usePlanetaryData";
import { Loader2 } from "lucide-react";

export function CrystalsphereLiveState({ accent }: { accent: string }) {
  const { data: approaches, isLoading: caLoading } = useNASACloseApproach();
  const { data: solarCycle, isLoading: scLoading } = useNOAASolarCycle();

  const latestSC = solarCycle?.[solarCycle.length - 1];
  const isLoading = caLoading || scLoading;

  return (
    <div className="space-y-4">
      {/* Key Variables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "Sunspot Number", value: latestSC?.ssn?.toFixed(0) || "—", unit: "SSN", loading: scLoading },
          { label: "Solar Flux (F10.7)", value: latestSC?.f107?.toFixed(1) || "—", unit: "sfu", loading: scLoading },
          { label: "Near-Earth Objects", value: approaches?.length?.toString() || "—", unit: "next 30d", loading: caLoading },
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

      {/* Solar Cycle History */}
      {solarCycle && (
        <Card className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Solar Cycle — 3yr History (NOAA)</h3>
            <span className="text-[9px] text-muted-foreground/30 font-mono">{solarCycle.length} months</span>
          </div>
          <div className="h-24 flex items-end gap-0.5">
            {solarCycle.map((d: any, i: number) => (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all"
                style={{
                  height: `${Math.max(4, (d.ssn / 250) * 100)}%`,
                  backgroundColor: `${accent}${d.ssn > 150 ? 'cc' : d.ssn > 80 ? '70' : '30'}`,
                }}
                title={`SSN: ${d.ssn} — ${d.time}`}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Close Approach Objects */}
      <Card className="glass-panel rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Near-Earth Close Approaches (NASA JPL)</h3>
          <div className="flex items-center gap-1.5">
            {caLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground/40" />}
            <span className="text-[9px] text-muted-foreground/30 font-mono">
              {approaches ? `${approaches.length} objects` : "loading..."}
            </span>
          </div>
        </div>
        {approaches && (
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
            {approaches.map((a: any, i: number) => (
              <div key={i} className="px-3 py-2 rounded-lg bg-muted/5 border border-border/10 flex items-center gap-3">
                <div
                  className="px-2 py-1 rounded-lg text-[9px] font-bold font-mono shrink-0"
                  style={{ backgroundColor: `${accent}15`, color: accent }}
                >
                  {a.designation}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-muted-foreground/40 font-mono">
                      dist: {a.distanceAU.toFixed(4)} AU
                    </span>
                    <span className="text-[9px] text-muted-foreground/40 font-mono">
                      vel: {a.velocity.toFixed(1)} km/s
                    </span>
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground/30 font-mono shrink-0">
                  {a.closeApproachDate}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="glass-panel rounded-xl p-4">
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/30">Sources</span>
          <span className="text-[9px] text-muted-foreground/40 font-mono">NASA JPL SBDB · NOAA Solar Cycle · Ephemeris Data</span>
        </div>
      </Card>
    </div>
  );
}
