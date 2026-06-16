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
  { label: "Planetary", path: "/planetary", desc: "Earth systems & spheres" },
  { label: "Solar", path: "/planetary?view=hgs", desc: "Heliocentric harmonics" },
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
      <ambientLight intensity={1.1} />
      <hemisphereLight args={["#bcd6ff", "#1a2540", 0.8]} />
      <directionalLight position={[5, 3, 5]} intensity={2.2} />
      <directionalLight position={[-4, -2, 3]} intensity={0.7} color="#9ec3ff" />
      <pointLight position={[-5, -3, -5]} intensity={0.6} color="#8fb8ff" />
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 96, 96]} />
        <meshStandardMaterial
          map={earthMap}
          bumpMap={bumpMap}
          bumpScale={0.05}
          roughness={0.75}
          metalness={0.05}
          emissive="#1a2a48"
          emissiveIntensity={0.18}
        />
      </mesh>
      {/* atmosphere glow */}
      <mesh scale={1.06}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial
          color="#7fb4ff"
          transparent
          opacity={0.14}
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

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-10">
        {/* Title */}
        <div className="text-center mb-6">
          <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground/50 mb-3">
            Welcome to the
          </p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-[0.08em] uppercase text-foreground/95 mb-2">
            Gaiasphere
          </h1>
          <h2 className="text-xl md:text-3xl font-light tracking-[0.32em] uppercase text-foreground/70">
            Observatory
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-xs md:text-sm text-muted-foreground/60 leading-relaxed">
            A read-only observatory for planetary, solar, stellar, galactic, universal,
            and cosmological systems — and the harmonic relationships between them.
          </p>
        </div>

        {/* Globe + side rails layout */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-[1fr_minmax(0,520px)_1fr] gap-6 items-center">
          {/* Left rail: first 3 scales */}
          <div className="flex flex-col gap-3 order-2 md:order-1">
            {SCALES.slice(0, 3).map((s) => (
              <ScaleButton key={s.label} s={s} onClick={() => navigate(s.path)} align="right" />
            ))}
          </div>

          {/* Globe */}
          <div className="w-full aspect-square relative order-1 md:order-2 mx-auto max-w-[520px]">
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
            <div
              className="absolute inset-0 pointer-events-none rounded-full"
              style={{
                boxShadow:
                  "inset 0 0 80px hsla(210,80%,65%,0.18), 0 0 140px hsla(210,80%,60%,0.25)",
              }}
            />
          </div>

          {/* Right rail: last 3 scales */}
          <div className="flex flex-col gap-3 order-3">
            {SCALES.slice(3).map((s) => (
              <ScaleButton key={s.label} s={s} onClick={() => navigate(s.path)} align="left" />
            ))}
          </div>
        </div>

        <p className="mt-6 text-[9px] tracking-[0.32em] uppercase text-muted-foreground/35">
          Digital Twin · Live Telemetry · Observation Only
        </p>
      </div>
    </div>
  );
};

const ScaleButton = ({
  s,
  onClick,
  align,
}: {
  s: { label: string; path: string; desc: string };
  onClick: () => void;
  align: "left" | "right";
}) => (
  <button
    onClick={onClick}
    className="group relative w-full px-4 py-3 rounded-xl backdrop-blur-xl transition-all duration-300 hover:translate-y-[-1px]"
    style={{
      background:
        "linear-gradient(145deg, hsla(225,45%,11%,0.9) 0%, hsla(228,55%,5%,0.9) 100%)",
      border: "1px solid hsla(220,30%,55%,0.35)",
      boxShadow:
        "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 24px hsla(210,70%,60%,0.12), 0 8px 24px rgba(0,0,0,0.4)",
      textAlign: align === "right" ? "right" : "left",
    }}
  >
    <div
      className={`flex items-center justify-between ${
        align === "right" ? "flex-row-reverse" : ""
      }`}
    >
      <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-foreground/90">
        {s.label}
      </span>
      <ArrowRight
        className={`w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground/70 transition-all ${
          align === "right"
            ? "rotate-180 group-hover:-translate-x-0.5"
            : "group-hover:translate-x-0.5"
        }`}
      />
    </div>
    <p className="mt-1 text-[10px] text-muted-foreground/55 tracking-wide">
      {s.desc}
    </p>
  </button>
);

export default Home;
