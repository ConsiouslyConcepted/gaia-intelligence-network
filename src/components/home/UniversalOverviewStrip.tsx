import { useNavigate } from "react-router-dom";
import { ArrowRight, Activity, Sun, Star, Orbit, Telescope } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  useUSGSEarthquakes,
  useNOAAKpIndex,
  useNOAASolarWind,
  useNOAASolarCycle,
  useNASAEONET,
  useNOAAAlerts,
} from "@/hooks/usePlanetaryData";

type Status = "nominal" | "active" | "watch";

interface LayerCard {
  key: string;
  label: string;
  caption: string;
  icon: LucideIcon;
  route: string;
  status: Status;
  health: number;
  events: number;
  recent: string;
  metrics: { label: string; value: string }[];
}

const STATUS_STYLE: Record<Status, { color: string; bg: string; label: string }> = {
  nominal: { color: "hsla(150,70%,75%,0.95)", bg: "hsla(150,60%,30%,0.25)", label: "Nominal" },
  active:  { color: "hsla(45,90%,80%,0.95)",  bg: "hsla(45,75%,35%,0.25)",  label: "Active"  },
  watch:   { color: "hsla(15,90%,75%,0.95)",  bg: "hsla(15,75%,35%,0.25)",  label: "Watch"   },
};

const kpToStatus = (kp: number): Status => (kp >= 5 ? "watch" : kp >= 4 ? "active" : "nominal");
const ssnToStatus = (ssn: number): Status => (ssn >= 150 ? "watch" : ssn >= 90 ? "active" : "nominal");

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
        width: `${Math.max(0, Math.min(100, value))}%`,
        background: "linear-gradient(90deg, hsla(200,70%,60%,0.7), hsla(200,80%,80%,0.95))",
        boxShadow: "0 0 12px hsla(200,70%,60%,0.4)",
      }}
    />
  </div>
);

const Panel = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`relative rounded-xl backdrop-blur-2xl ${className}`}
    style={{
      background:
        "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
      border: "1.5px solid hsla(220,35%,60%,0.35)",
      boxShadow:
        "inset 0 1px 0 hsla(0,0%,100%,0.06), 0 0 24px hsla(210,75%,62%,0.15), 0 8px 24px rgba(0,0,0,0.45)",
    }}
  >
    <div
      className="absolute -top-px left-4 right-4 h-px pointer-events-none"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, hsla(200,60%,78%,0.45) 50%, transparent 100%)",
      }}
    />
    {children}
  </div>
);

