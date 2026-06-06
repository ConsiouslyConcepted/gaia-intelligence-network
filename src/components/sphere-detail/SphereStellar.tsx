import { Card } from "@/components/ui/card";
import { Sphere } from "@/types/spheres";
import { Sun, Wind, Radio, Activity, Satellite, Loader2 } from "lucide-react";
import {
  useNOAASolarWind,
  useNOAAMagField,
  useNOAAKpIndex,
  useNOAAXRayFlux,
  useNOAASolarCycle,
  useNOAAAlerts,
} from "@/hooks/usePlanetaryData";
import { useMemo } from "react";

const ACCENT = "#5ce0d2";

function pct(v: number, min: number, max: number) {
  return Math.max(0, Math.min(100, Math.round(((v - min) / (max - min)) * 100)));
}

export function SphereStellar({ sphere }: { sphere: Sphere }) {
  const { data: sw, isLoading: swL } = useNOAASolarWind();
  const { data: mag, isLoading: magL } = useNOAAMagField();
  const { data: kp, isLoading: kpL } = useNOAAKpIndex();
  const { data: xray, isLoading: xrayL } = useNOAAXRayFlux();
  const { data: cycle, isLoading: cycleL } = useNOAASolarCycle();
  const { data: alerts, isLoading: alertsL } = useNOAAAlerts();

  const isLoading = swL || magL || kpL || xrayL || cycleL || alertsL;

  const latestSW = sw?.[sw.length - 1];
  const latestMag = mag?.[mag.length - 1];
  const latestKp = kp?.[kp.length - 1];
  const latestXray = xray?.[0];
  const latestCycle = cycle?.[cycle.length - 1];

  const conditions = useMemo(() => {
    const k = latestKp?.kp ?? 0;
    if (k >= 7) return { label: "Severe Storm", color: "#ef4444" };
    if (k >= 5) return { label: "Geomagnetic Storm", color: "#f97316" };
    if (k >= 4) return { label: "Elevated", color: "#eab308" };
    return { label: "Quiet", color: ACCENT };
  }, [latestKp]);

  const metricCards = [
    {
      icon: Wind,
      label: "Solar Wind Speed",
      value: latestSW?.speed?.toFixed(0) ?? "—",
      unit: "km/s",
      health: latestSW ? 100 - pct(latestSW.speed, 250, 800) : 0,
      loading: swL,
    },
    {
      icon: Sun,
      label: "Solar Wind Density",
      value: latestSW?.density?.toFixed(1) ?? "—",
      unit: "p/cm³",
      health: latestSW ? 100 - pct(latestSW.density, 0, 30) : 0,
      loading: swL,
    },
    {
      icon: Radio,
      label: "F10.7 Radio Flux",
      value: latestCycle?.f107?.toFixed(1) ?? "—",
      unit: "sfu",
      health: latestCycle ? 100 - pct(latestCycle.f107, 60, 300) : 0,
      loading: cycleL,
    },
    {
      icon: Activity,
      label: "Peak X-Ray Class",
      value: latestXray?.classType ?? "—",
      unit: latestXray ? Number(latestXray.currentFlux).toExponential(1) : "W/m²",
      health: 70,
      loading: xrayL,
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${ACCENT}12` }}>
            <Satellite className="w-6 h-6" style={{ color: ACCENT }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold tracking-wide">Stellar Conditions — Live</h2>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mt-0.5">
              NOAA SWPC · ACE/DSCOVR · GOES X-Ray · Kyoto Dst
            </p>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40">Conditions</div>
            <div className="flex items-center gap-1.5 justify-end mt-0.5">
              {isLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground/40" />}
              <span className="text-sm font-semibold font-mono" style={{ color: conditions.color }}>
                {conditions.label}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {metricCards.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx} className="glass-panel rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: ACCENT }} />
                  <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40">{metric.label}</span>
                </div>
                {metric.loading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground/40" />}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono" style={{ color: ACCENT }}>{metric.value}</span>
                <span className="text-[10px] text-muted-foreground/40 uppercase">{metric.unit}</span>
              </div>
              <div className="h-[3px] rounded-full bg-border/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${metric.health}%`, background: `linear-gradient(90deg, ${ACCENT}40, ${ACCENT}cc)` }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-panel rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold">Kp · Geomagnetic Activity (24h)</h3>
          {kp && (
            <div className="h-32 flex items-end gap-1">
              {kp.map((d, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all"
                  style={{
                    height: `${Math.max(8, (d.kp / 9) * 100)}%`,
                    backgroundColor: `${ACCENT}${d.kp > 5 ? "cc" : d.kp > 3 ? "70" : "30"}`,
                  }}
                  title={`Kp ${d.kp} · ${d.time}`}
                />
              ))}
            </div>
          )}
          <p className="text-[10px] text-muted-foreground/50">
            Current Kp: <span className="font-mono" style={{ color: ACCENT }}>{latestKp?.kp?.toFixed(1) ?? "—"}</span>
          </p>
        </Card>

        <Card className="glass-panel rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold">IMF Vector (GSM)</h3>
          {latestMag && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Bx", value: latestMag.bx.toFixed(2) },
                { label: "By", value: latestMag.by.toFixed(2) },
                { label: "Bz", value: latestMag.bz.toFixed(2) },
              ].map((c, i) => (
                <div key={i} className="px-2 py-1.5 rounded-md bg-muted/5 border border-border/10">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40">{c.label}</span>
                  <div className="text-base font-bold font-mono mt-0.5" style={{ color: ACCENT }}>
                    {c.value} <span className="text-[9px] text-muted-foreground/40">nT</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-muted-foreground/50">
            Bt magnitude: <span className="font-mono" style={{ color: ACCENT }}>{latestMag?.bt?.toFixed(2) ?? "—"}</span> nT
          </p>
        </Card>
      </div>

      <Card className="glass-panel rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Live NOAA SWPC Alerts</h3>
          {alertsL && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground/40" />}
        </div>
        <div className="space-y-2">
          {alerts?.slice(0, 6).map((a, idx) => (
            <div key={idx} className="px-3 py-2.5 rounded-lg border border-border/15 bg-muted/5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
                <span className="text-[10px] font-medium font-mono text-foreground/80">{a.productId}</span>
                <span className="text-[9px] text-muted-foreground/30 ml-auto font-mono">{a.issueTime}</span>
              </div>
              <p className="text-[11px] text-muted-foreground/60 leading-relaxed line-clamp-2">{a.message}</p>
            </div>
          ))}
          {!alertsL && (!alerts || alerts.length === 0) && (
            <p className="text-[11px] text-muted-foreground/40 text-center py-4">No active alerts.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
