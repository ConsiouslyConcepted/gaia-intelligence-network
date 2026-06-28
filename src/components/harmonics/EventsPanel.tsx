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
  selectedEventId,
  onSelectEvent,
  onOpenInSingle,
  onDiscussWithAssistant,
  // legacy callback kept for any older callers
  onSelectDataset,
}: {
  selectedEventId?: string | null;
  onSelectEvent?: (event: HarmonicEvent) => void;
  onOpenInSingle?: (event: HarmonicEvent) => void;
  onDiscussWithAssistant?: (event: HarmonicEvent) => void;
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
        <div className="flex flex-col gap-3 px-5 py-5">
          {events.map((e) => (
            <EventRow
              key={e.id}
              event={e}
              selected={selectedEventId === e.id}
              onSelect={(ev) => {
                onSelectEvent?.(ev);
                // back-compat for old callers
                onSelectDataset?.(ev.datasetId, ev.scope);
              }}
              onOpenInSingle={onOpenInSingle}
              onDiscussWithAssistant={onDiscussWithAssistant}
            />
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
  selected,
  onSelect,
  onOpenInSingle,
  onDiscussWithAssistant,
}: {
  event: HarmonicEvent;
  selected?: boolean;
  onSelect?: (event: HarmonicEvent) => void;
  onOpenInSingle?: (event: HarmonicEvent) => void;
  onDiscussWithAssistant?: (event: HarmonicEvent) => void;
}) {
  const sev = SEVERITY_STYLE[event.severity];
  const positionLabel = formatPosition(event.position, event.unit);
  const sign = event.score >= 0 ? "+" : "−";
  const kindLabel = EVENT_KIND_LABEL[event.kind];

  return (
    <div
      onClick={() => onSelect?.(event)}
      className="group relative flex items-center gap-6 rounded-xl border px-5 py-4 cursor-pointer transition-all duration-300"
      style={{
        borderColor: selected ? "hsla(210,80%,65%,0.55)" : "hsla(210,60%,55%,0.10)",
        background: selected ? "hsla(210,40%,12%,0.55)" : "hsla(220,30%,8%,0.4)",
        boxShadow: selected
          ? "inset 0 1px 1px hsla(0,0%,100%,0.08), 0 0 24px hsla(210,80%,60%,0.25)"
          : "inset 0 1px 1px hsla(0,0%,100%,0.04), 0 0 20px hsla(220,40%,2%,0.4)",
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.borderColor = "hsla(210,60%,55%,0.30)";
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.borderColor = "hsla(210,60%,55%,0.10)";
      }}
    >
      {/* Severity chip */}
      <div className="flex items-center justify-center w-20 shrink-0">
        <span
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-tighter uppercase"
          style={{
            borderColor: sev.border,
            background: sev.bg,
            color: sev.color,
            boxShadow: `0 0 8px ${sev.color}33`,
          }}
        >
          <span
            className={`w-1 h-1 rounded-full ${event.severity === "alert" ? "animate-pulse" : ""}`}
            style={{ background: sev.color }}
          />
          {sev.label}
        </span>
      </div>

      {/* Metadata stack */}
      <div
        className="flex flex-col gap-1 w-36 shrink-0 border-r pr-6"
        style={{ borderColor: "hsla(220,15%,25%,0.6)" }}
      >
        <MetaLine label="Scope" value={event.scope} />
        <MetaLine label="Kind" value={kindLabel} />
        <MetaLine label="Tier" value={event.evidence} bold />
      </div>

      {/* Title + summary + actions */}
      <div className="flex-1 min-w-0">
        <h3 className="text-foreground/95 font-semibold text-[13px] leading-tight mb-1 truncate">
          {event.datasetLabel}
        </h3>
        <p className="text-muted-foreground/75 text-[11px] leading-relaxed line-clamp-2">
          {event.summary}
        </p>
        {(onOpenInSingle || onDiscussWithAssistant) && (
          <div className="mt-2 flex flex-wrap gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onOpenInSingle && (
              <button
                onClick={(e) => { e.stopPropagation(); onOpenInSingle(event); }}
                className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border transition-all"
                style={{
                  borderColor: "hsla(210,60%,55%,0.4)",
                  background: "hsla(210,50%,15%,0.5)",
                  color: "hsla(210,60%,85%,0.95)",
                }}
              >
                Open in Single Layer
              </button>
            )}
            {onDiscussWithAssistant && (
              <button
                onClick={(e) => { e.stopPropagation(); onDiscussWithAssistant(event); }}
                className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border transition-all"
                style={{
                  borderColor: "hsla(45,80%,55%,0.4)",
                  background: "hsla(45,60%,15%,0.4)",
                  color: "hsla(45,80%,85%,0.95)",
                }}
              >
                Ask Analyst
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sigma metric */}
      <div
        className="flex flex-col items-end w-32 shrink-0 border-l pl-6"
        style={{ borderColor: "hsla(220,15%,25%,0.6)" }}
      >
        <span className="text-[9px] font-bold text-muted-foreground/55 tracking-widest uppercase mb-1">
          Deviation
        </span>
        <span
          className="font-mono text-2xl font-bold tabular-nums leading-none"
          style={{
            color: sev.color,
            textShadow: `0 0 10px ${sev.color}4d`,
          }}
        >
          {sign}
          {Math.abs(event.score).toFixed(2)}
          <span className="text-sm ml-0.5 opacity-80">σ</span>
        </span>
        <span className="text-[10px] font-mono text-muted-foreground/50 mt-1.5 uppercase tracking-wider">
          {positionLabel}
        </span>
      </div>
    </div>
  );
}


function MetaLine({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] font-bold text-muted-foreground/55 tracking-widest uppercase">
        {label}
      </span>
      <span
        className={`text-[11px] font-mono text-foreground/80 tabular-nums truncate ${bold ? "font-bold" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function formatPosition(pos: number, unit: string): string {
  const abs = Math.abs(pos);
  if (abs >= 1000 && unit === "day") return `${(pos / 365).toFixed(1)} yr`;
  return `${pos.toFixed(1)} ${unit}`;
}
