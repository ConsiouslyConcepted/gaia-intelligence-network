
# Homepage → Intelligence Observatory

Replace the current split-rail Home with a single full-bleed WebGL scene that the user travels *through* — Earth out to the Observable Universe — with each scale acting as a gateway into its existing dashboard.

## Experience model

One continuous camera dolly along a Z axis. Scrolling, arrow keys, or clicking a scale rail advances the camera through nine nested "stations." Each station is a self-contained 3D layer composited in depth so the prior scale is still visible behind you — preserving orientation.

```text
[ Earth ] → [ Planetary ] → [ Heliosphere ] → [ Stellar Nbhd ]
   → [ Milky Way ] → [ Local Group ] → [ Virgo ] → [ Laniakea ] → [ Observable Universe ]
```

At every station the HUD updates:
- Station name + one-line scientific descriptor
- "Enter dashboard" CTA (only on the 6 stations that map to a real dashboard: Earth→Planetary, Heliosphere→Solar, Stellar Nbhd→Stellar, Milky Way→Galactic, Local Group/Virgo/Laniakea→Universal, Observable Universe→Cosmological)
- Scale readout (e.g. "12,742 km" → "93 Gly")
- Mini scale rail down the right side so the user always knows where they are

## Scene composition (per station)

| Station | Visual |
|---|---|
| Earth | Blue Marble globe (reuse existing Earth3D textures), atmosphere rim |
| Planetary | Earth + Moon + magnetosphere field lines |
| Heliosphere | Sun at center, planet orbits as faint rings, heliopause shell |
| Stellar Nbhd | ~200 nearby-star sprites, color by spectral class, Sun highlighted |
| Milky Way | Top-down spiral (procedural particles, ~40k), "You are here" marker |
| Local Group | Milky Way + Andromeda + Triangulum + satellites as glowing discs |
| Virgo Cluster | Cluster of ~80 galaxy sprites around Virgo A |
| Laniakea | Flow-field streamlines converging on Great Attractor |
| Observable Universe | Cosmic web — filament particles + voids, CMB-tinted backdrop |

All stations live in the same scene at exponentially spaced Z positions; camera FOV and exposure are tweened between stations so each scale feels right.

## Interaction

- Scroll wheel / trackpad → advances camera; debounced snap-to-nearest-station on idle
- Arrow keys ↑ ↓ → step between stations
- Right-rail station list → click to fly-to (cubic ease, ~1.2s)
- "Enter [Dashboard]" button → routes to existing page (`/planetary`, `/planetary?view=hgs`, `/stellar`, `/galactic`, `/universal`, `/cosmological`)
- Top-left wordmark returns to station 0

## HUD / chrome

Keeps the existing monochromatic glassmorphism. No colorful accents. Footer line: "Digital Twin · Live Telemetry".

```text
┌────────────────────────────────────────────────────────────┐
│ GAIASPHERE OBSERVATORY                            [≡ menu] │
│                                                            │
│                                                  ┌───────┐ │
│                                                  │Earth ●│ │
│                                                  │Planet │ │
│           [ immersive 3D scene ]                 │Helio  │ │
│                                                  │Stellar│ │
│                                                  │Galaxy │ │
│                                                  │Local  │ │
│                                                  │Virgo  │ │
│                                                  │Lani.  │ │
│                                                  │Univ.  │ │
│                                                  └───────┘ │
│ ┌──────────────────────────────────────────────┐           │
│ │ EARTH · 12,742 km · home world               │           │
│ │ Living planet — biosphere, magnetosphere…    │           │
│ │ [ Enter Planetary Dashboard → ]              │           │
│ └──────────────────────────────────────────────┘           │
│                                  Digital Twin · Live Tel.  │
└────────────────────────────────────────────────────────────┘
```

## Technical details

- New file `src/pages/Home.tsx` (replaces current implementation)
- New component `src/components/observatory/ObservatoryScene.tsx` — `<Canvas>` host, camera rig, station registry, scroll/key controller
- New components per station under `src/components/observatory/stations/` — `EarthStation`, `PlanetaryStation`, `HeliosphereStation`, `StellarNeighborhoodStation`, `MilkyWayStation`, `LocalGroupStation`, `VirgoStation`, `LaniakeaStation`, `ObservableUniverseStation`
- `src/components/observatory/StationRail.tsx`, `StationHud.tsx`
- Reuse existing R3F deps (`@react-three/fiber@^8.18`, `@react-three/drei@^9.122.0`) — already installed for Earth3D / CosmicAddress3D
- Reuse existing Earth textures from current Home/Universal pages
- Camera path: positions[] in normalized log-space; lerp `camera.position.z` and `camera.fov`; `useFrame` smoothing factor 0.08
- Snap behavior: detect scroll-idle 180ms, ease to nearest station t-value
- Lazy-mount heavy stations (Milky Way 40k particles, Cosmic Web) via `<Suspense>` + visibility distance cull
- Bottom-bar performance: hard cap pixel ratio at 1.5, single directional light + ambient, no post-processing pass beyond a cheap vignette overlay (CSS)
- All routes already exist — no router changes needed
- Existing Home.tsx is overwritten; existing menu bar / other pages untouched

## Build order

1. Scaffold `ObservatoryScene` + camera controller + 3 placeholder stations (Earth, Milky Way, Universe) and verify scroll/snap/keyboard work
2. Add station rail + HUD wired to active station state
3. Build the remaining 6 stations
4. Wire dashboard CTAs to existing routes
5. Performance pass + responsive (mobile = same rail collapsed into a bottom slider)

## Out of scope (this turn)

- Audio / ambient soundtrack
- Live telemetry overlays on Earth (already on Planetary page)
- Saving last-viewed station to localStorage
- A guided "auto-tour" play button (can add later if wanted)
