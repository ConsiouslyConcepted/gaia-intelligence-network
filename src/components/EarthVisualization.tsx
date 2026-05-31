import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import { useState, useRef, useMemo } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import { SPHERE_ARRAY } from "@/types/spheres";
import { useNavigate } from "react-router-dom";

interface SphereLayer {
  name: string;
  radius: number;
  color: string;
  opacity: number;
  id: string;
}

const EARTH_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg";
const BUMP_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png";

/** Core sphere with Blue Marble Earth texture */
const CoreSphere = ({
  layer,
  onClick,
}: {
  layer: SphereLayer;
  onClick: (id: string) => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const [earthMap, bumpMap] = useLoader(TextureLoader, [EARTH_TEX, BUMP_TEX]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={() => onClick(layer.id)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[layer.radius, 128, 128]} />
        <meshPhongMaterial
          map={earthMap}
          bumpMap={bumpMap}
          bumpScale={0.03}
          specular={new THREE.Color("#334466")}
          shininess={8}
        />
      </mesh>
      {/* Atmosphere glow shell — blue tint */}
      <Sphere args={[layer.radius * 1.03, 64, 64]}>
        <meshBasicMaterial
          color="#4488cc"
          transparent
          opacity={hovered ? 0.1 : 0.04}
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

  // Compress outer shell radii toward the core so all orbiting spheres stay fully visible
  const sphereLayers: SphereLayer[] = SPHERE_ARRAY.map((s) => ({
    name: s.name,
    radius: s.radius <= 1 ? s.radius : 1 + (s.radius - 1) * 0.6,
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
        camera={{ position: [0, 0, 7.5], fov: 50 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.2;
        }}
      >
        {/* Lighting: bright white directional for Blue Marble visibility */}
        <ambientLight intensity={0.35} color="#ffffff" />
        <directionalLight position={[5, 3, 5]} intensity={1.8} color="#ffffff" />
        <directionalLight position={[-3, -2, -4]} intensity={0.4} color="#88aaff" />
        <pointLight position={[0, 6, 2]} intensity={0.3} color="#ffffff" />

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
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate
          autoRotateSpeed={0.25}
          dampingFactor={0.05}
          enableDamping
        />
      </Canvas>
    </div>
  );
};
