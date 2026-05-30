import { INTERVALS } from "@/lib/geometry/musicGeometry";

const INTERVAL_COLORS: Record<string, string> = {
  P8: "hsla(  0, 85%, 62%, 0.95)",
  P5: "hsla( 30, 90%, 60%, 0.95)",
  P4: "hsla( 50, 90%, 60%, 0.95)",
  M3: "hsla(140, 70%, 55%, 0.95)",
  m3: "hsla(180, 70%, 58%, 0.95)",
  M6: "hsla(210, 80%, 65%, 0.95)",
  m6: "hsla(265, 70%, 68%, 0.95)",
  M2: "hsla(320, 75%, 68%, 0.95)",
};

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

/** Compact color-legend strip: pick any interval and the wheel re-draws around it. */
export const IntervalLegend = ({ selected, onSelect }: Props) => (
  <div className="w-full max-w-[760px] flex flex-wrap items-center justify-center gap-1.5 px-2">
    {INTERVALS.map((iv) => {
      const isSel = iv.id === selected;
      const c = INTERVAL_COLORS[iv.id];
      return (
        <button
          key={iv.id}
          onClick={() => onSelect(iv.id)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[9px] tracking-[0.18em] uppercase font-bold transition-all duration-150 ${
            isSel
              ? "border-foreground/40 bg-foreground/[0.08] text-foreground/95"
              : "border-foreground/10 bg-foreground/[0.02] text-foreground/55 hover:bg-foreground/[0.05]"
          }`}
          style={isSel ? { boxShadow: `0 0 12px ${c}55` } : undefined}
        >
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
          <span>{iv.short}</span>
          <span className="text-foreground/40 font-mono normal-case tracking-normal">{iv.ratio}</span>
          {iv.fundamental && <span className="text-foreground/70">★</span>}
        </button>
      );
    })}
  </div>
);
