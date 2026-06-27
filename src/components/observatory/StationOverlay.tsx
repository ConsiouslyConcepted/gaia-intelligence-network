import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { STATIONS } from "./stations";
import { cn } from "@/lib/utils";

interface StationOverlayProps {
  activeIndex: number;
  onJumpTo: (idx: number) => void;
}

export default function StationOverlay({ activeIndex, onJumpTo }: StationOverlayProps) {
  const navigate = useNavigate();
  const station = STATIONS[Math.max(0, Math.min(STATIONS.length - 1, activeIndex))];

  return (
    <>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none px-6 pt-5 flex items-start justify-between">
        <div className="pointer-events-auto">
          <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground/70">Gaiasphere</div>
          <div className="text-[18px] font-semibold tracking-[0.18em] uppercase text-foreground/95">
            Intelligence Observatory
          </div>
        </div>
        <div className="pointer-events-auto text-right">
          <div className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/55">Digital Twin</div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">Live Telemetry</div>
        </div>
      </div>

      {/* Right rail — station list */}
      <div className="absolute top-1/2 right-4 z-30 -translate-y-1/2 pointer-events-auto">
        <div
          className="rounded-xl border p-2 flex flex-col gap-0.5"
          style={{
            background: "hsla(228,40%,7%,0.55)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderColor: "hsla(220,20%,40%,0.22)",
            boxShadow: "0 8px 32px hsla(228,60%,2%,0.6), inset 0 0 0 1px hsla(220,30%,60%,0.06)",
          }}
        >
          <button
            onClick={() => onJumpTo(Math.max(0, activeIndex - 1))}
            className="px-2 py-1 rounded text-foreground/60 hover:text-foreground/90 transition-colors"
            aria-label="Zoom in"
          >
            <ChevronUp className="w-3.5 h-3.5 mx-auto" />
          </button>

          <div className="flex flex-col gap-0.5 my-1">
            {STATIONS.map((s, i) => {
              const active = i === activeIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => onJumpTo(i)}
                  className={cn(
                    "group flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all text-left",
                    active ? "bg-foreground/10" : "hover:bg-foreground/5",
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      active ? "bg-foreground/95 shadow-[0_0_8px_hsla(0,0%,100%,0.6)]" : "bg-muted-foreground/40",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-[0.16em] whitespace-nowrap transition-colors",
                      active ? "text-foreground/95" : "text-muted-foreground/65 group-hover:text-foreground/80",
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onJumpTo(Math.min(STATIONS.length - 1, activeIndex + 1))}
            className="px-2 py-1 rounded text-foreground/60 hover:text-foreground/90 transition-colors"
            aria-label="Zoom out"
          >
            <ChevronDown className="w-3.5 h-3.5 mx-auto" />
          </button>
        </div>
        <div className="text-[8px] uppercase tracking-[0.25em] text-muted-foreground/40 text-center mt-2">
          Scroll · Arrows
        </div>
      </div>

      {/* Bottom-center HUD card */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 z-30 pointer-events-auto w-[min(640px,calc(100vw-32px))]">
        <div
          key={station.id}
          className="rounded-2xl border px-6 py-5 animate-fade-in"
          style={{
            background: "hsla(228,40%,7%,0.62)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            borderColor: "hsla(220,20%,45%,0.25)",
            boxShadow: "0 16px 60px hsla(228,60%,2%,0.7), inset 0 0 0 1px hsla(220,30%,60%,0.06)",
          }}
        >
          <div className="flex items-baseline justify-between gap-4 mb-2">
            <div>
              <div className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground/55">Station {activeIndex + 1} / {STATIONS.length}</div>
              <div className="text-[22px] font-semibold tracking-[0.08em] uppercase text-foreground/95 mt-1">
                {station.label}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/55">Scale</div>
              <div className="text-[13px] font-mono text-foreground/90 mt-0.5">{station.scale}</div>
            </div>
          </div>
          <p className="text-[12px] leading-relaxed text-muted-foreground/85">{station.descriptor}</p>

          {station.dashboard && (
            <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between gap-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                Enter live observatory
              </div>
              <button
                onClick={() => navigate(station.dashboard!.path)}
                className="group flex items-center gap-2 px-4 py-2 rounded-md border transition-all"
                style={{
                  background: "hsla(210,50%,18%,0.65)",
                  borderColor: "hsla(210,70%,60%,0.4)",
                  color: "hsl(0,0%,98%)",
                }}
              >
                <span className="text-[11px] uppercase tracking-[0.18em] font-medium">
                  {station.dashboard.label}
                </span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
