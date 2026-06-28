import { Suspense, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { TextureLoader } from "three";
import * as THREE from "three";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Globe2,
  Sun,
  Star,
  Sparkles,
  Orbit,
  Infinity as InfinityIcon,
  ArrowDown,
  ArrowRight,
  Activity,
  Waves,
  Network,
  Brain,
  LineChart,
  Atom,
  Telescope,
  Sigma,
} from "lucide-react";
import UniversalOverviewStrip from "@/components/home/UniversalOverviewStrip";

const PanelButton = ({
  children,
  primary = true,
  className = "",
  ...props
}: React.ComponentProps<typeof Link> & { primary?: boolean }) => (
  <Link
    {...props}
    className={cn(
      "group relative inline-flex items-center justify-center rounded-xl backdrop-blur-2xl transition-all duration-300 overflow-hidden",
      primary ? "text-white/95" : "text-white/70 hover:text-white/95",
      className
    )}
    style={{
      background:
        "linear-gradient(145deg, hsla(225,45%,11%,0.95) 0%, hsla(225,50%,7%,0.92) 50%, hsla(228,55%,5%,0.95) 100%)",
      border: primary
        ? "1.5px solid hsla(220,35%,60%,0.55)"
        : "1.5px solid hsla(220,30%,55%,0.35)",
      boxShadow: primary
        ? "inset 0 1px 0 hsla(0,0%,100%,0.08), 0 0 32px hsla(210,75%,62%,0.28), 0 0 64px hsla(210,70%,55%,0.18), 0 12px 40px rgba(0,0,0,0.55)"
        : "inset 0 1px 0 hsla(0,0%,100%,0.06), 0 0 16px hsla(210,75%,62%,0.12), 0 8px 24px rgba(0,0,0,0.45)",
    }}
  >
    <div
      className="absolute -top-px left-4 right-4 h-px pointer-events-none"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, hsla(220,30%,55%,0.35) 25%, hsla(220,30%,60%,0.55) 50%, hsla(220,30%,55%,0.35) 75%, transparent 100%)",
      }}
    />
    <div
      className="absolute bottom-0 left-6 right-6 h-px pointer-events-none"
      style={{
        background:
          "linear-gradient(90deg, transparent, hsla(210,40%,50%,0.15), transparent)",
      }}
    />
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      style={{
        background:
          "linear-gradient(145deg, hsla(225,45%,14%,0.98) 0%, hsla(225,50%,10%,0.95) 50%, hsla(228,55%,8%,0.98) 100%)",
      }}
    />
    <span className="relative z-10 inline-flex items-center gap-2">
      {children}
    </span>
  </Link>
);

const EARTH_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg";
const BUMP_TEX = "https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png";

const OBSERVATORIES = [
  {
    n: "01",
    title: "Planetary Intelligence",
    blurb:
      "Earth's coupled spheres: atmosphere, biosphere, lithosphere, hydrosphere, magnetosphere.",
    to: "/planetary",
    Icon: Globe2,
  },
  {
    n: "02",
    title: "Solar Intelligence",
    blurb:
      "Solar wind, flares, and the heliosphere that shapes planetary climate.",
    to: "/solar",
    Icon: Sun,
  },
  {
    n: "03",
    title: "Stellar Intelligence",
    blurb:
      "Asteroseismology, variable stars, and stellar oscillations in the local neighborhood.",
    to: "/stellar",
    Icon: Star,
  },
  {
    n: "04",
    title: "Galactic Intelligence",
    blurb:
      "Spiral arms, the Orion Spur, and galactic rotation.",
    to: "/galactic",
    Icon: Sparkles,
  },
  {
    n: "05",
    title: "Cosmological Intelligence",
    blurb:
      "Cosmic microwave background, large-scale structure, and cosmic expansion.",
    to: "/cosmological",
    Icon: Orbit,
  },
  {
    n: "06",
    title: "Universal Intelligence",
    blurb:
      "Nested architecture from Earth to the observable universe.",
    to: "/universal",
    Icon: InfinityIcon,
  },
];

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const [earthMap, bumpMap] = useLoader(TextureLoader, [EARTH_TEX, BUMP_TEX]);

  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.05;
    if (cloudRef.current) cloudRef.current.rotation.y += dt * 0.025;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.3, 128, 128]} />
        <meshStandardMaterial
          map={earthMap}
          bumpMap={bumpMap}
          bumpScale={0.03}
          roughness={0.45}
          metalness={0.15}
        />
      </mesh>
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.327, 64, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.09} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.39, 64, 64]} />
        <meshBasicMaterial color="#6ab0ff" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>

    </group>
  );
}

