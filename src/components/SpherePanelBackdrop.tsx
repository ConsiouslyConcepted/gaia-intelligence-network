interface Props {
  accent: string;
  active?: boolean;
  intense?: boolean;
}

/**
 * Layered HUD backdrop for sphere "panels" — translucent glass + accent grid + scanline drift.
 * Place inside a `relative overflow-hidden` parent; render real content above with z-index.
 */
export function SpherePanelBackdrop({ accent, active = false, intense = false }: Props) {
  const tintOpacity = intense ? 0.18 : active ? 0.12 : 0.07;
  const gridOpacity = intense ? 0.18 : active ? 0.14 : 0.09;
  const edgeOpacity = intense ? 0.9 : active ? 0.7 : 0.35;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
      {/* Base glass */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(145deg, hsla(240,22%,12%,0.88) 0%, hsla(240,26%,8%,0.92) 55%, hsla(240,30%,5%,0.95) 100%)",
          boxShadow:
            "inset 0 1px 0 hsla(0,0%,100%,0.06), inset 0 -1px 0 hsla(0,0%,0%,0.35)",
        }}
      />

      {/* Accent tint wash — radial from upper-left near the icon */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(120% 90% at 12% 30%, ${accent}${Math.round(
            tintOpacity * 255,
          )
            .toString(16)
            .padStart(2, "0")} 0%, transparent 65%)`,
        }}
      />

      {/* Grid texture — masked toward the accent origin */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${accent}33 1px, transparent 1px),
            linear-gradient(to bottom, ${accent}33 1px, transparent 1px)
          `,
          backgroundSize: "16px 16px",
          opacity: gridOpacity,
          WebkitMaskImage:
            "radial-gradient(120% 90% at 12% 50%, #000 0%, rgba(0,0,0,0.4) 55%, transparent 90%)",
          maskImage:
            "radial-gradient(120% 90% at 12% 50%, #000 0%, rgba(0,0,0,0.4) 55%, transparent 90%)",
        }}
      />

      {/* Scanlines — slow drift */}
      <div
        className="absolute -inset-y-1/2 inset-x-0 motion-safe:animate-scanline-drift"
        style={{
          backgroundImage: `repeating-linear-gradient(to bottom, hsla(0,0%,100%,${scanOpacity}) 0px, hsla(0,0%,100%,${scanOpacity}) 1px, transparent 1px, transparent 3px)`,
        }}
      />

      {/* Accent left edge */}
      <div
        className="absolute left-0 top-1.5 bottom-1.5 w-px transition-opacity duration-300"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, ${accent} 25%, ${accent} 75%, transparent 100%)`,
          opacity: edgeOpacity,
          boxShadow: `0 0 8px ${accent}66`,
        }}
      />

      {/* Subtle outer border */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        style={{
          border: `1px solid hsla(0,0%,100%,${intense ? 0.1 : 0.06})`,
        }}
      />
    </div>
  );
}
