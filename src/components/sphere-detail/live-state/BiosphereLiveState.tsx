import { Card } from "@/components/ui/card";

export function BiosphereLiveState({ accent }: { accent: string }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "Photosynthetic Activity", value: "NDVI", desc: "Normalized Difference Vegetation Index" },
          { label: "Ecosystem Resilience", value: "EVI", desc: "Enhanced Vegetation Index" },
          { label: "Biomass Distribution", value: "CO₂ Flux", desc: "Carbon exchange rate" },
        ].map((v, i) => (
          <Card key={i} className="glass-panel rounded-xl p-4 space-y-2">
            <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40">{v.label}</span>
            <div className="text-lg font-bold font-mono" style={{ color: accent }}>{v.value}</div>
            <p className="text-[9px] text-muted-foreground/40">{v.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="glass-panel rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold">Primary Data Streams</h3>
        {[
          "Vegetation indices (NDVI, EVI) — satellite imagery",
          "Carbon flux (CO₂ exchange) — FLUXNET stations",
          "Biodiversity density — species observation networks",
          "Ocean productivity — chlorophyll-a concentration",
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
          <span className="text-[9px] text-muted-foreground/40 font-mono">Google Earth Engine · NASA EOS · MODIS · FLUXNET</span>
        </div>
      </Card>
    </div>
  );
}
