import { Suspense, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { TextureLoader } from "three";
import * as THREE from "three";
import { Link } from "react-router-dom";
import {
  Globe2,
  Sun,
  Star,
  Sparkles,
  Orbit,
  Infinity as InfinityIcon,
} from "lucide-react";

const EARTH_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg";
const BUMP_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png";

const OBSERVATORIES = [
  {
    title: "Planetary Intelligence",
    blurb: "Earth's coupled spheres — atmosphere, biosphere, lithosphere, magnetosphere.",
    to: "/planetary",
    Icon: Globe2,
  },
  {
    title: "Solar Intelligence",
    blurb: "Heliosphere dynamics, solar wind, and space weather.",
    to: "/solar",
    Icon: Sun,
  },
  {
    title: "Stellar Intelligence",
    blurb: "Asteroseismology, variable stars, and the local stellar neighborhood.",
    to: "/stellar",
    Icon: Star,
  },
  {
    title: "Galactic Intelligence",
    blurb: "Milky Way structure, the Orion Spur, and galactic rotation.",
    to: "/galactic",
    Icon: Sparkles,
  },
  {
    title: "Cosmological Intelligence",
    blurb: "Large-scale structure, cosmic microwave background, expansion.",
    to: "/cosmological",
    Icon: Orbit,
  },
  {
    title: "Universal Intelligence",
    blurb: "Cosmic address and the nested architecture of the observable universe.",
    to: "/universal",
    Icon: InfinityIcon,
  },
];

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const [earthMap, bumpMap] = useLoader(TextureLoader, [EARTH_TEX, BUMP_TEX]);

  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.08;
    if (cloudRef.current) cloudRef.current.rotation.y += dt * 0.04;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.6, 96, 96]} />
        <meshStandardMaterial
          map={earthMap}
          bumpMap={bumpMap}
          bumpScale={0.05}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>
      {/* atmospheric glow */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.66, 64, 64]} />
        <meshBasicMaterial color="#7ec8ff" transparent opacity={0.08} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.78, 64, 64]} />
        <meshBasicMaterial color="#4aa3ff" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function OrbitRing({ radius, opacity = 0.18 }: { radius: number; opacity?: number }) {
  const geom = (() => {
    const points = Array.from({ length: 129 }, (_, i) => {
      const a = (i / 128) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  })();
  return (
    <primitive
      object={new THREE.Line(
        geom,
        new THREE.LineBasicMaterial({ color: "#9fb4d6", transparent: true, opacity })
      )}
    />
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 3, 5]} intensity={1.4} />
      <directionalLight position={[-4, -2, -3]} intensity={0.25} color="#88aaff" />
      <Stars radius={80} depth={40} count={3500} factor={3} fade speed={0.4} />
      <Suspense fallback={null}>
        <Earth />
      </Suspense>
      <group rotation={[Math.PI / 2.6, 0, 0]}>
        <OrbitRing radius={2.4} opacity={0.22} />
        <OrbitRing radius={3.1} opacity={0.14} />
        <OrbitRing radius={3.9} opacity={0.08} />
      </group>
    </>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#05060f] text-foreground">
      {/* Background 3D scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0.6, 5.2], fov: 50 }} dpr={[1, 2]}>
          <Scene />
        </Canvas>
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(5,6,15,0.85) 100%)",
        }}
      />

      {/* Foreground content */}
      <div className="relative z-20 flex flex-col min-h-screen">
        {/* Header */}
        <header className="px-8 pt-10 pb-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.45em] text-white/50">
            Nested Intelligence · Live Telemetry
          </p>
          <h1 className="mt-3 text-5xl md:text-6xl font-light tracking-tight text-white">
            Gaiasphere Observatory
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-sm text-white/65">
            An Observatory for Earths nested systems of intelligence and the harmonic relationships between them.
          </p>
        </header>

        {/* Observatory grid */}
        <main className="flex-1 px-6 pb-12 flex items-end md:items-center">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {OBSERVATORIES.map(({ title, blurb, to, Icon }) => (
              <Link
                key={to}
                to={to}
                className="group relative rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 transition-all hover:border-white/30 hover:bg-white/[0.08] hover:-translate-y-0.5"
                style={{
                  boxShadow:
                    "0 1px 0 rgba(255,255,255,0.05) inset, 0 20px 60px -30px rgba(120,170,255,0.35)",
                }}
              >
                <div
                  className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(120% 80% at 50% 0%, rgba(160,200,255,0.18), transparent 60%)",
                  }}
                />
                <div className="relative flex items-start gap-3">
                  <div className="shrink-0 grid place-items-center w-10 h-10 rounded-lg border border-white/15 bg-white/[0.06]">
                    <Icon className="w-5 h-5 text-white/85" strokeWidth={1.4} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[15px] font-medium text-white tracking-tight">
                      {title}
                    </div>
                    <p className="mt-1 text-[12.5px] leading-snug text-white/60">
                      {blurb}
                    </p>
                    <div className="mt-3 text-[11px] uppercase tracking-[0.3em] text-white/45 group-hover:text-white/80 transition-colors">
                      Enter →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>

        <footer className="pb-6 text-center text-[10.5px] uppercase tracking-[0.4em] text-white/35">
          Digital Twin · Read-Free Observation
        </footer>
      </div>
    </div>
  );
}
