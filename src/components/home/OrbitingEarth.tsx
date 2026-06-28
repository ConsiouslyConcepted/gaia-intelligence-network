import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";

const EARTH_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg";
const BUMP_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png";

function GlobeScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [earthMap, bumpMap] = useLoader(TextureLoader, [EARTH_TEX, BUMP_TEX]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y = state.clock.elapsedTime * 0.04;
    }
  });

  const glowGeometry = useMemo(() => new THREE.SphereGeometry(1.95, 64, 64), []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 2, 5]} intensity={1.6} color="#ffffff" />
      <directionalLight position={[-3, -1, -4]} intensity={0.35} color="#4a90e2" />

      <mesh ref={meshRef}>
        <sphereGeometry args={[1.8, 128, 128]} />
        <meshPhongMaterial
          map={earthMap}
          bumpMap={bumpMap}
          bumpScale={0.03}
          specular={new THREE.Color("#334466")}
          shininess={8}
        />
      </mesh>

      <mesh ref={glowRef} geometry={glowGeometry}>
        <meshBasicMaterial
          color={new THREE.Color("#2d8a9e")}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}

export default function OrbitingEarth() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45, near: 0.1, far: 1000 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <GlobeScene />
      </Canvas>
    </div>
  );
}
