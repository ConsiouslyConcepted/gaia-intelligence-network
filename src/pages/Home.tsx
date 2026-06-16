import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const EARTH_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg";
const BUMP_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png";

const SCALES: Array<{ label: string; path: string; desc: string }> = [
  { label: "Planetary", path: "/", desc: "Earth systems & spheres" },
  { label: "Solar", path: "/?view=hgs", desc: "Heliocentric harmonics" },
  { label: "Stellar", path: "/stellar", desc: "Local stars & lifecycles" },
  { label: "Galactic", path: "/galactic", desc: "Milky Way structure" },
  { label: "Universal", path: "/universal", desc: "Cosmic address & harmonics" },
  { label: "Cosmological", path: "/cosmological", desc: "CMB & large-scale order" },
];

const Earth = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [earthMap, bumpMap] = useLoader(TextureLoader, [EARTH_TEX, BUMP_TEX]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 3, 5]} intensity={1.4} />
      <pointLight position={[-5, -3, -5]} intensity={0.4} color="#6ea8ff" />
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 96, 96]} />
        <meshStandardMaterial
          map={earthMap}
          bumpMap={bumpMap}
          bumpScale={0.05}
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>
      {/* atmosphere glow */}
      <mesh scale={1.06}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial
          color="#6ea8ff"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  );
};

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[hsl(228,55%,4%)]">
      {/* background gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, hsla(225,50%,10%,1) 0%, hsla(228,55%,5%,1) 55%, hsla(230,60%,3%,1) 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground) / 0.08) 2px, hsl(var(--foreground) / 0.08) 4px)",
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground/50 mb-3">
            Welcome to the
          </p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-[0.08em] uppercase text-foreground/95 mb-3">
            Gaiasphere
          </h1>
          <h2 className="text-2xl md:text-4xl font-light tracking-[0.32em] uppercase text-foreground/70">
            Observatory
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-sm text-muted-foreground/60 leading-relaxed">
            A read-only observatory for planetary, solar, stellar, galactic, universal,
            and cosmological systems — and the harmonic relationships between them.
          </p>
        </div>

        {/* Earth */}
        <div className="w-full max-w-[520px] aspect-square relative">
          <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
            <Suspense fallback={null}>
              <Earth />
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.4}
              />
            </Suspense>
          </Canvas>
          {/* outer halo */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              boxShadow:
                "inset 0 0 80px hsla(210,70%,60%,0.12), 0 0 120px hsla(210,70%,55%,0.18)",
            }}
          />
        </div>

        {/* Scale buttons */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-3xl">
          {SCALES.map((s) => (
            <button
              key={s.label}
              onClick={() => navigate(s.path)}
              className="group relative text-left px-4 py-3 rounded-xl backdrop-blur-xl transition-all duration-300 hover:translate-y-[-1px]"
              style={{
                background:
                  "linear-gradient(145deg, hsla(225,45%,11%,0.9) 0%, hsla(228,55%,5%,0.9) 100%)",
                border: "1px solid hsla(220,30%,55%,0.35)",
                boxShadow:
                  "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 24px hsla(210,70%,60%,0.12), 0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-foreground/90">
                  {s.label}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground/70 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground/55 tracking-wide">
                {s.desc}
              </p>
            </button>
          ))}
        </div>

        <p className="mt-8 text-[9px] tracking-[0.32em] uppercase text-muted-foreground/35">
          Digital Twin · Read-only Observation
        </p>
      </div>
    </div>
  );
};

export default Home;
