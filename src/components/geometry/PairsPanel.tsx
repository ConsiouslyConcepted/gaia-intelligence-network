import { useMemo, useState } from "react";
import { Orbit, Volume2, ArrowUpDown, Search } from "lucide-react";
import {
  MIRROR_PAIRS,
  ADJACENT_PAIRS,
  ASTEROID_BELT_AU,
  INTERVALS,
  type PlanetPair,
} from "@/lib/geometry/musicGeometry";

interface Props {
  selectedPairId: string;
  onSelect: (id: string) => void;
  onPlanetContext?: (planetId: string) => void;
}

type Filter = "all" | "mirror" | "adjacent";
type SortKey = "default" | "accuracy" | "value";

const accuracyHue = (acc: number) => {
  // 0 → red, 100 → green
  const clamped = Math.max(0, Math.min(100, acc));
  return Math.round((clamped / 100) * 130); // 0..130
};

const PairRow = ({
  pair,
  active,
  onSelect,
  onPlanetContext,
}: {
  pair: PlanetPair;
  active: boolean;
  onSelect: () => void;
  onPlanetContext?: (id: string) => void;
}) => {
  const interval = INTERVALS.find((i) => i.id === pair.intervalId)!;
  const accDisplay = Math.max(0, pair.accuracy);
  const hue = accuracyHue(accDisplay);
  const accColor = `hsl(${hue}, 70%, 60%)`;

  return (
    <button
      onClick={onSelect}
      className={`group w-full flex flex-col gap-1.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-left ${
        active ? "bg-foreground/[0.09]" : "hover:bg-foreground/[0.04]"
      }`}
      style={{
        border: `1px solid ${active ? "hsla(45,70%,70%,0.45)" : "hsla(0,0%,100%,0.06)"}`,
        boxShadow: active ? "0 0 16px hsla(45,70%,60%,0.22)" : "none",
      }}
    >
      {/* Row 1 — planets + numeric value */}
      <div className="w-full flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide min-w-0">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: pair.inner.color, boxShadow: `0 0 6px ${pair.inner.color}` }}
          />
          <span
            onContextMenu={(e) => {
              e.preventDefault();
              onPlanetContext?.(pair.inner.id);
            }}
            style={{ color: pair.inner.color }}
            className="truncate"
          >
            {pair.inner.name}
          </span>
          <span className="text-foreground/40">–</span>
          <span
            onContextMenu={(e) => {
              e.preventDefault();
              onPlanetContext?.(pair.outer.id);
            }}
            style={{ color: pair.outer.color }}
            className="truncate"
          >
            {pair.outer.name}
          </span>
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: pair.outer.color, boxShadow: `0 0 6px ${pair.outer.color}` }}
          />
        </span>
        <span className="text-[10px] font-bold text-foreground/85 tracking-wider tabular-nums shrink-0">
          {pair.value.toFixed(3)}
        </span>
      </div>

      {/* Row 2 — interval / accuracy */}
      <div className="w-full flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-[8.5px] tracking-wider uppercase text-muted-foreground/70 min-w-0">
          <span className="px-1 py-px rounded bg-foreground/[0.06] border border-foreground/10 text-foreground/75 font-semibold">
            {interval.short}
          </span>
          <span className="truncate text-muted-foreground/55">{interval.ratio}</span>
        </span>
        <span
          className="text-[9px] font-semibold tabular-nums shrink-0"
          style={{ color: accColor }}
        >
          {accDisplay.toFixed(1)}%
        </span>
      </div>

      {/* Row 3 — accuracy bar */}
      <div className="h-[3px] w-full rounded-full bg-foreground/[0.05] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${accDisplay}%`,
            background: `linear-gradient(90deg, ${accColor}55, ${accColor})`,
            boxShadow: `0 0 6px ${accColor}88`,
          }}
        />
      </div>

      {/* Row 4 — physics footnote */}
      <div className="w-full flex items-center justify-between text-[8.5px] text-muted-foreground/55 tracking-wide">
        {pair.kind === "mirror" ? (
          <>
            <span>
              √(a·b) <span className="text-foreground/70 tabular-nums">{pair.geoMeanAU.toFixed(2)} AU</span>
            </span>
            <span className="tabular-nums">
              Δ belt {pair.beltDeltaAU >= 0 ? "+" : ""}
              {pair.beltDeltaAU.toFixed(2)}
            </span>
          </>
        ) : (
          <>
            <span>target {pair.target.toFixed(3)}</span>
            <span className="tabular-nums">
              Δ {(pair.value - pair.target >= 0 ? "+" : "") + (pair.value - pair.target).toFixed(3)}
            </span>
          </>
        )}
      </div>
    </button>
  );
};

const SectionHeader = ({
  label,
  count,
  hint,
}: {
  label: string;
  count: number;
  hint?: string;
}) => (
  <div className="sticky top-0 z-[1] backdrop-blur-md bg-background/70 px-3 pt-2.5 pb-1.5">
    <div className="flex items-center gap-2">
      <span className="text-[9px] tracking-[0.18em] uppercase text-foreground/75 font-semibold">
        {label}
      </span>
      <span className="text-[8.5px] tabular-nums px-1.5 py-px rounded-full bg-foreground/[0.06] border border-foreground/10 text-foreground/65">
        {count}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-foreground/15 to-transparent" />
    </div>
    {hint && (
      <p className="text-[8.5px] text-muted-foreground/55 mt-0.5 leading-snug">{hint}</p>
    )}
  </div>
);

