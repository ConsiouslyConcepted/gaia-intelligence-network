import { useNavigate } from "react-router-dom";
import { ArrowRight, Activity, Sun, Star, Orbit, Telescope } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { HudPanel } from "./MissionShell";

type Status = "nominal" | "active" | "watch";

interface LayerStatus {
  key: string;
  label: string;
  caption: string;
  icon: LucideIcon;
  route: string;
  status: Status;
  health: number; // 0-100
  events: number;
  recent: string;
  metrics: { label: string; value: string }[];
}

const STATUS_STYLE: Record<Status, { color: string; bg: string; label: string }> = {
  nominal: { color: "hsla(150,70%,75%,0.95)", bg: "hsla(150,60%,30%,0.25)", label: "Nominal" },
  active:  { color: "hsla(45,90%,80%,0.95)",  bg: "hsla(45,75%,35%,0.25)",  label: "Active"  },
  watch:   { color: "hsla(15,90%,75%,0.95)",  bg: "hsla(15,75%,35%,0.25)",  label: "Watch"   },
};

const LAYERS: LayerStatus[] = [
  {
    key: "planetary",
    label: "Planetary Intelligence",
    caption: "Earth Systems · Biosphere → Technosphere",
    icon: Activity,
    route: "/planetary",
    status: "nominal",
    health: 92,
    events: 3,
    recent: "Schumann resonance stable · ENSO neutral",
    metrics: [
      { label: "Spheres",   value: "8 live" },
      { label: "Telemetry", value: "Streaming" },
    ],
  },
  {
    key: "solar",
    label: "Solar Intelligence",
    caption: "Heliosphere · Solar Cycle · Transits",
    icon: Sun,
    route: "/planetary?view=hgs",
    status: "active",
    health: 78,
    events: 5,
    recent: "Cycle 25 active · solar wind elevated",
    metrics: [
      { label: "SSN",        value: "143" },
      { label: "Kp Index",   value: "3.7" },
    ],
  },
  {
    key: "stellar",
    label: "Stellar Intelligence",
    caption: "Evolution · Oscillations · Variability",
    icon: Star,
    route: "/stellar",
    status: "nominal",
    health: 95,
    events: 1,
    recent: "Local stellar neighborhood quiescent",
    metrics: [
      { label: "Tracked",    value: "127 stars" },
      { label: "Variables",  value: "12 active" },
    ],
  },
  {
    key: "galactic",
    label: "Galactic Intelligence",
    caption: "Milky Way · Cosmic Rays · ISM",
    icon: Orbit,
    route: "/galactic",
    status: "nominal",
    health: 88,
    events: 2,
    recent: "Sgr A* baseline · cosmic ray flux nominal",
    metrics: [
      { label: "GCR Flux",   value: "Steady" },
      { label: "Position",   value: "Orion Arm" },
    ],
  },
  {
    key: "cosmological",
    label: "Cosmological Intelligence",
    caption: "CMB · Structure · Spacetime",
    icon: Telescope,
    route: "/cosmological",
    status: "nominal",
    health: 99,
    events: 0,
    recent: "CMB anisotropy stable · H₀ tension monitored",
    metrics: [
      { label: "CMB",        value: "2.725 K" },
      { label: "Layers",     value: "5 active" },
    ],
  },
];

const StatusPill = ({ status }: { status: Status }) => {
  const s = STATUS_STYLE[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] tracking-[0.18em] uppercase font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color.replace("0.95", "0.35")}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
};

const HealthBar = ({ value }: { value: number }) => (
  <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "hsla(240,20%,15%,0.6)" }}>
    <div
      className="h-full rounded-full"
      style={{
        width: `${value}%`,
        background: "linear-gradient(90deg, hsla(200,70%,60%,0.7), hsla(200,80%,80%,0.95))",
        boxShadow: "0 0 12px hsla(200,70%,60%,0.4)",
      }}
    />
  </div>
);

