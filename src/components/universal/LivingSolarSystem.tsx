import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Line, useTexture } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import {
  PLANET_ELEMENTS,
  PlanetState,
  sampleOrbit,
} from "@/lib/orbitalMechanics";
import { SOLAR_PLANETS, PLANET_RESONANCE_PAIRS } from "@/types/solarPlanets";

// Compress AU radii so all planets are visible together.
const SCALE = (au: number) => Math.sqrt(Math.max(au, 0)) * 3.2;

const PLANET_VISUAL: Record<string, { size: number; ring?: boolean }> = {
  mercury: { size: 0.15 },
  venus: { size: 0.22 },
  earth: { size: 0.24 },
  mars: { size: 0.18 },
  jupiter: { size: 0.7 },
  saturn: { size: 0.6, ring: true },
  uranus: { size: 0.4, ring: true },
  neptune: { size: 0.38 },
  pluto: { size: 0.12 },
};

const scaledPos = (s: PlanetState): [number, number, number] => {
  const r = Math.hypot(s.x, s.y, s.z);
  const k = r > 0 ? SCALE(r) / r : 0;
  return [s.x * k, s.z * k, s.y * k]; // map ecliptic z → world y for nicer camera
};

const scaledOrbit = (pts: [number, number, number][]): [number, number, number][] =>
  pts.map(([x, y, z]) => {
    const r = Math.hypot(x, y, z);
    const k = r > 0 ? SCALE(r) / r : 0;
    return [x * k, z * k, y * k];
  });

const Sun = ({ intensity }: { intensity: number }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.05;
  });
  return (
    <group>
      <pointLight position={[0, 0, 0]} intensity={3 + intensity * 2} distance={400} color="#ffe6b8" />
      <mesh ref={ref}>
        <sphereGeometry args={[0.9, 48, 48]} />
        <meshBasicMaterial color={new THREE.Color("#fff1c2")} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.15, 32, 32]} />
        <meshBasicMaterial color={new THREE.Color("#ffa852")} transparent opacity={0.18} toneMapped={false} />
      </mesh>
    </group>
  );
};

const Planet = ({
  id,
  position,
  selected,
  onClick,
}: {
  id: string;
  position: [number, number, number];
  selected: boolean;
  onClick: () => void;
}) => {
  const visual = PLANET_VISUAL[id];
  const planet = SOLAR_PLANETS.find((p) => p.id === id)!;
  const meshRef = useRef<THREE.Mesh>(null!);
  let texture: THREE.Texture | null = null;
  try {
    texture = useTexture(planet.image);
  } catch {
    texture = null;
  }
  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.2;
  });
  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <sphereGeometry args={[visual.size, 32, 32]} />
        {texture ? (
          <meshStandardMaterial map={texture} roughness={0.85} metalness={0.05} />
        ) : (
          <meshStandardMaterial color={planet.color} roughness={0.85} />
        )}
      </mesh>
      {visual.ring && (
        <mesh rotation={[Math.PI / 2.3, 0, 0]}>
          <ringGeometry args={[visual.size * 1.4, visual.size * 2.1, 64]} />
          <meshBasicMaterial color={planet.color} transparent opacity={0.45} side={THREE.DoubleSide} />
        </mesh>
      )}
      {selected && (
        <mesh>
          <sphereGeometry args={[visual.size * 1.6, 24, 24]} />
          <meshBasicMaterial color={planet.color} transparent opacity={0.18} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

const OrbitTrail = ({ id, color, selected }: { id: string; color: string; selected: boolean }) => {
  const points = useMemo(() => {
    const el = PLANET_ELEMENTS.find((e) => e.id === id)!;
    return scaledOrbit(sampleOrbit(el, new Date(), 192));
  }, [id]);
  return (
    <Line
      points={points}
      color={color}
      lineWidth={selected ? 1.4 : 0.5}
      transparent
      opacity={selected ? 0.7 : 0.18}
    />
  );
};

const HarmonicArcs = ({ states }: { states: PlanetState[] }) => {
  const arcs = useMemo(() => {
    const byId = new Map(states.map((s) => [s.id, s]));
    return PLANET_RESONANCE_PAIRS.map((pair) => {
      const p1 = SOLAR_PLANETS[pair.i];
      const p2 = SOLAR_PLANETS[pair.j];
      const a = byId.get(p1.id);
      const b = byId.get(p2.id);
      if (!a || !b) return null;
      const pa = scaledPos(a);
      const pb = scaledPos(b);
      const mid: [number, number, number] = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2 + 1.2, (pa[2] + pb[2]) / 2];
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(...pa),
        new THREE.Vector3(...mid),
        new THREE.Vector3(...pb)
      );
      const pts = curve.getPoints(32).map((v) => [v.x, v.y, v.z] as [number, number, number]);
      return { pts, color: pair.c1, key: pair.label };
    }).filter(Boolean) as { pts: [number, number, number][]; color: string; key: string }[];
  }, [states]);
  return (
    <>
      {arcs.map((a) => (
        <Line key={a.key} points={a.pts} color={a.color} lineWidth={0.8} transparent opacity={0.35} />
      ))}
    </>
  );
};

export const LivingSolarSystem = ({
  selectedPlanet,
  onPlanetClick,
  states,
  showHarmonics,
  solarIntensity,
}: {
  selectedPlanet: string | null;
  onPlanetClick: (id: string) => void;
  states: PlanetState[];
  showHarmonics: boolean;
  solarIntensity: number;
}) => {
  return (
    <Canvas
      camera={{ position: [0, 18, 28], fov: 50, near: 0.1, far: 800 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#05060c"]} />
      <fog attach="fog" args={["#05060c", 60, 200]} />
      <ambientLight intensity={0.08} />
      <Suspense fallback={null}>
        <Stars radius={120} depth={50} count={4000} factor={3} fade speed={0.4} />
        <Sun intensity={solarIntensity} />
        {PLANET_ELEMENTS.map((el) => {
          const s = states.find((x) => x.id === el.id);
          if (!s) return null;
          const planet = SOLAR_PLANETS.find((p) => p.id === el.id)!;
          const isSelected = selectedPlanet === el.id;
          return (
            <group key={el.id}>
              <OrbitTrail id={el.id} color={planet.color} selected={isSelected} />
              <Planet
                id={el.id}
                position={scaledPos(s)}
                selected={isSelected}
                onClick={() => onPlanetClick(el.id)}
              />
            </group>
          );
        })}
        {showHarmonics && <HarmonicArcs states={states} />}
        <EffectComposer>
          <Bloom intensity={0.9} luminanceThreshold={0.6} luminanceSmoothing={0.4} mipmapBlur />
        </EffectComposer>
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={120}
        autoRotate
        autoRotateSpeed={0.25}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
};
