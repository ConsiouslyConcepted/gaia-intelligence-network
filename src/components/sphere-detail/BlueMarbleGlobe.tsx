import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import { SphereId } from "@/types/spheres";

const EARTH_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg";
const BUMP_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png";

/**
 * Real NASA equirectangular overlays for each sphere.
 * Source: NASA Earth Observations (NEO) — public domain.
 */
const SPHERE_OVERLAYS: Record<string, { url: string; opacity: number; blending: THREE.Blending }> = {
  geosphere: {
    url: "/overlays/geosphere-overlay.jpg",
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  },
  biosphere: {
    url: "/overlays/biosphere-overlay.jpg",
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  },
  noosphere: {
    url: "/overlays/noosphere-overlay.jpg",
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  },
  magnetosphere: {
    url: "/overlays/magnetosphere-overlay.jpg",
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  },
  ionosphere: {
    url: "/overlays/ionosphere-overlay.jpg",
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  },
  crystalsphere: {
    url: "/overlays/crystalsphere-overlay.jpg",
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  },
};

const SPHERE_COLORS: Record<string, string> = {
  geosphere: "#cc5533",
  biosphere: "#7ecbcb",
  noosphere: "#d4a56a",
  magnetosphere: "#4466dd",
  ionosphere: "#4488cc",
  crystalsphere: "#e8c86a",
};

// ─── Base Earth mesh ───

function GlobeMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [earthMap, bumpMap] = useLoader(TextureLoader, [EARTH_TEX, BUMP_TEX]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.8, 64, 64]} />
      <meshPhongMaterial
        map={earthMap}
        bumpMap={bumpMap}
        bumpScale={0.03}
        specular={new THREE.Color("#334466")}
        shininess={8}
      />
    </mesh>
  );
}

// ─── NASA overlay sphere ───

function NASAOverlay({ sphereId }: { sphereId: SphereId }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const overlay = SPHERE_OVERLAYS[sphereId];

  const overlayTex = useLoader(TextureLoader, overlay.url);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.805, 64, 64]} />
      <meshBasicMaterial
        map={overlayTex}
        transparent
        opacity={overlay.opacity}
        blending={overlay.blending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Atmosphere glow ───

function AtmosphereGlow({ color }: { color: string }) {
  return (
    <mesh>
      <sphereGeometry args={[1.92, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.06}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// ─── Main component ───

interface BlueMarbleGlobeProps {
  height?: number;
  sphereId?: SphereId;
}

export const BlueMarbleGlobe = ({ height = 340, sphereId }: BlueMarbleGlobeProps) => {
  const accentColor = sphereId ? SPHERE_COLORS[sphereId] || "#4488cc" : "#4488cc";

  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 45 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.6;
        }}
      >
        <ambientLight intensity={0.5} color="#ffffff" />
        <directionalLight position={[5, 3, 5]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[-3, -2, -4]} intensity={0.6} color="#88aaff" />
        <pointLight position={[0, 4, 3]} intensity={0.5} color="#ffffff" />
        <GlobeMesh />
        {sphereId && <NASAOverlay sphereId={sphereId} />}
        <AtmosphereGlow color={accentColor} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          dampingFactor={0.05}
          enableDamping
        />
      </Canvas>
    </div>
  );
};
