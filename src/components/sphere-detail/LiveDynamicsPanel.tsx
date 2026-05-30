import { Card } from "@/components/ui/card";
import { Sphere } from "@/types/spheres";
import { Activity, RefreshCw, Satellite, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { BlueMarbleGlobe } from "./BlueMarbleGlobe";
import { useLiveOverlay } from "@/hooks/useLiveOverlay";
import { useSphereIntelligence } from "@/hooks/useSphereIntelligence";
import { buildLiveBehavior } from "@/lib/behavioralSummary";
import { useEffect, useMemo, useState } from "react";

interface Props {
  sphere: Sphere;
  accent: string;
}

function TrendIcon({ trend, accent }: { trend: number; accent: string }) {
  if (trend > 0.4) return <TrendingUp className="w-3 h-3" style={{ color: accent }} />;
  if (trend < -0.4) return <TrendingDown className="w-3 h-3" style={{ color: accent }} />;
  return <Minus className="w-3 h-3 text-muted-foreground/50" />;
}

export function LiveDynamicsPanel({ sphere, accent }: Props) {
  const intel = useSphereIntelligence(sphere.id, 3000);
  const behavior = useMemo(() => buildLiveBehavior(intel), [intel]);
  const live = useLiveOverlay(sphere.id);

  // "updated Xs ago" ticker
  const [updatedAt, setUpdatedAt] = useState(() => Date.now());
  useEffect(() => {
    setUpdatedAt(Date.now());
  }, [intel.score, intel.trend]);
  const [, setNow] = useState(Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);
  const secsAgo = Math.max(0, Math.floor((Date.now() - updatedAt) / 1000));

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}12` }}>
            <Activity className="w-6 h-6" style={{ color: accent }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold tracking-wide">Live Dynamics — {sphere.name}</h2>
            <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 mt-0.5">
              Real-time telemetry · Behavior patterns · Dynamic processes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-lg font-bold font-mono" style={{ color: accent }}>{intel.score}</span>
                <TrendIcon trend={intel.trend} accent={accent} />
                <span className="text-[10px] font-mono text-muted-foreground/60">
                  {intel.trend >= 0 ? "+" : ""}{intel.trend.toFixed(1)}
                </span>
              </div>
              <p className="text-[8px] uppercase tracking-wider text-muted-foreground/40">{intel.scoreLabel}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: live.isLive ? "#22c55e" : accent }}
              />
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40">
                {live.isLive ? "Live" : "Sim"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Blue Marble Globe with live overlay */}
      <Card className="glass-panel rounded-xl p-3 relative overflow-hidden">
        <BlueMarbleGlobe
          height={340}
          sphereId={sphere.id}
          overlayUrl={live.textureUrl}
          quakes={sphere.id === "geosphere" ? live.quakes : undefined}
        />
      </Card>

      {/* Data source info */}
      <Card className="glass-panel rounded-xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Satellite className="w-3.5 h-3.5 text-muted-foreground/40" />
            <div>
              <span className="text-[10px] font-medium text-foreground/70">{live.source}</span>
              <p className="text-[9px] text-muted-foreground/40">{live.description}</p>
            </div>
          </div>
          <button
            onClick={live.refresh}
            className="p-1.5 rounded-lg hover:bg-muted/20 transition-colors"
            title="Refresh live data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground/40 ${live.loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {sphere.id === "geosphere" && live.quakes.length > 0 && (
          <p className="text-[9px] text-muted-foreground/30 mt-1">
            {live.quakes.length} earthquakes (M2.5+) in last 24h
          </p>
        )}
        {sphere.id === "magnetosphere" && live.kpIndex !== null && (
          <p className="text-[9px] text-muted-foreground/30 mt-1">
            Current Kp index: {live.kpIndex} — {live.kpIndex >= 5 ? "Storm" : live.kpIndex >= 4 ? "Active" : "Quiet"}
          </p>
        )}
      </Card>

      {/* Behavior Summary — live */}
      <Card className="glass-panel rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Behavioral Summary</h3>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40 font-mono">
              updated {secsAgo}s ago
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground/70 leading-relaxed">{behavior.summary}</p>

        {/* Live metric chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {intel.metrics.map((m) => (
            <div
              key={m.spec.key}
              className="px-2 py-1 rounded-md bg-muted/15 border border-border/30 flex items-center gap-1.5"
              title={`${m.spec.label} · z=${m.z.toFixed(2)}`}
            >
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50">{m.spec.label}</span>
              <span className="text-[10px] font-mono font-semibold" style={{ color: m.isAnomaly ? "#f59e0b" : accent }}>
                {m.value.toFixed(m.spec.precision ?? 2)}{m.spec.unit ? ` ${m.spec.unit}` : ""}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Dynamic Patterns — live */}
      <div className="space-y-3">
        {behavior.patterns.map((pattern, idx) => (
          <Card key={idx} className="glass-panel rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${accent}12` }}
              >
                <Activity className="w-3.5 h-3.5" style={{ color: accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-foreground/85">{pattern.name}</h4>
                  <span className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-wider shrink-0">
                    {pattern.timeScale}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground/50 leading-relaxed mt-1">{pattern.description}</p>

                {/* Live status line */}
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-muted/20 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.round(pattern.intensity * 100)}%`,
                        backgroundColor: accent,
                        opacity: 0.65,
                      }}
                    />
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60 shrink-0">
                    {pattern.status}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
