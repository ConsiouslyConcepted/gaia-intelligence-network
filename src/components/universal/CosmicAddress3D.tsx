import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Billboard, Text, Line } from "@react-three/drei";
import * as THREE from "three";

/**
 * Procedural recreation of the reference Milky Way illustration:
 * tilted top-down view with a bright yellow galactic bulge, blue spiral
 * arms of dust + stars, distance rings labeled in light-years from the
 * galactic center, and a marker for our Solar System on the Orion Arm.
 * Fully interactive — drag to orbit, scroll to zoom.
 */

// Galactic disk: ~50,000 ly radius mapped to scene units.
const DISK_R = 2.4;
const LY = DISK_R / 50000;

// ───────── Arm definitions ─────────
type ArmDef = {
  id: string;
  name: string;
  color: string;
  phase: number;        // starting angle offset
  labelR: number;       // ly from center
  labelAngle: number;   // radians (on-disk angle)
  bright?: boolean;     // cyan accent like "Cygnus Arm" in the reference
};

// Arm placements approximated from the reference plate.
const ARMS: ArmDef[] = [
  { id: "perseus", name: "Perseus Arm",            color: "#cfe0ff", phase: 0.0,                labelR: 44000, labelAngle: Math.PI * 1.04 },
  { id: "carina",  name: "Carina-Sagittarius Arm", color: "#d6e6ff", phase: Math.PI * 0.55,     labelR: 42000, labelAngle: Math.PI * 0.78 },
  { id: "cygnus",  name: "Cygnus Arm",             color: "#6fe3ff", phase: Math.PI * 1.05,     labelR: 46000, labelAngle: Math.PI * 0.32, bright: true },
  { id: "norma",   name: "Norma Arm",              color: "#bcd4ff", phase: Math.PI * 1.45,     labelR: 30000, labelAngle: Math.PI * 0.08 },
  { id: "crux",    name: "Crux-Scutum Arm",        color: "#cfe0ff", phase: Math.PI * 0.25,     labelR: 36000, labelAngle: Math.PI * 1.92 },
  { id: "orion",   name: "Local or Orion Arm",     color: "#e8d29a", phase: Math.PI * 0.78,     labelR: 32000, labelAngle: Math.PI * 1.55 },
];

// Logarithmic spiral helper. r = A * e^(B * θ).
const PITCH = (12 * Math.PI) / 180;
const B_COEF = 1 / Math.tan(PITCH);
const A_COEF = 2200;

function spiralPoint(theta: number, phase: number) {
  const rLy = A_COEF * Math.exp((theta * B_COEF) / 22);
  const ang = theta + phase;
  return { rLy, x: Math.cos(ang) * rLy * LY, z: Math.sin(ang) * rLy * LY };
}

// ───────── Galactic core: white-hot center, yellow bulge, soft halo ─────────
const GalacticCore = () => {
  const haloRef = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (haloRef.current) haloRef.current.rotation.y += dt * 0.03; });
  return (
    <group>
      {/* White-hot nucleus */}
      <mesh>
        <sphereGeometry args={[0.14, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Yellow bulge (flattened ellipsoid) */}
      <mesh scale={[1, 0.35, 1]}>
        <sphereGeometry args={[0.34, 48, 32]} />
        <meshBasicMaterial color="#fde08a" transparent opacity={0.78} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Orange outer bulge */}
      <mesh scale={[1, 0.28, 1]}>
        <sphereGeometry args={[0.55, 48, 32]} />
        <meshBasicMaterial color="#e9a44a" transparent opacity={0.38} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Soft disc halo */}
      <mesh ref={haloRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, 1.05, 96]} />
        <meshBasicMaterial color="#f3c97a" transparent opacity={0.09} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

