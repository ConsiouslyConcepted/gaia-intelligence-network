import { Card } from "@/components/ui/card";

const METRICS = [
  { label: "CO₂ (Mauna Loa)", value: "424 ppm", delta: "+2.4 /yr" },
  { label: "Ozone Column", value: "298 DU", delta: "stable" },
  { label: "Surface Temp Anomaly", value: "+1.18 °C", delta: "↑" },
];

export function AtmosphereLiveState({ accent }: { accent: string }) {
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
        <h3 className="text-sm font-semibold mb-2">Atmospheric State</h3>
        <p className="text-[11px] text-muted-foreground/55 leading-relaxed">
          NOAA Global Monitoring Laboratory (CO₂, CH₄), NASA AIRS (temperature, water vapor), and
          OMI/TROPOMI (ozone, NO₂, aerosols) jointly track greenhouse forcing, stratospheric chemistry,
          and surface temperature anomalies driving present-day climate change.
        </p>
      </Card>
    </div>
  );
}
