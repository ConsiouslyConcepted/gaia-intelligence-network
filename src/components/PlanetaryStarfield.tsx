import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

export const PLANETARY_STARFIELD_CAMERA = {
  position: [0, 0, 7.5] as [number, number, number],
  fov: 50,
};

export const PLANETARY_STARFIELD_GL = {
  antialias: true,
  alpha: true,
  toneMapping: THREE.ACESFilmicToneMapping,
};

export const configurePlanetaryStarfieldRenderer = (gl: THREE.WebGLRenderer) => {
  gl.toneMappingExposure = 1.35;
};

/**
 * Mixed starfield: a dense static background layer (counter-rotates the camera
 * so it stays visually fixed) plus a slowly-moving foreground layer driven by
 * the camera's autoRotate. Produces the planetary page's signature look where
 * some stars drift while others appear pinned.
 */
export const PlanetaryStars = () => {
  const staticRef = useRef<THREE.Group>(null);

  // Counter-rotate to cancel the camera's autoRotate, keeping these stars fixed.
  useFrame((_, delta) => {
    if (staticRef.current) {
      // OrbitControls autoRotateSpeed of 0.25 ≈ 0.025 rad/s on the camera (yaw).
      // Rotate the group in the opposite direction at the same rate.
      staticRef.current.rotation.y -= 0.025 * delta;
    }
  });

  return (
    <>
      {/* Static background layer — dense, distant, pinned in place */}
      <group ref={staticRef}>
        <Stars
          radius={120}
          depth={40}
          count={4200}
          factor={2.6}
          saturation={0}
          fade
          speed={0}
        />
      </group>
      {/* Moving foreground layer — drifts with the camera autoRotate */}
      <Stars
        radius={80}
        depth={60}
        count={2400}
        factor={3.6}
        saturation={0.1}
        fade
        speed={0.5}
      />
    </>
  );
};

export const PlanetaryStarfieldMotion = () => (
  <>
    <PlanetaryStars />
    <OrbitControls
      enableZoom={false}
      enablePan={false}
      enableRotate={false}
      autoRotate
      autoRotateSpeed={0.25}
      dampingFactor={0.05}
      enableDamping
    />
  </>
);
