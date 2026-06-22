import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Text } from "@react-three/drei";
import * as THREE from "three";

/**
 * Interactive recreation of the "A Safe Location" Milky Way plate:
 * tilted three-quarter view of a barred spiral galaxy with labeled arms,
 * distance rings, degree ring, solar-system marker and orbit arc.
 * Fully procedural — no textures, no info boxes.
 */

// ─── Scale: galactic disk ~50,000 ly maps to scene units ───
const DISK_R = 2.6;
const LY = DISK_R / 50000;

// Overall galaxy tilt (matches the plate's bar orientation)
const GAL_ROT = -0.35;

// ─── Spiral arms (barred-spiral, logarithmic) ───
type ArmDef = {
  id: string;
  name: string;
  phase: number;         // starting angle of arm root at bar tip
  spin: 1 | -1;          // which bar tip it comes off
  pitchDeg: number;
  brightness: number;    // particle alpha multiplier
  label: string;
  labelTheta: number;    // theta along arm where label center sits
  labelSize: number;
  labelColor: string;
  reverseLabel?: boolean;
};

const ARMS: ArmDef[] = [
  { id: "perseus",     name: "Perseus",       phase: 0.00,             spin:  1, pitchDeg: 12.5, brightness: 1.00, label: "P E R S E U S   A R M",                   labelTheta: 2.30, labelSize: 0.085, labelColor: "#bfe6ff" },
  { id: "outer",       name: "Outer",         phase: 0.55,             spin:  1, pitchDeg: 13.5, brightness: 0.70, label: "O U T E R   A R M",                       labelTheta: 2.55, labelSize: 0.085, labelColor: "#bfe6ff" },
  { id: "sagittarius", name: "Sagittarius",   phase: Math.PI,          spin: -1, pitchDeg: 12.5, brightness: 1.00, label: "S A G I T T A R I U S   A R M",           labelTheta: 2.15, labelSize: 0.080, labelColor: "#bfe6ff", reverseLabel: true },
  { id: "scutum",      name: "Scutum-Cent.",  phase: Math.PI + 0.55,   spin: -1, pitchDeg: 13.0, brightness: 0.95, label: "S C U T U M – C E N T A U R U S   A R M", labelTheta: 2.45, labelSize: 0.070, labelColor: "#bfe6ff", reverseLabel: true },
  { id: "norma",       name: "Norma",         phase: 0.30,             spin:  1, pitchDeg: 14.5, brightness: 0.55, label: "N O R M A   A R M",                       labelTheta: 1.65, labelSize: 0.075, labelColor: "#bfe6ff" },
  { id: "orion",       name: "Orion Spur",    phase: Math.PI + 0.30,   spin: -1, pitchDeg: 16.5, brightness: 0.55, label: "O R I O N   S P U R",                     labelTheta: 1.65, labelSize: 0.070, labelColor: "#bfe6ff", reverseLabel: true },
];

// r(θ) = r0 * exp(B θ)
function armPoint(theta: number, arm: ArmDef, r0Ly = 4000) {
  const B = 1 / Math.tan((arm.pitchDeg * Math.PI) / 180);
  const rLy = r0Ly * Math.exp(theta / B);
  const ang = arm.phase + arm.spin * theta + GAL_ROT;
  return {
    rLy,
    x: Math.cos(ang) * rLy * LY,
    z: Math.sin(ang) * rLy * LY,
    tangent: ang + arm.spin * Math.PI / 2,
  };
}

// ─────────── Background star field ───────────
function BackgroundStars() {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const N = 1200;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 18 + Math.random() * 22;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(p) * Math.cos(t);
      pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      pos[i * 3 + 2] = r * Math.cos(p);
      const c = 0.55 + Math.random() * 0.45;
      col[i * 3] = c; col[i * 3 + 1] = c; col[i * 3 + 2] = c;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  return (
    <points geometry={geom}>
      <pointsMaterial size={0.035} sizeAttenuation vertexColors transparent opacity={0.85} depthWrite={false} />
    </points>
  );
}

