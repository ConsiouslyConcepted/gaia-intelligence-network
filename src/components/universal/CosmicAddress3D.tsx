import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

const LEVELS = [
  { name: "Earth", scale: "12,742 km", r: 0.18, hue: 200 },
  { name: "Solar System", scale: "~9 Bn km", r: 0.32, hue: 45 },
  { name: "Local Cloud", scale: "~30 ly", r: 0.46, hue: 190 },
  { name: "Local Bubble", scale: "~300 ly", r: 0.6, hue: 210 },
  { name: "Orion Arm", scale: "~3,500 ly", r: 0.78, hue: 220 },
  { name: "Milky Way", scale: "~100k ly", r: 0.98, hue: 230 },
  { name: "Local Group", scale: "~10 Mly", r: 1.2, hue: 250 },
  { name: "Virgo Supercluster", scale: "~110 Mly", r: 1.45, hue: 270 },
  { name: "Laniakea", scale: "~520 Mly", r: 1.72, hue: 290 },
  { name: "Observable Universe", scale: "~93 Gly", r: 2.05, hue: 310 },
];

const Shell = ({ r, hue, idx, hovered, setHovered }: { r: number; hue: number; idx: number; hovered: number | null; setHovered: (i: number | null) => void }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * (0.04 + idx * 0.008) * (idx % 2 ? 1 : -1);
      ref.current.rotation.x += dt * 0.01;
    }
  });
  const isHover = hovered === idx;
  const color = new THREE.Color(`hsl(${hue}, ${isHover ? 80 : 55}%, ${isHover ? 78 : 65}%)`);
  return (
    <mesh
      ref={ref}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(idx); }}
      onPointerOut={() => setHovered(null)}
    >
      <sphereGeometry args={[r, 48, 32]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={isHover ? 0.55 : 0.22} />
    </mesh>
  );
};

const EarthDot = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.3; });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.05, 24, 24]} />
      <meshStandardMaterial color="#74b6e8" emissive="#3a7fc2" emissiveIntensity={0.8} />
    </mesh>
  );
};

const Scene = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#74b6e8" distance={3} />
      <EarthDot />
      {LEVELS.map((lvl, i) => (
        <Shell key={lvl.name} r={lvl.r} hue={lvl.hue} idx={i} hovered={hovered} setHovered={setHovered} />
      ))}
      {LEVELS.map((lvl, i) => {
        const isHover = hovered === i;
        return (
          <Billboard key={lvl.name} position={[0, lvl.r + 0.06, 0]}>
            <Text
              fontSize={isHover ? 0.085 : 0.062}
              color={isHover ? "#f3c97a" : "#cfd9e8"}
              anchorX="center"
              anchorY="bottom"
              outlineWidth={0.004}
              outlineColor="#000000"
              fillOpacity={isHover ? 1 : 0.65}
            >
              {lvl.name.toUpperCase()}
            </Text>
            {isHover && (
              <Text
                position={[0, -0.04, 0]}
                fontSize={0.05}
                color="#a8b8cc"
                anchorX="center"
                anchorY="top"
                outlineWidth={0.003}
                outlineColor="#000000"
              >
                {lvl.scale}
              </Text>
            )}
          </Billboard>
        );
      })}
      <Billboard position={[0, -2.45, 0]}>
        <Text fontSize={0.08} color="#ffffff" anchorX="center" fillOpacity={0.55}>
          YOU ARE HERE
        </Text>
      </Billboard>
    </>
  );
};

export const CosmicAddress3D = () => {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 4.5], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene />
      <OrbitControls
        enablePan={false}
        minDistance={1.5}
        maxDistance={9}
        rotateSpeed={0.6}
        autoRotate
        autoRotateSpeed={0.35}
      />
    </Canvas>
  );
};
