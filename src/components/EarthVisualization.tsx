import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Html, Stars } from "@react-three/drei";
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

/** Core sphere with solid, lit surface */
const CoreSphere = ({
  layer,
  onClick,
}: {
  layer: SphereLayer;
  onClick: (id: string) => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group>
      <Sphere
        ref={meshRef}
        args={[layer.radius, 128, 128]}
        onClick={() => onClick(layer.id)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={layer.color}
          emissive={layer.color}
          emissiveIntensity={hovered ? 0.35 : 0.12}
          roughness={0.55}
          metalness={0.35}
        />
      </Sphere>
      {/* Atmosphere glow shell */}
      <Sphere args={[layer.radius * 1.03, 64, 64]}>
        <meshBasicMaterial
          color={layer.color}
          transparent
          opacity={hovered ? 0.12 : 0.05}
          side={THREE.BackSide}
        />
      </Sphere>
      {hovered && (
        <Html position={[0, layer.radius + 0.3, 0]} center>
          <div
            className="backdrop-blur-md rounded-lg text-xs text-foreground/90 whitespace-nowrap pointer-events-none px-3 py-1.5 border"
            style={{
              background: `linear-gradient(135deg, ${layer.color}25, ${layer.color}08)`,
              borderColor: `${layer.color}40`,
              boxShadow: `0 0 16px ${layer.color}25`,
            }}
          >
            {layer.name}
          </div>
        </Html>
      )}
    </group>
  );
};

/** Outer shell spheres with wireframe + glow */
const ShellSphere = ({
  layer,
  onClick,
}: {
  layer: SphereLayer;
  onClick: (id: string) => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const wireRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (wireRef.current) {
      wireRef.current.rotation.y = t * 0.06 * (2 / layer.radius);
      wireRef.current.rotation.x = Math.sin(t * 0.03) * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y = t * 0.04 * (2 / layer.radius);
    }
  });

  return (
    <group>
      {/* Wireframe shell */}
      <Sphere
        ref={wireRef}
        args={[layer.radius, 32, 32]}
        onClick={() => onClick(layer.id)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshBasicMaterial
          color={layer.color}
          wireframe
          transparent
          opacity={hovered ? layer.opacity * 2.5 : layer.opacity * 1.2}
        />
      </Sphere>
      {/* Inner glow volume */}
      <Sphere ref={glowRef} args={[layer.radius * 0.98, 32, 32]}>
        <meshBasicMaterial
          color={layer.color}
          transparent
          opacity={hovered ? 0.06 : 0.015}
          side={THREE.BackSide}
        />
      </Sphere>
      {hovered && (
        <Html position={[0, layer.radius + 0.25, 0]} center>
          <div
            className="backdrop-blur-md rounded-lg text-xs text-foreground/90 whitespace-nowrap pointer-events-none px-3 py-1.5 border"
            style={{
              background: `linear-gradient(135deg, ${layer.color}25, ${layer.color}08)`,
              borderColor: `${layer.color}40`,
              boxShadow: `0 0 16px ${layer.color}25`,
            }}
          >
            {layer.name}
          </div>
        </Html>
      )}
    </group>
  );
};

/** Orbital ring accent */
const OrbitalRing = ({ radius, color }: { radius: number; color: string }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.15) * 0.15;
      ref.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.003, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.2} />
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
        camera={{ position: [0, 0, 5.5], fov: 50 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.2;
        }}
      >
        {/* Rich warm lighting setup */}
        <ambientLight intensity={0.08} color="#d4a56a" />
        <directionalLight position={[5, 5, 5]} intensity={1.0} color="#e8c86a" />
        <pointLight position={[-4, -3, -4]} intensity={0.25} color="#4488cc" />
        <pointLight position={[0, 6, 2]} intensity={0.15} color="#c8b070" />

        {/* Starfield */}
        <Stars radius={80} depth={60} count={2000} factor={3} saturation={0.1} fade speed={0.5} />

        {/* Orbital accent rings */}
        <OrbitalRing radius={2.2} color="#d4a56a" />
        <OrbitalRing radius={1.45} color="#4488cc" />

        {/* Render spheres */}
        {sphereLayers.map((layer) =>
          layer.radius <= 1 ? (
            <CoreSphere key={layer.name} layer={layer} onClick={handleSphereClick} />
          ) : (
            <ShellSphere key={layer.name} layer={layer} onClick={handleSphereClick} />
          )
        )}

        <OrbitControls
          enableZoom
          enablePan={false}
          minDistance={2.5}
          maxDistance={10}
          autoRotate
          autoRotateSpeed={0.25}
          dampingFactor={0.05}
          enableDamping
        />
      </Canvas>
    </div>
  );
};
