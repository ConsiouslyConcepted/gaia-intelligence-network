import { useNavigate, useSearchParams } from "react-router-dom";
import {
  LayoutGrid,
  MapPin,
  Network,
  Waves,
  Sparkles,
  FileText,
  type LucideIcon,
} from "lucide-react";

import { CommonsIcon } from "@/components/CommonsIcon";
import { NightSkyBackground } from "@/components/NightSkyBackground";

export type Workspace =
  | "overview"
  | "address"
  | "cross-layer"
  | "harmonic"
  | "ai"
  | "reports";

export const WORKSPACES: {
  key: Workspace;
  label: string;
  caption: string;
  icon: LucideIcon;
}[] = [
  { key: "overview",    label: "Overview",      caption: "Universal Systems",     icon: LayoutGrid },
  { key: "address",     label: "Cosmic Address", caption: "Nested Hierarchy",     icon: MapPin },
  { key: "cross-layer", label: "Cross-Layer",   caption: "Living Network",        icon: Network },
  { key: "harmonic",    label: "Harmonic",      caption: "Cycles · Ratios · Yₗᵐ", icon: Waves },
  { key: "ai",          label: "AI Analyst",    caption: "Mission Synthesis",     icon: Sparkles },
  { key: "reports",     label: "Reports",       caption: "Daily · Weekly",        icon: FileText },
];

export const HudPanel = ({
  children,
  className = "",
  topBar = false,
}: {
  children: React.ReactNode;
  className?: string;
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
  "text-center px-2.5 py-2 xl:px-4 xl:py-2.5 xl:min-w-[110px] whitespace-nowrap rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05] hover:text-foreground/70";

const ACTIVE_TOP_BTN: React.CSSProperties = {
  background:
    "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
  color: "hsla(0,0%,100%,0.95)",
  border: "1.5px solid hsla(220,35%,60%,0.55)",
  boxShadow:
    "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 32px hsla(210,75%,62%,0.28), 0 0 64px hsla(210,70%,55%,0.18), 0 12px 40px rgba(0,0,0,0.55)",
};

interface Props {
  active: Workspace;
  children: React.ReactNode;
}

const MissionShell = ({ active, children }: Props) => {
  const navigate = useNavigate();
  const [, setSearch] = useSearchParams();

  const setWorkspace = (w: Workspace) => {
    setSearch((prev) => {
      const next = new URLSearchParams(prev);
      next.set("workspace", w);
      return next;
    });
  };

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <NightSkyBackground />

      {/* Top bar — cross-dashboard nav */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none px-4 pt-6">
        <HudPanel className="pointer-events-auto px-4 py-4 flex items-center justify-between" topBar>
          <div>
            <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-foreground/90">
              Gaiasphere Mission Control
            </h1>
            <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/55 mt-0.5">
              Universal Intelligence · Synthesized Across Every Observatory
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex gap-1 xl:gap-1.5 rounded-2xl p-1 xl:p-1.5 overflow-x-auto max-w-full"
              style={{
                background: "hsla(228,40%,5%,0.6)",
                border: "1px solid hsla(220,40%,65%,0.5)",
                boxShadow:
                  "inset 0 1px 0 hsla(0,0%,100%,0.08), inset 0 -1px 0 rgba(0,0,0,0.4), 0 0 24px hsla(210,70%,60%,0.28), 0 0 48px hsla(210,70%,55%,0.18), 0 12px 32px rgba(0,0,0,0.5)",
                backdropFilter: "blur(12px)",
              }}
            >
              <button onClick={() => navigate("/planetary")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Planetary</button>
              <button onClick={() => navigate("/planetary?view=hgs")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Solar</button>
              <button onClick={() => navigate("/stellar")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Stellar</button>
              <button onClick={() => navigate("/galactic")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Galactic</button>
              <button
                className="text-center px-2.5 py-2 xl:px-4 xl:py-2.5 xl:min-w-[110px] whitespace-nowrap rounded-xl text-[11px] font-semibold tracking-[0.18em] uppercase"
                style={ACTIVE_TOP_BTN}
              >
                Universal
              </button>
              <button onClick={() => navigate("/cosmological")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(0,0%,100%,0.4)" }}>Cosmological</button>
              <button onClick={() => navigate("/harmonics")} className={TOGGLE_BTN_BASE} style={{ color: "hsla(45,100%,75%,0.7)" }}>Analysis</button>
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

      {/* Left rail — workspace selector */}
      <div className="absolute left-4 top-32 bottom-6 z-10 pointer-events-none w-[240px] hidden lg:flex flex-col">
        <HudPanel className="pointer-events-auto p-3 flex-1 flex flex-col gap-2 overflow-y-auto">
          <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 px-2 pt-1 pb-2">
            Mission Workspaces
          </div>
          {WORKSPACES.map((w, idx) => {
            const isActive = w.key === active;
            const Icon = w.icon;
            return (
              <button
                key={w.key}
                onClick={() => setWorkspace(w.key)}
                className="text-left rounded-lg p-3 border transition-all duration-300 flex items-start gap-2.5"
                style={{
                  background: isActive ? "hsla(210,50%,18%,0.75)" : "hsla(240,20%,10%,0.5)",
                  borderColor: isActive ? "hsla(200,70%,70%,0.6)" : "hsla(220,30%,40%,0.25)",
                  boxShadow: isActive
                    ? "inset 0 1px 0 hsla(200,60%,80%,0.15), 0 0 20px hsla(200,70%,60%,0.22)"
                    : undefined,
                }}
              >
                <Icon
                  size={16}
                  className="mt-0.5 shrink-0"
                  style={{ color: isActive ? "hsla(200,80%,80%,0.95)" : "hsla(0,0%,100%,0.5)" }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-0.5">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-foreground/85">
                    {w.label}
                  </div>
                  <div className="text-[9px] text-muted-foreground/55 mt-0.5">{w.caption}</div>
                </div>
              </button>
            );
          })}
        </HudPanel>
      </div>

      {/* Center stage */}
      <div className="absolute inset-0 z-[2] pt-28 pb-6 lg:pl-[260px] pr-4 pl-4 overflow-hidden">
        <div className="w-full h-full">{children}</div>
      </div>
    </div>
  );
};

export default MissionShell;
