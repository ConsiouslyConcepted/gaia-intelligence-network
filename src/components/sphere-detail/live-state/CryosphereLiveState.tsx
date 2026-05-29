import { Card } from "@/components/ui/card";

const METRICS = [
  { label: "Arctic Sea Ice", value: "10.4 Mkm²", delta: "−2.1%" },
  { label: "Greenland Mass", value: "−270 Gt/yr", delta: "↓" },
  { label: "Snow Cover (NH)", value: "24.8 Mkm²", delta: "−1.4%" },
];

export function CryosphereLiveState({ accent }: { accent: string }) {
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
        <h3 className="text-sm font-semibold mb-2">Cryospheric State</h3>
        <p className="text-[11px] text-muted-foreground/55 leading-relaxed">
          Sea ice extent (NSIDC), ice sheet mass balance (GRACE-FO), and snow cover (MODIS NDSI) indicate
          accelerating long-term loss with strong seasonal modulation across both hemispheres.
        </p>
      </Card>
    </div>
  );
}
