import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { CommonsIcon } from "@/components/CommonsIcon";
import { NightSkyBackground } from "@/components/NightSkyBackground";
import { SphericalHarmonics3D } from "@/components/universal/SphericalHarmonics3D";
import { AssistantPanel } from "@/components/harmonics/AssistantPanel";
import { CrossLayerPanel } from "@/components/harmonics/CrossLayerPanel";
import { EventsPanel } from "@/components/harmonics/EventsPanel";
import { ReportsPanel } from "@/components/harmonics/ReportsPanel";
import { scanAllLayers } from "@/lib/harmonics/anomalies";
import {
  DATASETS,
  METHODS,
  ORBITAL_PERIODS,
  SCOPES,
  type AnalyticalMethod,
  type Dataset,
  type Scope,
  datasetsByScope,
  getDataset,
} from "@/lib/harmonics/datasets";
import {
  autocorrelation,
  crossCorrelation,
  harmonicLadder,
  nearestInterval,
  nearestRatio,
  spectrum,
} from "@/lib/harmonics/engine";
import { compareLayers } from "@/lib/harmonics/crossLayer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";


// ───────── HUD chrome (matches sibling dashboards) ─────────

const HudPanel = ({
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
    <div
      className="absolute bottom-0 left-6 right-6 h-px pointer-events-none"
      style={{ background: "linear-gradient(90deg, transparent, hsla(210,40%,50%,0.15), transparent)" }}
    />
    {children}
  </div>
);

const TOGGLE_BTN_BASE =
  "text-center px-2.5 py-2 xl:px-4 xl:py-2.5 xl:min-w-[120px] whitespace-nowrap rounded-xl text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300 border border-transparent hover:bg-foreground/[0.05] hover:text-foreground/70";

const ACTIVE_BTN_STYLE: React.CSSProperties = {
  background:
    "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
  color: "hsla(0,0%,100%,0.95)",
  border: "1.5px solid hsla(220,35%,60%,0.55)",
  boxShadow:
    "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 32px hsla(210,75%,62%,0.28), 0 0 64px hsla(210,70%,55%,0.18), 0 12px 40px rgba(0,0,0,0.55)",
};

const NAV_PILL_STYLE: React.CSSProperties = {
  background: "hsla(228,40%,5%,0.6)",
  border: "1px solid hsla(220,40%,65%,0.5)",
  boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.08), inset 0 -1px 0 rgba(0,0,0,0.4), 0 0 24px hsla(210,70%,60%,0.28), 0 0 48px hsla(210,70%,55%,0.18), 0 12px 32px rgba(0,0,0,0.5)",
  backdropFilter: "blur(12px)",
};

// ───────── Visualizations (pure SVG) ─────────

const PANEL_BG = "hsla(225,40%,8%,0.6)";

