import { Card } from "@/components/ui/card";
import { useWikipediaTopPages } from "@/hooks/usePlanetaryData";
import { Loader2 } from "lucide-react";

export function NoosphereLiveState({ accent }: { accent: string }) {
  const { data: topPages, isLoading, error } = useWikipediaTopPages();

  const totalViews = topPages?.reduce((sum: number, p: any) => sum + p.views, 0) || 0;

  return (
    <div className="space-y-4">
      {/* Key Variables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "Information Flow", value: totalViews ? `${(totalViews / 1000000).toFixed(1)}M` : "—", desc: "Total pageviews (top 20)" },
          { label: "Attention Clusters", value: topPages?.length?.toString() || "—", desc: "Trending topics" },
          { label: "Peak Focus", value: topPages?.[0]?.views ? `${(topPages[0].views / 1000000).toFixed(1)}M` : "—", desc: "Top article views" },
        ].map((v, i) => (
          <Card key={i} className="glass-panel rounded-xl p-4 space-y-2">
            <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40">{v.label}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono" style={{ color: accent }}>{v.value}</span>
            </div>
            <p className="text-[9px] text-muted-foreground/40">{v.desc}</p>
          </Card>
        ))}
      </div>

      {/* Collective Attention Feed */}
      <Card className="glass-panel rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Collective Attention — Top Articles (Wikipedia)</h3>
          <div className="flex items-center gap-1.5">
            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground/40" />}
            <span className="text-[9px] text-muted-foreground/30 font-mono">
              {topPages ? `${topPages.length} topics` : "loading..."}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-[11px] text-muted-foreground/50">Unable to fetch Wikipedia data. Retrying...</p>
        )}

        {topPages && (
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
            {topPages.map((p: any, i: number) => {
              const maxViews = topPages[0]?.views || 1;
              const barWidth = Math.max(8, (p.views / maxViews) * 100);
              return (
                <div key={i} className="px-3 py-2 rounded-lg bg-muted/5 border border-border/10 flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold font-mono shrink-0"
                    style={{ backgroundColor: `${accent}15`, color: accent }}
                  >
                    {p.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground/80 truncate">{p.title}</p>
                    <div className="mt-1 h-1 rounded-full bg-muted/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${barWidth}%`, backgroundColor: `${accent}60` }}
                      />
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground/30 font-mono shrink-0">
                    {(p.views / 1000).toFixed(0)}k
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="glass-panel rounded-xl p-4">
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/30">Sources</span>
          <span className="text-[9px] text-muted-foreground/40 font-mono">Wikimedia Pageviews API · Collective Attention Proxy</span>
        </div>
      </Card>
    </div>
  );
}
