## Current assessment
The earlier claim was not fully accurate.

- **Planetary is restored**: the `/` page is visibly back to its original look.
- **The other pages are still not using the exact same implementation**: at least `/galactic` is rendering a similar starry backdrop, but it is **not the same background stack the planetary page uses**.

## Why this keeps happening
The planetary backdrop is currently **split across two separate implementations**:

1. **`src/pages/Index.tsx`** supplies the radial base, vignette, scanline, and film-grain layers.
2. **`src/components/EarthVisualization.tsx`** supplies the moving `Stars` layer inside the planetary WebGL canvas.

The other pages are using **`src/components/NightSkyBackground.tsx`**, which is only a recreation of that look. Even if the numbers match, it is still a different renderer/layer stack, so it will not be pixel-identical.

That is the root cause: I kept trying to *match* the planetary background instead of making the other pages use the **same source of truth**.

## Plan
1. **Extract the planetary background into one canonical component**
   - Move the exact planetary backdrop stack into a dedicated shared component.
   - Include the same radial layers, grain, scanlines, and the same moving starfield behavior.

2. **Keep planetary visually unchanged**
   - Refactor the planetary page to consume that shared component without altering its appearance.
   - Remove duplicated backdrop code from `Index.tsx` only after the shared version produces the same result.

3. **Apply that exact shared component to Universal, Galactic, and Cosmological**
   - Mount the same component behind those pages.
   - Remove any route-level or visualization-level backdrop code that competes with it.

4. **Validate by route, visually**
   - Compare `/`, `/?view=hgs`, `/galactic`, and `/cosmological` side by side.
   - Confirm the background treatment is the same across routes, while the foreground visualizations remain different.

## Technical details
- Likely files involved:
  - `src/pages/Index.tsx`
  - `src/components/EarthVisualization.tsx`
  - `src/components/NightSkyBackground.tsx`
  - `src/components/hgs/HGSDashboard.tsx`
  - `src/pages/Galactic.tsx`
  - `src/pages/Cosmological.tsx`
- The key rule for the fix:
  - **One background implementation only**
  - **Planetary must become the source, not the reference image to imitate**

## Expected outcome
After implementation, the planetary page should look exactly as it does now, and Universal, Galactic, and Cosmological should inherit that exact same backdrop rather than a close approximation.