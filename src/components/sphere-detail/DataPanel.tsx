import { Card } from "@/components/ui/card";
import { Sphere } from "@/types/spheres";
import { Database } from "lucide-react";
import { GeosphereLiveState } from "./live-state/GeosphereLiveState";
import { MagnetosphereLiveState } from "./live-state/MagnetosphereLiveState";
import { BiosphereLiveState } from "./live-state/BiosphereLiveState";
import { IonosphereLiveState } from "./live-state/IonosphereLiveState";
import { NoosphereLiveState } from "./live-state/NoosphereLiveState";
import { CrystalsphereLiveState } from "./live-state/CrystalsphereLiveState";
import { HydrosphereLiveState } from "./live-state/HydrosphereLiveState";
import { CryosphereLiveState } from "./live-state/CryosphereLiveState";
import { AtmosphereLiveState } from "./live-state/AtmosphereLiveState";

interface Props {
  sphere: Sphere;
  accent: string;
}

const DATA_COMPONENTS: Record<string, React.ComponentType<{ accent: string }>> = {
  geosphere: GeosphereLiveState,
  hydrosphere: HydrosphereLiveState,
  cryosphere: CryosphereLiveState,
  atmosphere: AtmosphereLiveState,
  magnetosphere: MagnetosphereLiveState,
  biosphere: BiosphereLiveState,
  ionosphere: IonosphereLiveState,
  noosphere: NoosphereLiveState,
  crystalsphere: CrystalsphereLiveState,
};

export function DataPanel({ sphere, accent }: Props) {
  const Component = DATA_COMPONENTS[sphere.id];

  return (
    <div className="space-y-4">
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}12` }}>
            <Database className="w-6 h-6" style={{ color: accent }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold tracking-wide">Data — {sphere.name}</h2>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mt-0.5">
              Metrics · Signals · Time-series feeds
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40">Live</span>
          </div>
        </div>
      </Card>
      {Component && <Component accent={accent} />}
    </div>
  );
}
