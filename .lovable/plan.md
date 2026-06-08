# Keplerian Harmonic Configurations on the Transits Page

Make Book IV of *Harmonice Mundi* legible on the live astrology view: aspects shown as the **polygons that generate them**, tagged with their **musical-interval equivalents**, and ranked by **harmonic consonance**.

## What this adds

1. **Expanded Keplerian aspect set** — beyond the classical 5, include the aspects Kepler derived from harmonic polygons: semi-sextile (30°), semi-square (45°), quintile (72°), sesquiquadrate (135°), biquintile (144°), and quincunx (150°). Each carries: generating polygon, musical-interval ID, consonance weight, and tighter orbs for "minor" aspects.
2. **Polygon overlay on the wheel** — toggle-able layer that, for each active aspect, draws the generating regular polygon (triangle for trine, square for square, pentagon for quintile, hexagon for sextile, etc.) inscribed in the chart, anchored to the two planets forming the aspect.
3. **Musical-interval mapping in the sidebar** — each active aspect row shows its corresponding interval glyph + ratio (e.g. *Trine · △ · P5 · 3:2*), with consonant/dissonant tinting.
4. **Harmonic Field readout** — small panel in `TransitsPanel` showing aggregate consonance score, most-consonant active aspect, most-dissonant active aspect, and applying/separating indicator per aspect.

## Files

**New**
- `src/lib/astrology/harmonics.ts` — Keplerian aspect catalog with polygon sides, interval mapping (links to `INTERVALS` in `musicGeometry.ts`), consonance weights, and helper `scoreHarmonicField(aspects)`.

**Edited**
- `src/lib/astrology/constants.ts` — extend `ASPECTS` array with Keplerian additions (kept backward-compatible via additional metadata fields).
- `src/lib/astrology/ephemeris.ts` — `computeAspects` returns the richer aspect record (polygon, intervalId, applying/separating flag computed from a +1h sample).
- `src/components/astrology/AstrologyChart.tsx` — add an `<PolygonOverlay>` group rendered when `showPolygons` is true; draws the generating polygon for each active aspect using planet positions as polygon vertices (rotated copies around the chart center).
- `src/components/astrology/TransitsPanel.tsx` — add (a) a "Polygons" toggle, (b) a "Harmonic Field" block with aggregate score and best/worst aspect, and (c) per-aspect rows beneath the planet list showing aspect · polygon glyph · interval · orb · applying/separating arrow.

## Technical notes

- **Aspect catalog shape:** `{ name, angle, orb, color, polygonSides, intervalId, consonance: 0..1 }`. Orbs: majors keep current values; minors get tighter orbs (1.5–2°) so the chart doesn't get noisy.
- **Polygon rendering:** for an aspect at angle θ between planets A and B, the generating polygon has `n = 360/θ` sides; render the n-gon inscribed at `R_ASPECT` rotated so one vertex sits on planet A. Stroke uses the aspect color at low opacity (~0.25) with the active pair highlighted brighter.
- **Applying/separating:** sample positions at `t` and `t + 1h`; if |Δlongitude − exact aspect angle| shrinks, the aspect is applying.
- **Interval mapping** (initial table): conjunction→unison, opposition→P8 (2:1), trine→P5 (3:2), square→P4 (4:3), sextile→M6 (5:3), quintile→M3 (5:4), biquintile→m6 (8:5), semi-sextile→M2 (9:8), sesquiquadrate→tritone, quincunx→m7. Pulls ratio strings from existing `INTERVALS`.
- **Consonance weights** drive both the aggregate "Harmonic Field" score and a subtle tint (consonant = neutral warm, dissonant = cooler/desaturated) — stays within the monochromatic + cream/gold astrology palette.
- **Performance:** polygon overlay renders only for aspects within orb; capped to top-N tightest if needed.
- **No new dependencies.** No backend changes. Pure presentation layer on top of existing ephemeris.

## Out of scope (deferred)

- Right-click-to-play dyad audio on aspect lines (would extend `useChordPlayer`).
- "Today's chord" stacked-interval summary card.
- Polygon-of-the-day historical timeline.

Confirm and I'll implement.
