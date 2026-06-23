import { useMemo, useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";

/**
 * Interactive Milky Way for the Cosmic Address page.
 * Procedural barred-spiral galaxy + leader-line info pointers (glass cards)
 * for galactic structure, spiral arms, our location, and scale.
 */

// ─── Scale ───
const DISK_R = 2.6;
const LY = DISK_R / 50000;
const GAL_ROT = -0.35;

// ─── Spiral arms ───
type ArmDef = {
  id: string;
  name: string;
  phase: number;
  spin: 1 | -1;
  pitchDeg: number;
  brightness: number;
  description: string;
};

const ARMS: ArmDef[] = [
  { id: "perseus",     name: "Perseus Arm",            phase: 0.00,           spin:  1, pitchDeg: 12.5, brightness: 1.00, description: "Major outer arm — bright star-forming regions." },
  { id: "outer",       name: "Outer Arm",              phase: 0.55,           spin:  1, pitchDeg: 13.5, brightness: 0.70, description: "Faint outermost arm of the disk." },
  { id: "sagittarius", name: "Sagittarius Arm",        phase: Math.PI,        spin: -1, pitchDeg: 12.5, brightness: 1.00, description: "Inner major arm, rich in nebulae." },
  { id: "scutum",      name: "Scutum–Centaurus Arm",   phase: Math.PI + 0.55, spin: -1, pitchDeg: 13.0, brightness: 0.95, description: "Densest spiral arm, anchored at the bar." },
  { id: "norma",       name: "Norma Arm",              phase: 0.30,           spin:  1, pitchDeg: 14.5, brightness: 0.55, description: "Faint inner arm near the galactic core." },
  { id: "orion",       name: "Orion Spur",             phase: Math.PI + 0.30, spin: -1, pitchDeg: 16.5, brightness: 0.55, description: "Minor arm — home of our Solar System." },
];

function armPoint(theta: number, arm: ArmDef, r0Ly = 4000) {
  const B = 1 / Math.tan((arm.pitchDeg * Math.PI) / 180);
  const rLy = r0Ly * Math.exp(theta / B);
  const ang = arm.phase + arm.spin * theta + GAL_ROT;
  return {
    rLy,
    x: Math.cos(ang) * rLy * LY,
    z: Math.sin(ang) * rLy * LY,
  };
}

// ─── Background stars ───
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

// ─── Galactic core ───
function GalacticCore() {
  return (
    <group rotation={[0, GAL_ROT, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 64]} />
        <meshBasicMaterial color="#f1c98a" transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh scale={[0.78, 0.16, 0.42]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#e7a24a" transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh scale={[0.55, 0.13, 0.30]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#fde08a" transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh scale={[0.36, 0.10, 0.13]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.28, 0, 0]} scale={[0.10, 0.07, 0.08]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#ffe9b8" transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Arms (particles) ───
function Arms() {
  const geom = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    ARMS.forEach((arm) => {
      const N = 2400;
      const thetaMax = 3.2;
      for (let i = 0; i < N; i++) {
        const t = Math.pow(Math.random(), 0.55) * thetaMax;
        const p = armPoint(t, arm);
        if (p.rLy > 52000) continue;
        const armWidth = 0.04 + p.rLy * LY * 0.10;
        const j1 = (Math.random() - 0.5) * armWidth;
        const x = p.x + j1 + (Math.random() - 0.5) * 0.015;
        const z = p.z + (Math.random() - 0.5) * 0.015;
        const y = (Math.random() - 0.5) * 0.025;
        positions.push(x, y, z);
        const rNorm = p.rLy / 50000;
        const warm = Math.max(0, 1 - rNorm * 2.4);
        const dust = Math.random() < 0.18;
        let r = 0.78 + warm * 0.22;
        let g = 0.86 + warm * 0.10;
        let b = 1.0;
        if (dust) { r *= 0.45; g *= 0.45; b *= 0.55; }
        const bMul = arm.brightness * (0.7 + Math.random() * 0.3);
        colors.push(r * bMul, g * bMul, b * bMul);
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return g;
  }, []);
  return (
    <points geometry={geom}>
      <pointsMaterial size={0.032} sizeAttenuation vertexColors transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ─── Disk haze ───
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

// ─── Distance ring ───
function DistanceRing({ ly }: { ly: number }) {
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
  return <Line points={pts} color="#7a8aa3" lineWidth={0.6} transparent opacity={0.25} />;
}

// ─── Info pointer (leader line + glass card) ───
type Pointer = {
  id: string;
  anchor: [number, number, number];   // 3D world point in galaxy-local space
  offset: [number, number, number];   // leader endpoint offset from anchor
  title: string;
  description: string;
  accent?: boolean;
};

function InfoPointer({
  pointer,
  onHover,
  visible,
}: {
  pointer: Pointer;
  onHover: (hovering: boolean) => void;
  visible: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const end: [number, number, number] = [
    pointer.anchor[0] + pointer.offset[0],
    pointer.anchor[1] + pointer.offset[1],
    pointer.anchor[2] + pointer.offset[2],
  ];
  const lineColor = pointer.accent ? "#ffffff" : hovered ? "#ffffff" : "#9fb3cf";
  const lineOpacity = pointer.accent ? 0.9 : hovered ? 0.95 : 0.55;

  if (!visible) return null;

  return (
    <group>
      <Line points={[pointer.anchor, end]} color={lineColor} lineWidth={pointer.accent ? 1.1 : 0.8} transparent opacity={lineOpacity} />
      {/* Anchor dot */}
      <mesh position={pointer.anchor}>
        <sphereGeometry args={[pointer.accent ? 0.028 : 0.018, 16, 16]} />
        <meshBasicMaterial color={pointer.accent ? "#ffffff" : "#cfd9ea"} />
      </mesh>
      <Html
        position={end}
        center
        distanceFactor={6}
        zIndexRange={[40, 0]}
        style={{ pointerEvents: "auto" }}
      >
        <div
          onMouseEnter={() => { setHovered(true); onHover(true); }}
          onMouseLeave={() => { setHovered(false); onHover(false); }}
          onClick={() => setExpanded((v) => !v)}
          style={{
            width: expanded ? 240 : 168,
            transition: "width 180ms ease, background 180ms ease",
            background: pointer.accent ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.05)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: `1px solid rgba(255,255,255,${pointer.accent ? 0.35 : 0.15})`,
            borderRadius: 10,
            padding: "8px 10px",
            color: "rgba(255,255,255,0.92)",
            fontFamily: "ui-sans-serif, system-ui",
            fontSize: 11,
            lineHeight: 1.35,
            letterSpacing: 0.3,
            boxShadow: hovered ? "0 4px 18px rgba(0,0,0,0.6)" : "0 2px 10px rgba(0,0,0,0.4)",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <div style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1.4,
            color: pointer.accent ? "#ffffff" : "rgba(255,255,255,0.75)",
            fontWeight: 600,
            marginBottom: 3,
          }}>
            {pointer.title}
          </div>
          <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 10.5 }}>
            {pointer.description}
          </div>
        </div>
      </Html>
    </group>
  );
}

// ─── Solar system marker + orbit ───
function SolarSystem({ position }: { position: [number, number, number] }) {
  const pulse = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (pulse.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 2.3) * 0.25;
      pulse.current.scale.setScalar(s);
    }
  });
  const sunR = Math.hypot(position[0], position[2]);
  const sunAng = Math.atan2(position[2], position[0]);
  const orbitPts = useMemo(() => {
    const arr: [number, number, number][] = [];
    const N = 128;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      arr.push([Math.cos(a) * sunR, 0, Math.sin(a) * sunR]);
    }
    return arr;
  }, [sunR]);
  return (
    <group>
      <Line points={orbitPts} color="#e8eef8" lineWidth={0.7} transparent opacity={0.4} dashed dashSize={0.08} gapSize={0.05} />
      <mesh position={position}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh ref={pulse} position={position}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#9ed1ff" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* rotation hint */}
      <Html position={[DISK_R * 1.08, 0, -0.05]} center distanceFactor={6} zIndexRange={[20, 0]}>
        <div style={{
          fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: 1.2,
          textTransform: "uppercase", whiteSpace: "nowrap", fontFamily: "ui-sans-serif, system-ui",
        }}>
          Direction of rotation →
        </div>
      </Html>
      {/* scale legend */}
      <Html position={[-DISK_R * 1.05, 0, DISK_R * 0.9]} center distanceFactor={6} zIndexRange={[20, 0]}>
        <div style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8, padding: "6px 9px",
          fontFamily: "ui-sans-serif, system-ui",
          fontSize: 10, color: "rgba(255,255,255,0.75)",
          letterSpacing: 0.4, lineHeight: 1.5, whiteSpace: "nowrap",
        }}>
          <div style={{ textTransform: "uppercase", letterSpacing: 1.4, color: "#fff", marginBottom: 2, fontWeight: 600 }}>Scale</div>
          Rings · 10k / 20k / 30k / 40k ly<br />
          Disk ≈ 100,000 light-years
        </div>
      </Html>
    </group>
  );
}

