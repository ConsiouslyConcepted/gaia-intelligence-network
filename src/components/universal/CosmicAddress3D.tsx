import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Billboard, Text, Line } from "@react-three/drei";
import * as THREE from "three";

/**
 * Top-down view of the Milky Way with labeled spiral arms, distance rings
 * (in light-years from galactic center), and a marker for our Solar System.
 * Designed to echo the static reference illustration it replaces.
 */

// Galactic disk radius (in scene units). ~50,000 ly ≈ disk radius.
const DISK_R = 2.2;
// Light-year → scene units conversion
const LY = DISK_R / 50000;

// Spiral arms — logarithmic spirals. pitch ~ 12°.
type ArmDef = {
  id: string;
  name: string;
  color: string;
  phase: number;        // starting angle (radians)
  labelR: number;       // ly from center for label placement
  labelAngle: number;   // radians
};

const ARMS: ArmDef[] = [
  { id: "perseus",  name: "Perseus Arm",            color: "#bcd6ff", phase: 0.0,           labelR: 42000, labelAngle: Math.PI * 1.05 },
  { id: "carina",   name: "Carina–Sagittarius Arm", color: "#cfe3ff", phase: Math.PI * 0.5, labelR: 38000, labelAngle: Math.PI * 0.55 },
  { id: "cygnus",   name: "Cygnus Arm",             color: "#7fd9ff", phase: Math.PI * 1.0, labelR: 45000, labelAngle: Math.PI * 1.65 },
  { id: "norma",    name: "Norma Arm",              color: "#a8c2ff", phase: Math.PI * 1.5, labelR: 28000, labelAngle: Math.PI * 1.85 },
  { id: "crux",     name: "Crux–Scutum Arm",        color: "#bcd6ff", phase: Math.PI * 0.25,labelR: 34000, labelAngle: Math.PI * 0.05 },
  { id: "orion",    name: "Local / Orion Arm",      color: "#e8c98a", phase: Math.PI * 0.75,labelR: 30000, labelAngle: Math.PI * 1.35 },
];

const PITCH = (12 * Math.PI) / 180; // arm pitch angle

// Logarithmic spiral: r = a * e^(b*θ). Solve so r(θ=0) ~ 4000 ly, reaching ~50000 ly.
const B = 1 / Math.tan(PITCH);
const A = 4000;

function spiralPoint(theta: number, phase: number) {
  const r = A * Math.exp((theta / 18) * B * 0.18);
  const ang = theta + phase;
  return { rLy: r, x: Math.cos(ang) * r * LY, z: Math.sin(ang) * r * LY };
}

