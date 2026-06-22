## Goal
Replace the current procedural galaxy in `src/components/universal/CosmicAddress3D.tsx` with an interactive 3D recreation that matches the look of the attached National Geographic "A Safe Location" plate. No image textures, no info boxes — just the galaxy, its labels, and the "You Are Here" marker, fully orbit-able and zoom-able.

## What changes
Only `src/components/universal/CosmicAddress3D.tsx`. No edits to `Universal.tsx` or anything else.

## Visual targets (matching the reference)

**Camera / framing**
- Tilted three-quarter view, galaxy filling the frame, deep black background with subtle star field.

**Galactic structure**
- Bright white-hot **central bar** (elongated ellipsoid, ~10–12k ly long) — this is the defining feature of the reference, not a round bulge.
- Soft **golden bulge haze** wrapping the bar.
- **Two dominant grand-design spiral arms** sweeping off the ends of the bar, plus secondary inner arms, built from logarithmic spirals (pitch ~12°). Particle count tuned for a soft, dusty "painted" look rather than discrete stars.
- Cool blue-white star/dust color in the arms with darker dust lanes between them.
- Thin disk (very small Y jitter) so the tilt reads correctly.

**Labels (curved along arms, like the plate)**
- Arm names, letter-spaced, in soft cyan: `OUTER ARM`, `PERSEUS ARM`, `SAGITTARIUS ARM`, `SCUTUM–CENTAURUS ARM`, `NORMA ARM`, `ORION SPUR`, `FAR 3 KPC ARM`, `NEAR 3 KPC ARM`, `CORE`.
- Implemented by sampling points along each arm's spiral and placing per-character `<Text>` glyphs rotated to the local tangent (billboarded only on Y so they stay on the disk plane).

**Rings and markers**
- Faint concentric distance rings at **10,000 / 20,000 / 30,000 / 40,000 light-years**, each labeled once near the bottom (`10,000 light-years`, etc.).
- Faint **degree tick ring** around the outer edge with labels every 30° (`0°, 30°, 60° … 330°`) in muted gray.
- **Solar-system orbit**: a thin near-circular arc at ~26,000 ly with a small arrowhead, matching the reference's "solar system orbit" curve.
- **"YOU ARE HERE / SOLAR SYSTEM"** marker: small white dot on the Orion Spur with two-line label, no box.
- Small "Direction of rotation" arrow on the outer rim.

**Removed (per "leave out info boxes")**
- No "Galaxy Halo", "Ripe for Life?", "Chaotic Core", "Our sun offers protection…", "Our galactic path…", "Our location is far…" text blocks.
- No "PROFILE VIEW" inset, no nearby-stars inset, no title block, no body paragraph.

## Interaction
- `OrbitControls` with `autoRotate` (slow), `enablePan={false}`, zoom clamped so the galaxy can't be zoomed past its outer ring or shrunk to a dot.
- Hovering an arm subtly brightens its particles and its label (kept from the current implementation).
- Left-drag orbits, scroll zooms — same controls the user already has.

## Technical notes
- Pure `@react-three/fiber` + `@react-three/drei` (`OrbitControls`, `Billboard`, `Text`, `Line`). No new dependencies.
- Bar = scaled `sphereGeometry` (e.g. `[1, 0.25, 0.45]` scale on a 0.55-radius sphere) with additive emissive material, layered with a softer halo sphere.
- Arms = `THREE.Points` with `AdditiveBlending`, per-vertex colors so dust lanes/highlights read.
- Curved arm labels = small helper component that takes an arm's spiral, samples N evenly-spaced points across the label span, and renders one `<Text>` per character at each sample with rotation set to the spiral tangent.
- Degree ring = `Line` plus 12 `<Billboard>`/`<Text>` labels at 30° increments.
- All colors use literal hex inside the 3D scene (Three.js materials, not Tailwind tokens) — consistent with the existing file.

## Out of scope
- No changes to the page layout, the surrounding card, or any other component.
- No texture/image assets — fully procedural as you previously requested.
