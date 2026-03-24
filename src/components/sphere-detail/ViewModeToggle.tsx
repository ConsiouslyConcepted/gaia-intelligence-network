import { useState } from "react";
import { Map, Activity, Layers } from "lucide-react";

export type ViewMode = "imagery" | "field" | "combined";

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  accent: string;
}

const MODES: { value: ViewMode; icon: React.ElementType; label: string }[] = [
  { value: "imagery", icon: Map, label: "Imagery" },
  { value: "field", icon: Activity, label: "Field" },
  { value: "combined", icon: Layers, label: "Combined" },
];

export function ViewModeToggle({ mode, onChange, accent }: Props) {
  return (
    <div className="flex items-center gap-0.5 glass-panel rounded-lg p-0.5">
      {MODES.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] uppercase tracking-wider font-medium transition-all ${
            mode === value
              ? "bg-muted/30 text-foreground/90"
              : "text-muted-foreground/40 hover:text-muted-foreground/60"
          }`}
        >
          <Icon className="w-3 h-3" />
          {label}
        </button>
      ))}
    </div>
  );
}
