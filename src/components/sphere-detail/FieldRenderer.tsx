import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Card } from "@/components/ui/card";
import { SphereId } from "@/types/spheres";
import { Activity } from "lucide-react";
import * as THREE from "three";

interface Props {
  sphereId: SphereId;
  accent: string;
}

const FIELD_DESCRIPTIONS: Record<SphereId, string> = {
  geosphere: "Glowing fracture networks · Seismic pulse at event locations",
  biosphere: "Smooth green-cyan gradients · Seasonal expansion/contraction",
  magnetosphere: "Animated field lines · Compression/elongation from solar input",
  ionosphere: "Thin atmospheric shell · Wave ripples across surface",
  noosphere: "Nodes + connection arcs · Flowing signal lines",
  crystalsphere: "Geometric lattice · Harmonic grid overlay",
};

// Geosphere - pulsing fracture network
function GeosphereField({ accent }: { accent: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    for (let i = 0; i < 60; i++) {
      const theta1 = Math.random() * Math.PI * 2;
      const phi1 = Math.random() * Math.PI;
      const r = 1.02;
      const x1 = r * Math.sin(phi1) * Math.cos(theta1);
      const y1 = r * Math.cos(phi1);
      const z1 = r * Math.sin(phi1) * Math.sin(theta1);
      const offset = 0.15;
      const x2 = x1 + (Math.random() - 0.5) * offset;
      const y2 = y1 + (Math.random() - 0.5) * offset;
      const z2 = z1 + (Math.random() - 0.5) * offset;
      positions.push(x1, y1, z1, x2, y2, z2);
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.rotation.y = clock.elapsedTime * 0.08;
    if (linesRef.current) linesRef.current.rotation.y = clock.elapsedTime * 0.08;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.6} wireframe={false} />
      </mesh>
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial color={accent} transparent opacity={0.7} />
      </lineSegments>
    </group>
  );
}

// Biosphere - organic gradient sphere
function BiosphereField({ accent }: { accent: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.05;
      const scale = 1 + Math.sin(clock.elapsedTime * 0.5) * 0.03;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 48, 48]} />
      <meshStandardMaterial color={accent} transparent opacity={0.25} wireframe />
    </mesh>
  );
}

// Magnetosphere - animated field lines
function MagnetosphereField({ accent }: { accent: string }) {
  const groupRef = useRef<THREE.Group>(null);

  const fieldLines = useMemo(() => {
    const lines: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 12; i++) {
      const curve = new THREE.CatmullRomCurve3(
        Array.from({ length: 20 }, (_, j) => {
          const t = (j / 19) * Math.PI;
          const angle = (i / 12) * Math.PI * 2;
          const r = 1.2 + Math.sin(t) * 0.8;
          return new THREE.Vector3(
            Math.cos(angle) * Math.sin(t) * r * 0.5,
            Math.cos(t) * 1.5,
            Math.sin(angle) * Math.sin(t) * r * 0.5
          );
        })
      );
      lines.push(new THREE.BufferGeometry().setFromPoints(curve.getPoints(30)));
    }
    return lines;
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.elapsedTime * 0.1;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      {fieldLines.map((geo, i) => (
        <line key={i} geometry={geo}>
          <lineBasicMaterial color={accent} transparent opacity={0.4 + (i % 3) * 0.15} />
        </line>
      ))}
    </group>
  );
}

// Ionosphere - rippling shell
function IonosphereField({ accent }: { accent: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.06;
      meshRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.8, 24, 24]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.5} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.05, 48, 48]} />
        <meshStandardMaterial color={accent} transparent opacity={0.12} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshStandardMaterial color={accent} transparent opacity={0.06} wireframe />
      </mesh>
    </group>
  );
}

// Noosphere - nodes and arcs
function NoosphereField({ accent }: { accent: string }) {
  const groupRef = useRef<THREE.Group>(null);

  const nodes = useMemo(() => {
    return Array.from({ length: 30 }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.02;
      return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    });
  }, []);

  const arcGeometries = useMemo(() => {
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 15; i++) {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const b = nodes[Math.floor(Math.random() * nodes.length)];
      const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(1.3);
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      geos.push(new THREE.BufferGeometry().setFromPoints(curve.getPoints(16)));
    }
    return geos;
  }, [nodes]);

  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.elapsedTime * 0.04;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.95, 24, 24]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.4} />
      </mesh>
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} />
        </mesh>
      ))}
      {arcGeometries.map((geo, i) => (
        <line key={`arc-${i}`} geometry={geo}>
          <lineBasicMaterial color={accent} transparent opacity={0.3} />
        </line>
      ))}
    </group>
  );
}

// Crystalsphere - geometric lattice
function CrystalsphereField({ accent }: { accent: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.03;
      groupRef.current.rotation.x = clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={accent} transparent opacity={0.15} wireframe />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color={accent} transparent opacity={0.25} wireframe />
      </mesh>
      <mesh>
        <octahedronGeometry args={[0.4]} />
        <meshStandardMaterial color={accent} transparent opacity={0.35} wireframe />
      </mesh>
    </group>
  );
}

const FIELD_COMPONENTS: Record<SphereId, React.FC<{ accent: string }>> = {
  geosphere: GeosphereField,
  biosphere: BiosphereField,
  magnetosphere: MagnetosphereField,
  ionosphere: IonosphereField,
  noosphere: NoosphereField,
  crystalsphere: CrystalsphereField,
};

export function FieldRenderer({ sphereId, accent }: Props) {
  const FieldComp = FIELD_COMPONENTS[sphereId];
  const description = FIELD_DESCRIPTIONS[sphereId];

  return (
    <Card className="glass-panel rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
            <Activity className="w-4 h-4" style={{ color: accent }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Field Rendering</h3>
            <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">{description}</p>
          </div>
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden bg-background/40 border border-border/10" style={{ height: "280px" }}>
        <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[3, 3, 3]} intensity={0.8} />
          <pointLight position={[-2, -1, 2]} intensity={0.3} color={accent} />
          <FieldComp accent={accent} />
        </Canvas>
      </div>
    </Card>
  );
}