// ─── Auto-spin group ───
function GalaxySpin({ children, paused }: { children: React.ReactNode; paused: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current && !paused) ref.current.rotation.y += dt * 0.02;
  });
  return <group ref={ref}>{children}</group>;
}

// ─── Build pointer set from arms + features ───
function buildPointers(): Pointer[] {
  const pts: Pointer[] = [];

  // Core structure
  pts.push({
    id: "sgrA",
    anchor: [0, 0.02, 0],
    offset: [0.4, 0, -0.55],
    title: "Galactic Center · Sgr A*",
    description: "Supermassive black hole, ~4 million ☉.",
    accent: true,
  });
  pts.push({
    id: "bar",
    anchor: [Math.cos(GAL_ROT) * 0.28, 0.02, Math.sin(GAL_ROT) * 0.28],
    offset: [0.55, 0, 0.35],
    title: "Central Bar",
    description: "~10,000 ly stellar bar across the core.",
  });
  pts.push({
    id: "bulge",
    anchor: [Math.cos(GAL_ROT + 1.2) * 0.42, 0.02, Math.sin(GAL_ROT + 1.2) * 0.42],
    offset: [-0.35, 0, -0.55],
    title: "Galactic Bulge",
    description: "Dense population of old yellow stars.",
  });
  pts.push({
    id: "halo",
    anchor: [DISK_R * 0.96, 0.02, -DISK_R * 0.25],
    offset: [0.55, 0, -0.5],
    title: "Galactic Halo",
    description: "Dark matter + globular clusters, ~200,000 ly across.",
  });

  // Arm pointers — anchor mid-arm
  const armOffsets: Record<string, [number, number, number]> = {
    perseus:     [ 0.55,  0,  0.40],
    outer:       [ 0.10,  0,  0.70],
    sagittarius: [-0.55,  0, -0.40],
    scutum:      [-0.10,  0, -0.70],
    norma:       [-0.45,  0,  0.45],
    orion:       [ 0.45,  0, -0.45],
  };
  ARMS.forEach((arm) => {
    const p = armPoint(2.2, arm);
    pts.push({
      id: `arm-${arm.id}`,
      anchor: [p.x, 0.02, p.z],
      offset: armOffsets[arm.id] ?? [0.4, 0, 0.4],
      title: arm.name,
      description: arm.description,
      accent: arm.id === "orion",
    });
  });

  return pts;
}

