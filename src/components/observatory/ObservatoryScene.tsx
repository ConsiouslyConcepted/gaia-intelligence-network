import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import { STATIONS } from "./stations";

const EARTH_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg";
const BUMP_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png";

/* =========================================================================
 * Camera-progress model
 * -------------------------------------------------------------------------
 * `progress` is a continuous float 0..STATIONS.length-1.
 * Each station group is rendered at scale = pow(SCALE_STEP, progress - index):
 *   - progress < i  → scale > 1 (we haven't reached it yet, it engulfs us)
 *   - progress = i  → scale = 1 (perfectly framed)
 *   - progress > i  → scale < 1 (we've zoomed past, it shrinks away)
 * Opacity peaks at progress = i and fades over ~1.4 stations either side.
 * This creates the nested zoom-through-scales feel.
 * ========================================================================= */

const SCALE_STEP = 0.32; // smaller = more dramatic zoom between stations
const FADE_WIDTH = 1.4;

function stationVisibility(progress: number, index: number) {
  const delta = progress - index;
  const opacity = Math.max(0, 1 - Math.abs(delta) / FADE_WIDTH);
  const scale = Math.pow(SCALE_STEP, delta);
  return { opacity, scale, visible: opacity > 0.01 };
}

/* ---------- helpers ---------- */

function Starfield({ count = 1500, radius = 80, opacity = 0.85 }: { count?: number; radius?: number; opacity?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // sphere shell
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = radius * (0.6 + 0.4 * Math.random());
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count, radius]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} sizeAttenuation color="#cfd9ff" transparent opacity={opacity} />
    </points>
  );
}

/* ---------- stations ---------- */

function EarthStation({ opacity }: { opacity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [earthMap, bumpMap] = useLoader(TextureLoader, [EARTH_TEX, BUMP_TEX]);

  useFrame((s) => {
    if (meshRef.current) meshRef.current.rotation.y = s.clock.elapsedTime * 0.08;
  });

  return (
    <group>
      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#bcd6ff", "#1a2540", 0.6]} />
      <directionalLight position={[5, 3, 5]} intensity={1.8} />
      <directionalLight position={[-4, -2, 3]} intensity={0.5} color="#9ec3ff" />
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 96, 96]} />
        <meshStandardMaterial
          map={earthMap}
          bumpMap={bumpMap}
          bumpScale={0.04}
          roughness={0.78}
          metalness={0.05}
          emissive="#1a2a48"
          emissiveIntensity={0.18}
          transparent
          opacity={opacity}
        />
      </mesh>
      <mesh scale={1.06}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial color="#7fb4ff" transparent opacity={0.14 * opacity} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function PlanetarySystem({ opacity }: { opacity: number }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const moonGroup = useRef<THREE.Group>(null);
  const fieldRef = useRef<THREE.Group>(null);
  const [earthMap] = useLoader(TextureLoader, [EARTH_TEX]);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (earthRef.current) earthRef.current.rotation.y = t * 0.1;
    if (moonGroup.current) moonGroup.current.rotation.y = t * 0.15;
    if (fieldRef.current) fieldRef.current.rotation.y = t * 0.05;
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 2, 5]} intensity={1.4} />
      {/* Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1.1, 64, 64]} />
        <meshStandardMaterial map={earthMap} roughness={0.8} transparent opacity={opacity} />
      </mesh>
      {/* Magnetosphere field lines */}
      <group ref={fieldRef}>
        {Array.from({ length: 14 }).map((_, i) => {
          const angle = (i / 14) * Math.PI * 2;
          const a = 2.4;
          const b = 1.5;
          const curve = new THREE.EllipseCurve(0, 0, a, b, 0, Math.PI * 2, false, angle);
          const pts = curve.getPoints(48).map((p) => new THREE.Vector3(p.x, p.y, 0));
          const geom = new THREE.BufferGeometry().setFromPoints(pts);
          const mat = new THREE.LineBasicMaterial({ color: "#7aa8ff", transparent: true, opacity: 0.22 * opacity });
          const lineObj = new THREE.Line(geom, mat);
          lineObj.rotation.set(Math.PI / 2, 0, angle);
          return <primitive key={i} object={lineObj} />;
        })}
      </group>
      {/* Moon orbit */}
      <group ref={moonGroup}>
        <mesh position={[3.2, 0, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color="#cbc6bf" roughness={1} transparent opacity={opacity} />
        </mesh>
      </group>
    </group>
  );
}

