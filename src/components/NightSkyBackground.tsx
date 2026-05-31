import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

/**
 * Canonical planetary-dashboard backdrop.
 * This is the single source of truth used by every page so the background is
 * pixel-identical across Planetary, Universal, Galactic, and Cosmological.
 *
 * Layers (bottom to top):
 *  1. Radial base gradient
 *  2. Three.js moving starfield (same params as the planetary scene)
 *  3. Volumetric halo
 *  4. Vignette
 *  5. Scanlines
 *  6. Film grain
 */
export const NightSkyBackground = () => {
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: 0,
        background:
          "radial-gradient(ellipse at 50% 40%, hsl(225 50% 8%) 0%, hsl(228 55% 5%) 55%, hsl(230 60% 3%) 100%)",
      }}
    >
      {/* Moving starfield — exact params from EarthVisualization */}
      <Canvas
        className="absolute inset-0 h-full w-full"
        camera={{ position: [0, 0, 7.5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.2;
        }}
      >
        <Stars
          radius={80}
          depth={60}
          count={2000}
          factor={3}
          saturation={0.1}
          fade
          speed={0.5}
        />
      </Canvas>

      {/* Volumetric halo */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at 50% 58%, hsla(190,60%,75%,0.07) 0%, hsla(190,60%,75%,0.02) 22%, transparent 38%)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 26%, hsla(240,30%,3%,0.55) 72%, hsla(240,30%,3%,0.96) 100%)",
        }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground) / 0.08) 2px, hsl(var(--foreground) / 0.08) 4px)",
        }}
      />

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.75'/></svg>\")",
        }}
      />
    </div>
  );
};
