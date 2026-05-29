import { Card } from "@/components/ui/card";

const METRICS = [
  { label: "Global Mean SST", value: "18.4 °C", delta: "+0.12" },
  { label: "Sea Level Rise", value: "+3.7 mm/yr", delta: "↑" },
  { label: "Ocean Heat Content", value: "287 ZJ", delta: "+1.8" },
];

export function HydrosphereLiveState({ accent }: { accent: string }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {METRICS.map((m, i) => (
          <Card key={i} className="glass-panel rounded-xl p-4 space-y-2">
            <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40">{m.label}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono" style={{ color: accent }}>{m.value}</span>
              <span className="text-[10px] text-muted-foreground/40 uppercase">{m.delta}</span>
            </div>
          </Card>
        ))}
      </div>
      <Card className="glass-panel rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-2">Hydrological State</h3>
        <p className="text-[11px] text-muted-foreground/55 leading-relaxed">
          Ocean surface temperature, salinity, and circulation indices derived from NASA MUR SST and ARGO float
          assimilation products. Freshwater fluxes and precipitation patterns reflect the active hydrological cycle.
        </p>
      </Card>
    </div>
  );
}
