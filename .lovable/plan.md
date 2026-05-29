
# Universal Page — Living Solar System Upgrade

Keep the existing 2D `OrbitalResonanceField` (rename it the "Harmonic" view) and add a new 3D "Living Solar System" view powered by react-three-fiber. A floating glass pill at bottom-center switches between the two modes. Surrounding panels add Solar Cycle, Alignment Indicator, and a link card to Magnetosphere/Ionosphere for space weather (no duplication of Solar Flares/CMEs).

## Viewport modes

```text
                  ┌──────────────── Universal ────────────────┐
                  │ Top bar: Planetary | Universal | Cosmological │
                  │                                           │
                  │      [ Harmonic 2D   |   Living 3D ]      │  ← bottom-center pill
                  └───────────────────────────────────────────┘
```

- **Harmonic** — existing `OrbitalResonanceField` + right sidebar (cymatics, tone, pairs).
- **Living** — new full-bleed 3D solar system with right sidebar reused.

## New 3D view: "Living Solar System"

Cinematic, accurate, monochromatic glassmorphism HUD overlay.

- Sun with corona bloom shader; brightness driven by current Solar Cycle SSN (already fetched via `useNOAASolarCycle`).
- 9 planets (Mercury → Pluto) with PBR textures, axial tilt, rotation; rings for Saturn and Uranus.
- Elliptical orbit trails computed from Keplerian elements (J2000), no API needed; planet positions update in real time from current date.
- Camera: auto-orbit by default; scroll to zoom from inner planets out to Pluto; click a planet to focus + isolate (same selection state as Harmonic view, so sidebar stays in sync).
- Starfield background, subtle dust, depth-of-field on focus.
- Harmonic Overlay toggle (HUD button): renders the same orbital-resonance arcs from the 2D view as glowing threads between planets in 3D space.
- Performance: dpr capped at 1.5, instanced orbit lines, suspense fallback.

## Additional Universal panels

Layered above the canvas as compact glass HUD cards (do not crowd the scene):

1. **Solar Cycle Progression** (top-left strip) — sparkline of `useNOAASolarCycle` smoothed SSN + current phase label.
2. **Planetary Alignment Indicator** (bottom-left chip) — computes heliocentric longitudes from the same Keplerian set; lights up when 3+ planets fall within a configurable arc (default 15°). Shows participating planets.
3. **Space Weather link card** (bottom-right small) — "Solar Flares · CMEs — view in Magnetosphere" → navigates to `/sphere/magnetosphere`. No charts duplicated here.

Right sidebar (existing `HGSDashboard` sidebar) is preserved across both modes.

## Files

New:
- `src/components/universal/LivingSolarSystem.tsx` — R3F `<Canvas>` scene root.
- `src/components/universal/scene/Sun.tsx`, `Planet.tsx`, `OrbitTrail.tsx`, `HarmonicArcs3D.tsx`, `Starfield.tsx`.
- `src/components/universal/ViewModeToggle.tsx` — floating bottom-center pill (Harmonic ↔ Living).
- `src/components/universal/SolarCyclePanel.tsx`
- `src/components/universal/AlignmentIndicator.tsx`
- `src/components/universal/SpaceWeatherLink.tsx`
- `src/lib/orbitalMechanics.ts` — Keplerian element table + position solver (heliocentric XYZ + longitude). Pure functions, no deps.
- `src/hooks/usePlanetaryPositions.ts` — ticks positions on a `requestAnimationFrame` loop, exposes `{ id, position, longitude }[]`.

Edited:
- `src/components/hgs/HGSDashboard.tsx` — add `viewMode` state, render `<OrbitalResonanceField>` or `<LivingSolarSystem>`, mount `<ViewModeToggle>`, `<SolarCyclePanel>`, `<AlignmentIndicator>`, `<SpaceWeatherLink>`. Selection state shared between modes.

## Dependencies

Pinned for React 18 (per project constraint):
- `three@^0.160.0`
- `@react-three/fiber@^8.18.0`
- `@react-three/drei@^9.122.0` (for `OrbitControls`, `Stars`, `Html`, `useTexture`, `Bloom` via postprocessing)
- `@react-three/postprocessing@^2.16.0` (bloom on Sun + selected planet)

## Design

- Monochromatic glassmorphism preserved: HUD cards use existing translucent panel style; 3D scene uses neutral palette — white/warm-white Sun, planet textures kept naturalistic but desaturated slightly to fit the command-center tone.
- Bottom-center pill matches the existing toggle group styling in the top bar (same inset shadow, border, font tracking).
- No new accent colors; selection glow reuses the planet's own color (already defined in `SOLAR_PLANETS`).

## Out of scope

- Solar Flares and CMEs panels (stay in Magnetosphere/Ionosphere; only linked from here).
- No backend, no new API integrations — positions are computed client-side; SSN reuses existing hook.
- No changes to Planetary or Cosmological pages.

## Validation

- Toggle switches modes without unmounting the sidebar (selection persists).
- 3D scene renders at >40fps on the current preview viewport; falls back gracefully if WebGL unavailable.
- Alignment Indicator lights up when test date is set to a known multi-planet conjunction.
- Space Weather link routes to `/sphere/magnetosphere`.
