import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import { useState, useRef, useMemo } from "react";
import * as THREE from "three";
import { SPHERE_ARRAY } from "@/types/spheres";
import { useNavigate } from "react-router-dom";

interface SphereLayer {
  name: string;
  radius: number;
  color: string;
  opacity: number;
  id: string;
}

const InteractiveSphere = ({
  layer,
  onClick,
}: {
  layer: SphereLayer;
  onClick: (id: string) => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current && layer.radius > 1) {
      meshRef.current.rotation.y += delta * 0.08 * (1 / layer.radius);
    }
  });

  const isCore = layer.radius <= 1;

  return (
    <Sphere
      ref={meshRef}
      args={[layer.radius, 64, 64]}
      onClick={() => onClick(layer.id)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {isCore ? (
        <meshStandardMaterial
          color={layer.color}
          transparent
          opacity={hovered ? 0.95 : 0.85}
          emissive={layer.color}
          emissiveIntensity={hovered ? 0.4 : 0.15}
          roughness={0.6}
          metalness={0.3}
        />
      ) : (
        <meshPhysicalMaterial
          color={layer.color}
          transparent
          opacity={hovered ? layer.opacity * 2 : layer.opacity}
          side={THREE.DoubleSide}
          emissive={layer.color}
          emissiveIntensity={hovered ? 0.25 : 0.06}
          wireframe
          roughness={0.8}
          metalness={0.1}
          transmission={0.3}
        />
      )}
      {hovered && (
        <Html position={[0, layer.radius + 0.25, 0]} center>
          <div
            className="backdrop-blur-md rounded-lg text-xs text-foreground/90 whitespace-nowrap pointer-events-none px-3 py-1.5 border"
            style={{
              background: `linear-gradient(135deg, ${layer.color}20, ${layer.color}08)`,
              borderColor: `${layer.color}40`,
              boxShadow: `0 0 12px ${layer.color}20`,
            }}
          >
            {layer.name}
          </div>
        </Html>
      )}
    </Sphere>
  );
};

const StarField = () => {
  const positions = useMemo(() => {
    const count = 1500;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 30 + Math.random() * 70;
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = radius * Math.cos(phi);
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#c8b070"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
};

/** Subtle atmosphere glow ring */
const AtmosphereGlow = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.02;
    }
  });

  return (
    <mesh ref={meshRef}>
      <ringGeometry args={[2.05, 2.15, 64]} />
      <meshBasicMaterial
        color="#d4a56a"
        transparent
        opacity={0.08}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export const EarthVisualization = () => {
  const navigate = useNavigate();

  const sphereLayers: SphereLayer[] = SPHERE_ARRAY.map((s) => ({
    name: s.name,
    radius: s.radius,
    color: s.color,
    opacity: s.opacity,
    id: s.id,
  }));

  const handleSphereClick = (id: string) => {
    navigate(`/sphere/${id}`);
  };

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Warm cosmic lighting */}
        <ambientLight intensity={0.15} color="#e8c86a" />
        <pointLight position={[8, 6, 8]} intensity={1.2} color="#d4a56a" />
        <pointLight position={[-6, -4, -6]} intensity={0.3} color="#4488cc" />
        <pointLight position={[0, 8, 0]} intensity={0.2} color="#c8b070" />

        <StarField />
        <AtmosphereGlow />

        {sphereLayers.map((layer) => (
          <InteractiveSphere
            key={layer.name}
            layer={layer}
            onClick={handleSphereClick}
          />
        ))}

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
};
