import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommonsIcon } from "@/components/CommonsIcon";
import { MilkyWayMap, GalacticFocus } from "@/components/galactic/MilkyWayMap";

const HudPanel = ({
  children,
  className = "",
  topBar = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: string;
  topBar?: boolean;
}) => (
  <div
    className={`relative rounded-xl backdrop-blur-2xl ${className}`}
    style={{
      background:
        "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
      border: "1.5px solid hsla(220,35%,60%,0.55)",
      boxShadow:
        "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 32px hsla(210,75%,62%,0.28), 0 0 64px hsla(210,70%,55%,0.18), 0 12px 40px rgba(0,0,0,0.55)",
    }}
  >
    <div
      className="absolute -top-px left-4 right-4 h-px pointer-events-none"
      style={{
        background: topBar
          ? "hsla(220,30%,55%,0.35)"
          : "linear-gradient(90deg, transparent 0%, hsla(200,60%,78%,0.55) 25%, hsla(200,60%,85%,0.75) 50%, hsla(200,60%,78%,0.55) 75%, transparent 100%)",
      }}
    />
    {children}
  </div>
);

const TOGGLE_BTN_BASE =
  "min-w-[140px] text-center px-5 py-2.5 rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05] hover:text-foreground/70";

const ACTIVE_BTN_STYLE: React.CSSProperties = {
  background:
    "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
  color: "hsla(0,0%,100%,0.95)",
  border: "1.5px solid hsla(220,35%,60%,0.55)",
  boxShadow:
    "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 32px hsla(210,75%,62%,0.28), 0 0 64px hsla(210,70%,55%,0.18), 0 12px 40px rgba(0,0,0,0.55)",
};

type MetricKey = Exclude<GalacticFocus, null>;

const METRICS: {
  key: MetricKey;
  label: string;
  value: string;
  unit: string;
  note: string;
}[] = [
  {
    key: "galactic-center",
    label: "Galactic Center",
    value: "26.7",
    unit: "kly",
    note: "Heliocentric distance to Sagittarius A* · galactic longitude 0°",
  },
  {
    key: "solar-position",
    label: "Solar System Position",
    value: "Orion Arm",
    unit: "",
    note: "Within the Local Spur, ~20 ly north of galactic mid-plane",
  },
  {
    key: "cosmic-rays",
    label: "Cosmic Ray Flux",
    value: "1.42",
    unit: "p/cm²·s",
    note: "Integrated GeV nucleon flux at 1 AU · modulated by heliosphere",
  },
  {
    key: "lism",
    label: "Local Interstellar Environment",
    value: "Local Bubble",
    unit: "",
    note: "Hot, low-density cavity (~300 ly) carved by ancient supernovae",
  },
  {
    key: "orbital-cycle",
    label: "Galactic Orbital Cycle",
    value: "225",
    unit: "Myr",
    note: "Solar System orbital period around the galactic barycenter",
  },
];