// ─────────── Galactic core: bar + bulge halo ───────────
function GalacticCore() {
  return (
    <group rotation={[0, GAL_ROT, 0]}>
      {/* soft outermost golden disc haze */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 64]} />
        <meshBasicMaterial color="#f1c98a" transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* golden outer bulge */}
      <mesh scale={[0.78, 0.16, 0.42]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#e7a24a" transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* yellow inner bulge */}
      <mesh scale={[0.55, 0.13, 0.30]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#fde08a" transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* white-hot bar core */}
      <mesh scale={[0.36, 0.10, 0.13]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* hot tips of bar */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.28, 0, 0]} scale={[0.10, 0.07, 0.08]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#ffe9b8" transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

// ─────────── Spiral arm particles ───────────
function Arms() {
  const geom = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];

    ARMS.forEach((arm) => {
      const N = 2400;
      const thetaMax = 3.2;
      for (let i = 0; i < N; i++) {
        // bias samples outward for thicker outer arms
        const t = Math.pow(Math.random(), 0.55) * thetaMax;
        const p = armPoint(t, arm);
        if (p.rLy > 52000) continue;

        // perpendicular jitter (arm thickness grows with radius)
        const armWidth = 0.04 + p.rLy * LY * 0.10;
        const j1 = (Math.random() - 0.5) * armWidth;
        const j2 = (Math.random() - 0.5) * armWidth;
        const perpAng = p.tangent + Math.PI / 2;

        const x = p.x + Math.cos(perpAng) * j1 + (Math.random() - 0.5) * 0.015;
        const z = p.z + Math.sin(perpAng) * j1 + (Math.random() - 0.5) * 0.015;
        const y = (Math.random() - 0.5) * 0.025 + j2 * 0.05;

        positions.push(x, y, z);

        // color: cool blue-white in main body, warmer near core, dusty tint sometimes
        const rNorm = p.rLy / 50000;
        const warm = Math.max(0, 1 - rNorm * 2.4);
        const dust = Math.random() < 0.18;
        let r = 0.78 + warm * 0.22;
        let g = 0.86 + warm * 0.10;
        let b = 1.0;
        if (dust) { r *= 0.45; g *= 0.45; b *= 0.55; }
        const bMul = arm.brightness * (0.7 + Math.random() * 0.3);
        colors.push(r * bMul, g * bMul, b * bMul);

        sizes.push(0.012 + Math.random() * 0.022);
      }
    });

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return g;
  }, []);

  return (
    <group rotation={[0, 0, 0]}>
      <points geometry={geom}>
        <pointsMaterial
          size={0.032}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// ─────────── Disk haze (soft bluish wash across the disk) ───────────
function DiskHaze() {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const N = 3000;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = Math.sqrt(Math.random()) * DISK_R * 0.95;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.03;
      pos[i * 3 + 2] = Math.sin(a) * r;
      const c = 0.18 + Math.random() * 0.12;
      col[i * 3] = c * 0.7; col[i * 3 + 1] = c * 0.85; col[i * 3 + 2] = c;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  return (
    <points geometry={geom}>
      <pointsMaterial size={0.04} sizeAttenuation vertexColors transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ─────────── Curved arm label (per-character along the spiral) ───────────
function ArmLabel({ arm }: { arm: ArmDef }) {
  const chars = arm.label.split("");
  // Sample positions along arm centered at arm.labelTheta
  const total = chars.length;
  // characters use a small fixed angular step; compute step from labelSize and radius
  const center = armPoint(arm.labelTheta, arm);
  const stepRadial = arm.labelSize * 0.95;
  // angular step at this radius
  const dTheta = stepRadial / Math.max(0.2, Math.hypot(center.x, center.z));
  const startIdx = -(total - 1) / 2;

  return (
    <group>
      {chars.map((ch, i) => {
        const idx = startIdx + i;
        const t = arm.labelTheta + idx * dTheta * 0.85;
        const p = armPoint(t, arm);
        const ang = Math.atan2(p.z, p.x);
        // text lies flat on disk; rotate around Z so +X (text right) aligns with tangent.
        // Tangent direction at (cosA,sinA): (-sinA, cosA). After rotation [-PI/2,0,Z]:
        // local +X maps to (cosZ, 0, -sinZ). Match → Z = ang + π/2 (or + 3π/2 if reversed).
        const zRot = arm.reverseLabel ? ang - Math.PI / 2 : ang + Math.PI / 2;
        return (
          <Text
            key={i}
            position={[p.x, 0.02, p.z]}
            rotation={[-Math.PI / 2, 0, zRot]}
            fontSize={arm.labelSize}
            color={arm.labelColor}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.002}
            outlineColor="#000"
            outlineOpacity={0.5}
          >
            {ch}
          </Text>
        );
      })}
    </group>
  );
}

// ─────────── "CORE" label ───────────
function CoreLabel() {
  return (
    <Text
      position={[Math.cos(GAL_ROT) * 0.18, 0.05, Math.sin(GAL_ROT) * 0.18]}
      rotation={[-Math.PI / 2, 0, GAL_ROT]}
      fontSize={0.07}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.25}
      outlineWidth={0.002}
      outlineColor="#000"
      outlineOpacity={0.6}
    >
      CORE
    </Text>
  );
}

// ─────────── Distance ring ───────────
function DistanceRing({ ly, label }: { ly: number; label: string }) {
  const r = ly * LY;
  const pts = useMemo(() => {
    const arr: [number, number, number][] = [];
    const N = 128;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      arr.push([Math.cos(a) * r, 0, Math.sin(a) * r]);
    }
    return arr;
  }, [r]);
  return (
    <group>
      <Line points={pts} color="#7a8aa3" lineWidth={0.6} transparent opacity={0.35} />
      <Text
        position={[0, 0.01, r + 0.05]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.065}
        color="#a8b6cc"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.002}
        outlineColor="#000"
        outlineOpacity={0.6}
      >
        {label}
      </Text>
    </group>
  );
}