function LinePlot({
  data,
  width = 640,
  height = 220,
  color = "hsla(190,90%,65%,0.95)",
  fill = "hsla(190,90%,65%,0.12)",
  xLabel,
  yLabel,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
  xLabel?: string;
  yLabel?: string;
}) {
  if (data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / Math.max(data.length - 1, 1);
  const pts = data.map((v, i) => [i * stepX, height - ((v - min) / range) * height]);
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const area = `${d} L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <rect width={width} height={height} fill={PANEL_BG} />
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={0} x2={width} y1={height * f} y2={height * f} stroke="hsla(220,30%,55%,0.12)" />
      ))}
      <path d={area} fill={fill} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.4} />
      {yLabel && (
        <text x={6} y={12} fill="hsla(200,40%,80%,0.55)" fontSize={9} fontFamily="monospace">
          {yLabel}
        </text>
      )}
      {xLabel && (
        <text x={width - 6} y={height - 6} textAnchor="end" fill="hsla(200,40%,80%,0.55)" fontSize={9} fontFamily="monospace">
          {xLabel}
        </text>
      )}
    </svg>
  );
}

function SpectrumPlot({ ds }: { ds: Dataset }) {
  const spec = useMemo(() => spectrum(ds.series, ds.sampleRate, ds.unit), [ds]);
  const W = 640, H = 240;
  if (spec.bins.length === 0) return null;
  const maxP = Math.max(...spec.bins.map((b) => b.power));
  const stepX = W / spec.bins.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <rect width={W} height={H} fill={PANEL_BG} />
      {spec.bins.map((b, i) => {
        const h = (b.power / maxP) * (H - 30);
        return <rect key={i} x={i * stepX} y={H - 20 - h} width={stepX * 0.9} height={h} fill="hsla(195,85%,60%,0.6)" />;
      })}
      {spec.peaks.map((p, i) => {
        const idx = spec.bins.findIndex((b) => b.freq === p.freq);
        const x = idx * stepX;
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={0} y2={H - 20} stroke="hsla(45,100%,70%,0.6)" strokeDasharray="2 3" />
            <text x={x + 4} y={14 + i * 12} fill="hsla(45,100%,80%,0.95)" fontSize={9} fontFamily="monospace">
              {p.period < 100 ? p.period.toFixed(2) : p.period.toFixed(0)} {ds.unit}
            </text>
          </g>
        );
      })}
      <text x={W - 6} y={H - 6} textAnchor="end" fontSize={9} fontFamily="monospace" fill="hsla(200,40%,80%,0.55)">
        freq (1/{ds.unit})
      </text>
    </svg>
  );
}

function CorrelationPlot({ a, b }: { a: Dataset; b: Dataset }) {
  const cc = useMemo(() => {
    const n = Math.min(a.series.length, b.series.length, 1024);
    return crossCorrelation(a.series.slice(0, n), b.series.slice(0, n));
  }, [a, b]);
  const W = 640, H = 220;
  const stepX = W / cc.values.length;
  const yMid = H / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <rect width={W} height={H} fill={PANEL_BG} />
      <line x1={0} x2={W} y1={yMid} y2={yMid} stroke="hsla(220,30%,55%,0.25)" />
      {cc.values.map((v, i) => {
        const h = v * (H / 2 - 12);
        return <rect key={i} x={i * stepX} y={yMid - Math.max(h, 0)} width={Math.max(stepX * 0.8, 1)} height={Math.abs(h)} fill={v >= 0 ? "hsla(170,80%,60%,0.7)" : "hsla(0,75%,65%,0.7)"} />;
      })}
      <text x={8} y={14} fontSize={9} fontFamily="monospace" fill="hsla(45,100%,80%,0.9)">
        best lag {cc.bestLag} · r {cc.bestR.toFixed(3)}
      </text>
    </svg>
  );
}

// ───────── Page ─────────

const HarmonicsEngine = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = (() => {
    const m = searchParams.get("mode");
    return m === "cross" || m === "events" || m === "reports" || m === "single" ? m : "single";
  })();
  const initialMethod: AnalyticalMethod = (() => {
    const m = searchParams.get("method");
    const valid: AnalyticalMethod[] = ["spectrum", "harmonic", "timeSeries", "correlation", "spherical", "pattern"];
    return (valid as string[]).includes(m ?? "") ? (m as AnalyticalMethod) : "spectrum";
  })();
  const initialDatasetId = searchParams.get("dataset");
  const initialDataset = initialDatasetId ? getDataset(initialDatasetId) : undefined;
  const initialScope: Scope = (() => {
    const s = searchParams.get("scope");
    const valid: Scope[] = ["planetary", "solar", "stellar", "galactic", "universal", "cosmological"];
    if (initialDataset) return initialDataset.scope;
    return (valid as string[]).includes(s ?? "") ? (s as Scope) : "universal";
  })();
  const [mode, setMode] = useState<"single" | "cross" | "events" | "reports">(initialMode);
  const [rightTab, setRightTab] = useState<"info" | "assistant">("info");
  const [scope, setScope] = useState<Scope>(initialScope);
  const [method, setMethod] = useState<AnalyticalMethod>(initialMethod);
  const inScope = datasetsByScope(scope);
  const [datasetId, setDatasetId] = useState<string>(initialDataset?.id ?? inScope[0].id);
  const [compareId, setCompareId] = useState<string>(DATASETS[0].id);
  const [crossA, setCrossA] = useState<string>(searchParams.get("a") || "imf-bt");
  const [crossB, setCrossB] = useState<string>(searchParams.get("b") || "kp-index");
  const [lm, setLm] = useState<{ l: number; m: number }>({ l: 2, m: 1 });

  const dataset = getDataset(datasetId) ?? inScope[0];
  const compare = getDataset(compareId);

  // when scope changes, refresh dataset & method defaults
  const onScope = (s: Scope) => {
    setScope(s);
    const list = datasetsByScope(s);
    setDatasetId(list[0].id);
    const allowed = list[0].methods?.[0] ?? "spectrum";
    setMethod(allowed);
  };

  const allowedMethods = METHODS.filter((m) => !dataset.methods || dataset.methods.includes(m.id));

  // Compact JSON snapshot for the assistant — grounds its replies in the active selection.
  const assistantContext = useMemo(() => {
    // A trimmed cross-layer event snapshot is always included so the assistant
    // can speak to anomalies even from Single mode.
    const events = scanAllLayers({ minSeverity: "watch", limit: 8 }).map((e) => ({
      scope: e.scope,
      dataset: e.datasetLabel,
      kind: e.kind,
      severity: e.severity,
      summary: e.summary,
      evidence: e.evidence,
    }));

    if (mode === "cross") {
      const a = getDataset(crossA);
      const b = getDataset(crossB);
      if (!a || !b) return { mode, events };
      const r = compareLayers(a, b);
      return {
        mode: "cross-layer",
        layerA: { id: a.id, label: a.label, scope: a.scope, provenance: a.provenance, unit: a.unit },
        layerB: { id: b.id, label: b.label, scope: b.scope, provenance: b.provenance, unit: b.unit },
        evidence: r.evidence,
        evidenceNote: r.evidenceNote,
        bestLag: r.correlation.bestLag,
        bestR: Number(r.correlation.bestR.toFixed(3)),
        topPeaksA: r.topPeaksA.map((p) => ({ period: Number(p.period.toFixed(3)), power: p.power })),
        topPeaksB: r.topPeaksB.map((p) => ({ period: Number(p.period.toFixed(3)), power: p.power })),
        sharedPeriods: r.sharedPeriods,
        events,
      };
    }
    if (mode === "events") {
      return { mode: "events", events: scanAllLayers({ limit: 30 }).map((e) => ({
        scope: e.scope, dataset: e.datasetLabel, kind: e.kind, severity: e.severity,
        summary: e.summary, evidence: e.evidence,
      })) };
    }
    if (mode === "reports") {
      return { mode: "reports", events };
    }
    const spec = spectrum(dataset.series, dataset.sampleRate, dataset.unit);
    return {
      mode: "single-layer",
      scope,
      method,
      dataset: { id: dataset.id, label: dataset.label, scope: dataset.scope, provenance: dataset.provenance, unit: dataset.unit, knownPeriod: dataset.knownPeriod },
      topPeaks: spec.peaks.slice(0, 5).map((p) => ({ period: Number(p.period.toFixed(3)), power: p.power })),
      fundamentalPeriod: spec.fundamental ? Number(spec.fundamental.period.toFixed(3)) : null,
      events,
    };
  }, [mode, scope, method, dataset, crossA, crossB]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <NightSkyBackground />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none p-4">
        <HudPanel className="pointer-events-auto px-4 py-4 flex items-center justify-between" topBar>
          <div className="flex items-center gap-4">
            <CommonsIcon />
            <div>
              <div className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground/70">
                Harmonic Analysis Engine
              </div>
              <div className="text-base font-semibold tracking-[0.16em] uppercase text-foreground/95">
                Cross-Scale Resonance & Pattern Lab
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex gap-1 xl:gap-1.5 rounded-2xl p-1 xl:p-1.5 overflow-x-auto max-w-full"
              style={NAV_PILL_STYLE}
            >
              {[
                { label: "Planetary", path: "/planetary" },
                { label: "Solar", path: "/planetary?view=hgs" },
                { label: "Stellar", path: "/stellar" },
                { label: "Galactic", path: "/galactic" },
                { label: "Universal", path: "/universal" },
                { label: "Cosmological", path: "/cosmological" },
                { label: "Analysis", path: "/harmonics" },
              ].map((b) => {
                const active = b.label === "Analysis";
                return (
                  <button
                    key={b.label}
                    onClick={() => navigate(b.path)}
                    className={cn(
                      TOGGLE_BTN_BASE,
                      active ? "font-semibold" : "text-foreground/40"
                    )}
                    style={active ? ACTIVE_BTN_STYLE : undefined}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>
        </HudPanel>
      </div>

      {/* Left rail — scope + dataset */}
      <div className="absolute left-4 top-28 bottom-24 z-10 pointer-events-auto w-[320px] xl:w-[360px] hidden md:flex flex-col gap-3">
        <HudPanel className="p-5 flex flex-col gap-1 flex-none max-h-[46%] overflow-y-auto">
          <div className="px-2 py-1 mb-2 text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "hsla(210,70%,75%,0.6)" }}>
            Intelligence Layer
          </div>
          <div className="space-y-2">
            {SCOPES.map((s) => {
              const isActive = s.id === scope;
              return (
                <button
                  key={s.id}
                  onClick={() => onScope(s.id)}
                  className={cn(
                    "w-full group relative flex flex-col items-start text-left p-4 rounded-xl border transition-all duration-200",
                    isActive
                      ? "bg-foreground/[0.08] border-foreground/30"
                      : "bg-foreground/[0.03] border-foreground/[0.06] hover:bg-foreground/[0.06] hover:border-foreground/15"
                  )}
                  style={isActive ? {
                    borderColor: "hsla(210,70%,60%,0.55)",
                    boxShadow: "0 0 20px hsla(210,70%,55%,0.15), inset 0 1px 0 hsla(0,0%,100%,0.05)",
                  } : undefined}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full"
                      style={{ background: "hsla(210,80%,70%,1)", boxShadow: "0 0 10px hsla(210,80%,70%,0.8)" }}
                    />
                  )}
                  <div className="flex flex-col gap-2 pl-2">
                    <span
                      className={cn(
                        "text-[13px] tracking-[0.12em] uppercase font-bold leading-tight",
                        isActive ? "text-foreground" : "text-foreground/90 group-hover:text-foreground"
                      )}
                    >
                      {s.label}
                    </span>
                    <span
                      className="text-[12px] leading-relaxed"
                      style={{ color: isActive ? "hsla(190,55%,80%,0.95)" : "hsla(210,30%,78%,0.8)" }}
                    >
                      {s.tagline}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </HudPanel>




        <HudPanel className="p-5 flex flex-col gap-1 overflow-y-auto flex-1 min-h-[300px]">
          <div className="px-2 py-1 mb-2 text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "hsla(210,70%,75%,0.6)" }}>
            Dataset
          </div>
          <div className="space-y-2">
            {inScope.map((d) => {
              const isActive = d.id === datasetId;
              return (
                <button
                  key={d.id}
                  onClick={() => setDatasetId(d.id)}
                  className={cn(
                    "w-full group relative flex flex-col items-start text-left p-4 rounded-xl border transition-all duration-200",
                    isActive
                      ? "bg-foreground/[0.08] border-foreground/30"
                      : "bg-foreground/[0.03] border-foreground/[0.06] hover:bg-foreground/[0.06] hover:border-foreground/15"
                  )}
                  style={isActive ? {
                    borderColor: "hsla(210,70%,60%,0.55)",
                    boxShadow: "0 0 20px hsla(210,70%,55%,0.15), inset 0 1px 0 hsla(0,0%,100%,0.05)",
                  } : undefined}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full"
                      style={{ background: "hsla(210,80%,70%,1)", boxShadow: "0 0 10px hsla(210,80%,70%,0.8)" }}
                    />
                  )}
                  <div className="flex flex-col gap-2 pl-2">
                    <span
                      className={cn(
                        "text-[13px] tracking-[0.12em] uppercase font-bold leading-tight",
                        isActive ? "text-foreground" : "text-foreground/90 group-hover:text-foreground"
                      )}
                    >
                      {d.label}
                    </span>
                    <span
                      className="text-[12px] leading-relaxed"
                      style={{ color: isActive ? "hsla(190,55%,80%,0.95)" : "hsla(210,30%,78%,0.8)" }}
                    >
                      {d.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </HudPanel>

      </div>


      {/* Center stage */}
      <div className="absolute inset-0 z-[2] pt-28 pb-32 md:pl-[356px] xl:pl-[396px] xl:pr-[350px] px-4 flex flex-col gap-3 overflow-y-auto">
        {/* Mode toggle */}
        <div className="flex items-center gap-2">
          <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/55 mr-1">Mode</div>
          {[
            { id: "single" as const, label: "Single Layer" },
            { id: "cross" as const, label: "Cross-Layer" },
            { id: "events" as const, label: "Events & Anomalies" },
            { id: "reports" as const, label: "Reports" },
          ].map((m) => {
            const active = m.id === mode;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className="px-3 py-1.5 rounded-md text-[9px] tracking-[0.14em] uppercase whitespace-nowrap border transition-all"
                style={{
                  background: active ? "hsla(210,50%,18%,0.75)" : "hsla(240,20%,10%,0.5)",
                  borderColor: active ? "hsla(210,70%,60%,0.5)" : "hsla(220,20%,30%,0.25)",
                  color: active ? "hsl(0,0%,98%)" : "hsla(220,20%,75%,0.7)",
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {mode === "single" && (
          <>
            <HudPanel className="p-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/55">Active dataset</div>
                  <div className="text-[14px] font-semibold tracking-[0.1em] uppercase text-foreground/95">{dataset.label}</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {allowedMethods.map((m) => {
                    const active = m.id === method;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setMethod(m.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-[9px] tracking-[0.14em] uppercase whitespace-nowrap border transition-all",
                        )}
                        style={{
                          background: active ? "hsla(210,50%,18%,0.75)" : "hsla(240,20%,10%,0.5)",
                          borderColor: active ? "hsla(210,70%,60%,0.5)" : "hsla(220,20%,30%,0.25)",
                          color: active ? "hsl(0,0%,98%)" : "hsla(220,20%,75%,0.7)",
                        }}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-[260px] rounded-md overflow-hidden border border-border/30">
                <MethodView method={method} dataset={dataset} compare={compare} lm={lm} />
              </div>
            </HudPanel>

            <MethodDetail method={method} dataset={dataset} compare={compare} setCompareId={setCompareId} compareId={compareId} lm={lm} setLm={setLm} />
          </>
        )}

        {mode === "cross" && (
          <HudPanel className="p-4">
            <div className="mb-3">
              <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/55">Cross-Layer Harmonic Intelligence</div>
              <div className="text-[13px] font-semibold tracking-[0.1em] uppercase text-foreground/95">Compare nested intelligence systems</div>
              <p className="text-[10px] text-muted-foreground/70 mt-1 leading-relaxed">
                Pick two datasets from any scale. The engine aligns, normalizes, runs spectral and lag analysis, and labels the relationship as <span className="text-foreground/85">Measured</span>, <span className="text-foreground/85">Statistical</span>, or <span className="text-foreground/85">Exploratory</span>.
              </p>
            </div>
            <CrossLayerPanel aId={crossA} bId={crossB} onChange={(a, b) => { setCrossA(a); setCrossB(b); }} />
          </HudPanel>
        )}

        {mode === "events" && (
          <HudPanel className="p-4">
            <EventsPanel
              onSelectDataset={(id, sc) => {
                setScope(sc);
                setDatasetId(id);
                setMode("single");
              }}
            />
          </HudPanel>
        )}

        {mode === "reports" && (
          <HudPanel className="p-4">
            <ReportsPanel context={assistantContext} />
          </HudPanel>
        )}
      </div>

      {/* Right rail — info / assistant */}
      <div className="absolute right-4 top-28 bottom-24 z-10 pointer-events-auto w-[330px] hidden xl:flex flex-col">
        <HudPanel className="p-3 flex flex-col gap-3 flex-1 min-h-0">
          <div className="flex gap-1">
            {[
              { id: "info" as const, label: "Info" },
              { id: "assistant" as const, label: "Assistant" },
            ].map((t) => {
              const active = t.id === rightTab;
              return (
                <button
                  key={t.id}
                  onClick={() => setRightTab(t.id)}
                  className="flex-1 px-2 py-1.5 rounded-md text-[9px] tracking-[0.14em] uppercase border transition-all"
                  style={{
                    background: active ? "hsla(210,50%,18%,0.75)" : "hsla(240,20%,10%,0.5)",
                    borderColor: active ? "hsla(210,70%,60%,0.5)" : "hsla(220,20%,30%,0.25)",
                    color: active ? "hsl(0,0%,98%)" : "hsla(220,20%,75%,0.7)",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {rightTab === "info" ? (
            <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1">
              {mode === "single" ? (
                <>
                  <div>
                    <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1">Method</div>
                    <div className="text-[13px] font-semibold tracking-[0.08em] uppercase text-foreground/90">
                      {METHODS.find((m) => m.id === method)?.label}
                    </div>
                    <p className="text-[10px] leading-relaxed text-muted-foreground mt-2">
                      {METHODS.find((m) => m.id === method)?.description}
                    </p>
                  </div>
                  <div className="border-t border-border/30 pt-3">
                    <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1.5">What you're seeing</div>
                    <p className="text-[10px] leading-relaxed text-muted-foreground">{whatYoureSeeing(method, dataset)}</p>
                  </div>
                  <div className="border-t border-border/30 pt-3">
                    <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1.5">Why this matters</div>
                    <ul className="text-[10px] leading-relaxed text-muted-foreground space-y-1.5 list-disc list-inside marker:text-foreground/40">
                      {whyItMatters(method).map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t border-border/30 pt-3">
                    <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1.5">How to interact</div>
                    <ul className="text-[10px] leading-relaxed text-muted-foreground space-y-1 list-disc list-inside marker:text-foreground/40">
                      <li>Pick an intelligence layer to scope the available datasets.</li>
                      <li>Switch the analytical method to view the same series differently.</li>
                      {method === "correlation" && <li>Use the compare picker to align two series across layers.</li>}
                      {method === "spherical" && <li>Adjust the ℓ and m sliders to change the spherical mode.</li>}
                      <li>Switch to Cross-Layer mode to compare two systems across scales.</li>
                    </ul>
                  </div>
                </>
              ) : mode === "cross" ? (
                <>
                  <div>
                    <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1">Cross-Layer Mode</div>
                    <p className="text-[10px] leading-relaxed text-muted-foreground">
                      Compares harmonic structure between two datasets drawn from any scale — planetary to cosmological.
                    </p>
                  </div>
                  <div className="border-t border-border/30 pt-3">
                    <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1.5">Evidence tiers</div>
                    <ul className="text-[10px] leading-relaxed text-muted-foreground space-y-1.5">
                      <li><span className="text-foreground/85">Measured</span> — both series are anchored on direct observational sources.</li>
                      <li><span className="text-foreground/85">Statistical</span> — |r| ≥ 0.40 across the aligned window.</li>
                      <li><span className="text-foreground/85">Exploratory</span> — user-driven pairing without statistical support.</li>
                    </ul>
                  </div>
                  <div className="border-t border-border/30 pt-3">
                    <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1.5">How to interact</div>
                    <ul className="text-[10px] leading-relaxed text-muted-foreground space-y-1 list-disc list-inside marker:text-foreground/40">
                      <li>Pick Layer A and Layer B, or tap a suggested pairing.</li>
                      <li>Read the evidence badge before interpreting the result.</li>
                      <li>Use the Assistant tab to ask for a plain-language interpretation.</li>
                    </ul>
                  </div>
                </>
              ) : mode === "events" ? (
                <>
                  <div>
                    <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1">Events & Anomalies</div>
                    <p className="text-[10px] leading-relaxed text-muted-foreground">
                      A cross-layer feed of recent spikes, trends, and dominant-period shifts detected across every dataset in the registry.
                    </p>
                  </div>
                  <div className="border-t border-border/30 pt-3">
                    <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1.5">Severity</div>
                    <ul className="text-[10px] leading-relaxed text-muted-foreground space-y-1.5">
                      <li><span className="text-foreground/85">Info</span> — |z| ≥ 2.0, within normal variability.</li>
                      <li><span className="text-foreground/85">Watch</span> — |z| ≥ 2.25, worth monitoring.</li>
                      <li><span className="text-foreground/85">Alert</span> — |z| ≥ 3.5, statistically unusual.</li>
                    </ul>
                  </div>
                  <div className="border-t border-border/30 pt-3">
                    <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1.5">How to interact</div>
                    <ul className="text-[10px] leading-relaxed text-muted-foreground space-y-1 list-disc list-inside marker:text-foreground/40">
                      <li>Filter the feed by layer or minimum severity.</li>
                      <li>Click any event to jump into Single-Layer analysis on that dataset.</li>
                      <li>Open the Assistant tab to ask for a plain-language interpretation.</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1">Intelligence Reports</div>
                    <p className="text-[10px] leading-relaxed text-muted-foreground">
                      Generate daily, weekly, monthly, or custom reports across all loaded layers. Each report is grounded in the current analysis context plus the live event feed.
                    </p>
                  </div>
                  <div className="border-t border-border/30 pt-3">
                    <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1.5">Storage</div>
                    <p className="text-[10px] leading-relaxed text-muted-foreground">
                      Reports are saved in this browser (localStorage) and remain available offline. Up to 50 reports are kept; oldest are dropped.
                    </p>
                  </div>
                  <div className="border-t border-border/30 pt-3">
                    <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55 mb-1.5">How to interact</div>
                    <ul className="text-[10px] leading-relaxed text-muted-foreground space-y-1 list-disc list-inside marker:text-foreground/40">
                      <li>Pick a cadence to draft a new report.</li>
                      <li>Select any saved report to read it in full.</li>
                      <li>Switch to Single-Layer or Cross-Layer first to bias the report toward that context.</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <AssistantPanel context={assistantContext} />
            </div>
          )}
        </HudPanel>
      </div>

      {/* Bottom rail */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none px-4 pb-6">
        <HudPanel className="pointer-events-auto p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
            <Stat label="Samples" value={dataset.series.length.toString()} />
            <Stat label="Unit" value={dataset.unit} />
            <Stat label="Sample rate" value={`${dataset.sampleRate} / ${dataset.unit}`} />
            <Stat label="Anchor period" value={dataset.knownPeriod ? `${dataset.knownPeriod.toFixed(2)} ${dataset.unit}` : "—"} />
          </div>
        </HudPanel>
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/55">{label}</div>
    <div className="text-foreground/90 font-mono tracking-tight">{value}</div>
  </div>
);

// ───────── Method views ─────────

function MethodView({
  method,
  dataset,
  compare,
  lm,
}: {
  method: AnalyticalMethod;
  dataset: Dataset;
  compare?: Dataset;
  lm: { l: number; m: number };
}) {
  if (method === "spectrum" || method === "harmonic" || method === "pattern") {
    return <SpectrumPlot ds={dataset} />;
  }
  if (method === "timeSeries") {
    return <LinePlot data={dataset.series} yLabel={dataset.label} xLabel={`time (${dataset.unit})`} />;
  }
  if (method === "correlation" && compare) {
    return <CorrelationPlot a={dataset} b={compare} />;
  }
  if (method === "spherical") {
    return (
      <div className="w-full h-full">
        <SphericalHarmonics3D l={lm.l} m={lm.m} />
      </div>
    );
  }
  return <LinePlot data={dataset.series} />;
}

function MethodDetail({
  method,
  dataset,
  compare,
  setCompareId,
  compareId,
  lm,
  setLm,
}: {
  method: AnalyticalMethod;
  dataset: Dataset;
  compare?: Dataset;
  setCompareId: (id: string) => void;
  compareId: string;
  lm: { l: number; m: number };
  setLm: (v: { l: number; m: number }) => void;
}) {
  if (method === "harmonic") {
    const spec = spectrum(dataset.series, dataset.sampleRate, dataset.unit);
    const fund = spec.fundamental?.period ?? dataset.knownPeriod ?? 0;
    const ladder = harmonicLadder(fund, 8);
    return (
      <HudPanel className="p-4">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/55 mb-2">Harmonic ladder</div>
        <table className="w-full text-[11px] font-mono">
          <thead>
            <tr className="text-muted-foreground/55 text-left">
              <th className="py-1">n</th>
              <th>Period ({dataset.unit})</th>
              <th>Freq</th>
              <th>Ratio</th>
              <th>Interval</th>
            </tr>
          </thead>
          <tbody>
            {ladder.map((r) => {
              const interval = nearestInterval(r.n);
              return (
                <tr key={r.n} className="border-t border-border/20 text-foreground/85">
                  <td className="py-1">{r.n}</td>
                  <td>{r.period.toFixed(3)}</td>
                  <td>{r.freq.toFixed(4)}</td>
                  <td>{r.ratioLabel}</td>
                  <td>{interval.interval.label}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </HudPanel>
    );
  }
  if (method === "spectrum" || method === "pattern") {
    const spec = spectrum(dataset.series, dataset.sampleRate, dataset.unit);
    return (
      <HudPanel className="p-4">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/55 mb-2">Detected peaks</div>
        {spec.peaks.length === 0 ? (
          <div className="text-[11px] text-muted-foreground/70">No significant peaks above 1.2× mean power.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {spec.peaks.map((p, i) => (
              <div key={i} className="rounded-md border border-border/30 p-2 bg-background/30">
                <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/55">Peak {i + 1}</div>
                <div className="text-foreground/90 font-mono text-[12px]">
                  {p.period < 100 ? p.period.toFixed(3) : p.period.toFixed(0)} {dataset.unit}
                </div>
                <div className="text-[9px] text-muted-foreground/60">power {p.power.toExponential(2)}</div>
              </div>
            ))}
          </div>
        )}
      </HudPanel>
    );
  }
  if (method === "timeSeries") {
    const ac = autocorrelation(dataset.series, Math.min(512, Math.floor(dataset.series.length / 2)));
    return (
      <HudPanel className="p-4">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/55 mb-2">Autocorrelation</div>
        <div className="h-[180px]">
          <LinePlot data={ac} yLabel="r(k)" xLabel={`lag (${dataset.unit})`} color="hsla(45,100%,70%,0.95)" fill="hsla(45,100%,70%,0.1)" />
        </div>
      </HudPanel>
    );
  }
  if (method === "correlation") {
    return (
      <HudPanel className="p-4">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/55">Compare against</div>
          <select
            value={compareId}
            onChange={(e) => setCompareId(e.target.value)}
            className="bg-background/60 border border-border/40 rounded px-2 py-1 text-[11px] text-foreground/90"
          >
            {SCOPES.map((s) => (
              <optgroup key={s.id} label={s.label}>
                {datasetsByScope(s.id).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {compare && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="h-[120px]">
              <LinePlot data={dataset.series.slice(0, 512)} yLabel={dataset.label} />
            </div>
            <div className="h-[120px]">
              <LinePlot data={compare.series.slice(0, 512)} yLabel={compare.label} color="hsla(280,70%,75%,0.95)" fill="hsla(280,70%,75%,0.1)" />
            </div>
          </div>
        )}
      </HudPanel>
    );
  }
  if (method === "spherical") {
    return (
      <HudPanel className="p-4">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/55 mb-3">Spherical mode Yₗᵐ</div>
        <div className="flex flex-wrap gap-6 items-center">
          <label className="flex flex-col gap-1 text-[10px] text-muted-foreground/70">
            ℓ (degree): {lm.l}
            <input type="range" min={0} max={8} value={lm.l} onChange={(e) => setLm({ l: Number(e.target.value), m: Math.min(lm.m, Number(e.target.value)) })} />
          </label>
          <label className="flex flex-col gap-1 text-[10px] text-muted-foreground/70">
            m (order): {lm.m}
            <input type="range" min={0} max={lm.l} value={lm.m} onChange={(e) => setLm({ l: lm.l, m: Number(e.target.value) })} />
          </label>
          <div className="text-[10px] text-muted-foreground/70 max-w-sm">
            Used to decompose full-sky fields — Earth's geomagnetic and gravity fields, large-scale ocean dynamics, and the CMB temperature map.
          </div>
        </div>
      </HudPanel>
    );
  }
  // universal ratio table for orbital harmonics
  if (dataset.scope === "universal") {
    return (
      <HudPanel className="p-4">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/55 mb-2">Orbital ratios (Earth = 1)</div>
        <table className="w-full text-[11px] font-mono">
          <thead className="text-muted-foreground/55 text-left">
            <tr>
              <th>Planet</th>
              <th>P (yr)</th>
              <th>Nearest ratio</th>
              <th>Nearest interval</th>
              <th>Cents</th>
            </tr>
          </thead>
          <tbody>
            {ORBITAL_PERIODS.map((p) => {
              const r = nearestRatio(p.periodYears, 8);
              const iv = nearestInterval(p.periodYears);
              return (
                <tr key={p.name} className="border-t border-border/20 text-foreground/85">
                  <td className="py-1">{p.name}</td>
                  <td>{p.periodYears.toFixed(3)}</td>
                  <td>{r.label}</td>
                  <td>{iv.interval.label}</td>
                  <td>{iv.cents.toFixed(0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </HudPanel>
    );
  }
  return null;
}

// ───────── Copy ─────────

function whatYoureSeeing(method: AnalyticalMethod, ds: Dataset): string {
  switch (method) {
    case "spectrum":
      return `Power spectrum of ${ds.label}. Tall bars mark frequencies where the signal concentrates energy; dashed lines mark detected peaks with their periods in ${ds.unit}.`;
    case "harmonic":
      return `Overtone ladder built from the fundamental period found in ${ds.label}. Each row is an integer multiple of the fundamental frequency — the same structure that produces musical timbre.`;
    case "timeSeries":
      return `${ds.label} plotted against time, paired with its autocorrelation. Peaks in the autocorrelation reveal repeating periods in ${ds.unit}.`;
    case "correlation":
      return `Cross-correlation between two datasets across lag. Positive lobes mark lags at which the two signals move together; the labeled best lag is the strongest match.`;
    case "spherical":
      return `Real spherical harmonic Yₗᵐ rendered on a unit sphere. Each (ℓ, m) is a basis pattern used to decompose full-sky fields such as Earth's magnetic field or the CMB.`;
    case "pattern":
      return `Detected peaks in the power spectrum of ${ds.label}, ranked by power. Use these as candidate cycles or resonances.`;
  }
}

function whyItMatters(method: AnalyticalMethod): string[] {
  switch (method) {
    case "spectrum":
      return [
        "Reveals hidden cycles in noisy real-world data.",
        "Lets you compare characteristic frequencies across systems.",
      ];
    case "harmonic":
      return [
        "Shows how a single fundamental builds a family of overtones.",
        "Bridges physical periods to musical intervals.",
      ];
    case "timeSeries":
      return [
        "Distinguishes trend, cycle, and noise in a signal.",
        "Autocorrelation confirms whether a peak is truly periodic.",
      ];
    case "correlation":
      return [
        "Quantifies whether two systems are linked and by how much lag.",
        "Useful for solar-terrestrial coupling and cross-scale tests.",
      ];
    case "spherical":
      return [
        "Standard basis for global geophysical and cosmological fields.",
        "Each (ℓ, m) isolates a specific angular pattern.",
      ];
    case "pattern":
      return [
        "Turns a continuous spectrum into a short list of candidate cycles.",
        "First step toward identifying physical drivers.",
      ];
  }
}

export default HarmonicsEngine;