const Galactic = () => {
  const navigate = useNavigate();
  const [focus, setFocus] = useState<GalacticFocus>(null);

  const activeMetric = METRICS.find((m) => m.key === focus);

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

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none px-4 pt-6">
        <HudPanel
          className="pointer-events-auto px-4 py-4 flex items-center justify-between"
          topBar
        >
          <div>
            <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-foreground/90">
              Galactic Intelligence
            </h1>
            <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/50 mt-0.5">
              Milky Way Context · Solar System in Galactic Frame
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex gap-1.5 rounded-2xl p-1.5"
              style={{
                background: "hsla(228,40%,5%,0.6)",
                border: "1px solid hsla(220,40%,65%,0.5)",
                boxShadow:
                  "inset 0 1px 0 hsla(0,0%,100%,0.08), inset 0 -1px 0 rgba(0,0,0,0.4), 0 0 24px hsla(210,70%,60%,0.28), 0 0 48px hsla(210,70%,55%,0.18), 0 12px 32px rgba(0,0,0,0.5)",
                backdropFilter: "blur(12px)",
              }}
            >
              <button
                onClick={() => navigate("/")}
                className={TOGGLE_BTN_BASE}
                style={{ color: "hsla(0,0%,100%,0.4)" }}
              >
                Planetary
              </button>
              <button
                onClick={() => navigate("/?view=hgs")}
                className={TOGGLE_BTN_BASE}
                style={{ color: "hsla(0,0%,100%,0.4)" }}
              >
                Universal
              </button>
              <button
                className="min-w-[140px] text-center px-5 py-2.5 rounded-xl text-[11px] font-semibold tracking-[0.18em] uppercase transition-all duration-300"
                style={ACTIVE_BTN_STYLE}
              >
                Galactic
              </button>
              <button
                onClick={() => navigate("/cosmological")}
                className={TOGGLE_BTN_BASE}
                style={{ color: "hsla(0,0%,100%,0.4)" }}
              >
                Cosmological
              </button>
            </div>

            <button
              onClick={() => navigate("/commons")}
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 hover:bg-foreground/[0.06]"
              style={{
                color: "hsla(0,0%,100%,0.75)",
                border: "1px solid hsla(220,30%,55%,0.35)",
                background: "hsla(240,25%,8%,0.5)",
                boxShadow:
                  "inset 0 1px 0 hsla(200,60%,78%,0.18), inset 0 0 6px hsla(210,50%,60%,0.08), 0 0 14px -4px hsla(210,60%,65%,0.2)",
              }}
              title="Planetary Commons Data"
            >
              <CommonsIcon size={20} />
            </button>
          </div>
        </HudPanel>
      </div>

      {/* Center stage — interactive Milky Way map */}
      <div className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none pt-28 pb-44 px-4">
        <div className="pointer-events-auto w-full max-w-[760px] aspect-square relative">
          <MilkyWayMap focus={focus} onSelect={setFocus} />

          {/* Active metric callout */}
          {activeMetric && (
            <div
              className="absolute top-3 left-3 max-w-[260px] rounded-lg p-3 border"
              style={{
                background: "hsla(228,45%,7%,0.85)",
                borderColor: "hsla(200,60%,70%,0.45)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/60">
                  {activeMetric.label}
                </div>
                <button
                  onClick={() => setFocus(null)}
                  className="text-[10px] text-muted-foreground/50 hover:text-foreground/80 leading-none"
                >
                  ×
                </button>
              </div>
              <div className="text-[15px] font-mono font-semibold text-foreground/90 tabular-nums mb-1">
                {activeMetric.value}
                {activeMetric.unit && (
                  <span className="text-[8px] text-muted-foreground/50 ml-1 font-normal">
                    {activeMetric.unit}
                  </span>
                )}
              </div>
              <p className="text-[9px] text-muted-foreground/65 leading-snug">
                {activeMetric.note}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom metric rail — click to focus on the map */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none px-4 pb-6">
        <HudPanel className="pointer-events-auto p-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {METRICS.map((m) => {
              const isActive = focus === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setFocus(isActive ? null : m.key)}
                  className="text-left rounded-lg p-3 border transition-all duration-300"
                  style={{
                    background: isActive
                      ? "hsla(210,50%,18%,0.75)"
                      : "hsla(240,20%,10%,0.6)",
                    borderColor: isActive
                      ? "hsla(200,70%,70%,0.6)"
                      : "hsla(220,30%,40%,0.3)",
                    boxShadow: isActive
                      ? "inset 0 1px 0 hsla(200,60%,80%,0.15), 0 0 20px hsla(200,70%,60%,0.25)"
                      : undefined,
                  }}
                >
                  <div className="text-[8px] uppercase tracking-[0.15em] text-muted-foreground/55 mb-1.5">
                    {m.label}
                  </div>
                  <div className="text-[13px] font-mono font-semibold text-foreground/85 tabular-nums">
                    {m.value}
                    {m.unit && (
                      <span className="text-[7px] text-muted-foreground/45 ml-1 font-normal">
                        {m.unit}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[8px] tracking-[0.2em] uppercase text-muted-foreground/40 mt-2 text-center">
            Click a metric or an element on the map to isolate · read-only telemetry
          </p>
        </HudPanel>
      </div>
    </div>
  );
};

export default Galactic;
