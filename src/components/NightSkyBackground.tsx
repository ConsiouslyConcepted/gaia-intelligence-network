import { Canvas } from "@react-three/fiber";
import {
  configurePlanetaryStarfieldRenderer,
  PLANETARY_STARFIELD_CAMERA,
  PLANETARY_STARFIELD_GL,
  PlanetaryStars,
} from "@/components/PlanetaryStarfield";

export const NightSkyBackground = () => {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: 0,
        background:
          "radial-gradient(ellipse at 50% 40%, hsl(225 50% 8%) 0%, hsl(228 55% 5%) 55%, hsl(230 60% 3%) 100%)",
      }}
    >
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at 50% 58%, hsla(190,60%,75%,0.07) 0%, hsla(190,60%,75%,0.02) 22%, transparent 38%)",
        }}
      />

      <div className="absolute inset-0">
        <Canvas
          camera={PLANETARY_STARFIELD_CAMERA}
          gl={PLANETARY_STARFIELD_GL}
          onCreated={({ gl }) => {
            configurePlanetaryStarfieldRenderer(gl);
          }}
        >
          <PlanetaryStars />
        </Canvas>
      </div>

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 26%, hsla(240,30%,3%,0.55) 72%, hsla(240,30%,3%,0.96) 100%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground) / 0.08) 2px, hsl(var(--foreground) / 0.08) 4px)",
        }}
      />

      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="nightSkyNoiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#nightSkyNoiseFilter)" opacity="0.75" />
        </svg>
      </div>
    </div>
  );
};
