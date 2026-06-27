## Goal

Treat Mission Control as a global tool (not a scale layer) and give the Universal page back its original identity.

## Changes

**1. Route split**
- New route `/mission-control` → renders the existing `MissionControl.tsx` (Overview, Cosmic Address, Cross-Layer, Harmonic, AI Analyst, Reports workspaces — unchanged).
- `/universal` reverts to the original `Universal.tsx` (the 682-line file is still in the repo, just not currently routed). All its existing scale-layer content returns: cosmic address visualization, spherical harmonics, info panels, transits, etc.

**2. Global HUD button (top-right)**
- Add a small `MissionControlLauncher` component, styled to match the existing Observatory Guide pill in the top-right HUD.
- Mount it globally so it appears on every dashboard (Home, Planetary, Solar, Stellar, Galactic, Universal, Cosmological) — sitting next to Observatory Guide.
- Icon + label "Mission Control". Click → navigates to `/mission-control` (preserves any `?workspace=` query if already on that route).

**3. Menu bar stays pure**
- Scale menu order unchanged: Planetary · Solar · Stellar · Galactic · Universal · Cosmological. No Mission Control entry added to the horizontal scale bar.

**4. Internal links**
- Any existing deep links currently pointing at `/universal?workspace=...` (e.g. from `HarmonicWorkspace` tiles, Cross-Layer deep-links, AI suggestions) are repointed to `/mission-control?workspace=...`.

## Technical notes

- `src/App.tsx`: add `<Route path="/mission-control" element={<MissionControl />} />`; change `<Route path="/universal" element={<MissionControl />} />` back to `<Universal />`.
- New file `src/components/MissionControlLauncher.tsx` rendered from the same place `ObservatoryGuide` is mounted (likely `App.tsx` or a layout wrapper). Same glass-pill styling, `Radar` or `LayoutDashboard` icon.
- Repoint `navigate("/universal?workspace=...")` → `navigate("/mission-control?workspace=...")` across the codebase (HarmonicWorkspace, CrossLayerWorkspace, any AI Analyst CTAs, etc.).
- No data, schema, or backend changes.

## Out of scope

- No redesign of Mission Control's internal workspaces.
- No edits to the original Universal page content — it returns exactly as it was.
