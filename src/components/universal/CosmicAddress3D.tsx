import { useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import milkyWayAddress from "@/assets/milky-way-earth-location.jpg.asset.json";

/**
 * Interactive 3D presentation of the reference Milky Way illustration.
 * The original artwork is mapped onto a tilted plane so users can orbit,
 * zoom, and inspect it while it auto-rotates — preserving the exact
 * imagery (labeled arms, distance rings, solar-system marker) that the
 * static <img> used to show.
 */

const GalaxyPlane = () => {
  const tex = useLoader(THREE.TextureLoader, milkyWayAddress.url);
  // Preserve color fidelity and crispness
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.015;
  });

  // Match the source image aspect ratio (≈880 × 720)
  const W = 4.4;
  const H = (4.4 * 720) / 880;

  return (
    <group rotation={[-Math.PI / 2.4, 0, 0]}>
      <mesh ref={ref}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

export const CosmicAddress3D = () => {
  return (
    <Canvas
      camera={{ position: [0, 2.2, 3.6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={1} />
      <GalaxyPlane />
      <OrbitControls
        enablePan={false}
        minDistance={2.2}
        maxDistance={7}
        minPolarAngle={Math.PI * 0.05}
        maxPolarAngle={Math.PI * 0.5}
        rotateSpeed={0.55}
        autoRotate
        autoRotateSpeed={0.18}
      />
    </Canvas>
  );
};
