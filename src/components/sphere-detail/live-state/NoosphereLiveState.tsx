import { Card } from "@/components/ui/card";

export function NoosphereLiveState({ accent }: { accent: string }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "Information Flow", value: "Velocity", desc: "Network propagation speed" },
          { label: "Network Clustering", value: "Coefficient", desc: "Graph density metric" },
          { label: "Semantic Density", value: "Embeddings", desc: "Knowledge graph coherence" },
        ].map((v, i) => (
          <Card key={i} className="glass-panel rounded-xl p-4 space-y-2">
            <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40">{v.label}</span>
            <div className="text-lg font-bold font-mono" style={{ color: accent }}>{v.value}</div>
            <p className="text-[9px] text-muted-foreground/40">{v.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="glass-panel rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold">Proxy Measurements</h3>
        {[
          "Communication density — network traffic patterns",
          "Knowledge production — semantic graph growth",
          "Mobility + interaction — geospatial activity patterns",
          "Collective attention — search & media trends",
        ].map((item, idx) => (
          <div key={idx} className="px-3 py-2 rounded-lg bg-muted/5 border border-border/10 flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
            <span className="text-[11px] text-muted-foreground/60">{item}</span>
          </div>
        ))}
      </Card>

      <Card className="glass-panel rounded-xl p-4">
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/30">Sources</span>
          <span className="text-[9px] text-muted-foreground/40 font-mono">Neo4j · AI Pipelines (LLM + Vector DB) · Network Analytics</span>
        </div>
      </Card>
    </div>
  );
}
