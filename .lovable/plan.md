# Universal Intelligence → Mission Control

Rebuild `/universal` into a six-workspace Mission Control hub that unifies every intelligence layer. Existing modules (Cosmic Address, Harmonic Cycles, Musical Ratios, Wave Structure, Spherical Harmonics) are preserved but reorganized as analytical workspaces inside the new shell.

## Route & navigation

- Keep `/universal` as the URL (clean, existing). Update nav label to "Universal" but page title becomes "Mission Control".
- Add a persistent "Return to Mission Control" link in the top nav of every layer dashboard (Planetary, Solar, Stellar, Galactic, Cosmological).
- Inside Mission Control, six workspaces accessed via a left rail (icon + label), keyed by URL search param `?workspace=overview|address|cross-layer|harmonic|ai|reports` so deep links work.

## Six workspaces

```text
┌─────────────────────────────────────────────────────────────┐
│  GAIASPHERE MISSION CONTROL          [Return to layer ▾]   │
├──────┬──────────────────────────────────────────────────────┤
│ [▣]  │                                                      │
│ [⊕]  │            Active workspace content                  │
│ [⇄]  │                                                      │
│ [♪]  │                                                      │
│ [✦]  │                                                      │
│ [▤]  │                                                      │
└──────┴──────────────────────────────────────────────────────┘
```

**1. Universal Overview** — five status cards (Planetary, Solar, Stellar, Galactic, Cosmological) each showing Health badge, Active Events count, Recent Changes, and an "Open dashboard →" link. Pulls from each layer's existing telemetry hooks.

**2. Cosmic Address** — migrate the existing `CosmicAddress3D` component. Each level (Earth → Solar System → Stellar Neighborhood → Milky Way → Local Group → Virgo → Laniakea → Observable Universe) becomes clickable; clicking opens the matching dashboard or zooms in 3D.

**3. Cross-Layer Intelligence** — reuses existing `CrossLayerPanel` + `crossLayer.ts`. Adds a "living network" view: 5 nodes (one per layer) with animated edges whose thickness = active correlation strength from latest comparisons. Lists active pairings (Planetary↔Solar, Solar↔Stellar, etc.) and surfaces shared patterns.

**4. Harmonic Intelligence** — consolidate existing Harmonic Cycles, Harmonic Relationships, Musical Ratios, Wave Structures, and Spherical Harmonics into one workspace with sub-tabs. This is where the current Harmonics Engine modes live.

**5. AI Mission Control** — promote the Observatory Guide into a full-pane analyst with starter prompts (Explain conditions / Compare layers / Detect anomalies / Generate report / Recommend investigations). Same edge function backend.

**6. Intelligence Reports** — reuse existing `ReportsPanel` and `reports.ts`. Add report templates: Daily Observatory, Weekly Summary, Planetary Conditions, Solar Activity, Cross-Layer, Universal. Each report shows Conditions / Events / Relationships / Trends / AI Summary / Recommended exploration.

## Build phases

**Phase 1 (this turn) — Shell & navigation**
- New `src/pages/MissionControl.tsx` replacing current `Universal.tsx` content; mount at `/universal`.
- New `src/components/mission-control/MissionShell.tsx` with left rail + workspace router.
- Stub all six workspace components with placeholder + "Coming in next phase" except Overview which renders immediately.
- Add `ReturnToMissionControl` link component, wire into Planetary/Solar/Stellar/Galactic/Cosmological page headers.

**Phase 2 — Overview + Cosmic Address**
- Build live status rollup in Workspace 1, pulling each layer's telemetry.
- Migrate `CosmicAddress3D` into Workspace 2 with clickable navigation.

**Phase 3 — Cross-Layer + Harmonic**
- Build living network visualization (Workspace 3).
- Consolidate harmonic modules into Workspace 4 with sub-tabs.

**Phase 4 — AI + Reports**
- Expand Observatory Guide into Workspace 5 with mission-control prompts.
- Wire report templates into Workspace 6.

## Technical details

- Workspace state via `useSearchParams` so each workspace has its own URL.
- Reuse existing components — do not duplicate: `CrossLayerPanel`, `EventsPanel`, `ReportsPanel`, `AssistantPanel`, `CosmicAddress3D`, harmonic modules from `HarmonicsEngine.tsx`.
- The old `/harmonics-engine` route stays functional during transition; nav points to Mission Control going forward.
- All glass styling matches existing design system (monochromatic glassmorphism per project memory).

After Phase 1 ships, you'll see the full shell + navigation working, with Overview live and the other five workspaces showing scaffolded placeholders so you can review the structure before I fill them in.
