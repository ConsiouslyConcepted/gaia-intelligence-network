import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { STATIONS } from "./stations";
import { cn } from "@/lib/utils";

const scanKeyframes = `
@keyframes scanBar {
  0% { left: 0%; }
  50% { left: 75%; }
  100% { left: 0%; }
}
`;

interface StationOverlayProps {
  activeIndex: number;
  onJumpTo: (idx: number) => void;
}

export default function StationOverlay({ activeIndex, onJumpTo }: StationOverlayProps) {
  const navigate = useNavigate();
  const station = STATIONS[Math.max(0, Math.min(STATIONS.length - 1, activeIndex))];

  return (
    <>
      <style>{scanKeyframes}</style>

      {/* Top bar — Parametric tactical HUD title */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none px-6 pt-4 flex items-start justify-between">
        <div className="pointer-events-auto group">
          <div className="relative inline-block">

            {/* Main HUD block */}
            <div className="relative flex flex-col">
              {/* Top meta bar */}
              <div className="flex items-center gap-3 mb-1.5">
                <div className="flex items-center gap-2 px-1.5 py-0.5 rounded-sm bg-foreground/[0.06] border border-foreground/15">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground/80 animate-pulse" />
                  <span className="text-[8px] font-mono font-bold tracking-[0.18em] text-foreground/75 uppercase leading-none mt-0.5">
                    System.Active
                  </span>
                </div>
                <div className="flex-grow h-px bg-foreground/15" />
                <span className="text-[8px] font-mono text-muted-foreground/55 tracking-tighter">
                  SECURE_NODE // 0x4F2
                </span>
              </div>

              {/* Brand wordmark */}
              <div className="relative">
                <h1 className="text-[32px] md:text-[40px] font-display font-bold text-foreground tracking-tight leading-none">
                  GAIASPHERE
                </h1>
                {/* Underline accents — monochrome glass with loading scan */}
                <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-foreground/25 shadow-[0_0_18px_hsla(210,75%,62%,0.45)]" />
                <div
                  className="absolute -bottom-1 h-[2px] bg-foreground/80 shadow-[0_0_12px_hsla(0,0%,100%,0.7)]"
                  style={{
                    width: "25%",
                    left: "0%",
                    animation: "scanBar 2.4s ease-in-out infinite",
                  }}
                />
              </div>

              {/* Secondary descriptor */}
              <div className="mt-2 flex items-center gap-4">
                <h2 className="text-[10px] md:text-[11px] font-mono font-medium tracking-[0.42em] text-muted-foreground/80 uppercase">
                  Intelligence Observatory
                </h2>
                <div className="flex gap-0.5">
                  <div className="w-px h-3 bg-foreground/15" />
                  <div className="w-px h-3 bg-foreground/35" />
                  <div className="w-px h-3 bg-foreground/70" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission statement */}
        <div
          className="pointer-events-auto max-w-[440px] rounded-xl px-4 py-3"
          style={{
            background: "linear-gradient(145deg, hsla(225,45%,11%,0.85) 0%, hsla(225,50%,7%,0.82) 50%, hsla(228,55%,5%,0.85) 100%)",
            border: "1.5px solid hsla(220,35%,60%,0.55)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 24px hsla(210,75%,62%,0.22), 0 12px 32px rgba(0,0,0,0.55)",
          }}
        >
          <p className="text-[11px] leading-relaxed text-muted-foreground/85">
            Explore the nested systems of organization that shape Earth, the Solar System, the Milky Way, and the observable universe through real-time scientific data, systems intelligence, and AI-assisted analysis.
          </p>
        </div>
      </div>

      {/* Right rail — station list */}
      <div className="absolute top-1/2 right-4 z-30 -translate-y-1/2 pointer-events-auto">
        <div
          className="rounded-2xl p-2 flex flex-col gap-0.5"
          style={{
            background: "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
            border: "1.5px solid hsla(220,35%,60%,0.55)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 24px hsla(210,75%,62%,0.28), 0 0 48px hsla(210,70%,55%,0.18), 0 12px 32px rgba(0,0,0,0.55)",
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

      {/* Bottom-left HUD card */}
      <div className="absolute left-6 bottom-8 z-30 pointer-events-auto w-[min(640px,calc(100vw-88px))]">
        <div
          key={station.id}
          className="rounded-2xl px-6 py-5 animate-fade-in"
          style={{
            background: "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
            border: "1.5px solid hsla(220,35%,60%,0.55)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 32px hsla(210,75%,62%,0.28), 0 0 64px hsla(210,70%,55%,0.18), 0 16px 48px rgba(0,0,0,0.65)",
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
