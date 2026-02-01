import { Info } from "lucide-react";

export const HGSDisclaimer = () => {
  return (
    <div className="glass-panel p-4 rounded-xl border border-border/30 flex items-center gap-3">
      <Info className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      <p className="text-xs text-muted-foreground text-center flex-1">
        This dashboard provides interpretive intelligence only. No authority, custody, or execution occurs here.
      </p>
    </div>
  );
};
