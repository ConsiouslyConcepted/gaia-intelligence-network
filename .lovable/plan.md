## Goal
Replace the procedural galaxy in `src/components/universal/CosmicAddress3D.tsx` with a real 3D Milky Way model (`.glb`), and overlay National Geographic–style leader lines + small glass info cards that label every key feature.

## Asset pipeline
- Source a CC-licensed top-down barred-spiral Milky Way `.glb` (Sketchfab CC-BY or NASA SVS). Target <5 MB.
- Upload via `lovable-assets create --file /tmp/milkyway.glb > public/models/milkyway.glb.asset.json`. Reference by CDN URL — no binary in repo.
- Load with `useGLTF(url)` from `@react-three/drei` (already installed). Add `<Suspense>` fallback (the existing soft procedural disk haze, dimmed) so the scene never flashes empty.
- If no suitable CC model is found at build time, fall back to keeping the current procedural arms/core as the base geometry — the pointer system below works identically either way.

## Scene
- Same `<Canvas>` shell, deep-space background, subtle star field, slow auto-spin group.
- Model centered, scaled so disk diameter ≈ current `DISK_R * 2`. Tilted three-quarter camera preserved.
- `OrbitControls`: pan off, zoom clamped, slow auto-rotate (toggleable on hover-pause).
- Keep distance rings (10k/20k/30k/40k ly) and degree ring as thin guides — they double as scale pointers.

## Info pointers (the main new work)
A single reusable `<InfoPointer>` component:
- Takes a 3D anchor point (galaxy-local coords), a label, and a short description.
- Renders a thin SVG/`<Line>` leader from the anchor out to a `<Html>` (drei) glass card positioned in screen space, with a small dot at the anchor.
- Card style: monochromatic glassmorphism (project rule) — `bg-white/5 backdrop-blur border border-white/15 text-white/90`, ~180 px wide, title + 1–2 line description.
- Hover the card or anchor → leader brightens, auto-rotate pauses.
- Click → card expands to ~260 px with an extra sentence (optional second line of detail).
- Cards use `<Html occlude transform={false}>` so they always face the camera and never get hidden by the galaxy.

### Pointers to place
**Core structure**
- Galactic Center (Sgr A*) — "Supermassive black hole, ~4 million ☉, 26,000 ly away"
- Central Bar — "~10,000 ly long stellar bar"
- Galactic Bulge — "Dense old-star population"
- Halo — outer pointer — "Dark-matter + globular-cluster halo, ~200,000 ly across"

**Spiral arms** (anchor on the arm midline, label radiating outward)
- Perseus Arm, Sagittarius Arm, Scutum–Centaurus Arm, Norma Arm, Outer Arm, Orion Spur (ours)
- Each card: one-line descriptor (e.g. "Major arm — bright star-forming regions")

**Our location**
- "You Are Here / Solar System" — pulsing dot on Orion Spur with a stronger leader and a bolder card: "Sun • Orion Spur • 26,000 ly from center"
- Galactic orbit arc with arrowhead, label "Sun's orbit — 230 Myr"
- Direction-of-rotation tag on outer rim

**Scale & orientation**
- Distance-ring legend card (bottom-left): "Rings: 10k / 20k / 30k / 40k light-years"
- Diameter card: "Disk ≈ 100,000 ly across"
- Degree ring kept as-is for orientation reference

## Interaction
- Toggle in the corner: "Show labels" / "Hide labels" (default on).
- Hovering any pointer highlights its anchor and pauses auto-rotate.
- Clicking the Sun pointer smoothly orbits camera to a closer view of Orion Spur.

## Files
- Edit only `src/components/universal/CosmicAddress3D.tsx`.
- Add `public/models/milkyway.glb.asset.json` (CDN pointer) if a suitable model is sourced.
- No new dependencies.

## Out of scope
- No info side-panels outside the canvas, no surrounding card/page changes.
- No business logic, no data fetching.
