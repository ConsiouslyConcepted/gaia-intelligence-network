## Goal
Clear the wireframe shell clutter so the Blue Marble Earth is the hero. Shells appear contextually when a sphere system is engaged.

## Changes

**`src/components/EarthVisualization.tsx`**
- Render only the `CoreSphere` (Blue Marble) + orbital accent rings + starfield by default. No `ShellSphere` meshes on initial load.
- Accept an optional `activeSphereId` prop (from the left "Sphere Systems" rail). When set, render that single shell (wireframe + glow + label) around the globe.
- On hover of a sphere row in the left rail, render a faint preview shell; on click, lock it in as `activeSphereId`. Clicking again or selecting another sphere swaps it.
- Keep navigation behavior (click-through to `/sphere/:id`) intact, but route it through the rail's existing handler rather than clicking shells in the canvas.

**`src/components/SphereDashboard.tsx`** (or wherever the left Sphere Systems rail lives — to be confirmed on read)
- Lift `hoveredSphereId` / `activeSphereId` state and pass to `EarthVisualization`.
- Existing per-sphere tint colors on the rail rows stay (memory rule: left rail keeps wayfinding hues).

## Out of scope
- HGS / Transits views and their overlays.
- Sphere detail pages.
- No changes to the orbital accent rings (the two thin gold/blue torus rings) — those are subtle and read as planetary context, not grid clutter.

## Open question
Should the active shell persist after click (until dismissed/another selected), or only show while hovering the rail row? Default proposal: **persists on click, previews on hover** — gives a clean default state plus a stable inspection mode.
