
# Sphere Intelligence Cards

Give every sphere a uniform intelligence contract — **Purpose, Metrics, Score, Trend, Baseline, Anomalies** — surfaced two ways:

- **Compact chip** in the HUD's Sphere Systems / Sphere Signals lists (Score + sparkline + trend arrow)
- **Full Intelligence Card** at the top of the sphere detail view, above the existing Anatomy / Live Dynamics / Signals / Coupling layers

## Sphere contracts

All 7 spheres get the same shape. Scores normalize to 0–100 (higher = more stable / coherent, except Lithosphere where higher = more active — labeled accordingly).

| Sphere | Score name | Core metrics |
|---|---|---|
| Biosphere | Vitality | NDVI, vegetation health, carbon uptake, seasonal productivity |
| Atmosphere | Stability | ENSO, global temp anomaly, pressure oscillations, jet stream |
| Hydrosphere | Ocean Dynamics | Ocean heat content, SST anomaly, AMOC / circulation |
| Cryosphere | Stability | Arctic sea ice, Antarctic sea ice, snow cover |
| Lithosphere | Activity | Seismic energy, earthquake frequency, volcanic activity |
| Magnetosphere | Coherence | Kp index, solar wind pressure, Schumann resonance, geomag activity |
| Noosphere | Coherence | Information flow, signal-to-noise, collective attention proxies |
| Crystalsphere | Resonance | Lattice symmetry, harmonic phase lock, cross-sphere coupling strength |

Noosphere + Crystalsphere keep the same card contract so the dashboard stays uniform.

## Data approach

- Scores are computed from realistic mock formulas now, structured so each metric slot is a swappable data source.
- Where live telemetry is already wired (USGS seismic, NOAA Kp/space-weather, NASA EONET/GIBS), the metric reader points at the existing hook; everything else uses a deterministic mock with realistic jitter.
- Trend = delta vs 30-day rolling baseline. Anomalies = metrics outside ±2σ of baseline, surfaced as chips.
- Strictly read-only — no thresholds that trigger actions, only observability.

## UI

**Compact chip** (in HUD lists):
```text
[ Biosphere ─────────────────── 72 ▲ ]
[ ▁▂▃▅▆▇ sparkline       Vitality   ]
```

**Full Intelligence Card** (top of detail view):
- Header: sphere name + purpose line
- Big Score (0–100) with label ("Vitality", "Stability", …) and trend arrow + delta vs baseline
- Metrics grid: each metric shows current value, unit, mini sparkline, baseline comparison
- Active Anomalies row: chips for any metric currently outside ±2σ
- Quiet glassmorphism, neutral tones, white text — matches existing aesthetic

## File plan

New:
- `src/lib/sphereIntelligence.ts` — types (`SphereScore`, `MetricReading`, `Anomaly`), score formulas, baseline math
- `src/hooks/useSphereIntelligence.ts` — per-sphere hook returning `{ score, label, trend, metrics, anomalies }`
- `src/components/sphere-intelligence/SphereIntelligenceCard.tsx` — full card for detail view
- `src/components/sphere-intelligence/SphereIntelligenceChip.tsx` — compact chip for HUD lists
- `src/components/sphere-intelligence/MetricTile.tsx` — single metric cell
- `src/components/sphere-intelligence/sources/` — one small reader per sphere (`biosphere.ts`, `atmosphere.ts`, …) so live wiring can land sphere-by-sphere

Edited:
- `src/pages/Index.tsx` — render `SphereIntelligenceChip` inside each row of the Sphere Systems and Sphere Signals panels
- `src/components/sphere-detail/DataPanel.tsx` (or the sphere detail container) — mount `SphereIntelligenceCard` above the existing Anatomy/Live Dynamics/Signals/Coupling tabs
- `src/types/spheres.ts` — add `scoreLabel` + `scorePolarity` ("stability" | "activity") to each sphere config

No changes to HGS mode, audio, or existing layers.

## Out of scope (for this pass)

- Wiring every metric to live APIs (structure is ready; we land sources incrementally in follow-ups)
- Historical persistence (baselines computed in-memory from the rolling window)
- Alerting / notifications (would violate observability-only constraint)
