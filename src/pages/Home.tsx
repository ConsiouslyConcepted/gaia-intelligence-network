import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import OrbitingEarth from "@/components/home/OrbitingEarth";

const PanelLink = ({
  to,
  title,
  subtitle,
  align,
  className,
}: {
  to: string;
  title: string;
  subtitle: string;
  align: "left" | "right";
  className?: string;
}) => {
  const isLeft = align === "left";
  return (
    <Link
      to={to}
      className={cn(
        "group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 min-w-[240px] transition-all duration-300 hover:bg-white/[0.07] hover:border-white/30 hover:-translate-y-0.5",
        className
      )}
      style={{
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.05) inset, 0 30px 80px -40px rgba(120,170,255,0.35)",
      }}
    >
      {isLeft && (
        <ArrowLeft
          className="w-4 h-4 text-white/40 group-hover:text-white/90 transition-colors shrink-0"
          strokeWidth={1.5}
        />
      )}
      <div className={cn("flex-1", isLeft ? "text-right" : "text-left")}>
        <div className="text-[13px] uppercase tracking-[0.25em] text-white/90 font-medium">
          {title}
        </div>
        <div className="text-[11px] text-white/50 mt-0.5">{subtitle}</div>
      </div>
      {!isLeft && (
        <ArrowRight
          className="w-4 h-4 text-white/40 group-hover:text-white/90 transition-colors shrink-0"
          strokeWidth={1.5}
        />
      )}
    </Link>
  );
};

const LEFT_PANELS = [
  { title: "Planetary", subtitle: "Earth systems & spheres", to: "/planetary" },
  { title: "Solar", subtitle: "Heliocentric harmonics", to: "/solar" },
  { title: "Stellar", subtitle: "Local stars & lifecycles", to: "/stellar" },
];

const RIGHT_PANELS = [
  { title: "Galactic", subtitle: "Milky Way structure", to: "/galactic" },
  { title: "Universal", subtitle: "Cosmic address & harmonics", to: "/universal" },
  { title: "Cosmological", subtitle: "CMB & large-scale order", to: "/cosmological" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#05060f] text-foreground">
      <style>{`
        @keyframes gaia-float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -16px, 0); }
        }
      `}</style>

      <section className="relative min-h-screen w-full flex flex-col">
        {/* Soft ambient glow behind the globe */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 55%, rgba(45,138,158,0.12) 0%, transparent 55%)",
          }}
        />

        {/* Top title */}
        <div className="relative z-20 flex flex-col items-center pt-10 md:pt-14 lg:pt-16">
          <p className="text-[10px] uppercase tracking-[0.45em] text-white/45">
            Welcome to the
          </p>
          <h1 className="mt-3 text-4xl md:text-6xl lg:text-7xl font-title font-bold tracking-[-0.04em] text-white leading-none">
            GAIASPHERE
          </h1>
          <p className="mt-2 text-[12px] md:text-[13px] uppercase tracking-[0.45em] text-white/70">
            Observatory
          </p>
          <p className="mt-4 max-w-md text-center text-[12px] md:text-[13px] leading-relaxed text-white/55 px-6">
            An observatory for Earth's nested systems of intelligence and the harmonic relationships between them.
          </p>
        </div>

        {/* Main display: panels + globe */}
        <div className="relative z-10 flex-1 flex items-center justify-center w-full max-w-7xl mx-auto px-4 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 items-center w-full">
            {/* Left observatories */}
            <div className="hidden lg:flex flex-col gap-4 items-end">
              {LEFT_PANELS.map((panel) => (
                <PanelLink key={panel.title} {...panel} align="left" />
              ))}
            </div>

            {/* Center Earth */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-[68vmin] h-[68vmin] md:w-[55vmin] md:h-[55vmin] lg:w-[58vmin] lg:h-[58vmin] max-w-[640px] max-h-[640px]">
                {/* Outer rings */}
                <div className="absolute inset-[-4%] rounded-full border border-[#2d8a9e]/25" />
                <div className="absolute inset-[-8%] rounded-full border border-[#2d8a9e]/15" />
                <div
                  className="absolute inset-[-10%] rounded-full pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 50%, rgba(45,138,158,0.22) 0%, transparent 70%)",
                    filter: "blur(24px)",
                  }}
                />

                {/* Circular mask removes the canvas square */}
                <div
                  className="absolute inset-0 rounded-full overflow-hidden"
                  style={{ animation: "gaia-float 11s ease-in-out infinite" }}
                >
                  <OrbitingEarth />
                </div>
              </div>
            </div>

            {/* Right observatories */}
            <div className="hidden lg:flex flex-col gap-4 items-start">
              {RIGHT_PANELS.map((panel) => (
                <PanelLink key={panel.title} {...panel} align="right" />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile / tablet panels */}
        <div className="lg:hidden relative z-20 w-full max-w-3xl mx-auto px-6 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...LEFT_PANELS, ...RIGHT_PANELS].map((panel) => (
              <PanelLink key={panel.title} {...panel} align="right" className="min-w-0" />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-20 pb-6 md:pb-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">
            Digital Twin · Live Telemetry
          </p>
        </div>
      </section>
    </div>
  );
}