// ─────────── Degree ring (outer edge ticks + labels) ───────────
function DegreeRing() {
  const r = DISK_R * 1.05;
  const labels = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const deg = i * 30;
        const a = (deg * Math.PI) / 180;
        return { deg, x: Math.cos(a) * r, z: Math.sin(a) * r };
      }),
    [r]
  );
  return (
    <group>
      {labels.map(({ deg, x, z }) => (
        <Text
          key={deg}
          position={[x, 0.005, z]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.06}
          color="#6e7a90"
          anchorX="center"
          anchorY="middle"
        >
          {`${deg}°`}
        </Text>
      ))}
    </group>
  );
}

// ─────────── Solar system marker + orbit arc ───────────
function SolarSystem() {
  // Place on Orion Spur at ~26,000 ly
  const sunR = 26000 * LY;
  const sunAng = GAL_ROT + Math.PI * 0.55; // bottom-center area
  const sx = Math.cos(sunAng) * sunR;
  const sz = Math.sin(sunAng) * sunR;

  const orbitPts = useMemo(() => {
    const arr: [number, number, number][] = [];
    const start = sunAng + 0.05;
    const end = sunAng + Math.PI * 0.85;
    const N = 96;
    for (let i = 0; i <= N; i++) {
      const a = start + ((end - start) * i) / N;
      arr.push([Math.cos(a) * sunR, 0, Math.sin(a) * sunR]);
    }
    return arr;
  }, [sunR, sunAng]);

  const pulse = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (pulse.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 2.3) * 0.25;
      pulse.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      {/* solar-system orbit arc */}
      <Line points={orbitPts} color="#e8eef8" lineWidth={0.8} transparent opacity={0.65} dashed dashSize={0.08} gapSize={0.04} />

      {/* sun marker */}
      <mesh position={[sx, 0.015, sz]}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh ref={pulse} position={[sx, 0.015, sz]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#9ed1ff" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* label */}
      <Text
        position={[sx - 0.18, 0.02, sz + 0.10]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.062}
        color="#ffffff"
        anchorX="right"
        anchorY="middle"
        letterSpacing={0.18}
        outlineWidth={0.003}
        outlineColor="#000"
        outlineOpacity={0.7}
      >
        YOU ARE HERE
      </Text>
      <Text
        position={[sx - 0.18, 0.02, sz + 0.18]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.05}
        color="#cfd9ea"
        anchorX="right"
        anchorY="middle"
        letterSpacing={0.15}
      >
        SOLAR SYSTEM
      </Text>

      {/* "Direction of rotation" tag on outer rim */}
      <Text
        position={[DISK_R * 1.18, 0.005, -0.15]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.055}
        color="#a8b6cc"
        anchorX="left"
        anchorY="middle"
      >
        Direction of rotation →
      </Text>
    </group>
  );
}

// ─────────── Slow auto rotation of the whole galaxy ───────────
function GalaxySpin({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });
  return <group ref={ref}>{children}</group>;
}

// ─────────── Scene root ───────────
export default function CosmicAddress3D() {
  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden bg-black">
      <Canvas camera={{ position: [0, 2.4, 4.0], fov: 42 }} dpr={[1, 2]}>
        <color attach="background" args={["#02030a"]} />
        <ambientLight intensity={0.4} />

        <BackgroundStars />

        <GalaxySpin>
          <DiskHaze />
          <Arms />
          <GalacticCore />

          {/* Distance rings */}
          <DistanceRing ly={10000} label="10,000 light-years" />
          <DistanceRing ly={20000} label="20,000 light-years" />
          <DistanceRing ly={30000} label="30,000 light-years" />
          <DistanceRing ly={40000} label="40,000 light-years" />

          {/* Degree ring */}
          <DegreeRing />

          {/* Arm labels */}
          {ARMS.map((arm) => (
            <ArmLabel key={arm.id} arm={arm} />
          ))}
          <CoreLabel />

          {/* Solar system */}
          <SolarSystem />
        </GalaxySpin>

        <OrbitControls
          enablePan={false}
          minDistance={2.8}
          maxDistance={7.5}
          minPolarAngle={Math.PI * 0.08}
          maxPolarAngle={Math.PI * 0.48}
          rotateSpeed={0.55}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
