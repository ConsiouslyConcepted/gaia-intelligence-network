import { useNavigate } from "react-router-dom";
import { Activity, Signal, Sparkles } from "lucide-react";

const HudPanel = ({ children, className = "", glow }: { children: React.ReactNode; className?: string; glow?: string }) => (
  <div
    className={`relative rounded-xl border border-border/30 backdrop-blur-2xl ${className}`}
    style={{
      background: "linear-gradient(145deg, hsla(240,20%,13%,0.92) 0%, hsla(240,25%,9%,0.88) 50%, hsla(240,22%,7%,0.92) 100%)",
      boxShadow: glow
        ? `0 0 40px ${glow}15, inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.6)`
        : "inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.6)",
    }}
  >
    {children}
  </div>
);

const Cosmological = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full relative overflow-hidden bg-background">
      {/* Starfield background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, hsla(240,40%,8%,1) 0%, hsla(240,50%,3%,1) 100%)",
        }}
      />
      <div
        className="absolute inset-0 z-[1] opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, hsla(0,0%,100%,0.8), transparent), radial-gradient(1px 1px at 70% 60%, hsla(0,0%,100%,0.6), transparent), radial-gradient(2px 2px at 40% 80%, hsla(0,0%,100%,0.5), transparent), radial-gradient(1px 1px at 85% 20%, hsla(0,0%,100%,0.7), transparent), radial-gradient(1px 1px at 15% 70%, hsla(0,0%,100%,0.5), transparent), radial-gradient(2px 2px at 55% 15%, hsla(0,0%,100%,0.4), transparent)",
          backgroundSize: "400px 400px",
        }}
      />

      {/* Top bar with toggle */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none px-4 pt-3">
        <HudPanel className="pointer-events-auto px-4 py-2.5 flex items-center justify-between" glow="#a78bfa">
          <div>
            <h1 className="text-[11px] font-bold tracking-[0.25em] uppercase text-foreground/80">Cosmological Intelligence</h1>
            <p className="text-[7px] tracking-[0.25em] uppercase text-muted-foreground/30 mt-0.5">
              Galactic & Universal Field · Deep Space Observatory
            </p>
          </div>

          <div className="flex gap-1.5 rounded-2xl p-1.5" style={{ background: "hsla(240,25%,8%,0.7)", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.03)", border: "1px solid hsla(0,0%,100%,0.06)" }}>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 hover:bg-foreground/[0.05] hover:text-foreground/70"
              style={{ color: "hsla(0,0%,100%,0.4)" }}
            >
              Planetary
            </button>
            <button
              onClick={() => navigate("/?view=hgs")}
              className="px-6 py-2.5 rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 hover:bg-foreground/[0.05] hover:text-foreground/70"
              style={{ color: "hsla(0,0%,100%,0.4)" }}
            >
              Universal
            </button>
            <button
              className="px-6 py-2.5 rounded-xl text-[11px] font-semibold tracking-[0.18em] uppercase transition-all duration-300"
              style={{
                background: "linear-gradient(180deg, hsla(0,0%,100%,0.10) 0%, hsla(0,0%,100%,0.04) 100%)",
                color: "hsla(0,0%,100%,0.95)",
                border: "1px solid hsla(0,0%,100%,0.14)",
                boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.12), 0 4px 14px rgba(0,0,0,0.45), 0 0 20px hsla(38,40%,60%,0.08)",
              }}
            >
              Cosmological
            </button>
          </div>
        </HudPanel>
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none px-4">
        <HudPanel className="pointer-events-auto max-w-2xl w-full p-8 text-center" glow="#a78bfa">
          <Sparkles className="w-8 h-8 mx-auto mb-4 text-foreground/60" />
          <h2 className="text-[14px] font-semibold tracking-[0.2em] uppercase text-foreground/85 mb-3">
            Cosmological Field Observatory
          </h2>
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed max-w-lg mx-auto">
            Deep-space observability layer — galactic background radiation, interstellar
            plasma currents, cosmic ray flux, and large-scale resonance patterns across
            the universal field. Read-only telemetry from the cosmos beyond the heliopause.
          </p>

          <div className="grid grid-cols-3 gap-3 mt-8">
            {[
              { label: "Galactic Coherence", value: "0.87", unit: "ψ" },
              { label: "Cosmological Ray Flux", value: "1.42", unit: "p/cm²s" },
              { label: "CMB Temp", value: "2.725", unit: "K" },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-lg p-3 border border-border/30"
                style={{ background: "hsla(240,20%,10%,0.6)" }}
              >
                <div className="text-[8px] uppercase tracking-[0.15em] text-muted-foreground/50 mb-1">
                  {m.label}
                </div>
                <div className="text-[16px] font-mono font-semibold text-foreground/85 tabular-nums">
                  {m.value}
                  <span className="text-[8px] text-muted-foreground/40 ml-1 font-normal">{m.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </HudPanel>
      </div>
    </div>
  );
};

export default Cosmological;
