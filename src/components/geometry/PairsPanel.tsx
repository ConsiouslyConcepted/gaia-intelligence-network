import { Orbit } from "lucide-react";
import { MIRROR_PAIRS, ADJACENT_PAIRS, type PlanetPair } from "@/lib/geometry/musicGeometry";

interface Props {
  selectedPairId: string;
  onSelect: (id: string) => void;
  onPlanetContext?: (planetId: string) => void;
}

const PairRow = ({
  pair, active, onSelect, onPlanetContext,
}: { pair: PlanetPair; active: boolean; onSelect: () => void; onPlanetContext?: (id: string) => void }) => (
  <button
    onClick={onSelect}
    className={`w-full flex flex-col gap-0.5 px-3 py-2 rounded-lg transition-all duration-200 text-left ${
      active ? "bg-foreground/[0.08]" : "hover:bg-foreground/[0.04]"
    }`}
    style={{
      border: `1px solid ${active ? "hsla(45,70%,70%,0.4)" : "hsla(0,0%,100%,0.05)"}`,
      boxShadow: active ? "0 0 14px hsla(45,70%,60%,0.18)" : "none",
    }}
  >
    <div className="w-full flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide">
        <span
          onContextMenu={(e) => { e.preventDefault(); onPlanetContext?.(pair.inner.id); }}
          style={{ color: pair.inner.color }}
        >
          {pair.inner.name}
        </span>
        <span className="text-foreground/40">–</span>
        <span
          onContextMenu={(e) => { e.preventDefault(); onPlanetContext?.(pair.outer.id); }}
          style={{ color: pair.outer.color }}
        >
          {pair.outer.name}
        </span>
      </span>
      <span className="text-[10px] font-bold text-foreground/80 tracking-wider">
        {pair.value.toFixed(3)}
      </span>
    </div>
    <div className="w-full flex items-center justify-between">
      <span className="text-[8.5px] text-muted-foreground/55 tracking-wider uppercase">
        ≈ {pair.intervalId === "M2" ? "9/8 epogdoon" : pair.intervalId}
      </span>
      <span className="text-[9px] text-foreground/55">
        {pair.accuracy.toFixed(1)}%
      </span>
    </div>
  </button>
);

export const PairsPanel = ({ selectedPairId, onSelect, onPlanetContext }: Props) => {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      <div className="relative px-3.5 pt-3 pb-2.5 border-b border-border/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.05] via-foreground/[0.015] to-transparent pointer-events-none" />
        <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent" />
        <div className="relative flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-foreground/[0.06] border border-foreground/10">
            <Orbit className="w-2.5 h-2.5 text-foreground/70" strokeWidth={2} />
          </div>
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/90">Orbital Pairs</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-foreground/15 to-transparent" />
        </div>
        <p className="relative text-[9px] text-muted-foreground/55 leading-snug pl-7">
          (b/a)^(2/3) of each pair lands on a musical consonance.
        </p>
      </div>

      <div className="px-3 pt-2 pb-1 text-[9px] tracking-[0.18em] uppercase text-muted-foreground/60">
        Mirror · across asteroid belt
      </div>
      <div className="px-2 space-y-1">
        {MIRROR_PAIRS.map((p) => (
          <PairRow key={p.id} pair={p} active={p.id === selectedPairId}
            onSelect={() => onSelect(p.id)} onPlanetContext={onPlanetContext} />
        ))}
      </div>

      <div className="px-3 pt-3 pb-1 text-[9px] tracking-[0.18em] uppercase text-muted-foreground/60">
        Adjacent · neighbour consonance
      </div>
      <div className="px-2 pb-2 space-y-1">
        {ADJACENT_PAIRS.map((p) => (
          <PairRow key={p.id} pair={p} active={p.id === selectedPairId}
            onSelect={() => onSelect(p.id)} onPlanetContext={onPlanetContext} />
        ))}
      </div>

      <div className="px-3 py-2 border-t border-border/15 mt-auto">
        <p className="text-[8px] text-muted-foreground/35 tracking-wider text-center leading-relaxed">
          Right-click planet name to play its tone
        </p>
      </div>
    </div>
  );
};
