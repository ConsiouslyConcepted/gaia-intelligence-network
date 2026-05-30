import { Music2 } from "lucide-react";
import { INTERVALS, type Interval } from "@/lib/geometry/musicGeometry";

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export const IntervalsSidebar = ({ selected, onSelect }: Props) => {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="relative px-3.5 pt-3 pb-2.5 border-b border-border/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.05] via-foreground/[0.015] to-transparent pointer-events-none" />
        <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent" />
        <div className="relative flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-foreground/[0.06] border border-foreground/10">
            <Music2 className="w-2.5 h-2.5 text-foreground/70" strokeWidth={2} />
          </div>
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/90">Intervals</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-foreground/15 to-transparent" />
        </div>
        <p className="relative text-[9px] text-muted-foreground/55 leading-snug pl-7">
          Pythagorean ratios — chord polygons on the 12-tone wheel.
        </p>
      </div>

      <div className="flex-1 px-2 py-2 space-y-1">
        {INTERVALS.map((i: Interval) => {
          const active = selected === i.id;
          return (
            <button
              key={i.id}
              onClick={() => onSelect(i.id)}
              className={`w-full flex flex-col items-start gap-0.5 px-3 py-2 rounded-lg transition-all duration-200 text-left ${
                active ? "bg-foreground/[0.08]" : "hover:bg-foreground/[0.04]"
              }`}
              style={{
                border: `1px solid ${active ? "hsla(45,70%,70%,0.4)" : "hsla(0,0%,100%,0.05)"}`,
                boxShadow: active ? "0 0 14px hsla(45,70%,60%,0.18)" : "none",
              }}
            >
              <div className="w-full flex items-center justify-between">
                <span className="text-[11px] font-semibold text-foreground/90 tracking-wide">
                  {i.short} {i.fundamental ? "★" : ""}
                </span>
                <span className="text-[10px] font-bold text-foreground/70 tracking-wider">
                  {i.ratio}
                </span>
              </div>
              <span className="text-[9px] text-muted-foreground/55 leading-snug">
                {i.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="px-3 py-2 border-t border-border/15">
        <p className="text-[8px] text-muted-foreground/35 tracking-wider text-center leading-relaxed">
          ★ Epogdoon · fundamental planetary-scale ratio
        </p>
      </div>
    </div>
  );
};
