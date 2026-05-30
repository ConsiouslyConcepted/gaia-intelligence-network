# Geometry of Music — third Universal mode

Add a **Geometry** pill to the Universal dashboard top bar, alongside **Harmonics** and **Transits**, that visualizes the Pythagorean/Kepler chord geometry and ties it to Scafetta's `(b/a)^(2/3) ≈ 9/8` mirror-pair scaling of the solar system.

## Layout (matches existing symmetrical HUD)

```text
┌──────────────┬─────────────────────────────────┬──────────────┐
│ Intervals    │   12-tone Chromatic Wheel       │ Mirror Pairs │
│ (left rail)  │   + chord polygon overlay       │ + Adjacent   │
│              │ ─────────────────────────────── │ consonances  │
│ Octave 2/1   │   Pair Orbit Diagram            │              │
│ P5    3/2    │   (two concentric orbits,       │ Jup–Mars     │
│ P4    4/3    │    ratio + interval + acc.)     │ Sat–Earth    │
│ M3    5/4    │                                 │ Ura–Venus    │
│ m3    6/5    │                                 │ Nep–Mercury  │
│ M6    5/3    │                                 │              │
│ m6    8/5    │                                 │ Adj: M3/P4/  │
│ M2    9/8 ★  │                                 │ P5/m6        │
└──────────────┴─────────────────────────────────┴──────────────┘
```

## New files

- `src/lib/geometry/musicGeometry.ts` — `INTERVALS` (Octave, P5 3/2, P4 4/3, M3 5/4, m3 6/5, M6 5/3, m6 8/5, M2 9/8 epogdoon ★), `MIRROR_PAIRS` (Jup–Mars, Sat–Earth, Ura–Venus, Nep–Mercury with semi-major axes + computed `(b/a)^(2/3)` and accuracy vs `9/8`), `ADJACENT_PAIRS` mapped to M3/P4/P5/m6 consonances.
- `src/components/geometry/ChromaticWheel.tsx` — SVG 12-node clock; renders chord polygon for selected interval (P5 = 12-point star, M3 = 4 triangles, m3 = 3 squares, M2 = near-dodecagon, etc.).
- `src/components/geometry/PairOrbitDiagram.tsx` — Two concentric SVG orbits for the focused pair; labels show `a`, `b`, `(b/a)^(2/3)`, matching interval and % accuracy vs 9/8.
- `src/components/geometry/IntervalsSidebar.tsx` — Left rail list (reuses `HudPanel`).
- `src/components/geometry/PairsPanel.tsx` — Right rail (mirror pairs + adjacent consonances).

## Edit

- `src/components/hgs/HGSDashboard.tsx` — extend `mode` union to `"harmonics" | "transits" | "geometry"`, add the third pill, render the geometry trio when active.

## Interactions

- Left-click interval → wheel redraws chord polygon.
- Left-click planetary pair → orbit diagram switches to that pair.
- Right-click planet name → plays its tone via existing `usePlanetAudio`.
- Hover wheel node → highlights note + chord edges.

## Styling

Monochromatic glassmorphism via `HudPanel`. Chord polygons in muted cream/white. Planet labels keep their signature sphere hues (per memory exception). The epogdoon (9/8) row gets a subtle star marker since it's the fundamental planetary-scale ratio.

## Out of scope

Chord audio playback, editable tuning systems, 3D orbits, Kuiper/Vulcanoid extensions (data stubs only — can be turned on later).