function Heliosphere({ opacity }: { opacity: number }) {
  const sunRef = useRef<THREE.Mesh>(null);
  const planetsRef = useRef<THREE.Group>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (sunRef.current) sunRef.current.rotation.y = t * 0.2;
    if (planetsRef.current) planetsRef.current.rotation.y = t * 0.05;
  });

  const orbits = [0.7, 1.0, 1.35, 1.7, 2.4, 3.0, 3.6, 4.1];

  return (
    <group>
      <ambientLight intensity={0.3} />
      {/* Sun */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[0.45, 48, 48]} />
        <meshBasicMaterial color="#ffd28a" transparent opacity={opacity} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={1.2 * opacity} color="#ffd28a" distance={20} />
      {/* Orbits */}
      <group rotation={[Math.PI / 2.2, 0, 0]}>
        {orbits.map((r, i) => {
          const curve = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2, false, 0);
          const geom = new THREE.BufferGeometry().setFromPoints(
            curve.getPoints(120).map((p) => new THREE.Vector3(p.x, p.y, 0)),
          );
          const mat = new THREE.LineBasicMaterial({ color: "#cfd9ff", transparent: true, opacity: 0.22 * opacity });
          return <primitive key={i} object={new THREE.Line(geom, mat)} />;
        })}
        {/* Earth marker */}
        <group ref={planetsRef}>
          <mesh position={[1.35, 0, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color="#7fb4ff" transparent opacity={opacity} />
          </mesh>
        </group>
      </group>
      {/* Heliopause shell */}
      <mesh>
        <sphereGeometry args={[4.6, 64, 64]} />
        <meshBasicMaterial color="#5e7bb8" transparent opacity={0.06 * opacity} side={THREE.BackSide} wireframe />
      </mesh>
    </group>
  );
}

function StellarNeighborhood({ opacity }: { opacity: number }) {
  const stars = useMemo(() => {
    const arr: Array<{ pos: [number, number, number]; color: string; size: number }> = [];
    const palette = ["#9ec5ff", "#ffffff", "#ffe6b0", "#ff9d6e", "#ffd28a"];
    for (let i = 0; i < 220; i++) {
      const r = 1 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr.push({
        pos: [r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta) * 0.4, r * Math.cos(phi)],
        color: palette[Math.floor(Math.random() * palette.length)],
        size: 0.04 + Math.random() * 0.06,
      });
    }
    return arr;
  }, []);

  return (
    <group>
      <ambientLight intensity={0.4} />
      {/* Sun */}
      <mesh>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshBasicMaterial color="#ffd28a" transparent opacity={opacity} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.18, 0.22, 32]} />
        <meshBasicMaterial color="#ffd28a" transparent opacity={0.4 * opacity} side={THREE.DoubleSide} />
      </mesh>
      {stars.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <sphereGeometry args={[s.size, 12, 12]} />
          <meshBasicMaterial color={s.color} transparent opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}