// ───────── Bulge: glowing yellow-white core ─────────
const GalacticCore = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.04; });
  return (
    <group>
      {/* Inner hot core */}
      <mesh>
        <sphereGeometry args={[0.16, 32, 32]} />
        <meshBasicMaterial color="#fff7d6" />
      </mesh>
      {/* Mid bulge */}
      <mesh scale={[1, 0.35, 1]}>
        <sphereGeometry args={[0.36, 48, 32]} />
        <meshBasicMaterial color="#f6d77a" transparent opacity={0.55} />
      </mesh>
      {/* Outer halo */}
      <mesh ref={ref} scale={[1, 0.18, 1]}>
        <sphereGeometry args={[0.62, 64, 32]} />
        <meshBasicMaterial color="#d99a3a" transparent opacity={0.18} />
      </mesh>
      {/* Soft glow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, 0.95, 64]} />
        <meshBasicMaterial color="#f3c97a" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// ───────── Arm: particle field along a log spiral ─────────
const Arm = ({ arm, hovered, setHovered }: { arm: ArmDef; hovered: string | null; setHovered: (id: string | null) => void }) => {
  const groupRef = useRef<THREE.Group>(null);

  const { positions, colors } = useMemo(() => {
    const COUNT = 1400;
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const base = new THREE.Color(arm.color);
    for (let i = 0; i < COUNT; i++) {
      // Parameter along arm
      const t = Math.pow(Math.random(), 0.6) * 18; // theta
      const { x, z, rLy } = spiralPoint(t, arm.phase);
      // Jitter perpendicular to arm
      const tangentAng = t + arm.phase + Math.PI / 2;
      const spread = (1 - Math.exp(-rLy / 20000)) * 0.18 + 0.03;
      const j = (Math.random() - 0.5) * spread;
      const jx = Math.cos(tangentAng) * j;
      const jz = Math.sin(tangentAng) * j;
      // Vertical thickness — thin disk
      const y = (Math.random() - 0.5) * 0.04;
      pos[i * 3 + 0] = x + jx;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z + jz;
      // Brightness falls off with radius
      const brightness = 0.55 + Math.random() * 0.45;
      col[i * 3 + 0] = base.r * brightness;
      col[i * 3 + 1] = base.g * brightness;
      col[i * 3 + 2] = base.b * brightness;
    }
    return { positions: pos, colors: col };
  }, [arm.color, arm.phase]);

  const isHover = hovered === arm.id;
  const dim = hovered !== null && !isHover;

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(arm.id); }}
      onPointerOut={() => setHovered(null)}
    >
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={isHover ? 0.028 : 0.018}
          vertexColors
          transparent
          opacity={dim ? 0.25 : isHover ? 1 : 0.85}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

// ───────── Distance ring at given ly ─────────
const DistanceRing = ({ ly, label }: { ly: number; label: string }) => {
  const r = ly * LY;
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push([Math.cos(a) * r, 0, Math.sin(a) * r]);
    }
    return pts;
  }, [r]);
  return (
    <group>
      <Line points={points} color="#7fa8d8" transparent opacity={0.35} lineWidth={0.6} />
      <Billboard position={[0, 0.02, r + 0.04]}>
        <Text fontSize={0.07} color="#a8c0e0" anchorX="center" anchorY="middle" fillOpacity={0.7} outlineWidth={0.003} outlineColor="#000">
          {label}
        </Text>
      </Billboard>
    </group>
  );
};

// ───────── Solar System marker (~26,000 ly from center, in Orion Arm) ─────────
const SolarMarker = () => {
  const pulse = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (pulse.current) {
      const t = s.clock.elapsedTime;
      const k = 1 + Math.sin(t * 2.2) * 0.35;
      pulse.current.scale.setScalar(k);
    }
  });
  // Position on Orion arm
  const { x, z } = spiralPoint(7.2, Math.PI * 0.75);
  // Snap to ~26,000 ly along its direction
  const len = Math.hypot(x, z);
  const targetR = 26000 * LY;
  const px = (x / len) * targetR;
  const pz = (z / len) * targetR;
  return (
    <group position={[px, 0.02, pz]}>
      <mesh ref={pulse}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#74b6e8" transparent opacity={0.5} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.022, 24, 24]} />
        <meshBasicMaterial color="#cfe6ff" />
      </mesh>
      <Billboard position={[0, 0.12, 0]}>
        <Text fontSize={0.075} color="#ffe9a8" anchorX="center" anchorY="bottom" outlineWidth={0.004} outlineColor="#000">
          ← OUR SOLAR SYSTEM
        </Text>
      </Billboard>
    </group>
  );
};

// ───────── Arm label ─────────
const ArmLabel = ({ arm, hovered, setHovered }: { arm: ArmDef; hovered: string | null; setHovered: (id: string | null) => void }) => {
  const r = arm.labelR * LY;
  const x = Math.cos(arm.labelAngle) * r;
  const z = Math.sin(arm.labelAngle) * r;
  const isHover = hovered === arm.id;
  return (
    <Billboard position={[x, 0.05, z]}>
      <Text
        fontSize={isHover ? 0.11 : 0.085}
        color={isHover ? "#fff" : arm.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#000"
        fillOpacity={hovered && !isHover ? 0.45 : 1}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(arm.id); }}
        onPointerOut={() => setHovered(null)}
      >
        {arm.name}
      </Text>
    </Billboard>
  );
};

// ───────── Background dust / faint stars within disk ─────────
const DiskHaze = () => {
  const positions = useMemo(() => {
    const COUNT = 2200;
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = Math.pow(Math.random(), 0.7) * DISK_R * 1.05;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3 + 0] = Math.cos(a) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.06;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    return pos;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        color="#9fb8d8"
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const Scene = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <>
      <ambientLight intensity={0.6} />
      <GalacticCore />
      <DiskHaze />
      {ARMS.map((arm) => (
        <Arm key={arm.id} arm={arm} hovered={hovered} setHovered={setHovered} />
      ))}

      {/* Distance rings — light-year scale */}
      <DistanceRing ly={10000} label="10,000 ly" />
      <DistanceRing ly={20000} label="20,000 ly" />
      <DistanceRing ly={30000} label="30,000 ly" />
      <DistanceRing ly={40000} label="40,000 ly" />

      <SolarMarker />

      {ARMS.map((arm) => (
        <ArmLabel key={arm.id + "-label"} arm={arm} hovered={hovered} setHovered={setHovered} />
      ))}

      <Billboard position={[0, -DISK_R - 0.25, 0]}>
        <Text fontSize={0.085} color="#ffffff" anchorX="center" fillOpacity={0.55} letterSpacing={0.12}>
          MILKY WAY · YOU ARE HERE
        </Text>
      </Billboard>
    </>
  );
};

export const CosmicAddress3D = () => {
  return (
    <Canvas
      // Tilted angle echoes the reference illustration
      camera={{ position: [0, 2.4, 3.6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene />
      <OrbitControls
        enablePan={false}
        minDistance={2.2}
        maxDistance={7}
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.48}
        rotateSpeed={0.55}
        autoRotate
        autoRotateSpeed={0.25}
      />
    </Canvas>
  );
};
