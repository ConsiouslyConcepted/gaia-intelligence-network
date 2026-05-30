## Astrological Transits — Universal view

A second mode inside the Universal (HGS) dashboard that swaps the orbital-resonance field for a live astrological chart showing where the planets currently sit in the zodiac. A toggle in the top bar flips between **Harmonics** and **Transits**. A new left rail lists the 12 zodiac signs.

### What the user sees

**Top bar (Universal view only)**
A new pill toggle next to the title: `Harmonics ⇄ Transits`. Same glass styling as the existing pills.

**Harmonics mode (unchanged)**
Current OrbitalResonanceField + right Planetary Harmonics panel.

**Transits mode**
- Left rail: "Zodiac Signs" panel with the 12 signs. Each row shows the glyph, name, element color tint, and a small marker if a planet currently transits there.
- Center: the natal-style chart wheel.
- Right rail: replaces "Planetary Harmonics" with "Live Transits" — a list of each planet and the sign + degree it's currently in, plus a "today" timestamp.

**The chart wheel (hybrid of your two references)**
```text
              outer ring: 12 constellation names + tiny star-dot art
            ┌───────────────────────────────────┐
            │  sign band: cream ring, sign      │
            │  glyphs at 12 positions, degree   │
            │  ticks every 5° / 1°              │
            │   ┌─────────────────────────┐     │
            │   │ planet glyphs placed at │     │
            │   │ their real longitudes,  │     │
            │   │ aspect lines drawn      │     │
            │   │ across the inner disc   │     │
            │   └─────────────────────────┘     │
            └───────────────────────────────────┘
```
Pure SVG, monochromatic with subtle cream-gold accents allowed for the sign band (consistent with the wayfinding-hue exception).

### Interactions

- Click a sign in the left rail → that segment of the wheel glows and the right rail filters to planets currently in that sign.
- Click a planet glyph on the wheel → highlight its aspects (lines to other planets) and show its degree/sign in the right rail.
- Right-click a planet → plays its tone (reuses existing `usePlanetAudio`), matching the existing interaction rule.

### Live data

Use the `astronomy-engine` npm package (no API key, fully client-side) to compute current ecliptic longitudes for Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto. Recompute on mount and every 10 minutes. Convert longitude → sign + degree, and detect major aspects (conjunction, sextile, square, trine, opposition) within standard orbs.

### Technical details

- New file `src/components/astrology/AstrologyChart.tsx` — SVG wheel (outer constellation ring, sign band, planet layer, aspect layer).
- New file `src/components/astrology/ZodiacSidebar.tsx` — left rail listing the 12 signs.
- New file `src/components/astrology/TransitsPanel.tsx` — right rail planet/degree list.
- New file `src/lib/astrology/ephemeris.ts` — wraps `astronomy-engine` to return `{ planet, longitude, sign, degree, retrograde }[]` and computed aspects.
- New file `src/lib/astrology/constants.ts` — sign metadata (name, glyph, element, ruler, color hint, constellation polyline coords).
- Edit `src/components/hgs/HGSDashboard.tsx` — add `mode: "harmonics" | "transits"` state, render the new toggle in the top bar, and conditionally render either the existing OrbitalResonanceField + harmonics rails or the new astrology trio.
- Install `astronomy-engine`.
- All styling reuses the existing `HudPanel` and panel gradient tokens — no new design system.
- Memory: add a `mem://features/astrology` note describing the mode and add a Core line that Universal has two sub-modes (Harmonics, Transits).

### Out of scope

- Birth chart input form (not requested; can be added later by adding a date/time/location form that overrides "today").
- Houses / Ascendant calculation (requires location; deferred).
- Transit-to-natal comparisons.
