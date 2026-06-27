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

  return (
    <div className="flex flex-col gap-3">
      {/* Header / filters */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/55">
            Cross-Layer Events
          </div>
          <div className="text-[13px] font-semibold tracking-[0.1em] uppercase text-foreground/95">
            Anomaly & Pattern Feed
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/80">
          {ALL_SEVERITIES.map((sv) => {
            const style = SEVERITY_STYLE[sv];
            return (
              <span
                key={sv}
                className="px-1.5 py-0.5 rounded border"
                style={{ color: style.color, borderColor: style.border, background: style.bg }}
              >
                {style.label} · {counts[sv]}
              </span>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55">Layers</div>
        {SCOPES.map((s) => {
          const active = activeScopes.has(s.id);
          return (
            <button
              key={s.id}
              onClick={() => toggleScope(s.id)}
              className="px-2 py-1 rounded-md text-[9px] tracking-[0.12em] uppercase border transition-all"
              style={{
                background: active ? "hsla(210,50%,18%,0.75)" : "hsla(240,20%,10%,0.5)",
                borderColor: active ? "hsla(210,70%,60%,0.5)" : "hsla(220,20%,30%,0.25)",
                color: active ? "hsl(0,0%,98%)" : "hsla(220,20%,75%,0.7)",
              }}
            >
              {s.label}
            </button>
          );
        })}
        <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 ml-2">Min</div>
        {ALL_SEVERITIES.map((sv) => {
          const active = sv === minSeverity;
          const style = SEVERITY_STYLE[sv];
          return (
            <button
              key={sv}
              onClick={() => setMinSeverity(sv)}
              className="px-2 py-1 rounded-md text-[9px] tracking-[0.12em] uppercase border transition-all"
              style={{
                background: active ? style.bg : "hsla(240,20%,10%,0.5)",
                borderColor: active ? style.border : "hsla(220,20%,30%,0.25)",
                color: active ? style.color : "hsla(220,20%,75%,0.7)",
              }}
            >
              {style.label}
            </button>
          );
        })}
      </div>

      {/* Feed */}
      {events.length === 0 ? (
        <div className="text-[11px] text-muted-foreground/70 py-6 text-center border border-border/30 rounded-md">
          No events detected at this severity. Lower the threshold or include more layers.
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {events.map((e) => (
            <EventRow key={e.id} event={e} onSelect={onSelectDataset} />
          ))}
        </ul>
      )}

      <div className="text-[9px] text-muted-foreground/55 leading-relaxed border-t border-border/30 pt-2">
        Events are computed from the loaded series via z-score, drift, and dominant-period detectors. Severity reflects statistical magnitude, not real-world urgency. Evidence tags reflect each dataset's provenance — measured, modeled, or synthetic.
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
  return (
    <li>
      <button
        onClick={() => onSelect?.(event.datasetId, event.scope)}
        className="w-full text-left flex items-start gap-2 px-3 py-2 rounded-md border border-border/30 bg-background/30 hover:bg-foreground/[0.04] transition-colors"
      >
        <span
          className="text-[8px] uppercase tracking-[0.18em] font-semibold px-1.5 py-0.5 rounded border whitespace-nowrap mt-0.5"
          style={{ color: sev.color, borderColor: sev.border, background: sev.bg }}
        >
          {sev.label}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[10px] uppercase tracking-[0.14em] text-foreground/85">{event.datasetLabel}</span>
            <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55">{event.scope}</span>
            <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55">· {EVENT_KIND_LABEL[event.kind]}</span>
            <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/40">· {event.evidence}</span>
          </div>
          <div className="text-[10px] text-muted-foreground/85 leading-relaxed mt-0.5">{event.summary}</div>
        </div>
        <span className="text-[9px] font-mono text-muted-foreground/55 whitespace-nowrap mt-1">
          {event.position.toFixed(1)} {event.unit}
        </span>
      </button>
    </li>
  );
}