const OverviewWorkspace = () => {
  const navigate = useNavigate();
  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-[1400px] mx-auto pb-4">
        {/* Header */}
        <HudPanel className="p-5 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/55">
                Workspace 01
              </div>
              <h2 className="text-[15px] font-bold tracking-[0.15em] uppercase text-foreground/95 mt-1">
                Universal Overview
              </h2>
              <p className="text-[11px] text-muted-foreground/75 mt-1.5 max-w-2xl leading-relaxed">
                Live operational status across every GaiaSphere intelligence layer. Health, active events,
                and recent changes synthesized from each observatory.
              </p>
            </div>
            <div className="flex gap-2">
              {(["nominal", "active", "watch"] as Status[]).map((s) => (
                <StatusPill key={s} status={s} />
              ))}
            </div>
          </div>
        </HudPanel>

        {/* Five layer cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {LAYERS.map((layer) => {
            const Icon = layer.icon;
            return (
              <HudPanel key={layer.key} className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: "hsla(210,50%,18%,0.55)",
                        border: "1px solid hsla(200,60%,65%,0.35)",
                        boxShadow: "0 0 16px hsla(210,70%,60%,0.18)",
                      }}
                    >
                      <Icon size={18} style={{ color: "hsla(200,80%,82%,0.9)" }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-foreground/90 truncate">
                        {layer.label}
                      </div>
                      <div className="text-[9px] tracking-[0.12em] uppercase text-muted-foreground/55 mt-0.5 truncate">
                        {layer.caption}
                      </div>
                    </div>
                  </div>
                  <StatusPill status={layer.status} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55">
                      System Health
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-foreground/90 tabular-nums">
                      {layer.health}%
                    </span>
                  </div>
                  <HealthBar value={layer.health} />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {layer.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-md p-2 border border-border/30"
                      style={{ background: "hsla(240,20%,10%,0.5)" }}
                    >
                      <div className="text-[7px] uppercase tracking-[0.15em] text-muted-foreground/55 mb-0.5">
                        {m.label}
                      </div>
                      <div className="text-[11px] font-mono font-semibold text-foreground/85 tabular-nums truncate">
                        {m.value}
                      </div>
                    </div>
                  ))}
                  <div
                    className="rounded-md p-2 border border-border/30"
                    style={{ background: "hsla(240,20%,10%,0.5)" }}
                  >
                    <div className="text-[7px] uppercase tracking-[0.15em] text-muted-foreground/55 mb-0.5">
                      Events
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-foreground/85 tabular-nums">
                      {layer.events}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/20 pt-3">
                  <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1">
                    Recent
                  </div>
                  <p className="text-[10px] leading-relaxed text-muted-foreground/85">{layer.recent}</p>
                </div>

                <button
                  onClick={() => navigate(layer.route)}
                  className="mt-auto flex items-center justify-between w-full px-3 py-2 rounded-lg border transition-all duration-300 hover:bg-foreground/[0.04]"
                  style={{
                    background: "hsla(240,25%,8%,0.5)",
                    borderColor: "hsla(220,30%,55%,0.35)",
                  }}
                >
                  <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-foreground/85">
                    Open Dashboard
                  </span>
                  <ArrowRight size={14} className="text-foreground/70" />
                </button>
              </HudPanel>
            );
          })}

          {/* AI synthesis card */}
          <HudPanel className="p-5 flex flex-col gap-3">
            <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/55">
              Mission Synthesis
            </div>
            <div className="text-[13px] font-bold tracking-[0.1em] uppercase text-foreground/90">
              All Systems Synchronized
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground/85">
              Every observatory is reporting. Solar Cycle 25 is the dominant driver across the network,
              with elevated planetary magnetosphere response. Stellar, Galactic, and Cosmological layers
              are baseline.
            </p>
            <div className="mt-auto text-[8px] tracking-[0.2em] uppercase text-muted-foreground/45">
              Updated continuously · synthesized across 5 observatories
            </div>
          </HudPanel>
        </div>
      </div>
    </div>
  );
};

export default OverviewWorkspace;
