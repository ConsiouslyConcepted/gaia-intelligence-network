import { Card } from "@/components/ui/card";

const METRICS = [
  { label: "Global Grid Load", value: "28.4 TW", delta: "+3.1%/yr" },
  { label: "Data Center Energy", value: "460 TWh/yr", delta: "↑ AI surge" },
  { label: "Active Satellites", value: "~10,200", delta: "+22%/yr" },
  { label: "Internet Traffic", value: "1.2 Pb/s", delta: "+28%/yr" },
  { label: "Submarine Cables", value: "~600 active", delta: "stable" },
  { label: "E-Waste Generated", value: "62 Mt/yr", delta: "↑" },
];

export function IonosphereLiveState({ accent }: { accent: string }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {METRICS.map((m, i) => (
          <Card key={i} className="glass-panel rounded-xl p-4 space-y-2">
            <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40">{m.label}</span>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl font-bold font-mono" style={{ color: accent }}>{m.value}</span>
              <span className="text-[10px] text-muted-foreground/40 uppercase">{m.delta}</span>
            </div>
          </Card>
        ))}
      </div>
      <Card className="glass-panel rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-2">Technosphere State</h3>
        <p className="text-[11px] text-muted-foreground/55 leading-relaxed">
          IEA (electricity & data-center load), ITU (internet traffic), TeleGeography (submarine cables),
          UCS Satellite Database and ESA Space Debris Office (orbital population), and UN Global E-Waste Monitor
          jointly track the physical extent and energy footprint of humanity's built infrastructure.
        </p>
      </Card>
      <Card className="glass-panel rounded-xl p-4">
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/30">Sources</span>
          <span className="text-[9px] text-muted-foreground/40 font-mono">IEA · ITU · TeleGeography · UCS · ESA · UN GEM</span>
        </div>
      </Card>
    </div>
  );
}
