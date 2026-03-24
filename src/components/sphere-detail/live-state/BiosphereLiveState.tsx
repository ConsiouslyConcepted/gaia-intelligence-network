import { Card } from "@/components/ui/card";
import { useNASAEONET } from "@/hooks/usePlanetaryData";
import { Loader2 } from "lucide-react";

export function BiosphereLiveState({ accent }: { accent: string }) {
  const { data: events, isLoading, error } = useNASAEONET();

  const categoryCounts: Record<string, number> = {};
  events?.forEach((e: any) => {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  });

  return (
    <div className="space-y-4">
      {/* Category Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.entries(categoryCounts).slice(0, 3).map(([cat, count], i) => (
          <Card key={i} className="glass-panel rounded-xl p-4 space-y-2">
            <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40">{cat}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono" style={{ color: accent }}>{count}</span>
              <span className="text-[10px] text-muted-foreground/40 uppercase">active events</span>
            </div>
          </Card>
        ))}
        {Object.keys(categoryCounts).length === 0 && !isLoading && (
          <>
            {["Photosynthetic Activity", "Ecosystem Resilience", "Biomass Distribution"].map((label, i) => (
              <Card key={i} className="glass-panel rounded-xl p-4 space-y-1">
                <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40">{label}</span>
                <p className="text-[11px] text-muted-foreground/50">Awaiting data...</p>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Live Event Feed */}
      <Card className="glass-panel rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Active Natural Events (NASA EONET)</h3>
          <div className="flex items-center gap-1.5">
            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground/40" />}
            <span className="text-[9px] text-muted-foreground/30 font-mono">
              {events ? `${events.length} events` : "loading..."}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-[11px] text-muted-foreground/50">Unable to fetch NASA EONET data. Retrying...</p>
        )}

        {events && (
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
            {events.map((e: any) => (
              <div key={e.id} className="px-3 py-2 rounded-lg bg-muted/5 border border-border/10 flex items-center gap-3">
                <div
                  className="px-2 py-1 rounded-lg text-[9px] font-bold font-mono shrink-0 uppercase tracking-wider"
                  style={{ backgroundColor: `${accent}15`, color: accent }}
                >
                  {e.category.substring(0, 8)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground/80 truncate">{e.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-muted-foreground/40 font-mono">
                      source: {e.source}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground/30 font-mono shrink-0">
                  {e.date ? new Date(e.date).toLocaleDateString() : "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="glass-panel rounded-xl p-4">
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/30">Sources</span>
          <span className="text-[9px] text-muted-foreground/40 font-mono">NASA EONET · Earth Observing System · MODIS</span>
        </div>
      </Card>
    </div>
  );
}