// ───────── Spiral arm: bright lane + dust + scattered stars ─────────
const Arm = ({ arm, hovered, setHovered }: { arm: ArmDef; hovered: string | null; setHovered: (id: string | null) => void }) => {
  const { positions, colors } = useMemo(() => {
    const COUNT = 1700;
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const base = new THREE.Color(arm.color);
    for (let i = 0; i < COUNT; i++) {
      // theta sampled with bias toward outer disk (so arms read clearly outside the bulge)
      const t = 1.2 + Math.pow(Math.random(), 0.55) * 14;
      const { x, z, rLy } = spiralPoint(t, arm.phase);
      // perpendicular jitter — wider with radius
      const tangentAng = t + arm.phase + Math.PI / 2;
      const spread = (1 - Math.exp(-rLy / 18000)) * 0.22 + 0.025;
      const j = (Math.random() - 0.5) * spread;
      const jx = Math.cos(tangentAng) * j;
      const jz = Math.sin(tangentAng) * j;
      // Thin disk
      const y = (Math.random() - 0.5) * 0.045;
      pos[i * 3 + 0] = x + jx;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z + jz;
      // Color: brighter near arm core, dimmer at edges
      const edgeDist = Math.abs(j) / (spread / 2 + 1e-3);
      const brightness = (1 - edgeDist * 0.55) * (0.55 + Math.random() * 0.45);
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
      onPointerOver={(e) => { e.stopPropagation(); setHovered(arm.id); }}
      onPointerOut={() => setHovered(null)}
    >
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={isHover ? 0.03 : 0.02}
          vertexColors
          transparent
          opacity={dim ? 0.28 : isHover ? 1 : 0.9}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

// ───────── Distance ring (10k–40k ly) ─────────
const DistanceRing = ({ ly, label, labelAngle = Math.PI * 0.5 }: { ly: number; label: string; labelAngle?: number }) => {
  const r = ly * LY;
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      pts.push([Math.cos(a) * r, 0, Math.sin(a) * r]);
    }
    return pts;
  }, [r]);
  const lx = Math.cos(labelAngle) * r;
  const lz = Math.sin(labelAngle) * r;
  return (
    <group>
      <Line points={points} color="#9fc0e8" transparent opacity={0.35} lineWidth={0.8} />
      <Billboard position={[lx, 0.015, lz]}>
        <Text fontSize={0.072} color="#b8ccea" anchorX="center" anchorY="middle" fillOpacity={0.75} outlineWidth={0.003} outlineColor="#000">
          {label}
        </Text>
      </Billboard>
    </group>
  );
};

// ───────── Solar System marker on the Orion Arm (~26,000 ly out) ─────────
const SolarMarker = () => {
  const pulse = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (pulse.current) {
      const t = s.clock.elapsedTime;
      pulse.current.scale.setScalar(1 + Math.sin(t * 2.2) * 0.35);
    }
  });
  // Snap a point on the Orion arm to ~26,000 ly
  const { x, z } = spiralPoint(7.0, Math.PI * 0.78);
  const len = Math.hypot(x, z) || 1;
  const targetR = 26000 * LY;
  const px = (x / len) * targetR;
  const pz = (z / len) * targetR;
  return (
    <group position={[px, 0.02, pz]}>
      <mesh ref={pulse}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#74b6e8" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.022, 24, 24]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <Billboard position={[0.18, 0.05, 0]}>
        <Text fontSize={0.082} color="#ffffff" anchorX="left" anchorY="middle" outlineWidth={0.004} outlineColor="#000">
          ← Our Solar System
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
    <Billboard position={[x, 0.06, z]}>
      <Text
        fontSize={isHover ? 0.11 : 0.09}
        color={arm.bright ? "#5ee3ff" : "#ffffff"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#000"
        fillOpacity={hovered && !isHover ? 0.5 : 1}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(arm.id); }}
        onPointerOut={() => setHovered(null)}
      >
        {arm.name}
      </Text>
    </Billboard>
  );
};

// ───────── Background dust haze inside the disk ─────────
const DiskHaze = () => {
  const positions = useMemo(() => {
    const COUNT = 2400;
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
      <pointsMaterial size={0.012} color="#9fb8d8" transparent opacity={0.35} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};

// ───────── Far background stars ─────────
const Backdrop = () => {
  const positions = useMemo(() => {
    const COUNT = 900;
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      // Spread across a large sphere shell
      const u = Math.random() * 2 - 1;
      const t = Math.random() * Math.PI * 2;
      const r = 9 + Math.random() * 4;
      const s = Math.sqrt(1 - u * u);
      pos[i * 3 + 0] = Math.cos(t) * s * r;
      pos[i * 3 + 1] = u * r;
      pos[i * 3 + 2] = Math.sin(t) * s * r;
    }
    return pos;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.018} color="#dde6f5" transparent opacity={0.8} sizeAttenuation depthWrite={false} />
    </points>
  );
};

const Scene = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <>
      <ambientLight intensity={0.7} />
      <Backdrop />
      <DiskHaze />
      <GalacticCore />
      {ARMS.map((arm) => (
        <Arm key={arm.id} arm={arm} hovered={hovered} setHovered={setHovered} />
      ))}

      {/* Distance rings — light-years from galactic center */}
      <DistanceRing ly={10000} label="10,000" labelAngle={Math.PI * 1.55} />
      <DistanceRing ly={20000} label="20,000" labelAngle={Math.PI * 1.5} />
      <DistanceRing ly={30000} label="30,000" labelAngle={Math.PI * 1.48} />
      <DistanceRing ly={40000} label="40,000" labelAngle={Math.PI * 1.46} />

      <SolarMarker />

      {ARMS.map((arm) => (
        <ArmLabel key={arm.id + "-label"} arm={arm} hovered={hovered} setHovered={setHovered} />
      ))}
    </>
  );
};

export const CosmicAddress3D = () => {
  return (
    <Canvas
      // Tilted angle echoes the reference illustration
      camera={{ position: [0, 2.6, 3.4], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene />
      <OrbitControls
        enablePan={false}
        minDistance={2.4}
        maxDistance={7}
        minPolarAngle={Math.PI * 0.08}
        maxPolarAngle={Math.PI * 0.5}
        rotateSpeed={0.55}
        autoRotate
        autoRotateSpeed={0.2}
      />
    </Canvas>
  );
};
