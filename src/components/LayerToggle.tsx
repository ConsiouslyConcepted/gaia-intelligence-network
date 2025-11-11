import { Button } from "@/components/ui/button";
import { Globe, Orbit } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayerToggleProps {
  activeLayer: "inner" | "outer";
  onToggle: (layer: "inner" | "outer") => void;
}

export const LayerToggle = ({ activeLayer, onToggle }: LayerToggleProps) => {
  return (
    <div className="glass-panel p-2 rounded-lg flex gap-1">
      <Button
        variant={activeLayer === "inner" ? "default" : "ghost"}
        size="sm"
        onClick={() => onToggle("inner")}
        className={cn(
          "gap-2 transition-all",
          activeLayer === "inner" && "bg-primary text-primary-foreground shadow-lg"
        )}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm">Inner Systems</span>
      </Button>
      <Button
        variant={activeLayer === "outer" ? "default" : "ghost"}
        size="sm"
        onClick={() => onToggle("outer")}
        className={cn(
          "gap-2 transition-all",
          activeLayer === "outer" && "bg-primary text-primary-foreground shadow-lg"
        )}
      >
        <Orbit className="w-4 h-4" />
        <span className="text-sm">Outer Systems</span>
      </Button>
    </div>
  );
};