function HeroScene() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[6, 4, 6]} intensity={2.6} color="#ffffff" />
      <directionalLight position={[-5, -2, -4]} intensity={0.5} color="#aaccff" />
      <pointLight position={[0, 0, 3.2]} intensity={0.4} color="#d6eaff" />
      <Stars radius={80} depth={40} count={4000} factor={3.2} fade speed={0.3} />
      <Suspense fallback={null}>
        <Earth />
      </Suspense>
    </>
  );
}

const NESTED_SCALES = [
  { label: "Earth", scale: "10³ km" },
  { label: "Solar System", scale: "10⁹ km" },
  { label: "Orion Spur", scale: "10³ ly" },
  { label: "Milky Way", scale: "10⁵ ly" },
  { label: "Local Group", scale: "10⁷ ly" },
  { label: "Virgo Cluster", scale: "10⁸ ly" },
  { label: "Laniakea", scale: "10⁸ ly" },
  { label: "Observable Universe", scale: "10¹⁰ ly" },
];


export default function Home() {
  return (
    <div className="relative w-full bg-[#05060f] text-foreground">
      {/* ============ HERO ============ */}
      <section className="relative h-screen w-full overflow-hidden bg-[#05060f]">
        {/* Right: 3D Earth */}
        <div className="absolute inset-0 z-0 lg:left-[40%]">
          <Canvas camera={{ position: [0, 0, 4.2], fov: 46 }} dpr={[1, 2]}>
            <HeroScene />
          </Canvas>
        </div>

        {/* Vignette */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 75% 50%, transparent 40%, rgba(5,6,15,0.78) 75%), linear-gradient(90deg, rgba(5,6,15,0.92) 0%, transparent 55%)",
          }}
        />


        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-30 px-8 pt-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white/80" />
              </span>
              <p className="text-[13px] uppercase tracking-[0.4em] text-white/80 font-light">
                Gaiasphere
              </p>
              <span className="h-px w-6 bg-white/20" />
                <p className="text-[12px] uppercase tracking-[0.35em] font-light" style={{ color: "hsla(45,44%,54%,0.9)", textShadow: "0 0 18px hsla(45,44%,54%,0.35)" }}>
                  Observatory
                </p>
            </div>
          </div>
        </header>

        {/* Left hero content */}
        <div className="relative z-20 h-full w-full max-w-7xl px-8 flex flex-col justify-center">
          <div className="w-full max-w-[760px] translate-y-24 md:translate-y-32 text-left">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl">
              <span className="w-2 h-2 rounded-full bg-white/70 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-medium">
                Live Systems Data
              </span>
            </div>

            <h1 className="mt-8 w-full text-left text-5xl md:text-6xl lg:text-7xl text-white leading-[0.85] tracking-[-0.04em] font-title font-bold">
              GAIA<span style={{ color: "hsla(45,44%,54%,0.75)", textShadow: "0 0 26px hsla(45,44%,54%,0.28)" }}>SPHERE</span>
            </h1>


            <div className="mt-3 w-full text-left space-y-1">
              <p className="text-left text-[13px] md:text-[14px] leading-relaxed text-white/70 font-light">
                Explore the nested systems of Earth within the observable universe through real-time
              </p>
              <p className="text-left text-[13px] md:text-[14px] leading-relaxed text-white/70 font-light">
                scientific data, systems intelligence, harmonic analysis, and AI-assisted discovery.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <PanelButton
                to="/planetary"
                primary
                className="w-[280px] h-14 px-8 text-[12px] uppercase tracking-[0.2em] font-semibold whitespace-nowrap"
              >
                Enter Observatory
              </PanelButton>

              <PanelButton
                to="#vision"
                primary
                className="w-[280px] h-14 px-8 text-[12px] uppercase tracking-[0.2em] font-semibold whitespace-nowrap"
              >
                Learn More
              </PanelButton>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-10 flex flex-col items-center" style={{ color: "hsla(45,44%,54%,0.65)" }}>
          <span className="text-[10px] uppercase tracking-[0.4em] mb-2">Scroll</span>
          <div
            className="w-[1px] h-12"
            style={{
              background:
                "linear-gradient(180deg, hsla(220,35%,60%,0.55) 0%, transparent 100%)",
            }}
          />
        </div>
      </section>

      {/* ============ LIVE SYSTEM STATUS ============ */}
      <UniversalOverviewStrip />

      {/* ============ VISION ============ */}
      <section id="vision" className="relative px-6 py-28 border-t border-white/5">

        <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <p className="text-[10.5px] uppercase tracking-[0.45em] text-white/45">
              Vision
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl font-light text-white leading-tight">
              One integrated view of nested systems.
            </h2>
          </div>
          <div className="md:col-span-8 space-y-6 text-[15px] leading-relaxed text-white/70">
            <p>
              Modern science divides the cosmos into disciplines: climate, heliophysics,
              astrophysics, cosmology. GaiaSphere unifies them as one continuous observation,
              from Earth's systems to the structure of spacetime.
            </p>
            <p>
              Each scale exhibits periodic behavior: stellar oscillations, planetary resonances,
              galactic rotation. GaiaSphere surfaces the harmonic relationships across them.
            </p>
          </div>
        </div>
      </section>

      {/* ============ THREE PILLARS ============ */}
      <section className="relative px-6 py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10.5px] uppercase tracking-[0.45em] text-white/45 text-center">
            What you can explore
          </p>
          <div className="mt-12 grid md:grid-cols-3 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
            {[
              {
                k: "Observe",
                t: "Live telemetry",
                d: "Real signals from Earth, the Sun, and the sky, streamed from NOAA, NASA, USGS, and open scientific archives.",
              },
              {
                k: "Analyze",
                t: "Harmonic engine",
                d: "Decompose any signal into its oscillation spectrum and compare resonances across scales.",
              },
              {
                k: "Synthesize",
                t: "AI mission analyst",
                d: "Ask the analyst to explain conditions, surface anomalies, and synthesize cross-layer reports.",
              },
            ].map(({ k, t, d }) => (
              <div key={k} className="bg-[#05060f] p-8">
                <div className="text-[10px] uppercase tracking-[0.4em] text-white/40">{k}</div>
                <div className="mt-3 text-xl text-white font-light">{t}</div>
                <p className="mt-3 text-[13.5px] leading-relaxed text-white/60">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ THE SIX OBSERVATORIES ============ */}
      <section className="relative px-6 py-28 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <p className="text-[10.5px] uppercase tracking-[0.45em] text-white/45">
              Six Observatories
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl font-light text-white leading-tight">
              Select a scale.
            </h2>
            <p className="mt-5 text-[14.5px] leading-relaxed text-white/65">
              Each observatory is an intelligence environment for a specific layer. The Universal
              observatory shows how they nest together.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {OBSERVATORIES.map(({ n, title, blurb, to, Icon }) => (
              <Link
                key={to}
                to={to}
                className="group relative rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 transition-all hover:border-white/30 hover:bg-white/[0.07] hover:-translate-y-0.5"
                style={{
                  boxShadow:
                    "0 1px 0 rgba(255,255,255,0.05) inset, 0 30px 80px -40px rgba(120,170,255,0.35)",
                }}
              >
                <div
                  className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(120% 80% at 50% 0%, rgba(160,200,255,0.18), transparent 60%)",
                  }}
                />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="grid place-items-center w-11 h-11 rounded-lg border border-white/15 bg-white/[0.06]">
                      <Icon className="w-5 h-5 text-white/85" strokeWidth={1.4} />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/35">
                      {n}
                    </span>
                  </div>
                  <div className="mt-5 text-[16px] font-medium text-white tracking-tight">
                    {title}
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/60">{blurb}</p>
                  <div className="mt-5 text-[11px] uppercase tracking-[0.3em] text-white/45 group-hover:text-white/85 transition-colors inline-flex items-center gap-1.5">
                    Enter <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HARMONIC ANALYSIS ENGINE ============ */}
      <section className="relative px-6 py-28 border-t border-white/5 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 80% 20%, rgba(120,170,255,0.10), transparent 60%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5">
            <p className="text-[10.5px] uppercase tracking-[0.45em] text-white/45">
              Core Capability
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl font-light text-white leading-tight">
              Harmonic Analysis Engine.
            </h2>
            <p className="mt-5 text-[14.5px] leading-relaxed text-white/70">
              Cross-scale spectral analysis and resonance detection. Detect cycles, resonances,
              and field relationships across all six observatories.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PanelButton
                to="/harmonics"
                primary
                className="px-6 py-3 text-[13px] font-medium tracking-wide"
              >
                Launch Harmonic Analysis
                <ArrowRight className="w-4 h-4" />
              </PanelButton>
              <PanelButton
                to="/universal"
                primary={false}
                className="px-6 py-3 text-[13px] tracking-wide"
              >
                Open Universal Observatory
              </PanelButton>

            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 gap-3">
            {[
              { Icon: Network, t: "Cross-layer analysis" },
              { Icon: Waves, t: "Harmonic & frequency" },
              { Icon: Activity, t: "Pattern recognition" },
              { Icon: Sigma, t: "Wave & field viz" },
              { Icon: LineChart, t: "Correlation analysis" },
              { Icon: Activity, t: "Time-series analysis" },
              { Icon: Atom, t: "Spherical harmonics" },
              { Icon: Brain, t: "AI-assisted analysis" },
            ].map(({ Icon, t }) => (
              <div
                key={t}
                className="rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-xl px-4 py-3.5 flex items-center gap-3"
              >
                <Icon className="w-4 h-4 text-white/70" strokeWidth={1.4} />
                <span className="text-[12.5px] text-white/80">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ NESTED ADDRESS ============ */}
      <section className="relative px-6 py-28 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[10.5px] uppercase tracking-[0.45em] text-white/45">
            Nested scales
          </p>
          <h2 className="mt-4 text-3xl md:text-4xl font-light text-white">
            From Earth to the observable universe.
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-[14.5px] leading-relaxed text-white/65">
            Cosmic address: a sequence of nested physical scales from Earth to the observable universe.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-2 gap-y-3">
            {NESTED_SCALES.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5">
                  <div className="text-[12px] text-white/90">{s.label}</div>
                  <div className="text-[9px] uppercase tracking-[0.3em] text-white/40">
                    {s.scale}
                  </div>
                </div>
                {i < NESTED_SCALES.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-white/25" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-12">
            <PanelButton
              to="/universal"
              primary
              className="px-6 py-3 text-[13px] tracking-wide"
            >
              Open the Cosmic Address
              <ArrowRight className="w-4 h-4" />
            </PanelButton>
          </div>
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className="relative px-6 py-28 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <p className="text-[10.5px] uppercase tracking-[0.45em] text-white/45">
              What GaiaSphere Is
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl font-light text-white leading-tight">
              Integrated observatory for nested systems.
            </h2>
          </div>
          <div className="md:col-span-8 space-y-5 text-[15px] leading-relaxed text-white/70">
            <p>
              GaiaSphere presents a modern cosmological framework for understanding humanity's place within the nested systems of the observable universe.
            </p>
            <p>
              GaiaSphere combines Earth system science, astronomy, astrophysics, systems science,
              network science, and AI into one environment for observing the organization of the
              observable universe.
            </p>
            <p>
              Each layer — planetary, solar, stellar, galactic, cosmological, universal — is analyzed
              as a system and as part of a larger architecture.
            </p>
          </div>
        </div>
      </section>

      {/* ============ SCIENTIFIC FOUNDATIONS ============ */}
      <section className="relative px-6 py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <p className="text-[10.5px] uppercase tracking-[0.45em] text-white/45">
              Scientific Foundations
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl font-light text-white leading-tight">
              Grounded in open science.
            </h2>
            <p className="mt-5 text-[14.5px] leading-relaxed text-white/65">
              Based on established disciplines and public datasets.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              "Earth System Science",
              "Heliophysics",
              "Astrophysics",
              "Galactic Astronomy",
              "Cosmology",
              "Systems Science",
              "Network Science",
              "Harmonic Analysis",
              "Spectral Analysis",
              "Spherical Harmonics",
              "Time-Series Analysis",
              "AI-Assisted Analysis",
            ].map((d) => (
              <div
                key={d}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[12.5px] text-white/80"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-3 text-[12px] text-white/55">
            <Telescope className="w-4 h-4" strokeWidth={1.4} />
            Data sourced from NASA, NOAA, USGS, ESA, and open scientific archives.
          </div>
        </div>
      </section>

      {/* ============ AI ASSISTANT ============ */}
      <section className="relative px-6 py-28 border-t border-white/5 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(160,200,255,0.10), transparent 60%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 order-2 md:order-1">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 space-y-3">
              {[
                "Explain scientific concepts across every observatory",
                "Summarize current conditions and surface anomalies",
                "Compare multiple intelligence layers",
                "Generate daily, weekly, and monthly reports",
                "Detect trends and recurring patterns",
                "Recommend additional analyses and datasets",
              ].map((c) => (
                <div key={c} className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/60" />
                  <p className="text-[13.5px] text-white/75 leading-relaxed">{c}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-5 order-1 md:order-2">
            <p className="text-[10.5px] uppercase tracking-[0.45em] text-white/45">
              AI Analyst
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl font-light text-white leading-tight">
              Analyst across every layer.
            </h2>
            <p className="mt-5 text-[14.5px] leading-relaxed text-white/70">
              Connected to every observatory and the Harmonic Analysis Engine. Ask questions,
              request reports, and compare layers.
            </p>
            <div className="mt-8">
              <PanelButton
                to="/harmonics"
                primary
                className="px-6 py-3 text-[13px] tracking-wide"
              >
                Meet the Analyst
                <ArrowRight className="w-4 h-4" />
              </PanelButton>

            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative px-6 py-32 border-t border-white/5">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(120,170,255,0.12), transparent 65%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-light text-white leading-tight">
            Begin exploring.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-white/65">
            Start at Earth or jump to any scale.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <PanelButton
              to="/planetary"
              primary
              className="px-6 py-3 text-[13px] font-medium tracking-wide"
            >
              Start at Earth
              <ArrowRight className="w-4 h-4" />
            </PanelButton>
            <PanelButton
              to="/universal"
              primary={false}
              className="px-6 py-3 text-[13px] tracking-wide"
            >
              Universal Observatory
            </PanelButton>
          </div>
        </div>

        <footer className="mt-24 text-center text-[10px] uppercase tracking-[0.4em] text-white/30">
          GaiaSphere Observatory · Live Telemetry
        </footer>
      </section>
    </div>
  );
}
