import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

/**
 * Global fixed night-sky background using the exact same Three.js starfield
 * treatment as the planetary dashboard.
 */
export const NightSkyBackground = () => {
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: -1,
        background:
          "radial-gradient(ellipse at 50% 40%, hsl(225 50% 8%) 0%, hsl(228 55% 5%) 55%, hsl(230 60% 3%) 100%)",
      }}
    >
      <Canvas
        className="absolute inset-0 h-full w-full"
        camera={{ position: [0, 0, 1], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.2;
        }}
      >
        <Stars radius={80} depth={60} count={2000} factor={3} saturation={0.1} fade speed={0.5} />
      </Canvas>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 58%, hsla(200,80%,40%,0.12) 0%, hsla(260,55%,30%,0.06) 42%, transparent 78%)",
        }}
      />
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
