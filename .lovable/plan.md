# Seasons & Cycles — Implementation Plan

Tie Earth's seasonal cycle into the live ephemeris already powering Transits, then surface the ecological consequences on the Biosphere page. Both panels read from the same `astronomy-engine` source — no new data dependencies.

## 1. Shared seasonal engine

New file: `src/lib/astrology/seasons.ts`

Pure functions derived from the Sun's geocentric ecliptic longitude (already computed in `src/lib/astrology/ephemeris.ts`):

- `getSolarLongitude(date)` — reuses ephemeris Sun position
- `getSeasonalPhase(date)` — returns `{ season, hemisphere, nextStation, daysUntil, progressInSeason }` where stations are the 8 wheel-of-the-year points (4 cardinal + 4 cross-quarter)
- `getDayLength(date, latitude)` — civil day length at a reference latitude (default 0°, user-toggleable to 45°N/S)
- `getSunDeclination(date)` — for visualising axial tilt effect
- `getEarthOrbitalPosition(date)` — true anomaly + distance to perihelion/aphelion
- `getCarbonFluxSign(date, hemisphere)` — sign-only proxy: NH drawdown Apr–Sep, release Oct–Mar; inverse for SH

Station table (longitude-based, not date-based, so it stays correct across years):
- 0° Aries → March Equinox (Ostara)
- 45° Taurus → Beltane
- 90° Cancer → June Solstice (Litha)
- 135° Leo → Lughnasadh
- 180° Libra → September Equinox (Mabon)
- 225° Scorpio → Samhain
- 270° Capricorn → December Solstice (Yule)
- 315° Aquarius → Imbolc

## 2. Wheel of the Year ring — HGS Transits view

Edit: `src/components/astrology/AstrologyChart.tsx` (or wrap it; pick whichever is cleaner once read)

Add a concentric ring outside the existing zodiac band:

- 8 tick marks at the station longitudes with glyph + name on hover
- Highlighted arc between previous and next station showing current position
- Subtle seasonal tint to the arc segment (spring/summer/autumn/winter) — kept within the monochromatic palette using opacity rather than hue, except the existing astrology cream/gold (per memory exception)
- Small marker on the Sun's current longitude that doubles as a "you are here" indicator

New sidebar block in `src/components/astrology/TransitsPanel.tsx` or `ZodiacSidebar.tsx`:
- Current season, hemisphere selector (N/S)
- Solar longitude (e.g. "76° 12′")
- Next station + days until
- Day length at selected reference latitude

## 3. Seasonal Response card — Biosphere page

New file: `src/components/sphere-detail/SeasonalResponseCard.tsx`

Rendered inside the Biosphere live state (`src/components/sphere-detail/live-state/BiosphereLiveState.tsx`) as an additional card.

Contents:
- Mini wheel-of-year strip (linear, not circular) showing current position between stations
- Hemispheric NDVI phase indicator (growing / peak / senescing / dormant) derived from solar longitude + hemisphere
- Carbon flux sign chip ("Drawdown" vs "Release") with caveat that it's a phase proxy, not a measured value
- Day length at 45°N and 45°S side by side
- Sun declination + Earth–Sun distance (perihelion/aphelion context)
- One-line caption tying it back: "Axial tilt + orbital position → insolation → photosynthesis phase"

## 4. Cross-quarter cultural layer

Stations include both astronomical name (e.g. "June Solstice") and traditional name (e.g. "Litha"). Cultural names appear on hover/secondary text so the primary read stays scientific. No separate UI.

## 5. Honesty & observability

- Everything computed locally from `astronomy-engine` — consistent with the Transits panel
- Carbon flux and NDVI phase are labelled as **phase proxies** (derived from solar geometry, not measured), matching the project's read-only observability stance
- No new external API dependencies

## Technical notes

- `astronomy-engine` already in deps; `Astronomy.Seasons(year)` gives exact equinox/solstice timestamps — use as ground truth for the 4 cardinal points and interpolate cross-quarters from solar longitude
- Reuse existing color tokens; no new palette entries
- Hemisphere toggle persists in component state only (no global store change)

## Files touched

- New: `src/lib/astrology/seasons.ts`
- New: `src/components/sphere-detail/SeasonalResponseCard.tsx`
- Edit: `src/components/astrology/AstrologyChart.tsx` — add outer ring
- Edit: `src/components/astrology/TransitsPanel.tsx` or `ZodiacSidebar.tsx` — add seasonal block
- Edit: `src/components/sphere-detail/live-state/BiosphereLiveState.tsx` — mount new card
