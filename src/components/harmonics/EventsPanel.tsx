import { useMemo, useState } from "react";
import {
  scanAllLayers,
  EVENT_KIND_LABEL,
  SEVERITY_STYLE,
  type HarmonicEvent,
  type Severity,
} from "@/lib/harmonics/anomalies";
import { SCOPES, type Scope } from "@/lib/harmonics/datasets";

const ALL_SEVERITIES: Severity[] = ["info", "watch", "alert"];

export function EventsPanel({
  onSelectDataset,
}: {
  onSelectDataset?: (datasetId: string, scope: Scope) => void;
}) {
  const [activeScopes, setActiveScopes] = useState<Set<Scope>>(new Set(SCOPES.map((s) => s.id)));
  const [minSeverity, setMinSeverity] = useState<Severity>("info");

  const events = useMemo(
    () => scanAllLayers({ scopes: Array.from(activeScopes), minSeverity, limit: 80 }),
    [activeScopes, minSeverity],
  );

  const counts = useMemo(() => {
    const c: Record<Severity, number> = { info: 0, watch: 0, alert: 0 };
    for (const e of events) c[e.severity]++;
    return c;
  }, [events]);

  const maxScore = useMemo(
    () => events.reduce((m, e) => Math.max(m, Math.abs(e.score)), 1),
    [events],
  );

  const toggleScope = (s: Scope) => {
    setActiveScopes((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      if (next.size === 0) return new Set([s]);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/20 pb-3">
        <div>
          <div className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground/55">
            Cross-Layer Events
          </div>
          <div className="text-[15px] font-semibold tracking-[0.12em] uppercase text-foreground/95 mt-0.5">
            Anomaly &amp; Pattern Feed
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {ALL_SEVERITIES.map((sv) => {
            const style = SEVERITY_STYLE[sv];
            return (
              <div
                key={sv}
                className="flex items-baseline gap-1.5 px-2.5 py-1 rounded border"
                style={{ borderColor: style.border, background: style.bg }}
              >
                <span className="text-[8px] uppercase tracking-[0.2em]" style={{ color: style.color }}>
                  {style.label}
                </span>
                <span className="text-[12px] font-mono font-semibold tabular-nums" style={{ color: style.color }}>
                  {counts[sv]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/55 mr-1">Layers</span>
          {SCOPES.map((s) => {
            const active = activeScopes.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleScope(s.id)}
                className="px-2 py-1 rounded text-[9px] tracking-[0.14em] uppercase border transition-all"
                style={{
                  background: active ? "hsla(210,55%,16%,0.85)" : "transparent",
                  borderColor: active ? "hsla(210,75%,60%,0.55)" : "hsla(220,15%,28%,0.4)",
                  color: active ? "hsl(0,0%,98%)" : "hsla(220,15%,65%,0.6)",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/55 mr-1">Min</span>
          {ALL_SEVERITIES.map((sv) => {
            const active = sv === minSeverity;
            const style = SEVERITY_STYLE[sv];
            return (
              <button
                key={sv}
                onClick={() => setMinSeverity(sv)}
                className="px-2 py-1 rounded text-[9px] tracking-[0.14em] uppercase border transition-all"
                style={{
                  background: active ? style.bg : "transparent",
                  borderColor: active ? style.border : "hsla(220,15%,28%,0.4)",
                  color: active ? style.color : "hsla(220,15%,65%,0.6)",
                }}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed */}
      {events.length === 0 ? (
        <div className="text-[11px] text-muted-foreground/70 py-8 text-center border border-dashed border-border/30 rounded-md">
          No events at this severity. Lower the threshold or include more layers.
        </div>
      ) : (
        <ul className="flex flex-col">
          {events.map((e, i) => (
            <EventRow
              key={e.id}
              event={e}
              maxScore={maxScore}
              isLast={i === events.length - 1}
              onSelect={onSelectDataset}
            />
          ))}
        </ul>
      )}

      <div className="text-[9px] text-muted-foreground/50 leading-relaxed border-t border-border/20 pt-3">
        Events are computed via z-score, drift, and dominant-period detectors. Severity reflects statistical magnitude, not real-world urgency. Evidence tags denote each dataset's provenance.
      </div>
    </div>
  );
}

function EventRow({
  event,
  maxScore,
  isLast,
  onSelect,
}: {
  event: HarmonicEvent;
  maxScore: number;
  isLast: boolean;
  onSelect?: (datasetId: string, scope: Scope) => void;
}) {
  const sev = SEVERITY_STYLE[event.severity];
  const magnitude = Math.min(1, Math.abs(event.score) / maxScore);

  return (
    <li
      className="relative group transition-colors"
      style={{ borderBottom: isLast ? "none" : "1px solid hsla(220,15%,30%,0.12)" }}
    >
      <button
        onClick={() => onSelect?.(event.datasetId, event.scope)}
        className="w-full text-left flex items-stretch gap-3 py-3 pl-4 pr-3 hover:bg-foreground/[0.025] transition-colors"
      >
        {/* Severity rail */}
        <span
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r"
          style={{ background: sev.color, opacity: 0.7 }}
        />

        {/* Severity chip */}
        <span
          className="text-[8px] uppercase tracking-[0.2em] font-semibold px-1.5 py-0.5 rounded self-start whitespace-nowrap"
          style={{ color: sev.color, background: sev.bg, border: `1px solid ${sev.border}` }}
        >
          {sev.label}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[11px] uppercase tracking-[0.14em] text-foreground/95 font-medium">
              {event.datasetLabel}
            </span>
            <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/55">
              {event.scope} · {EVENT_KIND_LABEL[event.kind]} · {event.evidence}
            </span>
          </div>
          <div className="text-[10.5px] text-muted-foreground/85 leading-snug mt-1">
            {event.summary}
          </div>

          {/* Magnitude bar */}
          <div className="mt-2 h-[2px] rounded-full overflow-hidden" style={{ background: "hsla(220,15%,30%,0.18)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${magnitude * 100}%`,
                background: `linear-gradient(90deg, ${sev.color}55, ${sev.color})`,
              }}
            />
          </div>
        </div>

        {/* Right meta */}
        <div className="flex flex-col items-end gap-0.5 self-start min-w-[80px]">
          <span
            className="text-[13px] font-mono font-semibold tabular-nums leading-none"
            style={{ color: sev.color }}
          >
            {Math.abs(event.score).toFixed(2)}
            <span className="text-[9px] text-muted-foreground/50 ml-0.5">σ</span>
          </span>
          <span className="text-[9px] font-mono text-muted-foreground/50 tabular-nums whitespace-nowrap">
            {event.position.toFixed(1)} {event.unit}
          </span>
        </div>
      </button>
    </li>
  );
}
