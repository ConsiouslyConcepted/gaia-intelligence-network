import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

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

      {/* Moving starfield — identical params to EarthVisualization Stars */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 0.1], fov: 60 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
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