function OrionSpur({ opacity }: { opacity: number }) {
  // A tilted spiral-arm fragment with the Sun highlighted near the centre.
  const groupRef = useRef<THREE.Group>(null);
  const positions = useMemo(() => {
    const N = 4000;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      // narrow band along x, slight curve along z
      const x = (Math.random() - 0.5) * 8;
      const curve = 0.08 * x * x;
      const z = curve + (Math.random() - 0.5) * 1.4;
      const y = (Math.random() - 0.5) * 0.4;
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
    return arr;
  }, []);

  useFrame((s) => {
    if (groupRef.current) groupRef.current.rotation.y = s.clock.elapsedTime * 0.02;
  });

  return (
    <group ref={groupRef} rotation={[0.25, 0.4, 0.1]}>
      <ambientLight intensity={0.4} />
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.035} sizeAttenuation color="#cfe1ff" transparent opacity={0.75 * opacity} />
      </points>
      {/* Sun marker */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshBasicMaterial color="#ffe87a" transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <ringGeometry args={[0.2, 0.26, 32]} />
        <meshBasicMaterial color="#ffe87a" transparent opacity={0.7 * opacity} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );

function MilkyWay({ opacity }: { opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const positions = useMemo(() => {
    const N = 18000;
    const arr = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const arms = 4;
    const armOffset = (Math.PI * 2) / arms;
    for (let i = 0; i < N; i++) {
      const r = Math.pow(Math.random(), 0.6) * 5;
      const arm = i % arms;
      const angle = r * 1.2 + arm * armOffset + (Math.random() - 0.5) * 0.6;
      const x = Math.cos(angle) * r + (Math.random() - 0.5) * 0.25;
      const y = (Math.random() - 0.5) * 0.18 * (1 - r / 5);
      const z = Math.sin(angle) * r + (Math.random() - 0.5) * 0.25;
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
      // color: bluer outside, warmer in center
      const t = r / 5;
      colors[i * 3] = 1 - t * 0.5;
      colors[i * 3 + 1] = 0.85;
      colors[i * 3 + 2] = 0.7 + t * 0.3;
    }
    return { arr, colors };
  }, []);

  useFrame((s) => {
    if (groupRef.current) groupRef.current.rotation.y = s.clock.elapsedTime * 0.04;
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 2.3, 0, 0]}>
      {/* core glow */}
      <mesh>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial color="#ffe1a8" transparent opacity={0.7 * opacity} />
      </mesh>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.arr.length / 3} array={positions.arr} itemSize={3} args={[positions.arr, 3]} />
          <bufferAttribute attach="attributes-color" count={positions.colors.length / 3} array={positions.colors} itemSize={3} args={[positions.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.035} sizeAttenuation vertexColors transparent opacity={opacity} />
      </points>
      {/* You-are-here */}
      <mesh position={[2.4, 0, 0]}>
        <ringGeometry args={[0.12, 0.16, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85 * opacity} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function LocalGroup({ opacity }: { opacity: number }) {
  // Three main galaxies + satellites
  const galaxies = useMemo(
    () => [
      { pos: [-1.5, 0, 0] as [number, number, number], r: 0.55, tilt: 0.3, color: "#cfd9ff", name: "MW" },
      { pos: [1.6, 0.2, -0.3] as [number, number, number], r: 0.75, tilt: -0.5, color: "#fde6c4", name: "Andromeda" },
      { pos: [0.2, -0.7, 1.5] as [number, number, number], r: 0.3, tilt: 0.8, color: "#cfe9d8", name: "Triangulum" },
    ],
    [],
  );
  const satellites = useMemo(() => {
    const arr: Array<[number, number, number]> = [];
    for (let i = 0; i < 40; i++) {
      arr.push([(Math.random() - 0.5) * 6, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 6]);
    }
    return arr;
  }, []);

  return (
    <group>
      <ambientLight intensity={0.5} />
      {galaxies.map((g, i) => (
        <group key={i} position={g.pos} rotation={[g.tilt, 0, g.tilt * 0.5]}>
          <mesh>
            <sphereGeometry args={[g.r * 0.25, 24, 24]} />
            <meshBasicMaterial color={g.color} transparent opacity={0.9 * opacity} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[g.r * 0.3, g.r, 48]} />
            <meshBasicMaterial color={g.color} transparent opacity={0.35 * opacity} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {satellites.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#cfd9ff" transparent opacity={0.5 * opacity} />
        </mesh>
      ))}
    </group>
  );
}

function VirgoCluster({ opacity }: { opacity: number }) {
  const galaxies = useMemo(() => {
    const arr: Array<{ pos: [number, number, number]; r: number; color: string }> = [];
    // central Virgo A
    arr.push({ pos: [0, 0, 0], r: 0.5, color: "#ffe1a8" });
    for (let i = 0; i < 90; i++) {
      const r = 0.6 + Math.pow(Math.random(), 0.6) * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr.push({
        pos: [r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)],
        r: 0.06 + Math.random() * 0.14,
        color: Math.random() > 0.6 ? "#fde6c4" : "#cfd9ff",
      });
    }
    return arr;
  }, []);

  return (
    <group>
      <ambientLight intensity={0.5} />
      {galaxies.map((g, i) => (
        <mesh key={i} position={g.pos}>
          <sphereGeometry args={[g.r, 16, 16]} />
          <meshBasicMaterial color={g.color} transparent opacity={(i === 0 ? 0.95 : 0.7) * opacity} />
        </mesh>
      ))}
    </group>
  );
}

function Laniakea({ opacity }: { opacity: number }) {
  // Flow lines converging on a Great Attractor
  const attractor: [number, number, number] = [1.5, -0.3, 0.8];
  const lines = useMemo(() => {
    const out: THREE.Vector3[][] = [];
    for (let i = 0; i < 80; i++) {
      const start = new THREE.Vector3((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 7);
      const pts: THREE.Vector3[] = [];
      const cur = start.clone();
      const target = new THREE.Vector3(...attractor);
      for (let s = 0; s < 24; s++) {
        pts.push(cur.clone());
        const dir = target.clone().sub(cur).normalize().multiplyScalar(0.18);
        cur.add(dir);
        cur.x += (Math.random() - 0.5) * 0.05;
        cur.y += (Math.random() - 0.5) * 0.05;
        cur.z += (Math.random() - 0.5) * 0.05;
        if (cur.distanceTo(target) < 0.2) break;
      }
      out.push(pts);
    }
    return out;
  }, []);

  return (
    <group>
      <ambientLight intensity={0.4} />
      {/* Great Attractor */}
      <mesh position={attractor}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshBasicMaterial color="#ffe1a8" transparent opacity={opacity} />
      </mesh>
      {lines.map((pts, i) => {
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({ color: "#9ec5ff", transparent: true, opacity: 0.35 * opacity });
        return <primitive key={i} object={new THREE.Line(geom, mat)} />;
      })}
    </group>
  );
}

function ObservableUniverse({ opacity }: { opacity: number }) {
  const positions = useMemo(() => {
    const N = 12000;
    const arr = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    // Cosmic web — clumps in a sphere
    const clumps: Array<[number, number, number]> = [];
    for (let i = 0; i < 60; i++) {
      const r = Math.pow(Math.random(), 0.4) * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      clumps.push([r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)]);
    }
    for (let i = 0; i < N; i++) {
      const c = clumps[Math.floor(Math.random() * clumps.length)];
      arr[i * 3] = c[0] + (Math.random() - 0.5) * 1.2;
      arr[i * 3 + 1] = c[1] + (Math.random() - 0.5) * 1.2;
      arr[i * 3 + 2] = c[2] + (Math.random() - 0.5) * 1.2;
      const t = Math.random();
      colors[i * 3] = 0.75 + t * 0.25;
      colors[i * 3 + 1] = 0.7 + t * 0.2;
      colors[i * 3 + 2] = 0.9;
    }
    return { arr, colors };
  }, []);

  return (
    <group>
      <ambientLight intensity={0.6} />
      {/* CMB-tinted halo */}
      <mesh>
        <sphereGeometry args={[6.2, 48, 48]} />
        <meshBasicMaterial color="#3a2a55" transparent opacity={0.08 * opacity} side={THREE.BackSide} />
      </mesh>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.arr.length / 3} array={positions.arr} itemSize={3} args={[positions.arr, 3]} />
          <bufferAttribute attach="attributes-color" count={positions.colors.length / 3} array={positions.colors} itemSize={3} args={[positions.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.04} sizeAttenuation vertexColors transparent opacity={opacity} />
      </points>
    </group>
  );
}

/* ---------- mapping ---------- */

function StationRenderer({ id, opacity }: { id: string; opacity: number }) {
  switch (id) {
    case "earth":
      return <EarthStation opacity={opacity} />;
    case "planetary":
      return <PlanetarySystem opacity={opacity} />;
    case "heliosphere":
      return <Heliosphere opacity={opacity} />;
    case "stellar":
      return <StellarNeighborhood opacity={opacity} />;
    case "orionspur":
      return <OrionSpur opacity={opacity} />;
    case "milkyway":
      return <MilkyWay opacity={opacity} />;
    case "localgroup":
      return <LocalGroup opacity={opacity} />;
    case "virgo":
      return <VirgoCluster opacity={opacity} />;
    case "laniakea":
      return <Laniakea opacity={opacity} />;
    case "universe":
      return <ObservableUniverse opacity={opacity} />;
    default:
      return null;
  }
}

/* ---------- camera-progress driver ---------- */

interface SceneProps {
  /** Ref the parent reads/writes — eased toward `targetProgress`. */
  progressRef: React.MutableRefObject<number>;
  /** Target value, updated externally by scroll/keys/rail. */
  targetRef: React.MutableRefObject<number>;
  /** Notifies parent when integer station changes. */
  onActiveStationChange: (idx: number) => void;
}

function SceneInner({ progressRef, targetRef, onActiveStationChange }: SceneProps) {
  const lastActive = useRef<number>(-1);

  useFrame(() => {
    // ease progress toward target
    const t = targetRef.current;
    const p = progressRef.current;
    const next = p + (t - p) * 0.08;
    progressRef.current = next;

    const active = Math.round(next);
    if (active !== lastActive.current) {
      lastActive.current = active;
      onActiveStationChange(active);
    }
  });

  // Force re-render at ~30fps so opacity/scale updates flow without React state churn.
  // We use a tiny invalidation pattern: read progressRef.current at render and bind groups via refs.
  // For simplicity, render all stations and update via refs every frame.
  const groupRefs = useRef<Array<THREE.Group | null>>([]);
  const materialOpacityRefs = useRef<Array<number>>(STATIONS.map(() => 0));

  useFrame(() => {
    const p = progressRef.current;
    for (let i = 0; i < STATIONS.length; i++) {
      const { opacity, scale } = stationVisibility(p, i);
      const g = groupRefs.current[i];
      materialOpacityRefs.current[i] = opacity;
      if (g) {
        g.scale.setScalar(scale);
        g.visible = opacity > 0.01;
      }
    }
  });

  return (
    <>
      <color attach="background" args={["#05060f"]} />
      <fog attach="fog" args={["#05060f", 12, 40]} />
      <Starfield />
      {STATIONS.map((s, i) => {
        // initial visibility for first render
        const { opacity, scale } = stationVisibility(progressRef.current, i);
        return (
          <group
            key={s.id}
            ref={(el) => (groupRefs.current[i] = el)}
            scale={scale}
            visible={opacity > 0.01}
          >
            {/* Each station internally references its own opacity through a small subscription —
                we re-create the subtree with key=floor(progress) only at coarse changes to avoid GPU churn.
                For simplicity we render once with current opacity; opacity transitions happen via
                material transparency baked at render time. */}
            <StationRenderer id={s.id} opacity={opacity} />
          </group>
        );
      })}
    </>
  );
}

export interface ObservatorySceneProps {
  targetRef: React.MutableRefObject<number>;
  progressRef: React.MutableRefObject<number>;
  onActiveStationChange: (idx: number) => void;
}

export default function ObservatoryScene(props: ObservatorySceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 1.5]}
      className="!absolute inset-0"
    >
      <Suspense fallback={null}>
        <SceneInner {...props} />
      </Suspense>
    </Canvas>
  );
}
