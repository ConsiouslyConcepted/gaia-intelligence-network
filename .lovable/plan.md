# Add Cross-Layer Living Network to the Harmonics Engine

Goal: When users switch to the **Cross-Layer** mode in the Harmonics Engine, show the same nested-shell harmonic-couplings visualization from Mission Control at the top of the section, followed by the existing dataset-pairing tool.

## Change

`src/pages/HarmonicsEngine.tsx` — Cross-Layer block (currently lines 502–513):

```text
[Cross-Layer Mode]
 ├── NEW: <CrossLayerWorkspace />        ← nested rings + selected coupling rail
 └── existing HudPanel
     ├── "Compare nested intelligence systems" header
     └── <CrossLayerPanel ... />          ← dataset A/B selectors + analysis
```

Implementation:
- Import `CrossLayerWorkspace` from `@/components/mission-control/CrossLayerWorkspace`.
- Render it inside a wrapping container above the existing `HudPanel`, with `mb-4` spacing.
- Keep the existing dataset-pairing UI unchanged below it.

## Notes

- `CrossLayerWorkspace` is self-contained (live correlations, window selector, anomaly toggle, selected-coupling detail panel) and already used in `/mission-control`. No prop changes required.
- Its internal `useNavigate` won't fire unless a user clicks a layer's "Open dashboard" link — safe to embed.
- No changes to the Single-Layer, Events, or Reports modes.
- No styling overrides; it inherits the engine's dark glass aesthetic.

## Out of scope (can do next if you want)

- Wiring a chord click in the rings to auto-fill Layer A / Layer B in the pairing panel below.
- Collapsible header to hide the network for users who only want the pairing tool.
