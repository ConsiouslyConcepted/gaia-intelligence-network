import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sphere } from "@/types/spheres";
import { BarChart3, Pin, TrendingUp, TrendingDown, Download, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import {
  useNOAAKpIndex,
  useNOAASolarWind,
  useNOAAMagField,
  useNOAADst,
  useNOAASolarCycle,
  useNOAAXRayFlux,
} from "@/hooks/usePlanetaryData";

interface Metric {
  name: string;
  value: string;
  unit: string;
  category: string;
  trend: number | null;
  health: number;
}

const ACCENT = "#5ce0d2";

function pct(v: number, min: number, max: number) {
  return Math.max(0, Math.min(100, Math.round(((v - min) / (max - min)) * 100)));
}

export function SphereMetrics({ sphere }: { sphere: Sphere }) {
  const { data: kp, isLoading: kpL } = useNOAAKpIndex();
  const { data: sw, isLoading: swL } = useNOAASolarWind();
  const { data: mag, isLoading: magL } = useNOAAMagField();
  const { data: dst, isLoading: dstL } = useNOAADst();
  const { data: cycle, isLoading: cycleL } = useNOAASolarCycle();
  const { data: xray, isLoading: xrayL } = useNOAAXRayFlux();

  const isLoading = kpL || swL || magL || dstL || cycleL || xrayL;

  const metrics: Metric[] = useMemo(() => {
    const latestKp = kp?.[kp.length - 1];
    const prevKp = kp?.[kp.length - 2];
    const latestSW = sw?.[sw.length - 1];
    const prevSW = sw?.[sw.length - 2];
    const latestMag = mag?.[mag.length - 1];
    const prevMag = mag?.[mag.length - 2];
    const latestDst = dst?.[dst.length - 1];
    const prevDst = dst?.[dst.length - 2];
    const latestCycle = cycle?.[cycle.length - 1];
    const latestXray = xray?.[0];

    const arr: Metric[] = [];
    if (latestKp) arr.push({
      name: "Kp Index", value: latestKp.kp.toFixed(1), unit: "", category: "Geomagnetic",
      trend: prevKp ? +(latestKp.kp - prevKp.kp).toFixed(1) : null,
      health: 100 - pct(latestKp.kp, 0, 9),
    });
    if (latestDst) arr.push({
      name: "Dst Index", value: latestDst.dst.toFixed(0), unit: "nT", category: "Storm",
      trend: prevDst ? +(latestDst.dst - prevDst.dst).toFixed(0) : null,
      health: pct(latestDst.dst, -150, 20),
    });
    if (latestSW) arr.push({
      name: "Solar Wind Speed", value: latestSW.speed.toFixed(0), unit: "km/s", category: "Solar",
      trend: prevSW ? +(latestSW.speed - prevSW.speed).toFixed(0) : null,
      health: 100 - pct(latestSW.speed, 250, 800),
    });
    if (latestSW) arr.push({
      name: "Solar Wind Density", value: latestSW.density.toFixed(1), unit: "p/cm³", category: "Solar",
      trend: prevSW ? +(latestSW.density - prevSW.density).toFixed(1) : null,
      health: 100 - pct(latestSW.density, 0, 30),
    });
    if (latestSW) arr.push({
      name: "Plasma Temperature", value: (latestSW.temperature / 1000).toFixed(0), unit: "kK", category: "Solar",
      trend: null,
      health: 100 - pct(latestSW.temperature, 10000, 500000),
    });
    if (latestMag) arr.push({
      name: "IMF Bz (GSM)", value: latestMag.bz.toFixed(2), unit: "nT", category: "IMF",
      trend: prevMag ? +(latestMag.bz - prevMag.bz).toFixed(2) : null,
      health: latestMag.bz < 0 ? pct(latestMag.bz, -20, 0) : 90,
    });
    if (latestMag) arr.push({
      name: "IMF Bt", value: latestMag.bt.toFixed(2), unit: "nT", category: "IMF",
      trend: prevMag ? +(latestMag.bt - prevMag.bt).toFixed(2) : null,
      health: 100 - pct(latestMag.bt, 0, 30),
    });
    if (latestCycle) arr.push({
      name: "Sunspot Number", value: latestCycle.ssn.toFixed(0), unit: "SSN", category: "Solar Cycle",
      trend: null,
      health: 100 - pct(latestCycle.ssn, 0, 250),
    });
    if (latestCycle) arr.push({
      name: "F10.7 Radio Flux", value: latestCycle.f107.toFixed(1), unit: "sfu", category: "Solar Cycle",
      trend: null,
      health: 100 - pct(latestCycle.f107, 60, 300),
    });
    if (latestXray) arr.push({
      name: "X-Ray Flux (peak)", value: Number(latestXray.currentFlux).toExponential(1), unit: latestXray.classType,
      category: "Solar Flare", trend: null,
      health: 80,
    });
    return arr;
  }, [kp, sw, mag, dst, cycle, xray]);

  const [activeFilter, setActiveFilter] = useState("All");
  const categories = ["All", ...Array.from(new Set(metrics.map(m => m.category)))];
  const filtered = activeFilter === "All" ? metrics : metrics.filter(m => m.category === activeFilter);

  return (
    <div className="space-y-4">
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${ACCENT}12` }}>
            <BarChart3 className="w-6 h-6" style={{ color: ACCENT }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold tracking-wide">Live Metrics — NOAA SWPC</h2>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mt-0.5">
              {metrics.length} parameters · live from public space-weather feeds · refresh 5 min
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {isLoading
              ? <Loader2 className="w-3 h-3 animate-spin text-muted-foreground/40" />
              : <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: ACCENT }} />}
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40">
              {isLoading ? "Fetching" : "Live"}
            </span>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 rounded-lg border-border/20 text-muted-foreground">
            <Download className="w-3 h-3" />
            Export
          </Button>
        </div>
      </Card>

      <div className="flex flex-wrap gap-1.5">
        {categories.map(cat => (
          <Badge
            key={cat}
            variant="outline"
            onClick={() => setActiveFilter(cat)}
            className={`cursor-pointer text-[10px] px-2.5 py-0.5 rounded-lg transition-all ${
              activeFilter === cat
                ? "border-border/40 bg-muted/20 text-foreground"
                : "border-border/15 hover:border-border/30 hover:bg-muted/10 text-muted-foreground/60"
            }`}
          >
            {cat}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((metric, idx) => (
          <Card key={idx} className="glass-panel rounded-xl p-4 space-y-3 group hover:border-border/30 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 font-medium">{metric.category}</div>
                <h4 className="font-medium text-sm mt-0.5 text-foreground/85">{metric.name}</h4>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity">
                <Pin className="w-3 h-3" />
              </Button>
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {metric.trend !== null ? (
                  <>
                    {metric.trend >= 0
                      ? <TrendingUp className="w-3 h-3" style={{ color: ACCENT }} />
                      : <TrendingDown className="w-3 h-3" style={{ color: ACCENT, opacity: 0.6 }} />}
                    <span className="text-[10px] font-mono" style={{ color: `${ACCENT}aa` }}>
                      {metric.trend > 0 ? "+" : ""}{metric.trend}{metric.unit ? ` ${metric.unit}` : ""}
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] font-mono text-muted-foreground/30">—</span>
                )}
              </div>
              <span className="text-[9px] text-muted-foreground/30 font-mono">Δ since last</span>
            </div>
          </Card>
        ))}
        {!isLoading && metrics.length === 0 && (
          <Card className="glass-panel rounded-xl p-6 col-span-full text-center">
            <p className="text-xs text-muted-foreground/50">No live data available right now. Retrying…</p>
          </Card>
        )}
      </div>
    </div>
  );
}
