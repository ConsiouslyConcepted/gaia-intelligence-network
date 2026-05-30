import { Card } from "@/components/ui/card";
import { Sphere } from "@/types/spheres";
import { Activity, RefreshCw, Satellite, TrendingUp, TrendingDown, Minus, Globe } from "lucide-react";
import { BlueMarbleGlobe } from "./BlueMarbleGlobe";
import { useLiveOverlay } from "@/hooks/useLiveOverlay";
import { useSphereIntelligence } from "@/hooks/useSphereIntelligence";
import { buildLiveBehavior } from "@/lib/behavioralSummary";
import { BASINS, basinById, buildBasinReading, BasinId } from "@/lib/hydrosphereBasins";
import { CRYO_REGIONS, cryoRegionById, buildCryoReading, CryoRegionId } from "@/lib/cryosphereRegions";
import { BIO_REGIONS, bioRegionById, buildBioReading, BioRegionId } from "@/lib/biosphereRegions";
import { HELIO_ZONES, helioZoneById, buildHelioReading, HelioZoneId } from "@/lib/heliosphereZones";
import { TECHNO_ZONES, technoZoneById, buildTechnoReading, TechnoZoneId } from "@/lib/technosphereZones";
import { HelioActivityMap } from "./HelioActivityMap";
import { TechnoInfrastructureMap } from "./TechnoInfrastructureMap";
import { BASIN_BOUNDS, RegionDef } from "@/lib/basinMasks";
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
  const live = useLiveOverlay(sphere.id);

  const isHydro = sphere.id === "hydrosphere";
  const isCryo = sphere.id === "cryosphere";
  const isBio = sphere.id === "biosphere";
  const isHelio = sphere.id === "magnetosphere"; // displayed as "Heliosphere"
  const hasRegions = isHydro || isCryo || isBio;
  const hasZones = isHelio;

  // Selected region id (string for generic globe API)
  const [selectedId, setSelectedId] = useState<string>("global");

  // Reset selection when switching spheres
  useEffect(() => {
    setSelectedId("global");
  }, [sphere.id]);

  // Build the per-sphere region set + reading
  const { regions, regionTint, regionName, regionSummary, regionPatterns, regionScore, regionTrend, chips } = useMemo(() => {
    if (isHydro) {
      const regions: RegionDef[] = BASINS.map((b) => ({
        id: b.id,
        boxes: BASIN_BOUNDS[b.id]?.boxes ?? [],
        surface: "ocean" as const,
      }));
      const basin = basinById(selectedId as BasinId);
      const r = buildBasinReading(intel, basin);
      const chips = BASINS.map((b) => ({ id: b.id, name: b.name, tint: b.tint }));
      return {
        regions,
        regionTint: basin.tint,
        regionName: basin.name,
        regionSummary: selectedId === "global" ? null : r.summary,
        regionPatterns: selectedId === "global" ? null : r.patterns,
        regionScore: selectedId === "global" ? null : r.score,
        regionTrend: selectedId === "global" ? null : r.trend,
        chips,
      };
    }
    if (isCryo) {
      const regions: RegionDef[] = CRYO_REGIONS.map((r) => ({
        id: r.id, boxes: r.boxes, surface: r.surface,
      }));
      const cur = cryoRegionById(selectedId as CryoRegionId);
      const r = buildCryoReading(intel, cur);
      const chips = CRYO_REGIONS.map((c) => ({ id: c.id, name: c.name, tint: c.tint }));
      return {
        regions,
        regionTint: cur.tint,
        regionName: cur.name,
        regionSummary: selectedId === "global" ? null : r.summary,
        regionPatterns: selectedId === "global" ? null : r.patterns,
        regionScore: selectedId === "global" ? null : r.score,
        regionTrend: selectedId === "global" ? null : r.trend,
        chips,
      };
    }
    if (isBio) {
      const regions: RegionDef[] = BIO_REGIONS.map((r) => ({
        id: r.id, boxes: r.boxes, surface: r.surface,
      }));
      const cur = bioRegionById(selectedId as BioRegionId);
      const r = buildBioReading(intel, cur);
      const chips = BIO_REGIONS.map((c) => ({ id: c.id, name: c.name, tint: c.tint }));
      return {
        regions,
        regionTint: cur.tint,
        regionName: cur.name,
        regionSummary: selectedId === "global" ? null : r.summary,
        regionPatterns: selectedId === "global" ? null : r.patterns,
        regionScore: selectedId === "global" ? null : r.score,
        regionTrend: selectedId === "global" ? null : r.trend,
        chips,
      };
    }
    if (isHelio) {
      const cur = helioZoneById(selectedId as HelioZoneId);
      const r = buildHelioReading(intel, cur);
      const chips = HELIO_ZONES.map((z) => ({ id: z.id, name: z.name, tint: z.tint }));
      return {
        regions: undefined,
        regionTint: cur.tint,
        regionName: cur.name,
        regionSummary: selectedId === "global" ? null : r.summary,
        regionPatterns: selectedId === "global" ? null : r.patterns,
        regionScore: selectedId === "global" ? null : r.score,
        regionTrend: selectedId === "global" ? null : r.trend,
        chips,
      };
    }
    return { regions: undefined, regionTint: undefined, regionName: undefined, regionSummary: null, regionPatterns: null, regionScore: null, regionTrend: null, chips: [] as { id: string; name: string; tint: string }[] };
  }, [isHydro, isCryo, isBio, isHelio, selectedId, intel]);

  const globalBehavior = useMemo(() => buildLiveBehavior(intel), [intel]);
  const displaySummary = regionSummary ?? globalBehavior.summary;
  const displayPatterns = regionPatterns ?? globalBehavior.patterns;
  const displayScore = regionScore ?? intel.score;
  const displayTrend = regionTrend ?? intel.trend;

  // "updated Xs ago" ticker
  const [updatedAt, setUpdatedAt] = useState(() => Date.now());
  useEffect(() => {
    setUpdatedAt(Date.now());
  }, [intel.score, intel.trend, selectedId]);
  const [, setNow] = useState(Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);
  const secsAgo = Math.max(0, Math.floor((Date.now() - updatedAt) / 1000));

  const regionLabel = isHydro ? "ocean basin" : isCryo ? "ice region" : isBio ? "bioregion" : isHelio ? "activity zone" : "region";

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
                <span className="text-lg font-bold font-mono" style={{ color: accent }}>{displayScore}</span>
                <TrendIcon trend={displayTrend} accent={accent} />
                <span className="text-[10px] font-mono text-muted-foreground/60">
                  {displayTrend >= 0 ? "+" : ""}{displayTrend.toFixed(1)}
                </span>
              </div>
              <p className="text-[8px] uppercase tracking-wider text-muted-foreground/40">
                {hasRegions || hasZones ? regionName : intel.scoreLabel}
              </p>
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

      {/* Visualization: Helio activity map for heliosphere, Blue Marble for Earth spheres */}
      <Card className="glass-panel rounded-xl p-3 relative overflow-hidden">
        {hasZones ? (
          <HelioActivityMap
            height={340}
            selectedId={selectedId as HelioZoneId}
            onSelect={(id) => setSelectedId(id)}
          />
        ) : (
          <BlueMarbleGlobe
            height={340}
            sphereId={sphere.id}
            overlayUrl={hasRegions ? undefined : live.textureUrl}
            quakes={sphere.id === "geosphere" ? live.quakes : undefined}
            regions={regions}
            selectedRegionId={hasRegions ? selectedId : undefined}
            selectedRegionColor={regionTint}
            onSelectRegion={hasRegions ? setSelectedId : undefined}
          />
        )}
        {(hasRegions || hasZones) && (
          <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/40 text-center mt-2">
            {hasZones ? "Click an activity zone · or select below" : `Click an ${regionLabel} on the globe · or select below`}
          </p>
        )}
      </Card>

      {/* Region / zone selector chips */}
      {(hasRegions || hasZones) && (
        <Card className="glass-panel rounded-xl px-3 py-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Globe className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
            {chips.map((c) => {
              const sel = selectedId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className="px-2.5 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider transition-colors shrink-0 border"
                  style={{
                    backgroundColor: sel ? `${c.tint}25` : "transparent",
                    borderColor: sel ? c.tint : "hsl(var(--border) / 0.3)",
                    color: sel ? c.tint : "hsl(var(--muted-foreground))",
                  }}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </Card>
      )}


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
        <p className="text-xs text-muted-foreground/70 leading-relaxed">{displaySummary}</p>

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
        {displayPatterns.map((pattern, idx) => (
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
