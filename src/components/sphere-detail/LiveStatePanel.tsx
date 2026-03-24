import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Sphere } from "@/types/spheres";
import { Radio } from "lucide-react";
import { GeosphereLiveState } from "./live-state/GeosphereLiveState";
import { MagnetosphereLiveState } from "./live-state/MagnetosphereLiveState";
import { BiosphereLiveState } from "./live-state/BiosphereLiveState";
import { IonosphereLiveState } from "./live-state/IonosphereLiveState";
import { NoosphereLiveState } from "./live-state/NoosphereLiveState";
import { CrystalsphereLiveState } from "./live-state/CrystalsphereLiveState";
import { ImageryPanel } from "./ImageryPanel";
import { FieldRenderer } from "./FieldRenderer";
import { ViewModeToggle, ViewMode } from "./ViewModeToggle";

interface Props {
  sphere: Sphere;
  accent: string;
}

const LIVE_STATE_COMPONENTS: Record<string, React.ComponentType<{ accent: string }>> = {
  geosphere: GeosphereLiveState,
  magnetosphere: MagnetosphereLiveState,
  biosphere: BiosphereLiveState,
  ionosphere: IonosphereLiveState,
  noosphere: NoosphereLiveState,
  crystalsphere: CrystalsphereLiveState,
};

export function LiveStatePanel({ sphere, accent }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("combined");
  const Component = LIVE_STATE_COMPONENTS[sphere.id];

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}12` }}>
            <Radio className="w-6 h-6" style={{ color: accent }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold tracking-wide">Live State — {sphere.name}</h2>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mt-0.5">
              Data · Imagery · Field rendering — synchronized
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ViewModeToggle mode={viewMode} onChange={setViewMode} accent={accent} />
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40">Live</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Visual Layers (Imagery + Field) */}
      {(viewMode === "imagery" || viewMode === "combined") && (
        <ImageryPanel sphereId={sphere.id} accent={accent} />
      )}

      {(viewMode === "field" || viewMode === "combined") && (
        <FieldRenderer sphereId={sphere.id} accent={accent} />
      )}

      {/* Data Layer */}
      {Component && <Component accent={accent} />}
    </div>
  );
}
