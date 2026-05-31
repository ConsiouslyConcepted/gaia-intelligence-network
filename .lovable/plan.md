## Goal

Give every "sphere panel" a richer HUD-style background — layered translucent glass with a faint accent-tinted grid and slow-moving scanlines — applied consistently to:

1. Each row in the left **Sphere Systems** rail (`src/pages/Index.tsx`)
2. The row's hovered/active state (stronger accent edge + brighter grid)
3. The **Sphere Detail** page header card (`src/pages/SphereDetail.tsx`)

The sphere's signature hue stays as the accent (per the existing rail-tint exception). Body content (icon, name, sparkline, score, chevron) is unchanged.

## Implementation

### 1. New reusable backdrop component
Create `src/components/SpherePanelBackdrop.tsx`:
- Absolutely-positioned layer rendered inside a `relative` parent
- Layers (bottom → top):
  - Base glass gradient: `linear-gradient(145deg, hsla(240,22%,12%,0.85) → hsla(240,28%,6%,0.92))`
  - Accent tint wash: radial-gradient from the sphere accent at ~6–10% opacity, top-left origin
  - Grid texture: 16px × 16px CSS background-image of two thin `accent/8%` lines, masked with a radial fade so it's strongest near the icon
  - Scanline overlay: 2px horizontal repeating gradient at ~3% opacity, animated with a slow `translateY` keyframe (6–8s linear infinite)
  - Top inner highlight + bottom inner shadow via `box-shadow: inset`
  - Accent left edge: 1px vertical bar in the accent color at 40% opacity (becomes 80% when `active`)
- Props: `accent: string`, `active?: boolean`, `intense?: boolean`
- Pointer-events none; respects `prefers-reduced-motion` (disables scanline animation)

### 2. Tailwind keyframe
Add to `tailwind.config.ts`:
```
"scanline-drift": { "0%": { transform: "translateY(-25%)" }, "100%": { transform: "translateY(25%)" } }
```
and `animation: "scanline-drift": "scanline-drift 7s linear infinite"`.

### 3. Wire into the left rail
In `src/pages/Index.tsx` (the `SPHERE_ARRAY.map` button):
- Wrap each button content with `relative overflow-hidden rounded-lg`
- Render `<SpherePanelBackdrop accent={sphere.color} active={hovered} />` behind children
- Bump row padding slightly (`py-2.5 px-2`) so the new backdrop has breathing room
- Remove the flat `hover:bg-foreground/[0.03]` (backdrop now handles hover via `group-hover` intensifier)

### 4. Wire into the detail page header
In `src/pages/SphereDetail.tsx`:
- Replace the header `glass-panel` background with the same component:
  ```
  <header className="relative overflow-hidden ...">
    <SpherePanelBackdrop accent={sphere.color} active intense />
    <div className="relative z-10 flex items-center ...">...</div>
  </header>
  ```
- Keep existing inner layout untouched.

### 5. QA
- Visit `/` and confirm rail rows have grid + scanlines, hover brightens accent edge.
- Click into a sphere; confirm header shows the same treatment with stronger accent.
- Reduced motion: scanline animation stops.

## Out of scope
- No changes to typography, icon, sparkline, or COHERENCE value rendering.
- No global theme/token changes — colors stay HSL accent-driven.
- No changes to right Sphere Signals rail (different surface).