import { Suspense, useEffect, useRef, useState } from "react";
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
        <sphereGeometry args={[1.7, 128, 128]} />
        <meshStandardMaterial
          map={earthMap}
          bumpMap={bumpMap}
          bumpScale={0.035}
          roughness={0.45}
          metalness={0.15}
        />
      </mesh>
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.735, 64, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.09} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.82, 64, 64]} />
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

function TelemetryHUD() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const dayOfYear = (now.getTime() - start) / 86_400_000;
  const orbitalPhase = (dayOfYear / 365.25).toFixed(4);
  const utc = now.toISOString().slice(11, 19);
  const julian = (now.getTime() / 86_400_000 + 2440587.5).toFixed(4);

  const Row = ({ k, v }: { k: string; v: string }) => (
    <div className="flex items-center gap-2 tabular-nums">
      <span className="text-white/30">{k}</span>
      <span className="text-white/60">{v}</span>
    </div>
  );

  return (
    <>
      {/* Top-left: system identity */}
      <div className="absolute top-24 left-8 z-20 hidden md:block text-[9px] font-mono tracking-[0.15em] uppercase">
        <div className="flex items-center gap-2 text-white/40 mb-2">
          <span className="h-px w-4 bg-white/30" />
          <span>System</span>
        </div>
        <div className="flex flex-col gap-1">
          <Row k="NODE" v="GSPH-01" />
          <Row k="ORBIT" v={orbitalPhase} />
          <Row k="SENSORS" v="NOMINAL" />
        </div>
      </div>

      {/* Top-right: live UTC clock */}
      <div className="absolute top-24 right-8 z-20 hidden md:block text-[9px] font-mono tracking-[0.15em] uppercase text-right">
        <div className="flex items-center justify-end gap-2 text-white/40 mb-2">
          <span>Sync</span>
          <span className="h-px w-4 bg-white/30" />
        </div>
        <div className="flex flex-col gap-1 items-end">
          <Row k="UTC" v={utc} />
          <Row k="JD" v={julian} />
        </div>
      </div>

      {/* Bottom-left: reference frame */}
      <div className="absolute bottom-24 left-8 z-20 hidden md:block text-[9px] font-mono tracking-[0.15em] uppercase">
        <div className="flex items-center gap-2 text-white/40 mb-2">
          <span className="h-px w-4 bg-white/30" />
          <span>Reference</span>
        </div>
        <div className="flex flex-col gap-1">
          <Row k="FRAME" v="ICRF / J2000" />
          <Row k="SOURCE" v="NASA BLUE MARBLE" />
        </div>
      </div>

      {/* Bottom-right: observer */}
      <div className="absolute bottom-24 right-8 z-20 hidden md:block text-[9px] font-mono tracking-[0.15em] uppercase text-right">
        <div className="flex items-center justify-end gap-2 text-white/40 mb-2">
          <span>Observer</span>
          <span className="h-px w-4 bg-white/30" />
        </div>
        <div className="flex flex-col gap-1 items-end">
          <Row k="LAT" v="0.000° N" />
          <Row k="LON" v="0.000° E" />
        </div>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <div className="relative w-full bg-[#05060f] text-foreground">
      {/* ============ HERO ============ */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0.3, 4.8], fov: 46 }} dpr={[1, 2]}>
            <HeroScene />
          </Canvas>
        </div>

        {/* Vignette */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 35%, rgba(5,6,15,0.65) 100%)",
          }}
        />

        {/* Orbital rings */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="w-[38rem] h-[38rem] md:w-[52rem] md:h-[52rem] rounded-full border border-white/[0.06]" />
          <div className="absolute w-[40rem] h-[40rem] md:w-[54rem] md:h-[54rem] rounded-full border border-dashed border-white/[0.04]" />
        </div>

        {/* Telemetry HUD */}
        <TelemetryHUD />

        {/* Hero copy */}
        <header className="absolute top-0 left-0 right-0 z-20 px-8 pt-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white/80" />
              </span>
              <p className="text-[11px] uppercase tracking-[0.45em] text-white/70 font-light">
                Gaiasphere
              </p>
              <span className="h-px w-6 bg-white/20" />
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-light">
                Observatory
              </p>
            </div>
          </div>
        </header>


        <div className="relative z-20 flex flex-col items-center justify-center h-full px-6 text-center">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-10 md:w-16 bg-gradient-to-r from-transparent to-white/40" />
            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.6em] text-white/50">
              Nested Intelligence Observatory
            </p>
            <div className="h-[1px] w-10 md:w-16 bg-gradient-to-l from-transparent to-white/40" />
          </div>

          <h1 className="mt-5 font-wordmark text-5xl md:text-7xl lg:text-8xl font-normal tracking-[0.14em] text-white uppercase drop-shadow-[0_0_35px_rgba(255,255,255,0.2)]">
            Gaiasphere
          </h1>

          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/70 drop-shadow-[0_1px_10px_rgba(0,0,0,0.5)]">
            Explore the nested systems of Earth and the observable universe through real-time
            scientific data, systems intelligence, harmonic analysis, and AI-assisted discovery.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 pb-10 flex flex-col items-center text-white/40">
          <span className="text-[10px] uppercase tracking-[0.4em] mb-2">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </div>

      </section>

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
              <Link
                to="/harmonics"
                className="inline-flex items-center gap-2 rounded-full bg-white text-[#05060f] px-6 py-3 text-[13px] font-medium tracking-wide hover:bg-white/90 transition-all"
              >
                Launch Harmonic Analysis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/mission-control"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[13px] tracking-wide text-white hover:bg-white/10 transition-all"
              >
                Open Mission Control
              </Link>
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
            <Link
              to="/universal"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-xl px-6 py-3 text-[13px] tracking-wide text-white hover:bg-white/15 transition-all"
            >
              Open the Cosmic Address
              <ArrowRight className="w-4 h-4" />
            </Link>
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
              <Link
                to="/mission-control?workspace=ai"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-xl px-6 py-3 text-[13px] tracking-wide text-white hover:bg-white/15 transition-all"
              >
                Meet the Analyst
                <ArrowRight className="w-4 h-4" />
              </Link>
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
            <Link
              to="/planetary"
              className="inline-flex items-center gap-2 rounded-full bg-white text-[#05060f] px-6 py-3 text-[13px] font-medium tracking-wide hover:bg-white/90 transition-all"
            >
              Start at Earth
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/universal"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[13px] tracking-wide text-white hover:bg-white/10 transition-all"
            >
              Universal Observatory
            </Link>
          </div>
        </div>

        <footer className="mt-24 text-center text-[10px] uppercase tracking-[0.4em] text-white/30">
          GaiaSphere Observatory · Live Telemetry
        </footer>
      </section>
    </div>
  );
}