export const PairsPanel = ({ selectedPairId, onSelect, onPlanetContext }: Props) => {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("default");
  const [query, setQuery] = useState("");

  const { mirrors, adjacents, totalShown, bestAccuracy } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchQ = (p: PlanetPair) =>
      !q ||
      p.inner.name.toLowerCase().includes(q) ||
      p.outer.name.toLowerCase().includes(q) ||
      p.intervalId.toLowerCase().includes(q);

    const sortFn = (a: PlanetPair, b: PlanetPair) => {
      if (sort === "accuracy") return b.accuracy - a.accuracy;
      if (sort === "value") return a.value - b.value;
      return 0;
    };

    const mirrors =
      filter === "adjacent" ? [] : [...MIRROR_PAIRS].filter(matchQ).sort(sortFn);
    const adjacents =
      filter === "mirror" ? [] : [...ADJACENT_PAIRS].filter(matchQ).sort(sortFn);

    const all = [...mirrors, ...adjacents];
    const bestAccuracy = all.length
      ? Math.max(...all.map((p) => Math.max(0, p.accuracy)))
      : 0;

    return { mirrors, adjacents, totalShown: all.length, bestAccuracy };
  }, [filter, sort, query]);

  const FilterPill = ({ value, label }: { value: Filter; label: string }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-2 py-1 rounded-md text-[9px] tracking-wider uppercase font-semibold transition-all ${
        filter === value
          ? "bg-foreground/[0.12] text-foreground border border-foreground/25"
          : "bg-foreground/[0.03] text-foreground/55 border border-foreground/10 hover:text-foreground/80"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="relative px-3.5 pt-3 pb-2.5 border-b border-border/20 overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.05] via-foreground/[0.015] to-transparent pointer-events-none" />
        <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent" />
        <div className="relative flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-foreground/[0.06] border border-foreground/10">
            <Orbit className="w-2.5 h-2.5 text-foreground/70" strokeWidth={2} />
          </div>
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/90">
            Orbital Pairs
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-foreground/15 to-transparent" />
          <span className="text-[8.5px] tabular-nums text-foreground/60">
            {totalShown}/{MIRROR_PAIRS.length + ADJACENT_PAIRS.length}
          </span>
        </div>
        <p className="relative text-[9px] text-muted-foreground/55 leading-snug pl-7">
          (b/a)^(2/3) of each pair lands on a musical consonance.
        </p>

        {/* Metric chips */}
        <div className="mt-2 flex items-center gap-1.5 pl-7">
          <span className="text-[8.5px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-foreground/[0.05] border border-foreground/10 text-foreground/70">
            Belt {ASTEROID_BELT_AU} AU
          </span>
          <span className="text-[8.5px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-foreground/[0.05] border border-foreground/10 text-foreground/70 tabular-nums">
            Best {bestAccuracy.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-3 pt-2 pb-2 flex flex-col gap-2 border-b border-border/15 shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-foreground/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter planets or interval…"
            className="w-full pl-6 pr-2 py-1.5 rounded-md text-[10px] bg-foreground/[0.04] border border-foreground/10 placeholder:text-foreground/35 text-foreground/85 focus:outline-none focus:border-foreground/30 focus:bg-foreground/[0.06]"
          />
        </div>
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex gap-1">
            <FilterPill value="all" label="All" />
            <FilterPill value="mirror" label="Mirror" />
            <FilterPill value="adjacent" label="Adjacent" />
          </div>
          <button
            onClick={() =>
              setSort(sort === "default" ? "accuracy" : sort === "accuracy" ? "value" : "default")
            }
            className="flex items-center gap-1 px-1.5 py-1 rounded-md text-[9px] tracking-wider uppercase font-semibold bg-foreground/[0.03] border border-foreground/10 text-foreground/70 hover:text-foreground transition-all"
            title="Cycle sort: default → accuracy → value"
          >
            <ArrowUpDown className="w-2.5 h-2.5" />
            {sort}
          </button>
        </div>
      </div>

      {/* Scroll body */}
      <div className="flex-1 overflow-y-auto">
        {mirrors.length > 0 && (
          <>
            <SectionHeader
              label="Mirror · across asteroid belt"
              count={mirrors.length}
              hint="√(a·b) ≈ 2.77 AU — geometric mean lands on the belt."
            />
            <div className="px-2 pb-2 space-y-1">
              {mirrors.map((p) => (
                <PairRow
                  key={p.id}
                  pair={p}
                  active={p.id === selectedPairId}
                  onSelect={() => onSelect(p.id)}
                  onPlanetContext={onPlanetContext}
                />
              ))}
            </div>
          </>
        )}

        {adjacents.length > 0 && (
          <>
            <SectionHeader
              label="Adjacent · neighbour consonance"
              count={adjacents.length}
              hint="(outer/inner)^(2/3) matches a Pythagorean interval."
            />
            <div className="px-2 pb-2 space-y-1">
              {adjacents.map((p) => (
                <PairRow
                  key={p.id}
                  pair={p}
                  active={p.id === selectedPairId}
                  onSelect={() => onSelect(p.id)}
                  onPlanetContext={onPlanetContext}
                />
              ))}
            </div>
          </>
        )}

        {totalShown === 0 && (
          <div className="px-4 py-8 text-center text-[10px] text-muted-foreground/55">
            No pairs match your filter.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border/15 shrink-0 flex items-center justify-center gap-1.5">
        <Volume2 className="w-2.5 h-2.5 text-foreground/40" />
        <p className="text-[8.5px] text-muted-foreground/45 tracking-wider leading-relaxed">
          Right-click a planet to play its tone
        </p>
      </div>
    </div>
  );
};
