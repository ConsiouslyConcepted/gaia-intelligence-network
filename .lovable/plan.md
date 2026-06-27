# Cross-Layer Harmonic Intelligence + AI Assistant

Extend the existing `/harmonics` Analysis page with two new capabilities. No changes to other dashboards.

## 1. Cross-Layer Comparison (new tab)

Add a new top-level mode on `/harmonics`:
- **Single Layer Analysis** (current behavior — spectrum, ladder, time series, correlation, spherical harmonics)
- **Cross-Layer Comparison** (new)

### Cross-Layer panel
- Two dataset pickers: **Layer A** and **Layer B**, each scoped by layer (Planetary / Solar / Stellar / Galactic / Cosmological) and drawing from the existing `datasets.ts` registry. Curated suggested pairings shown as quick-pick chips:
  - Solar magnetic field ↔ Earth magnetosphere (Kp)
  - Solar cycle (sunspots) ↔ Atmospheric CO₂ seasonal cycle
  - Orbital resonances ↔ Musical intervals
  - Stellar oscillations (Cepheid) ↔ Solar oscillations
  - Galactic vertical oscillation ↔ Heliospheric proxy
  - Planetary field coherence ↔ Solar activity
- Renders side-by-side:
  - Overlaid normalized time-series (z-scored)
  - Spectra overlay with shared peaks highlighted
  - Cross-correlation curve with best-lag readout (uses existing `crossCorrelation` from engine)
  - Period-ratio table → nearest small-integer ratio + nearest musical interval (uses existing `nearestRatio` / `nearestInterval`)
- **Evidence badge** on every comparison, one of:
  - `Measured` — both series come from direct observational sources
  - `Statistical` — correlation r above threshold across overlap
  - `Exploratory` — user-driven pairing, no significance claim
  Each dataset in `datasets.ts` gets a `provenance: "measured" | "modeled" | "synthetic"` tag; the badge is derived from the pair + computed |r|.

## 2. AI Harmonic Intelligence Assistant

A right-rail chat panel on `/harmonics` (collapsible). Single conversation, no persistence (in-memory for the session). The assistant is context-aware: every user turn is sent with a compact JSON snapshot of the current selection (mode, layer(s), dataset(s), top spectral peaks, best lag, ratio match).

### Capabilities (system prompt + tool calls)
- Explain the current harmonic pattern in plain language.
- Summarize current dynamics of selected layer.
- Flag emerging trends/anomalies (peaks above mean power, lag shifts).
- Compare two layers when in cross-layer mode.
- Generate daily / weekly / monthly harmonic intelligence report (button shortcuts inject canned prompts).
- Answer natural-language questions about any scale.
- Suggest additional datasets from the registry when patterns match.

### Backend
- New Supabase Edge Function `harmonic-assistant` using Lovable AI Gateway (`google/gemini-3-flash-preview`), AI SDK `streamText` + `toUIMessageStreamResponse`, CORS enabled.
- Server prompt encodes: read-only observatory framing, the three evidence tiers, the registry of available datasets, and a strict "no speculation beyond the data" rule.
- Client uses `@ai-sdk/react` `useChat` with `DefaultChatTransport` targeting the function URL. Messages render via `message.parts` with markdown.
- Requires Lovable Cloud — enable if not already on. Requires `LOVABLE_API_KEY` (auto-provisioned).

## Technical layout

```text
src/lib/harmonics/
  datasets.ts          # add `provenance` field to each entry
  engine.ts            # unchanged
  crossLayer.ts        # NEW: alignment + evidence classification helpers
src/components/harmonics/
  CrossLayerPanel.tsx  # NEW: dataset pair UI + overlaid charts
  AssistantPanel.tsx   # NEW: collapsible chat rail
src/pages/HarmonicsEngine.tsx  # add Single vs Cross mode toggle + assistant rail
supabase/functions/harmonic-assistant/index.ts  # NEW edge function
```

## Out of scope
- No changes to Planetary, Solar, Stellar, Galactic, Universal, Cosmological pages.
- No persisted chat history, no thread list (single in-memory conversation).
- No new real data feeds; uses existing deterministic series in `datasets.ts`.
- Daily/weekly/monthly reports are generated on demand via the assistant, not scheduled.

Approve to build.