// Solar system position on Orion Spur (~26,000 ly from center)
function solarSystemPos(): [number, number, number] {
  // Find theta along orion arm where rLy ≈ 26000
  const arm = ARMS.find((a) => a.id === "orion")!;
  let bestT = 0, bestDiff = Infinity;
  for (let t = 0; t < 3.2; t += 0.01) {
    const p = armPoint(t, arm);
    const d = Math.abs(p.rLy - 26000);
    if (d < bestDiff) { bestDiff = d; bestT = t; }
  }
  const p = armPoint(bestT, arm);
  return [p.x, 0.015, p.z];
}

// ─── Scene ───
function Scene({ showLabels }: { showLabels: boolean }) {
  const [hoverCount, setHoverCount] = useState(0);
  const pointers = useMemo(() => buildPointers(), []);
  const sunPos = useMemo(() => solarSystemPos(), []);

  // Sun pointer
  const sunPointer: Pointer = {
    id: "sun",
    anchor: sunPos,
    offset: [-0.6, 0, 0.55],
    title: "You Are Here · Solar System",
    description: "Sun · Orion Spur · 26,000 ly from center · 230 Myr orbit.",
    accent: true,
  };

  return (
    <>
      <color attach="background" args={["#02030a"]} />
      <ambientLight intensity={0.4} />
      <BackgroundStars />

      <GalaxySpin paused={hoverCount > 0}>
        <DiskHaze />
        <Arms />
        <GalacticCore />
        <DistanceRing ly={10000} />
        <DistanceRing ly={20000} />
        <DistanceRing ly={30000} />
        <DistanceRing ly={40000} />
        <SolarSystem position={sunPos} />

        {pointers.map((p) => (
          <InfoPointer key={p.id} pointer={p} visible={showLabels} onHover={(h) => setHoverCount((c) => c + (h ? 1 : -1))} />
        ))}
        <InfoPointer pointer={sunPointer} visible={showLabels} onHover={(h) => setHoverCount((c) => c + (h ? 1 : -1))} />
      </GalaxySpin>

      <OrbitControls
        enablePan={false}
        minDistance={2.8}
        maxDistance={7.5}
        minPolarAngle={Math.PI * 0.08}
        maxPolarAngle={Math.PI * 0.48}
        rotateSpeed={0.55}
      />
    </>
  );
}

export default function CosmicAddress3D() {
  const [showLabels, setShowLabels] = useState(true);
  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden bg-black">
      <Canvas camera={{ position: [0, 2.4, 4.0], fov: 42 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Scene showLabels={showLabels} />
        </Suspense>
      </Canvas>
      <button
        onClick={() => setShowLabels((v) => !v)}
        className="absolute top-3 right-3 px-3 py-1.5 text-[11px] uppercase tracking-wider text-white/80 bg-white/5 hover:bg-white/10 backdrop-blur border border-white/15 rounded-md transition"
      >
        {showLabels ? "Hide labels" : "Show labels"}
      </button>
    </div>
  );
}
