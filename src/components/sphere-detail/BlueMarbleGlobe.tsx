import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";

const EARTH_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg";
const BUMP_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png";

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

export const BlueMarbleGlobe = ({ height = 340 }: { height?: number }) => (
  <div style={{ height }} className="w-full rounded-xl overflow-hidden">
    <Canvas
      camera={{ position: [0, 0, 4.8], fov: 45 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={({ gl }) => { gl.toneMappingExposure = 1.6; }}
    >
      <ambientLight intensity={0.5} color="#ffffff" />
      <directionalLight position={[5, 3, 5]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[-3, -2, -4]} intensity={0.6} color="#88aaff" />
      <pointLight position={[0, 4, 3]} intensity={0.5} color="#ffffff" />
      <GlobeMesh />
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
