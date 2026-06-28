## Goal

Retire the `/mission-control` hub. Preserve two of its workspaces by moving them into existing destinations; delete the rest.

## Changes

### 1. Home page — add Universal Overview strip
- In `src/pages/Home.tsx`, add a new section directly after the hero (before Vision) called **"Live System Status"**.
- Port the cards from `src/components/mission-control/UniversalOverviewWorkspace.tsx`:
  - Composite Health + Active Events header row
  - Six layer cards (Planetary, Solar, Stellar, Galactic, Universal, Cosmological) with system health bar, key metrics, recent event, and `Open Dashboard →` link to each scale page
  - Mission Synthesis card kept as the 6th tile (or dropped if it feels redundant — leaning drop to keep the home page lean)
- Reuse the existing live telemetry sources already wired into the workspace (USGS, NOAA SWPC, NASA EONET hooks) so the strip stays live.
- Style with the existing `HudPanel` treatment so it matches the home page panels.

### 2. Harmonics Engine — merge Harmonic Intelligence surfaces
- Current `src/pages/HarmonicsEngine.tsx` already covers Single-Layer Spectrum and parts of Cross-Layer Coupling. Extend it with mode tabs:
  1. **Spectrum** (existing FFT / dominant periods / harmonic ladder)
  2. **Coupling** (z-score overlay, best-lag cross-correlation, period-ratio detection — port from `HarmonicWorkspace.tsx`)
  3. **Spherical Harmonics** (Yₗᵐ renderer — port the component used by Mission Control)
  4. **Events & Anomalies** (z-score drift + severity alerts feed)
- Keep the existing AI Analyst panel embedded in this page (it's already the unified analyst).
- No new route; everything stays at `/analysis` (or wherever Harmonics Engine currently lives).

### 3. Delete Mission Control
- Remove route `/mission-control` from `src/App.tsx`.
- Delete files:
  - `src/pages/MissionControl.tsx`
  - `src/components/mission-control/` (entire folder — UniversalOverviewWorkspace, CrossLayerWorkspace / NestedShellObservatory, AIAnalystWorkspace, ReportsWorkspace, HarmonicWorkspace, CosmicAddressWorkspace, and shared layout)
- Note: `CosmicAddressWorkspace` and `CosmicAddressZoom` are also used by `/universal`. Before deleting, move them to `src/components/universal/` and update the import in `src/pages/Universal.tsx`.
- Remove every link/button pointing at `/mission-control` (home page CTAs, any nav entries, in-page "Open Mission Control" buttons).

### 4. Drop without porting
- Cross-Layer Intelligence (Nested Shell Observatory)
- AI Mission Analyst standalone surface (analyst stays inside Harmonics Engine only)
- Intelligence Reports archive

## Out of scope
- No changes to per-scale dashboards (Planetary, Solar, Stellar, Galactic, Universal, Cosmological).
- No design-system or palette changes.
- No backend/data changes — reuse existing telemetry hooks.