const UniversalOverviewStrip = () => {
  const navigate = useNavigate();

  const quakes = useUSGSEarthquakes("day", 4.5);
  const kp = useNOAAKpIndex();
  const wind = useNOAASolarWind();
  const cycle = useNOAASolarCycle();
  const eonet = useNASAEONET();
  const alerts = useNOAAAlerts();

  const eonetCount = eonet.data?.length ?? 0;
  const quakeCount = quakes.data?.length ?? 0;
  const alertCount = alerts.data?.length ?? 0;
  const planetaryEvents = eonetCount + alertCount;
  const planetaryHealth = Math.max(55, 95 - alertCount * 4 - Math.min(20, eonetCount));
  const planetaryStatus: Status = alertCount >= 5 ? "watch" : alertCount >= 2 ? "active" : "nominal";
  const topQuake = quakes.data?.[0];

  const latestKp = kp.data?.[kp.data.length - 1]?.kp ?? 0;
  const latestWind = wind.data?.[wind.data.length - 1];
  const ssn = cycle.data?.ssn ?? 0;
  const solarStatus: Status = (() => {
    const s1 = kpToStatus(latestKp);
    const s2 = ssnToStatus(ssn);
    const order = { nominal: 0, active: 1, watch: 2 } as const;
    return order[s1] >= order[s2] ? s1 : s2;
  })();
  const solarHealth = Math.max(45, 100 - latestKp * 8 - Math.max(0, ssn - 100) * 0.15);
  const solarEvents = (latestKp >= 4 ? 1 : 0) + (ssn >= 120 ? 1 : 0);

  const LAYERS: LayerCard[] = [
    {
      key: "planetary",
      label: "Planetary",
      caption: "Earth systems",
      icon: Activity,
      route: "/planetary",
      status: planetaryStatus,
      health: planetaryHealth,
      events: planetaryEvents,
      recent: topQuake
        ? `M${topQuake.magnitude.toFixed(1)} · ${topQuake.place}`
        : eonet.data?.[0]
          ? eonet.data[0].title
          : "Telemetry streaming",
      metrics: [
        { label: "Quakes ≥4.5", value: quakes.isLoading ? "…" : String(quakeCount) },
        { label: "NASA Events", value: eonet.isLoading ? "…" : String(eonetCount) },
      ],
    },
    {
      key: "solar",
      label: "Solar",
      caption: "Heliosphere · solar cycle",
      icon: Sun,
      route: "/planetary?view=hgs",
      status: solarStatus,
      health: solarHealth,
      events: solarEvents,
      recent: latestWind
        ? `Solar wind ${Math.round(latestWind.speed)} km/s · ${Math.round(latestWind.density)} p/cm³`
        : "Awaiting NOAA SWPC stream",
      metrics: [
        { label: "SSN", value: cycle.isLoading ? "…" : String(Math.round(ssn)) },
        { label: "Kp", value: kp.isLoading ? "…" : latestKp.toFixed(1) },
      ],
    },
    {
      key: "stellar",
      label: "Stellar",
      caption: "Oscillations · variability",
      icon: Star,
      route: "/stellar",
      status: "nominal",
      health: 95,
      events: 1,
      recent: "Local neighborhood quiescent · 12 variables tracked",
      metrics: [
        { label: "Tracked", value: "127" },
        { label: "Variables", value: "12" },
      ],
    },
    {
      key: "galactic",
      label: "Galactic",
      caption: "Milky Way · cosmic rays",
      icon: Orbit,
      route: "/galactic",
      status: "nominal",
      health: 88,
      events: 2,
      recent: "Sgr A* baseline · GCR flux nominal",
      metrics: [
        { label: "GCR", value: "Steady" },
        { label: "Arm", value: "Orion" },
      ],
    },
    {
      key: "cosmological",
      label: "Cosmological",
      caption: "CMB · structure",
      icon: Telescope,
      route: "/cosmological",
      status: "nominal",
      health: 99,
      events: 0,
      recent: "CMB anisotropy stable · H₀ tension monitored",
      metrics: [
        { label: "CMB", value: "2.725 K" },
        { label: "H₀", value: "67–73" },
      ],
    },
  ];

  const overallHealth = Math.round(LAYERS.reduce((a, l) => a + l.health, 0) / LAYERS.length);
  const totalEvents = LAYERS.reduce((a, l) => a + l.events, 0);

  return (
    <section className="relative px-6 py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-[10.5px] uppercase tracking-[0.45em] text-white/45">
              Live System Status
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-light text-white leading-tight">
              Every observatory, right now.
            </h2>
            <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-white/60">
              Live telemetry across each intelligence layer. Sourced from USGS, NOAA SWPC, and NASA EONET.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[8px] uppercase tracking-[0.22em] text-white/45">Composite Health</div>
              <div className="text-[22px] font-mono font-semibold text-white tabular-nums">{overallHealth}%</div>
            </div>
            <div className="text-right">
              <div className="text-[8px] uppercase tracking-[0.22em] text-white/45">Active Events</div>
              <div className="text-[22px] font-mono font-semibold text-white tabular-nums">{totalEvents}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {LAYERS.map((layer) => {
            const Icon = layer.icon;
            return (
              <Panel key={layer.key} className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: "hsla(210,50%,18%,0.55)",
                        border: "1px solid hsla(200,60%,65%,0.35)",
                      }}
                    >
                      <Icon size={18} style={{ color: "hsla(200,80%,82%,0.9)" }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold tracking-[0.1em] uppercase text-white/90 truncate">
                        {layer.label}
                      </div>
                      <div className="text-[10px] text-white/45 mt-0.5 truncate">
                        {layer.caption}
                      </div>
                    </div>
                  </div>
                  <StatusPill status={layer.status} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[8px] uppercase tracking-[0.18em] text-white/45">
                      System Health
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-white/90 tabular-nums">
                      {Math.round(layer.health)}%
                    </span>
                  </div>
                  <HealthBar value={layer.health} />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {layer.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-md p-2 border border-white/10"
                      style={{ background: "hsla(240,20%,10%,0.5)" }}
                    >
                      <div className="text-[7px] uppercase tracking-[0.15em] text-white/45 mb-0.5">
                        {m.label}
                      </div>
                      <div className="text-[11px] font-mono font-semibold text-white/85 tabular-nums truncate">
                        {m.value}
                      </div>
                    </div>
                  ))}
                  <div
                    className="rounded-md p-2 border border-white/10"
                    style={{ background: "hsla(240,20%,10%,0.5)" }}
                  >
                    <div className="text-[7px] uppercase tracking-[0.15em] text-white/45 mb-0.5">
                      Events
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-white/85 tabular-nums">
                      {layer.events}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <p className="text-[10.5px] leading-relaxed text-white/65 line-clamp-2">{layer.recent}</p>
                </div>

                <button
                  onClick={() => navigate(layer.route)}
                  className="mt-auto flex items-center justify-between w-full px-3 py-2 rounded-lg border transition-all duration-300 hover:bg-white/[0.04]"
                  style={{
                    background: "hsla(240,25%,8%,0.5)",
                    borderColor: "hsla(220,30%,55%,0.3)",
                  }}
                >
                  <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-white/85">
                    Open Dashboard
                  </span>
                  <ArrowRight size={14} className="text-white/70" />
                </button>
              </Panel>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UniversalOverviewStrip;
