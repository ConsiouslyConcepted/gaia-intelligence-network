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

  const toggleScope = (s: Scope) => {
    setActiveScopes((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      if (next.size === 0) return new Set([s]);
      return next;
    });
  };

  const lastUpdate = new Date().toISOString().slice(11, 19);

  return (
    <div
      className="rounded-lg border overflow-hidden flex flex-col font-sans"
      style={{
        background: "hsla(220,30%,8%,0.4)",
        borderColor: "hsla(220,15%,25%,0.6)",
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3"
        style={{ borderColor: "hsla(220,15%,25%,0.8)", background: "hsla(220,40%,5%,0.2)" }}
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-muted-foreground/55 mb-1">
            Cross-Layer Events
          </p>
          <h2 className="text-[19px] font-semibold tracking-tight text-foreground/95 uppercase">
            Anomaly &amp; Pattern Feed
          </h2>
        </div>
        <div className="flex gap-2">
          {ALL_SEVERITIES.map((sv) => {
            const style = SEVERITY_STYLE[sv];
            return (
              <div
                key={sv}
                className="flex items-center gap-1.5 px-3 py-1 rounded border text-[11px] font-bold"
                style={{ borderColor: style.border, background: style.bg }}
              >
                <span style={{ color: style.color }}>{style.label}</span>
                <span className="text-foreground/70 font-mono tabular-nums">{counts[sv]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-b"
        style={{ borderColor: "hsla(220,15%,25%,0.5)", background: "hsla(220,40%,4%,0.3)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground/55 font-bold uppercase tracking-wider">
            Layers
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SCOPES.map((s) => {
              const active = activeScopes.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleScope(s.id)}
                  className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-tighter border rounded transition-all"
                  style={{
                    background: active ? "hsla(210,50%,18%,0.5)" : "transparent",
                    borderColor: active ? "hsla(210,60%,55%,0.45)" : "hsla(220,15%,25%,0.5)",
                    color: active ? "hsl(0,0%,92%)" : "hsla(220,12%,55%,0.7)",
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground/55 font-bold uppercase tracking-wider">
            Min
          </span>
          <div className="flex gap-1.5">
            {ALL_SEVERITIES.map((sv) => {
              const active = sv === minSeverity;
              const style = SEVERITY_STYLE[sv];
              return (
                <button
                  key={sv}
                  onClick={() => setMinSeverity(sv)}
                  className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-tighter border rounded transition-all"
                  style={{
                    background: active ? style.bg : "transparent",
                    borderColor: active ? style.border : "hsla(220,15%,25%,0.5)",
                    color: active ? style.color : "hsla(220,12%,55%,0.7)",
                  }}
                >
                  {style.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feed */}
      {events.length === 0 ? (
        <div className="text-[11px] text-muted-foreground/70 py-10 text-center">
          No events at this severity. Lower the threshold or include more layers.
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: "hsla(220,15%,25%,0.3)" }}>
          {events.map((e) => (
            <EventRow key={e.id} event={e} onSelect={onSelectDataset} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        className="px-6 py-2 flex items-center justify-between border-t text-[9px] font-mono text-muted-foreground/45 uppercase tracking-wider"
        style={{ borderColor: "hsla(220,15%,25%,0.5)", background: "hsla(220,40%,4%,0.35)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "hsl(150,70%,50%)" }}
          />
          <span>Sync: Optimal · {events.length} events</span>
        </div>
        <div>Last update: {lastUpdate} UTC</div>
      </div>
    </div>
  );
}

function EventRow({
  event,
  onSelect,
}: {
  event: HarmonicEvent;
  onSelect?: (datasetId: string, scope: Scope) => void;
}) {
  const sev = SEVERITY_STYLE[event.severity];
  const positionLabel = formatPosition(event.position, event.unit);

  return (
    <div
      className="group flex relative hover:bg-foreground/[0.025] transition-colors cursor-pointer"
      onClick={() => onSelect?.(event.datasetId, event.scope)}
    >
      {/* Severity rail */}
      <div
        className="w-[3px] shrink-0"
        style={{
          background: sev.color,
          boxShadow: event.severity === "alert" ? `0 0 12px ${sev.color}66` : undefined,
          opacity: event.severity === "info" ? 0.55 : 0.95,
        }}
      />

      <div className="flex-1 grid grid-cols-12 gap-4 items-center px-5 py-3.5 min-w-0">
        {/* Metadata column */}
        <div className="col-span-3 min-w-0">
          <div
            className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase mb-1.5 tracking-[0.18em] border"
            style={{ background: sev.bg, color: sev.color, borderColor: sev.border }}
          >
            {sev.label}
          </div>
          <div className="font-mono text-[9px] text-muted-foreground/55 space-y-0.5 uppercase">
            <MetaLine label="Scope" value={event.scope} />
            <MetaLine label="Kind" value={EVENT_KIND_LABEL[event.kind]} />
            <MetaLine label="Tier" value={event.evidence} />
          </div>
        </div>

        {/* Title + summary */}
        <div className="col-span-7 min-w-0">
          <h3 className="text-foreground/95 font-semibold text-[12px] tracking-[0.06em] uppercase mb-1 truncate">
            {event.datasetLabel}
          </h3>
          <p className="text-muted-foreground/80 text-[11px] leading-relaxed line-clamp-2">
            {event.summary}
          </p>
        </div>

        {/* Sigma + position */}
        <div className="col-span-2 text-right shrink-0">
          <div
            className="font-mono text-[20px] font-bold leading-none tabular-nums"
            style={{ color: sev.color }}
          >
            {Math.abs(event.score).toFixed(2)}
            <span className="text-[11px] ml-0.5 opacity-70">σ</span>
          </div>
          <div className="font-mono text-[10px] text-muted-foreground/50 mt-1 tabular-nums uppercase tracking-wider">
            {positionLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground/40">{label}:</span>
      <span className="text-foreground/70 truncate">{value}</span>
    </div>
  );
}

function formatPosition(pos: number, unit: string): string {
  const abs = Math.abs(pos);
  if (abs >= 1000 && unit === "day") return `${(pos / 365).toFixed(1)} yr`;
  return `${pos.toFixed(1)} ${unit}`;
}
